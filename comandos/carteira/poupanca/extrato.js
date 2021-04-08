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
    for (const e of conta.extrato) {
      const { valor, data, status } = e;
      const formatStatus = status === 'feito'
        ? '✅'
        : '🗓';

      linhas.push(`<pre>${formatStatus} ${libLocal.formatData(data, 'mes-dia')} R$ ${libLocal.formatReal(valor*-1)}</pre>`);
    }

    total += conta.total;
    linhas.push(`🧮 ${conta.banco.toUpperCase()} R$ ${libLocal.formatReal(conta.total)}`);
    linhas.push('')
  }

  linhas.push(`🧮 R$ ${libLocal.formatReal(total)}`);

  callback(linhas);
}

module.exports = {
  alias: ['ext'],
  descricao: 'Mostrar saldo',
  exec,
};
