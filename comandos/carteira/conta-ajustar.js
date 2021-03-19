const exec = async ({ subComando, parametros, callback, banco, lib }) => {
  if (parametros.length === 2) {
    const linhas = [];
    const ano = parametros.shift();
    const mes = parametros.shift();
    const dataMin = new Date();
    const dataMax = new Date();

    dataMin.setFullYear(ano);
    dataMin.setMonth(mes-1);
    dataMin.setDate(1);
    dataMin.setHours(0);
    dataMin.setMinutes(0);
    dataMin.setSeconds(0);
    dataMin.setMilliseconds(0);

    dataMax.setFullYear(ano);
    dataMax.setMonth(mes-1);
    dataMax.setHours(23);
    dataMax.setMinutes(59);
    dataMax.setSeconds(59);
    dataMax.setMilliseconds(999);

    const list = await banco.sqlite.all(`
      SELECT *
      FROM carteira_gastos_conta
      WHERE data between ${dataMin.getTime()} AND ${dataMax.getTime()}
      ORDER BY data ASC
    `);

    for (const i of list) {
      linhas.push(`::${i.id}:: ${lib.formatData(i.data)} R$ ${lib.formatReal(i.valor)} - ${i.conta} - ${i.descritivo}`);
    }

    linhas.push('');
    linhas.push(`${subComando} {id} {data} {valor em centavos}`);

    callback(linhas);
  } else if (parametros.length === 3) {
    const id = parametros.shift();
    const data = parametros.shift().toString();
    const strValor = parametros.shift().toString();

    const list = await banco.sqlite.all(`
      SELECT *
      FROM carteira_gastos_conta
      WHERE id = ${id}
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
        dataReg.setMonth(data.substring(4, 6)-1, data.substring(6, 8));
      }

      const valor = strValor.substring(strValor.length-1) === 'c'
        ? strValor.substring(0, strValor.length-1)
        : strValor*-1;

      banco.sqlite.run(`
        UPDATE carteira_gastos_conta
          SET data = ${dataReg.getTime()},
              valor = ${valor}
        WHERE id = ${id}
      `);

      callback('Registro atualizado')
    }
  } else {
    callback([
      'Exemplo do comando abaixo',
      `${subComando} {ano} {mes}`
    ]);
  }
}

module.exports = {
  alias: ['caj', 'ccaj'],
  exec,
}