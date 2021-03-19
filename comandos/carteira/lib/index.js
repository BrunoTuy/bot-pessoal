const fs = require("fs");
const path = require("path");
const list = {};

fs
  .readdirSync(__dirname)
  .filter( ( file )  => (file.indexOf(".") !== 0) && !['index.js'].includes(file) )
  .forEach( ( file ) => {
    const obj = require(path.join(__dirname, file));
    const name = file.includes('.js') ? file.substring( 0, file.length-3 ) : file;

    list[name] = obj;
  });

module.exports = list;
