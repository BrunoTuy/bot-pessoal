const cartaoExtrato = require('../dto/cartaoExtrato.js');

const exec = async ({ parametros, callback, lib, libLocal }) => {
  const { db } = lib.firebase;
  const competencia = parametros.shift()
  const cartaoNome = parametros.shift()
  const ano = competencia.toString().substring(0, 4);
  const mes = competencia.toString().substring(4, 6);
  const linhas = [];
  let total = 0;

  linhas.push(`------ Faturas ${competencia} atualizadas ------`);

  const cartoes = await cartaoExtrato.exec({ lib, competencia, cartao: cartaoNome });

  for (const cartao of cartoes) {
    if (cartao.total > 0) {
      const data = new Date();
      linhas.push(`-- ${cartao.nome} R$ ${libLocal.formatReal(cartao.total)} Vencimento dia ${cartao.vencimento}`);
      total += cartao.total;

      data.setFullYear(ano);
      data.setMonth(parseInt(mes)-1, cartao.vencimento);

      const docRef = db.collection('contas').doc(cartao.banco).collection('extrato').doc(`${cartao.id}.${competencia}`);
      docRef.set({
        data: data.getTime(),
        dataTexto: data,
        valor: parseInt(cartao.total*-1),
        descritivo: `Fatura ${cartao.nome} ${competencia}`,
        status: 'previsto',
        fatura: {
          cartao: cartao.id,
          competencia
        }
      });
    }
  }

  linhas.push(`== Total R$ ${libLocal.formatReal(total)}`);

  callback && callback(linhas);
}

module.exports = {
  alias: ['gfat'],
  descricao: 'Gerar faturas',
  exec,
}