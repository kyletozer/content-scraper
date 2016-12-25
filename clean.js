var fs = require('fs');
var data = require('./data');
var shirtData = data.outputDir + '/' + fs.readdirSync(data.outputDir)[0];

var clean = [
  './scraper-error.log',
  shirtData
];

clean.forEach(function(file){
  if(fs.existsSync(file)){
    fs.unlinkSync(file);
  }
});
