const fs = require("fs");
const path = require("path");
const libLocal = require('./lib/');
const list = {};
const comandos = [];

fs
  .readdirSync(__dirname)
  .filter( ( file )  => (file.indexOf(".") !== 0) && !['index.js', 'lib', 'dto'].includes(file) )
  .forEach( ( file ) => {
    const obj = require(path.join(__dirname, file));
    const name = file.includes('.js') ? file.substring( 0, file.length-3 ) : file;

    if ( obj.alias ) {
      obj.alias.forEach( alias => list[alias] = obj );
    }

    list[name] = obj;

    if (obj.alias.length === 1) {
      !obj.hidden && comandos.push(`${obj.alias[0]} -> ${obj.descricao || name}`);
    } else {
      !obj.hidden && comandos.push(`${name}${obj.alias ? ` -> ${obj.alias.join(' ')}` : ''}`);
    }
  });


module.exports = {
  restricted: true,
  context: true,
  exec: async ({ callback, parametros, ...rest }) => {
    const subComando = parametros && parametros.length > 0
      ? parametros.shift().toLowerCase()
      : false;

    try {
      if (subComando && list[subComando] && list[subComando].exec) {
        await list[subComando].exec({ ...rest, subComando, parametros, callback, libLocal });
      } else {
        callback(['Controle de gastos TuY','',].concat(comandos).join('\n'));
      }
    } catch (e) {
      console.log('--- 3rr0r', e);
      callback('🐞 Erro na execução');
    }
  }
};
