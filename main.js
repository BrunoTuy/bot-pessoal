const express = require('express');
const TelegramBot = require( 'node-telegram-bot-api' );

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const port = process.env.PORT || 5000;
const TOKEN = process.env.TOKEN_TELEGRAM;
const comandos = require( './comandos' );

const bot = new TelegramBot( TOKEN, { polling: process.env.NODE_ENV !== 'production' } );

if (process.env.NODE_ENV === 'production') {
  bot.setWebHook(`https://bot-person.herokuapp.com/bot${TOKEN}`);
}

const app = express();

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

app.use(express.json());
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});
