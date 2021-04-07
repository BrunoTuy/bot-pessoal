const exec = async ({ parametros, callback, lib, libLocal }) => {
  const anoMes = parametros.length > 0 && parametros[0].length === 6 && parametros[0] > 202101
    ? parametros.shift()
    : null;
  const linhas = [];
  let total = 0;
  const dataMin = new Date();
  const dataMax = new Date();
  const { db } = lib.firebase;

  if (anoMes) {
    dataMin.setFullYear(anoMes.toString().substring(0, 4))
    dataMin.setMonth(anoMes.toString().substring(4)-1, 1);
    dataMax.setFullYear(anoMes.toString().substring(0, 4))
  }

  dataMin.setDate(1);
  dataMin.setHours(0);
  dataMin.setMinutes(0);
  dataMin.setSeconds(0);
  dataMin.setMilliseconds(0);
  dataMax.setMonth(dataMin.getMonth()+1, 1);
  dataMax.setHours(23);
  dataMax.setMinutes(59);
  dataMax.setSeconds(59);
  dataMax.setMilliseconds(999);
  dataMax.setDate(dataMax.getDate()-1);

  const contas = await db.collection('contas').get();

  anoMes && linhas.push(`-- ${anoMes} --`);
  anoMes && linhas.push('');

  for (const conta of contas.docs) {
    let totalConta = 0;
    const extrato = await db.collection('contas').doc(conta.id).collection('extrato')
      .where('data', '>=', dataMin.getTime())
      .where('data', '<=', dataMax.getTime())
      .where('tags', 'array-contains-any', ['poupanca', 'resgate'])
      .orderBy('data')
      .get();

    for (const e of extrato.docs) {
      const { valor, data } = e.data();
      totalConta += valor*-1;

      linhas.push(`<pre>${libLocal.formatData(data, 'mes-dia')} R$ ${libLocal.formatReal(valor*-1)}</pre>`);
    }

    total += totalConta;

    extrato.size > 0 && linhas.push(`${conta.data().banco.toUpperCase()}  R$ ${libLocal.formatReal(totalConta)}`);
    extrato.size > 0 && linhas.push('');
  }

  linhas.push(`🧮 R$ ${libLocal.formatReal(total)}`);

  callback(linhas);
}

module.exports = {
  alias: ['sld'],
  descricao: 'Mostrar saldo',
  exec,
};
