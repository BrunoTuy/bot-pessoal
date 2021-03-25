const contaAdd = require('./conta-add.js');
const cartaoAdd = require('./cartao-add.js');

const exec = async ({ subComando, parametros, callback, banco, lib, libLocal }) => {
  if (parametros.length !== 2) {
    callback([
      'Você tem que informar mes e ano limite para processamento',
      `${subComando} {ano} {mes}`
    ]);
  } else {
    let contador = 0;
    const data = new Date();
    const ano = parametros.shift();
    const mes = parametros.shift();
    const list = await banco.sqlite.all('SELECT * FROM carteira_gastos_fixo WHERE ativo = 1');

    for (const i of list) {
      const cadastro = {
        ano: data.getFullYear(),
        mes: data.getMonth()+1
      };

      while (cadastro.ano < ano || (cadastro.ano == ano && cadastro.mes <= mes)) {
        const dataA = new Date(i.data);

        dataA.setFullYear(cadastro.ano)
        dataA.setMonth(cadastro.mes-1);
        dataA.setHours(12);
        dataA.setMinutes(0);
        dataA.setSeconds(0);
        dataA.setMilliseconds(0);

        const competencia = cadastro.ano*100+cadastro.mes+1;

        if (i.cartao) {
          const verificar = await banco.sqlite.all(`
            SELECT *
            FROM carteira_gastos_cartao
            WHERE cartao = '${i.cartao}' AND
              descritivo = '${i.descritivo}' AND
              parcela = 1 AND
              total_parcelas = 1 AND
              competencia = ${competencia} AND
              valor = ${i.valor}
          `);

          if (verificar.length < 1) {
            cartaoAdd.exec({
              lib,
              banco,
              callback,
              subComando,
              parametrosObj: {
                data: dataA,
                parcelas: 1,
                valor: i.valor,
                cartao: i.cartao,
                descritivo: i.descritivo,
              }
            });

            contador++;
          }
        } else if (i.conta) {
          const dataBuscar = new Date();

          dataBuscar.setFullYear(cadastro.ano)
          dataBuscar.setMonth(cadastro.mes-1, 1);
          dataBuscar.setHours(0);
          dataBuscar.setMinutes(0);
          dataBuscar.setSeconds(0);
          dataBuscar.setMilliseconds(0);

          const dataMin = dataBuscar.getTime();

          dataBuscar.setMonth(dataBuscar.getMonth()+1, 1);
          dataBuscar.setDate(dataBuscar.getDate()-1);
          dataBuscar.setHours(23);
          dataBuscar.setMinutes(59);
          dataBuscar.setSeconds(59);

          const dataMax = dataBuscar.getTime();

          const verificar = await banco.sqlite.all(`
            SELECT *
            FROM carteira_gastos_conta
            WHERE fixo_id = '${i.id}' AND
              data between ${dataMin} AND ${dataMax}
          `);

          if (verificar.length < 1) {
            contaAdd.exec({
              lib,
              banco,
              callback,
              subComando,
              parametrosObj: {
                data: dataA,
                fixoId: i.id,
                conta: i.conta,
                valor: i.valor,
                descritivo: i.descritivo,
                status: 'previsto fixo'
              }
            })

            contador++;
          }
        }

        cadastro.mes++;

        if (cadastro.mes > 12) {
          cadastro.mes = 1;
          cadastro.ano++;
        }
      }
    }

    callback(`${contador} registros inseridos.`);
  }
}

module.exports = {
  alias: ['fx'],
  exec,
}