const exec = async ({ callback, lib: { firebase: { db }, banco: { insert, list, update } } }) => {
  const colecao = 'contas';
  const contasFirebase = await db.collection('contas').get();
  const contasMongo = await list({ colecao });

  const dataMax = new Date();
  dataMax.setDate(dataMax.getDate() + 731);

  callback('Importação do contas iniciada.');

  for (const contaFire of contasFirebase.docs) {
    const recorrentesFire = await db.collection('contas').doc(contaFire.id).collection('recorrente').get();
    const extratoFire = await db.collection('contas').doc(contaFire.id).collection('extrato').where('data', '<=', dataMax.getTime()).get();
    const contaM = contasMongo.find(({ _id }) => _id.toString() === contaFire.id);
    const recorrente = [];

    for (const rec of recorrentesFire.docs) {
      recorrente.push({...rec.data(), id: rec.id});
    }

    callback([
      `Conta ${contaFire.data().banco}`,
      `Recorrentes: ${recorrentesFire.docs.length}`,
      `Extrato: ${extratoFire.docs.length}`
    ]);

    if (!contaM) {
      await insert({ colecao, dados: {
        _id: contaFire.id,
        ...contaFire.data(),
        recorrente,
        import: true
      } });
    } else {
      await update({
        colecao,
        registro: { _id: contaFire.id },
        set: {
          ...contaFire.data(),
          recorrente
        }
      });
    }

    for (const mov of extratoFire.docs) {
      const extratoMongo = await list({
        colecao: 'contas_extrato',
        filtro: { contaId: contaFire.id }
      });
      const movMongo = extratoMongo.find(({ _id }) => _id.toString() === mov.id);

      if (!movMongo) {
        await insert({ 
          colecao: 'contas_extrato',
          dados: {
            _id: mov.id,
            contaId: contaFire.id,
            ...mov.data(),
            import: true
          }
        });
      }
    }
  }
};

module.exports = {
  alias: ['cc'],
  descricao: 'Carteira contas',
  exec,
}