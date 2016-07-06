require('../../spec_helper.js');

var subject = require("../../../nodejscomponent/regions/create/handler.js");
var db = require("../../../nodejscomponent/lib/models");
var Region = db["Region"];
var CONTAINS = db["CONTAINS"];
var Utils = db["Utils"];

describe("/regions", function () {

  // testdata from http://turfjs.org/static/docs/module-turf_merge.html

  var polyA = {
    "type": "Polygon",
    "coordinates": [
      [
        [
          9.994812,
          53.549487
        ],
        [
          10.046997,
          53.598209
        ],
        [
          10.117721,
          53.531737
        ],
        [
          9.994812,
          53.549487
        ]
      ]
    ]
  };

  var polyB = {
    "type": "Polygon",
    "coordinates": [
      [
        [
          10.000991,
          53.50418
        ],
        [
          10.03807,
          53.562539
        ],
        [
          9.926834,
          53.551731
        ],
        [
          10.000991,
          53.50418
        ]
      ]
    ]
  };

  var polyAB = {
    "type": "Polygon",
    "coordinates": [
      [
        [
          10.005390809136088,
          53.55936379867258
        ],
        [
          10.046997,
          53.598209
        ],
        [
          10.117721,
          53.531737
        ],
        [
          10.026838636912657,
          53.54486184801601
        ],
        [
          10.000991,
          53.50418
        ],
        [
          9.926834,
          53.551731
        ],
        [
          10.005390809136088,
          53.55936379867258
        ]
      ]
    ]
  }

  before(
    function (done) {
      // Wipe db
      Utils.wipe().then(
        function (result) {

          // Define zipcodes
          return Region.bulkCreate(
            [
              {
                name: "Maas",
                code: "1001",
                type: Region.TYPE_PLACE
              },
              {
                name: '1001',
                code: '1001',
                type: Region.TYPE_ZIP,
                area: {type: "Feature", properties: {name: '1001'}, geometry: polyA}
              },
              {
                name: '1002',
                code: '1002',
                type: Region.TYPE_ZIP,
                area: {type: "Feature", properties: {name: '1002'}, geometry: polyB}
              }
            ]
          )
        }
      ).then(function (result) {
        return CONTAINS.bulkCreate(
          [
            {
              parent: {
                code: "1001",
                type: Region.TYPE_PLACE
              },
              child: {
                code: '1001',
                type: Region.TYPE_ZIP
              }
            },
            {
              parent: {
                code: "1001",
                type: Region.TYPE_PLACE
              },
              child: {
                code: '1002',
                type: Region.TYPE_ZIP
              }
            }
          ]
        )
      }).then(
        function (result) {
          done();
        }
      ).catch(function (error) {
        done(error);
      })
    }
  );

  describe(" create", function () {

    describe("with Region that has multiple children", function () {

      var count;

      var event = {
        name: "name",
        description: "description",
        children: []
      };

      before(function (done) {
        Region.find(
          {
            name: "Maas",
            code: "1001",
            type: Region.TYPE_PLACE
          }
        ).then(function (result) {
          event["children"] = [
            result[0].data["_id"]
          ];
          done();
        }).catch(function (error) {
          done(error);
        })
      });

      var matchingRegion = {
        name: "name",
        description: "description",
        type: Region.TYPE_CARE,
        area: {type: "Feature", geometry: polyAB, properties: {}}
      };

      it("should return create a new Region with the combined area", function (done) {
        var context = new MockContext();
        context.then(
          function (context) {

            expect(context.error).toBe(null);

            filterIds([context.response]);
            expect(context.response).toEqual(matchingRegion);

            done();
          }
        ).catch(function (error) {
          done(error);
        });

        subject.handler(event, context);
      });

      it("should create connections between the new Region and its child", function (done) {
        var context = new MockContext();
        var response = null;

        context.then(
          function (context) {

            response = context.response;

            return Region.children(response["id"]);
          }
        ).then(function(children){

          for(var i=0; i < event["children"].length; i++){
            var found = false;
            var childId = event["children"][i];

            for(var j=0; j < children.length; j ++){
              var child = children[j];
              if(child.data["_id"] == childId){
                found = true;
                break;
              }
            }

            expect(found).toBeTruthy();
          }

          done();

        }).catch(function (error) {
          done(error);
        });

        subject.handler(event, context);
      });

    });

    describe("with Regions that have no children", function () {



      var event = {
        name: "name",
        description: "description",
        children: []
      };

      before(function (done) {
        Region.find(
          {
            type: Region.TYPE_ZIP
          }
        ).then(function (result) {
          for(var i=0; i < result.length; i++){
            event["children"].push(result[i].data["_id"]);
          }

          done();
        }).catch(function (error) {
          done(error);
        })
      });

      var matchingRegion = {
        name: "name",
        description: "description",
        type: Region.TYPE_CARE,
        area: {type: "Feature", geometry: polyAB, properties: {}}
      };

      it("should return create a new Region with the combined area", function (done) {
        var context = new MockContext();
        context.then(
          function (context) {

            expect(context.error).toBe(null);

            filterIds([context.response]);
            expect(context.response).toEqual(matchingRegion);

            done();
          }
        ).catch(function (error) {
          done(error);
        });

        subject.handler(event, context);
      });

      it("should create connections between the new Region and its children", function (done) {
        var context = new MockContext();
        var response = null;

        context.then(
          function (context) {

            response = context.response;

            return Region.children(response["id"]);
          }
        ).then(function(children){

          for(var i=0; i < event["children"].length; i++){
            var found = false;
            var childId = event["children"][i];

            for(var j=0; j < children.length; j ++){
              var child = children[j];
              if(child.data["_id"] == childId){
                found = true;
                break;
              }
            }

            expect(found).toBeTruthy();
          }

          done();

        }).catch(function (error) {
          done(error);
        });

        subject.handler(event, context);
      });

    });

    describe("with a name of 0 length", function () {

      var event = {
        name: "",
        description: "description",
        children: []
      };

      before(function (done) {
        Region.find(
          {
            name: "Maas",
            code: "1001",
            type: Region.TYPE_PLACE
          }
        ).then(function (result) {
          event["children"] = [
            result[0].data["_id"]
          ];
          done();
        }).catch(function (error) {
          done(error);
        })
      });

      it("should throw an error", function (done) {
        var context = new MockContext();
        context.then(
          function (context) {

            expect(context.error).toNotBe(null);
            done();

          }
        ).catch(function (error) {
          done(error);
        });

        subject.handler(event, context);
      });

      it("should not create a new region", function (done) {
        var oldCount;
        var context = new MockContext();
        context.then(function(response){
          return Region.count();
        }).then(function(newCount){
          expect(newCount).toEqual(oldCount);
          done();

        }).catch(function (error) {
          done(error);
        });

        Region.count().then(
          function (count) {
            oldCount = count;
            subject.handler(event, context);
          }
        ).catch(function(error){
          done(error);
        });
      });

    });

    describe("without a name", function () {

      var event = {
        name: null,
        description: "description",
        children: []
      };

      before(function (done) {
        Region.find(
          {
            name: "Maas",
            code: "1001",
            type: Region.TYPE_PLACE
          }
        ).then(function (result) {
          event["children"] = [
            result[0].data["_id"]
          ];
          done();
        }).catch(function (error) {
          done(error);
        })
      });

      it("should throw an error", function (done) {
        var context = new MockContext();
        context.then(
          function (context) {

            expect(context.error).toNotBe(null);
            done();

          }
        ).catch(function (error) {
          done(error);
        });

        subject.handler(event, context);
      });

      it("should not create a new region", function (done) {
        var oldCount;
        var context = new MockContext();
        context.then(function(response){
          return Region.count();
        }).then(function(newCount){
          expect(newCount).toEqual(oldCount);
          done();

        }).catch(function (error) {
          done(error);
        });

        Region.count().then(
          function (count) {
            oldCount = count;
            subject.handler(event, context);
          }
        ).catch(function(error){
           done(error);
        });
      });

    });

    describe("without children ids", function () {

      var event = {
        name: "name",
        description: "description",
        children: null
      };

      it("should throw an error", function (done) {
        var context = new MockContext();
        context.then(
          function (context) {

            expect(context.error).toNotBe(null);
            done();

          }
        ).catch(function (error) {
          done(error);
        });

        subject.handler(event, context);
      });

      it("should not create a new region", function (done) {
        var oldCount;
        var context = new MockContext();
        context.then(function(response){
          return Region.count();
        }).then(function(newCount){
          expect(newCount).toEqual(oldCount);
          done();

        }).catch(function (error) {
          done(error);
        });

        Region.count().then(
          function (count) {
            oldCount = count;
            subject.handler(event, context);
          }
        ).catch(function(error){
          done(error);
        });
      });

    });

  })

});