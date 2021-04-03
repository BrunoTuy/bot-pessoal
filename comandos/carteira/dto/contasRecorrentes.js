const exec = async ({ lib }) => {
  const lista = [];
  const { db } = lib.firebase;
  const contas = await db.collection('contas').get();

  for (const conta of contas.docs) {
    const { banco } = conta.data();
    const recorrentes = await db.collection('contas').doc(conta.id).collection('recorrente').orderBy('dia').get();
    const obj = {
      ...conta.data(),
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
