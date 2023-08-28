const listaContas = require('../dto/contaListar.js');

const exec = async ({ subComando, parametros, callback, lib: { banco: { list, insert } }, libLocal, parametrosObj }) => {
  if ((!parametros || parametros.length < 4) && !parametrosObj) {
    callback([
      'Exemplo do comando abaixo',
      `${subComando} {conta} {data} {valor em centavos} {descritivo}`,
    ]);
  } else {
    if (parametrosObj && (
      !parametrosObj.data ||
      !parametrosObj.conta ||
      !parametrosObj.valor ||
      !parametrosObj.descritivo
    )) {
      callback(`Tem algo errado nos parametros para incluir compromisso na conta`);
    } else {
      const dataAgora = new Date();
      const conta = parametrosObj ? parametrosObj.conta : parametros.shift();
      const data = parametrosObj ? parametrosObj.data : libLocal.entenderData(parametros.shift());
      const valor = parametrosObj ? parametrosObj.valor : libLocal.entenderValor({ val: parametros.shift() });
      const { descritivo, tags } = parametrosObj && parametrosObj.descritivo
        ? libLocal.entenderDescritivoTags(parametrosObj.descritivo)
        : parametros &&libLocal.entenderDescritivoTags(parametros.join(" "));
      const recorrente = parametrosObj && parametrosObj.recorrente ? parametrosObj.recorrente : null;

      const contas = await listaContas.exec({ list, contaNome: conta, somenteAtivo: true });

      if (contas.length !== 1) {
        callback('Conta não cadastrada.');
      } else {
        const status = parametrosObj && parametrosObj.status
          ? parametrosObj.status
          : (dataAgora.getFullYear() > data.getFullYear()
            || (dataAgora.getFullYear() === data.getFullYear() && dataAgora.getMonth() > data.getMonth())
            || (dataAgora.getFullYear() === data.getFullYear() && dataAgora.getMonth() === data.getMonth() && dataAgora.getDate() >= data.getDate()))
            ? 'feito'
            : 'previsto';

        const { _id: contaId } = contas[0];

        const dados = {
          contaId,
          data: data.getTime(),
          dataTexto: data,
          valor: parseInt(valor),
          descritivo,
          status,
          recorrente,
          tags,
        };

        const id = await insert({ 
          colecao: 'contas_extrato',
          dados
        });

        callback([
          `${conta} - ${descritivo}`,
          `Em ${data}`,
          `R$ ${valor/100}`,
          `${(tags || []).map(t => `[${t.trim()}]`).join(' ')}`,
          `<pre>✅ Inserido ${contaId} ${id}</pre>`
        ]);

        return {
          conta: contaId,
          movimento: id,
        };
      }
    }
  }
};

module.exports = {
  alias: ['a'],
  descricao: 'Adicionar',
  exec,
};
