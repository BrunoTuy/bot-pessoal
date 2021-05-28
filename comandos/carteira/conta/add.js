const exec = async ({ subComando, parametros, callback, lib, libLocal, parametrosObj }) => {
  if ((!parametros || parametros.length < 4) && !parametrosObj) {
    callback([
      'Exemplo do comando abaixo',
      `${subComando} {conta} {data} {valor em centavos} {descritivo}`,
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
      const conta = parametrosObj ? parametrosObj.conta : parametros.shift();
      const data = parametrosObj ? parametrosObj.data : libLocal.entenderData(parametros.shift());
      const valor = libLocal.entenderValor({ val: parametros.shift() });
      const { descritivo, tags } = parametros && libLocal.entenderDescritivoTags(parametros.join(" "));
      const recorrente = parametrosObj && parametrosObj.recorrente ? parametrosObj.recorrente : null;
      const { db } = lib.firebase;

      const queryRef = db.collection('contas').where('banco', '==', conta);
      const contasGet = await queryRef.get();

      if (contasGet.size !== 1) {
        callback('Conta não cadastrada.');
      } else {
        const contaDoc = contasGet.docs[0];
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
          valor: parseInt(valor),
          descritivo,
          status,
          recorrente,
          tags
        });

        callback([
          `Cadastrado ${descritivo}`,
          `${conta}`,
          `Em ${data}`,
          `R$ ${valor/100}`,
          `${(tags || []).map(t => `[${t.trim()}]`).join(' ')}`
        ]);
      }
    }
  }
};

module.exports = {
  alias: ['a'],
  descricao: 'Adicionar',
  exec,
};
