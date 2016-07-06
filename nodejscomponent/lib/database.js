var _sequelize = null;

module.exports = function(){
    if(_sequelize == null) {

        var Sequelize = require('sequelize')
        var path = require("path");
        var fs = require('fs');
        var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/db.json')))[process.env.NODE_ENV];

        _sequelize = new Sequelize(
            config["database"],
            config["username"],
            config["password"],
            {
                host: config["host"],
                port: config["port"],
                dialect: config["dialect"],
                pool: config["pool"]
            }
        );
    }

    return _sequelize;
}