const exec = async ({ callback, lib, libLocal }) => {
  const list = await lib.firebase.db.collection('cofre').get();
  const linhas = [];
  let totalGeral = 0;

  list.docs.forEach(i => {
    const { ativo, tipo, lista } = i.data();
    let total = 0;

    lista.filter(({ encerrado }) => !encerrado).forEach(({ valor }) => {
      total += valor;
    })

    linhas.push(`${i.id} R$ ${libLocal.formatReal(total)}`);
    totalGeral += total;
  });

  linhas.push('');
  linhas.push(`Total aplicado R$ ${libLocal.formatReal(totalGeral)}`);

  callback(linhas);
};

module.exports = {
  alias: ['l'],
  exec,
};
