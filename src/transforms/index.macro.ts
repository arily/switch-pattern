export function $reverse<K extends string | number | symbol, V extends string | number | symbol> (obj: Record<K, V>): Record<V, K> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]))
}

export function $createContext<T extends Record<any, any>> (context: T) {
  const mixed = Object.assign(context, { patterns: context })
  return mixed
}
