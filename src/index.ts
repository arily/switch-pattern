/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { $createContext, $reverse } from './transforms/index.macro'
import { $$ts } from 'ts-macros'

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

const types = {
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

function $compareWithUnit (test: any, comparedWith: any) {
  return (comparedWith === unit)
}

function $sameReference (test: any, comparedWith: any) {
  return (test === comparedWith)
}

function $undefined (test: any, comparedWith: any) {
  return (test === undefined && comparedWith === nothing)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const reverseTypes = $reverse!(types)
function $symbol (test: any, comparedWith: symbol) {
  return Array.isArray(test)
    ? comparedWith === array
    : test instanceof Function
      ? comparedWith === callable
      : test instanceof Promise
        ? comparedWith === promise
        // ts-macro bug: typeof get lost
        : $$ts!('(typeof test === reverseTypes[comparedWith])')
}

function compareBase<T> (test?: T, comparedWith?: T | symbol) {
  return $compareWithUnit!(test, comparedWith)
    || $sameReference!(test, comparedWith)
    || $undefined!(test, comparedWith)
    // match types
    || (typeof comparedWith === 'symbol' && $symbol!(test, comparedWith)
    )
}

function $compareSome<T> (test?: T, compareWith?: T | symbol) {
  return compareBase(test, compareWith)
}

function $compareExact<T> (test: T, compareWith: T | symbol) {
  return compareBase(test, compareWith)
}

function canDeep<T> (test$: T, compareWith$: T) {
  return (Array.isArray(compareWith$) && Array.isArray(test$))
  || (typeof compareWith$ === 'object' && typeof test$ === 'object')
}

function exactKeys<T extends Record<any, any>> (test$: T, compareWith$: T) {
  if (Array.isArray(test$) && Array.isArray(compareWith$)) { return test$.length === compareWith$.length }
  const keyofC = Object.keys(compareWith$)
  return Object.keys(test$).every(k => keyofC.includes(k))
}

export type Exact<T> = {
  [key in keyof T]: (T[key] extends Record<any, any> ? Exact<T[key]> : T[key]) | symbol;
}
export type Some<T> = {
  [key in keyof T]?: (T[key] extends Record<any, any> ? Some<T[key]> : T[key]) | symbol;
}
export function match<T extends Record<any, any>> (t: T) {
  const context = {
    some (c: Some<T>) {
      let key: keyof T
      for (key in c) {
        if (!$compareSome!(t[key], c[key])) {
          return
        }
      }
      return context
    },
    exact (c: Exact<T>) {
      if (!exactKeys(t, c)) {
        return
      }
      let key: keyof T
      for (key in c) {
        if (!$compareExact!(t[key], c[key])) {
          return
        }
      }
      return context
    },

    deep: {
      some: deepSome,
      exact: deepExact
    }
  }

  function deepSome <TDeep extends T> (c: Some<TDeep>, _t: TDeep = t) {
    let key: keyof TDeep
    for (key in c) {
      if (!$compareSome!(_t[key], c[key])) {
        if (typeof c[key] === 'symbol') return
        if (canDeep(_t[key], c[key])) {
          const result = deepSome(c[key] as NonNullable<typeof c[typeof key]>, _t[key])
          if (!result) {
            return
          }
        } else {
          return
        }
      }
    }
    return context
  }

  function deepExact <TDeep extends T> (c: Exact<TDeep>, _t: TDeep = t) {
    if (!exactKeys(_t, c)) {
      return
    }
    let key: keyof T
    for (key in c) {
      if (!$compareExact!(_t[key], c[key])) {
        if (typeof c[key] === 'symbol') return
        if (canDeep(_t[key], c[key])) {
          const result = deepExact(c[key] as Exclude<TDeep, symbol>, _t[key])
          if (!result) {
            return
          }
        } else {
          return
        }
      }
    }
    return context
  }

  return $createContext!(context)
}

export default match
