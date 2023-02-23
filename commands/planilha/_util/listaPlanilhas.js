const exec = async ({ lib, user }) => {
  const { db } = lib.firebase;
  const planilhas = await db.collection('planilhas').get();
  const dados = [];

  for (const item of planilhas.docs) {
    const data = item.data();

    if (data.criadaPor === user.id) {
      dados.push({
        ...data,
        id: item.id
      });
    }
  }

  return dados;
};


module.exports = { exec };
