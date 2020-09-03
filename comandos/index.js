const fs = require("fs");
const path = require("path");
const list = {};

fs
  .readdirSync(__dirname)
  .filter( ( file )  => (file.indexOf(".") !== 0) && (file !== "index.js") )
  .forEach( ( file ) => {
    const obj = require(path.join(__dirname, file));
    const name = file.substring( 0, file.length-3 );

    if ( obj.alias ) {
      obj.alias.forEach( alias => list[alias] = obj );
    }

    list[name] = obj;
  });

module.exports = list;
