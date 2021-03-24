const cartaoAdd = require('./cartao-add.js');

const exec = async ({ subComando, parametros, callback, banco, lib }) => {
  if (!parametros || parametros.length < 3) {
    callback([
      'Exemplo do comando abaixo',
      `${subComando} {data} {valor em centavos} {descritivo}`,
    ]);
  } else {
    const data = lib.entenderData(parametros.shift());
    const valor = parametros.shift();
    const descritivo = parametros.join(' ');

    cartaoAdd.exec({
      lib,
      banco,
      callback,
      subComando,
      parametrosObj: {
        data,
        valor,
        parcelas: 1,
        cartao: 'inter',
        descritivo: descritivo
      }
    });
  }
}

module.exports = {
  alias: ['ia'],
  exec,
}