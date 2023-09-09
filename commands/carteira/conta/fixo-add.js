const listaContas = require('../dto/contaListar.js');

const exec = async ({ subComando, parametros, callback, lib: { banco: { list, update, newId }} }) => {
  if (parametros.length < 4) {
    callback([
      'Exemplo do comando abaixo',
      `${subComando} {conta} {dia} {valor em centavos} {descritivo}`,
    ]);
  } else {
    const contaNome = parametros.shift();
    const dia = parseInt(parametros.shift());
    const valor = parseInt(parametros.shift());
    const descritivo = parametros.join(' ');

    const contas = await listaContas.exec({ contaNome, list, somenteAtivo: true });

    if (contas.length !== 1) {
      callback('Conta não cadastrada.');
    } else {
      const { _id: contaId, banco, recorrente } = contas.shift();
      const listaRecorrente = recorrente || [];

      listaRecorrente.push({
        id: newId(),
        dia,
        valor,
        descritivo
      });

      await update(({
        colecao: 'contas',
        registro: { _id: contaId },
        set: { recorrente: listaRecorrente }
      }));

      callback([
        'Cadastrado',
        `${banco} - ${descritivo}`,
        `Dia ${dia}`,
        `R$ ${valor/100}`
      ]);
    }
  }
}

module.exports = {
  alias: ['fa'],
  descricao: 'Cadastrar recorrente',
  exec,
};
