const defaultExclude = require('@istanbuljs/schema/default-exclude')

module.exports = {
  exclude: [...defaultExclude, '**/*.spec.ts']
}
