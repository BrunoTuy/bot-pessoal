const exec = async ({ subComando, parametros, callback, banco, lib }) => {
  const data = new Date();
  const competencia = parametros.length > 0 && parametros[0].length === 6 && parametros > 202101
    ? parametros.shift()
    : data.getFullYear()*100+(data.getMonth() > 10
      ? 101
      : data.getMonth()+2);
  const cartao = parametros.shift();
  const linhas = [];
  const totais = {
    geral: 0
  };

  const list = await banco.sqlite.all(`
    SELECT *
    FROM carteira_gastos_cartao
    WHERE competencia = ${competencia}
    ${cartao ? ` AND cartao = '${cartao}'` : ''}
    ORDER BY data ASC
  `);

  linhas.push(`------ ${competencia} ------`);

  for (const i of list) {
    totais.geral += i.valor;
    totais[i.cartao] = (totais[i.cartao] || 0) + i.valor;

    linhas.push(`${lib.formatData(i.data)} R$ ${lib.formatReal(i.valor)}${i.cartao} ${i.total_parcelas > 1 ? ` ${i.parcela}/${i.total_parcelas}` : ''} - ${i.descritivo}`);
  }

  linhas.push('');
  linhas.push('------ RESUMO ------');

  for (const i of Object.keys(totais)) {
    if (i !== 'geral') {
      linhas.push(`${i} R$ ${lib.formatReal(totais[i])}`);
    }
  }

  linhas.push(`Total R$ ${lib.formatReal(totais.geral)}`);

  callback(linhas);
}

module.exports = {
  alias: ['cartao', 'card', 'cd', 'cdl'],
  exec,
}