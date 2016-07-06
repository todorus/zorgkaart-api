var fs = require('fs'),
  JSONStream = require('JSONStream'),
  es = require('event-stream'),
  db = require(__dirname + '/../nodejscomponent/lib/models');

var Region = db["Region"];


var gemJsonData = 'gemeentes.geo.json',
  gemStream = fs.createReadStream(gemJsonData, {encoding: 'utf8'}),
  parser = JSONStream.parse('*');

gemStream.on('end', importZips);

gemStream
  .pipe(parser)
  .pipe(es.mapSync(function (data) {
    {
      var _data = data;
      console.log("data", _data);
      var name = _data["properties"]["gemeentena"];
      var code = _data["properties"]["code"];

      Region.findOrCreate({where: {code: code, type: Region.TYPE_MUNICIPALITY, name: name}})
        .spread(function(result, created) {
            if(result == null){
              console.error("result == null for name:",name);
              return;
            }

            _data["properties"] = {
              id: result.id,
              name: name,
              description: null,
              type: Region.TYPE_MUNICIPALITY
            }
            result.area = _data;
            result.save();

          }
        )
    };
  }));

function importZips(){
  var zipJsonData = 'postcodes.geo.json',
    zipStream = fs.createReadStream(zipJsonData, {encoding: 'utf8'}),
    parser = JSONStream.parse('*');

  zipStream
    .pipe(parser)
    .pipe(es.mapSync(function (data) {
      {
        var _data = data;
        var name = _data["properties"]["PC4"].toString();
        var code = _data["properties"]["PC4"];

        Region.findOrCreate({where: {code: code, type: Region.TYPE_ZIP, name: name}})
          .spread(function(result, created) {
              if(result == null){
                console.error("result == null for name:",name);
                return;
              }

              _data["properties"] = {
                id: result.id,
                name: name,
                description: null,
                type: Region.TYPE_ZIP
              }
              result.area = _data;
              result.save();

            }
          )
      };
    }));
}
