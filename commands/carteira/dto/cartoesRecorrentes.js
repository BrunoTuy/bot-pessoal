const exec = async ({ lib }) => {
  const lista = [];
  const { db } = lib.firebase;
  const cartoes = await db.collection('cartoes').get();

  for (const cartao of cartoes.docs) {
    const recorrentes = await db.collection('cartoes').doc(cartao.id).collection('recorrente').orderBy('dia').get();
    const obj = {
      ...cartao.data(),
      id: cartao.id,
      lista: []
    };
  
    for (const rec of recorrentes.docs) {
      obj.lista.push({...rec.data(), id: rec.id});
    }

    lista.push(obj);
  }

  return lista;
}

module.exports = { exec };
