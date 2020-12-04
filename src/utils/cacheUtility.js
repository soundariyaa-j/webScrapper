
const config = require('config');
const logger = require('./logger');
const dynamodbDAO = require('../dao/dynamodbDAO')


const dynamoDBConfig = config.get('dynamoDBConfig');
const cacheConfig = config.get('cacheConfig');

var webpageAccessCountMap = new Map();
var webpageMetadataMap = new Map();
var cacheCount= cacheConfig.cacheCount || 10;

class CacheUtility{

    /**
     * 
     * @param {*} webpageName 
     * @param {*} response 
     * Store Webpage access count
     * Store to dynamo db if wepage is accesses more than configured cache count
     */
    static async saveMetadata(webpageName , response){
        try {
            const metadata = JSON.stringify(response);
            const webpageAccessCount = webpageAccessCountMap.has(webpageName)?webpageAccessCountMap.get(webpageName)+1:1;
            CacheUtility.updateWebpageAccessCount(webpageName, webpageAccessCount)
            logger.info( "webpageName stored in map:" +webpageMetadataMap.has(webpageName)+"; access count:"+webpageAccessCount+"; cachecount:"+cacheCount)
            if(!webpageMetadataMap.has(webpageName) && webpageAccessCount>=cacheCount){
                webpageMetadataMap.set(webpageName,metadata);
                var params = {
                    TableName: dynamoDBConfig.metadataTable.tableName,
                    Item: {
                        "webpage_name": webpageName,
                        "metadata": metadata
                    }
                };
               logger.info('Saving webpage-'+webpageName+' data'+JSON.stringify(params));
               await dynamodbDAO.put(params);
            }
        } catch (error) {
            logger.error("Error in caching webpage metadata"+error);
        }
    }

    /**
     * 
     * @param {*} webpageName 
     * @param {*} webpageAccessCount 
     * Update webpage access count to dynamo db
     */
    static async updateWebpageAccessCount(webpageName,webpageAccessCount){
        try {
            webpageAccessCount = webpageAccessCount ? webpageAccessCount:webpageAccessCountMap.get(webpageName)+1;
            logger.info("webpageAccessCountMap has webpage"+webpageAccessCountMap.has(webpageName))
            if(webpageAccessCountMap.has(webpageName)){
                var params = {
                    TableName: dynamoDBConfig.accessCountTable.tableName,
                    Key: {
                        'webPageName':webpageName
                    },
                    UpdateExpression:'SET #attrName =:attrValue',
                    ExpressionAttributeNames: {
                        "#attrName": "accessCount"
                    }, 
                    ExpressionAttributeValues: {
                        ":attrValue": webpageAccessCount
                    }
                };
                logger.info("updating webpage access details for webpage "+webpageName+" data:"+JSON.stringify(params))
                await dynamodbDAO.update(params);
            }else{
                var params = {
                    TableName: dynamoDBConfig.accessCountTable.tableName,
                    Item: {
                        "webPageName": webpageName,
                        "accessCount": webpageAccessCount
                    }
                };
                logger.info("Creating webpage access details for webpage "+webpageName+" data:"+JSON.stringify(params))
                await dynamodbDAO.put(params);
            }
            webpageAccessCountMap.set(webpageName,webpageAccessCount);
        } catch (error) {
            logger.error("Error in update webpage access detail "+error);
        }
    }

    static async getMetadata(webpageName){
        return webpageMetadataMap.get(webpageName);
    }

    static async setMetadata(webpageName, metadata){
        return webpageMetadataMap.set(webpageName, metadata);
    }

    static async hasMetadata(webpageName){
        return webpageMetadataMap.has(webpageName);
    }

    static get webpageMetadataMap(){
        return webpageMetadataMap;
    }

    static get webpageAccessCountMap(){
        return webpageAccessCountMap
    }

    static fetchValuefromCache(webpageName){
        return (webpageAccessCountMap.get(webpageName)>=cacheCount && cacheConfig.enableCache);
    }

    /**
     * 
     * @param {*} count 
     * Change cache count runtime
     */
    static changeCacheCount(count){
        cacheCount = count;
    }
    
    /**
     * initilize cache during app start
     */
    static async initilizeCache(){
        try {
            var webpageMetadata = await dynamodbDAO.get({TableName :dynamoDBConfig.metadataTable.tableName});
            if(webpageMetadata && webpageMetadata.Items && webpageMetadata.Items.length>0){
                webpageMetadataMap = new Map(webpageMetadata.Items.map(item => [item.webpage_name, item.metadata]))
            }
            var webpageAccessCount = await dynamodbDAO.get({TableName :dynamoDBConfig.accessCountTable.tableName});
            if(webpageAccessCount && webpageAccessCount.Items && webpageAccessCount.Items.length>0){
                webpageAccessCountMap = new Map(webpageAccessCount.Items.map(item => [item.webPageName, item.accessCount]))
            }

        } catch (error) {
            logger.error("Error in initilizing cache "+error);
        }
    }

}

module.exports = CacheUtility;