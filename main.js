const express = require('express');
const TelegramBot = require( 'node-telegram-bot-api' );

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const port = process.env.PORT || 5000;
const TOKEN = process.env.TOKEN_TELEGRAM;
const commandList = require( './commands' );
const firebase = require('./lib/firebase.js');
const b = require( './lib/banco.js' );

const bot = new TelegramBot( TOKEN, { polling: process.env.NODE_ENV !== 'production' } );

if (process.env.NODE_ENV === 'production') {
  bot.setWebHook(`https://bot-person.herokuapp.com/bot${TOKEN}`);
}

const app = express();

const enviar = require( './lib/enviarMensagemBot.js' )( bot );

const messageProcess = async ( msg, text ) => {
  const banco = await b(process.env);
  const user = msg.from;

  console.log( msg.message_id, ( msg.chat.type === 'private' ? 'PVT' : 'GRP' ), msg.chat.id, user.username, text );

  const allowed = (process.env.CHAT_ALLOWED || '').split(',').includes(msg.chat.id.toString());
  const commands = {};

  Object.entries(commandList).forEach(i => {
    if (allowed || !i[1].restricted) {
      commands[i[0]] = i[1];
    }
  });

  const { ultimoComando, contexto } = await banco.getChatData(msg.chat.id);
  const parametros = text ? text.split( ' ' ) : [''];
  const comando = parametros[0].indexOf('/') === 0
    ? parametros.shift().substring( 1 ).split( '@' )[0].toLowerCase()
    : ultimoComando && commands[ultimoComando] && commands[ultimoComando].context
      ? ultimoComando
      : false;

  if ( !comando || typeof commands[comando] === 'undefined' || commands[comando].exec  === 'undefined' )
  {
    const resposta = [
      `Oi ${user.first_name}`,
      'O comando digitado não foi reconhecido',
      '',
      'Tente:'
    ];

    for ( const key in commands ) {
      if ( commands[key] && !commands[key].hidden )
      {
        resposta.push(`/${key}`);
      }
    }

    enviar( msg.chat.id, resposta.join('\n') );
  }

  if ( comando && commands[comando] && commands[comando].exec ) {
    commands[comando].exec({
      bot,
      cmds: commands,
      user,
      comando,
      contexto,
      parametros,
      original: msg,
      callback: ( resp ) => enviar( msg.chat.id, resp, msg.message_id ),
      lib: { banco, firebase }
    });

    banco.setChatData({
      chat: msg.chat.id,
      ultimoComando: comando
    });
  }
};

bot.on( 'callback_query', ({ message, data }) => messageProcess( message, data ));
bot.on( 'message', ( msg ) => messageProcess( msg, msg.text ));

app.use(express.json());
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});
