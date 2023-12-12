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

const exec = async ({ callback, lib, libLocal }) => {
  const linhas = [];
  const tags = ['fp'];
  const contas = await extrato.exec({ lib, tags });
  const extratoExecutado = await dinheiroExtrato.exec({ lib, tags });
  let listaMista = [];
  let total = 0;

  contas.lista.forEach(c => {
    listaMista = c.extrato.map(e => ({
      ...e,
      tipo: 'cc',
      tipoIcone: '🏦',
      nome: c.banco,
      valor: entenderValor(e)
    }))
  });

  listaMista = listaMista.concat(extratoExecutado.lista.map(e => ({
    ...e,
    tipo: 'dm',
    tipoIcone: '💵',
    status: 'feito',
    valor: entenderValor(e)
  })));

  const listaOrdenada = listaMista.sort((a, b) => a.data > b.data ? 1 : -1);

  callback(listaOrdenada.map(i => `<pre>${entenderStatus(i)} ${libLocal.formatData(i.data)} ${i.tipoIcone} ${libLocal.formatReal(total+=parseInt(i.valor))} $ ${libLocal.formatReal(i.valor)} | ${i.descritivo}</pre>`));
  callback(linhas);
};

module.exports = {
  alias: ['rx'],
  descricao: 'Raio-X',
  exec,
};
