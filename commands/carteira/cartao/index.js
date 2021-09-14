const getStruct = require('../../../lib/pathIndex');

module.exports = getStruct({
  dir: __dirname,
  alias: ['cd'],
  commandWhenEmpty: 'sld',
  label: '-- Cartão de credito --',
  description: 'Cartão de credito'
});
