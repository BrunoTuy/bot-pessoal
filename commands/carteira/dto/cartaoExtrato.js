const exec = async ({ competencia, dataMin, dataMax, cartao: cartaoNome, lib, tags, dataTotal, somenteAtivo }) => {
  const { db } = lib.firebase;
  const cartoes = [];
  const cartoesCollection = somenteAtivo
    ? db.collection('cartoes').where('ativo', '==', true)
    : db.collection('cartoes');
  const cartoesList = await cartoesCollection.get();

  for (const cartao of cartoesList.docs) {
    if ((!cartaoNome || cartaoNome === cartao.data().nome) && (competencia || cartao.data().competencia || (dataMin && dataMax))) {
      let total = 0;
      let parcelado = 0;
      let recorrente = 0;
      let avista = 0;
      const fatura = [];
      const dbCollection = db.collection('cartoes').doc(cartao.id).collection('fatura');
      let faturaCollection = tags && tags.length > 0
        ? dbCollection
            .where('tags', 'array-contains-any', tags)
        : dataTotal
          ? dbCollection
          : dbCollection
              .where('competencia', '==', parseInt(competencia || cartao.data().competencia));

      if (!dataTotal && dataMin && dataMax) {
        faturaCollection = faturaCollection
          .where('data', '>=', dataMin.getTime())
          .where('data', '<=', dataMax.getTime());
      }

      const list = await faturaCollection
          .orderBy('data')
          .get();

      for (const i of list.docs) {
        const ehRecorrente = i.data().recorrente && i.data().recorrente !== null && i.data().recorrente.id;

        total += parseInt(i.data().valor);
        recorrente += ehRecorrente ? parseInt(i.data().valor) : 0;
        parcelado += !ehRecorrente && i.data().total_parcelas > 1 ? parseInt(i.data().valor) : 0;
        avista += !ehRecorrente && i.data().total_parcelas === 1 ? parseInt(i.data().valor) : 0;

        fatura.push({
          ...i.data(),
          id: i.id,
          tipo: ehRecorrente
            ? 'recorrente'
            : i.data().total_parcelas > 1
              ? 'parcelado'
              : 'avista'
        });
      }

      cartoes.push({
        ...cartao.data(),
        id: cartao.id,
        fatura,
        total,
        parcelado,
        recorrente,
        avista
      });
    }
  }

  return cartoes;
}

module.exports = { exec }