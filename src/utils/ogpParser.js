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
        return new Promise((resolve,reject)=>{
            try {
                const ogpMetadataMapping = config.get('ogpMetadataMapping');
                const $ = cheerio.load(data); 
                const metadata = $('meta');
                var ogParameters = {};
                for(var key of Object.keys(metadata)){
                    let metaAttribs =  metadata[key] ? metadata[key].attribs : null;
                    if( metaAttribs && metaAttribs.property && ogpMetadataMapping[metaAttribs.property]){
                        let ogpAttr = ogpMetadataMapping[metaAttribs.property];
                        OGPParser.setValue(ogParameters,ogpAttr,metaAttribs.content);
                    }
                }
                if(ogParameters && (Object.keys(ogParameters).length< 1)){
                    logger.info("Open Graph Params are not found in webpage");
                    for(var key of Object.keys(ogpMetadataMapping)){
                        let ogpAttr = ogpMetadataMapping[key];
                        if(ogpAttr.gpath){
                            const value = eval(ogpAttr.gpath);
                            if(value){
                                OGPParser.setValue(ogParameters,ogpAttr, value);
                            }
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

    static setValue(ogParameters, ogpAttr, value){
        if(ogpAttr.attType=== 'array'){
            if(!ogParameters[ogpAttr.name]){
                ogParameters[ogpAttr.name] = [];
            }
            ogParameters[ogpAttr.name].push(value);
        }else{
            ogParameters[ogpAttr.name] = value;
        }
    }
}

module.exports = OGPParser;