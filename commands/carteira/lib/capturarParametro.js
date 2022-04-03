const capturarParametro = ( texto, parametro ) => {
  const parametros = texto.split('!');
  const parametroEncontrado = parametros.find(p => p.indexOf(`${parametro}:`) === 0);

  return parametroEncontrado
   ? parametroEncontrado.substring(parametro.length + 1).trim()
   : null;
};

module.exports = capturarParametro;
