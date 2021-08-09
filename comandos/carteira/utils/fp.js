const extrato = require('../dto/extrato.js');
const dinheiroExtrato = require('../dto/dinheiroExtrato.js');

const exec = async ({ parametros, callback, lib, libLocal }) => {
  const linhas = [];
  const tags = ['fp'];
  const contas = await extrato.exec({ lib, tags });
  const extratoExecutado = await dinheiroExtrato.exec({ lib, tags });
  let listaMista = [];

  contas.lista.forEach(c => {
    listaMista = c.extrato.map(e => ({
      ...e,
      tipo: 'cc',
      nome: c.banco
    }))
  });

  listaMista = listaMista.concat(extratoExecutado.lista.map(e => ({
    ...e,
    tipo: 'dm'
  })));

  callback(linhas);  
};

module.exports = {
  alias: ['fp'],
  descricao: 'Financiamento pessoal',
  exec,
};
