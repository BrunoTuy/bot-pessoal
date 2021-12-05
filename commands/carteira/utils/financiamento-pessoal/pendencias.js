const extrato = require('../../dto/extrato.js');
const dinheiroExtrato = require('../../dto/dinheiroExtrato.js');

const entenderValor = ({ valor, tags }) =>
  ((tags.includes('resgate') || tags.includes('fp gasto')) && valor > 0) || valor < 0
    ? valor * -1
    : valor;

const entenderStatus = ({ status }) =>
  status === 'feito'
    ? '✅'
    : '🗓';

const exec = async ({ subComando, parametros, callback, lib, libLocal }) => {
  const linhas = [];
  const tags = ['fp'];
  const contas = await extrato.exec({ lib, tags });
  const extratoExecutado = await dinheiroExtrato.exec({ lib, tags });
  let listaMista = [];
  let total = 0;

  contas.lista.forEach(c => {
    listaMista = c.extrato.filter(({ fp }) => !fp).map(e => ({
      ...e,
      conta: c.id,
      nome: c.banco,
      valor: entenderValor(e)
    }))
  });

  listaMista = listaMista.concat(extratoExecutado.lista.filter(({ fp }) => !fp).map(e => ({
    ...e,
    conta: 'dm',
    status: 'feito',
    valor: entenderValor(e)
  })));

  const listaOrdenada = listaMista.sort((a, b) => a.data > b.data ? 1 : -1);

  callback(listaOrdenada.map(i => `<pre>${entenderStatus(i)} ${libLocal.formatData(i.data)} $ ${libLocal.formatReal(i.valor)} | ${i.descritivo} :${i.conta}: :${i.id}:</pre>`));
  callback(linhas);
};

module.exports = {
  alias: ['pe'],
  exec,
};
