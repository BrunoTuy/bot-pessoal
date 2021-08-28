const cartoes = {
  inter: '3quiBXeXI1AJk50zzVBH',
  nubank: '8zslnbqQDaXglkCJPUj2'
};
const contas = {
  bb: 'buXsBdZ98yN81IpxuMKz',
  inter: '6orVYwtk0geS30zesJed',
  nubank: 'oPqOFGpqM1Etdok7e2kC'
};

const fixo = async ({ lib, callback }) => {
  const { db } = lib.firebase;

  const list = await lib.banco.sqlite.all('SELECT * FROM carteira_gastos_fixo WHERE ativo = 1');

  list.forEach(async i => {
    const data = new Date(i.data);
    const conta = i.conta ? contas[i.conta] : null;
    const cartao = i.cartao ? cartoes[i.cartao] : null;

    callback(`Inserir ${i.conta ? 'CC' : 'CD'}:${i.cartao || i.conta} ${data.getDate()} ${i.valor} ${i.descritivo}`);

    const obj = cartao
      ? await db.collection('cartoes').doc(cartao).collection('recorrente')
      : conta 
        ? await db.collection('contas').doc(conta).collection('recorrente')
        : null;

    obj && obj.add({
      dia: data.getDate(),
      valor: i.valor,
      descritivo: i.descritivo
    });
  });
};

const fatura = async ({ lib, callback }) => {
  const { db } = lib.firebase;

  const list = await lib.banco.sqlite.all('SELECT * FROM carteira_gastos_cartao');

  list.forEach(async i => {
    const data = new Date(i.data);
    const cartao = cartoes[i.cartao];

    callback(`Inserir ${cartao} ${i.cartao} ${data} ${i.valor} ${i.parcela}/${i.total_parcelas} ${i.competencia} ${i.descritivo}`);

    const obj = await db.collection('cartoes').doc(cartao).collection('fatura');

    obj && obj.add({
      data: data.getTime(),
      dataTexto: data,
      valor: i.valor,
      descritivo: i.descritivo,
      parcela: i.parcela,
      total_parcelas: i.total_parcelas,
      competencia: i.competencia
    });
  });
};

const extrato = async ({ lib, callback }) => {
  const { db } = lib.firebase;

  const list = await lib.banco.sqlite.all('SELECT * FROM carteira_gastos_conta WHERE fixo_id is null');

  list.forEach(async i => {
    const data = new Date(i.data);
    const conta = contas[i.conta];

    callback(`Inserir ${conta} ${i.conta} ${data} ${i.valor} ${i.status} ${i.descritivo}`);

    const obj = await db.collection('contas').doc(conta).collection('extrato');

    obj && obj.add({
      data: data.getTime(),
      dataTexto: data,
      valor: i.valor,
      descritivo: i.descritivo,
      status: i.status
    });
  });
};

const exec = async ({ comando, callback, lib, original }) => {
  callback('Comunicar com o firestone');

  try {
    false && await fixo({ callback, lib });
    false && await fatura({ callback, lib });
    false && await extrato({ callback, lib });

    callback('Fim da busca');
  } catch (e) {
    console.log('--- error', e);
    callback('Erro na busca');
  }
}

module.exports = {
  hidden: true,
  restricted: true,
  exec
};
