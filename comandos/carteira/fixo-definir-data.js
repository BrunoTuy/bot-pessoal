const consultaRecorrentes = require('./dto/recorrentes.js');

const exec = async ({ subComando, parametros, callback, lib, libLocal }) => {
  const fixo = await consultaRecorrentes.exec({ lib });

  if (parametros.length < 2) {
    const linhas = [];

    for (const conta of fixo.contas) {
      conta.lista && conta.lista.length > 0 && linhas.push(`Conta ${conta.nome}`);

      for (const rec of conta.lista) {
        linhas.push(`${rec.id} D.${rec.dia} R$ ${libLocal.formatReal(rec.valor)} ${rec.descritivo}`)
      }

      conta.lista && conta.lista.length > 0 && linhas.push('');
    }

    for (const cartao of fixo.cartoes) {
      linhas.push(`Cartão ${cartao.nome}`);

      for (const rec of cartao.lista) {
        linhas.push(`${rec.id} D.${rec.dia} R$ ${libLocal.formatReal(rec.valor)} ${rec.descritivo}`)
      }

      linhas.push('');
    }

    linhas.push('Exemplo do comando abaixo');
    linhas.push(`${subComando} {id} {dia}`);

    callback(linhas);
  } else {
    const id = parametros.shift();
    const dia = parametros.shift();
    let contaId = null;
    let collection = null;

    for (const rec of fixo.geral) {
      if (rec.recId === id) {
        contaId = rec.paiId;
        collection = rec.tipo;
        break;
      }
    }

    if (contaId) {
      const docRef = lib.firebase.db.collection(collection).doc(contaId).collection('recorrente').doc(id);

      docRef.update({ dia });

      callback('Compromisso atualizado.');
    } else {
      callback('Compromisso não encontrado.');
    }
  }
}

module.exports = {
  alias: ['fd', 'fdata'],
  exec,
}