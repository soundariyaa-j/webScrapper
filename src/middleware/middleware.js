var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
class Middleware{
    
    /**
     * 
     * @param {*} app 
     * @param {*} router 
     * Parse the request body
     * set the cors headers in response
     */
    static initializeMiddleware(app,router){
        app.use(logger('dev'));
        app.use(bodyParser.json({limit:'100mb'}));
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(cookieParser());
        app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
          next();
        });
        app.use('/metadata', router);
    }
}

module.exports = Middleware;