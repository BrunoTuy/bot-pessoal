const cartaoExtrato = require('../dto/cartaoExtrato.js');

const exec = async ({ parametros, callback, lib: { banco: { get, insert, update } }, libLocal }) => {
  if (parametros.length !== 2) {
    callback && callback([
      'Necessário informar competencia e cartão'
      `${subComando} {competencia} {nome do cartão}`
     ]);
  } else {
    const colecao = 'contas_extrato';
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

        const id = `${cartao.id}.${competencia}`;
        const registro = { _id: id };
        const dados = {
          data: data.getTime(),
          dataTexto: data,
          valor: parseInt(cartao.total*-1),
          descritivo: `Fatura ${cartao.nome} ${competencia}`,
          status: 'previsto',
          fatura: {
            cartao: cartao.id,
            competencia
          }
        };

        const itemBanco = await get({ colecao, registro });

        if (itemBanco) {
          await update({ colecao, registro, set: dados });
        } else {
          await insert({ colecao, dados: {
            ...registro,
            ...dados
          } });
        }
      }
    }

    linhas.push(`== Total R$ ${libLocal.formatReal(total)}`);

    callback && callback(linhas);
  }
}

module.exports = {
  alias: ['gfat'],
  descricao: 'Gerar faturas',
  exec,
}