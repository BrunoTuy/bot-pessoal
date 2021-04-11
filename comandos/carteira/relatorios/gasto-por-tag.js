const extrato = require('../dto/extrato.js');
const cartaoExtrato = require('../dto/cartaoExtrato.js');

const exec = async ({ parametros, subComando, callback, lib, libLocal }) => {
  const linhas = [];
  if (parametros < 1) {
    linhas.push(`${subComando} {tag}`);
  } else {
    const parametrosTexto = parametros.join(' ');
    const tags = parametrosTexto.split(',').map(t => t.trim());
    const mostrarTags = true;
    const mostrarDescricao = true;
    const contas = await extrato.exec({ lib, tags });
    const cartoes = await cartaoExtrato.exec({ lib, tags });
    let total = 0;

    for (const c of contas.lista) {
      c.extrato.length > 0 && linhas.push(`🏦 ${c.banco.toUpperCase()}`)

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

        linhas.push(`<pre>${formatStatus} ${libLocal.formatData(e.data)} R$ ${libLocal.formatReal(e.valor)} ${tags || '-'} ${descricao || ''}</pre>`);
      }

      c.extrato.length > 0 && linhas.push(`🧮 R$ ${libLocal.formatReal(c.previsto+c.feito)} (🗓R$${libLocal.formatReal(c.previsto)} ✅R$${libLocal.formatReal(c.feito)})`);
      c.extrato.length > 0 && linhas.push('');
    }

    for (const cartao of cartoes) {
      cartao.fatura.length > 0 && linhas.push(`💳 ${cartao.nome.toUpperCase()}`);

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

        linhas.push(`<pre>${tipo} ${libLocal.formatData(i.data)} R$ ${libLocal.formatReal(i.valor)}${parcelas || ''} ${tags || '-'} ${descricao || ''}</pre>`);
      }

      total += cartao.total;
      cartao.fatura.length > 0 && linhas.push(`🧮 R$ ${libLocal.formatReal(cartao.total)}`);
      cartao.fatura.length > 0 && linhas.push('');
    }

    linhas.push('------ Geral ------');
    linhas.push(`✅ Executado R$ ${libLocal.formatReal(contas.totais.feito)}`);
    linhas.push(`🗓 Previsto R$ ${libLocal.formatReal(contas.totais.previsto)}`);
    linhas.push(`🧮 Total R$ ${libLocal.formatReal(contas.totais.feito+contas.totais.previsto)}`);
  }

  callback(linhas);  
};

module.exports = {
  alias: ['ft'],
  descricao: 'Buscar gastos por tag',
  exec,
}