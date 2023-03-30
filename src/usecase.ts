import { match } from './matcher'

const { patterns, some, exact, number, string, object } = match([1, 2, 'what', {}])

switch (patterns) {
  case exact([number, 2, string, object]): {
    console.log('matched')
    break
  }
  default: {
    throw new Error('boom')
  }
}