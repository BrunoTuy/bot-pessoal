const axios = require('axios');
const cheerio = require('cheerio');

const salvar = async (db, data) => {
  const docRef = db.collection('fii').doc(data.sigla);
  const obj = await docRef.get();

  data.atualizadoEm = (new Date()).toJSON()

  if (obj.data()) {
    docRef.update(data);
  } else {
    docRef.set(data);
  }
}

const percent = value => parseFloat(value.replace(',', '.').replace('%', ''));
const valorFloat = value => parseFloat(value.replace(/\./g,'').replace(',', '.'));

const exec = async ({ callback, lib }) => {
  const { db } = lib.firebase;
	const URL = 'https://fundamentus.com.br/fii_resultado.php';
  const { data } = await axios.get(URL);
  const $ = cheerio.load(data);
  const tabela = $('#tabelaResultado');

  tabela.each(function() {
  	const tbody = $(this).find('tbody').children();

  	for (let x = 0; x < tbody.length; x++) {
			const spanPapel = $(tbody[x]).find('span.tips');
			const url = $(spanPapel).find('a').attr('href');
  		const listTd = $(tbody[x]).find('td');
			const segmento = $(listTd[1]).text();
			const cotacao = valorFloat($(listTd[2]).text());
			const ffoYield = percent($(listTd[3]).text());
			// const dY = percent($(listTd[4]).text());
			const pVP = valorFloat($(listTd[5]).text());
			const valorMercado = valorFloat($(listTd[6]).text());
			const liquidezValor2M = valorFloat($(listTd[7]).text());
			const imoveis = parseInt($(listTd[8]).text() || 0);
			const precoM2 = valorFloat($(listTd[9]).text());
			const aluguelM2 = valorFloat($(listTd[10]).text());
			const capRate = percent($(listTd[11]).text());
			const vacanciaMedia = percent($(listTd[12]).text());
			const endereco = $(listTd[13]).text();

			salvar(db, {
				nome: $(spanPapel).attr('title'),
				sigla: $(spanPapel).text(),
				url,
				segmento,
				cotacao,
				ffoYield,
				// dY,
				pVP,
				valorMercado,
				liquidezValor2M,
				imoveis,
				precoM2,
				aluguelM2,
				capRate,
				vacanciaMedia,
				endereco,
			});
  	}
  });

  callback('Espera um pouco');
};

module.exports = {
  alias: ['afii'],
  descricao: 'Atualizar FII',
  exec,
};
