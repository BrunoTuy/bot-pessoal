const exec = async ({ subComando, parametros, callback, lib, libLocal, parametrosObj }) => {
  if ((!parametros || parametros.length < 5) && !parametrosObj) {
    callback([
      'Exemplo do comando abaixo',
      `${subComando} {data} {cartao} {parcelas 4} {valor em centavos} {descritivo}`,
    ]);
  } else {
    if (parametrosObj && (
      !parametrosObj.data ||
      !parametrosObj.parcelas ||
      !parametrosObj.valor ||
      !parametrosObj.cartao ||
      !parametrosObj.descritivo
    )) {
      callback(`Tem algo errado nos parametros para incluir compromisso cartão`);
    } else {
      const data = parametrosObj ? parametrosObj.data : libLocal.entenderData(parametros.shift());
      const cartao = parametrosObj ? parametrosObj.cartao : parametros.shift();
      const parcelas = parametrosObj ? parametrosObj.parcelas : parametros.shift();
      const valor = parametrosObj ? parametrosObj.valor : parametros.shift();
      const descritivo = parametrosObj ? parametrosObj.descritivo : parametros.join(' ');
      const recorrente = parametrosObj ? parametrosObj.recorrente : null;
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
            const obj = await db.collection('cartoes').doc(cartaoDoc.id).collection('fatura');

            for (let parcela = 1; parcela <= parcelas; parcela++) {
              const competencia = libLocal.calcularCompetencia({ competenciaInicial, parcela });
              const dataCartao = new Date(data);
              dataCartao.setMonth(data.getMonth()+parcela-1);

              obj.add({
                data: dataCartao.getTime(),
                dataTexto: dataCartao,
                valor,
                descritivo,
                parcela,
                total_parcelas: parcelas,
                competencia,
                recorrente
              });
            }
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
