const exec = async ({ subComando, parametros, callback, lib, libLocal, original, bot }) => {
  const list = await lib.firebase.db.collection('cofre').get();

  if (parametros.length < 1) {
    const linhas = [];

    list.docs.forEach(i => {
      i.data().lista.forEach(({ datas, valor, encerrado }, idx) => {
        if (!encerrado) {
          const dataSaida = datas.saida
            ? ` -> ${libLocal.formatData(datas.saida._seconds*1000)}`
            : '';
          linhas.push([{
            text: `${i.id} ${libLocal.formatData(datas.entrada._seconds*1000)}${dataSaida} R$ ${libLocal.formatReal(valor)}`,
            callback_data: `${subComando} !i:${i.id} !x:${idx}`,
          }]);
        }
      });
    });

    bot.sendMessage( original.chat.id, 'Sair de qual?', {
      reply_to_message_id: original.message_id,
      reply_markup: JSON.stringify({
        inline_keyboard: linhas
      })
    });
  } else {
    const parametrosTexto = parametros.join(' ');
    const id = libLocal.capturarParametro(parametrosTexto, 'i');
    const idx = libLocal.capturarParametro(parametrosTexto, 'x');
    const valor = libLocal.capturarParametro(parametrosTexto, 'v');
    const data = libLocal.capturarParametro(parametrosTexto, 'd');

    if (!id || !idx) {
      callback('Comando não reconhecido.');
    } else if (!valor || !data) {
      callback([
        'Para sair você deve informar o valor e data de saída',
        '',
        `<pre>${subComando} !i:${id} !x:${idx} !v:valor em centavos !d:data</pre>`
      ]);
    } else {
      const ativo = list.docs.find(l => id === l.id);
      const { lista } = ativo.data();

      if (!ativo || lista.length >= idx+1) {
        callback('Ativo não reconhecido.');
      } else if (['CDB', 'TESOURO'].includes(ativo.data().tipo)) {
        const docRef = lib.firebase.db.collection('cofre').doc(`${id}`);

        lista[idx].encerrado = true;
        lista[idx].datas.saida = libLocal.entenderData(data);
        lista[idx].datas.valorSaida = libLocal.entenderValor({ val: valor, naoInverte: true });

        docRef.update({ lista });

        callback('Ativo atualizado.');
      } else {
        callback('Não sei sair desse tipo.');
      }
    }
  }
};

module.exports = {
  alias: ['s'],
  exec,
};
