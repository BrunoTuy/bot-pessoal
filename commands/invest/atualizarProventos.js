const axios = require('axios');
const cheerio = require('cheerio');

const valorFloat = value => parseFloat(value.replace(/\./g,'').replace(',', '.'));
const formatData = value => {
	const array = value.split('/');

	return `${array[2]}-${array[1]}-${array[0]}`;
};

const listaRecursiva = async (db, lista, item, callback) => {
	console.log(new Date(), lista.length, item);

	if (lista.length <= item) {
		callback('Atualização finalizada.')
		return;
	}

	const { sigla, proventos } = lista[item];
	const novosProventos = proventos || [];

	console.log(sigla, 'buscar');

	const URL = `https://fundamentus.com.br/fii_proventos.php?papel=${sigla}`;
  const { data } = await axios.get(URL);
  const $ = cheerio.load(data);
  const tbody = $('table#resultado > tbody').children();

	for (let x = 0; x < tbody.length; x++) {
		const listTd = $(tbody[x]).find('td');
		const dataBase = formatData($(listTd[0]).text());
		const tipo = $(listTd[1]).text();
		const dataPaga = formatData($(listTd[2]).text());
		const valor = valorFloat($(listTd[3]).text());

		if (!novosProventos.find(p => p.dataBase === dataBase && p.tipo === tipo && p.dataPaga === dataPaga)) {
			novosProventos.push({ dataBase, tipo, dataPaga, valor });
		}
	}

	db.collection('fii').doc(sigla).update({
		proventos: novosProventos,
		atualizadoEm: (new Date()).toJSON(),
	});

	console.log(new Date(), sigla, 'atualizado');

	setTimeout(() => listaRecursiva(db, lista, item+1, callback), 2000);
}

const exec = async ({ callback, lib }) => {
  const { db } = lib.firebase;
  const list = await db.collection('fii').get();
  const array = Object.entries(list.docs).map(([k, v]) => v.data());

	callback('Iniciando atualização');

	listaRecursiva(db, array, 0);
};

module.exports = {
  alias: ['afiip'],
  descricao: 'Atualizar Proventos FII',
  exec,
};
