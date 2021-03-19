const exec = ({ subComando, parametros, callback, banco, lib, parametrosObj }) => {
  if ((!parametros || parametros.length < 4) && !parametrosObj) {
    callback([
      'Exemplo do comando abaixo',
      `${subComando} {data} {conta} {valor em centavos} {descritivo}`,
    ]);
  } else {
    if (parametrosObj && (
      !parametrosObj.data ||
      !parametrosObj.conta ||
      !parametrosObj.valor ||
      !parametrosObj.descritivo
    )) {
      callback(`Tem algo errado nos parametros para incluir compromisso cartão`);
    } else {
      const dataAgora = new Date();
      const data = parametrosObj ? parametrosObj.data : lib.entenderData(parametros.shift());
      const conta = parametrosObj ? parametrosObj.conta : parametros.shift();
      const strValor = (parametrosObj ? parametrosObj.valor : parametros.shift()).toString();
      const descritivo = parametrosObj ? parametrosObj.descritivo : parametros.join(' ');
      const fixoId = parametrosObj ? parametrosObj.fixoId : null;

      const valor = strValor.substring(strValor.length-1) === 'c'
        ? strValor.substring(0, strValor.length-1)
        : strValor*-1;

      const status = parametrosObj && parametrosObj.status
        ? parametrosObj.status
        : (dataAgora.getFullYear() > data.getFullYear()
          || (dataAgora.getFullYear() === data.getFullYear() && dataAgora.getMonth() > data.getMonth())
          || (dataAgora.getFullYear() === data.getFullYear() && dataAgora.getMonth() === data.getMonth() && dataAgora.getDate() >= data.getDate()))
          ? 'feito'
          : 'previsto';

      banco.sqlite.run(`
        INSERT INTO carteira_gastos_conta (data, conta, descritivo, valor, status, fixo_id)
        VALUES (${data.getTime()}, '${conta}', '${descritivo}', ${valor}, '${status}', ${fixoId})
      `);

      callback([
        `Cadastrado ${descritivo}`,
        `${conta}`,
        `Em ${data}`,
        `R$ ${valor/100}`
      ]);
    }
  }
}

module.exports = {
  alias: ['cca', 'ccadd'],
  exec,
}