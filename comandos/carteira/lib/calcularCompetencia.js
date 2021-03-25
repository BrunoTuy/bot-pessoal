const calcularCompetencia = ({ competenciaInicial, parcela }) => {
  const year = parseInt(competenciaInicial.toString().substring(0, 4));
  const month = parseInt(competenciaInicial.toString().substring(4, 6))+parcela-1;

  return (year+Math.floor((month-1)/12))*100+((month-1)%12+1)
}

module.exports = calcularCompetencia;
