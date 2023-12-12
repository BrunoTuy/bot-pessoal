const cartaoExtrato = require('../dto/cartaoExtrato.js');

const exec = async ({ parametros, callback, lib, libLocal }) => {
  const data = new Date();
  const competencia = parametros.length > 0 && parametros[0].length === 6 && parametros[0] > 202101
    ? parametros.shift()
    : data.getFullYear()*100+(data.getMonth() > 10
      ? 101
      : data.getMonth()+2);
  const cartao = (parametros[0] || '').indexOf('!') === 0 ? null : parametros.shift();
  const linhas = [];
  let total = 0;
  const ttGeral = {};

  linhas.push(`------ ${competencia} ------`);

  const cartoes = await cartaoExtrato.exec({ lib, competencia, cartao });

  for (const cartao of cartoes) {
    const tt = {};
    cartao.fatura.length > 0 && linhas.push(`💳 ${cartao.nome.toUpperCase()}`);
    for (const i of cartao.fatura) {
        i.tags.forEach(t => {
          if (!tt[t]) {
            tt[t] = 0;
          }

          if (!ttGeral[t]) {
            ttGeral[t] = 0;
          }

          tt[t] += i.valor;
          ttGeral[t] += i.valor;
        });
    }

    Object.entries(tt).forEach(([name, value]) => linhas.push(`🏳 ${name} R$ ${libLocal.formatReal(value)}`));
    total += cartao.total;
    cartao.fatura.length > 0 && linhas.push(`🧮 R$ ${libLocal.formatReal(cartao.total)}`);
    cartao.fatura.length > 0 && linhas.push('');
  }

  Object.entries(ttGeral).forEach(([name, value]) => linhas.push(`🏴 ${name} R$ ${libLocal.formatReal(value)}`));
  linhas.push(`🧮 Total R$ ${libLocal.formatReal(total)}`);

  callback(linhas);
};

module.exports = {
  alias: ['tt'],
  descricao: 'Total faturas tags',
  exec,
};
