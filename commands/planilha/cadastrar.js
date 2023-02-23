const limparNome = require('./_util/limparNome.js');

const exec = async ({ lib: { banco }, callback, subComando, parametros, user }) => {
  if (!parametros || parametros.length < 1) {
    callback([
      'Você deve enviar o nome da planilha',
      '',
      'Exemplo do comando abaixo',
      `${subComando} {nome da planilha}`,
    ]);
  } else {
    const nome = limparNome.exec(parametros.join(' '));
    const retorno = await banco.insert({
      colecao: 'planilhas',
      dados: {
        nome,
        criadaEm: new Date(),
        criadaPor: user.id,
        linhas: []
      }
    });

    callback && callback([
      `✅ <b>criada com sucesso</b>`,
      '',
      `<u>${nome}</u>`,
      `<pre>${retorno}</pre>`,
    ]);

  }
};

module.exports = {
  alias: ['cad'],
  descricao: 'Criar nova planilha',
  exec,
}