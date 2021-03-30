const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

const importar = async ( linha, callback ) => {
  const arrEntrada = linha.split('|');
  const dataRegistro = new Date();
  const dataDigitada = arrEntrada[0];
  const fornecedor = arrEntrada[1];
  const descricao = arrEntrada[2];
  const formaPag = arrEntrada[3];
  const valorBruno = arrEntrada[4];
  const valorUbaldo = arrEntrada[5];
  const grupo = arrEntrada[6];

  const arrayData = dataDigitada.split('.');
  const data = new Date(arrayData[0], arrayData[1]-1, arrayData[2]);

  try {
    const db = await sqlite.open({ filename: './tralata.sqlite', driver: sqlite3.Database });
    const insert = `insert into ivecao (data_registro, data_gasto, fornecedor, descricao) values (${dataRegistro.getTime()}, ${data.getTime()}, '${fornecedor}', '${descricao}')`;

    await db.run(insert);

    const rows = await db.all('select seq from sqlite_sequence where name = "ivecao"');
    const id = rows[0].seq;
    let insertPagamento = "insert into ivecao_pagamento values ";

    console.log(id, insert);

    if (valorBruno > 0) {
      insertPagamento += `(${id}, 'Bruno', '${formaPag}', ${valorBruno})`;
    }

    if (valorBruno > 0 && valorUbaldo > 0) {
      insertPagamento += ', ';
    }

    if (valorUbaldo > 0) {
      insertPagamento += `(${id}, 'Ubaldo', '${formaPag}', ${valorUbaldo})`;
    }

    insertPagamento += ';';

    await db.run(insertPagamento);

    let rowsG = await db.all(`select id, nome from grupos_gastos where nome = '${grupo}'`);

    if (rowsG.length < 1) {
      await db.run(`insert into grupos_gastos (nome) values ('${grupo}')`);

      rowsG = await db.all(`select id, nome from grupos_gastos where nome = '${grupo}'`);
    }

    if (rowsG.length > 0) {
      const grupoId = rowsG[0].id;

      await db.run(`insert into ivecao_grupos (ivecao_id, gasto_id) values ('${id}', '${grupoId}')`);
    }

    await db.close();

    return true;
  } catch (error) {
    console.log(error);

    return false;
  }
};


module.exports = {
  restricted: true,
  ocultar: true,
  context: true,
  exec: async ({ callback, banco, comando, contexto, parametros, original }) => {
    console.log('--- comando recebido', parametros);
    const primeiro = (parametros[0] || '').toLowerCase();

    if (contexto && parametros.length > 0) {
      const cb = (novoContexto, variavel, resposta, valor) => {
        banco.setChatVar(original, 'contexto', novoContexto);
        banco.setChatVar(original, variavel, valor || parametros.join(' '));

        callback(resposta);        
      }

      switch ( contexto ) {
        case 'money_add_grupo':
          cb('money_add_data', 'vars.grupo', 'Quando a compra foi realizada?');
          break;

        case 'money_add_data':
          const entrada = parametros.join(' ').trim().toLowerCase();
          const dataInformada = ['hoje', 'ontem'].includes(entrada) ? new Date() : false;

          if (dataInformada && entrada === 'ontem') {
            dataInformada.setDate(data.getDate()-1);
          }

          cb('money_add_loja', 'vars.data', 'Onde foi comprado?', dataInformada);
          break;

        case 'money_add_loja':
          cb('money_add_descritivo', 'vars.local', 'O que foi comprado?');
          break;

        case 'money_add_descritivo':
          cb('money_add_valor', 'vars.descritivo', 'Quanto custou?');
          break;

        case 'money_add_valor':
          cb('money_add_pagador', 'vars.valor', 'Quem pagou?');
          break;

        case 'money_add_pagador':
          const pagador = parametros.join(' ');
          const { data, grupo, local, descritivo, valor } = banco.getChatVars(original).vars;

          banco.db.get( 'dinheiro.registros' ).push({
            criado: new Date(),
            data,
            grupo,
            local,
            descritivo,
            valor,
            pagador,
          }).write();

          banco.setChatVar(original, 'contexto', null);
          callback('Registro salvo!');
          break;
      }
    } else if (['import'].includes(primeiro)) {
      const entrada = parametros.slice(1).join(' ').trim().toLowerCase();
      const lista = entrada.split('\n');
      const listaErro = [];

      for (let x = 0; x < lista.length; x++) {
        const ret = await importar(lista[x], callback);

        if (!ret) {
          listaErro.push(lista[x]);
        }
      }

      if (listaErro.length > 0) {
        callback(`Import ${lista.length - listaErro.length} com sucesso.`);
        callback(`Erro em ${listaErro.length} itens`);
        callback(listaErro.join('\n'));
      } else {
        callback(`Import ${lista.length} com sucesso.`)
      }
    } else if (['cadastrar', 'incluir', 'add'].includes(primeiro)) {
      banco.setChatVar(original, 'contexto', 'money_add_grupo');

      callback('Qual grupo do gasto?');
    } else if (['listar', 'lista', 'lst', 'ls'].includes(primeiro)) {
      const lista = banco.db.get( 'dinheiro.registros' ).value();

      console.log('---- lista', lista);

      callback(['Listando'].concat(lista.map((v, i) => `${i+1} :: ${v.grupo} - ${v.local} - ${v.descritivo} - ${v.valor} - ${v.pagador}`)));
    } else if (['editar', 'edit', 'edt'].includes(primeiro)) {
      const indice = parametros[1];
      const lista = banco.db.get( 'dinheiro.registros' ).value();

      if (!indice || indice < 1 || indice > lista.length) {
        callback([
          'Para editar um registro você deve digitar o comando e numero do registro',
          `Exemplo: ${primeiro} 1`,
          'Para ver lista dos registro digite listar'
        ]);
      } else {
        const registro = lista[indice];
        const resposta = ['Registro para ser editado:', ''];

        for (key in registro) {
          if (key && key !== 'criado')
            resposta.push(`${key}: ${registro[key]}`);
        }

        callback(resposta);
      }
    } else if (['upd'].includes(primeiro)) {
      const lista = banco.db.get( 'dinheiro.registros' ).value();
      const autocompletar = {
        grupo: {},
        pagador: {},
      };

      for (let x = 0; x < lista.length; x++) {
        const { grupo, pagador } = lista[x];

        if (!autocompletar.grupo[grupo]) {
          autocompletar.grupo[grupo] = 1;
        } else {
          autocompletar.grupo[grupo]++;
        }

        if (!autocompletar.pagador[pagador]) {
          autocompletar.pagador[pagador] = 1;
        } else {
          autocompletar.pagador[pagador]++;
        }
      }

      console.log('--- upd', autocompletar);
      banco.db.set('dinheiro.autocompletar', autocompletar).write();
    } else {
      banco.setChatVar(original, 'contexto', null);

      callback([
        'Comandos aceitos',
        '',
        'Add - Cadastrar registro',
        'Lst - Listar tudo',
        'Edt - Editar registro',
        'Upd - Atualizar autocompletar',
      ].join('\n'));
    }
  },
};
