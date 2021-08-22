const buscarMovimento = require('./_buscarMovimento.js');

const exec = async ({ parametros, callback, subComando, lib }) => {
  const { db } = lib.firebase;

  if (parametros.length < 3) {
    callback([
      'Exemplo do comando abaixo',
      `<pre>${subComando} {dm/codigo conta} {codigo movimento} {descritivo}</pre>`,
    ]);  
  } else {
    const data = new Date();
    const conta = parametros.shift();
    const movimento = parametros.shift();
    const descritivo = parametros.join(' ');
    const obj = await db.collection('fp');
    const debitos = [];
    const doc = await buscarMovimento(lib, conta, movimento);

    if (!doc) {
      callback('Débito não encontrado.');
    } else if (doc.data.fp) {
      callback('Débito já vinculado a um financiamento.');
    } else {
      debitos.push({
        ...doc.data,
        conta,
        id: movimento,
      });

      const retorno = await obj.add({
        data: data.getTime(),
        dataTexto: data,
        debitos,
        descritivo
      });

      const movSet = {
        fp: retorno.id,
        tags: doc.data.tags || []
      };

      if (!movSet.tags.includes('fp')) {
        movSet.tags.push('fp');
      }

      if (!movSet.tags.includes('fp gasto')) {
        movSet.tags.push('fp gasto');
      }

      doc.ref.update(movSet);

      const subComandoArray = subComando.split(' ');
      subComandoArray.pop();
      const localSubComando = subComandoArray.join(' ');

      callback([
        'Financiamento cadastrado com sucesso.',
        '',
        'Para cadastrar mais débitos use:',
        `<pre>${localSubComando} e ${retorno.id} +d {dm/codigo conta} {codigo movimento}</pre>`,
        '',
        'Para remover um débitos use:',
        `<pre>${localSubComando} e ${retorno.id} -d {dm/codigo conta} {codigo movimento}</pre>`,
      ]);
    }
  }
};

module.exports = {
  alias: ['a'],
  exec,
};
