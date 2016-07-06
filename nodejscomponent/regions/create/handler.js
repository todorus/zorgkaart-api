'use strict';

//TODO use a transaction to make to create the new Region and connect it to its children in one action

// Require Serverless ENV vars
var env = require('serverless-helpers-js').loadEnv();

// Require Logic
var turf = require('turf');
var db = require(__dirname + '/../../lib/models');
var Region = db["Region"];
var CONTAINS = db["CONTAINS"];

// Lambda Handler
module.exports.handler = function (event, context) {

  // console.log("event", event);

  if(event["children"] == null || event["children"] == undefined){
    var fault = { message: 'must provide children ids' };
    var error = new Error(JSON.stringify({ status: 'failure', fault: fault }));
    context.fail(error);
    return;
  }

  if(event["name"] == null || event["name"] == undefined){
    var fault = { message: 'must provide a name' };
    var error = new Error(JSON.stringify({ status: 'failure', fault: fault }));
    context.fail(error);
    return;
  } else if(event["name"].length < 2) {
    var fault = { message: 'must provide a name of at least 2 characters in length' };
    var error = new Error(JSON.stringify({ status: 'failure', fault: fault }));
    context.fail(error);
    return;
  }

  var created = null;

  var childIds = event["children"].filter(function(elem, pos, self){
    return self.indexOf(elem) == pos;
  });

  var regions = [];
  var properties = {
    name: event["name"],
    description: event["description"],
    type: Region.TYPE_CARE
  };

  Region.byIds(childIds)
    .then(function (result) {
      regions = regions.concat(result);
      return Region.children(childIds);
    }).then(function (result) {
    regions = regions.concat(result);

    var polygons = {
      type: "FeatureCollection",
      features: []
    };

    for (var i = 0; i < regions.length; i++) {
      var region = regions[i];
      var area = region.data["area"];

      if (area != undefined && area != null) {
        area["properties"] = {};
        polygons["features"].push(area);
      }
    }

    var merged = turf.merge(polygons);
    properties["area"] = JSON.stringify(merged);

    return Region.create(properties);

  }).then(function(result){

    created = result[0];
    var parentId = created.data["_id"]

    var propertiesArray = [];
    for(var i=0; i < childIds.length; i++){
      var childId = childIds[i];
      var props = {
        parent: {
          _id: parentId
        },
        child: {
          _id: childId
        }
      };

      propertiesArray.push(props);
    }

    return CONTAINS.bulkCreate(propertiesArray);

  }).then(function(result){

    var response = Region.toJson(created.data);
    context.succeed(response);

  }).catch(function (error) {
    context.fail(error);
  });


};