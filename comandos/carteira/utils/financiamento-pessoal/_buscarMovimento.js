const buscarMovimento = async (lib, conta, movimento) => {
  const { db } = lib.firebase;
  const docRef = conta === 'dm'
    ? db.collection('dinheiro').doc(movimento)
    : db.collection('contas').doc(conta).collection('extrato').doc(movimento);
  const docData = (await docRef.get()).data();

  if (docData === 'undefined') {
    return false;
  } else {
    return {
      ref: docRef,
      data: {
        ...docData,
        conta,
        id: movimento,
      }
    };
  }
};

module.exports = buscarMovimento;
