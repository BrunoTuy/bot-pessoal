const getStruct = require('../../../lib/pathIndex');

module.exports = getStruct({
  dir: __dirname,
  alias: ['ut'],
  hasContext: true,
  restricted: false,
  description: 'Utils',
  commandWhenEmpty: 'st',
  commandsShowList: ['st']
});

