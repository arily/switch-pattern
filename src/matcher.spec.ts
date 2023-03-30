import { assert } from 'console'
import { callable, match } from './matcher'

const testBaseObject = { number: 1, string: 'string' }
const testBaseArray = [1, 2, 'string'] as const
const testDeepObject = {
  deep: testBaseObject,
  array: testBaseArray,
  l1: '1'
}
const testDeepArray = [testBaseObject, testBaseArray] as const
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
    it('some', function (done) {
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
    it('exact', function (done) {
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
    it('base types', function (done) {
      switch (patterns) {
        case exact({ number, string }): {
          done()
        }
      }
    })
  })

  describe('pattern matching array', function () {
    const { patterns, some, exact, unit, string } = match(testBaseArray)
    it('some', function (done) {
      switch (patterns) {
        case some([string, 2]): {
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
    it('exact', function (done) {
      switch (patterns) {
        case exact([1, 2, string]): {
          done()
        }
      }
    })
    it('base types', function (done) {
      switch (patterns) {
        case exact([unit, unit, string]): {
          done()
        }
      }
    })
  })

  describe('pattern matching deep object', function () {
    const { patterns, some, exact, array, string, object, bigint, deep, number, unit } = match(testDeepObject)
    it('one layer with some', function (done) {
      switch (patterns) {
        case some({ l1: callable }): {
          throw new Error('should not match; callable')
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
    it('one layer with exact', function (done) {
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
    it('deep object with deepSome', function (done) {
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
    it('array in object with deepSome', function (done) {
      switch (patterns) {
        case deep.some({ array: [2, 2, unit] }): {
          throw new Error('should not match because 1!=2')
        }
        case deep.some({ array: [number, 2, 2] }): {
          throw new Error('should not match because [3] is string')
        }
        case deep.some({ l1: callable, array: [number, 2, 'string'] }): {
          throw new Error('should not match because l1 is not callable')
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

    it('deep object with deepExact', function (done) {
      switch (patterns) {
        case deep.exact({ l1: string, deep: { number: string, string } }): {
          throw new Error('should not match because this pattern misses some members')
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
    it('array in object with deepExact', function (done) {
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

  describe('pattern matching deep array', function () {
    const { patterns, some, exact, array, string, object, bigint, deep, number, unit } = match(testDeepArray)
    it('one layer of array with some', function (done) {
      switch (patterns) {
        case some([number, array]): {
          throw new Error('should not match: should be obj, arr')
        }
        case some([unit, object]): {
          throw new Error('should not match')
        }
        case some([object, array]): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })
    it('one layer with exact', function (done) {
      switch (patterns) {
        case exact([string]): {
          throw new Error('should not match')
        }
        case exact([object, array]): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })
    it('deep object with deepSome', function (done) {
      switch (patterns) {
        case deep.some([{ number: string }]): {
          throw new Error('should not match')
        }
        case deep.some([{ number: 1 }]): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })
    it('array in object with deepSome', function (done) {
      switch (patterns) {
        case deep.some([unit, [string]]): {
          throw new Error('should not match case 1')
        }
        case deep.some([object, [1, number, object]]): {
          throw new Error('should not match')
        }
        case deep.some([object, [1, 2, 'string']]): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })

    it('deep object with deepExact', function (done) {
      switch (patterns) {
        case deep.exact([]): {
          throw new Error('should not match: missing member')
        }
        case deep.exact([unit]): {
          throw new Error('should not match case 1')
        }
        case deep.exact([object]): {
          throw new Error('should not match')
        }
        case deep.exact([{ number, string }, array]): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })
    it('array in object with deepExact', function (done) {
      switch (patterns) {
        case deep.exact([]): {
          throw new Error('should not match: missing member')
        }
        case deep.exact([unit]): {
          throw new Error('should not match case 1')
        }
        case deep.exact([{ number: string, string }, array]): {
          throw new Error('should not match')
        }
        case deep.exact([{ number, string }, array]): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })
  })

  describe('matching types', function () {
    it('unit (any)', function (done) {
      const { patterns, exact, unit } = match({ test: Symbol('something you never seen') })

      switch (patterns) {
        case exact({ test: unit }): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })
    it('String', function (done) {
      const { patterns, exact, string } = match({ test: 'str' })

      switch (patterns) {
        case exact({ test: string }): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })
    it('Number', function (done) {
      const { patterns, exact, number } = match({ test: 123 })

      switch (patterns) {
        case exact({ test: number }): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })
    it('Boolean', function (done) {
      const { patterns, exact, boolean } = match({ test: false })

      switch (patterns) {
        case exact({ test: boolean }): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })
    it('BigInt', function (done) {
      const { patterns, exact, bigint } = match({ test: BigInt(123) })

      switch (patterns) {
        case exact({ test: bigint }): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })
    it('Array', function (done) {
      const { patterns, exact, array } = match({ test: [] })

      switch (patterns) {
        case exact({ test: array }): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })
    it('Object', function (done) {
      const { patterns, exact, object } = match({ test: {} })

      switch (patterns) {
        case exact({ test: object }): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })
    it('Nothing (undefined)', function (done) {
      const { patterns, exact, nothing } = match({ test: undefined })

      switch (patterns) {
        case exact({ test: nothing }): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })
    it('Symbol', function (done) {
      const { patterns, exact, symbol } = match({ test: Symbol('something you never seen 2') })

      switch (patterns) {
        case exact({ test: symbol }): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })
    it('Callable', function (done) {
      const { callable, patterns, exact } = match({ fn () { return 1 }, async fn2 () { } })

      switch (patterns) {
        case exact({ fn: callable, fn2: callable }): {
          done()
          break
        }
        default: {
          throw new Error('matched nothing')
        }
      }
    })
    it('Promise', function (done) {
      const { promise, patterns, exact } = match({ p: Promise.resolve(42) })

      switch (patterns) {
        case exact({ p: promise }): {
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
