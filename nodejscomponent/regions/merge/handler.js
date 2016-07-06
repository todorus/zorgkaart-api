'use strict';

/**
 * Serverless Module: Lambda Handler
 * - Your lambda functions should be a thin wrapper around your own separate
 * modules, to keep your code testable, reusable and AWS independent
 * - 'serverless-helpers-js' module is required for Serverless ENV var support.  Hopefully, AWS will add ENV support to Lambda soon :)
 */

// Require Serverless ENV vars
var env = require('serverless-helpers-js').loadEnv();

// Require Logic
var turf = require('turf');
var db = require(__dirname + '/../../lib/models');
var Region = db["Region"];

// Lambda Handler
module.exports.handler = function (event, context) {

  // Serverless does not support parsed query parameters, but rather a string. This is a workaround until this issue
  // is resolved
  var idArray = JSON.parse(event["regions"])
  var ids = idArray.join();
  var regions = [];

  Region.byIds(ids)
    .then(function (result) {
      regions = regions.concat(result);
      return Region.children(ids);
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

    var response = {
      id: null,
      name: null,
      type: null,
      area: merged
    };
    context.succeed(response);

  }).catch(function (error) {
    context.fail(error);
  });


};