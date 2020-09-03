const executarComando = ({ original, callback }) => {
  const cmds = require( './' );
  const resposta = [
    `Oi ${original.from.first_name}`,
    'Sou o bot pessoal do Bruno Tuy',
    '',
    'Esses são os comandos que entendo:'
  ];

  for ( key in cmds ) {
    if ( cmds[key] && !cmds[key].ocultar ) {
      resposta.push(`/${key}`);
    }
  }

  callback( resposta.join('\n') );
};

module.exports = {
  ocultar: true,
  exec: executarComando
};
