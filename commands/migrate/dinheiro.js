const exec = async ({ lib: { firebase: { db }, banco: { insert, list } } }) => {
  const colecao = 'dinheiro_extrato';
  const dinheiroFirebase = await db.collection('dinheiro').get();
  const dinheiroMongo = await list({ colecao });

  for (const dinFire of dinheiroFirebase.docs) {
    const dinheiroM = dinheiroMongo.find(({ _id }) => _id.toString() === dinFire.id);

    if (!dinheiroM) {
      await insert({ colecao, dados: {
        _id: dinFire.id,
        ...dinFire.data(),
        import: true
      } });
    }
  }
};

module.exports = {
  alias: ['cd'],
  descricao: 'Carteira dinheiro',
  exec,
}