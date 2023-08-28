const listaContas = require('./contaListar.js');

const exec = async ({ anoMes, lib: { banco: { list } }, conta: contaParam, contaNome, dataMin: paramDataMin, dataMax: paramDataMax, tags, dataTotal, somenteAtivo, naoSeparar, filtroExtrato }) => {
  const lista = [];
  const totais = {
    feito: 0,
    previsto: 0,
  };

  let dataMin = paramDataMin || new Date();
  const dataMax = paramDataMax || new Date();

  if (paramDataMin === null) {
    dataMin = paramDataMin;
  } else if (!paramDataMin && !dataTotal) {
    if (anoMes) {
      dataMin.setFullYear(anoMes.toString().substring(0, 4))
      dataMin.setMonth(anoMes.toString().substring(4)-1, 1);
    }

    dataMin.setDate(1);
    dataMin.setHours(0);
    dataMin.setMinutes(0);
    dataMin.setSeconds(0);
    dataMin.setMilliseconds(0);
  }

  if (!paramDataMax && !dataTotal) {
    if (anoMes) {
      dataMax.setFullYear(anoMes.toString().substring(0, 4))
      dataMax.setMonth(anoMes.toString().substring(4), 1);
    } else {
      dataMax.setMonth(dataMin.getMonth()+1, 1);
    }

    dataMax.setHours(23);
    dataMax.setMinutes(59);
    dataMax.setSeconds(59);
    dataMax.setMilliseconds(999);
    dataMax.setDate(dataMax.getDate()-1);
  }

  const contas = contaParam
    ? [contaParam]
    : await listaContas.exec({ list, contaNome, somenteAtivo });

  for (const conta of contas) {
    const { separada } = conta;
    let feito = 0;
    let previsto = 0;
    const extratoLista = [];
    const filtro = filtroExtrato || {}

    filtro.contaId = conta._id;

    if (tags && tags.length > 0) {
      filtro.tags = { $in: tags };
    }

    if (!dataTotal && (dataMin || dataMax)) {
      filtro.data = {};

      if (dataMin) {
        filtro.data.$gte = dataMin.getTime();
      }

      if (dataMax) {
        filtro.data.$lte = dataMax.getTime();
      }
    }

    const extrato = await list({
      colecao: 'contas_extrato',
      filtro,
      ordem: { data: 1 }
    });

    for (const i of extrato) {
      const { data, status, valor, descritivo } = i;

      feito += status === 'feito' ? parseInt(valor) : 0;
      previsto += status !== 'feito' ? parseInt(valor) : 0;

      extratoLista.push({...i, id: i._id});
    }

    if (naoSeparar || !separada) {
      totais.feito += feito;
      totais.previsto += previsto;
    }

    lista.push({
      ...conta,
      id: conta._id,
      feito,
      previsto,
      extrato: extratoLista
    });
  }

  return {
    totais,
    lista
  };
};

module.exports = { exec };
