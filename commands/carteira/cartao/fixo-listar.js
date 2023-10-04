const consultaRecorrentes = require('../dto/cartoesRecorrentes.js');

const exec = async ({ callback, lib, libLocal }) => {
  const linhas = [];
  const fixo = await consultaRecorrentes.exec({ lib });
  let total = 0;

  for (const cartao of fixo) {
    let totalCartao = 0;
    const { nome } = cartao;
  
    for (const rec of cartao.lista) {
      const { dia, valor, descritivo, tags } = rec;

      totalCartao += valor;

      linhas.push(`<pre>D.${dia} R$ ${libLocal.formatReal(valor)} ${descritivo} ${(tags || []).map(t => `[${t}]`).join(' ')}</pre>`);
    }

    total += parseInt(totalCartao);
    totalCartao !== 0 && linhas.push(`- ${nome.toUpperCase()} R$ ${libLocal.formatReal(totalCartao)}`);
    totalCartao !== 0 && linhas.push('');
  }

  linhas.push(`Total R$ ${total/100}`);

  callback(linhas);
}

module.exports = {
  alias: ['fl'],
  descricao: 'Mostrar recorrentes',
  exec,
};
