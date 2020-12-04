
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const logger = require('../../src/utils/logger');
const chai = require('chai');
const expect = chai.expect;

describe('Validating request controller class', async()=>{
    var AWS;
    var putfn = sinon.stub();
    var updatefn = sinon.stub();
    var scanfn = sinon.stub();
    const configGetStub = sinon.stub();

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
    const cacheDAO = proxyquire('../../src/dao/dynamodbDAO', {
        'config': {
            get: configGetStub
        },
        'aws-sdk': AWS
    })
it('put() => successfully caching data', async()=>{ 
    var successMessage = 'Data saved successfully';
    putfn.withArgs('sample').yields(null,successMessage);
    cacheDAO.put('sample').then((data)=>{
        expect(data).to.be.eql(successMessage)
    })
});
it('put() => Error in caching data', async()=>{ 
    var errorMessage = 'Table not found';
    putfn.withArgs('param').yields(errorMessage,null);
    cacheDAO.put('param').catch((error)=>{
        expect(error).to.be.eql(errorMessage)
    });
});

it('update() => successfully updated data in cache', async()=>{ 
    var successMessage = 'Data updated successfully';
    updatefn.withArgs('param').yields(null,successMessage);
    cacheDAO.update('param').then((data)=>{
        expect(data).to.be.eql(successMessage)
    })
});
it('update() => Error in updating cache data', async()=>{ 
    var errorMessage = 'Table not found';
    updatefn.withArgs('param').yields(errorMessage,null);
    cacheDAO.update('param').catch((error)=>{
        expect(error).to.be.eql(errorMessage)
    });
});

it('get() => successfully updated data in cache', async(done)=>{ 
    var scanData = {
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
    scanfn.withArgs('param').returns(
        {
            eachPage:sinon.stub().yields(null,scanData,done)
        });
    cacheDAO.get('param').then((data)=>{
        expect(data).to.be.eql(scanData)
    })
});


it('get() => successfully updated data in cache', async(done)=>{ 
    var errorMessage = 'Table not found';
    scanfn.withArgs('param').returns(
        {
            eachPage:sinon.stub().yields(errorMessage,null,done)
        });
    cacheDAO.get('param').catch((error)=>{
        expect(error).to.be.eql(errorMessage)
    })
});
});