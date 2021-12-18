const editar = require('../dto/contaEditar.js');

const exec = async ({ subComando, parametros, callback, lib, libLocal, original, bot }) => {
  const { db } = lib.firebase;

  if (parametros.length === 2) {
    const contaId = parametros.shift();
    const extratoId = parametros.shift();

    await editar({
      lib,
      contaId,
      extratoId,
      data: { status: 'feito' }
    });

    callback('Registro atualizado')
  } else {
    const linhas = [];
    const data = new Date();

    data.setHours(23);
    data.setMinutes(59);
    data.setSeconds(59);
    data.setMilliseconds(999);

    const contas = await db.collection('contas').get();
    for (const conta of contas.docs) {
      const extrato = await db.collection('contas').doc(conta.id).collection('extrato')
        .where('data', '<=', data.getTime())
        .where('status', 'in', ['previsto', 'previsto fixo'])
        .orderBy('data')
        .get();

      for (const i of extrato.docs) {
        const { data, status, valor, descritivo } = i.data();
        const formatStatus = status === 'previsto fixo'
          ? 'PF'
          : 'PC'

        linhas.push([{
          text: `${conta.data().banco.toUpperCase()} ${libLocal.formatData(data)} ${formatStatus} R$ ${libLocal.formatReal(valor)} ${descritivo}`,
          callback_data: `cc xp ${conta.id} ${i.id}`
        }]);
      }
    }

    const opts = {
      reply_to_message_id: original.message_id,
      reply_markup: JSON.stringify({
        inline_keyboard: linhas
      })
    };

    bot.sendMessage( original.chat.id, 'Executar pendência', opts );
  }
}

module.exports = {
  alias: ['xp'],
  descricao: 'Executar pendência',
  exec,
}
