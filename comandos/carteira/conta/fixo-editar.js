const consultaRecorrentes = require('../dto/contasRecorrentes.js');

const exec = async ({ subComando, parametros, callback, lib, libLocal }) => {
  if (parametros.length < 4) {
    const linhas = [];
    const fixo = await consultaRecorrentes.exec({ lib });

    for (const conta of fixo) {
      const { banco } = conta;
    
      conta.lista.length > 0 && linhas.push(`Banco ${banco.toUpperCase()} ${conta.id}`);

      for (const rec of conta.lista) {
        const { dia, valor, descritivo, tags } = rec;

        linhas.push(`<pre>${rec.id} D.${dia} R$ ${libLocal.formatReal(valor)} ${descritivo} ${(tags || []).map(t => `[${t}]`).join(' ')}</pre>`);
      }

      conta.lista.length > 0 && linhas.push('');
    }

    linhas.push(`${subComando} {id conta} {id recorrente} dia {dia}`);
    linhas.push(`${subComando} {id conta} {id recorrente} valor {valor em centavos}`);
    linhas.push(`${subComando} {id conta} {id recorrente} tags {+|-} {nome da tag}`);
    linhas.push(`${subComando} {id conta} {id recorrente} descritivo {descritivo}`);

    callback(linhas);
  } else {
    const { db } = lib.firebase;
    const contaId = parametros.shift();
    const recorrenteId = parametros.shift();
    const tipoDado = parametros.shift().toString().toLowerCase();
    const dado = parametros.join(' ').trim();
    const objSet = {};
    const docRef = db.collection('contas').doc(contaId).collection('recorrente').doc(recorrenteId);

    if (tipoDado === 'dia') {
      objSet.dia = parseInt(dado);
    } else if (tipoDado === 'valor') {
      objSet.valor = dado.substring(dado.length-1) === 'c'
        ? dado.substring(0, dado.length-1)
        : dado*-1;
    } else if (tipoDado === 'descritivo') {
      objSet.descritivo = dado;
    } else if (tipoDado === 'tags') {
      const doc = await docRef.get();
      const tags = doc.data().tags || [];
      const operacao = dado.substring(0, 1);
      const tag = dado.substring(1).trim();

      if (operacao === '-') {
        objSet.tags = tags.filter(t => t.toLowerCase() !== tag.toLowerCase());
      } else if (operacao === '+') {
        objSet.tags = tags;
        objSet.tags.push(tag);
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

    if (objSet !== {}) {
      docRef.update(objSet);
      callback('Registro atualizado com sucesso.');
    }
  }
}

module.exports = {
  alias: ['fe'],
  descricao: 'Editar',
  exec,
}