const exec = async ({ bot, lib, callback, parametros }) => {
	if (parametros.length < 2) {
		callback([
			'Comando incompleto, você deve enviar id do dispositivo e id do chat',
			'Exemplo',
			'',
			'<pre>/onde liberar id_dispositivo id_chat</pre>'
		]);
	} else {
	  const { db } = lib.firebase;
	  const dispositivo = parametros.shift();
	  const chatId = parseInt(parametros.shift());
	  const findRef = db.collection('findme').doc(dispositivo);
	  const find = await findRef.get();

	  if (find.data()) {
	  	const { solicitado, dono, permitido } = find.data();

	  	if (!permitido || !permitido.find(i => i.id === chatId)) {
	  		const jaSolicitado = solicitado.find(i => i.id === chatId);
	  		const novoSolicitado = solicitado.filter(i => i.id !== chatId);

	  		findRef.update({
	  			permitido: (permitido || []).concat(jaSolicitado || {id: chatId}),
	  			solicitado: novoSolicitado,
	  		});
	  	}

	  	callback('Usuário liberado.');
      bot.sendMessage( chatId, 'Você já pode verificar a localização\nSó enviar o comando onde\n\n/onde');
	  } else {
	  	callback('Dispositivo não cadastado.');
	  }
	}
};

module.exports = {
  alias: ['lb'],
  descricao: 'Liberar usuario para acessar localização',
  exec,
}