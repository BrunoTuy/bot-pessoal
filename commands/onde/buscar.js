const atualizar = require('./_atualizar.js');
const qualLocalizacao = require('./_qualLocalizacao.js');

const exec = async ({ bot, lib, callback, original }) => {
  const linhas = [];
  callback('Espera um pouco');

  // const { data } = await axios.get('https://api.findmespot.com/spot-main-web/consumer/rest-api/2.0/public/feed/0jUmQZXslELM6bprRM1fTD6zBEf6EzLoD/message.xml');
  // const jsonResponse = xmlParser.toJson(data, { object: true });

  // console.log('-- json', jsonResponse);
  // console.log('-- response.feedMessageResponse.feed', jsonResponse.response.feedMessageResponse.feed);
  // console.log('-- message', jsonResponse.response.feedMessageResponse.messages.message[0]);

  // const { latitude, longitude } = jsonResponse.response.feedMessageResponse.messages.message[0];

  // console.log('-- { latitude, longitude }', { latitude, longitude });
  // bot.sendLocation( original.chat.id, latitude, longitude);

  await atualizar({ lib, callback });
  qualLocalizacao({ lib, callback, bot, chat: original.chat });
};

module.exports = {
  alias: ['bs'],
  descricao: 'Buscar gastos por tag',
  exec,
}