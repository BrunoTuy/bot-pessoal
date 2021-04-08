const exec = async ({ anoMes, lib }) => {
  const dataMin = new Date();
  const dataMax = new Date();
  const { db } = lib.firebase;
  const listaContas = [];

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

  for (const conta of contas.docs) {
    let totalConta = 0;
    const lista = [];
    const extrato = await db.collection('contas').doc(conta.id).collection('extrato')
      .where('data', '>=', dataMin.getTime())
      .where('data', '<=', dataMax.getTime())
      .where('tags', 'array-contains-any', ['poupanca', 'resgate'])
      .orderBy('data')
      .get();

    for (const e of extrato.docs) {
      const { valor } = e.data();
      totalConta += valor*-1;

      lista.push({
        ...e.data(),
        id: e.id
      });
    }

    extrato.size > 0 && listaContas.push({
      ...conta.data(),
      id: conta.id,
      extrato: lista,
      total: totalConta
    });
  }

  return listaContas;
};

module.exports = { exec };
