const numeroPositivo = valor => parseInt(valor) < 0 ? parseInt(valor) * -1 : parseInt(valor);

const exec = async ({ callback, lib, libLocal }) => {
  const list = await lib.firebase.db.collection('fp').get();
  const linhas = [];
  let total = 0;

  list.docs.forEach(i => {
    const { descritivo, debitos = [], creditos = [] } = i.data();
    const debitosTotal = debitos.reduce((a, { valor }) => a + numeroPositivo(valor), 0);

    let creditoFeito = 0;
    let creditoPendente = 0;

    creditos.forEach(({ valor, conta, status }) => {
      if (i.conta === 'dm' || i.status === 'feito') {
        creditoFeito += numeroPositivo(valor);
      } else {
        creditoPendente += numeroPositivo(valor);
      }
    });

    const creditosTotal = creditoFeito + creditoPendente;
    const saldo = -1 * debitosTotal + creditosTotal;
    const status = creditoPendente !== 0 && creditoPendente+creditoFeito-debitosTotal === 0
      ? '🗓'
      : creditoFeito === debitosTotal
        ? '✅'
        : '❌';

    total += saldo;

    linhas.push(`${status} ${descritivo} | D ${debitos.length} C ${creditos.length} Saldo ${libLocal.formatReal(saldo)}`);
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
