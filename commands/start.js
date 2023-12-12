const exec = ({ original, callback, cmds }) => {
  const resposta = [
    `Oi ${original.from.first_name}`,
    'Sou o bot pessoal do Bruno Tuy',
    '',
    'Esses são os comandos que entendo:'
  ];

  for ( const key in cmds ) {
    if ( cmds[key] && !cmds[key].hidden ) {
      resposta.push(`/${key}`);
    }
  }

  callback( resposta );
};

module.exports = {
  hidden: true,
  exec
};
