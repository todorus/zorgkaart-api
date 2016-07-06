require('../../spec_helper.js');

var db = require("../../../nodejscomponent/lib/models");
var Region = db["Region"];
var Utils = db["Utils"];

describe("Region", function () {

  beforeEach(
    function (done) {
      Utils.wipe()
        .then(
          done()
        ).catch(function (error) {
           done(error);
      });
    }
  );

  describe("connect", function () {

    describe("by type and code", function (done) {

      var input = [1, 2];

      var matchingRegions = [
        {area: {properties: {name: 'Maastricht'}, geometry: [[1,1]]}, name: 'Maastricht', type: Region.TYPE_PLACE},
        {area: {properties: {name: 'Maasdamn'}, geometry: [[2,1]]}, name: 'Maasdamn', type: Region.TYPE_PLACE},
        {area: {properties: {name: 'bijdeMaas'}, geometry: [[3,1]]}, name: 'bijdeMaas', type: Region.TYPE_MUNICIPALITY}
      ];

      it("should create a connection with the matching region(s)")
      //   function (done) {
      //
      //   var subject;
      //
      //   Region.bulkCreate(
      //     [
      //       {area: {properties: {name: 'Maastricht'}, geometry: [[1,1]]}, name: 'Maastricht', type: Region.TYPE_PLACE},
      //       {area: {properties: {name: 'Maasdamn'}, geometry: [[2,1]]}, name: 'Maasdamn', type: Region.TYPE_PLACE},
      //       {area: {properties: {name: 'bijdeMaas'}, geometry: [[3,1]]}, name: 'bijdeMaas', type: Region.TYPE_MUNICIPALITY}
      //     ]
      //   ).then(function(result) {
      //     return Region.find({name: 'bijdeMaas', type: Region.TYPE_MUNICIPALITY})
      //   }).then(function(result){
      //     subject = result[0];
      //     return subject.connect([
      //       {name: 'Maastricht', type: Region.TYPE_PLACE},
      //       {name: 'Maasdamn', type: Region.TYPE_PLACE}
      //     ]);
      //   }).then(function(result){
      //     expect(result.length).toBe(2);
      //     return subject.findConnections();
      //   }).then(function(result){
      //     expect(result.length).toBe(2);
      //
      //   }).catch(function(error){
      //     done(error);
      //   });
      //
      // }
    });

    describe("by ids", function(){

      it("should create a connection with the matching region(s)");

    });

    describe("by ids or type and code", function(){

      it("should create a connection with the matching region(s)");

    });
  })

});