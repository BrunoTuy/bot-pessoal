const exec = async ({ lib: { banco: { list } } }) => {
  const lista = [];
  const cartoes = await list({
    colecao: 'cartoes',
    filtro: { ativo: true }
  });

  for (const cartao of cartoes) {
    const { recorrente } = cartao;
  
    lista.push({
      ...cartao,
      id: cartao._id,
      lista: recorrente
    });
  }

  return lista;
}

module.exports = { exec };
