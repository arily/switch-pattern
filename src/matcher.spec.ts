import { assert } from 'console'
import { match } from './matcher'

const testBaseObject = { number: 1, string: 'string' }
const testBaseArray = [1, 2, 'string'] as const
const testDeepObject = {
  deep: testBaseObject,
  array: testBaseArray
}
const testDeepArray = [testBaseObject, testBaseArray]
describe('Matcher', function () {
  describe('create pattern matching context', function () {
    it('should create without error', function (done) {
      match(testBaseObject)
      done()
    })
    it('should have <patterns>', function (done) {
      assert(match(testBaseObject).patterns, 'patterns')
      done()
    })
  })
  describe('pattern matching object', function () {
    const { patterns, some, exact, number, string } = match(testBaseObject)
    it('matches some', function (done) {
      switch (patterns) {
        case some({ number: 1 }): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })
    it('matches exact', function (done) {
      switch (patterns) {
        case exact({ number: 1, string: 'string' }): {
          done()
        }
      }
    })
    it('matches types', function (done) {
      switch (patterns) {
        case exact({ number, string }): {
          done()
        }
      }
    })
  })

  describe('pattern matching array', function () {
    const { patterns, some, exact, unit, string } = match(testBaseArray)
    it('matches some', function (done) {
      switch (patterns) {
        case some([unit, 2]): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })
    it('matches exact', function (done) {
      switch (patterns) {
        case exact([unit, unit, string]): {
          done()
        }
      }
    })
  })
})
