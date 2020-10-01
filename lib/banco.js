const lowdb = require( 'lowdb' );
const FileSync = require( 'lowdb/adapters/FileSync' );

module.exports = ( config ) => {
  const adapter = new FileSync( config.base.arquivo );

  const db = lowdb( adapter );

  db.defaults({
    chats: {},
    dinheiro: []
  }).write();

  return db;
};
