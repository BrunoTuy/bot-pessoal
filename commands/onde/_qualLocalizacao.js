const qualLocalizacao = async ({ lib, callback, bot, chat }) => {
  const { db } = lib.firebase;
  const list = await db.collection('findme').get();

  list.docs.forEach(async i => {
    const { lastUnixTime, nome, latitude, longitude, dono, permitido } = i.data();
    const data = new Date(lastUnixTime*1000);

    if (dono === chat.id || (permitido || []).includes(chat.id)) {
      callback(`Ultima atualização de ${nome} foi ${data}`);
      bot.sendLocation( chat.id, latitude, longitude);
    } else {
      callback([
        'Você não tem permissão para receber essa informação.',
        '',
        'Uma mensagem foi enviada ao responsavel solicitando a permissão.'
      ]);

      bot.sendMessage( dono, `${chat.first_name} (@${chat.username}) quer acessar a sua localização.\nPara liberar envie o comando abaixo\n\n<pre>/onde liberar ${i.id} ${chat.id}</pre>`, {parse_mode : "HTML"} );
    }
  });
};

module.exports = qualLocalizacao;

