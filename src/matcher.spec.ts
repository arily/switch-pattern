import { assert } from 'console'
import { callable, match } from './matcher'

const testBaseObject = { number: 1, string: 'string' }
const testBaseArray = [1, 2, 'string'] as const
const testDeepObject = {
  deep: testBaseObject,
  array: testBaseArray,
  l1: '1'
}
const testDeepArray = [testBaseObject, testBaseArray]
describe('Matcher', function () {
  describe('create pattern matching context', function () {
    it('should create without error', function (done) {
      match(testBaseObject)
      done()
    })
    it('should have <patterns> as switch expression', function (done) {
      assert(match(testBaseObject).patterns, 'patterns')
      done()
    })
  })
  describe('pattern matching object', function () {
    const { patterns, some, exact, number, string, unit } = match(testBaseObject)
    it('matches object some', function (done) {
      switch (patterns) {
        case some({ number: 2 }): {
          throw new Error('should not match')
        }
        case some({ number: '2' }): {
          throw new Error('should not match')
        }
        case some({ number: string }): {
          throw new Error('should not match')
        }
        case some({ number: 1 }): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })
    it('matches object exact', function (done) {
      switch (patterns) {
        case exact({ number: 2 }): {
          throw new Error('should not match: missing member')
        }
        case exact({ number: 2, string: 2 }): {
          throw new Error('should not match')
        }
        case exact({ number: 2, string: unit }): {
          throw new Error('should not match')
        }
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
        case some([2, 2]): {
          throw new Error('should not match')
        }
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

  describe('pattern matching deep object', function () {
    const { patterns, some, exact, array, string, object, bigint, deep, number, unit } = match(testDeepObject)
    it('matches one layer with some', function (done) {
      switch (patterns) {
        case some({ l1: callable }): {
          throw new Error('should not match')
        }
        case some({ l1: string, deep: object }): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })
    it('matches one layer with exact', function (done) {
      switch (patterns) {
        case exact({ l1: bigint, deep: object, array }): {
          throw new Error('should not match')
        }
        case exact({ l1: string, deep: object, array }): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })
    it('matches deep object with deepSome', function (done) {
      switch (patterns) {
        case deep.some({ l1: unit, deep: { number: string } }): {
          throw new Error('should not match')
        }
        case deep.some({ l1: string, deep: { number } }): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })
    it('matches array in object with deepSome', function (done) {
      switch (patterns) {
        case deep.some({ l1: unit, array: [2, 2, unit] }): {
          throw new Error('should not match case 1')
        }
        case deep.some({ l1: string, array: [2, 2, unit] }): {
          throw new Error('should not match')
        }
        case deep.some({ l1: string, array: [1, unit, 'string'] }): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })

    it('matches deep object with deepExact', function (done) {
      switch (patterns) {
        case deep.exact({ l1: string, deep: { number: string, string } }): {
          throw new Error('should not match: missing member')
        }
        case deep.exact({ l1: string, deep: { number: string, string }, array: unit }): {
          throw new Error('should not match')
        }
        case deep.exact({ l1: string, deep: { number: 'string', string }, array: unit }): {
          throw new Error('should not match: no deep')
        }
        case deep.exact({ l1: string, deep: { number, string }, array: unit }): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })
    it('matches array in object with deepExact', function (done) {
      switch (patterns) {
        case deep.exact({ l1: bigint, array: [1, 2, unit], deep: unit }): {
          throw new Error('should not match')
        }
        case deep.exact({ l1: string, array: [1, unit, 'string'], deep: unit }): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })
  })
})
