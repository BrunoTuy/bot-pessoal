const exec = async ({ lib: { firebase: { db }, banco: { insert, list } } }) => {
  const colecao = 'financiamento_pessoal';
  const fpFirebase = await db.collection('fp').get();
  const fpMongo = await list({ colecao });

  for (const fFire of fpFirebase.docs) {
    const fMongo = fpMongo.find(({ _id }) => _id.toString() === fFire.id);

    if (!fMongo) {
      await insert({ colecao, dados: {
        _id: fFire.id,
        ...fFire.data(),
        import: true
      } });
    }
  }
};

module.exports = {
  alias: ['cfp'],
  descricao: 'Carteira financiamento pessoal',
  exec,
}