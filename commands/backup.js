const fs = require("fs");
const request = require('request')
const JSZip = require('jszip');

const exec = async ({ bot, callback, lib }) => {
  const zip = new JSZip();
  const { db } = lib.firebase;
  const cartoes = await db.collection('cartoes').get();

  callback('Gerando o backup moral');

  const cartoesLista = [];


  for (const c of cartoes.docs) {
    const { ativo, banco, competencia, nome, vencimento } = c.data();

    cartoesLista.push(`${c.id};${nome};${competencia};${vencimento};${banco};${ativo}`);
  }

  for (const c of cartoes.docs) {
    const fatura = await db.collection('cartoes').doc(c.id).collection('fatura').get();
    const recorrente = await db.collection('cartoes').doc(c.id).collection('recorrente').get();

    const listaFatura = fatura.docs.map(f => {
      const { competencia, data, descritivo, parcela, total_parcelas, valor, recorrente, tags } = f.data();

      return `${f.id};${competencia};${data};"${descritivo}";${parcela};${total_parcelas};${valor};${recorrente?.id};${(tags || []).join(',')}`;
    });

    const listaRecorrente = recorrente.docs.map(f => {
      const { descritivo, dia, valor, tags } = f.data();

      return `${dia};"${descritivo}";${valor};${(tags || []).join(',')}`;
    });

    zip.file(`cartao.${c.id}.fatura.csv`, (listaFatura || []).join('\n'));
    zip.file(`cartao.${c.id}.recorrente.csv`, (listaRecorrente || []).join('\n'));
  }

  try {
    zip.file("cartoes.csv", cartoesLista.join('\n'));

    zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(fs.createWriteStream('temp/backup.zip'))
      .on('finish', function () {
          console.log("backup.zip written.");
      });
  } catch (err) {
    console.error(err)
  }
}

module.exports = {
  restricted: true,
  exec
};
