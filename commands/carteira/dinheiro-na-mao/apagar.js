const extrato = require('../dto/dinheiroExtrato.js');

const exec = async ({ subComando, parametros, callback, lib, libLocal, original, bot }) => {
  if (parametros.length === 1 && parametros[0].length < 10) {
    const linhas = [];
    const data = libLocal.entenderData(parametros.shift());
    const dataMin = new Date(data);
    const dataMax = new Date(data);

    dataMin.setHours(0);
    dataMin.setMinutes(0);
    dataMin.setSeconds(0);
    dataMin.setMilliseconds(0);

    dataMax.setHours(23);
    dataMax.setMinutes(59);
    dataMax.setSeconds(59);
    dataMax.setMilliseconds(999);

    const extratoExecutado = await extrato.exec({ dataMin, dataMax, lib });

    for (const e of extratoExecutado.lista) {
      const tags = e.tags && e.tags.length > 0
        ? e.tags.map(t => `[${t}]`).join(' ')
        : null;

      const descricao = e.descritivo;

      linhas.push([{
        text: `R$ ${libLocal.formatReal(e.valor)} ${tags || '-'} ${descricao || ''}`,
        callback_data: `dm del ${e.id}`,
      }]);
    }

    if (linhas.length > 0) {
      bot.sendMessage( original.chat.id, 'Apagar movimentação', {
        reply_to_message_id: original.message_id,
        reply_markup: JSON.stringify({
          inline_keyboard: linhas
        })
      });
    } else {
      callback([
        `Data ${libLocal.formatData(data)}`,
        'Nenhuma movimentação encontrada nesta data'
      ]);
    }

    callback(linhas);
  } else if (parametros.length > 0) {
    const { db } = lib.firebase;
    const movimentoId = parametros.shift();

    const docRef = db.collection('dinheiro').doc(movimentoId);
    const doc = await docRef.get();

    if (doc.data()) {
      const { data, valor, descritivo, tags } = doc.data();

      callback([
        `Movimento ${movimentoId}`,
        `Data ${libLocal.formatData(data)}`,
        `R$ ${libLocal.formatReal(valor)}`,
        `Descritivo ${descritivo} ${tags ? ` ${tags.map(t => `[${t}]`).join(' ')}` : ''}`
      ]);

      await docRef.delete();

      callback('✅ Removido');
    } else {
      callback('Registro não encontrado');
    }
  } else {
    callback([
      'Exemplo do comando abaixo',
      `${subComando} {data}`
    ]);
  }
}

module.exports = {
  alias: ['del'],
  descricao: 'Apagar',
  exec,
}