const extrato = require('./dto/extrato.js');

const exec = async ({ subComando, parametros, callback, banco, lib, libLocal }) => {
  if (parametros.length === 1) {
    const linhas = [];
    let extratosVazios = true;
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

    const contas = await extrato.exec({ dataMin, dataMax, lib });

    for (const c of contas.lista) {
      for (const e of c.extrato) {
        extratosVazios = false;
        linhas.push(`<pre>${c.id} ${e.id} R$ ${libLocal.formatReal(e.valor)} - ${c.banco} - ${e.descritivo}</pre>`);
        linhas.push('');
      }
    }

    if (extratosVazios) {
      linhas.push(`Nenhuma movimentação encontrada no dia ${libLocal.formatData(data)}`);
    } else {
      linhas.push(`${subComando} {id conta} {id extrato} data {data}`);
      linhas.push(`${subComando} {id conta} {id extrato} valor {valor em centavos}`);
      linhas.push(`${subComando} {id conta} {id extrato} descritivo {descritivo}`);
    }

    callback(linhas);
  } else if (parametros.length >= 4) {
    const { db } = lib.firebase;
    const contaId = parametros.shift();
    const extratoId = parametros.shift();
    const tipoDado = parametros.shift().toString().toLowerCase();
    const dado = parametros.join(' ');
    const objSet = {};
    const docRef = db.collection('contas').doc(contaId).collection('extrato').doc(extratoId);

    if (tipoDado === 'data') {
      const dataSet = libLocal.entenderData(dado.toString().toLowerCase());

      objSet.data = dataSet.getTime();
      objSet.dataTexto = dataSet;
    } else if (tipoDado === 'valor') {
      objSet.valor = dado.substring(dado.length-1) === 'c'
        ? dado.substring(0, dado.length-1)
        : dado*-1;
    } else if (tipoDado === 'descritivo') {
      objSet.descritivo = dado;
    } else {
      callback([
        'Parâmetros incorretos.',
        'Você pode alterar data, valor e descritivo'
      ]);
    }

    if (objSet !== {}) {
      docRef.update(objSet);
      callback('Registro atualizado com sucesso.');
    }
  } else {
    callback([
      'Exemplo do comando abaixo',
      `${subComando} {data}`
    ]);
  }
}

module.exports = {
  alias: ['caj', 'ccaj'],
  exec,
}