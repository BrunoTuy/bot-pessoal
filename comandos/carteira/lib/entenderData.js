const entenderData = entrada => {
  const data = new Date();

  if (entrada === 'ontem') {
    data.setDate(data.getDate()-1);
  } else if (['amanha', 'amanhã'].includes(entrada)) {
    data.setDate(data.getDate()+1);
  } else if (entrada.length < 3) {
    data.setDate(entrada);
  } else if (entrada !== 'hoje') {
    const arrayData = entrada.split('-');
    let ano = false;
    let mes = false;
    let dia = false;

    if (arrayData.length === 3) {
      ano = arrayData[2];
      mes = arrayData[1];
      dia = arrayData[0];
    } else if (entrada.length === 8) {
      ano = entrada.substring(0, 4);      
      mes = entrada.substring(4, 6);
      dia = entrada.substring(6, 8);
    }

    if (ano && mes && dia && ano > 2019
      && mes > 0 && mes < 13
      && dia > 0 && dia < 32)
    {
      data.setFullYear(ano)
      data.setMonth(mes-1, dia);
    }
  }

  return data;
};

module.exports = entenderData;
