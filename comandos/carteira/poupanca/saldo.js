const consultarPoupanca = require('../dto/poupancaExtrato.js');

const exec = async ({ parametros, callback, lib, libLocal }) => {
  const anoMes = parametros.length > 0 && parametros[0].length === 6 && parametros[0] > 202101
    ? parametros.shift()
    : null;
  const linhas = [];
  let total = 0;

  anoMes && linhas.push(`-- ${anoMes} --`);
  anoMes && linhas.push('');

  const contas = await consultarPoupanca.exec({ anoMes, lib });

  for (const conta of contas) {
    total += conta.total;
    linhas.push(`<pre>${conta.banco.toUpperCase()} R$ ${libLocal.formatReal(conta.total)}</pre>`);
  }

  linhas.push(`🧮 R$ ${libLocal.formatReal(total)}`);

  callback(linhas);
}

module.exports = {
  alias: ['sld'],
  descricao: 'Mostrar saldo',
  exec,
};
