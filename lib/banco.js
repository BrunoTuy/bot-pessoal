const { MongoClient, ObjectId } = require('mongodb');

module.exports = async ({ MONGO_URI, MONGO_DB }) => {
  const client = new MongoClient(MONGO_URI);

  await client.connect();

  const db = client.db(MONGO_DB);

  const getChatData = async chat => {
    try {
      const collection = db.collection('chat');
      const listaBanco = await collection.find({ chat }).toArray();

      if (listaBanco.length === 1) {
        return listaBanco.pop();
      } else if (listaBanco.length < 1) {
        return {};
      } else {
        return false;
      }
    } catch (e) {
      console.log(colecao, 'Erro na busca', e);
      return false;
    }
  };

  const setChatData = async ({ chat, ultimoComando, contexto }) => {
    const item = await getChatData(chat);
    const objSet = {};

    if (ultimoComando !== undefined) {
      objSet.ultimoComando = ultimoComando;
    }

    if (contexto !== undefined) {
      objSet.contexto = contexto;
    }

    if (item && item.chat) {
      await update({
        colecao: 'chat',
        registro: { chat },
        set: objSet
      })
    } else {
      await insert({
        colecao: 'chat',
        dados: {
          chat,
          ...objSet
        }
      });
    }
  };

  const insert = async ({ colecao, dados }) => {
    try {
      const collection = db.collection(colecao);
      const { insertedId } = await collection.insertOne(dados);

      console.log('INSERT', { colecao, dados, id: insertedId.toString() });

      return insertedId.toString();
    } catch (e) {
      console.log(colecao, dados, 'Erro no cadastro', e);
      return false;
    }
  };

  const update = async ({ colecao, registro, id, set }) => {
    try {
      const collection = db.collection(colecao);
      const filtro = id
        ? { _id: new ObjectId(id.toString()) }
        : registro;

      console.log('UPDATE', { colecao, filtro, set });

      const { modifiedCount } = await collection.updateOne(filtro, { $set: set });

      return modifiedCount > 0;
    } catch (e) {
      console.log('** Não consegui atualizar', { colecao, id, set }, e);
    }

    return false;
  };

  const remove = async ({ colecao, registro }) => {
    try {
      const collection = db.collection(colecao);
      const i = await collection.delete(registro);

      return i;
    } catch (e) {
      console.log('DELETE error', e);
      return false;
    }
  };

  const get = async ({ colecao, registro }) => {
    try {
      const collection = db.collection(colecao);
      const i = await collection.findOne(registro);

      return i;
    } catch (e) {
      console.log('GET error', e);
      return false;
    }
  };

  const list = async ({ colecao, filtro, colunas, ordem }) => {
    try {
      const collection = db.collection(colecao);
      const listaBanco = await collection.find(filtro).sort(ordem).project(colunas).toArray();

      return listaBanco;
    } catch (e) {
      console.log(colecao, 'Erro na busca', e);
      return false;
    }
  };

  return {
    get,
    list,
    insert,
    update,
    remove,
    getChatData,
    setChatData
  };
};
