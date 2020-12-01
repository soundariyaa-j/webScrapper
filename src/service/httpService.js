const got = require('got');
const logger = require('../utils/logger');
class HttpRequestService{

    /**
     * 
     * @param {*} url - url of the webpage to process
     * fetch HTML response of given url 
     */
    static async getHtmlPage(url){
        return new Promise((resolve,reject)=>{
            got(url).then(response=>{
                logger.info('HTML Response '+response.body);
                resolve(response.body);
            }).catch(error =>{
                logger.error("Error in fetching response "+error);
                reject(error);
            });
        })
    }
}

module.exports = HttpRequestService