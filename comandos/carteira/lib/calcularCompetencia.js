const calcularCompetencia = ({ competenciaInicial, parcela }) => {
  const date = new Date();
  const year = competenciaInicial ? parseInt(competenciaInicial.toString().substring(0, 4)) : date.getFullYear();
  const month = competenciaInicial ? parseInt(competenciaInicial.toString().substring(4, 6)) : date.getMonth()+1;
  const newMonth = month+parcela-1;

  return (year+Math.floor((newMonth-1)/12))*100+((newMonth-1)%12+1)
}

module.exports = calcularCompetencia;
