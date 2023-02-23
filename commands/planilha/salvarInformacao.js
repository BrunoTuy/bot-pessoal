const limparNome = require('./_util/limparNome.js');
const listaPlanilhas = require('./_util/listaPlanilhas.js');

const exec = async ({ lib, callback, subComando, parametros, user }) => {
  const planilhas = await listaPlanilhas.exec({ lib, user });

  if (planilhas.length < 1) {
    callback('Você ainda não tem nenhuma planilha cadastrada.');
  } else if (!parametros || parametros.length < 1) {
    callback([
      'Comando inválido',
      '',
      'Exemplo do comando abaixo',
      `${subComando} !i{id} !l{linha} !d{nome da colula}: dado a ser salvo`,
      '',
      'Você só precisa informar a linha se o dado for salvo em uma linha que não seja a ultima.'
    ]);
  } else {
    const idDigitado = parametros.join(' ');
    const nomeDigitado = limparNome.exec(idDigitado);
    const { id, nome, linhas } = planilhas.length === 1
      ? planilhas.shift()
      : planilhas.find(({ id, nome }) => id === idDigitado || nome === nomeDigitado) || {};

    if (id) {
      const docRef = await lib.firebase.db.collection('planilhas').doc(id);

      linhas.push({
        criadaEm: new Date(),
        criadaPor: user.id
      });

      docRef.update({ linhas });

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
  alias: ['s'],
  descricao: 'Salvar informação',
  exec,
}