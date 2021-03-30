const extrato = require('../dto/extrato.js');

const exec = async ({ parametros, callback, lib, libLocal }) => {
  const anoMes = parametros.length > 0 && parametros[0].length === 6 && parametros[0] > 202101
    ? parametros.shift()
    : null;
  const linhas = [];
  const totais = {
    feito: 0,
    previsto: 0,
  };

  const contas = await extrato.exec({ anoMes, lib });

  for (const c of contas.lista) {
    linhas.push(`<pre>${c.banco.toUpperCase()} 🧮R$ ${libLocal.formatReal(c.previsto+c.feito)} (🗓R$${libLocal.formatReal(c.previsto)} ✅R$${libLocal.formatReal(c.feito)})</pre>`);
  }

  linhas.push('');
  linhas.push(`✅ Executado R$ ${libLocal.formatReal(contas.totais.feito)}`);
  linhas.push(`🗓 Previsto R$ ${libLocal.formatReal(contas.totais.previsto)}`);
  linhas.push(`🧮 Total R$ ${libLocal.formatReal(contas.totais.feito+contas.totais.previsto)}`);

  callback(linhas);
}

module.exports = {
  alias: ['sld'],
  descricao: 'Mostrar saldos',
  exec,
};
