const request = require('request');
const fs = require('fs');
const readLine = require('readline');
const path = require('path');

if (process.argv.length !== 4) {
  console.log('Usage: node fetcher.js <URL> <localFilePath>');
  process.exit(1);
}

const targetUrl = process.argv[2];
const localFilePath = process.argv[3];

const downloadAndSave = function(url, filePath, callback) {
  request(url, (error, response, body) => {
    if (error) {
      callback(error);
    } else if (response.statusCode !== 200) {
      callback(new Error(`Failed to fetch URL. Status code: ${response.statusCode}`));
    } else {
      checkAndPromptToOverwrite(filePath, body, callback);
    }
  });
};

const checkAndPromptToOverwrite = function(filePath, data, callback) {
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (!err) {
      const rl = readLine.createInterface({
        input:  process.stdin,
        output: process.stdout
      });

      rl.question('File already exists.  Do you want to overwrite it? (Y/N): ', (answer) => {
        rl.close();
        if (answer.toLowerCase() === 'y') {
          writeToFile(filePath, data, callback);
        } else {
          callback(new Error('File not overwritten. Existing the app.'));
        }
      });
    } else {
      writeToFile(filePath, data, callback);
    }
  });
};

const writeToFile = function(filePath, data, callback) {
  fs.writeFile(filePath, data, (err) => {
    if (err) {
      callback(err);
    } else {
      callback(null, data.length);
    }
  });
};

const directory = path.dirname(localFilePath);
fs.access(directory, fs.constants.W_OK, (dirErr) => {
  if (dirErr) {
    console.error(`Invalid directory: ${directory}`);
    process.exit(1);
  }
});

downloadAndSave(targetUrl, localFilePath, (err, bytes) => {
  if (err) {
    console.error('Error: ', err.message);
  } else {
    console.log(`Downloaded and saved ${bytes} bytes to ${localFilePath}`);
  }
});