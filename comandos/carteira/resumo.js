const extrato = require('./dto/extrato.js');

const exec = async ({ parametros, callback, lib, libLocal }) => {
  let linhas = [];
  const data = new Date();
  const digitado = parametros.length > 0;
  const anoMes = parametros.length > 0 && parametros[0].length === 6 && parametros[0] > 202101
    ? parametros.shift()
    : data.getFullYear()*100+(data.getMonth()+1);
  const contas = await extrato.exec({ anoMes, lib });

  for (const conta of contas.lista) {
    conta.previsto !== 0 && linhas.push(`<pre>🗓 Previsto R$ ${libLocal.formatReal(conta.previsto)}</pre>`);
    conta.feito !== 0 && linhas.push(`<pre>✅ Executado R$ ${libLocal.formatReal(conta.feito)}</pre>`);
    (conta.previsto !== 0 || conta.feito !== 0) && linhas.push(`<pre>🧮 ${conta.banco.toUpperCase()} Saldo R$ ${libLocal.formatReal(conta.feito+conta.previsto)}</pre>`);
    (conta.previsto !== 0 || conta.feito !== 0) && linhas.push('');
  }

  linhas.push(`<pre>🗓 Previsto R$ ${libLocal.formatReal(contas.totais.previsto)}</pre>`);
  linhas.push(`<pre>✅ Executado R$ ${libLocal.formatReal(contas.totais.feito)}</pre>`);
  linhas.push(`<b>🧮 ${anoMes} R$ ${libLocal.formatReal(contas.totais.feito+contas.totais.previsto)}</b>`);

  if (!digitado) {
    const ano = parseInt(anoMes.toString().substring(0, 4));
    const mes = parseInt(anoMes.toString().substring(4, 6));
    const proximo = (mes+1 > 12 ? ano+1 : ano)*100 + (mes+1 > 12 ? 1 : mes+1);
    const proximasContas = await extrato.exec({ anoMes: proximo, lib });

    linhas.push('');

    for (const conta of proximasContas.lista) {
      conta.previsto !== 0 && linhas.push(`<pre>🗓 ${conta.banco.toUpperCase()} Previsto R$ ${libLocal.formatReal(conta.previsto)}</pre>`);
    }

    linhas.push(`<b>🧮 ${proximo} Total R$ ${libLocal.formatReal(proximasContas.totais.feito+proximasContas.totais.previsto)}</b>`);
  }

  callback(linhas);  
};

module.exports = {
  alias: ['status', 'st'],
  exec,
}