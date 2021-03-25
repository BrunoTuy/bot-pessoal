const exec = async ({ lib }) => {
  const retorno = {
    contas: [],
    cartoes: [],
    geral: []
  };

  const { db } = lib.firebase;

  const contas = await db.collection('contas').get();

  for (const conta of contas.docs) {
    const lista = [];
    const { banco } = conta.data();
    const recorrentes = await db.collection('contas').doc(conta.id).collection('recorrente').orderBy('dia').get();
  
    for (const rec of recorrentes.docs) {
      lista.push({...rec.data(), id: rec.id});
      retorno.geral.push({...rec.data(), recId: rec.id, paiId: conta.id, tipo: 'contas'});
    }

    retorno.contas.push({id: conta.id, nome: banco, lista});
  }

  const cartoes = await db.collection('cartoes').get();

  for (const cartao of cartoes.docs) {
    const lista = [];
    const { nome } = cartao.data();
    const recorrentes = await db.collection('cartoes').doc(cartao.id).collection('recorrente').orderBy('dia').get();
  
    for (const rec of recorrentes.docs) {
      lista.push({...rec.data(), id: rec.id});
      retorno.geral.push({...rec.data(), recId: rec.id, paiId: cartao.id, tipo: 'cartoes'});
    }

    retorno.cartoes.push({id: cartao.id, nome, lista});
  }

  return retorno;
}

module.exports = { exec };
