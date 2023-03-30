type Branded<T, TBrand> = T & { __brand: TBrand }
type Compare = <T>(test?: T[keyof T], compareWith?: T[keyof T] | symbol) => boolean

const string = Symbol('string')
const number = Symbol('number')
const object = Symbol('object')
const _undefined = Symbol('undefined')
const unit = Symbol('any')
const bigint = Symbol('bigint')
const boolean = Symbol('boolean')
const _function = Symbol('function')
const symbol = Symbol('symbol')
const array = Symbol('array')

const typeMatch = {
  unit,

  string,
  number,
  undefined: _undefined,
  object,
  bigint,
  boolean,
  function: _function,
  symbol,

  array
}
const reversed = Object.entries(typeMatch).reduce<Record<symbol, keyof typeof typeMatch>>((acc, [k, v]) => {
  acc[v] = k as keyof typeof typeMatch
  return acc
}, {})

type Check<T> = {
  [key in keyof T]: T[key] | symbol
}

function createContext<T extends Record<any, any>> (context: T) {
  const mixed = Object.assign(context, { patterns: context as Branded<typeof context, 'patterns'> })
  return mixed as Branded<typeof mixed, 'match'>
}
const _compare: Compare = (test, comparedWith) => {
  console.log(test, comparedWith)
  return (
    comparedWith === typeMatch.unit ||
    test === comparedWith ||
    // eslint-disable-next-line valid-typeof
    (typeof test === reversed[comparedWith as symbol])
  )
}

export function match<T extends Record<any, any>> (t: T) {
  const context = {
    ...typeMatch,

    some,
    exact,

    deep: {
      some: deepSome
      // exact: deepExact
    }
  }

  function some (c: Partial<Check<T>>, compare: Compare = _compare) {
    let key: keyof T
    for (key in c) {
      if (!compare(t[key], c[key])) {
        return false
      }
    }
    return context
  }

  function exact (c: Check<T>) {
    const keyofC = Object.keys(c)
    return Object.keys(t).every(k => keyofC.includes(k)) && some(c)
  }

  function deepSome (c: Check<T>) {
  }

  return createContext(context)
}

export default match
