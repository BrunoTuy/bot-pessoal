const exec = async ({ callback, lib, libLocal, parametros }) => {
  const codigo = parametros.join(' ');
  const doc = await lib.firebase.db.collection('cofre').doc(codigo).get();
  const data = doc.data();

  if (!data) {
    callback('Ativo não encontrado.');
  } else {
    const dataHoje = new Date();
    const linhas = [doc.id];
    const totais = {
      cotas: 0,
      ativo: 0,
      encerrado: 0,
      contadorAtivo: 0,
      contadorEncerrado: 0,
    };

    data.lista.forEach(({ encerrado, datas, cotas, corretora, valor, valorSaida, rendimento }) => {
      const dataVencimento = datas.saida
        ? new Date(datas.saida._seconds*1000)
        : null;
      const status = encerrado
        ? '❌'
        : '✅';
      const diasParaVencimento = dataVencimento
        ? ((dataVencimento - dataHoje)/86400000).toFixed(2)
        : null;

      totais.contadorAtivo += !encerrado ? 1 : 0;
      totais.contadorEncerrado += encerrado ? 1 : 0;
      totais.ativo += !encerrado ? valor : 0;
      totais.encerrado += encerrado ? valor : 0;
      totais.cotas += !encerrado ? cotas : 0;

      linhas.push(`<pre>${status} ${libLocal.formatData(datas.entrada._seconds*1000)}</pre>`);
      linhas.push(`Valor: R$ ${libLocal.formatReal(valor)} ${cotas ? ` - ${cotas} cotas a ${libLocal.formatReal(Math.ceil(valor/cotas))}` : ''}`);
      encerrado && linhas.push(`Valor saída: R$ ${libLocal.formatReal(valorSaida)} (Saldo ${libLocal.formatReal(valorSaida-valor)})`);
      datas.saida && linhas.push(`Vencimento: ${libLocal.formatData(datas.saida._seconds*1000)} (${diasParaVencimento} dias)`);
      rendimento && rendimento.tipo && rendimento.taxa && linhas.push(`Rendimento: ${rendimento.taxa} ${rendimento.tipo}`);
      corretora && linhas.push(`Corretora: ${corretora}`);
      linhas.push(' ');
    });

    linhas.push(`✅ ativos ${totais.contadorAtivo} R$ ${libLocal.formatReal(totais.ativo)}`);
    linhas.push(`❌ encerrados ${totais.contadorEncerrado} R$ ${libLocal.formatReal(totais.encerrado)}`);
    totais.contadorAtivo > 0 && totais.cotas > 0 && linhas.push(`Valor médio R$ ${libLocal.formatReal(Math.ceil(totais.ativo/totais.cotas))}`)

    callback(linhas);
  }
};

module.exports = {
  alias: ['v'],
  exec,
};
