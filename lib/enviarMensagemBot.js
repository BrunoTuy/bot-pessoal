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

  const envio = ( chat, obj ) => {
    switch ( typeof obj ) {
      case 'string':
        envioString( chat, obj );
        break;

      case 'object':
        if ( obj.join ) {
          envioLista( chat, agruparLinhas( obj, 10 ) );
          break;
        }

      default:
        console.log( ' *** Não entendi o que devo enviar! *** ' );
        console.log( obj );
    }
  };

  const envioString = ( chat, texto ) => bot.sendMessage( chat, texto );
  const envioLista = ( id, lista, idx ) => {
    if ( !idx ) {
      idx = 0;
    }

    if ( idx >= lista.length ) {
      return;
    }

    envioString( id, lista[idx] );

    setTimeout( () => envioLista( id, lista, ++idx ), 1000 );
  };

  return envio;
};
