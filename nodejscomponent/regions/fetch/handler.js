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
var db = require(__dirname + '/../../lib/models');
var Region = db["Region"];

// Lambda Handler
module.exports.handler = function (event, context) {

  var query = event.query;

  var limit = 10;
  var page = 0;
  if (event.limit != undefined && event.limit != null) {
    limit = event.limit > 0 ? event.limit : limit;

    if(event.page != undefined && event.page != null) {
      var eventPage = parseInt(event.page);
      page = eventPage >= 0 ? eventPage : page;
    }
  }

  var offset = page * limit;
  var data =[];

  Region.search(
    query, limit, offset
  ).then(
    function(result){
      data = result.data;
      return Region.count(query);
    }
  ).then(
    function (count) {
      var total = count > 0 ? Math.ceil(count / limit) : 1;

      var response = {
        pages: {
          current: page,
          total: total
        },
        data: Region.toJson(data)
      };
      context.succeed(response);
    }
  ).catch(
    function (error) {
      context.fail(error);
    }
  );

};