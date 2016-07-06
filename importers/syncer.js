var json = JSON.parse(require('fs').readFileSync(__dirname +'/pc_gem_prov.json', 'utf8'));

// Require Logic
var db = require(__dirname + '/../nodejscomponent/lib/models');
var Region = db["Region"];
db.sequelize.sync({force: true});