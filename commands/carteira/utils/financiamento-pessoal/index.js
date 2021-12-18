const getStruct = require('../../../../lib/pathIndex');

module.exports = getStruct({
  dir: __dirname,
  alias: ['tf'],
  label: '-- Tuy financeira tools --',
  hasContext: true,
  restricted: false,
  description: 'Financiamento pessoal'
});
