const fs = require("fs");
const path = require("path");
const list = {};
const excludesFiles = ["index.js", "ivecao.js"];

fs
  .readdirSync(__dirname)
  .filter( ( file )  => (file.indexOf(".") !== 0) && !excludesFiles.includes(file) )
  .forEach( ( file ) => {
    const obj = require(path.join(__dirname, file));
    const name = file.includes('.js') ? file.substring( 0, file.length-3 ) : file;

    if ( obj.alias ) {
      obj.alias.forEach( alias => list[alias] = obj );
    }

    list[name] = obj;
  });

module.exports = list;
