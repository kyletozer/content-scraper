var fs = require('fs');
var Xray = require('x-ray');
var csv = require('json2csv');
var data = require('./data');

var x = Xray();
var url = 'http://www.shirts4mike.com/';
var shirts = new Promise(getShirtData);

var date = data.date;
var outputDir = data.outputDir;


function getShirtData(resolve, reject){
  var shirtData = [];

  // scrapes the page of the specified url for the links to each individual shirt page using node module #1
  x(url + 'shirts.php', '.products', ['a@href'])(function(error, shirtUris){
    if(error){ return reject(error) }

    // loops through each url and scrapes those pages
    shirtUris.forEach(function(shirtUri){

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

        // once all of the shirt data has been retrieved, resolve the promise
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

  function leadingZero(integer){
    return integer.length === 1 ? '0' + integer : integer;
  }

  // converts data into csv-friendly format using node module #2
  var outputData = csv({data: data, fields: Object.keys(data[0])});

  var day = date.getDate().toString();
  var month = (date.getMonth() + 1).toString();
  var year = date.getFullYear().toString();

  // create the output file name string based on the specified project naming convention
  var outputFileName = outputDir + '/' + [leadingZero(day), leadingZero(month), year].join('-') + '.csv';

  // check if files exist in the data folder and remove them
  fs.readdirSync(outputDir).forEach(function(file){
    fs.unlinkSync(outputDir + '/' + file);
  });

  fs.writeFileSync(outputFileName, outputData);
  console.log('Shirt data created!');

}, data.logError); // error handling function that writes to the scraper-error.log file
