const exec = async ({ anoMes, lib, conta: contaNome, dataMin: paramDataMin, dataMax: paramDataMax, tags, dataTotal, somenteAtivo }) => {
  const lista = [];
  const totais = {
    feito: 0,
    previsto: 0,
  };

  const dataMin = paramDataMin || new Date();
  const dataMax = paramDataMax || new Date();

  if (!paramDataMin && !dataTotal) {
    if (anoMes) {
      dataMin.setFullYear(anoMes.toString().substring(0, 4))
      dataMin.setMonth(anoMes.toString().substring(4)-1, 1);
    }

    dataMin.setDate(1);
    dataMin.setHours(0);
    dataMin.setMinutes(0);
    dataMin.setSeconds(0);
    dataMin.setMilliseconds(0);
  }

  if (!paramDataMax && !dataTotal) {
    if (anoMes) {
      dataMax.setFullYear(anoMes.toString().substring(0, 4))
      dataMax.setMonth(anoMes.toString().substring(4), 1);
    } else {
      dataMax.setMonth(dataMin.getMonth()+1, 1);
    }

    dataMax.setHours(23);
    dataMax.setMinutes(59);
    dataMax.setSeconds(59);
    dataMax.setMilliseconds(999);
    dataMax.setDate(dataMax.getDate()-1);
  }

  const { db } = lib.firebase;
  const contasCollection = somenteAtivo
    ? db.collection('contas').where('ativa', '==', true)
    : db.collection('contas');
  const contas = await contasCollection.get();

  for (const conta of contas.docs) {
    if (contaNome && contaNome !== conta.data().banco) {
      continue;
    }

    let feito = 0;
    let previsto = 0;
    const extratoLista = [];
    const dbCollection = db.collection('contas').doc(conta.id).collection('extrato');
    let extratoCollection = tags && tags.length > 0
      ? dbCollection.where('tags', 'array-contains-any', tags)
      : dbCollection;

    if (dataMin && dataMax) {
      extratoCollection = extratoCollection
        .where('data', '>=', dataMin.getTime())
        .where('data', '<=', dataMax.getTime());
    }

    const extrato = await extratoCollection
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
