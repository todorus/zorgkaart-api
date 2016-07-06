var fs = require('fs'),
  JSONStream = require('JSONStream'),
  es = require('event-stream'),
  db = require(__dirname + '/../nodejscomponent/lib/models');

var Region = db["Region"];

var jsonData = 'pc_gem_prov.json',
  stream = fs.createReadStream(jsonData, {encoding: 'utf8'}),
  parser = JSONStream.parse('*');

var zipsCache = [];
var placesCache = {};
var municipalityCache = {};
var provinceCache = {};

stream.on('end',function () {
   for(var i = 0; i < zipsCache.length ; i++){
     var region = Region.build();
     region.name = zipsCache[i];
     region.type = Region.TYPE_ZIP;
     region.zips = [zipsCache[i]];
     region.save();
   }
  for (var p in placesCache) {
    var cached = placesCache[p];
    var region = Region.build();
    region.name = cached["name"];
    region.type = Region.TYPE_PLACE;
    region.zips = cached["zips"];
    region.save();
  }
  for (var p in municipalityCache) {
    var cached = municipalityCache[p];
    var region = Region.build();
    region.name = cached["name"];
    region.type = Region.TYPE_MUNICIPALITY;
    region.zips = cached["zips"];
    region.save();
  }
  for (var p in provinceCache) {
    var cached = provinceCache[p];
    var region = Region.build();
    region.name = cached["name"];
    region.type = Region.TYPE_PROVINCE;
    region.zips = cached["zips"];
    region.save();
  }

});

stream
  .pipe(parser)
  .pipe(es.mapSync(function (data) {
    var zip = data["PC"];
    var place = data["PLAATS"];
    var municipality = data["GEMEENTE"];
    var province = data["PROVINCIE"];

    zipsCache.push(zip);

    if(!(place in placesCache)){
      placesCache[place] = {
        id: null,
        name: place,
        zips: []
      };
    }
    placesCache[place]["zips"].push(zip);

    if(!(municipality in municipalityCache)){
      municipalityCache[municipality] = {
        id: null,
        name: municipality,
        zips: []
      };
    }
    municipalityCache[municipality]["zips"].push(zip);

    if(!(province in provinceCache)){
      provinceCache[province] = {
        id: null,
        name: province,
        zips: []
      };
    }
    provinceCache[province]["zips"].push(zip);
  }));

