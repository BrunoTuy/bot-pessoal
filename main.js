const TelegramBot = require( 'node-telegram-bot-api' );
const lowdb = require( 'lowdb' );
const FileSync = require( 'lowdb/adapters/FileSync' );

const config = require( './config.json' );
const cmds = require( './comandos' );

const bot = new TelegramBot( config.tokenBot, {polling: true});
const adapter = new FileSync( config.base.arquivo );

const db = lowdb( adapter );
const enviar = require( './lib/enviarMensagemBot.js' )( bot );

db.defaults({
  chats: {},
  dinheiro: []
}).write();

bot.on( 'message', ( msg ) => {
  console.log( msg.message_id, ( msg.chat.type === 'private' ? 'PVT' : 'GRP' ), msg.chat.id, msg.from.username, msg.text );

  const { ultimoComando, contexto } = db.get(`chats.${msg.chat.id}`).value()
  const parametros = msg.text ? msg.text.split( ' ' ) : [''];
  const comando = parametros[0].indexOf('/') === 0
    ? parametros.shift().substring( 1 ).split( '@' )[0]
    : ultimoComando && cmds[ultimoComando] && cmds[ultimoComando].context
      ? ultimoComando
      : false;

  if ( !comando || typeof cmds[comando] === 'undefined' || cmds[comando].exec  === 'undefined' ) {
    const resposta = [
      `Oi ${msg.from.first_name}`,
      'O comando digitado não foi reconhecido',
      '',
      'Tente:'
    ];

    for ( key in cmds ) {
      if ( cmds[key] && !cmds[key].ocultar ) {
        resposta.push(`/${key}`);
      }
    }

    enviar( msg.chat.id, resposta.join('\n') );
  }

  if ( comando && cmds[comando] && cmds[comando].exec ) {
    cmds[comando].exec({
      db,
      bot,
      config,
      comando,
      contexto,
      parametros,
      original: msg,
      callback: ( resp ) => enviar( msg.chat.id, resp )
    });

    db.set(`chats.${msg.chat.id}.ultimoComando`, comando).write();
  }
});
