const exec = async ({ subComando, parametros, callback, banco, lib, parametrosObj }) => {
  const inserir = ({ data, cartao, descritivo, valor, parcela, parcelas }) => {
    const competencia = lib.calcularCompetencia({ data, cartao });

    banco.sqlite.run(`
      INSERT INTO carteira_gastos_cartao (data, cartao, descritivo, valor, parcela, total_parcelas, competencia) 
      VALUES (${data.getTime()}, '${cartao}', '${descritivo}', ${valor}, ${parcela}, ${parcelas}, ${competencia})
    `);

    callback([
      `Cadastrado ${descritivo}`,
      `${cartao} ${competencia}`,
      `Em ${data}`,
      `R$ ${valor/100}`
    ]);
  }

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
      const data = parametrosObj ? parametrosObj.data : lib.entenderData(parametros.shift());
      const cartao = parametrosObj ? parametrosObj.cartao : parametros.shift();
      const parcelas = parametrosObj ? parametrosObj.parcelas : parametros.shift();
      const valor = parametrosObj ? parametrosObj.valor : parametros.shift();
      const descritivo = parametrosObj ? parametrosObj.descritivo : parametros.join(' ');

      if (parcelas > 12) {
        callback(`Tem algo errado nesse número de parcelas. ${parcelas}`);
      } else {
        for (let parcela = 1; parcela <= parcelas; parcela++) {
          inserir({
            data,
            cartao,
            descritivo,
            valor,
            parcela,
            parcelas
          });

          data.setMonth(data.getMonth()+1);
        }
      }
    }
  }
}

module.exports = {
  alias: ['cda', 'cdadd'],
  exec,
}
