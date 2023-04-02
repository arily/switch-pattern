
export const match = <T extends Record<any, any>>(t: T) => {
  const context = {
    some (c: Some<T>) {
      let key: keyof T
      for (key in c) {
        if (!$compareSome!(t[key], c[key])) {
          return
        }
      }
      return this
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
      return this
    },

    deep: {
      some (c: Some<T>) {
        return deepSome(c)
      },
      exact (c: Exact<T>) {
        return deepExact(c)
      }
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
