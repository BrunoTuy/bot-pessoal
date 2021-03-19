const exec = ({ subComando, parametros, callback, banco }) => {
  if (parametros.length < 4) {
    callback([
      'Exemplo do comando abaixo',
      `${subComando} {valor em centavos} {conta|cartao} {qual conta ou cartao} {descritivo}`,
    ]);
  } else {
    const data = new Date().getTime();
    const valor = parametros.shift();
    const tipo = parametros.shift();
    const conta = parametros.shift();
    const descritivo = parametros.join(' ');

    let sql = 'INSERT INTO carteira_gastos_fixo (ativo, data, descritivo, valor, conta, cartao) ';
    sql += `VALUES (1, ${data}, '${descritivo}', ${valor}, ${tipo === 'conta' ? `'${conta}'` : null}, ${tipo === 'cartao' ? `'${conta}'` : null})`

    banco.sqlite.run(sql)

    callback([
      'Cadastrado',
      `${tipo} ${conta}`,
      `Em ${descritivo}`,
      `R$ ${valor/100}`
    ]);
  }
}

module.exports = {
  alias: ['fa', 'fadd'],
  exec,
}