const exec = async ({ competencia, dataMin, dataMax, cartao: cartaoNome, lib }) => {
  const { db } = lib.firebase;
  const cartoes = [];
  const cartoesCollection = await db.collection('cartoes').get();

  for (const cartao of cartoesCollection.docs) {
    if ((!cartaoNome || cartaoNome === cartao.data().nome) && (competencia || cartao.data().competencia || (dataMin && dataMax))) {
      let total = 0;
      const fatura = [];
      const faturaCollection = dataMin && dataMax 
        ? db.collection('cartoes').doc(cartao.id).collection('fatura')
          .where('data', '>=', dataMin.getTime())
          .where('data', '<=', dataMax.getTime())
        : db.collection('cartoes').doc(cartao.id).collection('fatura')
          .where('competencia', '==', parseInt(competencia || cartao.data().competencia));

      const list = await faturaCollection
          .orderBy('data')
          .get();

      for (const i of list.docs) {
        fatura.push({...i.data(), id: i.id});
        total += parseInt(i.data().valor);
      }

      cartoes.push({
        ...cartao.data(),
        id: cartao.id,
        fatura,
        total
      });
    }
  }

  return cartoes;
}

module.exports = { exec }