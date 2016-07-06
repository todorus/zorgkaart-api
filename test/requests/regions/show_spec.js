require('../../spec_helper.js');

var subject = require("../../../nodejscomponent/regions/show/handler.js");
var db = require("../../../nodejscomponent/lib/models");
var Region = db["Region"];
var Utils = db["Utils"];

describe("/regions", function () {

  var targetId = null;

  before(
    function (done) {
      Utils.wipe()
        .then(function (result) {
          return Region.create({
            area: JSON.stringify({properties: {name: 'Nijmegen'}, geometry: [[100, 100]]}),
            name: 'Nijmegen',
            type: Region.TYPE_PLACE
          })
        }).then(function (result) {

        targetId = result[0].data["_id"];

        return db["Region"].bulkCreate(
          [
            {area: {properties: {name: 'Maastricht'}, geometry: [[1,1]]}, name: 'Maastricht', type: Region.TYPE_PLACE},
            {area: {properties: {name: 'Maasdamn'}, geometry: [[2,1]]}, name: 'Maasdamn', type: Region.TYPE_PLACE},
            {area: {properties: {name: 'bijdeMaas'}, geometry: [[3,1]]}, name: 'bijdeMaas', type: Region.TYPE_MUNICIPALITY},
            {area: {properties: {name: 'blub'}, geometry: [[4,1]]}, name: 'blub', type: Region.TYPE_MUNICIPALITY},
            {area: {properties: {name: 'blob'}, geometry: [[5,1]]}, name: 'blob', type: Region.TYPE_MUNICIPALITY},
            {area: {properties: {name: 'Maasland'}, geometry: [[6,1]]}, name: 'Maasland', type: Region.TYPE_MUNICIPALITY},
            {area: {properties: {name: 'Overblaak'}, geometry: [[7,1]]}, name: 'Overblaak', type: Region.TYPE_PLACE},
            {area: {properties: {name: 'Ossdam'}, geometry: [[8,1]]}, name: 'Ossdam', type: Region.TYPE_PLACE},
            {area: {properties: {name: 'Oss'}, geometry: [[9,1]]}, name: 'Oss', type: Region.TYPE_PLACE}
          ]
        );
      }).then(function (result) {
        done();
      }).catch(
        function (error) {
          done(error);
        }
      )
    }
  );

  describe("/show", function () {

    describe("with a matching id", function () {

      var event = {};

      var matchingRegion = {
        area: {properties: {name: 'Nijmegen'}, geometry: [[100, 100]]},
        name: 'Nijmegen',
        type: Region.TYPE_PLACE
      };

      it("should return the Region", function (done) {

        matchingRegion.id = targetId;
        event.id = targetId;

        var context = new MockContext();
        context.then(
          function (context) {

            expect(context.response).toEqual(matchingRegion);

            done();
          }
        ).fail(
          function (error) {
            done(error);
          }
        );

        subject.handler(event, context);
      });

    })

    describe("with a nonmatching id", function () {

      var event = {};

      it("should return null", function (done) {

        event.id = -1;

        var context = new MockContext();
        context.then(
          function (context) {

            expect(context.response).toEqual(null);

            done();
          }
        ).fail(
          function (error) {
            done(error);
          }
        );

        subject.handler(event, context);
      });

    });

  });

});