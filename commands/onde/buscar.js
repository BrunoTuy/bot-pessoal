const atualizar = require('./_atualizar.js');
const qualLocalizacao = require('./_qualLocalizacao.js');

const exec = async ({ bot, lib, callback, original }) => {
  callback('Espera um pouco');

  await atualizar({ lib, callback });
  qualLocalizacao({ lib, callback, bot, chat: original.chat });
};

module.exports = {
  alias: ['bs'],
  descricao: 'Buscar localização do caba',
  exec,
}