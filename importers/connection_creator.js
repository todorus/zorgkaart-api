var fs = require('fs'),
  db = require(__dirname + '/../nodejscomponent/lib/models');

var Region = db["Region"];
var CONTAINS = db["CONTAINS"];

var connectionData = 'postcode-gemeente-tabel.json'
var json = JSON.parse(fs.readFileSync(connectionData, 'utf8'));
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
        console.log("result", result.length > 0);
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
  var municipalityCode = data["Gemeentecode"];
  var zipCode = data['Postcode'];

  var props = {
    parent: {
      type: Region.TYPE_MUNICIPALITY,
      code: municipalityCode
    },
    child: {
      type: Region.TYPE_ZIP,
      code: zipCode
    }
  };

  var contains = CONTAINS.build(props);
  return contains.save();

}
