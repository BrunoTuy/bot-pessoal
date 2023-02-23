const listaPlanilhas = require('./_util/listaPlanilhas.js');

const exec = async ({ callback, ...params }) => {
  const planilhas = await listaPlanilhas.exec(params);
  const linhas = [];

  console.log('Lista', planilhas);

  for (const item of planilhas) {
    const { nome, id } = item;

    linhas.push(`<code>${id}</code> ${nome}`);
  }

  if (linhas.length > 0) {
    callback(linhas);
  } else {
    callback('Você não tem nenhuma planilha cadastrada.')
  }
};

module.exports = {
  alias: ['ls'],
  descricao: 'Listar planilhas',
  exec,
}