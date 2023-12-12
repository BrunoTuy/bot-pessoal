const exec = async ({ callback, lib, libLocal }) => {
  const list = await lib.firebase.db.collection('cofre').get();
  const linhas = [];
  const totalGeral = {
      primeiro: 0,
      segundo: 0,
      terceiro: 0,
      quarto: 0,
      longo: 0,
      CDB: 0,
      TESOURO: 0,
      FII: 0,
    };

  list.docs.forEach(i => {
    const { tipo, lista } = i.data();
    const totais = {
      primeiro: 0,
      segundo: 0,
      terceiro: 0,
      quarto: 0,
      longo: 0,
    };

    lista.filter(({ encerrado }) => !encerrado).forEach(({ valor, datas }) => {
      const dataHoje = new Date();
      const dataSaida = datas.saida
        ? new Date(datas.saida._seconds*1000)
        : null;
      const diasDiferenca = dataSaida
        ? (dataSaida-dataHoje)/86400000
        : 367;

      if (diasDiferenca < 91) {
        totais.primeiro += valor;
      } else if (diasDiferenca < 181) {
        totais.segundo += valor;
      } else if (diasDiferenca < 271) {
        totais.terceiro += valor;
      } else if (diasDiferenca < 366) {
        totais.quarto += valor;
      } else {
        totais.longo += valor;
      }
    })

    const t1 = totais.primeiro
      ? `1️⃣ ${libLocal.formatReal(totais.primeiro)} `
      : '';
    const t2 = totais.segundo
      ? `2️⃣ ${libLocal.formatReal(totais.segundo)} `
      : '';
    const t3 = totais.terceiro
      ? `3️⃣ ${libLocal.formatReal(totais.terceiro)} `
      : '';
    const t4 = totais.quarto
      ? `4️⃣ ${libLocal.formatReal(totais.quarto)} `
      : '';
    const tl = totais.longo
      ? `⏩ ${libLocal.formatReal(totais.longo)}`
      : '';
    const total = totais.primeiro + totais.segundo + totais.terceiro + totais.quarto + totais.longo;

    total > 0 && linhas.push(`${i.id} R$ ${libLocal.formatReal(total)} (${t1}${t2}${t3}${t4}${tl})`);

    totalGeral[tipo] += total;
    totalGeral.primeiro += totais.primeiro;
    totalGeral.segundo += totais.segundo;
    totalGeral.terceiro += totais.terceiro;
    totalGeral.quarto += totais.quarto;
    totalGeral.longo += totais.longo;
  });

  const totalAplicado = totalGeral.CDB + totalGeral.TESOURO + totalGeral.FII;

  linhas.push('');
  linhas.push(`<pre>1️⃣ até 90d  ${(totalGeral.primeiro/totalAplicado*100).toPrecision(2)}% R$ ${libLocal.formatReal(totalGeral.primeiro)}</pre>`);
  linhas.push(`<pre>2️⃣ até 180d ${(totalGeral.segundo/totalAplicado*100).toPrecision(2)}% R$ ${libLocal.formatReal(totalGeral.segundo)}</pre>`);
  linhas.push(`<pre>3️⃣ até 270d ${(totalGeral.terceiro/totalAplicado*100).toPrecision(2)}% R$ ${libLocal.formatReal(totalGeral.terceiro)}</pre>`);
  linhas.push(`<pre>4️⃣ até 365d ${(totalGeral.quarto/totalAplicado*100).toPrecision(2)}% R$ ${libLocal.formatReal(totalGeral.quarto)}</pre>`);
  linhas.push(`<pre>⏩ 1ano+    ${(totalGeral.longo/totalAplicado*100).toPrecision(2)}% R$ ${libLocal.formatReal(totalGeral.longo)}</pre>`);
  linhas.push('');
  linhas.push(`<pre>🇧🇷 Tesouro  ${(totalGeral.TESOURO/totalAplicado*100).toPrecision(2)}% R$ ${libLocal.formatReal(totalGeral.TESOURO)}</pre>`);
  linhas.push(`<pre>🏦 CDB      ${(totalGeral.CDB/totalAplicado*100).toPrecision(2)}% R$ ${libLocal.formatReal(totalGeral.CDB)}</pre>`);
  linhas.push(`<pre>🏢 FII      ${(totalGeral.FII/totalAplicado*100).toPrecision(2)}% R$ ${libLocal.formatReal(totalGeral.FII)}</pre>`);
  linhas.push('');
  linhas.push(`🧮 Total R$ ${libLocal.formatReal(totalAplicado)}`);

  callback(linhas);
};

module.exports = {
  alias: ['st'],
  exec,
};
