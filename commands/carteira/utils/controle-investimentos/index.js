const getStruct = require('../../../../lib/pathIndex');

module.exports = getStruct({
  dir: __dirname,
  alias: ['tp'],
  label: '-- Caixa forte do tio Patinhas tools --',
  hasContext: true,
  restricted: false,
  commandWhenEmpty: 'st',
  commandsShowList: ['st'],
  description: 'Controle de investimentos'
});
