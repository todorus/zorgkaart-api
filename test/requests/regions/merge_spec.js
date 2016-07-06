require('../../spec_helper.js');

var subject = require("../../../nodejscomponent/regions/merge/handler.js");
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
      ).then(function(result){
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
      ).catch(function(error){
        done(error);
      })
    }
  );

  describe("/merge", function () {

    describe("with Region that has multiple children", function () {

      var event = {}

      before(function(done){
        Region.find(
          {
            name: "Maas",
            code: "1001",
            type: Region.TYPE_PLACE
          }
        ).then(function(result){
          event["regions"] = "[ "+result[0].data["_id"]+" ]";
          done();
        }).catch(function (error) {
          done(error);
        })
      });

      var matchingRegion = {id: null, name: null, type: null, area: {type: "Feature", geometry: polyAB, properties: {}} };

      it("should return an area comprised of that area and its children areas merged into one", function (done) {
        var context = new MockContext();
        context.then(
          function (context) {

            expect(context.error).toBe(null);
            expect(context.response).toEqual(matchingRegion);

            done();
          }
        ).catch(function(error){
          done(error);
        });

        subject.handler(event, context);
      });
    });

    describe("with regions that have no children", function () {

      it("should return an area comprised of the areas of that node merged into one");

    })
  })

});