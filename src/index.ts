/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { $reverse } from './transforms/index.macro'

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

const reverseTypes = $reverse!(types)
function compareBase<T> (test?: T, comparedWith?: T | symbol) {
  return $compareWithUnit!(test, comparedWith)
    || $sameReference!(test, comparedWith)
    || $undefined!(test, comparedWith)
    // match types
    || (
      typeof comparedWith === 'symbol'
      && (
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

type Obj = Record<any, any>

function exactKeys<T extends Obj> (test$: T, compareWith$: T) {
  if (Array.isArray(test$) && Array.isArray(compareWith$)) { return test$.length === compareWith$.length }
  const keyofC = Object.keys(compareWith$)
  return Object.keys(test$).every(k => keyofC.includes(k))
}

export type Exact<T> = {
  [key in keyof T]: (T[key] extends Obj ? Exact<T[key]> : T[key]) | symbol;
}
export type Some<T> = {
  [key in keyof T]?: (T[key] extends Obj ? Some<T[key]> : T[key]) | symbol;
}

function deepSome <TDeep extends Obj> (c: Some<TDeep>, _t: TDeep) {
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
  return true
}

function deepExact <TDeep extends Obj> (c: Exact<TDeep>, _t: TDeep) {
  if (!exactKeys(_t, c)) {
    return
  }
  let key: keyof TDeep
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
  return true
}
export class Match<T extends Obj> {
  t: T

  constructor (t: T) {
    this.t = t

    this.some = this.some.bind(this)
    this.exact = this.exact.bind(this)
  }

  get deep () {
    return {
      some: this.deepSome.bind(this),
      exact: this.deepExact.bind(this)
    }
  }

  some (c: Some<T>) {
    let key: keyof T
    for (key in c) {
      if (!$compareSome!(this.t[key], c[key])) {
        return
      }
    }
    return this
  }

  exact (c: Exact<T>) {
    if (!exactKeys(this.t, c)) {
      return
    }
    let key: keyof T
    for (key in c) {
      if (!$compareExact!(this.t[key], c[key])) {
        return
      }
    }
    return this
  }

  deepSome (c: Some<T>): this | undefined {
    return deepSome(c, this.t) ? this : undefined
  }

  deepExact (c: Exact<T>): this | undefined {
    return deepExact(c, this.t) ? this : undefined
  }

  get patterns () {
    return this
  }
}

export const match = <T extends Obj>(t: T) => new Match(t)
