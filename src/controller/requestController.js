const httpService = require('../services/httpService');
const ogpParser = require('../utils/ogpParser');
const logger = require('../utils/logger');
const Joi = require('joi');
const cacheUtility = require('../utils/cacheUtility');

class RequestController{

    /**
     * 
     * @param {*} data 
     * validate Request body
     * if url is missiong throw error
     */
    static async validateRequest(data){
        return new Promise((resolve, reject)=>{
            const schema = Joi.object({
                url: Joi.string().min(1).required().error(()=>{
                    reject("url is required");
                })
              });
            schema.validate(data); 
            resolve();
        }) 
    }

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     * Fetch Html response
     * Parse the response
     * Send parsed resonse
     * Incase error send error response
     */
    static async processRequest(req,res){
        try {
            const webPageURL = req.body.url;
            logger.info("Fetch OGP Param for URL:- "+webPageURL)
            await RequestController.validateRequest(req.body);
            var ogParameters = {};
            if(cacheUtility.fetchValuefromCache(webPageURL) && cacheUtility.hasMetadata(webPageURL)){
                logger.info("Resonse fetched from cache");
                const cacheResponse = await cacheUtility.getMetadata(webPageURL);
                ogParameters = JSON.parse(cacheResponse);
                cacheUtility.updateWebpageAccessCount(webPageURL, null);
            }else{
                const response = await httpService.getHtmlPage(webPageURL);
                ogParameters = await ogpParser.parseData(response);
                cacheUtility.saveMetadata(webPageURL, ogParameters);
            }
            res.send(ogParameters);
        } catch (error) {
            logger.error("Error in fetching HTML "+error);
            res.send({status: "FAIL",message:error.message}).status(400);
        }
    }

    static async changeCacheCount(req, res){
        try {
            if(req.body.count){
                cacheUtility.changeCacheCount(req.body.count);
                res.send({status:"SUCCESS"});
            }else{
                res.send({message:"count is required"}).status(400);
            }
        } catch (error) {
            logger.error("Error in updating cache count"+error);
            res.send({status: "FAIL",message:error.message}).status(400);
        }
    } 
}

module.exports = RequestController;