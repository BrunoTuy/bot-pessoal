const express = require('express');
const TelegramBot = require( 'node-telegram-bot-api' );

const botOptions = { polling: true };

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
} else {
  console.log('SET webHook port', process.env.PORT);
  botOptions.webHook = { port: process.env.PORT };
}

const comandos = require( './comandos' );

const bot = new TelegramBot( process.env.TOKEN_TELEGRAM, botOptions);
const app = express();

if (process.env.NODE_ENV === 'production') {
  console.log('SET webHook url', `https://bot-person.herokuapp.com/bot${process.env.TOKEN_TELEGRAM}`);
  bot.setWebHook(`https://bot-person.herokuapp.com/bot${process.env.TOKEN_TELEGRAM}`);
}

const enviar = require( './lib/enviarMensagemBot.js' )( bot );
const banco = require( './lib/banco.js' )();
const sqlite = require( './lib/sqlite.js' );

banco.sqlite = sqlite;

bot.on( 'message', ( msg ) => {
  console.log( msg.message_id, ( msg.chat.type === 'private' ? 'PVT' : 'GRP' ), msg.chat.id, msg.from.username, msg.text );

  const allowed = (process.env.CHAT_ALLOWED || '').split(',').includes(msg.chat.id.toString());
  const cmds = {};

  for ( key in comandos ) {
    if ( allowed || !comandos[key].restricted )
    {
      cmds[key] = comandos[key];
    }
  }

  const { ultimoComando, contexto } = banco.getChatVars(msg);
  const parametros = msg.text ? msg.text.split( ' ' ) : [''];
  const comando = parametros[0].indexOf('/') === 0
    ? parametros.shift().substring( 1 ).split( '@' )[0]
    : ultimoComando && cmds[ultimoComando] && cmds[ultimoComando].context
      ? ultimoComando
      : false;

  if ( !comando || typeof cmds[comando] === 'undefined' || cmds[comando].exec  === 'undefined' )
  {
    const resposta = [
      `Oi ${msg.from.first_name}`,
      'O comando digitado não foi reconhecido',
      '',
      'Tente:'
    ];

    for ( key in cmds ) {
      if ( cmds[key] && !cmds[key].ocultar )
      {
        resposta.push(`/${key}`);
      }
    }

    enviar( msg.chat.id, resposta.join('\n') );
  }

  if ( comando && cmds[comando] && cmds[comando].exec ) {
    cmds[comando].exec({
      bot,
      cmds,
      banco,
      comando,
      contexto,
      parametros,
      original: msg,
      callback: ( resp ) => enviar( msg.chat.id, resp )
    });

    banco.setChatVar(msg, 'ultimoComando', comando);
  }
});

app.set('port', (process.env.PORT || 5000));
app.get('/', (request, response) => {
  response.send('App is running');
}).listen(app.get('port'), () => {
  console.log('App is running, server is listening on port ', app.get('port'));
});
