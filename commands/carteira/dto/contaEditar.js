const contaEditar = async ({ lib, contaId, extratoId, data }) => {
  const { get, update } = lib.banco;
  const colecao = "contas_extrato";
  const registro = { contaId, _id: extratoId };

  const doc = await get({ colecao, registro });

  if (!doc) {
    throw new Error('Movimento não encontrado.');
  }

  await update({
    colecao,
    registro,
    set: data
  });

  return true;
}

module.exports = contaEditar;
