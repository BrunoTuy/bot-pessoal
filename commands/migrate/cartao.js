const exec = async ({ callback, lib: { firebase: { db }, banco: { insert, list, update } } }) => {
  const colecao = 'cartoes';
  const cartoesFirebase = await db.collection('cartoes').get();
  const cartoesMongo = await list({ colecao });

  const dataMax = new Date();
  dataMax.setDate(dataMax.getDate() + 731);

  callback('Importação do cartão iniciada.');

  for (const cartaoFire of cartoesFirebase.docs) {
    const recorrentesFire = await db.collection('cartoes').doc(cartaoFire.id).collection('recorrente').get();
    const extratoFire = await db.collection('cartoes').doc(cartaoFire.id).collection('fatura').where('data', '<=', dataMax.getTime()).get();
    const cartaoM = cartoesMongo.find(({ _id }) => _id.toString() === cartaoFire.id);
    const recorrente = [];

    for (const rec of recorrentesFire.docs) {
      recorrente.push({...rec.data(), id: rec.id});
    }

    callback([
      `Cartão ${cartaoFire.data().nome}`,
      `Recorrentes: ${recorrentesFire.docs.length}`,
      `Extrato: ${extratoFire.docs.length}`
    ]);

    if (!cartaoM) {
      await insert({ colecao, dados: {
        _id: cartaoFire.id,
        ...cartaoFire.data(),
        recorrente,
        import: true
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

    const extratoMongo = await list({
      colecao: 'cartoes_extrato',
      filtro: { cartaoId: cartaoFire.id }
    });

    for (const mov of extratoFire.docs) {
      const movMongo = extratoMongo.find(({ _id }) => _id.toString() === mov.id);

      if (!movMongo) {
        await insert({
          colecao: 'cartoes_extrato',
          dados: {
            _id: mov.id,
            cartaoId: cartaoFire.id,
            ...mov.data(),
            import: true
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