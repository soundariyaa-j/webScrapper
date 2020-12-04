var appRoot = require('app-root-path');
var winston = require('winston');

var options = {
  file: {
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    json: false,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false
  }
};

var logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.file,{'timestamp':true})
  ],
  exitOnError: false, 
});

logger.stream = {
  write: function(message, encoding) {
  },
};

module.exports = logger;