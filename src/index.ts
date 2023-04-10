/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

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

// const types = {
//   unit,

//   string,
//   number,
//   nothing,
//   object,
//   bigint,
//   boolean,
//   callable,
//   symbol,

//   promise,

//   array
// }

function $compareWithUnit (test: any, comparedWith: any) {
  return (comparedWith === unit)
}

function $sameReference (test: any, comparedWith: any) {
  return (test === comparedWith)
}

function $undefined (test: any, comparedWith: any) {
  return (test === undefined && comparedWith === nothing)
}

const reverseTypes = {
  [unit]: 'unit',
  [string]: 'string',
  [number]: 'number',
  [nothing]: 'nothing',
  [object]: 'object',
  [bigint]: 'bigint',
  [boolean]: 'boolean',
  [callable]: 'callable',
  [symbol]: 'symbol',
  [promise]: 'promise',
  [array]: 'array'
} as const

type Types = keyof typeof reverseTypes
function $compareBase<T> (test?: T, comparedWith?: T | Types) {
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
              : (typeof test === reverseTypes[comparedWith as Exclude<typeof comparedWith, T>])
      )
    )
}

function $compareSome<T> (test?: T, compareWith?: T | Types) {
  return $compareBase!(test, compareWith)
}

function $compareExact<T> (test: T, compareWith: T | Types) {
  return $compareBase!(test, compareWith)
}

function $canDeep<T> (test$: T, compareWith$: T) {
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
  [key in keyof T]: (T[key] extends Obj ? Exact<T[key]> : T[key]) | Types;
}
export type Some<T> = {
  [key in keyof T]?: (T[key] extends Obj ? Some<T[key]> : T[key]) | Types;
}

function deepSome <TDeep extends Obj> (_t: TDeep, c: Some<TDeep>) {
  let key: keyof TDeep
  for (key in c) {
    if (!$compareSome!(_t[key], c[key])) {
      if (typeof c[key] === 'symbol') return
      if ($canDeep!(_t[key], c[key])) {
        const result = deepSome(_t[key], c[key] as NonNullable<typeof c[typeof key]>)
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

function deepExact <TDeep extends Obj> (_t: TDeep, c: Exact<TDeep>) {
  if (!exactKeys(_t, c)) {
    return
  }
  let key: keyof TDeep
  for (key in c) {
    if (!$compareExact!(_t[key], c[key])) {
      if (typeof c[key] === 'symbol') return
      if ($canDeep!(_t[key], c[key])) {
        const result = deepExact(_t[key], c[key] as Exclude<TDeep, Types>)
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

  deepSome (c: Some<T>): this | undefined {
    return deepSome(this.t, c) ? this : undefined
  }

  deepExact (c: Exact<T>): this | undefined {
    return deepExact(this.t, c) ? this : undefined
  }

  get patterns () {
    return this
  }
}

export const match = <T extends Obj>(t: T) => new Match(t)
