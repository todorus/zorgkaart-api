var fs = require('fs'),
  db = require(__dirname + '/../nodejscomponent/lib/models');

var Region = db["Region"];
var CONTAINS = db["CONTAINS"];

var jsonData = 'gemeentes.geo.json';
var json = JSON.parse(fs.readFileSync(jsonData, 'utf8'));
var index = -1;

increment();


function increment(){
  index++;
  if(index >= json.length){
    return;
  }

  process(index)
    .then(
      function (result) {
        increment();
      }
    ).catch(
    function (error) {
      console.error(error);
      increment();
    }
  )
}

function process(i) {
  var data = json[i];
  var name = data["properties"]["gemeentena"];
  var code = data["properties"]["code"].toString();

  return Region.findOrCreate({
    name: name,
    type: Region.TYPE_MUNICIPALITY,
    code: code
  }).then(
    function (result) {
      var region = result[0];
      region.set("description", null);

      var area = data;
      area["properties"] = {
        id: region.data["_id"],
        name: name,
        description: null,
        type: Region.TYPE_MUNICIPALITY
      };
      region.set("area", JSON.stringify(area));

      return region.save();
    }
  ).then(
    function (result) {
      console.log("result", result);
    }
  ).catch(
    function (error) {
      console.error(error);
    }
  );

}


