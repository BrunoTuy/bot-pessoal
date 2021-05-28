const extrato = require('../dto/dinheiroExtrato.js');

const exec = async ({ parametros, callback, lib, libLocal }) => {
  const anoMes = parametros.length > 0 && parametros[0].length === 6 && parametros[0] > 202101
    ? parametros.shift()
    : null;
  const linhas = [];

  const extratoExecutado = await extrato.exec({ lib });

  for (const e of extratoExecutado.lista) {
      const tags = e.tags && e.tags.length > 0
        ? e.tags.map(t => `[${t}]`).join(' ')
        : null;

      const descricao = e.descritivo;

      linhas.push(`<pre>${libLocal.formatData(e.data, 'dia')} R$ ${libLocal.formatReal(e.valor)} ${tags || '-'} ${descricao || ''}</pre>`);
  }

  linhas.push(`🧮 Total R$ ${libLocal.formatReal(extratoExecutado.total)}`);

  callback(linhas);
}

module.exports = {
  alias: ['ext'],
  descricao: 'Mostrar extrato',
  exec,
};
