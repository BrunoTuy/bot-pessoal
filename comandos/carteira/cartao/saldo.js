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

  const cartoes = await cartaoExtrato.exec({ lib, competencia });

  for (const cartao of cartoes) {
    totais.geral += cartao.total;
    totais.avista += cartao.avista;
    totais.parcelado += cartao.parcelado;
    totais.recorrente += cartao.recorrente;

    linhas.push(`<b>${cartao.nome.toUpperCase()}</b> 🗓 <pre>${competencia || cartao.competencia}</pre>`);
    linhas.push(`<pre>1️⃣ R$ ${libLocal.formatReal(cartao.avista)}</pre>`);
    linhas.push(`<pre>🔢 R$ ${libLocal.formatReal(cartao.parcelado)}</pre>`);
    linhas.push(`<pre>🔁 R$ ${libLocal.formatReal(cartao.recorrente)}</pre>`);
    linhas.push(`<pre>🧮 R$ ${libLocal.formatReal(cartao.total)}</pre>`);
    linhas.push('');

    !cartao.banco && pendencias.push(`❗️ Define o banco do cartão ${cartao.nome}`);
    !cartao.vencimento && pendencias.push(`❗️ Define o vencimento do cartão ${cartao.nome}`);
    !cartao.competencia && pendencias.push(`❗️ Define a competência do cartão ${cartao.nome}`);
  }

  linhas.push(`1️⃣ À vista R$ ${libLocal.formatReal(totais.avista)}`);
  linhas.push(`🔢 Parcelado R$ ${libLocal.formatReal(totais.parcelado)}`);
  linhas.push(`🔁 Recorrente R$ ${libLocal.formatReal(totais.recorrente)}`);
  linhas.push(`🧮 Total R$ ${libLocal.formatReal(totais.geral)}`);

  callback(linhas);
  pendencias && pendencias.length > 0 && callback(pendencias);
}

module.exports = {
  alias: ['sld'],
  descricao: 'Mostrar saldo das faturas',
  exec,
}