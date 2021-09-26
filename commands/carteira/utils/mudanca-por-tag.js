const extrato = require('../dto/extrato.js');
const fatura = require('../dto/cartaoExtrato.js');
const dinheiroExtrato = require("../dto/dinheiroExtrato");

const ajustarTag = (lista, operacao, tag) => {
  let nLista = lista;

  if (operacao === '-t') {
    nLista = lista.filter(t => t.toLowerCase() !== tag);
  } else  if (!nLista.find(t => t === tag)) {
    nLista.push(tag);
  }

  return nLista;
}

const exec = async ({ parametros, callback, subComando, lib }) => {
  if (parametros &&
      parametros.length > 0 &&
      (parametros.includes('-t') || parametros.includes('+t'))
  ) {
    const { db } = lib.firebase;
    const docRef = db.collection('tags').doc('last');
    const obj = await docRef.get();
    const { atualizado, tags } = obj.data();
    const arrTag = [];
    const linhas = [];

    while (!['-t', '+t'].includes(parametros[0])) {
      arrTag.push(parametros.shift());
    }

    const tag = arrTag.join(' ');
    const operacao = parametros.shift();
    const tagOperacao = parametros.join(' ').toLowerCase();
    const buscarResumoTag = Object.entries(tags).find(([key, value]) => key === tag);
    const data = new Date(atualizado);

    linhas.push(`Indices atualizados em ${data}`);
    linhas.push('');

    if (buscarResumoTag) {
      linhas.push(`Registros encontrados DM ${buscarResumoTag[1].dm} - CD ${buscarResumoTag[1].cd} - CC ${buscarResumoTag[1].cc}`);
      linhas.push(`<pre>Dinheiro ${buscarResumoTag[1].dm}</pre>`);
      linhas.push(`<pre>Cartão ${buscarResumoTag[1].cd}</pre>`);
      linhas.push(`<pre>Conta ${buscarResumoTag[1].cc}</pre>`);

      const extratoExecutado = await dinheiroExtrato.exec({ lib, tags: [tag] });
      extratoExecutado.lista.forEach(async e => {
        const docRef = db.collection('dinheiro').doc(e.id);
        const nTags = ajustarTag(e.tags, operacao, tagOperacao);

        await docRef.update({ tags: nTags });
      });

      const cartoes = await fatura.exec({ lib, dataTotal: true, tags: [tag] });
      cartoes.forEach(c =>
        c.fatura.forEach(async f => {
          const docRef = db.collection('cartoes').doc(c.id).collection('fatura').doc(f.id);
          const nTags = ajustarTag(f.tags, operacao, tagOperacao);

          await docRef.update({ tags: nTags });
        })
      );


      const contas = await extrato.exec({ lib, dataTotal: true, tags: [tag] });
      contas.lista.forEach(c =>
        c.extrato.forEach(async e => {
          const docRef = db.collection('contas').doc(c.id).collection('extrato').doc(e.id);
          const nTags = ajustarTag(e.tags, operacao, tagOperacao);

          await docRef.update({ tags: nTags });
        })
      );

      linhas.push('Registros atualizados');
    } else {
      linhas.push('Tag não encontrada');
    }

    callback(linhas);
  } else {
    callback('ta faltando coisa');
  }
};

module.exports = {
  alias: ['mpt'],
  descricao: 'Mudanças em lote por tag',
  exec,
}