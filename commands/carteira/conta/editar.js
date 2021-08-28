const extrato = require('../dto/extrato.js');
const editar = require('../dto/contaEditar.js');

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

    linhas.push(`Data ${libLocal.formatData(data)}`);

    const contas = await extrato.exec({ dataMin, dataMax, lib });

    for (const c of contas.lista) {
      for (const e of c.extrato) {
        extratosVazios = false;
        linhas.push(`<pre>${c.id} ${e.id} R$ ${libLocal.formatReal(e.valor)} - ${c.banco} - ${e.descritivo}${e.tags ? ` ${e.tags.map(t => `[${t}]`).join(' ')}` : ''}</pre>`);
        linhas.push('');
      }
    }

    if (extratosVazios) {
      linhas.push('Nenhuma movimentação encontrada nesta data');
    } else {
      linhas.push(`${subComando} {id conta} {id extrato} data {data}`);
      linhas.push(`${subComando} {id conta} {id extrato} valor {valor em centavos}`);
      linhas.push(`${subComando} {id conta} {id extrato} tags {+|-} {nome da tag}`);
      linhas.push(`${subComando} {id conta} {id extrato} descritivo {descritivo}`);
    }

    callback(linhas);
  } else if (parametros.length >= 4) {
    const { db } = lib.firebase;
    const contaId = parametros.shift();
    const extratoId = parametros.shift();
    const tipoDado = parametros.shift().toString().toLowerCase();
    const dado = parametros.join(' ').trim();
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
    } else if (tipoDado === 'tags') {
      const doc = await docRef.get();
      const tags = doc.data().tags || [];
      const operacao = dado.substring(0, 1);
      const tag = dado.substring(1).trim();

      if (operacao === '-') {
        objSet.tags = tags.filter(t => t.toLowerCase() !== tag.toLowerCase());
      } else if (operacao === '+') {
        objSet.tags = tags;
        objSet.tags.push(tag);
      } else {
        callback([
          'Parâmetros incorretos.',
          'Você pode adicionar ou remover uma tag',
          `${subComando} {id conta} {id extrato} tags {+|-} {nome da tag}`
        ]);        
      }
    } else {
      callback([
        'Parâmetros incorretos.',
        'Você pode alterar data, valor, descritivo e tags'
      ]);
    }

    if (objSet !== {}) {
      await editar({ lib, contaId, extratoId, data: objSet });
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
  alias: ['e'],
  descricao: 'Editar movimento',
  exec,
}