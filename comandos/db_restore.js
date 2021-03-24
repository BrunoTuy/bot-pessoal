const fs = require("fs");
const request = require('request')
const http = require('https');

const exec = ({ bot, callback, original }) => {
  if (original.document) {
    callback('Vou analisar o arquivo, aguarde.');

    const { file_id } = original.document;

    if (file_id) {
      bot.getFile( file_id )
        .then( ( respGet ) => {
          const file_end = './tralata.sqlite';
          const file = fs.createWriteStream( file_end );

          http.get( `https://api.telegram.org/file/bot${process.env.TOKEN_TELEGRAM}/${respGet.file_path}`, res => {
            res.pipe( file );
            callback('Restaurado com sucesso.');
          }); 
        } )
        .catch( ( err ) => {
          console.log('--- error com arquivo', err);
          callback(
            'Problemas com o arquivo.',
            'Envie novamente'
          );
        } );
    } else {
      callback('Arquivo não suportado');
    }
  } else {
    callback('Pode enviar o arquivo');
  }
}

module.exports = {
  restricted: true,
  context: true,
  exec
};
