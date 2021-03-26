const exec = async ({ lib, params, callback }) => {
  const { cartao, data, valor, descritivo, parcela, parcelas, competencia, recorrente } = params;
  const obj = await lib.firebase.db.collection('cartoes').doc(cartao).collection('fatura');
  obj.add({
    data: data.getTime(),
    dataTexto: data,
    valor,
    descritivo,
    competencia,
    parcela: parcela || 1,
    total_parcelas: parseInt(parcelas) || 1,
    recorrente: recorrente || null
  });

  callback && callback([
    `Cartão.fatura ${cartao} $ ${valor/100} ${parcela ? `${parcela}/${parcelas}` : ''}`,
    `${recorrente ? recorrente.id : ''} ${descritivo}`,
    `${competencia} ${data}`
  ]);  
}

module.exports = exec;
