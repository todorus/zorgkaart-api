'use strict';
var Q = require('q');

var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../config/db.json')[env];

//Create a db object. We will using this object to work on the DB.
var url = config["protocol"] + "://" + config["username"] + ":" + config["password"] + "@" + config["host"] + ":" + config["port"];
var neo4j = require('node-neo4j');
var db = new neo4j(url);
var databaseName = config["database"];

module.exports = db;

//nodes
module.exports.Region = require(__dirname + '/nodes/region.js')(db, databaseName);

//relations
module.exports.CONTAINS = require(__dirname + '/relations/contains.js')(db, databaseName);

//utility
module.exports.Utils = require(__dirname + '/utils.js')(db, databaseName);
