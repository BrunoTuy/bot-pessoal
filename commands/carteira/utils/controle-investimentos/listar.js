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
    const { ativo, tipo, lista } = i.data();
    const totais = {
      primeiro: 0,
      segundo: 0,
      terceiro: 0,
      quarto: 0,
      longo: 0,
    };

    lista.filter(({ encerrado }) => !encerrado).forEach(({ valor, datas, tipo }) => {
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
  linhas.push(`1️⃣ até 90 dias R$ ${libLocal.formatReal(totalGeral.primeiro)}`);
  linhas.push(`2️⃣ até 180 dias R$ ${libLocal.formatReal(totalGeral.segundo)}`);
  linhas.push(`3️⃣ até 180 dias R$ ${libLocal.formatReal(totalGeral.terceiro)}`);
  linhas.push(`4️⃣ até 365 dias R$ ${libLocal.formatReal(totalGeral.quarto)}`);
  linhas.push(`⏩ mais de 1 ano R$ ${libLocal.formatReal(totalGeral.longo)}`);
  linhas.push('');
  linhas.push(`🏦 CDB ${(totalGeral.CDB/totalAplicado*100).toPrecision(2)}% R$ ${libLocal.formatReal(totalGeral.CDB)}`);
  linhas.push(`🇧🇷 Tesouro ${(totalGeral.TESOURO/totalAplicado*100).toPrecision(2)}% R$ ${libLocal.formatReal(totalGeral.TESOURO)}`);
  linhas.push(`🏢 FII ${(totalGeral.FII/totalAplicado*100).toPrecision(2)}% R$ ${libLocal.formatReal(totalGeral.FII)}`);
  linhas.push('');
  linhas.push(`🧮 Total R$ ${libLocal.formatReal(totalAplicado)}`);

  callback(linhas);
};

module.exports = {
  alias: ['l'],
  exec,
};
