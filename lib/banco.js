const lowdb = require( 'lowdb' );
const FileSync = require( 'lowdb/adapters/FileSync' );

module.exports = firebase => {
  const adapter = new FileSync( process.env.DB_JSON );

  const db = lowdb( adapter );

  db.defaults({
    chats: {},
    dinheiro: []
  }).write();

  const getChatVars = ( msg ) => db.get(`chats.${msg.chat.id}`).value() || {};  
  const setChatVar = ( msg, name, value ) => db.set(`chats.${msg.chat.id}.${name}`, value).write();

  const getChatData = async chat => {
    const obj = await firebase.db.collection('chats').doc(`${chat}`).get();

    return obj.data() || {};
  }
  const setChatData = async ({ chat, ultimoComando, contexto }) => {
    const docRef = firebase.db.collection('chats').doc(`${chat}`);
    const obj = await docRef.get();
    const objSet = {};

    if (ultimoComando !== undefined) {
      objSet.ultimoComando = ultimoComando;
    }

    if (contexto !== undefined) {
      objSet.contexto = contexto;
    }

    if(obj.data()) {
      docRef.update(objSet);
    } else {
      docRef.set(objSet);
    }
  }

  return {
    db,
    setChatVar,
    getChatVars,
    getChatData,
    setChatData,
  };
};
