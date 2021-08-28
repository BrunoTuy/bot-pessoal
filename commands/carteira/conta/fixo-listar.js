const consultaRecorrentes = require('../dto/contasRecorrentes.js');

const exec = async ({ parametros, callback, lib, libLocal }) => {
  const linhas = [];
  const fixo = await consultaRecorrentes.exec({ lib });
  let total = 0;

  for (const conta of fixo) {
    let totalConta = 0;
    const { banco } = conta;
  
    for (const rec of conta.lista) {
      const { dia, valor, descritivo, tags } = rec;

      totalConta += valor;

      linhas.push(`<pre>D.${dia} R$ ${libLocal.formatReal(valor)} ${descritivo} ${(tags || []).map(t => `[${t}]`).join(' ')}</pre>`);
    }

    total += totalConta;
    totalConta > 0 && linhas.push(`- ${banco.toUpperCase()} R$ ${libLocal.formatReal(totalConta)}`);
    totalConta > 0 && linhas.push('');
  }

  linhas.push(`Total R$ ${total/100}`);

  callback(linhas);
}

module.exports = {
  alias: ['fl'],
  descricao: 'Mostrar recorrentes',
  exec,
};
