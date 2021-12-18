const cartaoAdd = require('./cartao/add.js');

const exec = async ({ subComando, parametros, callback, lib, libLocal }) => {
  if (!parametros || parametros.length < 3) {
    callback([
      'Exemplo do comando abaixo',
      `${subComando} {data} {valor em centavos} {descritivo} / {tag um, tag dois}`,
    ]);
  } else {
    const data = parametros.shift();
    const valor = parametros.shift();
    const descritivo = parametros.join(' ');

    cartaoAdd.exec({
      lib,
      callback,
      libLocal,
      subComando,
      parametros: ['nubank', 1, data, valor, descritivo]
    });
  }
};

module.exports = {
  alias: ['na'],
  exec,
  descricao: 'Compra avista no cartão nubank'
};
