const exec = async ({ subComando, parametros, callback, lib, libLocal }) => {
  const { db } = lib.firebase;
  const data = new Date();
  const competencia = parametros.length > 0 && parametros[0].length === 6 && parametros > 202101
    ? parametros.shift()
    : data.getFullYear()*100+(data.getMonth() > 10
      ? 101
      : data.getMonth()+2);
  const linhas = [];
  let totalGeral = 0;

  const cartoes = await db.collection('cartoes').get();

  linhas.push(`------ ${competencia} ------`);

  for (const cartao of cartoes.docs) {
    let total = 0;

    const fatura = await db.collection('cartoes').doc(cartao.id).collection('fatura')
      .where('competencia', '==', competencia)
      .orderBy('data')
      .get();
    for (const i of fatura.docs) {
      const { data, valor, descritivo, parcela, total_parcelas: parcelas } = i.data();

      linhas.push(`${libLocal.formatData(data)} R$ ${libLocal.formatReal(valor)} ${parcelas > 1 ? ` ${parcela}/${parcelas}` : ''} - ${descritivo}`);

      total += parseInt(valor);
    }


    totalGeral += total;

    fatura.size > 0 && linhas.push(`== ${cartao.data().nome} R$ ${libLocal.formatReal(total)}`);
    fatura.size > 0 && linhas.push('');
  }

  linhas.push('------ Geral ------');
  linhas.push(`== Total R$ ${libLocal.formatReal(totalGeral)}`);

  callback(linhas);
}

module.exports = {
  alias: ['cartao', 'card', 'cd', 'cdl'],
  exec,
}