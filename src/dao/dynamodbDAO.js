
const AWS = require('aws-sdk');
const https = require('https');
const config = require('config');

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
class DynamodbDAO{
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

module.exports = DynamodbDAO