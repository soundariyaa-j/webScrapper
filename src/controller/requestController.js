const httpService = require('../service/httpService');
const ogpParser = require('../utils/ogpParser');
const logger = require('../utils/logger');
const Joi = require('joi');

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
            logger.info("Fetch OGP Param for URL:- "+req.body.url)
            await RequestController.validateRequest()
            const response = await httpService.getHtmlPage(req.body.url);
            const ogParameters = await ogpParser.parseData(response);
            res.send(ogParameters);
        } catch (error) {
            logger.error("Error in fetching HTML "+error);
            res.json({status: "FAIL",message:error.message}).status(400);
        }
    }
}

module.exports = RequestController;