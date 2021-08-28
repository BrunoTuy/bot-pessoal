const exec = async ({ subComando, parametros, callback, lib }) => {
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
    const { db } = lib.firebase;
    const queryRef = db.collection('cartoes').where('nome', '==', cartao);
    const cartoesGet = await queryRef.get();

    if (cartoesGet.size !== 1) {
      callback(`Cartão ${cartao} não cadastrado.`);
    } else {
      const cartaoDoc = cartoesGet.docs[0];
      const obj = await db.collection('cartoes').doc(cartaoDoc.id).collection('recorrente');

      obj && obj.add({
        dia,
        valor,
        descritivo
      });

      callback([
        'Cadastrado',
        `${cartaoDoc.data().nome} - ${descritivo}`,
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
