const exec = async ({ parametros, subComando, callback, lib }) => {
  if (parametros.length != 2) {
    callback([
      'Para editar a competêcia use',
      `${subComando} {node do cartão} {nova competencia}`
    ]);
  } else {
    const { db } = lib.firebase;
    const cartaoNome = parametros.shift()
    const competencia = parametros.shift()
    const ano = competencia.toString().substring(0, 4);
    const mes = competencia.toString().substring(4, 6);
    const data = new Date();

    if (data.getFullYear() > ano || data.getMonth()+1 > mes) {
      callback('Competência inválida');
    } else {
      let mudou = false;
      let competenciaAntiga = null;
      const cartoes = await db.collection('cartoes').get();

      for (const cartao of cartoes.docs) {
        const d = cartao.data();

        if (d.nome.toLowerCase() === cartaoNome.toLowerCase()) {
          competenciaAntiga = d.competencia;
          const docRef = db.collection('cartoes').doc(cartao.id);

          docRef.update({ competencia });

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