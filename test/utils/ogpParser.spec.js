const proxyquire = require('proxyquire');
const sinon = require('sinon');
const fs = require('fs');
const logger = require('../../src/utils/logger');
const chai = require('chai');
const expect = chai.expect;


describe('Validating request controller class', async()=>{
    var loggerInfoStub;
    var loggerErrorStub;
    const configGetStub = sinon.stub();
    const testDataPath = './test/testData/';
    const testData = fs.readFileSync(testDataPath+'testData.json');
    
    let ogpParser = proxyquire('../../src/utils/ogpParser', {
        'config': {
            get: configGetStub
        }
    });
    const ogpMetadataMapping = {
        "og:title": {
          "name": "title",
          "attType": "string",
          "gpath": "$('title').text()"
        },
        "og:type": {
          "name": "type",
          "attType": "string"
        },
        "og:url": {
          "name": "url",
          "attType": "string"
        },
        "og:description": {
          "name": "description",
          "attType": "string",
          "gpath": "$('meta[name=\"description\"]').attr('content')"
        },
        "og:image": {
          "name": "image",
          "attType": "array",
          "gpath": "$('img').attr('src')"
        },
        "og:audio": {
          "name": "audio",
          "attType": "array",
          "gpath":"$('audio').attr('src')"
        },
        "og:locale": {
          "name": "locale",
          "attType": "string"
        },
        "og:site_name": {
          "name": "siteNamme",
          "attType": "string"
        },
        "og:video:url": {
          "name": "video",
          "attType": "array"
        },
        "og:video": {
            "name": "video",
            "attType": "array",
            "gpath": "$('video').attr('src')"
        },
        "og:updated_time":{
          "name":"updated_time",
          "attType": "string"
        },
        "music:song":{
          "name":"music",
          "attType": "array"
        }
    }

    beforeEach(() => {
        loggerInfoStub = sinon.stub(logger, 'info');
        loggerErrorStub = sinon.stub(logger, 'error');
        loggerInfoStub.returns(true);
        loggerErrorStub.returns(true);
        configGetStub.returns(ogpMetadataMapping);
    });
 

    it('parseData() => Get metadata from webpage with open graph Parameter', async()=>{
        let data = JSON.parse(testData).validogpRequest;
        let htmlResponse = await fs.readFileSync(testDataPath+data.htmlResponse);
        ogpParser.parseData(htmlResponse).then(response=>{
            expect(response).to.be.eql(data.response);
        })
    });

    it('parseData() => Get metadata from webpage without open graph parameter', async()=>{
        let data = JSON.parse(testData).withogpRequest;
        let htmlResponse = await fs.readFileSync(testDataPath+data.htmlResponse);
        ogpParser.parseData(htmlResponse).then(response=>{
            expect(response).to.be.eql(data.response);
        })
    })
    it('parseData() => Get data from webapge without any metadata', async()=>{
        let data = JSON.parse(testData).withoutMetadata;
        let htmlResponse = await fs.readFileSync(testDataPath+data.htmlResponse);
        ogpParser.parseData(htmlResponse).then(response=>{
            expect(response).to.be.eql(data.response);
        })
    });
    it('parseData() => Handling error response', async()=>{
        let data = JSON.parse(testData).withoutMetadata;
        let htmlResponse ={};
        const errorParam = {
            "og:description": {
                "name": "description",
                "attType": "string",
                "gpath": "$('meta[name='description']').attr('content')"
            }
        }
        configGetStub.returns(errorParam);
        ogpParser.parseData(htmlResponse).catch(error=>{
            expect(error.message).to.equal('missing ) after argument list');
        })
    })
    afterEach(()=>{
      loggerInfoStub.restore();
      loggerErrorStub.restore(); 
  })
})