const axios = require('axios');
const xmlParser = require('xml2json');

const atualizar = async ({ lib, callback }) => {
  const { db } = lib.firebase;
  const unixTimeNow = (new Date()).getTime()/1000;
  const list = await db.collection('findme').get();

  list.docs.forEach(async i => {
    const { id } = i;
    const docData = i.data();
    const lastUnixTime = parseInt(docData.lastUnixTime || 0);

    if (lastUnixTime+290 > unixTimeNow) {
      return;
    }

    const { data } = await axios.get(docData.xml);
    const { response } = xmlParser.toJson(data, { object: true });
    const coll = await db.collection('findme').doc(id).collection('historico');
    const messages = response.feedMessageResponse.messages.message
      .filter(m => parseInt(m.unixTime) > (lastUnixTime || 0));

    messages.forEach(async m => {
      const date = new Date(m.dateTime);

      await coll.add({
        ...m,
        dateTime: date.toJSON(),
      });
    });

    if (messages.length < 1) {
      return;
    }

    const {
      dateTime,
      unixTime,
      messageType: status,
      batteryState: battery,
    } = messages[0];

    const updateAt = new Date(dateTime);
    const { latitude, longitude } = messages
      .filter(({ latitude, longitude }) => latitude !== longitude)
      .shift();

    await db.collection('findme').doc(id).update({
      status,
      battery,
      lastUnixTime: parseInt(unixTime),
      updateAt: updateAt.toJSON(),
      latitude,
      longitude,
    });
  });
};

module.exports = atualizar;
