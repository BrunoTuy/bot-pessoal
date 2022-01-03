const exec = async ({ callback, lib, libLocal, bot, original }) => {
  const list = await lib.firebase.db.collection('cofre').get();

  list.docs.forEach(i => {
    const { tipo, lista } = i.data();
    const ativos = lista.filter(({ encerrado }) => !encerrado);
    const encerrados = lista.filter(({ encerrado }) => encerrado);
    const ativosTotal = ativos.reduce((a, { valor }) => a + valor, 0);
    const encerradosTotal = encerrados.reduce((a, { valor }) => a + valor, 0);
    const ativoTexto = `✅ ${ativos.length} R$ ${libLocal.formatReal(ativosTotal)}`;
    const encerradoTexto = `❌ ${encerrados.length} R$ ${libLocal.formatReal(encerradosTotal)}`;

    bot.sendMessage( original.chat.id, `${i.id} - ${ativos.length > 0 ? ativoTexto : ''} ${encerrados.length > 0 ? encerradoTexto : ''}`, {
      reply_to_message_id: original.message_id,
      reply_markup: JSON.stringify({
        inline_keyboard: [[{
          text: 'Mais informações',
          callback_data: `ut tp v ${i.id}`        
        }]]
      })
    });
  });
};

module.exports = {
  alias: ['l'],
  exec,
};
