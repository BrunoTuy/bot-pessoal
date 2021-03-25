const consultaRecorrentes = require('./consultas/recorrentes.js');

const exec = async ({ parametros, callback, banco, lib, libLocal }) => {
  const tipo = parametros.shift();
  const contaCartao = parametros.shift();
  const linhas = [];
  const totais = {
    conta: 0,
    cartao: 0
  };

  const fixo = await consultaRecorrentes.exec({ lib });

  for (const conta of fixo.contas) {
    let total = 0;
    const { nome } = conta;
  
    for (const rec of conta.lista) {
      const { dia, valor, descritivo } = rec;

      total += valor;

      linhas.push(`D.${dia} R$ ${libLocal.formatReal(valor)} ${descritivo}`);
    }

    totais.conta += total;
    total > 0 && linhas.push(`--- CC ${nome} R$ ${libLocal.formatReal(total)}`);
    total > 0 && linhas.push('');
  }

  for (const cartao of fixo.cartoes) {
    let total = 0;
    const { nome } = cartao;

    for (const rec of cartao.lista) {
      const { dia, valor, descritivo } = rec;

      total += valor;

      linhas.push(`D.${dia} R$ ${libLocal.formatReal(valor)} ${descritivo}`);
    }

    totais.cartao += total;
    total > 0 && linhas.push(`--- CD ${nome} R$ ${libLocal.formatReal(total)}`);
    total > 0 && linhas.push('');
  }

  linhas.push('-- RESUMO --');
  linhas.push(`Em cartões R$ ${totais.cartao/100}`);
  linhas.push(`Em contas R$ ${totais.conta/100}`);
  linhas.push(`Total R$ ${(totais.cartao+totais.conta)/100}`);

  callback(linhas);
}

module.exports = {
  alias: ['fixo', 'fl'],
  exec,
}