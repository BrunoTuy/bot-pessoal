const extrato = require('../dto/extrato.js');

const exec = async ({ parametros, callback, lib, libLocal }) => {
  const anoMes = parametros.length > 0 && parametros[0].length === 6 && parametros[0] > 202101
    ? parametros.shift()
    : null;
  const conta = parametros.shift();
  const linhas = [];
  const totais = {
    feito: 0,
    previsto: 0,
  };

  const contas = await extrato.exec({ anoMes, lib, conta });

  for (const c of contas.lista) {
    c.extrato.length > 0 && linhas.push(`-- Conta ${c.banco.toUpperCase()}`)

    for (const e of c.extrato) {
      const formatStatus = e.status === 'previsto fixo'
        ? '🗓'
        : e.status === 'feito'
          ? '✅'
          : e.status === 'previsto'
            ? '🗓'
            : '❓';

      linhas.push(`<pre>${formatStatus} ${libLocal.formatData(e.data, 'dia')} R$ ${libLocal.formatReal(e.valor)} - ${e.descritivo}</pre>`);
    }

    c.extrato.length > 0 && linhas.push(`🧮 R$ ${libLocal.formatReal(c.previsto+c.feito)} (🗓R$${libLocal.formatReal(c.previsto)} ✅R$${libLocal.formatReal(c.feito)})`);
    c.extrato.length > 0 && linhas.push('');
  }

  linhas.push('------ Geral ------');
  linhas.push(`✅ Executado R$ ${libLocal.formatReal(contas.totais.feito)}`);
  linhas.push(`🗓 Previsto R$ ${libLocal.formatReal(contas.totais.previsto)}`);
  linhas.push(`🧮 Total R$ ${libLocal.formatReal(contas.totais.feito+contas.totais.previsto)}`);

  callback(linhas);
}

module.exports = {
  alias: ['ext'],
  descricao: 'Mostrar extrato',
  exec,
};
