const fs = require("fs");
const path = require("path");

const getStruct = ({
  dir,
  description,
  restricted,
  hasContext,
  label,
  alias,
  commandWhenEmpty,
  commandsShowList = [],
  exclude = []
}) => {
  const list = {};
  const comandos = [];

  exclude.push('index.js');

  fs
    .readdirSync(dir)
    .filter( ( file )  => (file.indexOf(".") !== 0) && file.indexOf("_") !== 0 && ![exclude].includes(file) )
    .forEach( ( file ) => {
      const obj = require(path.join(dir, file));
      const name = file.includes('.js') ? file.substring( 0, file.length-3 ) : file;

      list[name] = obj;

      if ( obj.alias ) {
        obj.alias.forEach( alias => list[alias] = obj );

        if (obj.alias.length === 1) {
          !obj.hidden && comandos.push(`${obj.alias[0]} -> ${obj.descricao || name}`);
        } else {
          !obj.hidden && comandos.push(`${name}${obj.alias ? ` -> ${obj.alias.join(' ')}` : ''}`);
        }
      }
    });

  const exec = async ({ subComando, callback, parametros, comando, ...rest }) => {
    const subSubComando = parametros && parametros.length > 0
      ? parametros.shift().toLowerCase()
      : commandWhenEmpty;

    try {
      if (subSubComando && list[subSubComando] && list[subSubComando].exec) {
        await list[subSubComando].exec({ ...rest, subComando: `${subComando} ${subSubComando}`, parametros, callback });
      } 

      if (commandsShowList.includes(subSubComando) || !list[subSubComando] || !list[subSubComando].exec) {
        callback([(label || 'Outros comandos'), ''].concat(comandos.map(i => `<pre>${hasContext ? '' : `/${subComando || comando} `}${i}</pre>`)).join('\n'));
      }
    } catch (e) {
      console.log('--- 3rr0r', e);
      callback('Erro na execução');
    }
  };

  return {
    alias,
    hasContext,
    description,
    restricted,
    exec,
    context: hasContext,
    descricao: description,
    commandWhenEmpty
  }
};

module.exports = getStruct;
