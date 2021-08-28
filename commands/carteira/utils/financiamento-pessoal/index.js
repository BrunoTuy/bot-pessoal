const getStruct = require('../../../../lib/pathIndex');

module.exports = getStruct({
  dir: __dirname,
  alias: ['fp'],
  label: '-- Financiamento pessoal tools --',
  hasContext: true,
  restricted: false,
  description: 'Financiamento pessoal'
});
