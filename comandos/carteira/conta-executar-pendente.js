const exec = async ({ subComando, parametros, callback, banco, lib, libLocal }) => {
  const { db } = lib.firebase;

  if (parametros.length === 4) {
    const contaId = parametros.shift();
    const extratoId = parametros.shift();
    const data = libLocal.entenderData(parametros.shift());
    const strValor = parametros.shift().toString();

    const valor = strValor.substring(strValor.length-1) === 'c'
      ? strValor.substring(0, strValor.length-1)
      : strValor*-1;

    const docRef = db.collection('contas').doc(contaId).collection('extrato').doc(extratoId);
    docRef.update({
      valor,
      status: 'feito',
      dataTexto: data,
      data: data.getTime()
    });

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

      extrato.size > 0 && linhas.push(`-- ${conta.data().banco} ${conta.id}`);

      for (const i of extrato.docs) {
        const { data, status, valor, descritivo } = i.data();
        const formatStatus = status === 'previsto fixo'
          ? 'PF'
          : 'PC'

        linhas.push(`${i.id} ${libLocal.formatData(data)} ${formatStatus} R$${libLocal.formatReal(valor)} ${descritivo}`);
      }

      extrato.size > 0 && linhas.push('');
    }

    linhas.push(`${subComando} {conta id} {movimento id} {dia|data} {valor}`);

    callback(linhas);
  }
}

module.exports = {
  alias: ['cxp', 'ccxp'],
  exec,
}