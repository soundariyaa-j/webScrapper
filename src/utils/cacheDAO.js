
const AWS = require('aws-sdk');
const https = require('https');
const config = require('config');
const logger = require('./logger');

const agent = new https.Agent({
    keepAlive: true
});

const dynamoDBConfig = config.get('dynamoDBConfig');
AWS.config.update({
    region: dynamoDBConfig.region,
    httpOptions: {
        agent
    }
});

const client = new AWS.DynamoDB.DocumentClient();
var webpageAccessCountMap = new Map();
var webpageMetadataMap = new Map();
var cacheCount= dynamoDBConfig.cacheCount || 10;

class CacheDAO{

    /**
     * 
     * @param {*} req 
     * @param {*} response 
     * Store Webpage access count
     * Store to dynamo db if wepage is accesses more than configured cache count
     */
    static async saveMetadata(req , response){
        try {
            const metadata = JSON.stringify(response);
            const webpageName = req.body.url;
            const webpageAccessCount = webpageAccessCountMap.has(webpageName)?webpageAccessCountMap.get(webpageName)+1:1;
            CacheDAO.updateWebpageAccessCount(webpageName, webpageAccessCount)
            if(!webpageMetadataMap.has(webpageName) && webpageAccessCount>=cacheCount){
                webpageMetadataMap.set(webpageName,metadata);
                logger.debug('Saving webpage-'+webpageName+' data');
                var params = {
                    TableName: dynamoDBConfig.metadataTable.tableName,
                    Item: {
                        "webpage_name": webpageName,
                        "metadata": metadata
                    }
                };
                await CacheDAO.put(params);
            }
        } catch (error) {
            logger.error("Error in caching webpage metadata"+error);
        }
    }

    static async updateWebpageMetadata(webpageName){
        try {
            if(webpageMetadataMap.has(webpageName)){
                logger.debug('Updating webpage-'+webpageName+' data');
                webpageMetadataMap.set(webpageName,metadata);
    
                var params = {
                    TableName: dynamoDBConfig.metadataTable.tableName,
                    Key: {
                        PK:'webpage_name'
                    },
                    UpdateExpression:'SET #attrName =:attrValue',
                    ConditionExpression: '#WP = :WP',
                    ExpressionAttributeNames: {
                        "#attrName": "metadata",
                        "#WP":"webpage_name"
                    }, 
                    ExpressionAttributeValues: {
                        ":attrValue": {
                          S: metadata
                         },
                         ":WP":{
                             S:webpageName
                         }
                    }
                };
                await CacheDAO.update(params);
            }
        } catch (error) {
            logger.error("Error in updating webpage metadata cache "+error);
        }

    }

    static async updateWebpageAccessCount(webpageName,webpageAccessCount){
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
            await CacheDAO.update(params);
        }else{
            var params = {
                TableName: dynamoDBConfig.accessCountTable.tableName,
                Item: {
                    "webPageName": webpageName,
                    "accessCount": webpageAccessCount
                }
            };
            await CacheDAO.put(params);
        }
        webpageAccessCountMap.set(webpageName,webpageAccessCount);

    }
    static async getMetadata(webpageName){
        return webpageMetadataMap.get(webpageName);
    }

    static async hasMetadata(webpageName){
        return webpageMetadataMap.has(webpageName);
    }

    static getWebpageCount(webpageName){
        return webpageAccessCountMap.get(webpageName);
    }

    static fetchValuefromCache(webpageName){
        return (webpageAccessCountMap.get(webpageName)>=cacheCount);
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
            var webpageMetadata = await CacheDAO.get({TableName :dynamoDBConfig.metadataTable.tableName});
            if(webpageMetadata && webpageMetadata.Items && webpageMetadata.Items.length>0){
                webpageMetadataMap = new Map(webpageMetadata.Items.map(item => [item.webpage_name, item.metadata]))
            }
            var webpageAccessCount = await CacheDAO.get({TableName :dynamoDBConfig.accessCountTable.tableName});

            if(webpageAccessCount && webpageAccessCount.Items && webpageAccessCount.Items.length>0){
                webpageAccessCountMap = new Map(webpageAccessCount.Items.map(item => [item.webPageName, item.accessCount]))
            }

        } catch (error) {
            logger.error("Error in initilizing cache "+error);
        }
    }


    /**
     * 
     * @param {*} params 
     * insert item to dynamo db
     */
    static put(params){
        return new Promise((resolve, reject) => {
            client.put(params, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    /**
     * 
     * @param {*} params 
     * update item to dynamo db
     */
    static update(params){
        return new Promise((resolve, reject) => {
            client.update(params, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    /**
     * 
     * @param {*} params 
     * get item to dynamo db
     */
    static get(params){
        return new Promise((resolve, reject) => {
            client.scan(params).eachPage((err, data, done) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
                done();
            });
        });
    }
}

module.exports = CacheDAO;