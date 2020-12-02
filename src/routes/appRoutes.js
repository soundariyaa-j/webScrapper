const requestController = require('../controller/requestController');

class Routes{
    /**
     * 
     * @param {*} router 
     * Initilize Rest API
     */
    static initializeConfigRoutes(router){
        router.post("/page/getinfo",requestController.processRequest);
        router.post("/cacheCount/update",requestController.changeCacheCount);
    }
}

module.exports = Routes