const exec = async ({ callback, lib }) => {
  callback('Comunicar com o firestone');

  try {
    const { db } = lib.firebase;
    const snapshot = await db.collection('cartoes').get();

    await snapshot.forEach((doc) => {
      console.log(doc.id, '=>', doc.data());
      callback(`${doc.id} => ${JSON.stringify(doc.data())}`);
    });

    callback('Fim da busca');
  } catch (e) {
    console.log('--- error', e);
    callback('Erro na busca');
  }
}

module.exports = {
  restricted: true,
  exec
};
