const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

const connect = () => sqlite.open({ filename: './tralata.sqlite', driver: sqlite3.Database });

const run = async (query) => {
  const db = await connect()
  await db.run(query);
  await db.close();
}

const all = async (query) => {
  const db = await connect()
  const result = await db.all(query);
  db.close();

  return result;
}

module.exports = {
  connect,
  run,
  all
};