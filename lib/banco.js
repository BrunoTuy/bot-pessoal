module.exports = firebase => {
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
    getChatData,
    setChatData,
  };
};
