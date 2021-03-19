const calcularCompetencia = ({ data, cartao }) =>
  data.getFullYear()*100+(data.getMonth() > 10
    ? 101
    : data.getMonth()+2);

module.exports = calcularCompetencia;
