const proxyquire = require('proxyquire');
const sinon = require('sinon');
const fs = require('fs');
const logger = require('../../src/utils/logger');
const chai = require('chai');
const expect = chai.expect;
let httpService = require('../../src/services/httpService');


describe('Validating http service class', async()=>{
    var loggerInfoStub;
    var loggerErrorStub;

    beforeEach(() => {
        loggerInfoStub = sinon.stub(logger, 'info');
        loggerErrorStub = sinon.stub(logger, 'error');
        loggerInfoStub.returns(true);
        loggerErrorStub.returns(true);    });

    it('getHtmlPage() => with valid response', async()=>{
        const url = 'https://www.google.com/';
        httpService.getHtmlPage(url).then(data=>{
            expect(data).not.to.null;
        })
    });
    it('validateRequest() => Handling error scenario', async()=>{
        const url = '';
        httpService.getHtmlPage(url).catch(error=>{
            expect(error).not.to.null;
        })
    })

    afterEach(()=>{
        loggerInfoStub.restore();
        loggerErrorStub.restore(); 
    })

})