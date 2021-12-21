const formatData = ( valor, format ) => {
  const data = new Date(valor);
  const mes = data.getMonth()+1 < 10 ? `0${data.getMonth()+1}` : data.getMonth()+1;
  const dia = data.getDate() < 10 ? `0${data.getDate()}` : data.getDate();

  return format === 'dia'
    ? dia
    : `${format !== 'mes-dia' ? `${data.getFullYear()}-` : ''}${mes}-${dia}`;
};

module.exports = formatData;
