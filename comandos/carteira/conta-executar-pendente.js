const exec = async ({ subComando, parametros, callback, banco, lib }) => {
  if (parametros.length === 3) {
    const id = parametros.shift();
    const data = parametros.shift().toString();
    const strValor = parametros.shift().toString();

    const list = await banco.sqlite.all(`
      SELECT *
      FROM carteira_gastos_conta
      WHERE id = ${id} AND
        status like 'previsto%'
      ORDER BY data ASC
    `);

    if (list.length !== 1) {
      callback('Registro não encontrado.');
    } else {
      const dataReg = new Date(list[0].data);

      if (data.length < 3) {
        dataReg.setDate(data);
      } else {
        dataReg.setFullYear(data.substring(0, 4));
        dataReg.setMonth(data.substring(4, 6), data.substring(6, 8));
      }

      const valor = strValor.substring(strValor.length-1) === 'c'
        ? strValor.substring(0, strValor.length-1)
        : strValor*-1;

      banco.sqlite.run(`
        UPDATE carteira_gastos_conta
          SET data = ${dataReg.getTime()},
              valor = ${valor},
              status = 'feito'
        WHERE id = ${id}
      `);

      callback('Registro atualizado')
    }
  } else {
    const linhas = [];
    const data = new Date();

    data.setHours(23);
    data.setMinutes(59);
    data.setSeconds(59);
    data.setMilliseconds(999);

    const list = await banco.sqlite.all(`
      SELECT *
      FROM carteira_gastos_conta
      WHERE data < ${data.getTime()} AND
        status like 'previsto%'
      ORDER BY data ASC
    `);

    for (const i of list) {
      linhas.push(`::${i.id}:: ${lib.formatData(i.data)} R$ ${lib.formatReal(i.valor)} - ${i.conta} - ${i.descritivo}`);
    }

    linhas.push('');
    linhas.push(`${subComando} {id} {dia|data} {valor}`);

    callback(linhas);
  }
}

module.exports = {
  alias: ['cxp', 'ccxp'],
  exec,
}