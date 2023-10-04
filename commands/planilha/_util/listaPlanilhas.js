const exec = async ({ lib: { banco }, user }) => {
  const planilhas = await banco.list({
    colecao: 'planilhas',
    filtro: { criadaPor: user.id }
  });

  return planilhas.map(i => ({
    ...i,
    id: i._id.toString()
  }));
};

module.exports = { exec };
