const consultaRecorrentes = require('../dto/cartoesRecorrentes.js');
const cartaoAdd = require('../dto/inserirCartaoFatura.js');
const faturas = require('./gerar-faturas.js');
const cartaoExtrato = require('../dto/cartaoExtrato.js');

const correrLista = async ({ lista, insert, ano, mes, banco }) => {
  let contador = 0;
  const data = new Date();

  for (const item of lista) {
    for (const rec of item.lista) {
      let idx = 0;
      const { dia, valor, descritivo, tags } = rec;
      const cadastro = {
        ano: data.getFullYear(),
        mes: data.getMonth()+1
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

        const cartoes = await cartaoExtrato.exec({
          lib: { banco },
          cartao: item.nome,
          dataMin,
          dataMax
        });

        const verificarGet = cartoes.fatura.find(({ recorrente }) => recorrente && recorrente.id === rec.id);

        if (!verificarGet) {
          const dataA = new Date();

          dataA.setFullYear(cadastro.ano)
          dataA.setMonth(cadastro.mes-1, dia);
          dataA.setHours(12);
          dataA.setMinutes(0);
          dataA.setSeconds(0);
          dataA.setMilliseconds(0);

          insert({
            tags,
            valor,
            descritivo,
            data: dataA,
            contador: idx,
            nome: item.nome,
            itemId: item.id,
            recorrente: rec,
            competencia: item.competencia
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
  if (parametros.length !== 2) {
    callback([
      'Você tem que informar mes e ano limite para processamento',
      `${subComando} {ano} {mes}`
    ]);
  } else {
    let contador = 0;
    const ano = parametros.shift();
    const mes = parametros.shift();
    const lista = await consultaRecorrentes.exec({ lib });
    const { banco } = lib.firebase;

    contador += await correrLista({ 
      banco,
      ano,
      mes,
      lista,
      insert: ({ data, recorrente, nome, valor, descritivo, itemId, competencia: competenciaInicial, contador, tags }) => {
        const competencia = libLocal.calcularCompetencia({ competenciaInicial, parcela: contador });

        cartaoAdd({
          lib,
          params: {
            tags,
            cartao: itemId,
            data,
            valor,
            descritivo,
            recorrente,
            competencia
          }
        });

        faturas.exec({
          lib,
          libLocal,
          parametros: [competencia, nome]
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
