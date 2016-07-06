require('../../spec_helper.js');

var subject = require("../../../nodejscomponent/regions/fetch/handler.js");
var db = require("../../../nodejscomponent/lib/models");
var Region = db["Region"];
var Utils = db["Utils"];

describe("/regions", function () {

  before(
    function (done) {
      Utils.wipe().then(
        function(result){
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
              {area: {properties: {name: 'Oss'}, geometry: [[9,1]]}, name: 'Oss', type: Region.TYPE_PLACE},

              {area: {properties: {name: 'blib'}, geometry: [[10,1]]}, name: 'blib', type: Region.TYPE_MUNICIPALITY}
            ]
          );
        }
      ).then(
        function (result) {
          done();
        }
      ).catch(
        function (error) {
          done(error);
        }
      )
    }
  )

  describe("/all", function () {

    var event = {
    };

    var matchingResult = {
      pages: {
        current: 0,
        total: 1
      },
      data: [
        {area: {properties: {name: 'bijdeMaas'}, geometry: [[3,1]]}, name: 'bijdeMaas', type: Region.TYPE_MUNICIPALITY},
        {area: {properties: {name: 'blib'}, geometry: [[10,1]]}, name: 'blib', type: Region.TYPE_MUNICIPALITY},
        {area: {properties: {name: 'blob'}, geometry: [[5,1]]}, name: 'blob', type: Region.TYPE_MUNICIPALITY},
        {area: {properties: {name: 'blub'}, geometry: [[4,1]]}, name: 'blub', type: Region.TYPE_MUNICIPALITY},
        {area: {properties: {name: 'Maasdamn'}, geometry: [[2,1]]}, name: 'Maasdamn', type: Region.TYPE_PLACE},
        {area: {properties: {name: 'Maasland'}, geometry: [[6,1]]}, name: 'Maasland', type: Region.TYPE_MUNICIPALITY},
        {area: {properties: {name: 'Maastricht'}, geometry: [[1,1]]}, name: 'Maastricht', type: Region.TYPE_PLACE},
        {area: {properties: {name: 'Oss'}, geometry: [[9,1]]}, name: 'Oss', type: Region.TYPE_PLACE},
        {area: {properties: {name: 'Ossdam'}, geometry: [[8,1]]}, name: 'Ossdam', type: Region.TYPE_PLACE},
        {area: {properties: {name: 'Overblaak'}, geometry: [[7,1]]}, name: 'Overblaak', type: Region.TYPE_PLACE}
      ]
    };

    it("should return a list of all Regions ordered by name", function (done) {
      var context = new MockContext()
      context.then(
        function (context) {

          if(context.error != null){
            done(error);
            return;
          }

          filterIds(context.response.data);

          expect(context.response).toEqual(matchingResult);

          done();
        }
      ).fail(
        function(error){
          done(error);
        }
      );

      subject.handler(event, context);
    });

  })

  describe("search", function () {

    describe("when a match is found for a query", function () {

      it("should return a list of the results ordered by length", function (done) {
        var event = {
          query: "oss"
        };

        var matchingResult = {
          pages: {
            current: 0,
            total: 1
          },
          data: [
            {area: {properties: {name: 'Oss'}, geometry: [[9,1]]}, name: 'Oss', type: Region.TYPE_PLACE},
            {area: {properties: {name: 'Ossdam'}, geometry: [[8,1]]}, name: 'Ossdam', type: Region.TYPE_PLACE}
          ]
        };

        var context = new MockContext()
        context.then(
          function (context) {

            if(context.error != null){
              done(error);
              return;
            }

            filterIds(context.response.data);

            expect(context.error).toBe(null);
            expect(context.response).toEqual(matchingResult);

            done();
          }
        ).fail(
          function(error){
            done(error);
          }
        );

        subject.handler(event, context);
      });

      it("should return a list of the results ordered by name", function (done) {
        var event = {
          query: "maas"
        }

        var matchingResult = {
          pages: {
            current: 0,
            total: 1
          },
          data: [
            {area: {properties: {name: 'Maasdamn'}, geometry: [[2,1]]}, name: 'Maasdamn', type: Region.TYPE_PLACE},
            {area: {properties: {name: 'Maasland'}, geometry: [[6,1]]}, name: 'Maasland', type: Region.TYPE_MUNICIPALITY},
            {area: {properties: {name: 'Maastricht'}, geometry: [[1,1]]}, name: 'Maastricht', type: Region.TYPE_PLACE}
          ]
        }

        var context = new MockContext()
        context.then(
          function (context) {

            if(context.error != null){
              done(error);
              return;
            }

            filterIds(context.response.data);

            expect(context.error).toBe(null);
            expect(context.response).toEqual(matchingResult);

            done();
          }
        ).fail(
          function(error){
            done(error);
          }
        );

        subject.handler(event, context);
      });

    })

    describe("when no match is found for a query", function () {

      var event = {
        query: "qii"
      }

      var matchingResult = {
        pages: {
          current: 0,
          total: 1
        },
        data: [
        ]
      }

      it("should return an empty list", function (done) {
        var context = new MockContext()
        context.then(
          function (context) {

            if(context.error != null){
              done(error);
              return;
            }

            filterIds(context.response.data);

            expect(context.error).toBe(null);
            expect(context.response).toEqual(matchingResult);

            done();
          }
        ).fail(
          function(error){
            done(error);
          }
        );

        subject.handler(event, context);
      })

    })

  })

  describe("pagination", function () {

    describe("without a page", function () {

      var event = {
        limit: 2
      };

      var matchingResult = {
        pages: {
          current: 0,
          total: 5
        },
        data: [
          {area: {properties: {name: 'bijdeMaas'}, geometry: [[3,1]]}, name: 'bijdeMaas', type: Region.TYPE_MUNICIPALITY},
          {area: {properties: {name: 'blib'}, geometry: [[10,1]]}, name: 'blib', type: Region.TYPE_MUNICIPALITY}
        ]
      };

      it("should return a list of the first n Regions ordered by name", function (done) {
        var context = new MockContext()
        context.then(
          function (context) {

            if(context.error != null){
              done(error);
              return;
            }

            filterIds(context.response.data);

            expect(context.error).toBe(null);
            expect(context.response).toEqual(matchingResult);

            done();
          }
        ).fail(
          function(error){
            done(error);
          }
        );

        subject.handler(event, context);
      });

    })

    describe("with a page", function () {

      // page has a zero index
      var event = {
        limit: 2,
        page: 1
      }

      var matchingResult = {
        pages: {
          current: 1,
          total: 5
        },
        data: [
          {area: {properties: {name: 'blob'}, geometry: [[5,1]]}, name: 'blob', type: Region.TYPE_MUNICIPALITY},
          {area: {properties: {name: 'blub'}, geometry: [[4,1]]}, name: 'blub', type: Region.TYPE_MUNICIPALITY}
        ]
      };

      it("should return a list of n Regions ordered by name starting from the supplied page", function (done) {
        var context = new MockContext()
        context.then(
          function (context) {

            if(context.error != null){
              done(error);
              return;
            }

            filterIds(context.response.data);

            expect(context.error).toBe(null);
            expect(context.response).toEqual(matchingResult);

            done();
          }
        ).fail(
          function(error){
            done(error);
          }
        );

        subject.handler(event, context);
      });

    })
  })

  describe("search and limit", function () {

    var event = {
      query: "maas",
      limit: 2
    };

    var matchingResult = {
      pages: {
        current: 0,
        total: 2
      },
      data: [
        {area: {properties: {name: 'Maasdamn'}, geometry: [[2,1]]}, name: 'Maasdamn', type: Region.TYPE_PLACE},
        {area: {properties: {name: 'Maasland'}, geometry: [[6,1]]}, name: 'Maasland', type: Region.TYPE_MUNICIPALITY}
      ]
    };

    it("should return a list of n Regions ordered by name", function (done) {
      var context = new MockContext()
      context.then(
        function (context) {

          if(context.error != null){
            done(error);
            return;
          }

          filterIds(context.response.data);

          expect(context.error).toBe(null);
          expect(context.response).toEqual(matchingResult);

          done();
        }
      ).fail(
        function(error){
          done(error);
        }
      );

      subject.handler(event, context);
    });

  })
});