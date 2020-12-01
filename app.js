const express = require('express');
const config = require('config');
const port = config.get('serverport');
var cors = require('cors')
const logger = require('./src/utils/logger');

var middleware = require('./src/middleware/middleware');
var routes = require('./src/routes/appRoutes');


const app = express();
app.use(cors())
const router = express.Router();

middleware.initializeMiddleware(app,router);
routes.initializeConfigRoutes(router);

app.listen(port, async () => {
    try {
        logger.info(`Config app listening at http://localhost:${port}`) 
    } catch (error) {
        logger.error(error);
    }

})