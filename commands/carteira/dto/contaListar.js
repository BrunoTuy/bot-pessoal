const exec = async ({ list, contaNome, somenteAtivo }) => {
  const filtro = {};
  if (somenteAtivo) {
    filtro.ativa = true;
  }
  if (contaNome) {
    filtro.$or = [
      { banco: contaNome },
      { sigla: contaNome }
    ];
  }

  const lista = await list({
    colecao: 'contas',
    filtro
  });

  return lista;
};

module.exports = { exec };
