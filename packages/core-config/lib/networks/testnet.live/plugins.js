const expandHomeDir = require('expand-home-dir')
const formatter = require('@arkecosystem/core-logger-winston').formatter

module.exports = {
  '@arkecosystem/core-event-emitter': {},
  '@arkecosystem/core-validation': {},
  '@arkecosystem/core-config': {},
  '@arkecosystem/core-config-json': {},
  '@arkecosystem/core-logger': {},
  '@arkecosystem/core-logger-winston': {
    transports: [{
      constructor: 'Console',
      options: {
        colorize: true,
        level: 'debug',
        timestamp: () => Date.now(),
        formatter: (info) => formatter(info)
      }
    }, {
      package: 'winston-daily-rotate-file',
      constructor: 'DailyRotateFile',
      options: {
        filename: expandHomeDir(`${process.env.ARK_PATH_DATA}/logs/core/${process.env.ARK_NETWORK}.live/`) + '%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'debug',
        zippedArchive: true
      }
    }]
  },
  '@arkecosystem/core-database': {
    snapshots: `${process.env.ARK_PATH_DATA}/${process.env.ARK_NETWORK}.live/snapshots`
  },
  '@arkecosystem/core-database-sequelize': {
    uri: `sqlite:${process.env.ARK_PATH_DATA}/database/${process.env.ARK_NETWORK}.live.sqlite`,
    dialect: 'sqlite'
    // uri: 'postgres://node:password@localhost:5432/ark_testnet',
    // dialect: 'postgres'
  },
  '@arkecosystem/core-transaction-pool': {},
  '@arkecosystem/core-transaction-pool-redis': {},
  '@arkecosystem/core-p2p': {
    port: 4000
  },
  '@arkecosystem/core-blockchain': {},
  '@arkecosystem/core-api': {
    port: 4102
  },
  '@arkecosystem/core-webhooks': {},
  '@arkecosystem/core-webhooks-api': {
    port: 4103
  },
  '@arkecosystem/core-graphql': {},
  '@arkecosystem/core-graphql-api': {
    port: 4105
  },
  '@arkecosystem/core-forger': {}
}