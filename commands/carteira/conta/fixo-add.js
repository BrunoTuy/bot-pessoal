const exec = async ({ subComando, parametros, callback, lib }) => {
  if (parametros.length < 4) {
    callback([
      'Exemplo do comando abaixo',
      `${subComando} {conta} {dia} {valor em centavos} {descritivo}`,
    ]);
  } else {
    const conta = parametros.shift();
    const dia = parseInt(parametros.shift());
    const valor = parseInt(parametros.shift());
    const descritivo = parametros.join(' ');
    const { db } = lib.firebase;
    const queryRef = db.collection('contas').where('banco', '==', conta);
    const contasGet = await queryRef.get();

    if (contasGet.size !== 1) {
      callback('Conta não cadastrada.');
    } else {
      const contaDoc = contasGet.docs[0];
      const obj = await db.collection('contas').doc(contaDoc.id).collection('recorrente');

      obj && obj.add({
        dia,
        valor,
        descritivo
      });

      callback([
        'Cadastrado',
        `${contaDoc.data().banco} - ${descritivo}`,
        `Dia ${dia}`,
        `R$ ${valor/100}`
      ]);
    }
  }
}

module.exports = {
  alias: ['fa'],
  descricao: 'Cadastrar recorrente',
  exec,
};
