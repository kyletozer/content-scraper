var outputDir = './data';

// responsible for outputting the error log file
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

function leadingZero(integer){
  return integer.length === 1 ? '0' + integer : integer;
}

module.exports = {
  outputDir: outputDir,
  logError: logError,
  leadingZero: leadingZero
};
