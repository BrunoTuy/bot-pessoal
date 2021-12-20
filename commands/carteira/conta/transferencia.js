const contaAdd = require('./add.js');

const exec = async ({ subComando, parametros, callback, lib, libLocal }) => {
  if (!parametros || parametros.length < 4) {
    callback([
      'Exemplo do comando abaixo',
      `${subComando} {conta origem} {conta destino} {data} {valor em centavos}`
    ]);
  } else {
    const contaOrigem = parametros.shift();
    const contaDestino = parametros.shift();
    const data = parametros.shift();
    const valor = parseInt(parametros.shift());
    const contasId = {
      origem: null,
      destino: null,
    };

    const { db } = lib.firebase;
    const contas = await db.collection('contas').get();

    for (const conta of contas.docs) {
      if (contaOrigem === conta.data().banco || contaOrigem === conta.data().sigla) {
        contasId.origem = conta.id;
      } else if (contaDestino === conta.data().banco || contaDestino === conta.data().sigla) {
        contasId.destino = conta.id;
      }
    }

    if (contasId.origem === null) {
      callback(`Conta ${contaOrigem} não cadastrada.`);
    } else if (contasId.destino === null) {
      callback(`Conta ${contaDestino} não cadastrada.`);
    } else {
      contaAdd.exec({
        lib,
        libLocal,
        callback,
        parametros: [contaOrigem, data, valor, `Transferência para ${contaDestino} / transf BMT`]
      });

      contaAdd.exec({
        lib,
        libLocal,
        callback,
        parametros: [contaDestino, data, `${valor}c`, `Transferência de ${contaOrigem} / transf BMT`]
      });
    }
  }
};

module.exports = {
  alias: ['tsf'],
  descricao: 'Transferência entre contas',
  exec,
};
