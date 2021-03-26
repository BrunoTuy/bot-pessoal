const exec = async ({ anoMes, lib }) => {
  const lista = [];
  const totais = {
    feito: 0,
    previsto: 0,
  };

  const dataMin = new Date();
  const dataMax = new Date();

  dataMin.setFullYear(anoMes.toString().substring(0, 4))
  dataMin.setMonth(anoMes.toString().substring(4)-1);
  dataMin.setDate(1);
  dataMin.setHours(0);
  dataMin.setMinutes(0);
  dataMin.setSeconds(0);
  dataMin.setMilliseconds(0);

  dataMax.setFullYear(anoMes.toString().substring(0, 4))
  dataMax.setMonth(anoMes.toString().substring(4), 1);
  dataMax.setHours(23);
  dataMax.setMinutes(59);
  dataMax.setSeconds(59);
  dataMax.setMilliseconds(999);
  dataMax.setDate(dataMax.getDate()-1);

  const { db } = lib.firebase;
  const contas = await db.collection('contas').get();

  for (const conta of contas.docs) {
    let feito = 0;
    let previsto = 0;
    const extratoLista = [];
    const extrato = await db.collection('contas').doc(conta.id).collection('extrato')
      .where('data', '>=', dataMin.getTime())
      .where('data', '<=', dataMax.getTime())
      .orderBy('data')
      .get();

    for (const i of extrato.docs) {
      const { data, status, valor, descritivo } = i.data();

      feito += status === 'feito' ? parseInt(valor) : 0;
      previsto += status !== 'feito' ? parseInt(valor) : 0;

      extratoLista.push({...i.data(), id: i.id});
    }

    totais.feito += feito;
    totais.previsto += previsto;

    lista.push({
      ...conta.data(),
      id: conta.id,
      feito,
      previsto,
      extrato: extratoLista
    });
  }

  return {
    totais,
    lista
  }
};

module.exports = { exec };
