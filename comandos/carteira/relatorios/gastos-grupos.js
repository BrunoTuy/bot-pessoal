const extrato = require('../dto/extrato.js');
const fatura = require('../dto/cartaoExtrato.js');

const exec = async ({ subComando, parametros, callback, lib, libLocal }) => {
  const linhas = [];
  const { db } = lib.firebase;
  const dataMin = new Date();
  const dataMax = new Date();
  const anoMes = parametros.length > 0 && parametros[0].length === 6 && parametros[0] > 202101
    ? parametros.shift()
    : dataMin.getFullYear()*100+(dataMin.getMonth() > 11
      ? 101
      : dataMin.getMonth()+1);

  if (parametros.length < 1) {
    const tagGrupo = {};
    const grupos = {};
    const tagsSemGrupo = [];

    dataMin.setFullYear(anoMes.toString().substring(0, 4))
    dataMin.setMonth(anoMes.toString().substring(4)-1, 1);
    dataMin.setDate(1);
    dataMin.setHours(0);
    dataMin.setMinutes(0);
    dataMin.setSeconds(0);
    dataMin.setMilliseconds(0);

    dataMax.setFullYear(anoMes.toString().substring(0, 4))
    dataMax.setMonth(anoMes.toString().substring(4), 1);
    dataMax.setHours(23);
    dataMax.setMinutes(59);
    dataMax.setSeconds(59);
    dataMax.setMilliseconds(999);
    dataMax.setDate(dataMax.getDate()-1);

    const contas = await extrato.exec({ dataMin, dataMax, lib });
    const cartoes = await fatura.exec({ dataMin, dataMax, lib });
    const gruposCol = await db.collection('grupos').get();

    for (const g of gruposCol.docs) {
      const { nome, tags } = g.data();

      grupos[nome] = {
        tags,
        contas: {
          quantidade: 0,
          valor: 0
        },
        cartao: {
          quantidade: 0,
          valor: 0
        }
      };

      for (const tag of tags) {
        tagGrupo[tag] = nome;
      }
    }

    for (const conta of contas.lista) {
      for (const e of conta.extrato) {
        if (!e.tags) {
          continue;
        }
        let gruposCadastrados = [];
        for (const t of e.tags) {
          const grupo = tagGrupo[t];

          if (grupo && !gruposCadastrados.includes(grupo)) {
            gruposCadastrados.push(grupo);
            grupos[grupo].contas.quantidade++;
            grupos[grupo].contas.valor += e.valor;
          } else if (!grupo && !tagsSemGrupo.includes(t)) {
            tagsSemGrupo.push(t);
          }
        }
      }
    }

    for (const cartao of cartoes) {
      for (const f of cartao.fatura) {
        if (!f.tags) {
          continue;
        }
        let gruposCadastrados = [];
        for (const t of f.tags) {
          const grupo = tagGrupo[t];

          if (grupo && !gruposCadastrados.includes(grupo)) {
            gruposCadastrados.push(grupo);
            grupos[grupo].cartao.quantidade++;
            grupos[grupo].cartao.valor += f.valor;
          } else if (!grupo && !tagsSemGrupo.includes(t)) {
            tagsSemGrupo.push(t);
          }
        }
      }
    }

    for (const [key, value] of Object.entries(grupos)) {
      linhas.push(`<pre>${key} 🏦 ${value.contas.quantidade} R$ ${libLocal.formatReal(value.contas.valor*-1)} 💳 ${value.cartao.quantidade} R$ ${libLocal.formatReal(value.cartao.valor)} </pre>`);
    }

    tagsSemGrupo.length > 0 && linhas.push('');
    tagsSemGrupo.length > 0 && linhas.push(`Existem ${tagsSemGrupo.length} tags sem grupo. Lista abaixo`);
    for (const t of tagsSemGrupo) {
      linhas.push(`<pre>${t}</pre>`);
    }
  } else if (parametros[0] === '?') {
    linhas.push(`${subComando} - listar todos os gastos do mês atual`);
    linhas.push(`${subComando} {anoMes} - listar todos os gastos do ano e mês digitado`);
    linhas.push(`${subComando} gl - listar grupos cadastrados`);
    linhas.push(`${subComando} ga {grupo nome} - adicionar novo grupo de gastos`);
    linhas.push(`${subComando} gta {grupo id} {tag nome} - adicionar tag a um grupo`);
    linhas.push(`${subComando} gtr {tag nome} - remover tag de um grupo`);
  } else {
    const acao = parametros.shift().toLowerCase();
    const dado = parametros.join(' ');

    if (acao === 'ga' && dado && dado.trim().length > 0) {
      const obj = await db.collection('grupos');
      const nome = dado.trim();

      await obj.add({ nome });

      linhas.push(`Grupo ${nome} criado`);
    } else if (acao === 'gl'){
      const grupos = await db.collection('grupos').get();

      grupos.size > 0 && linhas.push('Grupos cadastrados');
      grupos.size < 1 && linhas.push('Nenhum grupo cadastrado.');

      for (const g of grupos.docs) {
        const { nome, tags } = g.data();
        const cTags = tags && tags.length || 0;

        linhas.push(`<pre>${g.id} - ${nome} - ${cTags} tags</pre>`);
      }
    } else if (acao === 'gta' && dado && dado.trim().length > 3){
      const arrayDado = dado.trim().split(' ');
      const grupoId = arrayDado.shift();
      const tag = arrayDado.join(' ').trim();

      if (!tag || tag.length < 1) {
        linhas.push('Comando não conhecido.');
        linhas.push('Para listar os comandos execute:');
        linhas.push(`${subComando} ?`);
      } else {
        let grupo = {};
        let existente = false;
        const grupos = await db.collection('grupos').get();

        for (const g of grupos.docs) {
          const { nome, tags } = g.data();

          if (tags && tags.length > 0 && tags.includes(tag)) {
            existente = true;
            linhas.push(`Tag ${tag} já cadastrada no grupo ${nome}`);
          } else if (g.id === grupoId) {
            grupo = g.data();
            grupo.tags = tags || [];
          }
        }

        if (!existente) {
          const docRef = await lib.firebase.db.collection('grupos').doc(grupoId);

          grupo.tags.push(tag);
          await docRef.update(grupo);

          linhas.push(`Tag ${tag} cadastrada no grupo ${grupo.nome}`);
        }
      }
    } else {
      linhas.push('Comando não conhecido');
      linhas.push('Para listar os comandos execute:');
      linhas.push(`${subComando} ?`);
    }
  }

  callback(linhas);
};

module.exports = {
  alias: ['gg'],
  descricao: 'Gastos por grupos',
  exec,
}