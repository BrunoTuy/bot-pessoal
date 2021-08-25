const buscarMovimento = require('../utils/financiamento-pessoal/_buscarMovimento.js');

const contaEditar = async ({ lib, contaId, extratoId, data }) => {
  const { db } = lib.firebase;
  const docRef = db.collection('contas').doc(contaId).collection('extrato').doc(extratoId);
  const docData = (await docRef.get()).data();

  if (docData === 'undefined') {
    throw new Error('Movimento não encontrado.');
  }

  const { fp } = docData;

  await docRef.update(data);

  if (fp) {
    const fpRef = db.collection('fp').doc(fp);
    const fpDoc = (await fpRef.get()).data();
    const movimento = await buscarMovimento(lib, contaId, extratoId);
    const fpSet = {};

    if (fpDoc.debitos.filter(({ conta, id }) => id === extratoId && conta === contaId).length > 0) {
      fpSet.debitos = fpDoc.debitos.filter(({ conta, id }) => id !== extratoId && conta !== contaId);
      fpSet.debitos.push(movimento.data);
    } else if (fpDoc.creditos.filter(({ conta, id }) => id === extratoId && conta === contaId).length > 0) {
      fpSet.creditos = fpDoc.creditos.filter(({ conta, id }) => id !== extratoId && conta !== contaId);
      fpSet.creditos.push(movimento.data);
    }

    if (Object.entries(fpSet).length > 0) {
      await fpRef.update(fpSet);
    }
  }

  return true;
}

module.exports = contaEditar;
