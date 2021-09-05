const qualLocalizacao = async ({ lib, callback, bot, chat }) => {
  const { db } = lib.firebase;
  const list = await db.collection('findme').get();

  list.docs.forEach(async i => {
    const { lastUnixTime, nome, latitude, longitude, dono, permitido, solicitado } = i.data();
    const data = new Date(lastUnixTime*1000);

    if (dono === chat.id || (permitido || []).find(i => i.id === chat.id)) {
      callback(`Ultima atualização de ${nome} foi ${data}`);
      bot.sendLocation( chat.id, latitude, longitude);
    } else {
      callback([
        'Você não tem permissão para receber essa informação.',
        '',
        'Uma mensagem foi enviada ao responsavel solicitando a permissão.'
      ]);

      if (!solicitado || !solicitado.find(i => i && i.id === chat.id)) {
        bot.sendMessage( dono, [
          `${chat.first_name} (@${chat.username}) quer acessar a sua localização.`,
          'Para liberar envie o comando abaixo',
          '',
          `<pre>/onde liberar ${i.id} ${chat.id}</pre>`].join('\n'),
         {parse_mode : "HTML"}
        );

        const novoSolicitado = (solicitado || []).concat([{
          ...chat,
          at: new Date()
        }]);

        await db.collection('findme').doc(i.id).update({ solicitado: novoSolicitado });
      }
    }
  });
};

module.exports = qualLocalizacao;

