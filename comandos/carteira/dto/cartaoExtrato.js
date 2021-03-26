const exec = async ({ competencia, cartao: cartaoNome, lib }) => {
  const { db } = lib.firebase;
  const cartoes = [];
  const cartoesCollection = await db.collection('cartoes').get();

  for (const cartao of cartoesCollection.docs) {
    if (!cartaoNome || cartaoNome === cartao.data().nome) {
      let total = 0;
      const fatura = [];
      const faturaCollection = await db.collection('cartoes').doc(cartao.id).collection('fatura')
        .where('competencia', '==', parseInt(competencia))
        .orderBy('data')
        .get();

      for (const i of faturaCollection.docs) {
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