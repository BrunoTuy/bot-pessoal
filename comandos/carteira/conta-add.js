const exec = async ({ subComando, parametros, callback, lib, libLocal, parametrosObj }) => {
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
      callback(`Tem algo errado nos parametros para incluir compromisso na conta`);
    } else {
      const dataAgora = new Date();
      const data = parametrosObj ? parametrosObj.data : libLocal.entenderData(parametros.shift());
      const conta = parametrosObj ? parametrosObj.conta : parametros.shift();
      const strValor = (parametrosObj ? parametrosObj.valor : parametros.shift()).toString();
      const descritivo = parametrosObj ? parametrosObj.descritivo : parametros.join(' ');
      const recorrente = parametrosObj ? parametrosObj.recorrente : null;
      const { db } = lib.firebase;

      const queryRef = db.collection('contas').where('banco', '==', conta);
      const contasGet = await queryRef.get();

      if (contasGet.size !== 1) {
        callback('Conta não cadastrada.');
      } else {
        const contaDoc = contasGet.docs[0];
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

        const obj = await db.collection('contas').doc(contaDoc.id).collection('extrato');

        obj && obj.add({
          data: data.getTime(),
          dataTexto: data,
          valor,
          descritivo,
          status,
          recorrente
        });

        callback([
          `Cadastrado ${descritivo}`,
          `${conta}`,
          `Em ${data}`,
          `R$ ${valor/100}`
        ]);
      }
    }
  }
};

module.exports = {
  alias: ['cca', 'ccadd'],
  exec,
};
