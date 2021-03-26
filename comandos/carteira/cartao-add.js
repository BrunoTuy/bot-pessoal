const inserir = require('./dto/inserirCartaoFatura.js');

const exec = async ({ subComando, parametros, callback, lib, libLocal }) => {
  if (!parametros || parametros.length < 5) {
    callback([
      'Exemplo do comando abaixo',
      `${subComando} {data} {cartao} {parcelas 4} {valor em centavos} {descritivo}`,
    ]);
  } else {
    const data = libLocal.entenderData(parametros.shift());
    const cartao = parametros.shift();
    const parcelas = parametros.shift();
    const valor = parametros.shift();
    const descritivo = parametros.join(' ');
    const { db } = lib.firebase;

    if (parcelas > 12) {
      callback(`Tem algo errado nesse número de parcelas. ${parcelas}x`);
    } else {
      const cartoes = db.collection('cartoes');
      const queryRef = cartoes.where('nome', '==', cartao);
      const cartoesGet = await queryRef.get();

      if (cartoesGet.size !== 1) {
        callback('Cartão não cadastrado.');
      } else {
        const cartaoDoc = cartoesGet.docs[0];
        const { competencia: competenciaInicial } = cartaoDoc.data();

        if (!competenciaInicial) {
          callback(`O cartão ${cartao} esta sem competência definida.`);
        } else {
          for (let parcela = 1; parcela <= parcelas; parcela++) {
            const competencia = libLocal.calcularCompetencia({ competenciaInicial, parcela });
            const dataCartao = new Date(data);
            dataCartao.setMonth(data.getMonth()+parcela-1);

            inserir({
              lib,
              callback,
              params: {
                cartao: cartaoDoc.id,
                data: dataCartao,
                valor,
                descritivo,
                parcela,
                parcelas,
                competencia
              }
            });
          }
        }
      }
    }
  }
};

module.exports = {
  alias: ['cda', 'cdadd'],
  exec,
};
