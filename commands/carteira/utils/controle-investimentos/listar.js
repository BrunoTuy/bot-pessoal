const exec = async ({ callback, parametros, lib, libLocal, bot, original }) => {
  const list = await lib.firebase.db.collection('cofre').get();
  const todos = ['t', 'todos'].includes(parametros.shift());

  list.docs
  .sort((a, b) => {
    const ta = a.data().tipo;
    const tb = b.data().tipo;

    if ((ta === 'CDB' && tb !== 'CDB') || (ta === 'FII' && tb === 'TESOURO')) {
      return 1;
    } else {
      return 0;
    }
  })
  .forEach((i, idx) => {
    const { tipo, lista } = i.data();
    const ativos = lista.filter(({ encerrado }) => !encerrado);
    const encerrados = lista.filter(({ encerrado }) => encerrado);
    const ativosTotal = ativos.reduce((a, { valor }) => a + valor, 0);
    const encerradosTotal = encerrados.reduce((a, { valor }) => a + valor, 0);
    const ativoTexto = `✅ ${ativos.length} R$ ${libLocal.formatReal(ativosTotal)}`;
    const encerradoTexto = `❌ ${encerrados.length} R$ ${libLocal.formatReal(encerradosTotal)}`;

    if (todos || ativos.length > 0) {
      setTimeout(() => 
        bot.sendMessage( original.chat.id, `${i.id} - ${ativos.length > 0 ? ativoTexto : ''} ${encerrados.length > 0 ? encerradoTexto : ''}`, {
          reply_to_message_id: original.message_id,
          reply_markup: JSON.stringify({
            inline_keyboard: [[{
              text: 'Mais informações',
              callback_data: `ut tp v ${i.id}`
            }]]
          })
        }),
      idx*100);
    }
  });
};

module.exports = {
  alias: ['l'],
  exec,
};
