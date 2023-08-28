const listaContas = require('../dto/contaListar.js');
const extrato = require('../dto/extrato.js');
const contaAdd = require('./add.js');

const correrLista = async ({ contas, insert, ano, mes, lib, somente }) => {
  let contador = 0;
  const data = new Date();

  for (const item of contas) {
    for (const rec of item.recorrente) {
      let idx = 0;
      const { dia, valor, descritivo, tags } = rec;
      const cadastro = {
        ano: somente ? ano : data.getFullYear(),
        mes: somente ? mes : data.getMonth()+1
      };

      while (cadastro.ano < ano || (cadastro.ano == ano && cadastro.mes <= mes)) {
        const dataBuscar = new Date();

        idx++;

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

        // const queryRef = db.collection('contas').doc(item.id).collection('extrato')
        //   .where('recorrente.id', '==', rec.id)
        //   .where('data', '>=', dataMin)
        //   .where('data', '<=', dataMax);
        // const verificarGet = await queryRef.get();

        const extratoConta = await extrato.exec({
          lib,
          conta: item,
          dataMin: new Date(dataMin),
          dataMax: new Date(dataMax),
          filtroExtrato: { 'recorrente.id': rec.id }
        });

        // if (verificarGet.size < 1) {
        console.log('-- extrato', extratoConta);
        if (extratoConta.lista[0].extrato.length < 1) {
          const dataA = new Date();

          dataA.setFullYear(cadastro.ano)
          dataA.setMonth(cadastro.mes-1, dia);
          dataA.setHours(12);
          dataA.setMinutes(0);
          dataA.setSeconds(0);
          dataA.setMilliseconds(0);

          insert({
            tags,
            valor: valor*-1,
            data: dataA,
            contador: idx,
            itemId: item.id,
            recorrente: rec,
            nome: item.banco,
            descritivo: `${descritivo}/recorrente,${(tags || []).join(',')}`
          });

          contador++;
        }

        cadastro.mes++;

        if (cadastro.mes > 12) {
          cadastro.mes = 1;
          cadastro.ano++;
        }
      }
    }
  }

  return contador;
};

const exec = async ({ subComando, parametros, callback, lib, libLocal }) => {
  if (parametros.length < 2) {
    callback([
      'Você tem que informar mes e ano limite para processamento',
      `${subComando} {ano} {mes} [somente]`
    ]);
  } else {
    const { banco: { list } } = lib;
    let contador = 0;
    const ano = parametros.shift();
    const mes = parametros.shift();
    const somente = !!parametros.shift();
    const contas = await listaContas.exec({ list, somenteAtivo: true });

    contador += await correrLista({ 
      lib,
      ano,
      mes,
      somente,
      contas,
      insert: ({ data, recorrente, nome, valor, descritivo, tags }) => {
        contaAdd.exec({
          lib,
          libLocal,
          callback,
          parametrosObj: {
            tags,
            data,
            valor,
            descritivo,
            recorrente,
            conta: nome,
            status: 'previsto fixo'
          }
        });
      }
    });

    callback(`${contador} registros inseridos.`);
  }
};

module.exports = {
  alias: ['fx'],
  descricao: 'Processar recorrentes',
  exec,
};
