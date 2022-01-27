const buscarMovimento = async (lib, conta, movimento) => {
  const { db } = lib.firebase;
  let docRef;
  let docData;

  if (conta === 'dm') {
    docRef = db.collection('dinheiro').doc(movimento);
    docData = (await docRef.get()).data();
  } else {
    const ccRef = db.collection('contas').doc(conta);
    const ccData = (await ccRef.get()).data();

    if (!ccData || ccData === 'undefined') {
      const cdRef = db.collection('cartoes').doc(conta);
      cdData = (await cdRef.get()).data();

      if (cdData) {
        docRef = cdRef.collection('fatura').doc(movimento);
        docData = (await docRef.get()).data();
      }
    } else {
      docRef = ccRef.collection('extrato').doc(movimento);
      docData = (await docRef.get()).data();
    }
  }

  if (!docData || docData === 'undefined') {
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
