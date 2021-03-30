const fs = require("fs");
const path = require("path");
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
  alias: ['cc'],
  context: true,
  exec: async ({ subComando, callback, comando, contexto, parametros, original, lib, libLocal }) => {
    const subSubComando = parametros && parametros.length > 0
      ? parametros.shift().toLowerCase()
      : 'sld';

    try {
      if (subSubComando && list[subSubComando] && list[subSubComando].exec) {
        await list[subSubComando].exec({ subComando: `${subComando} ${subSubComando}`, parametros, callback, lib, libLocal });
      } 

      if (subSubComando === 'sld' || !list[subSubComando] || !list[subSubComando].exec) {
        callback(['Outros comandos', ''].concat(comandos.map(i => `${subComando} ${i}`)).join('\n'));
      }
    } catch (e) {
      console.log('--- 3rr0r', e);
      callback('Erro na execução');
    }
  }
};
