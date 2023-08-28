const listaContas = require('../dto/contaListar.js');
const extrato = require('../dto/extrato.js');
const editar = require('../dto/contaEditar.js');

const exec = async ({ subComando, parametros, callback, lib, libLocal, original, bot }) => {
  const { banco: { list } } = lib;

  if (parametros.length === 2) {
    const contaId = parametros.shift();
    const extratoId = parametros.shift();

    await editar({
      lib,
      contaId,
      extratoId,
      data: { status: 'feito' }
    });

    callback('Registro atualizado')
  } else {
    const linhas = [];
    const data = new Date();

    data.setHours(23);
    data.setMinutes(59);
    data.setSeconds(59);
    data.setMilliseconds(999);

    const contas = await listaContas.exec({ list, somenteAtivo: true });

    for (const conta of contas) {
      const extratoConta = await extrato.exec({
        lib,
        conta,
        dataMin: null,
        dataMax: data,
        filtroExtrato: { status: {$in: ['previsto', 'previsto fixo'] } }
      });

      for (const i of extratoConta.lista[0].extrato) {
        const { data, status, valor, descritivo } = i;
        const formatStatus = status === 'previsto fixo'
          ? 'PF'
          : 'PC'

        linhas.push([{
          text: `${conta.banco.toUpperCase()} ${libLocal.formatData(data)} ${formatStatus} R$ ${libLocal.formatReal(valor)} ${descritivo}`,
          callback_data: `cc xp ${conta._id} ${i.id}`
        }]);
      }
    }

    if (linhas.length > 0) {
      bot.sendMessage( original.chat.id, 'Executar pendência', {
        reply_to_message_id: original.message_id,
        reply_markup: JSON.stringify({
          inline_keyboard: linhas
        })
      });
    } else {
      callback('Nenhuma pendência encontrada');
    }
  }
}

module.exports = {
  alias: ['xp'],
  descricao: 'Executar pendência',
  exec,
}
