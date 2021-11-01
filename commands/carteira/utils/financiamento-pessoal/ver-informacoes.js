const numeroPositivo = valor => parseInt(valor) < 0 ? parseInt(valor) * -1 : parseInt(valor);

const exec = async ({ callback, lib, libLocal, subComando, parametros }) => {
  if (parametros.length === 1) {
    const codigo = parametros.shift();
    const doc = await lib.firebase.db.collection('fp').doc(codigo).get();

    if (!doc.id) {
      callback('Finaciamento não encontrado.');
    } else {
      let deb = 0;
      let creditoFeito = 0;
      let creditoPendente = 0;
      const linhas = [];
      const { descritivo } = doc.data();
      let { debitos, creditos } = doc.data();

      if (!debitos) {
        debitos = [];
      }

      if (!creditos) {
        creditos = [];
      }

      linhas.push(descritivo);
      linhas.push('');
      linhas.push(`Debitos ${debitos.length}`);

      debitos.sort((a ,b) => a.data > b.data ? 1 : -1).forEach(i => {
        const valor = numeroPositivo(i.valor);
        deb += valor;

        linhas.push(`<pre>${i.conta === 'dm' || i.status === 'feito' ? '✅' : '🗓'} ${libLocal.formatData(i.data)} R$ ${libLocal.formatReal(valor)} ${i.descritivo}</pre>`)
      });

      linhas.push('');
      linhas.push(`Creditos ${creditos.length}`);

      creditos.sort((a ,b) => a.data > b.data ? 1 : -1).forEach(i => {
        const valor = numeroPositivo(i.valor);

        if (i.conta === 'dm' || i.status === 'feito') {
          creditoFeito += valor;
        } else {
          creditoPendente += valor;
        }

        linhas.push(`<pre>${i.conta === 'dm' || i.status === 'feito' ? '✅' : '🗓'} ${libLocal.formatData(i.data)} R$ ${libLocal.formatReal(valor)}</pre>`)
      });

      linhas.push('');
      linhas.push(`Débitos R$ ${libLocal.formatReal(deb)}`);
      linhas.push(`Creditos feitos R$ ${libLocal.formatReal(creditoFeito)}`);
      linhas.push(`Creditos pendentes R$ ${libLocal.formatReal(creditoPendente)}`);
      linhas.push('');

      if (creditoPendente !== 0 && creditoPendente+creditoFeito-deb === 0) {
        linhas.push('🗓 Financiamento com parcelamento feito.');
      } else if (creditoFeito === deb) {
        linhas.push('✅ Financiamento pago.');
      } else {
        linhas.push('❌ Financiamento com parcelas não cadastradas.');
      }

      callback(linhas);
    }
  } else {
    const list = await lib.firebase.db.collection('fp').get();
    const linhas = list.docs.map(i => `<pre>${i.id} - ${i.data().descritivo}</pre>`);
  
    linhas.push('');
    linhas.push('Para ver informações');
    linhas.push(`<pre>${subComando} {codigo}</pre>`);
  
    callback(linhas);
  }
};

module.exports = {
  alias: ['v'],
  descricao: 'Mostrar informações',
  exec,
};
