const entenderValor = ({ val, cartao }) => {
  const strValor = val.toString();
  const valor = strValor.substring(strValor.length-1) === 'c'
    ? strValor.substring(0, strValor.length-1)
    : strValor*-1;

  return cartao 
  	? parseInt(valor*-1)
  	: parseInt(valor);
}

module.exports = entenderValor;
