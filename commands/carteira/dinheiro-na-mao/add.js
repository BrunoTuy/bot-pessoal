const exec = async ({ subComando, parametros, callback, lib, libLocal }) => {
  if (!parametros || parametros.length < 3) {
    callback([
      'Exemplo do comando abaixo',
      `${subComando} {data} {valor em centavos} {descritivo}`,
    ]);
  } else {
    const dataAgora = new Date();
    const data = libLocal.entenderData(parametros.shift());
    const valor = libLocal.entenderValor({ val: parametros.shift() });
    const { descritivo, tags } = parametros && libLocal.entenderDescritivoTags(parametros.join(" "));

    const obj = await lib.firebase.db.collection('dinheiro');

    callback([
      `Cadastrado ${descritivo}`,
      `Em ${data}`,
      `R$ ${valor/100}`,
      `${(tags || []).join(' ')}`
    ]);

    const retorno = await obj.add({
      data: data.getTime(),
      dataTexto: data,
      valor,
      descritivo,
      tags
    });

    callback(`✅ Inserido ${retorno.id}`)
  }
};

module.exports = {
  alias: ['a'],
  descricao: 'Adicionar',
  exec,
};
