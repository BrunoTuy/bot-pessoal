const exec = async ({ competencia, competenciaAtual, dataMin, dataMax, cartao: cartaoNome, lib: { banco: { list } }, tags, dataTotal, somenteAtivo }) => {
  const cartoes = [];
  const filtroCartoes = {};

  if (somenteAtivo) {
    filtroCartoes.ativo = true;
  }
  if (cartaoNome) {
    filtroCartoes.nome = cartaoNome;
  }

  const cartoesBanco = await list({
    colecao: 'cartoes',
    filtro: filtroCartoes
  });

  for (const cartao of cartoesBanco) {
    let total = 0;
    let parcelado = 0;
    let recorrente = 0;
    let avista = 0;
    const fatura = [];

    const filtroExtrato = { cartaoId: cartao._id };

    if (tags && tags.length > 0) {
      filtroExtrato.tags = { $in: tags };
    }

    if (!dataTotal || competencia || competenciaAtual) {
      filtroExtrato.competencia = parseInt(competencia || cartao.competencia);
    }

    if (dataMin && dataMax) {
      filtroExtrato.data = { $gte: dataMin.getTime(), $lte: dataMax.getTime() };
    }

    const extrato = await list({
      colecao: 'cartoes_extrato',
      filtro: filtroExtrato,
      ordem: { data: 1 }
    });

    for (const mov of extrato) {
      const { valor, total_parcelas, parcelas, recorrente: objRecorrente } = mov;
      const ehRecorrente = objRecorrente && objRecorrente !== null && objRecorrente.id;

      total += parseInt(valor);
      recorrente += ehRecorrente ? parseInt(valor) : 0;
      parcelado += !ehRecorrente && (total_parcelas > 1 || parcelas > 1) ? parseInt(valor) : 0;
      avista += !ehRecorrente && (total_parcelas === 1 || parcelas === 1) ? parseInt(valor) : 0;

      fatura.push({
        ...mov,
        id: mov._id,
        tipo: ehRecorrente
          ? 'recorrente'
          : (total_parcelas > 1 || parcelas > 1)
            ? 'parcelado'
            : 'avista'
      });
    }

    cartoes.push({
      ...cartao,
      id: cartao._id,
      fatura,
      total,
      parcelado,
      recorrente,
      avista
    });
  }

  return cartoes;
};

module.exports = { exec };
