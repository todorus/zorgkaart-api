var fs = require('fs'),
  JSONStream = require('JSONStream'),
  es = require('event-stream'),
  db = require(__dirname + '/../nodejscomponent/lib/models');

var Region = db["Region"];

var jsonData = 'provincies.geo.json',
  stream = fs.createReadStream(jsonData, {encoding: 'utf8'}),
  parser = JSONStream.parse('*');

stream
  .pipe(parser)
  .pipe(es.mapSync(function (data) {
    {
      var _data = data;
      console.log("data", _data);
      var name = _data["properties"]["Provincien"].replace("-"," ");

      Region.findOne({where: {type: Region.TYPE_PROVINCE, name: name}}).then(
        function (result) {
          if(result == null){
            console.error("result == null for name:",name);
            return;
          }

          _data["properties"] = {
            name: result.name,
            description: result.description,
            type: result.type
          }
          result.area = _data;
          result.save();

        },
        function (error) {
          console.log(error);
        }
      )
    };
  }));
