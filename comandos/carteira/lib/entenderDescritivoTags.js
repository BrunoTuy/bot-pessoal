const entenderValor = val => {
  const parametros = (val || '').split('/');
  const descritivo = parametros.shift();
  const tags = (parametros.shift() || '').split(',');

  return {
    descritivo,
    tags: tags.filter(t => t.length > 0).map(t => t.trim())
  };
}

module.exports = entenderValor;
