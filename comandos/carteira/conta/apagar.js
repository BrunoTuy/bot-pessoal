const extrato = require('../dto/extrato.js');

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

    const contas = await extrato.exec({ dataMin, dataMax, lib });

    for (const c of contas.lista) {
      for (const e of c.extrato) {
        faturasVazias = false;
        linhas.push(`<pre>${c.id} ${e.id} R$ ${libLocal.formatReal(e.valor)} - ${c.banco} - ${e.descritivo}${e.tags ? ` ${e.tags.map(t => `[${t}]`).join(' ')}` : ''}</pre>`);
        linhas.push('');
      }
    }

    if (faturasVazias) {
      linhas.push('Nenhuma movimentação encontrada nesta data');
    } else {
      linhas.push(`${subComando} {id conta} {id movimentação}`);
    }

    callback(linhas);
  } else if (parametros.length === 2) {
    const { db } = lib.firebase;
    const contaId = parametros.shift();
    const movimentoId = parametros.shift();

    const docRef = db.collection('contas').doc(contaId).collection('extrato').doc(movimentoId);
    const doc = await docRef.get();

    if (doc.data()) {
      const { data, valor, descritivo, recorrente, tags } = doc.data();

      await docRef.delete();

      callback([
        `Conta ${contaId} Movimento ${movimentoId}`,
        `Data ${libLocal.formatData(data)}`,
        `Descritivo ${descritivo} ${tags ? ` ${tags.map(t => `[${t}]`).join(' ')}` : ''}`,
        `RS ${libLocal.formatReal(valor)}`,
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