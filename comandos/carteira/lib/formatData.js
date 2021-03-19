const formatData = valor => {
  const data = new Date(valor)
  const mes = data.getMonth()+1 < 10 ? `0${data.getMonth()+1}` : data.getMonth()+1;
  const dia = data.getDate() < 10 ? `0${data.getDate()}` : data.getDate();

  return `${data.getFullYear()}-${mes}-${dia}`;
};

module.exports = formatData;
