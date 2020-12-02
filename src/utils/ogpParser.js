const cheerio = require('cheerio');
const config = require('config');
const logger = require('./logger');

class OGPParser{
    /**
     * 
     * @param {*} data html response
     * Parse the html response and fetch the Open Graph Param
     * If Open Graph Paarm is not present in webpage, get respective values from tag
     */
    static parseData(data){
        const ogpMetadataMapping = config.get('ogpMetadataMapping');
        return new Promise((resolve,reject)=>{
            try {
                const $ = cheerio.load(data); 
                const metadata = $('meta');
                var ogParameters = {};
                for(var key of Object.keys(metadata)){
                    let metaAttribs =  metadata[key] ? metadata[key].attribs : null;
                    if( metaAttribs && metaAttribs.property && ogpMetadataMapping[metaAttribs.property]){
                        let ogpAttr = ogpMetadataMapping[metaAttribs.property];
                        if(ogpAttr.attType=== 'array'){
                            if(!ogParameters[ogpAttr.name]){
                                ogParameters[ogpAttr.name] = [];
                            }
                            ogParameters[ogpAttr.name].push(metaAttribs.content);
                        }else{
                            ogParameters[ogpAttr.name] = metaAttribs.content;
                        }
                    }
                }
                if(ogParameters && Object.keys(ogParameters).length<0){
                    logger.info("Open Graph Params are not found in webpage");
                    for(var ogpAttr of Object.keys(ogpMetadataMapping)){
                        if(ogpAttr.gpath){
                            ogParameters[ogpAttr.name] =eval(ogpAttr.gpath);
                        }
                    }
                }
                logger.info("Metadata of webpage "+JSON.stringify(ogParameters));
                resolve(ogParameters);
            } catch (error) {
                logger.error("Error in fetching metadata of webpage "+error);
                reject(error);
            }
        })
    }
}

module.exports = OGPParser;