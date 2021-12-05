const exec = async ({ callback, lib, libLocal }) => {
  const list = await lib.firebase.db.collection('fp').get();
  const linhas = [];
  const totais = {
    debitos: 0,
    creditoFeito: 0,
    creditoPendente: 0
  };

  list.docs.forEach(i => {
    const { descritivo, debitos = [], creditos = [] } = i.data();
    const debitosTotal = debitos.reduce((a, { valor }) => a + libLocal.numeroPositivo(valor), 0);

    let creditoFeito = 0;
    let creditoPendente = 0;

    creditos.forEach(({ valor, conta, status }) => {
      if (conta === 'dm' || status === 'feito') {
        creditoFeito += libLocal.numeroPositivo(valor);
      } else {
        creditoPendente += libLocal.numeroPositivo(valor);
      }
    });

    totais.debitos += debitosTotal;
    totais.creditoFeito += creditoFeito;
    totais.creditoPendente += creditoPendente;

    const status = creditoPendente !== 0 && creditoPendente+creditoFeito-debitosTotal === 0
      ? '🗓'
      : creditoFeito === debitosTotal
        ? '✅'
        : '❌';
    const pago = creditoFeito !== 0
      ? ` ✅ ${libLocal.formatReal(creditoFeito)}`
      : ''
    const parcelado = creditoPendente !== 0
      ? ` 🔢 ${libLocal.formatReal(creditoPendente)}`
      : '';
    const semParcelas = debitosTotal-creditoPendente-creditoFeito !== 0
      ? ` ⁉️ ${libLocal.formatReal(debitosTotal-creditoPendente-creditoFeito)}`
      : '';

    linhas.push(`${status} ${descritivo} | ⛔️ ${libLocal.formatReal(debitosTotal)}${pago}${parcelado}${semParcelas}`);
  });

  linhas.push('');
  linhas.push(`Financiamentos ${list.size}`);
  linhas.push(`⛔️ Débitos R$ ${libLocal.formatReal(totais.debitos)}`);
  linhas.push(`✅ Pago R$ ${libLocal.formatReal(totais.creditoFeito)}`);
  linhas.push(`🔢 Parcelado R$ ${libLocal.formatReal(totais.creditoPendente)}`);
  linhas.push(`⁉️ Sem parcelas R$ ${libLocal.formatReal(totais.debitos-totais.creditoPendente-totais.creditoFeito)}`);

  callback(linhas);
};

module.exports = {
  alias: ['l'],
  exec,
};
