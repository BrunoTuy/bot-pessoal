const limparNome = require('./_util/limparNome.js');

const exec = async ({ lib, callback, subComando, parametros, user }) => {
  if (!parametros || parametros.length < 1) {
    callback([
      'Você deve enviar o nome da planilha',
      '',
      'Exemplo do comando abaixo',
      `${subComando} {nome da planilha}`,
    ]);
  } else {
    const nome = limparNome.exec(parametros.join(' '));
    const obj = await lib.firebase.db.collection('planilhas');
    const retorno = await obj.add({
      nome,
      criadaEm: new Date(),
      criadaPor: user.id,
      linhas: []
    });

    callback && callback([
      `✅ <b>criada com sucesso</b>`,
      '',
      `<u>${nome}</u>`,
      `<pre>${retorno.id}</pre>`,
    ]);

  }
};

module.exports = {
  alias: ['cad'],
  descricao: 'Criar nova planilha',
  exec,
}