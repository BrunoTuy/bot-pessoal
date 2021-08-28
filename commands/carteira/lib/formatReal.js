const formatReal = valor => {
  const arrayValor = (valor/100).toString().split('.');
  const centavos = (arrayValor.length === 2 ? arrayValor[1] : '00').toString();
  const centavosFormatado = centavos.length === 2 ? centavos : `${centavos}0`;

  return `${arrayValor[0]},${centavosFormatado}`;
};

module.exports = formatReal;
