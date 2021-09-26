const extrato = require('../dto/dinheiroExtrato.js');

const exec = async ({ parametros, callback, lib, libLocal }) => {
  const dataAtual = new Date();
  const anoMes = parametros.length > 0 && parametros[0].length === 6 && parametros[0] > 202101
    ? parametros.shift()
    : parametros.includes('all')
      ? null
      : dataAtual.getFullYear()*100+1+dataAtual.getMonth();
  const mostrarTags = !(parametros.includes('-t'));
  const mostrarDescricao = !(parametros.includes('-d'));
  const linhas = [];
  const dataMin = anoMes ? new Date() : null;
  const dataMax = anoMes ? new Date() : null;

  if (anoMes) {
    const ano = anoMes.toString().substr(0, 4);
    const mes = anoMes.toString().substr(4)-1;

    dataMin.setFullYear(ano);
    dataMin.setMonth(mes, 1);
    dataMin.setHours(0);
    dataMin.setMinutes(0);
    dataMin.setSeconds(0);
    dataMin.setMilliseconds(0);

    dataMax.setFullYear(ano);
    dataMax.setMonth(mes+1, 1);
    dataMax.setHours(23);
    dataMax.setMinutes(59);
    dataMax.setSeconds(59);
    dataMax.setMilliseconds(999);
    dataMax.setDate(dataMax.getDate()-1);
  }

  const extratoExecutado = await extrato.exec({ dataMin, dataMax, lib });

  for (const e of extratoExecutado.lista) {
      const tags = mostrarTags && e.tags && e.tags.length > 0
        ? e.tags.map(t => `[${t}]`).join(' ')
        : null;

      const descricao = mostrarDescricao
        ? e.descritivo
        : null;

      linhas.push(`<pre>${libLocal.formatData(e.data)} R$ ${libLocal.formatReal(e.valor)} ${tags || '-'} ${descricao || ''}</pre>`);
  }

  linhas.push(`🧮 Total R$ ${libLocal.formatReal(extratoExecutado.total)}`);

  callback(linhas);
}

module.exports = {
  alias: ['ext'],
  descricao: 'Mostrar extrato',
  exec,
};
