const proxyquire = require('proxyquire');
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const fs = require('fs');
const logger = require('../../src/utils/logger');
const cacheDAO = require('../../src/utils/cacheUtility');
const chai = require('chai');
const expect = chai.expect;
var requestController = require('../../src/controller/requestController');
var httpServices = require('../../src/services/httpService');
var ogpParser = require('../../src/utils/ogpParser');

describe('Validating request controller class', async()=>{
    let mockRequest = httpMocks.createRequest();
    let mockResponse = httpMocks.createResponse();
    var loggerInfoStub;
    var loggerErrorStub;
    var getHtmlPageStub;
    var parseDataStub;
    var fetchValuefromCacheStub;
    var hasMetadataStub;
    var saveMetadataStub ;
    var changeCacheCountStub;
    var getMetadataStub ;
    var updateWebpageAccessCountStub ;
    const testDataPath = './test/testData/';
    const testData = fs.readFileSync(testDataPath+'testData.json');
    beforeEach(() => {
        mockRequest.body = {};
        loggerInfoStub = sinon.stub(logger, 'info');
        loggerErrorStub = sinon.stub(logger, 'error');
        fetchValuefromCacheStub = sinon.stub(cacheDAO, 'fetchValuefromCache');
        hasMetadataStub = sinon.stub(cacheDAO, 'hasMetadata');
        saveMetadataStub = sinon.stub(cacheDAO, 'saveMetadata');
        changeCacheCountStub = sinon.stub(cacheDAO, 'changeCacheCount');
        getMetadataStub = sinon.stub(cacheDAO, 'getMetadata');
        updateWebpageAccessCountStub =  sinon.stub(cacheDAO, 'updateWebpageAccessCount');
        getHtmlPageStub = sinon.stub(httpServices,'getHtmlPage');
        parseDataStub = sinon.stub(ogpParser,'parseData');
        loggerInfoStub.returns(true);
        loggerErrorStub.returns(true);
    });
    it('validateRequest() => with valid request', async()=>{
        mockRequest.body = {
            'url' : 'https://www.google.com/'
        }
        requestController.validateRequest(mockRequest.body).then(data=>{
            expect(true).to.equal(true);
        })
    });
    it('validateRequest() => with missing request', async()=>{
        mockRequest.body = {}
        
        requestController.validateRequest(mockRequest.body).then(()=>{
            expect(true).to.equal(true);
        }).catch(error=>{
            expect(error).to.be.eql('url is required');
        })
    })
    it('processRequest() => Response from cache', async()=>{
        let data = JSON.parse(testData).validogpRequest;
        mockRequest.body = {url:data.url};
        fetchValuefromCacheStub.returns(true);
        hasMetadataStub.returns(true);
        getMetadataStub.returns(JSON.stringify(data.response));
        updateWebpageAccessCountStub.returns(true);
        await requestController.processRequest(mockRequest,mockResponse);
        expect(mockResponse._getData()).to.be.eql(data.response);
    });
    it('processRequest() => Response from webpage', async()=>{
        let data = JSON.parse(testData).validogpRequest;
        let htmlResponse = await fs.readFileSync(testDataPath+data.htmlResponse);
        mockRequest.body = {url:data.url};
        fetchValuefromCacheStub.returns(true);
        hasMetadataStub.returns(false);
        saveMetadataStub.returns(true);
        getHtmlPageStub.returns(htmlResponse.toString());
        parseDataStub.returns(data.response);
        await requestController.processRequest(mockRequest,mockResponse);
        expect(saveMetadataStub.calledOnce).to.be.eql(true);
        expect(getHtmlPageStub.calledOnce).to.be.eql(true);
        expect(mockResponse._getData()).to.be.eql(data.response);
    });

    it('processRequest() => Handling error response', async()=>{
        let data = JSON.parse(testData).validogpRequest;
        mockRequest.body = {url:data.url};
        let errorResponse = {
            status: "FAIL",
            message:"Error in fetching response"
        }
        fetchValuefromCacheStub.returns(true);
        hasMetadataStub.returns(true);
        getMetadataStub.throws(new Error(errorResponse.message));
        await requestController.processRequest(mockRequest,mockResponse)
        expect(mockResponse._getData()).to.be.eql(errorResponse);
        expect(mockResponse._getStatusCode()).to.be.eql(400);
    });

    it('changeCacheCount() =>  change cache count varaiable', async()=>{
        mockRequest.body = {count:2};
        changeCacheCountStub.returns(true);
        await requestController.changeCacheCount(mockRequest,mockResponse)
        expect(mockResponse._getData()).to.be.eql({status:"SUCCESS"});
    });

    it('changeCacheCount() =>  change cache count varaiable', async()=>{
        mockRequest.body = {};
        changeCacheCountStub.returns(true);
        await requestController.changeCacheCount(mockRequest,mockResponse)
        expect(mockResponse._getData()).to.be.eql({message:"count is required"});
        expect(mockResponse._getStatusCode()).to.be.eql(400);
    });

    it('changeCacheCount() =>  change cache count varaiable', async()=>{
        mockRequest.body = {count:2};
        let errorResponse = {
            status: "FAIL",
            message:"Error in updating cache count"
        }
        changeCacheCountStub.throws(new Error(errorResponse.message));
        await requestController.changeCacheCount(mockRequest,mockResponse)
        expect(JSON.stringify(mockResponse._getData())).to.be.eql(JSON.stringify(errorResponse));
        expect(mockResponse._getStatusCode()).to.be.eql(400);

    });

    afterEach(()=>{
        loggerInfoStub.restore();
        loggerErrorStub.restore();
        fetchValuefromCacheStub.restore();
        hasMetadataStub.restore();
        saveMetadataStub.restore();
        changeCacheCountStub.restore();
        getMetadataStub.restore();
        updateWebpageAccessCountStub.restore();
        parseDataStub.restore();
        getHtmlPageStub.restore();
    })

})