const extrato = require('../dto/extrato.js');

const exec = async ({ parametros, callback, lib, libLocal }) => {
  const anoMes = parametros.length > 0 && parametros[0].length === 6 && parametros[0] > 202101
    ? parametros.shift()
    : null;
  const conta = !['t', 'd'].includes((parametros[0] || '').toLowerCase()) ? parametros.shift() : null;
  const mostrarTags = (parametros.shift() || '').toLowerCase() === 't';
  const mostrarDescricao = (parametros.shift() || '').toLowerCase() === 'd';
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

      const tags = mostrarTags && e.tags && e.tags.length > 0
        ? e.tags.map(t => `[${t}]`).join(' ')
        : null;

      const descricao = mostrarDescricao || !tags
        ? e.descritivo
        : null;

      linhas.push(`<pre>${formatStatus} ${libLocal.formatData(e.data, 'dia')} R$ ${libLocal.formatReal(e.valor)} ${tags || '-'} ${descricao}</pre>`);
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
