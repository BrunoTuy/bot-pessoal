const capturarParametro = ( texto, parametro ) => {
  const parametros = texto.split('!');
  const parametroEncontrado = parametros.find(p => p.indexOf(`${parametro}:`) === 0);

  return parametroEncontrado
   ? parametroEncontrado.substring(2).trim()
   : null;
};

module.exports = capturarParametro;
