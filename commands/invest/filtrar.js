const completarEspaco = (texto, tamanho, r) => {
	while (texto.length < tamanho) {
		texto = `${r ? '' : ' '}${texto}${r ? ' ' : ''}`;
	}

	return texto;
}

const exec = async ({ callback, lib }) => {
  const { db } = lib.firebase;
  const linhas = [];
  let count = 0;
  callback('Espera um pouco');

  const list =  await db.collection('fii')
    .where('dY', '>', 10)
    .orderBy('dY')
    .get();;

  for (const i of list.docs) {
  	const { dY, pVP } = i.data();

  	if (pVP < 1.1) {
  		count++;
  		linhas.push(`<pre>${completarEspaco(i.id, 7)} - DY ${completarEspaco(dY.toString(), 5, true)} - P/VP ${pVP}</pre>`);
  	}
  }

	linhas.push(`itens encontrados ${count}`);

  callback(linhas);
};

module.exports = {
  alias: ['fl'],
  descricao: 'Filtrar FII',
  exec,
};
