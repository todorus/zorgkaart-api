global.expect = require('expect');
global.sinon = require('sinon');
global.filterIds = function (response) {
  for (var i = 0; i < response.length; i++) {
    var row = response[i];
    delete row["_id"];
    delete row["id"];
    response[i] = row;
  }
}

var Q = require("q");

// disable logging
// console.log = function() {}

function MockContext(callback) {
  this.successfull = false;
  this.finished = false;

  this.deferred = Q.defer();
  this.promise = this.deferred.promise;

  this.error = null;
  this.response = null;

  this.callback = callback;
}
MockContext.prototype.done = function (error, response) {
  this.finished = true;
  this.successfull = error == null;
  this.error = error;
  this.response = response;

  if (error) {
    this.deferred.fulfill(error);
  } else {
    this.deferred.fulfill(this);
  }
}
MockContext.prototype.fail = function (error) {
  this.done(error, null);
}
MockContext.prototype.succeed = function (response) {
  this.done(null, response);
}
MockContext.prototype.then = function (resolveCallback, errorCallback) {
  return this.promise.then(resolveCallback, errorCallback);
}

global.MockContext = MockContext;

it("should run in the test environment", function () {
  expect(process.env.NODE_ENV).toEqual("test");
});