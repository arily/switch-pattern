import { match, number, string, object } from '.'

console.log(string)
const { patterns, some, exact } = match([1, 2, 'what'])

console.log(patterns, some([number, 2, 'what']))
switch (patterns) {
  case exact([number, 2, string]): {
    console.log('matched')
    break
  }
  default: {
    throw new Error('boom')
  }
}
