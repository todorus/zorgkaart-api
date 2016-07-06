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

  // console.log("event", event);
  if(!(event.id)){
    var fault = { message: 'must provide id' };
    var error = new Error(JSON.stringify({ status: 'failure', fault: fault }));
    context.fail(error);
    return;
  }

  Region.byIds(
    [event.id]
  ).then(
    function (result) {
      var response = result.length > 0 ? Region.toJson(result[0].data) : null;
      context.succeed(response);
    }
  ).catch(function(error){
    context.fail(error);
  });

};