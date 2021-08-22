const numeroPositivo = valor => parseInt(valor) < 0 ? parseInt(valor) * -1 : parseInt(valor);

const exec = async ({ callback, lib, libLocal }) => {
  const list = await lib.firebase.db.collection('fp').get();
  const linhas = [];
  let total = 0;

  list.docs.forEach(i => {
    const { descritivo, debitos = [], creditos = [] } = i.data();
    const debitosTotal = debitos.reduce((a, { valor }) => a + numeroPositivo(valor), 0);
    const creditosTotal = creditos.reduce((a, { valor }) => a + numeroPositivo(valor), 0);
    const saldo = -1 * debitosTotal + creditosTotal;

    total += saldo;

    linhas.push(`${descritivo} | Deb ${debitos.length} $ ${libLocal.formatReal(debitosTotal)} | Cre ${creditos.length} $ ${libLocal.formatReal(creditosTotal)} | Saldo ${libLocal.formatReal(saldo)}`);
  });

  linhas.push('');
  linhas.push(`Financiamentos ${list.size}`);
  linhas.push(`Saldo R$ ${libLocal.formatReal(total)}`);

  callback(linhas);
};

module.exports = {
  alias: ['l'],
  exec,
};
