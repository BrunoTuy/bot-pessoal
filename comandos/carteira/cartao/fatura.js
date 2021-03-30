const cartaoExtrato = require('../dto/cartaoExtrato.js');

const exec = async ({ subComando, parametros, callback, lib, libLocal }) => {
  const { db } = lib.firebase;
  const data = new Date();
  const competencia = parametros.length > 0 && parametros[0].length === 6 && parametros[0] > 202101
    ? parametros.shift()
    : data.getFullYear()*100+(data.getMonth() > 10
      ? 101
      : data.getMonth()+2);
  const cartao = parametros.shift();
  const linhas = [];
  let total = 0;

  linhas.push(`------ ${competencia} ------`);

  const cartoes = await cartaoExtrato.exec({ lib, competencia, cartao });

  for (const cartao of cartoes) {
    for (const i of cartao.fatura) {
      linhas.push(`${libLocal.formatData(i.data)} R$ ${libLocal.formatReal(i.valor)} ${i.total_parcelas > 1 ? ` ${i.parcela}/${i.total_parcelas}` : ''} - ${i.descritivo}`);
    }

    total += cartao.total;
    cartao.fatura.length > 0 && linhas.push(`== ${cartao.nome} R$ ${libLocal.formatReal(cartao.total)}`);
    cartao.fatura.length > 0 && linhas.push('');
  }

  linhas.push(`== Total R$ ${libLocal.formatReal(total)}`);

  callback(linhas);
}

module.exports = {
  alias: ['fat'],
  descricao: 'Mostrar faturas',
  exec,
}