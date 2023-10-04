const exec = ({ parametros, callback, bot, original }) => {
  if ( parametros.length === 0 ) {
    callback([
      'Para o envio de sugestoes coloque sua mensagem logo apos o comando',
      '',
      'Exemplo:',
      '<pre>/sugestao Melhore a funcionalidade xpto...</pre>'
    ]);
  }

  else {
    callback([
      'Muito obrigado.',
      'A sugestão enviada com sucesso!'
    ]);

    const momento = new Date( original.date*1000 );
    const dadosChat = `${original.chat.type} ${(original.chat.title || original.chat.id)}`;
    const dadosUsuario = `${original.from.first_name} ${original.from.last_name} @${original.from.username} ${original.from.language_code}`;

    bot.sendMessage( process.env.CHAT_ADMIN, `${momento}\n${dadosUsuario}\n${dadosChat}\n${parametros.join( ' ' )}` );
  }
};

module.exports = { exec };
