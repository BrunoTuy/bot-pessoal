const buscarMovimento = require('./_buscarMovimento.js');

const exec = async ({ callback, parametros, lib, subComando, original, bot }) => {
  const { db } = lib.firebase;
  const list = await db.collection('fp').get();

  if (parametros.length < 1) {
    const linhas = list.docs.map(i => ([{
      text: i.data().descritivo,
      callback_data: `${subComando} ${i.id}`
    }]));

    bot.sendMessage( original.chat.id, 'Editar financiamento', {
      reply_to_message_id: original.message_id,
      reply_markup: JSON.stringify({
        inline_keyboard: linhas
      })
    });
  } else if (parametros.length < 3) {
    const linhas = [];
    const financiamentoId = parametros.shift();

    if (list.docs.filter(({ id }) => id === financiamentoId)) {
      linhas.push('Para cadastrar ou remover débitos use:');
      linhas.push(`<pre>${subComando} ${financiamentoId} +/-d {dm/codigo conta} {codigo movimento}</pre>`);
      linhas.push('');
      linhas.push('Para cadastrar ou remover creditos use:');
      linhas.push(`<pre>${subComando} ${financiamentoId} +/-c {dm/codigo conta} {codigo movimento}</pre>`);
      linhas.push('');
      linhas.push('Para alterar o descritivo:');
      linhas.push(`<pre>${subComando} ${financiamentoId} d {texto}</pre>`);
    } else {
      linhas.push('Nenhum financiamento com o código informado.');
    }

    callback(linhas);
  } else {
    const codigo = parametros.shift();
    const operacao = parametros.shift();
    const fpRef = db.collection('fp').doc(codigo);
    const fpData = (await fpRef.get()).data();

    if (fpData === 'undefined') {
      return callback('Financiamento não encontrado.');
    }

    const dataSet = {};

    if (operacao === 'd') {
      dataSet.descritivo = parametros.join(' ');
    } else if (parametros.length < 2) {
      return callback('Comando incompleto');
    } else if (['-d', '+d', '-c', '+c'].includes(operacao)) {
      const conta = parametros.shift();
      const movimento = parametros.shift();
      const force = parametros.shift();
      const doc = await buscarMovimento(lib, conta, movimento);

      if (!doc) {
        callback('Movimento não encontrado.');
      } else if (!force && doc.data.fp && !['-d', '-c'].includes(operacao)) {
        callback('Movimento já vinculado a um financiamento.');
      } else {
        dataSet.debitos = fpData.debitos || [];
        dataSet.creditos = fpData.creditos || [];

        if (operacao === '-d') {
          dataSet.debitos = dataSet.debitos.filter((i) => i.id !== movimento || i.conta !== conta);
        } else if (operacao === '-c') {
          dataSet.creditos = dataSet.creditos.filter((i) => i.id !== movimento || i.conta !== conta);
        } else if (operacao === '+d') {
          dataSet.debitos.push(doc.data);
        } else {
          dataSet.creditos.push(doc.data);
        }

        const movSet = {
          fp: operacao[0] === '-' ? null : codigo,
          tags: doc.data.tags || [],
        };

        if (operacao[0] === '-') {
          movSet.tags = movSet.tags.filter(i => !['fp', 'fp gasto', 'fp credito'].includes(i));
        } else {
          if (!movSet.tags.includes('fp')) {
            movSet.tags.push('fp');
          }

          if (operacao === '+d' && !movSet.tags.includes('fp gasto')) {
            movSet.tags.push('fp gasto');
          } else if (operacao === '+c' && !movSet.tags.includes('fp credito')) {
            movSet.tags.push('fp credito');
          }
        }

        await doc.ref.update(movSet);
      }
    } else {
      callback('Comando não reconhecido');
    }

    if (dataSet === {}){
      callback('Financiamento não atualizado.');
    } else {
      await fpRef.update(dataSet);

      callback('Financiamento atualizado com sucesso.');
    }
  }
};

module.exports = {
  alias: ['e'],
  exec,
};
