const inserir = require('../dto/inserirCartaoFatura.js');
const faturas = require('./gerar-faturas.js');

const exec = async ({ subComando, parametros, callback, lib: { banco }, libLocal }) => {
  if (!parametros || parametros.length < 5) {
    callback([
      'Exemplo do comando abaixo',
      `${subComando} {cartao} {parcelas 4} {data} {valor em centavos} {descritivo} / {tag um, tag dois}`,
    ]);
  } else {
    const cartao = parametros.shift();
    const parcelas = parametros.shift();
    const data = libLocal.entenderData(parametros.shift());
    const valor = libLocal.entenderValor({ val: parametros.shift(), cartao: true });
    const { descritivo, tags } = parametros && libLocal.entenderDescritivoTags(parametros.join(" "));

    if (parcelas > 12) {
      callback(`Tem algo errado nesse número de parcelas. ${parcelas}x`);
    } else {
      const item = await banco.get({
        colecao: 'cartoes',
        registro: { nome: cartao }
      });

      console.log('Cartao encontrado', item);

      if (!item) {
        callback('Cartão não cadastrado.');
      } else {
        const { competencia: competenciaInicial, _id: cartaoId } = item;

        if (!competenciaInicial) {
          callback(`O cartão ${cartao} esta sem competência definida.`);
        } else {
          for (let parcela = 1; parcela <= parcelas; parcela++) {
            const competencia = libLocal.calcularCompetencia({ competenciaInicial, parcela });
            const dataCartao = new Date(data);
            dataCartao.setMonth(data.getMonth()+parcela-1);

            inserir({
              lib: { banco },
              callback,
              params: {
                cartaoId,
                data: dataCartao,
                valor,
                descritivo,
                parcela,
                parcelas,
                competencia,
                tags
              }
            });

            faturas.exec({
              lib: { banco },
              libLocal,
              parametros: [competencia, cartao]
            });
          }
        }
      }
    }
  }
};

module.exports = {
  alias: ['a'],
  descricao: 'Adicionar',
  exec,
};
