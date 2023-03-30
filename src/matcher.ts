export const string = Symbol('string')
export const number = Symbol('number')
export const object = Symbol('object')
export const nothing = Symbol('undefined')
export const unit = Symbol('any value')
export const bigint = Symbol('bigint')
export const boolean = Symbol('boolean')
export const callable = Symbol('function')
export const symbol = Symbol('symbol')
export const array = Symbol('array')
export const promise = Symbol('promise')

export const types = {
  unit,

  string,
  number,
  nothing,
  object,
  bigint,
  boolean,
  callable,
  symbol,

  promise,

  array
}
export const reverseTypes = Object.entries(types).reduce<Record<symbol, keyof typeof types>>((acc, [k, v]) => {
  acc[v] = k as keyof typeof types
  return acc
}, {})

type Exact<T> = {
  [key in keyof T]: (T[key] extends Record<any, any> ? Exact<T[key]> : T[key]) | symbol
}
type Some<T> = {
  [key in keyof T]?: (T[key] extends Record<any, any> ? Some<T[key]> : T[key]) | symbol
}

function createContext<T extends Record<any, any>> (context: T) {
  const mixed = Object.assign(context, { patterns: context })
  return mixed
}

function compareBase<T> (test?: T, comparedWith?: T | symbol) {
  return (
    // unit type
    comparedWith === unit ||
    // deep equal
    test === comparedWith ||

    // match types
    (typeof comparedWith === 'symbol' &&
      (
        // array
        Array.isArray(test)
          ? comparedWith === array
          : test instanceof Function
            ? comparedWith === callable
            : test instanceof Promise
              ? comparedWith === promise
              // eslint-disable-next-line valid-typeof
              : (typeof test === reverseTypes[comparedWith])
      )
    )
  )
}
function compareSome<T> (test?: T, comparedWith?: T | symbol) {
  return compareBase(test, comparedWith)
}

function compareExact<T> (test: T, comparedWith: T | symbol) {
  return compareBase(test, comparedWith)
}

export function match<T extends Record<any, any>> (t: T) {
  const context = {
    ...types,

    some,
    exact,

    deep: {
      some: deepSome,
      exact: deepExact
    }
  }

  function some (c: Some<T>) {
    let key: keyof T
    for (key in c) {
      if (!compareSome(t[key], c[key])) {
        return false
      }
    }
    return context
  }

  function exact (c: Exact<T>) {
    const keyofC = Object.keys(c)
    if (!Object.keys(t).every(k => keyofC.includes(k))) { return false }
    let key: keyof T
    for (key in c) {
      if (!compareExact(t[key], c[key])) {
        return false
      }
    }
    return context
  }

  function deepSome (c: Some<T>) {
    let key: keyof T
    for (key in c) {
      const cmp1 = compareSome(t[key], c[key])
      if (!cmp1) {
        if (typeof c[key] === 'symbol') return false
        const canDeep = (Array.isArray(c[key]) && Array.isArray(t[key])) || (typeof c[key] === 'object' && typeof t[key] === 'object')
        if (canDeep) {
          const deepMatch = match(t[key])
          const result = deepMatch.deep.some(c[key] as Exclude<typeof c[typeof key], symbol>)
          if (result === false) {
            return false
          }
        } else {
          return false
        }
      }
    }
    return context
  }

  function deepExact (c: Exact<T>) {
    const keyofC = Object.keys(c)
    if (!Object.keys(t).every(k => keyofC.includes(k))) { return false }
    let key: keyof T
    for (key in c) {
      const cmp1 = compareExact(t[key], c[key])
      if (!cmp1) {
        if (typeof c[key] === 'symbol') return false
        const canDeep = (Array.isArray(c[key]) && Array.isArray(t[key])) || (typeof c[key] === 'object' && typeof t[key] === 'object')
        if (canDeep) {
          const deepMatch = match(t[key])
          const result = deepMatch.deep.exact(c[key] as Exclude<typeof c[typeof key], symbol>)
          if (result === false) {
            return false
          }
        } else {
          return false
        }
      }
    }
    return context
  }

  return createContext(context)
}

export default match
