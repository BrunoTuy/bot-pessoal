const entenderData = entrada => {
  const data = new Date();
  
  data.setHours(12);

  if (entrada === 'ontem') {
    data.setDate(data.getDate()-1);
  } else if (['amanha', 'amanhã'].includes(entrada)) {
    data.setDate(data.getDate()+1);
  } else if (entrada.length < 3) {
    data.setDate(entrada);
  } else if (entrada.toLowerCase() === 'imes') {
    data.setDate(1);
  } else if (entrada.toLowerCase() === 'fmes') {
    if (data.getMonth() > 10) {
      data.setFullYear(data.getFullYear(+1));
      data.setMonth(1);
    } else {
      data.setMonth(data.getMonth()+1);
    }

    data.setDate(1);
    data.setDate(data.getDate()-1);
  } else if (entrada.toLowerCase() === 'iano') {
    data.setMonth(0, 1);
  } else if (entrada.toLowerCase() === 'fano') {
    data.setMonth(11, 31);
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
