const contaAdd = require('../../conta/add.js');
const editar = require('./editar.js');

const exec = async ({ callback, parametros, lib, libLocal, subComando }) => {
  const valorPendente = ({ debitos, creditos }) => {
    const totalDebitos = !debitos || !debitos.reduce ? 0 : debitos.reduce((a, { valor }) => a + libLocal.numeroPositivo(valor), 0);
    const totalCreditos = !creditos || !creditos.reduce ? 0 : creditos.reduce((a, { valor }) => a + libLocal.numeroPositivo(valor), 0);

    return totalDebitos-totalCreditos;
  };
  const { db } = lib.firebase;

  if (parametros.length < 3) {
    const list = await db.collection('fp').get();
    const linhas = list.docs
      .filter(i => valorPendente(i.data()) > 0)
      .map(i => `${i.id} ${i.data().descritivo} ⁉️ ${libLocal.formatReal(valorPendente(i.data()))}`);

    linhas.push('');
    linhas.push('Para gerar parcelas use:');
    linhas.push(`<pre>${subComando} {codigo financiamento} {data da primeira parcela} {numero de parcelas}</pre>`);

    callback(linhas);
  } else {
    const codigo = parametros.shift();
    const dataInicio = libLocal.entenderData(parametros.shift());
    const parcelas = parseInt(parametros.shift());
    const fpRef = db.collection('fp').doc(codigo);
    const fpData = (await fpRef.get()).data();

    if (fpData === 'undefined') {
      return callback('Financiamento não encontrado.');
    }

    if (dataInicio.getDate() > 28) {
      dataInicio.setDate(28);
    }

    let debitos = valorPendente(fpData);
    const parcela = Math.floor(debitos/parcelas);
    const ultimaParcela = debitos-parcela*(parcelas-1);

    for (let x = 1; x <= parcelas; x++) {
      const retorno = await contaAdd.exec({
        lib,
        libLocal,
        callback,
        parametrosObj: {
          tags: ['fp'],
          data: dataInicio,
          valor: (x === parcelas ? ultimaParcela : parcela)*-1,
          descritivo: `${fpData.descritivo} parc ${x}.${parcelas}`,
          conta: 'nubank'
        }
      });

      await editar.exec({
        lib,
        callback,
        parametros: [codigo, '+c', retorno.conta, retorno.movimento]
      });

      dataInicio.setMonth(dataInicio.getMonth()+1);
    }
  }
};

module.exports = {
  alias: ['pa'],
  exec,
};
