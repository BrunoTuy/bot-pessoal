const exec = async ({ parametros, subComando, callback, lib: { banco: { list, update } } }) => {
  if (parametros.length != 2) {
    callback([
      'Para editar a competêcia use',
      `${subComando} {nome do cartão} {nova competencia}`
    ]);
  } else {
    const cartaoNome = parametros.shift()
    const competencia = parametros.shift()
    const ano = competencia.toString().substring(0, 4);
    const mes = competencia.toString().substring(4, 6);
    const data = new Date();

    if (data.getFullYear() > ano || (data.getFullYear() >= ano && data.getMonth()+1 > mes)) {
      callback('Competência inválida');
    } else {
      let mudou = false;
      let competenciaAntiga = null;
      const colecao = 'cartoes';

      const cartoes = await list({ colecao, filtro: { ativo: true } });

      for (const d of cartoes) {
        if (d.nome.toLowerCase() === cartaoNome.toLowerCase()) {
          competenciaAntiga = d.competencia;

          await update({
            colecao,
            registro: { _id: d._id },
            set: { competencia }
          });

          mudou = true;
        }
      }

      callback(`Competência do cartão ${cartaoNome.toUpperCase()} ${mudou ? 'alterado' : 'não alterado'} de ${competenciaAntiga} para ${competencia}`);
    }
  }
}

module.exports = {
  alias: ['dc'],
  descricao: 'Definir competência atual do cartão',
  exec,
}