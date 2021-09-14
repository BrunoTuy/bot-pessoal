const getStruct = require('../../../lib/pathIndex');

module.exports = getStruct({
  dir: __dirname,
  alias: ['cc'],
  commandWhenEmpty: 'sld',
  label: '-- Conta corrente --',
  description: 'Conta corrente'
});
