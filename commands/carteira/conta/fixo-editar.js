const listaContas = require('../dto/contaListar.js');

const exec = async ({ subComando, parametros, callback, lib: { banco: { list, update }}, libLocal }) => {
  const contas = await listaContas.exec({ list, somenteAtivo: true });

  if (parametros.length < 4) {
    const linhas = [];

    for (const conta of contas) {
      const { banco, recorrente } = conta;

      recorrente.length > 0 && linhas.push(`Banco ${banco.toUpperCase()} ${conta._id}`);

      for (const rec of recorrente) {
        const { id, dia, valor, descritivo, tags } = rec;

        linhas.push(`<pre>${id} D.${dia} R$ ${libLocal.formatReal(valor)} ${descritivo} ${(tags || []).map(t => `[${t}]`).join(' ')}</pre>`);
      }

      recorrente.length > 0 && linhas.push('');
    }

    linhas.push(`${subComando} {id conta} {id recorrente} dia {dia}`);
    linhas.push(`${subComando} {id conta} {id recorrente} valor {valor em centavos}`);
    linhas.push(`${subComando} {id conta} {id recorrente} tags {+|-} {nome da tag}`);
    linhas.push(`${subComando} {id conta} {id recorrente} descritivo {descritivo}`);

    callback(linhas);
  } else {
    const contaId = parametros.shift();
    const recorrenteId = parametros.shift();
    const tipoDado = parametros.shift().toString().toLowerCase();
    const dado = parametros.join(' ').trim();
    const { recorrente } = contas.find(({ _id: id }) => id === contaId);
    const item = recorrente.find(({ id }) => id === recorrenteId);

    if (tipoDado === 'dia') {
      item.dia = parseInt(dado);
    } else if (tipoDado === 'valor') {
      item.valor = parseInt(dado.substring(dado.length-1) === 'c'
        ? dado.substring(0, dado.length-1)
        : dado*-1);
    } else if (tipoDado === 'descritivo') {
      item.descritivo = dado;
    } else if (tipoDado === 'tags') {
      const operacao = dado.substring(0, 1);
      const tags = item.tags || [];
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
          `${subComando} {id conta} {id recorrente} tags {+|-} {nome da tag}`
        ]);        
      }
    } else {
      callback([
        'Parâmetros incorretos.',
        'Você pode alterar data, valor, descritivo e tags'
      ]);
    }

    if (item !== {}) {
      await update(({
        colecao: 'contas',
        registro: { _id: contaId },
        set: { recorrente }
      }));

      callback('Registro atualizado com sucesso.');
    }
  }
}

module.exports = {
  alias: ['fe'],
  descricao: 'Editar',
  exec,
}