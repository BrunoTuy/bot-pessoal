const cartaoExtrato = require('../dto/cartaoExtrato.js');

const exec = async ({ subComando, parametros, callback, banco, lib, libLocal }) => {
  if (parametros.length === 1) {
    const linhas = [];
    let faturasVazias = true;
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

    linhas.push(`Data ${libLocal.formatData(data)}`);

    const cartoes = await cartaoExtrato.exec({ dataMin, dataMax, lib });

    for (const c of cartoes) {
      for (const f of c.fatura) {
        faturasVazias = false;
        linhas.push(`<pre>${c.id} ${f.id} R$ ${libLocal.formatReal(f.valor)} - ${c.nome} - ${f.competencia} - ${f.descritivo}${f.tags ? ` ${f.tags.map(t => `[${t}]`).join(' ')}` : ''}</pre>`);
        linhas.push('');
      }
    }

    if (faturasVazias) {
      linhas.push('Nenhuma movimentação encontrada nesta data');
    } else {
      linhas.push(`${subComando} {id cartão} {id fatura}`);
    }

    callback(linhas);
  } else if (parametros.length === 2) {
    const { db } = lib.firebase;
    const cartaoId = parametros.shift();
    const faturaId = parametros.shift();

    const docRef = db.collection('cartoes').doc(cartaoId).collection('fatura').doc(faturaId);
    const doc = await docRef.get();

    if (doc.data()) {
      const { data, valor, descritivo, recorrente, tags, total_parcelas, competencia, parcela } = doc.data();

      await docRef.delete();

      callback([
        `Cartão ${cartaoId} Movimento ${faturaId}`,
        `Data ${libLocal.formatData(data)}`,
        `Descritivo ${descritivo} ${tags ? ` ${tags.map(t => `[${t}]`).join(' ')}` : ''}`,
        `RS ${libLocal.formatReal(valor)} ${competencia} ${parcela}/${total_parcelas}`,
        `Recorrente ${recorrente ? 'Sim' : 'Não'}`,
        '✅ Removido'
      ]);
    } else {
      callback('Registro não encontrado');
    }
  } else {
    console.log(parametros);
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