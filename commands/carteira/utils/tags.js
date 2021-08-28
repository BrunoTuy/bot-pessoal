const extrato = require('../dto/extrato.js');
const fatura = require('../dto/cartaoExtrato.js');
const dinheiroExtrato = require("../dto/dinheiroExtrato");

const exec = async ({ parametros, callback, subComando, lib }) => {
  const { db } = lib.firebase;
  const docRef = db.collection('tags').doc('last');
  const obj = await docRef.get();

  if (parametros && parametros.length > 0 && parametros[0].toLowerCase() === 'u') {
    const tags = {};
    callback('Atualizando lista, aguarde!');

    const contas = await extrato.exec({ lib, dataTotal: true });
    contas.lista.forEach(c =>
      c.extrato.forEach(e => 
        e.tags && e.tags.forEach(t => {
          if (t.length > 0) {
            if (!tags[t]) {
              tags[t] = {
                cc: 0,
                cd: 0,
                dm: 0
              }
            }

            tags[t].cc++;
          }
        })
      )
    );

    const cartoes = await fatura.exec({ lib, dataTotal: true });
    cartoes.forEach(c =>
      c.fatura.forEach(f =>
        f.tags && f.tags.forEach(t => {
          if (t.length > 0) {
            if (!tags[t]) {
              tags[t] = {
                cc: 0,
                cd: 0,
                dm: 0
              }
            }

            tags[t].cd++;
          }
        })
      )
    );

    const extratoExecutado = await dinheiroExtrato.exec({ lib });
    extratoExecutado.lista.forEach(e =>
      e.tags && e.tags.forEach(t => {
          if (t.length > 0) {
            if (!tags[t]) {
            tags[t] = {
              cc: 0,
              cd: 0,
              dm: 0
            }
          }

          tags[t].dm++;
        }
      })
    );

    const objSet = {
      atualizado: new Date().getTime(),
      tags
    };
    
    if(obj.data()) {
      docRef.update(objSet);
    } else {
      docRef.set(objSet);
    }

    callback('Lista atualizada');
  } else if (parametros && parametros.length > 0 && parametros[0].toLowerCase() === 'l') {
    const linhas = [];
    const { atualizado, tags } = obj.data();
    const data = new Date(atualizado);

    Object.entries(tags).sort((a, b) => a[0] < b[0] ? -1 : 1).forEach(l => {
      linhas.push(`<pre>${l[0]}</pre> CC ${l[1].cc} - CD ${l[1].cd} - DM ${l[1].dm}`)
    });

    linhas.push('');
    linhas.push(`<pre>Atualizado ${data}</pre>`);

    callback(linhas);
  } else {
    const data = new Date(obj.data().atualizado);
    callback([
      `${subComando} l - listar tags`,
      `${subComando} u - atualizar lista de tags`,
      '',
      `<pre>Atualizado ${data}</pre>`
    ]);
  }
};

module.exports = {
  alias: ['tag'],
  descricao: 'Lista de tags',
  exec,
}