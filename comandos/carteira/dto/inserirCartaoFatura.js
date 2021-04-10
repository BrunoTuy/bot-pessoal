const exec = async ({ lib, params, callback }) => {
  const { cartao, data, valor, descritivo, parcela, parcelas, competencia, recorrente, tags } = params;
  const obj = await lib.firebase.db.collection('cartoes').doc(cartao).collection('fatura');
  const retorno = await obj.add({
    descritivo,
    competencia,
    dataTexto: data,
    tags: tags || [],
    data: data.getTime(),
    valor: parseInt(valor),
    parcela: parseInt(parcela) || 1,
    total_parcelas: parseInt(parcelas) || 1,
    recorrente: recorrente || null
  });

  callback && callback([
    `${cartao} ${retorno.id} $ ${valor/100} ${parcela ? `${parcela}/${parcelas}` : ''}`,
    `${recorrente ? recorrente.id : ''} ${descritivo}`,
    `${competencia} ${data}`,
    `${(tags || []).map(t => `[${t}]`).join(' ')}`
  ]);
}

module.exports = exec;
