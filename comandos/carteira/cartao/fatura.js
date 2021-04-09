const cartaoExtrato = require('../dto/cartaoExtrato.js');

const exec = async ({ subComando, parametros, callback, lib, libLocal }) => {
  const { db } = lib.firebase;
  const data = new Date();
  const competencia = parametros.length > 0 && parametros[0].length === 6 && parametros[0] > 202101
    ? parametros.shift()
    : data.getFullYear()*100+(data.getMonth() > 10
      ? 101
      : data.getMonth()+2);
  const cartao = !['t', 'd'].includes((parametros[0] || '').toLowerCase()) ? parametros.shift() : null;
  const mostrarTags = (parametros.shift() || '').toLowerCase() === 't';
  const mostrarDescricao = (parametros.shift() || '').toLowerCase() === 'd';
  const linhas = [];
  let total = 0;

  linhas.push(`------ ${competencia} ------`);

  const cartoes = await cartaoExtrato.exec({ lib, competencia, cartao });

  data.setHours(1);
  data.setMinutes(0);
  data.setSeconds(0);

  for (const cartao of cartoes) {
    for (const i of cartao.fatura) {
      const dataEvento = new Date(i.data);

      dataEvento.setHours(0);
      dataEvento.setMinutes(0);
      dataEvento.setSeconds(0);

      const status = i.tipo !== 'recorrente' || data.getTime() > dataEvento.getTime()
        ? '✅'
        : '🗓'

      const parcelas = i.total_parcelas > 1
        ? ` ${i.parcela}/${i.total_parcelas}`
        : null;

      const tags = mostrarTags && i.tags && i.tags.length > 0
        ? i.tags.map(t => `[${t}]`).join(' ')
        : null;

      const descricao = mostrarDescricao || !tags
        ? i.descritivo
        : null;

      const tipo = i.tipo === 'recorrente'
        ? '🔁'
        : i.tipo === 'parcelado'
          ? '🔢'
          : '1️⃣';

      linhas.push(`<pre>${status} ${tipo} ${libLocal.formatData(i.data, 'mes-dia')} R$ ${libLocal.formatReal(i.valor)}${parcelas || ''} ${tags || '-'} ${descricao || ''}</pre>`);
    }

    total += cartao.total;
    cartao.fatura.length > 0 && linhas.push(`🧮 ${cartao.nome.toUpperCase()} R$ ${libLocal.formatReal(cartao.total)}`);
    cartao.fatura.length > 0 && linhas.push('');
  }

  linhas.push(`🧮 Total R$ ${libLocal.formatReal(total)}`);

  callback(linhas);
}

module.exports = {
  alias: ['fat'],
  descricao: 'Mostrar faturas',
  exec,
}