const exec = async ({ subComando, parametros, callback, lib: { banco: { get, update } } }) => {
  if (parametros.length < 4) {
    callback([
      'Exemplo do comando abaixo',
      `${subComando} {cartao} {dia} {valor em centavos} {descritivo}`,
    ]);
  } else {
    const cartao = parametros.shift();
    const dia = parseInt(parametros.shift());
    const valor = parseInt(parametros.shift());
    const descritivo = parametros.join(' ');
    const colecao = 'cartoes';
    const registro = { cartaoId, _id: faturaId };
    const item = await get({ colecao, registro: { nome: cartao } });

    if (item) {
      callback(`Cartão ${cartao} não cadastrado.`);
    } else {
      const { recorrente } = item;

      recorrente.push({
        dia,
        valor,
        descritivo
      });

      await update({
        colecao,
        registro: { _id: item._id },
        set: { recorrente }
      });

      callback([
        'Cadastrado',
        `${item.nome} - ${descritivo}`,
        `Dia ${dia}`,
        `R$ ${valor/100}`
      ]);
    }
  }
}

module.exports = {
  alias: ['fa'],
  descricao: 'Cadastrar recorrente',
  exec,
};
