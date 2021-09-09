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
    const creditoPendente = creditos.reduce((a, { valor, conta, status }) => a + (conta !== 'dm' || status !== 'feito' ? 0 : numeroPositivo(valor)) );
    const creditoFeito = creditos.reduce((a, { valor, conta, status }) => a + (conta === 'dm' || status === 'feito' ? numeroPositivo(valor) : 0) );

    const status = creditoPendente !== 0 && creditoPendente+creditoFeito-debitosTotal === 0
      ? '🗓'
      : creditoFeito === debitosTotal
        ? '✅'
        : '❌';

    total += saldo;

    linhas.push(`${status} ${descritivo} | D${debitos.length}$${libLocal.formatReal(debitosTotal)} | C${creditos.length}$${libLocal.formatReal(creditosTotal)} | S$${libLocal.formatReal(saldo)}`);
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
