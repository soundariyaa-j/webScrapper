const express = require('express');
const config = require('config');
const port = config.get('serverport');
var cors = require('cors')
const logger = require('./src/utils/logger');
const cacheDAO = require('./src/utils/cacheDAO');

var middleware = require('./src/middleware/middleware');
var routes = require('./src/routes/appRoutes');
const serverless = require('serverless-http');

const app = express();
app.use(cors())
const router = express.Router();

middleware.initializeMiddleware(app,router);
routes.initializeConfigRoutes(router);

app.listen(port, async () => {
    try {
        logger.info(`Application server listening at ${port}`) ;
        cacheDAO.initilizeCache();
    } catch (error) {
        logger.error(error);
    }

})

//For serverless deployment
module.exports.handler = serverless(app);