const exec = async ({ callback, lib: { firebase: { db }, banco: { insert, list, update } } }) => {
  const colecao = 'cartoes';
  const cartoesFirebase = await db.collection('cartoes').get();
  const cartoesMongo = await list({ colecao });

  for (const cartaoFire of cartoesFirebase.docs) {
    const recorrentesFire = await db.collection('cartoes').doc(cartaoFire.id).collection('recorrente').get();
    const extratoFire = await db.collection('cartoes').doc(cartaoFire.id).collection('fatura').get();
    const cartaoM = cartoesMongo.find(({ _id }) => _id.toString() === cartaoFire.id);
    const recorrente = [];

    for (const rec of recorrentesFire.docs) {
      recorrente.push({...rec.data(), id: rec.id});
    }

    if (!cartaoM) {
      await insert({ colecao, dados: {
        _id: cartaoFire.id,
        ...cartaoFire.data(),
        recorrente
      } });
    } else {
      await update({
        colecao,
        registro: { _id: cartaoFire.id },
        set: {
          ...cartaoFire.data(),
          recorrente
        }
      });
    }

    for (const mov of extratoFire.docs) {
      const extratoMongo = await list({
        colecao: 'cartoes_extrato',
        filtro: { cartaoId: cartaoFire.id }
      });
      const movMongo = extratoMongo.find(({ _id }) => _id.toString() === mov.id);

      if (!movMongo) {
        await insert({ 
          colecao: 'cartoes_extrato',
          dados: {
            _id: mov.id,
            cartaoId: cartaoFire.id,
            ...mov.data(),
          }
        });
      }
    }
  }
};

module.exports = {
  alias: ['ccd'],
  descricao: 'Carteira cartão',
  exec,
}