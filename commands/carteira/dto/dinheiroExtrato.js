const exec = async ({ dataMin, dataMax, lib, tags }) => {
  const { db } = lib.firebase;
  const extrato = [];
  let total = 0;

  const dbCollection = db.collection('dinheiro');
  const dinheiroCollection = tags && tags.length > 0
    ? dbCollection
        .where('tags', 'array-contains-any', tags)
    : dataMin && dataMax 
      ? dbCollection
          .where('data', '>=', dataMin.getTime())
          .where('data', '<=', dataMax.getTime())
      : dbCollection;

  const list = await dinheiroCollection
      .orderBy('data')
      .get();

  for (const i of list.docs) {
    total += parseInt(i.data().valor);

    extrato.push({
      ...i.data(),
      id: i.id,
    });
  }

  return {
    total,
    lista: extrato
  };
}

module.exports = { exec }