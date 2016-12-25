var fs = require('fs');
var Xray = require('x-ray');
var csv = require('json2csv');
var outputDir = require('./data').outputDir;

var x = Xray();
var url = 'http://www.shirts4mike.com/';
var shirts = new Promise(getShirtData);
var date = new Date();


function logError(error){
  var outputStr = '';

  var weekdays = [
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
  ];

  var months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  for(var key in error){
    outputStr += key + ': ' + error[key] + '\n';
  }

  outputStr = [weekdays[date.getDay()], months[date.getMonth()], date.getDate().toString(), date.getYear().toString(), date.toLocaleTimeString()].join(' ') + '\n' + outputStr;

  fs.writeFileSync('./scraper-error.log', outputStr);
  return console.log('There was an error, check the log for more details.');
}


function getShirtData(resolve, reject){
  var shirtData = [];

  x(url + 'shirts.php', '.products', ['a@href'])(function(error, shirtUris){
    if(error){ return logError(error) }

    shirtUris.forEach(function(shirtUri){

      x(shirtUri, {
        'Title': '.section h1',
        'Price': '.price',
        'Image URL': '.section img@src'

      })(function(error, data){
        if(error) { return logError(error) }

        data.URL = shirtUri;
        data.Title = data.Title.replace(data.Price + ' ', '');
        data.Time = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

        shirtData.push(data);

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

  var outputData = csv({data: data, fields: Object.keys(data[0])});

  var day = date.getDate().toString();
  var month = (date.getMonth() + 1).toString();
  var year = date.getFullYear().toString();

  var outputFileName = outputDir + '/' + [leadingZero(day), leadingZero(month), year].join('-') + '.csv';

  fs.writeFileSync(outputFileName, outputData);
  console.log('Shirt data created!');
});
