import { match, number, string, unit } from '.'

const useCases: CallableFunction[] = [

  () => {
    const { patterns, exact } = match([1, 2, 'what'] as const)
    // use with switch
    switch (patterns) {
      case exact([number, 2, string]): {
        console.log('matched')
        break
      }
      default: {
        throw new Error('boom')
      }
    }

    // chaining
    switch (patterns) {
      case exact([number, 2, string])?.some([unit, unit, 'what']): {
        console.log('matched chained')
        break
      }
      default: {
        throw new Error('boom')
      }
    }
  },

  () => {
    const { exact } = match([1, 2, 'what'] as const)
    // without switch
    if (exact([1, 2, 'what'])) {
      console.log('matched')
    }
  },

  () => {
    const { deep: { exact } } = match([1, 2, 'what', { number: 42 }] as const)

    if (exact([number, number, string, { number }])) {
      console.log('matched deep')
    }
  },

  () => {
    const { deep: { exact } } = match([1, 2, 'what', { number: 42 }] as const)

    if (exact([number, number, string, { number }])) {
      console.log('matched deep')
    }
  }
]

for (const func of useCases) {
  func()
}
