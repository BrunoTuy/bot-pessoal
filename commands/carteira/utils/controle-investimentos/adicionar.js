const exec = async ({ parametros, callback, subComando, lib, libLocal, bot, original }) => {
  const { db } = lib.firebase;

  if (parametros.length < 4) {
    callback([
      'Exemplo do comando abaixo',
      `<pre>${subComando} {data entrada} {valor total} {tipo[cdb|fii|tesouro]} {!u:cotas} {!r:rendimento} {!s:data saida} {!c:corretora} {!n:nome do ativo}</pre>`,
    ]);
  } else {
    const parametrosCompleto = parametros.join(' ');
    const paramDataEntrada = parametros.shift();
    const valor = libLocal.entenderValor({ val: parametros.shift(), naoInverte: true });
    const tipo = parametros.shift().toUpperCase();
    const parametrosTexto = parametros.join(' ');
    const paramCotas = libLocal.capturarParametro(parametrosTexto, 'u');
    const paramRendimento = libLocal.capturarParametro(parametrosTexto, 'r');
    const paramDataSaida = libLocal.capturarParametro(parametrosTexto, 's');
    const corretora = libLocal.capturarParametro(parametrosTexto, 'c');
    const ativo = (libLocal.capturarParametro(parametrosTexto, 'n') || '').toUpperCase();
    const cadastrarAtivo = libLocal.capturarParametro(parametrosTexto, 'add');

    console.log(' -- Entrada', {
      paramDataEntrada,
      valor,
      tipo,
      paramCotas,
      paramRendimento,
      paramDataSaida,
      corretora,
      ativo,
    });

    if (!['CDB', 'FII', 'TESOURO'].includes(tipo)) {
      callback([
        `Tipo de investimento não reconhecido (${tipo})`,
        'O investimenro deve ser CDB, FII ou TESOURO'
      ]);
    } else if (ativo.length < 1) {
      callback('Informe o nome do ativo.');
    } else if (!corretora) {
      callback('Informe o nome da corretora.');
    } else if (tipo === 'CDB' && !paramRendimento) {
      callback('Informe o rendimento do CDB.');
    } else if (tipo === 'CDB' && !paramRendimento.toUpperCase().includes('AA') && !paramRendimento.toUpperCase().includes('CDI')) {
      callback(`O rendimento do CDB deve ser AA ou CDI. (${paramRendimento})`);
    } else {
      const docRef = db.collection('cofre').doc(`${tipo}.${ativo}`);
      const obj = await docRef.get();

      if (!obj.data() && !cadastrarAtivo) {
        callback([
          'O ativo não esta cadastrado.',
          'Execute o comando abaixo para cadastrar o ativo e investimento.',
          '',
          `<pre>${subComando} ${parametrosCompleto} !add:s</pre>`
        ]);
      } else {
        const objAtivo = obj.data() || {
          tipo,
          ativo,
          lista: []
        };

        const cotas = paramCotas && !isNaN(paramCotas)
          ? parseInt(paramCotas)
          : null;
        const dataEntrada = libLocal.entenderData(paramDataEntrada);
        const dataSaida = paramDataSaida
          ? libLocal.entenderData(paramDataSaida)
          : null;

        if (['CDB', 'TESOURO'].includes(tipo)) {
          const rendimento = {};

          if (paramRendimento.includes('aa')) {
            rendimento.tipo = 'aa';
            rendimento.taxa = parseFloat(paramRendimento.substring(0, paramRendimento.toUpperCase().indexOf('AA')).trim());
          } else if (paramRendimento.includes('cdi')) {
            rendimento.tipo = 'cdi';
            rendimento.taxa = paramRendimento.substring(0, paramRendimento.toUpperCase().indexOf('CDI')).trim();
          } else {
            rendimento.tipo = paramRendimento;
          }

          objAtivo.lista.push({
            datas: {
              entrada: dataEntrada,
              saida: dataSaida
            },
            valor,
            cotas,
            rendimento,
            corretora,
          });
        } else {
          console.log('Tipo ainda não mapeado');
          return;
        }

        if (obj.data()) {
          docRef.update(objAtivo);
        } else {
          docRef.set(objAtivo);
        }

        callback('veja no console');
      }
    }

  }
};

module.exports = {
  alias: ['a'],
  exec,
};
