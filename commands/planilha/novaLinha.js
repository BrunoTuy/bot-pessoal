const limparNome = require('./_util/limparNome.js');
const listaPlanilhas = require('./_util/listaPlanilhas.js');

const exec = async ({ lib, callback, subComando, parametros, user }) => {
  const planilhas = await listaPlanilhas.exec({ lib, user });

  if (planilhas.length < 1) {
    callback('Você ainda não tem nenhuma planilha cadastrada.');
  } else if (planilhas.length > 1 && (!parametros || parametros.length < 1)) {
    callback([
      'Você deve enviar o nome ou código da planilha',
      '',
      'Exemplo do comando abaixo',
      `${subComando} {id/nome da planilha}`,
    ]);
  } else {
    const idDigitado = parametros.join(' ');
    const nomeDigitado = limparNome.exec(idDigitado);
    const { id, nome, linhas } = planilhas.length === 1
      ? planilhas.shift()
      : planilhas.find(({ id, nome }) => id === idDigitado || nome === nomeDigitado) || {};

    if (id) {
      linhas.push({
        criadaEm: new Date(),
        criadaPor: user.id
      });

      lib.banco.update({
        id,
        colecao: 'planilhas',
        set: { linhas }
      });

      callback([
        `Linha ${linhas.length} na planilha <u>${nome}</u>`,
        `✅ <b>criada com sucesso</b>`
      ]);
    } else {
      callback('Não encontramos planilha com esse id ou nome.');
    }
  }
};

module.exports = {
  alias: ['nl'],
  descricao: 'Criar nova linha',
  exec,
}