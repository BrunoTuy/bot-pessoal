const exec = async ({ parametros, callback, lib, libLocal }) => {
  const anoMes = parametros.length > 0 && parametros[0].length === 6 && parametros > 202101 ? parametros.shift() : null;
  const linhas = [];
  const totais = {
    feito: 0,
    previsto: 0,
  };

  const dataMin = new Date();
  const dataMax = new Date();

  dataMin.setDate(1);
  dataMin.setHours(0);
  dataMin.setMinutes(0);
  dataMin.setSeconds(0);
  dataMin.setMilliseconds(0);

  dataMax.setHours(23);
  dataMax.setMinutes(59);
  dataMax.setSeconds(59);
  dataMax.setMilliseconds(999);

  if (anoMes) {
    dataMin.setFullYear(anoMes.toString().substring(0, 4))
    dataMin.setMonth(anoMes.toString().substring(4)-1);

    dataMax.setFullYear(anoMes.toString().substring(0, 4))
    dataMax.setMonth(anoMes.toString().substring(4), 1);
  } else {
    dataMax.setMonth(dataMin.getMonth()+1, 1);
  }

  dataMax.setDate(dataMax.getDate()-1);

  const { db } = lib.firebase;

  const contas = await db.collection('contas').get();
  for (const conta of contas.docs) {
    let feito = 0;
    let previsto = 0;

    const extrato = await db.collection('contas').doc(conta.id).collection('extrato')
      .where('data', '>=', dataMin.getTime())
      .where('data', '<=', dataMax.getTime())
      .orderBy('data')
      .get();
    for (const i of extrato.docs) {
      const { data, status, valor, descritivo } = i.data();

      feito += status === 'feito' ? valor : 0;
      previsto += status.includes('previsto') ? valor : 0;

      const formatStatus = status === 'previsto fixo'
        ? 'PF'
        : status === 'feito'
          ? 'OK'
          : status === 'previsto'
            ? 'PC'
            : 'ND';

      linhas.push(`${libLocal.formatData(data)} ${formatStatus} R$ ${libLocal.formatReal(valor)} - ${descritivo}`);
    }

    totais.feito += feito;
    totais.previsto += previsto;

    extrato.size > 0 && linhas.push(`-- Conta ${conta.data().banco}`)
    extrato.size > 0 && linhas.push(`== Previsto R$ ${libLocal.formatReal(previsto)}`);
    extrato.size > 0 && linhas.push(`== Feito R$ ${libLocal.formatReal(feito)}`);
    extrato.size > 0 && linhas.push(`== Total R$ ${libLocal.formatReal(previsto+feito)}`);
    extrato.size > 0 && linhas.push('');
  }

  linhas.push('------ Geral ------');
  linhas.push(`== Executado R$ ${libLocal.formatReal(totais.feito)}`);
  linhas.push(`== Previsto R$ ${libLocal.formatReal(totais.previsto)}`);
  linhas.push(`== Total R$ ${libLocal.formatReal(totais.feito+totais.previsto)}`);

  callback(linhas);
}

module.exports = {
  alias: ['conta', 'cc', 'ccl'],
  exec,
}