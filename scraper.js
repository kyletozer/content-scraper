var fs = require('fs');
var Xray = require('x-ray');
var csv = require('json2csv');
var data = require('./data');

var x = Xray();
var url = 'http://www.shirts4mike.com/';
var shirts = new Promise(getShirtData);
var date = new Date();

var outputDir = data.outputDir;


function getShirtData(resolve, reject){
  var shirtData = [];

  // scrapes shirts.php for shirt urls using node module #1
  x(url + 'shirts.php', '.products', ['a@href'])(function(error, shirtUris){
    if(error){ return reject(error) }

    // loops through array of shirt urls and scrapes each of those pages for the desired content
    shirtUris.forEach(function(shirtUri){

      // creates an object containing all of the shirt data using the specified fields
      x(shirtUri, {
        'Title': '.section h1',
        'Price': '.price',
        'Image URL': '.section img@src'

      })(function(error, data){
        if(error) { return reject(error) }

        data.URL = shirtUri;
        data.Title = data.Title.replace(data.Price + ' ', '');
        data.Time = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

        shirtData.push(data);

        // once all of the shirt data has been collected, resolve the promise
        if(shirtData.length === shirtUris.length){
          return resolve(shirtData);
        }
      });
    });
  });
}

// create the data folder in the specified location if it does not already exist
if(!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}


shirts.then(function(data){
  // properly formats file into csv using node module #2
  var outputData = csv({data: data, fields: Object.keys(data[0])});
  var leadingZero = data.leadingZero;

  var day = date.getDate().toString();
  var month = (date.getMonth() + 1).toString();
  var year = date.getFullYear().toString();

  // generates a string of the name formatting required for the csv file
  var outputFileName = outputDir + '/' + [leadingZero(day), leadingZero(month), year].join('-') + '.csv';

  // removes any older files in the data folder before outputting the newest one
  fs.readdirSync(outputDir).forEach(function(file){
    fs.unlinkSync(outputDir + '/' + file);
  });

  fs.writeFileSync(outputFileName, outputData);
  console.log('Shirt data created!');

}, data.logError); // error file output handling function
