'use strict';
var Q = require('q');

module.exports = function (db, databaseName) {
  function CONTAINS() {
    this.data = {};

    CONTAINS.db = db;
    CONTAINS.databaseName = databaseName;
  };

  CONTAINS.build = function (properties) {
    var instance = new CONTAINS();
    instance.setAll(properties);
    return instance;
  };

  CONTAINS.bulkCreate = function(propertiesArray){
    var deferred = Q.defer();
    var statements = [];
    for (var i = 0; i < propertiesArray.length; i++) {
      var props = propertiesArray[i];
      var statement = CONTAINS.buildStatement(props);

      statements.push(statement)
    }

    db.beginAndCommitTransaction({
      statements: statements
    }, function (err, result) {
      if (err) {
        deferred.reject(err);
      } else if (result["errors"].length > 0) {
        deferred.reject(result["errors"]);
      } else {
        deferred.resolve(result);
      }
    });

    return deferred.promise;
  }

  CONTAINS.buildStatement = function(properties){
    var labels = buildLabels(CONTAINS.build(properties));
    var query =  "MATCH (parent:Region),(child:Region) " +
      buildWhereClause(properties) +
      "CREATE (parent)-[r" + labels + "]->(child) " +
      "RETURN r,parent,child";

    var statement = {
      statement: query,
      parameters: properties
    };

    return statement;
  };

  CONTAINS.prototype.setAll = function (properties) {
    for (var key in properties) {
      this.set(key, properties[key]);
    }
  };

  CONTAINS.prototype.set = function (propertyName, value) {
    this.data[propertyName] = value != undefined ? value : null;
  };

  CONTAINS.prototype.save = function () {

    var deferred = Q.defer();
    var labels = buildLabels(this);

    var id = this.id;
    if (id == null) {

      // MATCH (a:Person),(b:Person)
      // WHERE a.name = 'Node A' AND b.name = 'Node B'
      // CREATE (a)-[r:RELTYPE { name : a.name + '<->' + b.name }]->(b)
      // RETURN r

      var query =  "MATCH (parent:Region),(child:Region) " +
        buildWhereClause(this.data) +
        "CREATE (parent)-[r" + labels + "]->(child) " +
        "RETURN r,parent,child";

      CONTAINS.db.cypherQuery(
        query,
        null,
        function (error, result) {
          if (error) {
            deferred.reject(new Error(error));
          } else {
            deferred.resolve(resultToRelations(result));
          }
        }
      );
    } else {
      //TODO update relation with properties
    }

    return deferred.promise;
  };

  function resultToRelations(result) {
    var converted = [];
    for (var i = 0; i < result.data.length; i++) {
      converted.push(CONTAINS.build(result.data[i][0]));
    }
    return converted;
  }

  function buildLabels(contains) {
    var labels = ':CONTAINS';
    return labels;
  }

  function buildWhereClause(data) {
    var parentClause;
    if (data["parent"]["_id"] != undefined && data["parent"]["_id"] != null) {
      parentClause = " id(parent) = " + data["parent"]["_id"] + " ";
    } else if (data["parent"]["code"] != undefined && data["parent"]["code"] != null) {
      parentClause = " parent.code = '" + data["parent"]["code"] + "' ";
    } else {
      throw(new Error("must supply a parents id or code"));
    }
    if(data["parent"]["type"]) {
      parentClause += " AND parent.type='" + data["parent"]["type"] + "'";
    }

    var childClause;
    if (data["child"]["_id"] != undefined && data["child"]["_id"] != null) {
      childClause = " id(child) = " + data["child"]["_id"] + " ";
    } else if (data["child"]["code"] != undefined && data["child"]["code"] != null) {
      childClause = " child.code = '" + data["child"]["code"] + "' ";
    } else {
      throw(new Error("must supply a childs id or code"));
    }
    if(data["child"]["type"]) {
      childClause += " AND child.type='" + data["child"]["type"] + "'";
    }

    return "WHERE " + parentClause + " AND " + childClause + " ";
  }

  return CONTAINS
}