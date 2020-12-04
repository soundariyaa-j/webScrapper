const proxyquire = require('proxyquire');
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const fs = require('fs');
const logger = require('../../src/utils/logger');
const chai = require('chai');
const expect = chai.expect;
const dynamodbDAO = require('../../src/dao/dynamodbDAO');

describe('Validating cache utility', async()=>{
    var loggerInfoStub;
    var loggerErrorStub;
    const configGetStub = sinon.stub();
    var AWS;
    var putfn = sinon.stub();
    var updatefn = sinon.stub();
    var scanfn = sinon.stub();

    const dynamoDB = {
        "region":"us-east-1",
        "metadataTable":{
          "tableName": "webpage_metadata"
        },
        "accessCountTable":{
          "tableName": "webpage_count"
        }
    }

    const cacheConfig = {
        "cacheCount":2,
        "enableCache":true
    }

    configGetStub.onCall(0).returns(dynamoDB);
    configGetStub.onCall(1).returns(cacheConfig);

    AWS = {
        DynamoDB: {
            DocumentClient: sinon.stub().returns({
                put:putfn,
                update: updatefn,
                scan: scanfn
            })
        }
    };
    const cacheDAO = proxyquire('../../src/utils/cacheUtility', {
        'config': {
            get: configGetStub
        },
        'aws-sdk': AWS
    })
    var putStub ;
    var updateStub;
    var getStub ;;

    beforeEach(() => {
        loggerInfoStub = sinon.stub(logger, 'info');
        loggerErrorStub = sinon.stub(logger, 'error');
        loggerInfoStub.returns(true);
        loggerErrorStub.returns(true);
        putStub = sinon.stub(dynamodbDAO,'put');
        updateStub = sinon.stub(dynamodbDAO,'update');
        getStub = sinon.stub(dynamodbDAO,'get');

    });
    const ogpData = {
        "image": [
            "https://static.npmjs.com/338e4905a2684ca96e08c7780fc68412.png"
        ],
        "description": "Human-friendly and powerful HTTP request library for Node.js",
        "title": "got",
        "url": "https://www.npmjs.com/package/got",
        "siteNamme": "npm"
    }

    it('saveMetadata() => Savemetadata to dynamo db', async()=>{
        let updateWebpageAccessCountStub = sinon.stub(cacheDAO,'updateWebpageAccessCount');
        updateWebpageAccessCountStub.returns(true);
        const params = {
            "TableName": "webpage_metadata",
            "Item": {
              "webpage_name": "https://www.npmjs.com/package/got2",
              "metadata": "{\"image\":[\"https://static.npmjs.com/338e4905a2684ca96e08c7780fc68412.png\"],\"description\":\"Human-friendly and powerful HTTP request library for Node.js\",\"title\":\"got\",\"url\":\"https://www.npmjs.com/package/got\",\"siteNamme\":\"npm\"}"
            }
        }
        const webpageName = 'https://www.npmjs.com/package/got2';
        putStub.returns(true);
        cacheDAO.webpageAccessCountMap.set(webpageName, 3);
        await cacheDAO.saveMetadata(webpageName, ogpData);
        expect(putStub.getCall(0).args[0]).to.deep.equal(params);
        updateWebpageAccessCountStub.restore();
    });

    it('saveMetadata() => Hanlde error when saving metadata to dynamo db', async()=>{
        let updateWebpageAccessCountStub = sinon.stub(cacheDAO,'updateWebpageAccessCount');
        updateWebpageAccessCountStub.returns(true);
        putStub.throws(new Error("Cannot save data to db"));
        const webpageName = 'https://www.npmjs.com/package/got3';
        cacheDAO.webpageAccessCountMap.set(webpageName, 3);
        await cacheDAO.saveMetadata(webpageName, ogpData);
        expect(true).to.true;
        updateWebpageAccessCountStub.restore();
    });

    
    it('updateWebpageAccessCount() => create record for webpage access count in dynamo db', async()=>{
            const params = {
                "TableName": "webpage_count",
                "Item": {
                  "webPageName": "https://www.npmjs.com/package/got1",
                  "accessCount": 1
                }
            }
            const webpageName = 'https://www.npmjs.com/package/got1';
            putStub.returns(true);
            await cacheDAO.updateWebpageAccessCount(webpageName, 1);
            expect(putStub.getCall(0).args[0]).to.deep.equal(params);
    });

    it('updateWebpageAccessCount() => update webpage access count to dynamo db', async()=>{
        const params = {
            "TableName": "webpage_count",
            "Key": {
              "webPageName": "https://www.npmjs.com/package/got"
            },
            "UpdateExpression": "SET #attrName =:attrValue",
            "ExpressionAttributeNames": {
              "#attrName": "accessCount"
            },
            "ExpressionAttributeValues": {
              ":attrValue": 2
            }
        }
        const webpageName = 'https://www.npmjs.com/package/got';
        updateStub.returns(true);
        cacheDAO.webpageAccessCountMap.set(webpageName, 3);
        cacheDAO.setMetadata(webpageName, ogpData);
        await cacheDAO.updateWebpageAccessCount(webpageName, 2);
        expect(updateStub.getCall(0).args[0]).to.deep.equal(params);
    });

    it('updateWebpageAccessCount() => Handling error scenario', async()=>{
        putStub.throws(new Error("Cannot save data to db"));
        updateStub.throws(new Error("Cannot save data to db"));
        const webpageName = 'https://www.npmjs.com/package/got';
        await cacheDAO.updateWebpageAccessCount(webpageName, 2);
        expect(true).to.true;
    })

    it('initilizeCache() => initlize webpagemetadata and webpage access count', async()=>{
        const webpageMetadataInfo ={
            Items: [
              {
                metadata: '{"siteNamme":"Gaana.com","type":"music.playlist","url":"https://gaana.com/playlist/tanmay5709-gannacom","title":"Playlist ganna .com on Gaana.com","description":"Listen to ganna .com by Gaana User. Also enjoy other Popular songs on your favourite music app Gaana.com","image":["https://a10.gaanacdn.com//images/playlists/47/4591047/4591047.jpg"],"audio":["https://gaana.com/playlist/tanmay5709-gannacom"],"music":["https://gaana.com/song/afgan-jalebi-ya-baba","https://gaana.com/song/main-hoon-hero-tera-salman-khan-version","https://gaana.com/song/selfie-le-le-re","https://gaana.com/song/baaton-ko-teri","https://gaana.com/song/tu-jo-mila","https://gaana.com/song/tutti-bole-wedding-di","https://gaana.com/song/banno","https://gaana.com/song/saware","https://gaana.com/song/zindagi-kuch-toh-bata-1","https://gaana.com/song/mere-humsafar-11"]}',
                webpage_name: 'https://gaana.com/playlist/tanmay5709-gannacom'
              },
              {
                metadata: '{"title":"\\n\\tSimpleSite.com\\n","description":"Fast and easy - the most popular online website builder in the world, with no ads and your own domain name. Try SimpleSite.com completely free now!","image":["/Images/FrontPage2017/Icons/globe.png"]}',
                webpage_name: 'https://www.simplesite.com/'
              }
            ],
            Count: 2,
            ScannedCount: 2
        }
        const webAccessCountData = {
            Items: [
              {
                accessCount: 2,
                webPageName: 'https://gaana.com/playlist/tanmay5709-gannacom'
              },
              { accessCount: 1, webPageName: 'https://www.google.com/' },
              {
                accessCount: 2,
                webPageName: 'https://www.youtube.com/watch?v=GN2nFJ9Ku6Q'
              }
         ],
            Count: 3,
            ScannedCount: 3
        }
        const webpageMetadataMap = new Map();
        webpageMetadataMap.set('https://gaana.com/playlist/tanmay5709-gannacom','{"siteNamme":"Gaana.com","type":"music.playlist","url":"https://gaana.com/playlist/tanmay5709-gannacom","title":"Playlist ganna .com on Gaana.com","description":"Listen to ganna .com by Gaana User. Also enjoy other Popular songs on your favourite music app Gaana.com","image":["https://a10.gaanacdn.com//images/playlists/47/4591047/4591047.jpg"],"audio":["https://gaana.com/playlist/tanmay5709-gannacom"],"music":["https://gaana.com/song/afgan-jalebi-ya-baba","https://gaana.com/song/main-hoon-hero-tera-salman-khan-version","https://gaana.com/song/selfie-le-le-re","https://gaana.com/song/baaton-ko-teri","https://gaana.com/song/tu-jo-mila","https://gaana.com/song/tutti-bole-wedding-di","https://gaana.com/song/banno","https://gaana.com/song/saware","https://gaana.com/song/zindagi-kuch-toh-bata-1","https://gaana.com/song/mere-humsafar-11"]}');
        webpageMetadataMap.set('https://www.simplesite.com/','{"title":"\\n\\tSimpleSite.com\\n","description":"Fast and easy - the most popular online website builder in the world, with no ads and your own domain name. Try SimpleSite.com completely free now!","image":["/Images/FrontPage2017/Icons/globe.png"]}');

        const webpageAccessCountMap = new Map();
        webpageAccessCountMap.set('https://gaana.com/playlist/tanmay5709-gannacom',2);
        webpageAccessCountMap.set('https://www.google.com/',1);
        webpageAccessCountMap.set('https://www.youtube.com/watch?v=GN2nFJ9Ku6Q',2);

        getStub.onCall(0).returns(webpageMetadataInfo);
        getStub.onCall(1).returns(webAccessCountData);
        await cacheDAO.initilizeCache();
        let hasMetadata= await cacheDAO.hasMetadata('https://gaana.com/playlist/tanmay5709-gannacom');
        expect(hasMetadata).to.be.true;
        let expectedMetadata = await cacheDAO.getMetadata('https://www.simplesite.com/');
        expect(expectedMetadata).to.equal('{"title":"\\n\\tSimpleSite.com\\n","description":"Fast and easy - the most popular online website builder in the world, with no ads and your own domain name. Try SimpleSite.com completely free now!","image":["/Images/FrontPage2017/Icons/globe.png"]}');
        expect(Object.fromEntries(webpageAccessCountMap)).to.be.eql(Object.fromEntries(cacheDAO.webpageAccessCountMap));
        expect(Object.fromEntries(webpageMetadataMap)).to.be.eql(Object.fromEntries(cacheDAO.webpageMetadataMap));

    })

    it('initilizeCache() => Handle error when saving metadata to dynamo db', async()=>{
        getStub.throws(new Error("Error in retriving data"));
        await cacheDAO.initilizeCache();
        expect(true).to.true;
    })

    it('fetchValuefromCache() => flag to fetch value from cache retruns true', async()=>{ 
        cacheDAO.webpageAccessCountMap.set('sample',3);
        cacheDAO.changeCacheCount(2);
        let flag = cacheDAO.fetchValuefromCache('sample');
        expect(flag).to.true;
    });

    it('fetchValuefromCache() => flag to fetch value from cache retruns false', async()=>{
        cacheDAO.webpageAccessCountMap.set('sample',1);
        cacheDAO.changeCacheCount(2);
        let flag = cacheDAO.fetchValuefromCache('sample');
        expect(flag).to.false;
    });

    afterEach(()=>{
        putStub.restore();
        updateStub.restore();
        getStub.restore();
        loggerInfoStub.restore();
        loggerErrorStub.restore(); 
    })

})