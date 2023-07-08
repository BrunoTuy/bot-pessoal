const consultaRecorrentes = require('../dto/cartoesRecorrentes.js');

const exec = async ({ subComando, parametros, callback, lib, libLocal }) => {
  const fixo = await consultaRecorrentes.exec({ lib });

  if (parametros.length < 4) {
    const linhas = [];

    for (const cartao of fixo) {
      const { nome } = cartao;
    
      cartao.lista.length > 0 && linhas.push(`Cartão ${nome.toUpperCase()} ${cartao.id}`);

      for (const rec of cartao.lista) {
        const { dia, valor, descritivo, tags } = rec;

        linhas.push(`<pre>${rec.id} D.${dia} R$ ${libLocal.formatReal(valor)} ${descritivo} ${(tags || []).map(t => `[${t}]`).join(' ')}</pre>`);
      }

      cartao.lista.length > 0 && linhas.push('');
    }

    linhas.push(`${subComando} {id cartao} {id recorrente} dia {dia}`);
    linhas.push(`${subComando} {id cartao} {id recorrente} valor {valor em centavos}`);
    linhas.push(`${subComando} {id cartao} {id recorrente} tags {+|-} {nome da tag}`);
    linhas.push(`${subComando} {id cartao} {id recorrente} descritivo {descritivo}`);

    callback(linhas);
  } else {
    const { update } = lib.banco;
    const contaId = parametros.shift();
    const recorrenteId = parametros.shift();
    const tipoDado = parametros.shift().toString().toLowerCase();
    const dado = parametros.join(' ').trim();
    const objSet = {};
    const { lista } = fixo.find(({ id }) => id === contaId);
    const item = lista.find(({ id }) => id === recorrenteId);

    if (tipoDado === 'dia') {
      item.dia = parseInt(dado);
    } else if (tipoDado === 'valor') {
      item.valor = dado.substring(dado.length-1) === 'c'
        ? dado.substring(0, dado.length-1)
        : dado*-1;
    } else if (tipoDado === 'descritivo') {
      item.descritivo = dado;
    } else if (tipoDado === 'tags') {
      const tags = item.tags || [];
      const operacao = dado.substring(0, 1);
      const tag = dado.substring(1).trim();

      if (operacao === '-') {
        item.tags = tags.filter(t => t.toLowerCase() !== tag.toLowerCase());
      } else if (operacao === '+') {
        item.tags = tags;
        item.tags.push(tag);
      } else {
        callback([
          'Parâmetros incorretos.',
          'Você pode adicionar ou remover uma tag',
          `${subComando} {id cartao} {id recorrente} tags {+|-} {nome da tag}`
        ]);        
      }
    } else {
      return callback([
        'Parâmetros incorretos.',
        'Você pode alterar data, valor, descritivo e tags'
      ]);
    }

    await update(({
      colecao: 'cartoes',
      registro: { _id: contaId },
      set: { recorrente: lista } }));
    callback('Registro atualizado com sucesso.');
  }
}

module.exports = {
  alias: ['fe'],
  descricao: 'Editar recorrente',
  exec,
}