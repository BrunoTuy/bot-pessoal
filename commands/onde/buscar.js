const atualizar = require('./_atualizar.js');
const qualLocalizacao = require('./_qualLocalizacao.js');

const exec = async ({ bot, lib, callback, original }) => {
  callback('Espera um pouco');

  await atualizar({ lib, callback });
  setTimeout(() => qualLocalizacao({ lib, callback, bot, chat: original.chat }), 30000);
};

module.exports = {
  alias: ['bs'],
  descricao: 'Buscar localização do caba',
  exec,
}