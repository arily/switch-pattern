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

  array
}
export const reverseTypes = Object.entries(types).reduce<Record<symbol, keyof typeof types>>((acc, [k, v]) => {
  acc[v] = k as keyof typeof types
  return acc
}, {})

type CheckExact<T> = {
  [key in keyof T]: (T[key] extends Record<any, any> ? CheckExact<T[key]> : T[key]) | symbol
}
type CheckSome<T> = {
  [key in keyof T]?: (T[key] extends Record<any, any> ? CheckSome<T[key]> : T[key]) | symbol
}

function createContext<T extends Record<any, any>> (context: T) {
  const mixed = Object.assign(context, { patterns: context })
  return mixed
}

function compareBase<T> (test?: T, comparedWith?: T | symbol) {
  return (
    comparedWith === types.unit ||
    test === comparedWith ||

    // match types
    (typeof comparedWith === 'symbol' && (
      (Array.isArray(test) && reverseTypes[comparedWith] === 'array') ||
      // eslint-disable-next-line valid-typeof
      (typeof test === reverseTypes[comparedWith]))
    )
  )
}
function compareSome<T> (test?: T, comparedWith?: T | symbol) {
  return compareBase(...arguments)
}

function compareExact<T> (test?: T, comparedWith?: T | symbol) {
  return compareBase(...arguments)
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

  function some (c: CheckSome<T>) {
    let key: keyof T
    for (key in c) {
      if (!compareSome(t[key], c[key])) {
        return false
      }
    }
    return context
  }

  function exact (c: CheckExact<T>) {
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

  function deepSome (c: CheckSome<T>) {
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

  function deepExact (c: CheckExact<T>) {
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
