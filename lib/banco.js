const lowdb = require( 'lowdb' );
const FileSync = require( 'lowdb/adapters/FileSync' );

const sqlite3 = require('sqlite3');

module.exports = ( config ) => {
  const adapter = new FileSync( config.base.arquivo );

  const db = lowdb( adapter );

  db.defaults({
    chats: {},
    dinheiro: []
  }).write();

  const getChatVars = ( msg ) => db.get(`chats.${msg.chat.id}`).value();
  const setChatVar = ( msg, name, value ) => db.set(`chats.${msg.chat.id}.${name}`, value).write();

  return {
    db,
    setChatVar,
    getChatVars,
  };
};
