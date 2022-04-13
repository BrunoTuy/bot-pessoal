module.exports = ( bot ) => {
  const agruparLinhas = ( lista, linhas = 10 ) => {
    let retorno = [];
    let grupo = [];

    for ( let x = 0; x < lista.length; x++ ) {
      grupo.push( lista[x] );

      if ( grupo.length >= linhas || x+1 === lista.length ) {
        retorno.push( grupo.join( '\n' ) );

        grupo = [];
      }
    }

    return retorno;
  }

  const envio = ( chat, obj, msgId ) => {
    switch ( typeof obj ) {
      case 'string':
        envioString( chat, obj, msgId );
        break;

      case 'object':
        if ( obj.join ) {
          envioLista( chat, agruparLinhas( obj, 30 ), msgId );
          break;
        }

      default:
        console.log( ' *** Não entendi o que devo enviar! *** ' );
        console.log( obj );
    }
  };

  const envioString = ( chat, texto, msgId ) => bot.sendMessage( chat, texto, {
    parse_mode : "HTML",
    reply_to_message_id: msgId
  } );

  const envioLista = ( id, lista, msgId, idx ) => {
    if ( !idx ) {
      idx = 0;
    }

    if ( idx >= lista.length ) {
      return;
    }

    envioString( id, lista[idx], msgId );

    setTimeout( () => envioLista( id, lista, msgId, ++idx ), 1000 );
  };

  return envio;
};
