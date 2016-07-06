require('../../spec_helper.js');

var db = require("../../../nodejscomponent/lib/models");
var Region = db["Region"];

describe("Region", function () {


  describe("toJson", function () {

    describe("when provided with an array", function () {

      it("should rename _id to id", function () {
        var regionData = [
          {
            _id: 12,
            name: "name",
            description: "description",
            code: "11121",
            type: "Munipalicty"
          }
        ];

        var expected = [
          {
            code: "11121",
            description: "description",
            id: 12,
            name: "name",
            type: "Munipalicty"
          }
        ];

        expect(Region.toJson(regionData)).toEqual(expected);
      });

    });

    describe("when provided with an object", function () {

      it("should rename _id to id", function () {
        var regionData = {
          _id: 12,
          name: "name",
          description: "description",
          code: "11121",
          type: "Munipalicty"
        };

        var expected = {
          code: "11121",
          description: "description",
          id: 12,
          name: "name",
          type: "Munipalicty"
        }

        expect(Region.toJson(regionData)).toEqual(expected);
      });

    });

    describe("when area is a string", function () {

      it("should parse the area to JSON", function () {
        var regionData = {
          _id: 12,
          name: "name",
          description: "description",
          code: "11121",
          type: "Munipalicty",
          area: "{\"test\":true}"
        };

        var expected = {
          area: { test: true },
          code: "11121",
          description: "description",
          id: 12,
          name: "name",
          type: "Munipalicty"
        }

        expect(Region.toJson(regionData)).toEqual(expected);
      });

    });

  })

});