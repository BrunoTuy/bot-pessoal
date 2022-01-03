const cartaoExtrato = require('../dto/cartaoExtrato.js');

const exec = async ({ subComando, parametros, callback, lib, libLocal }) => {
  const { db } = lib.firebase;
  const data = new Date();
  const competencia = parametros.length > 0 && parametros[0].length === 6 && parametros[0] > 202101
    ? parametros.shift()
    : null;
  const cartao = parametros.shift();
  const linhas = [];
  const pendencias = [];
  const totais = {
    geral: 0,
    avista: 0,
    parcelado: 0,
    recorrente: 0
  };

  const cartoes = await cartaoExtrato.exec({
    lib,
    competencia,
    somenteAtivo: true,
    competenciaAtual: !competencia
  });

  for (const cartao of cartoes) {
    totais.geral += cartao.total;
    totais.avista += cartao.avista;
    totais.parcelado += cartao.parcelado;
    totais.recorrente += cartao.recorrente;

    linhas.push(`💳 ${cartao.nome.toUpperCase()} 🗓 ${competencia || cartao.competencia}`);
    cartao.avista > 0 && linhas.push(`<pre>1️⃣ R$ ${libLocal.formatReal(cartao.avista)} ${(cartao.avista/cartao.total*100).toPrecision(2)}%</pre>`);
    cartao.parcelado > 0 && linhas.push(`<pre>🔢 R$ ${libLocal.formatReal(cartao.parcelado)} ${(cartao.parcelado/cartao.total*100).toPrecision(2)}%</pre>`);
    cartao.recorrente > 0 && linhas.push(`<pre>🔁 R$ ${libLocal.formatReal(cartao.recorrente)} ${(cartao.recorrente/cartao.total*100).toPrecision(2)}%</pre>`);
    linhas.push(`<pre>🧮 R$ ${libLocal.formatReal(cartao.total)}</pre>`);
    linhas.push('');

    !cartao.banco && pendencias.push(`❗️ Define o banco do cartão ${cartao.nome}`);
    !cartao.vencimento && pendencias.push(`❗️ Define o vencimento do cartão ${cartao.nome}`);
    !cartao.competencia && pendencias.push(`❗️ Define a competência do cartão ${cartao.nome}`);
  }

  linhas.push(`<pre>1️⃣ À vista R$ ${libLocal.formatReal(totais.avista)} ${(totais.avista/totais.geral*100).toPrecision(2)}%</pre>`);
  linhas.push(`<pre>🔢 Parcelado R$ ${libLocal.formatReal(totais.parcelado)} ${(totais.parcelado/totais.geral*100).toPrecision(2)}%</pre>`);
  linhas.push(`<pre>🔁 Recorrente R$ ${libLocal.formatReal(totais.recorrente)} ${(totais.recorrente/totais.geral*100).toPrecision(2)}%</pre>`);
  linhas.push(`🧮 Total R$ ${libLocal.formatReal(totais.geral)}`);

  callback(linhas);
  pendencias && pendencias.length > 0 && callback(pendencias);
}

module.exports = {
  alias: ['sld'],
  descricao: 'Mostrar saldo das faturas',
  exec,
}