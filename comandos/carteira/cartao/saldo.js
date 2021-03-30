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
  let total = 0;

  const cartoes = await cartaoExtrato.exec({ lib, competencia });

  for (const cartao of cartoes) {
    total += cartao.total;
    linhas.push(`<pre>${cartao.nome.toUpperCase()} 🗓${competencia || cartao.competencia} R$ ${libLocal.formatReal(cartao.total)}</pre>`);

    !cartao.banco && pendencias.push(`❗️ Define o banco do cartão ${cartao.nome}`);
    !cartao.vencimento && pendencias.push(`❗️ Define o vencimento do cartão ${cartao.nome}`);
    !cartao.competencia && pendencias.push(`❗️ Define a competência do cartão ${cartao.nome}`);
  }

  linhas.push('');
  linhas.push(`🧮 Total R$ ${libLocal.formatReal(total)}`);

  callback(linhas);
  pendencias && pendencias.length > 0 && callback(pendencias);
}

module.exports = {
  alias: ['sld'],
  descricao: 'Mostrar saldo das faturas',
  exec,
}