const exec = async ({ parametros, callback, banco, lib }) => {
  const tipo = parametros.shift();
  const contaCartao = parametros.shift();
  const linhas = [];
  const totais = {
    conta: 0,
    cartao: 0,
    geral: 0
  };
  let query = 'SELECT * FROM carteira_gastos_fixo WHERE ativo = 1';

  if (tipo === 'conta' && contaCartao) {
    query += ` AND conta = '${contaCartao}'`;
  } else if (tipo === 'cartao' && contaCartao) {
    query += ` AND cartao = '${contaCartao}'`;
  } else if (tipo === 'conta') {
    query += ' AND conta not null';
  } else if (tipo === 'cartao') {
    query += ' AND cartao not null';
  }

  const list = await banco.sqlite.all(query);

  for (const i of list) {
    const data = new Date(i.data)

    totais.geral += i.valor;
    totais.conta += i.conta ? i.valor : 0;
    totais.cartao += i.cartao ? i.valor : 0;

    linhas.push(`::${i.id}:: D.${data.getDate()} R$ ${lib.formatReal(i.valor)} ${i.conta ? `CC ${i.conta}` : `CD ${i.cartao}`} - ${i.descritivo}`);
  }

  linhas.push('');
  linhas.push('-- RESUMO --');
  linhas.push(`Em cartões R$ ${totais.cartao/100}`);
  linhas.push(`Em contas R$ ${totais.conta/100}`);
  linhas.push(`Total R$ ${totais.geral/100}`);

  callback(linhas);
}

module.exports = {
  alias: ['fixo', 'fl'],
  exec,
}