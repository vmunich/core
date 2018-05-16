'use strict'

const { asValue } = require('awilix')
const { slots } = require('@arkecosystem/client')

const app = require('./__support__/setup')
const genesisBlock = require('./__fixtures__/genesisBlock')

let container
let blockchain

beforeAll(async (done) => {
  container = await app.setUp()

  done()
})

afterAll(async (done) => {
  await app.tearDown()

  done()
})

beforeEach(async (done) => {
  process.env.ARK_SKIP_BLOCKCHAIN = true

  // manually register the blockchain
  const plugin = require('../lib').plugin

  blockchain = await plugin.register(container, {
    networkStart: false
  })

  await container.register('blockchain', asValue({
    name: 'blockchain',
    version: '1.0.0',
    plugin: blockchain,
    options: {}
  }))

  done()
})

afterEach(async (done) => {
  process.env.ARK_SKIP_BLOCKCHAIN = false

  await blockchain.resetState()

  done()
})

describe('Blockchain', () => {
  it('should be an object', () => {
    expect(blockchain).toBeObject()
  })

  describe('dispatch', () => {
    it('should be a function', () => {
      expect(blockchain.dispatch).toBeFunction()
    })

    it('should be ok', () => {
      const nextState = blockchain.dispatch('START')

      expect(blockchain.stateMachine.state.blockchain).toEqual(nextState)
    })
  })

  describe('start', () => {
    it('should be a function', () => {
      expect(blockchain.start).toBeFunction()
    })

    it('should be ok', async () => {
      process.env.ARK_SKIP_BLOCKCHAIN = false

      const started = await blockchain.start(true)

      expect(started).toBeTruthy()
    })
  })

  describe('checkNetwork', () => {
    it('should be a function', () => {
      expect(blockchain.checkNetwork).toBeFunction()
    })

    it('should throw an exception', () => {
      expect(() => blockchain.checkNetwork()).toThrowError('Method [checkNetwork] not implemented!')
    })
  })

  describe.skip('updateNetworkStatus', () => {
    it('should be a function', () => {
      expect(blockchain.updateNetworkStatus).toBeFunction()
    })
  })

  describe('rebuild', () => {
    it('should be a function', () => {
      expect(blockchain.rebuild).toBeFunction()
    })

    it('should throw an exception', () => {
      expect(() => blockchain.rebuild()).toThrowError('Method [rebuild] not implemented!')
    })
  })

  describe('resetState', () => {
    it('should be a function', () => {
      expect(blockchain.resetState).toBeFunction()
    })

    it('should be ok', async () => {
      await blockchain.resetState()

      expect(blockchain.stateMachine.state).toEqual({
        blockchain: blockchain.stateMachine.initialState,
        started: false,
        lastBlock: null,
        lastDownloadedBlock: null
      })
    })
  })

  describe('postTransactions', () => {
    it('should be a function', () => {
      expect(blockchain.postTransactions).toBeFunction()
    })

    it('should be ok', async () => {
      const response = await blockchain.postTransactions(genesisBlock.transactions, false)

      expect(genesisBlock.transactions.length).toBe(52)
      expect(response.length).toBe(52)
    })
  })

  describe('queueBlock', () => {
    it('should be a function', () => {
      expect(blockchain.queueBlock).toBeFunction()
    })

    it('should be ok', async () => {
      blockchain.queueBlock = jest.fn(block => (blockchain.stateMachine.state.lastDownloadedBlock = block))

      await blockchain.queueBlock(genesisBlock)

      expect(blockchain.stateMachine.state.lastDownloadedBlock).toEqual(genesisBlock)
    })
  })

  describe.skip('rollbackCurrentRound', () => {
    it('should be a function', () => {
      expect(blockchain.rollbackCurrentRound).toBeFunction()
    })
  })

  describe.skip('removeBlocks', () => {
    it('should be a function', () => {
      expect(blockchain.removeBlocks).toBeFunction()
    })
  })

  describe.skip('rebuildBlock', () => {
    it('should be a function', () => {
      expect(blockchain.rebuildBlock).toBeFunction()
    })
  })

  describe.skip('processBlock', () => {
    it('should be a function', () => {
      expect(blockchain.processBlock).toBeFunction()
    })
  })

  describe.skip('acceptChainedBlock', () => {
    it('should be a function', () => {
      expect(blockchain.acceptChainedBlock).toBeFunction()
    })
  })

  describe.skip('manageUnchainedBlock', () => {
    it('should be a function', () => {
      expect(blockchain.manageUnchainedBlock).toBeFunction()
    })
  })

  describe.skip('getUnconfirmedTransactions', () => {
    it('should be a function', () => {
      expect(blockchain.getUnconfirmedTransactions).toBeFunction()
    })
  })

  describe('isSynced', () => {
    it('should be a function', () => {
      expect(blockchain.isSynced).toBeFunction()
    })

    it('should be ok', () => {
      expect(blockchain.isSynced({
        timestamp: slots.getTime() - genesisBlock.data.timestamp,
        height: genesisBlock.data.height
      })).toBeTruthy()
    })
  })

  describe('isRebuildSynced', () => {
    it('should be a function', () => {
      expect(blockchain.isRebuildSynced).toBeFunction()
    })

    it('should be ok', () => {
      expect(blockchain.isRebuildSynced({
        timestamp: slots.getTime() - genesisBlock.data.timestamp,
        height: genesisBlock.data.height
      })).toBeTruthy()
    })
  })

  describe('getLastBlock', () => {
    it('should be a function', () => {
      expect(blockchain.getLastBlock).toBeFunction()
    })

    it('should be ok', () => {
      blockchain.stateMachine.state.lastBlock = genesisBlock

      expect(blockchain.getLastBlock()).toEqual(genesisBlock)
    })

    it('should be ok using onlyData', () => {
      blockchain.stateMachine.state.lastBlock = genesisBlock

      expect(blockchain.getLastBlock(true)).toEqual(genesisBlock.data)
    })
  })

  describe('__isChained', () => {
    it('should be a function', () => {
      expect(blockchain.__isChained).toBeFunction()
    })

    it('should be ok', () => {
      const previousBlock = {
        data: {
          id: 1,
          timestamp: 1,
          height: 1
        }
      }

      const nextBlock = {
        data: {
          id: 2,
          timestamp: 2,
          height: 2,
          previousBlock: 1
        }
      }

      expect(blockchain.__isChained(previousBlock, nextBlock)).toBeTruthy()
    })

    it('should not be ok', () => {
      const previousBlock = {
        data: {
          id: 2,
          timestamp: 2,
          height: 2
        }
      }

      const nextBlock = {
        data: {
          id: 1,
          timestamp: 1,
          height: 1,
          previousBlock: 1
        }
      }

      expect(blockchain.__isChained(previousBlock, nextBlock)).toBeFalsy()
    })
  })

  describe('__registerQueue', () => {
    it('should be a function', () => {
      expect(blockchain.__registerQueue).toBeFunction()
    })

    it('should be ok', () => {
      blockchain.__registerQueue()

      expect(blockchain).toHaveProperty('queue')
      expect(blockchain).toHaveProperty('processQueue')
      expect(blockchain).toHaveProperty('rebuildQueue')
    })
  })
})