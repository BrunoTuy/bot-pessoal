const cartaoExtrato = require('../dto/cartaoExtrato.js');

const exec = async ({ subComando, parametros, callback, lib, libLocal }) => {
  const { get, update } = lib.banco;
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
      linhas.push(`${subComando} {id cartão} {id fatura} data {data}`);
      linhas.push(`${subComando} {id cartão} {id fatura} valor {valor em centavos}`);
      linhas.push(`${subComando} {id cartão} {id fatura} tags {+|-} {nome da tag}`);
      linhas.push(`${subComando} {id cartão} {id fatura} competencia {competencia}`);
      linhas.push(`${subComando} {id cartão} {id fatura} descritivo {descritivo}`);
    }

    callback(linhas);
  } else if (parametros.length >= 4) {
    const cartaoId = parametros.shift();
    const faturaId = parametros.shift();
    const tipoDado = parametros.shift().toString().toLowerCase();
    const dado = parametros.join(' ').trim();
    const objSet = {};
    const colecao = 'cartoes_extrato';
    const registro = { cartaoId, _id: faturaId };

    if (tipoDado === 'data') {
      const dataSet = libLocal.entenderData(dado.toString().toLowerCase());

      objSet.data = dataSet.getTime();
      objSet.dataTexto = dataSet;
    } else if (tipoDado === 'valor') {
      objSet.valor = parseInt(dado);
    } else if (tipoDado === 'competencia') {
      const ano = dado.toString().substring(0, 4);
      const mes = dado.toString().substring(4, 6);

      if (dado.length != 6 || ano < 2021 || mes < 1 || mes > 12) {
        callback([
          `Competência ${dado} inválida`,
          'exemplo 202104'
        ]);
      } else {
        objSet.competencia = parseInt(dado);
      }
    } else if (tipoDado === 'descritivo') {
      objSet.descritivo = dado;
    } else if (tipoDado === 'tags') {
      const doc = await get({ colecao, registro });
      const tags = doc.tags || [];
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
          `${subComando} {id cartão} {id fatura} tags {+|-} {nome da tag}`
        ]);        
      }
    } else {
      callback([
        'Parâmetros incorretos.',
        'Você pode alterar data, valor, descritivo e tags'
      ]);
    }

    if (objSet !== {}) {
      await update(({ colecao, registro, set: objSet }));
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
  descricao: 'Editar',
  exec,
}