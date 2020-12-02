const httpService = require('../service/httpService');
const ogpParser = require('../utils/ogpParser');
const logger = require('../utils/logger');
const Joi = require('joi');
const cacheDAO = require('../utils/cacheDAO');

class RequestController{

    /**
     * 
     * @param {*} data 
     * validate Request body
     * if url is missiong throw error
     */
    static async validateRequest(data){
        return new Promise((resolve, reject)=>{
            const schema = Joi.object().keys({
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
            await RequestController.validateRequest();
            var ogParameters = {};
            if(cacheDAO.fetchValuefromCache(webPageURL) && cacheDAO.hasMetadata(webPageURL)){
                logger.info("Resonse fetched from cache");
                const cacheResponse = await cacheDAO.getMetadata(webPageURL);
                ogParameters = JSON.parse(cacheResponse);
            }else{
                const response = await httpService.getHtmlPage(webPageURL);
                ogParameters = await ogpParser.parseData(response);
                cacheDAO.saveMetadata(req, ogParameters);
            }
            res.send(ogParameters);
        } catch (error) {
            logger.error("Error in fetching HTML "+error);
            res.json({status: "FAIL",message:error.message}).status(400);
        }
    }

    static async changeCacheCount(req, res){
        try {
            if(req.body.count){
                cacheDAO.changeCacheCount(req.body.count);
                res.send({status:"SUCCESS"});
            }else{
                res.send({message:"count is required"}).status(400);
            }
        } catch (error) {
            logger.error("Error in updating cache count"+error);
            res.json({status: "FAIL",message:error.message}).status(400);
        }
    } 
}

module.exports = RequestController;