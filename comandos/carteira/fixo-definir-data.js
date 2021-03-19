const exec = async ({ subComando, parametros, callback, banco }) => {
  if (parametros.length < 2) {
    callback([
      'Exemplo do comando abaixo',
      `${subComando} {id} {dia}`
    ]);
  } else {
    const id = parametros.shift();
    const dia = parametros.shift();
    const list = await banco.sqlite.all(`SELECT data FROM carteira_gastos_fixo WHERE id = ${id}`);

    if (list.length !== 1) {
      callback('Registro não encontrado');
    } else {
      const data = new Date(list[0].data);
      data.setDate(dia);

      banco.sqlite.run(`UPDATE carteira_gastos_fixo set data = ${data.getTime()} WHERE id = ${id}`);

      callback('Registro atualizado');
    }
  }
}

module.exports = {
  alias: ['fd', 'fdata'],
  exec,
}