const fs = require("fs");
const request = require('request')


const exec = ({ bot, callback, original }) => {
  callback('Enviando o arquivo');
  
  const stream = fs.createReadStream('./tralata.sqlite');
  bot.sendDocument(original.chat.id, stream);
}

module.exports = {
  hidden: true,
  restricted: true,
  exec
};
