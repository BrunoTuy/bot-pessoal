const axios = require('axios');
const cheerio = require('cheerio');

const valorFloat = value => parseFloat(value.replace(/\./g,'').replace('R$', '').replace(',', '.').trim());
const formatData = value => {
	const array = value.split('/');

	return `${array[2]}-${array[1]}-${array[0]}`;
};
const tratarMesAno = value => {
	const arr = value.split('/');
	const ano = arr[1];
	const mes = arr[0].toLowerCase();
	const arrMes = {
		'janeiro': '01',
		'fevereiro': '02',
		'março': '03',
		'abril': '04',
		'maio': '05',
		'junho': '06',
		'julho': '07',
		'agosto': '08',
		'setembro': '09',
		'outubro': '10',
		'novembro': '11',
		'dezembro': '12'
	};

	return `${ano}-${arrMes[mes]}`;
};
const dadosGrafico = text => {
	try {
	  const arr = text.substring(text.indexOf('Chart(') + 11);
	  const brr = arr.substring(0, arr.indexOf('],"backgroundColor') + 1) + '}]}}';
	  const str = brr.replace('type', '"type"').replace('data', '"data"');
	  const obj = JSON.parse(str);
	  const list = obj.data.datasets[0].data.map((i, idx) => ({
	  	dataBase: tratarMesAno(obj.data.labels[idx]),
	  	value: i,
	  }));

	  return list;
	} catch (e) {
		console.log('Error processando grafico', e);

		return [];
	}
};

const listaRecursiva = async (db, lista, item, callback) => {
	try {		
		console.log(new Date(), lista.length, item);

		if (lista.length <= item) {
			callback('Atualização finalizada.')
			return;
		}

		const { sigla, proventos, vpHistorico } = lista[item];
		const novosProventos = proventos || [];
		const novosVpHistorico = vpHistorico || [];

		console.log(sigla, 'buscar');

		const URL = `https://www.fundsexplorer.com.br/funds/${sigla.toLowerCase()}`;
	  const { data } = await axios.get(URL);
	  const $ = cheerio.load(data);

	  const sectionMainIndicators = $('div#main-indicators-carousel').children();
		const liquidezDiaria = valorFloat($(sectionMainIndicators[0]).find('span.indicator-value').text().trim());
		const ultimoRendimento = valorFloat($(sectionMainIndicators[1]).find('span.indicator-value').text().trim());
		const dy = valorFloat($(sectionMainIndicators[2]).find('span.indicator-value').text().trim());
		const rentabilidadeNoMes = valorFloat($(sectionMainIndicators[5]).find('span.indicator-value').text().trim());

	  const sectionBasicInfos = $('section#basic-infos');
	  const listUl = $(sectionBasicInfos).find('ul');
	  const liColunaUm = $(listUl[0]).find('li');
	  const liColunaDois = $(listUl[1]).find('li');

	  const txPerform = $(liColunaUm[6]).find('span.description').text().trim();
	  const txGestao = $(liColunaUm[7]).find('span.description').text().trim();
	  const CNPJ = $(liColunaDois[0]).find('span.description').text().trim();
	  const txAdm = $(liColunaDois[5]).find('span.description').text().trim();
	  const txGerenciamento = $(liColunaDois[6]).find('span.description').text().trim();
	  const txConsultoria = $(liColunaDois[7]).find('span.description').text().trim();

	  const chartDY = $('div#yields-chart-wrapper > script').html();
	  const listaDY = dadosGrafico(chartDY);

	  const chartVP = $('div#patrimonial-value-chart-wrapper > script').html();
	  const listaVP = dadosGrafico(chartVP);

	  listaDY.forEach(i => {
	  	const provento = novosProventos.find(p => p.dataBase.indexOf(i.dataBase) > -1);

	  	if (provento) {
	  		provento.percent = i.value;
	  	}
	  });

	  listaVP.forEach(i => {
	  	const vp = novosVpHistorico.find(v => v.dataBase === i.dataBase);

	  	if (vp) {
	  		vp.valor = i.value;
	  	} else {
	  		novosVpHistorico.push(i);
	  	}
	  });

	  callback(CNPJ);

		db.collection('fii').doc(sigla).update({
	  	txPerform,
	  	txGestao,
	  	CNPJ,
	  	txAdm,
	  	txGerenciamento,
	  	txConsultoria,
	  	liquidezDiaria,
			ultimoRendimento,
			dy,
			rentabilidadeNoMes,
			proventos: novosProventos,
			vpHistorico: novosVpHistorico,
			atualizadoEm: (new Date()).toJSON(),
		});

		console.log(new Date(), sigla, 'atualizado');
	} catch (e) {
		console.log(new Date(), sigla, 'error', e);
	} finally {
		setTimeout(() => listaRecursiva(db, lista, item+1, callback), 2000);
	}
}

const exec = async ({ callback, lib }) => {
  const { db } = lib.firebase;
  const list = await db.collection('fii').get();
  const array = Object.entries(list.docs).map(([k, v]) => v.data());

	callback('Iniciando atualização');

	listaRecursiva(db, array, 0, callback);
};

module.exports = {
  alias: ['afiitx', 'fundsexplorer'],
  descricao: 'Atualizar Taxas FII',
  exec,
};
