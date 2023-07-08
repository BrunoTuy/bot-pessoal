const exec = async ({ lib: { banco: { insert } }, params: dados, callback }) => {
  const { cartaoId, data, valor, descritivo, parcela, parcelas, competencia, recorrente, tags } = dados;
  const retorno = await insert({ 
    colecao: 'cartoes_extrato',
    dados
  });

  callback && callback([
    `${cartaoId} ${retorno} $ ${valor/100} ${parcela ? `${parcela}/${parcelas}` : ''}`,
    `${recorrente ? recorrente.id : ''} ${descritivo}`,
    `${competencia} ${data}`,
    `${(tags || []).map(t => `[${t}]`).join(' ')}`
  ]);
}

module.exports = exec;
