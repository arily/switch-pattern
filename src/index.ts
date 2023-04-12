/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

type Obj = Record<any, any>

type MatchCallbackDef<T = unknown> = (test: T) => boolean
type MatchCallback<T = unknown> = MatchCallbackDef<T> & { __custom: true }

export type DeepExact<T> = {
  [key in keyof T]: (T[key] extends Obj ? DeepExact<T[key]> : T[key]) | MatchCallback<T[key]> | Types<T[key]>;
}
export type DeepSome<T> = {
  [key in keyof T]?: (T[key] extends Obj ? DeepSome<T[key]> : T[key]) | MatchCallback<T[key]> | Types<T[key]>;
}
export type Exact<T> = {
  [key in keyof T]: T[key] | MatchCallback<T[key]> | Types<T[key]>;
}
export type Some<T> = {
  [key in keyof T]?: T[key] | MatchCallback<T[key]> | Types<T[key]>;
}

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
export const custom = <T>(cb: MatchCallbackDef<T>): MatchCallback<T> => {
  return Object.assign(cb, { __custom: true } as const)
}

const reverseTypes = {
  [unit]: 'unit',
  [string]: 'string',
  [number]: 'number',
  [bigint]: 'bigint',
  [object]: 'object',
  [boolean]: 'boolean',
  [callable]: 'callable',
  [symbol]: 'symbol',
  [promise]: 'promise',
  [array]: 'array'
} as const

type ReverseTypes = keyof typeof reverseTypes

type Types<T> =
(
  | T extends Promise<any> ? typeof promise : never
  | T extends string ? typeof string : never
  | T extends number ? typeof number : never
  | T extends bigint ? typeof bigint : never
  | T extends CallableFunction ? typeof callable : never
  | T extends boolean ? typeof boolean : never
  | T extends symbol ? typeof symbol : never
  | T extends undefined | null ? typeof nothing : never
  | T extends any[] ? typeof array : never
  | T extends Record<any, any> ? typeof object | typeof array : never
) | typeof unit

function $unit<T> (test: T, comparedWith: T | Types<T> | MatchCallback<T>): comparedWith is Exclude<typeof comparedWith, typeof unit> {
  return (comparedWith === unit)
}

/**
 * checks for
 * - same reference
 * - null
 * - primitive value
 */
function $strictEq<T> (test: T, comparedWith: T) {
  return (test === comparedWith)
}

/**
 * check for primitive nothing:
 * - null
 * - undefined
 */
function $nothing<T> (test: T, comparedWith: T | Types<T> | MatchCallback<T>): comparedWith is Exclude<typeof comparedWith, typeof nothing> {
  return (
    (test === undefined || test === null)
    && comparedWith === nothing
  )
}

function $custom<T> (test: T, comparedWith: T | Types<T> | MatchCallback<T>) {
  return (
    typeof comparedWith === 'function'
    && '__custom' in comparedWith
    && comparedWith(test)
  )
}

function $compareBase<T> (test: T, comparedWith: T | MatchCallback<T> | Types<T>) {
  return $unit!(test, comparedWith)
    || $strictEq!(test, comparedWith)
    || $nothing!(test, comparedWith)
    || $custom!(test, comparedWith)
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
              : (typeof test === reverseTypes[comparedWith as ReverseTypes])
      )
    )
}

function $compareSome<T> (test: T, compareWith: T | MatchCallback<T> | Types<T>) {
  return $compareBase!(test, compareWith)
}

function $compareExact<T> (test: T, compareWith: T | MatchCallback<T> | Types<T>) {
  return $compareBase!(test, compareWith)
}

function $canDeep<T> (test$: T, compareWith$: T) {
  return (Array.isArray(compareWith$) && Array.isArray(test$))
  || (typeof compareWith$ === 'object' && typeof test$ === 'object')
}

function exactKeys<T extends Obj> (test$: T, compareWith$: Exact<T> | DeepExact<T>) {
  if (Array.isArray(test$) && Array.isArray(compareWith$)) {
    return test$.length === compareWith$.length
  }
  const keyofC = Object.keys(compareWith$)
  return Object.keys(test$).every(k => keyofC.includes(k))
}

function deepSome <TDeep extends Obj> (_t: TDeep, c: DeepSome<TDeep>) {
  let key: keyof TDeep
  for (key in c) {
    if (!$compareSome!(_t[key], c[key])) {
      if (typeof c[key] === 'symbol') return
      if ($canDeep!(_t[key], c[key])) {
        const result = deepSome(_t[key], c[key] as Exclude<TDeep, Types<TDeep>>)
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

function deepExact <TDeep extends Obj> (_t: TDeep, c: DeepExact<TDeep>) {
  if (!exactKeys(_t, c)) {
    return
  }
  let key: keyof TDeep
  for (key in c) {
    if (!$compareExact!(_t[key], c[key])) {
      if (typeof c[key] === 'symbol') return
      if ($canDeep!(_t[key], c[key])) {
        const result = deepExact(_t[key], c[key] as Exclude<TDeep, Types<TDeep>>)
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
// shamefully using class due to typescript limit (or d.ts would be any due to circular reference, "this" helps.)
export class Match<T extends Obj> {
  t: T

  constructor (t: T) {
    this.t = t

    this.some = this.some.bind(this)
    this.exact = this.exact.bind(this)
    this.deepSome = this.deepSome.bind(this)
    this.deepExact = this.deepExact.bind(this)
  }

  get deep (): {
    some: Match<T>['deepSome']
    exact: Match<T>['deepExact']
  } {
    return {
      some: this.deepSome,
      exact: this.deepExact
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

  deepSome (c: DeepSome<T>) {
    return deepSome(this.t, c) && this
  }

  deepExact (c: DeepExact<T>) {
    return deepExact(this.t, c) && this
  }

  get patterns () {
    return this
  }
}

export const match = <T extends Obj>(t: T) => new Match(t)
