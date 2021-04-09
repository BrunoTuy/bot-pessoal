const exec = async ({ subComando, parametros, callback, lib, libLocal }) => {
  const { db } = lib.firebase;

  if (parametros.length === 2) {
    const contaId = parametros.shift();
    const extratoId = parametros.shift();

    const docRef = db.collection('contas').doc(contaId).collection('extrato').doc(extratoId);
    docRef.update({ status: 'feito' });

    callback('Registro atualizado')
  } else {
    const linhas = [];
    const data = new Date();

    data.setHours(23);
    data.setMinutes(59);
    data.setSeconds(59);
    data.setMilliseconds(999);

    const contas = await db.collection('contas').get();
    for (const conta of contas.docs) {
      const extrato = await db.collection('contas').doc(conta.id).collection('extrato')
        .where('data', '<=', data.getTime())
        .where('status', 'in', ['previsto', 'previsto fixo'])
        .orderBy('data')
        .get();

      extrato.size > 0 && linhas.push(`${conta.data().banco.toUpperCase()}`);

      for (const i of extrato.docs) {
        const { data, status, valor, descritivo } = i.data();
        const formatStatus = status === 'previsto fixo'
          ? 'PF'
          : 'PC'

        linhas.push(`<pre>${conta.id} ${i.id} ${libLocal.formatData(data)} ${formatStatus} R$${libLocal.formatReal(valor)} ${descritivo}</pre>`);
      }

      extrato.size > 0 && linhas.push('');
    }

    linhas.push(`${subComando} {conta id} {movimento id}`);

    callback(linhas);
  }
}

module.exports = {
  alias: ['xp'],
  descricao: 'Executar pendência',
  exec,
}