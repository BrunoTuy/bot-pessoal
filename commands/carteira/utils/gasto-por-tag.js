const extrato = require('../dto/extrato.js');
const cartaoExtrato = require('../dto/cartaoExtrato.js');
const dinheiroExtrato = require('../dto/dinheiroExtrato.js');

const exec = async ({ parametros, subComando, callback, lib, libLocal }) => {
  const linhas = [];
  if (parametros < 1) {
    linhas.push(`${subComando} {tag}`);
  } else {
    let dataMin = false;
    let dataMax = false;
    let competencia = false;

    if (parametros[0].indexOf('-d') === 0) {
      const list = parametros.shift().split(':');

      if (list.length === 3) {
        dataMin = libLocal.entenderData(list[1]);
        dataMax = libLocal.entenderData(list[2]);
      }
    }

    if (parametros[0].indexOf('-c') === 0) {
      const list = parametros.shift().split(':');

      if (list.length === 2 && list[1].length === 6 && parseInt(list[1]) > 202101) {
        competencia = parseInt(list[1]);
      }
    }

    const parametrosTexto = parametros.join(' ');
    const tags = parametrosTexto.split(',').map(t => t.trim());
    const mostrarTags = true;
    const mostrarDescricao = true;
    const obj = { lib, tags, dataMin, dataMax, competencia, naoSeparar: true };
    const contas = competencia ? {lista: [], totais: {feito: 0, previsto: 0}} : await extrato.exec(obj);
    const cartoes = await cartaoExtrato.exec(obj);
    const extratoExecutado = competencia ? {lista: [], total: 0} : await dinheiroExtrato.exec(obj);
    let total = 0;

    for (const c of contas.lista) {
      c.extrato.length > 0 && linhas.push(`🏦 ${c.banco.toUpperCase()} :${c.id}:`)

      for (const e of c.extrato) {
        const formatStatus = e.status === 'previsto fixo'
          ? '🗓'
          : e.status === 'feito'
            ? '✅'
            : e.status === 'previsto'
              ? '🗓'
              : '❓';

        const tags = mostrarTags && e.tags && e.tags.length > 0
          ? e.tags.map(t => `[${t}]`).join(' ')
          : null;

        const descricao = mostrarDescricao || !tags
          ? e.descritivo
          : null;

        linhas.push(`<pre>${formatStatus} ${libLocal.formatData(e.data)} R$ ${libLocal.formatReal(e.valor)} ${tags || '-'} ${descricao || ''} :${e.id}:</pre>`);
      }

      c.extrato.length > 0 && linhas.push(`🧮 R$ ${libLocal.formatReal(c.previsto+c.feito)} (🗓R$${libLocal.formatReal(c.previsto)} ✅R$${libLocal.formatReal(c.feito)})`);
      c.extrato.length > 0 && linhas.push('');
    }

    for (const cartao of cartoes) {
      cartao.fatura.length > 0 && linhas.push(`💳 ${cartao.nome.toUpperCase()} :${cartao.id}:`);

      for (const i of cartao.fatura) {
        const parcelas = i.total_parcelas > 1
          ? ` ${i.parcela}/${i.total_parcelas}`
          : null;

        const tags = mostrarTags && i.tags && i.tags.length > 0
          ? i.tags.map(t => `[${t}]`).join(' ')
          : null;

        const descricao = mostrarDescricao || !tags
          ? i.descritivo
          : null;

        const tipo = i.tipo === 'recorrente'
          ? '🔁'
          : i.tipo === 'parcelado'
            ? '🔢'
            : '1️⃣';

        linhas.push(`<pre>${tipo} ${libLocal.formatData(i.data)} R$ ${libLocal.formatReal(i.valor)}${parcelas || ''} ${tags || '-'} ${descricao || ''} :${i.id}:</pre>`);
      }

      total += cartao.total;
      cartao.fatura.length > 0 && linhas.push(`🧮 R$ ${libLocal.formatReal(cartao.total)}`);
      cartao.fatura.length > 0 && linhas.push('');
    }

    extratoExecutado.lista.length > 0 && linhas.push('💸 na mão');

    for (const e of extratoExecutado.lista) {
      const tags = e.tags && e.tags.length > 0
        ? e.tags.map(t => `[${t}]`).join(' ')
        : null;

      const descricao = e.descritivo;

      linhas.push(`<pre>${libLocal.formatData(e.data)} R$ ${libLocal.formatReal(e.valor)} ${tags || '-'} ${descricao || ''} :${e.id}:</pre>`);
    }

    extratoExecutado.lista.length > 0 && linhas.push(`🧮 R$ ${libLocal.formatReal(extratoExecutado.total)}`);
    extratoExecutado.lista.length > 0 && linhas.push('');

    linhas.push(`🏦 Contas R$ ${libLocal.formatReal(contas.totais.feito+contas.totais.previsto)}`);
    linhas.push(`💳 Cartões R$ ${libLocal.formatReal(-total)}`);
    linhas.push(`💸 Dinheiro R$ ${libLocal.formatReal(extratoExecutado.total)}`);
    linhas.push(`🧮 Total R$ ${libLocal.formatReal(contas.totais.feito+contas.totais.previsto-total+extratoExecutado.total)}`);
  }

  callback(linhas);  
};

module.exports = {
  alias: ['ft'],
  descricao: 'Buscar gastos por tag',
  exec,
}