const exec = async ({ parametros, callback, banco, lib }) => {
  const anoMes = parametros.length > 0 && parametros[0].length === 6 && parametros > 202101 ? parametros.shift() : null;
  const conta = parametros.shift();
  const linhas = [];
  const totais = {
    feito: 0,
    previsto: 0,
    geral: 0
  };

  const data = new Date();
  const dataMax = new Date();

  data.setDate(1);
  data.setHours(0);
  data.setMinutes(0);
  data.setSeconds(0);
  data.setMilliseconds(0);

  dataMax.setHours(23);
  dataMax.setMinutes(59);
  dataMax.setSeconds(59);
  dataMax.setMilliseconds(999);

  if (anoMes) {
    data.setFullYear(anoMes.toString().substring(0, 4))
    data.setMonth(anoMes.toString().substring(4)-1);

    dataMax.setFullYear(anoMes.toString().substring(0, 4))
    dataMax.setMonth(anoMes.toString().substring(4), 1);
  } else {
    dataMax.setMonth(data.getMonth()+1, 1);
  }

  dataMax.setDate(dataMax.getDate()-1);

  const list = await banco.sqlite.all(`
    SELECT *
    FROM carteira_gastos_conta
    WHERE data between ${data.getTime()} AND ${dataMax.getTime()}
    ${conta ? ` AND conta = '${conta}'` : ''}
    ORDER BY data ASC
  `);

  for (const i of list) {
    totais.geral += i.valor;
    totais.feito += i.status === 'feito' ? i.valor : 0;
    totais.previsto += i.status.includes('previsto') ? i.valor : 0;
    const status = i.status === 'previsto fixo'
      ? 'PF'
      : i.status === 'feito'
        ? 'OK'
        : i.status === 'previsto'
          ? 'PC'
          : 'ND';

    linhas.push(`${lib.formatData(i.data)} ${status} R$ ${lib.formatReal(i.valor)} - ${i.conta} - ${i.descritivo}`);
  }

  linhas.push('');
  linhas.push('------ RESUMO ------');
  linhas.push(`Executado R$ ${lib.formatReal(totais.feito)}`);
  linhas.push(`Previsto R$ ${lib.formatReal(totais.previsto)}`);
  linhas.push(`Total R$ ${lib.formatReal(totais.geral)}`);

  callback(linhas);
}

module.exports = {
  alias: ['conta', 'cc', 'ccl'],
  exec,
}