const cartaoAdd = require('./add.js');

const exec = async ({ subComando, parametros, callback, lib, libLocal }) => {
  if (!parametros || parametros.length < 3) {
    callback([
      'Exemplo do comando abaixo',
      `${subComando} {cartao} {data} {valor em centavos} {descritivo} / {tag um, tag dois}`,
    ]);
  } else {
    const cartao = parametros.shift();
    const data = parametros.shift();
    const valor = parametros.shift();
    const descritivo = parametros.join(' ');

    cartaoAdd.exec({
      lib,
      callback,
      libLocal,
      subComando,
      parametros: [cartao, 1, data, valor, descritivo]
    });
  }
};

module.exports = {
  alias: ['av'],
  exec,
  descricao: 'Compra avista no cartão'
};
