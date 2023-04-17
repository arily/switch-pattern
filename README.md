# switch-pattern

[![npm version](https://badge.fury.io/js/switch-pattern.svg)](https://badge.fury.io/js/switch-pattern)
[![downloads count](https://img.shields.io/npm/dt/switch-pattern.svg)](https://www.npmjs.com/package/switch-pattern)

pattern matching done right.

## Usage

example usage:

```typescript
import { match, number, string, unit } from ".";
const { patterns, exact } = match([1, 2, "what"] as const);
// use with switch
switch (patterns) {
    case exact([number, 2, string]): {
        console.log("matched");
        break;
    }
    default: {
        throw new Error("boom");
    }
}
```

### supporting partial match or full match

```typescript
const match = <T>(input: T): Context => {
  some(compareWith: Some<T>): Context | undefined
  exact(compareWith: Exact<T>): Context | undefined
  deep: {
    some(compareWith: DeepSome<T>): Context | undefined
    exact(compareWith: DeepExact<T>): Context | undefined
  }
  // same as deep.some
  deepSome(compareWith: DeepSome<T>)): Context | undefined
  // same as deep.exact
  deepExact(compareWith: DeepExact<T>): Context | undefined
}
```

### Top-tier TS & ESLint support

```typescript
const { patterns, exact } = match([1, 2, "what"] as const);
// use with switch
switch (patterns) {
    case exact([number, 2, string]): {
        console.log("matched");
        break;
    }
    // ESLint error: Duplicate case label.
    case exact([number, 2, string]): {
        console.log("matched");
        break;
    }
    // TS Error: Type Type 'string' is not assignable to type '2 | MatchCallback<2> | Types<2>'.
    case exact([number, "2", string]): {
        console.log("matched");
        break;
    }
    /**
     * TS Error: Argument of type '[unique symbol, 2]' is not assignable to parameter of type 'readonly [1 | MatchCallback<1> | Types<1>, 2 | MatchCallback<2> | Types<2>, "what" | MatchCallback<"what"> | Types<"what">]'.
     * Source has 2 element(s) but target requires 3.
     */
    case exact([number, 2]): {
        console.log("matched");
        break;
    }
    /**
     * Argument of type '{ name: symbol; }' is not assignable to parameter of type 'readonly [1 | MatchCallback<1> | Types<1>, 2 | MatchCallback<2> | Types<2>, "what" | MatchCallback<"what"> | Types<"what">]'.
     * Object literal may only specify known properties, and 'name' does not exist in type 'readonly [1 | MatchCallback<1> | Types<1>, 2 | MatchCallback<2> | Types<2>, "what" | MatchCallback<"what"> | Types<"what">]'.
     */
    case exact({ name: string }): {
        console.log("matched");
        break;
    }
    default: {
        throw new Error("boom");
    }
}
```

### Chainable

```typescript
switch (patterns) {
    case exact([number, 2, string])?.some([unit, unit, "what"]): {
        console.log("matched chained");
        break;
    }
    default: {
        throw new Error("boom");
    }
}
```

### Pattern matching deep values

```typescript
const {
    deep: { exact },
} = match([1, 2, "what", { number: 42 }] as const);

if (exact([number, number, string, { number: number }])) {
    console.log("matched deep");
}
```

### use custom compare function

```typescript
import { custom } from "switch-patterns";
const { exact, patterns } = match([1, 2, "what", { number: 42 }] as const);

switch (patterns) {
    case exact([number, 2, unit, custom((val) => val.number === 42)]): {
        console.log("matched");
        break;
    }
    default: {
        throw new Error("boom");
    }
}
```

### infer matched type **TS only**

Due to TS limit side-effects won't alter the computed type.
We provide an utility type as well as an assertion function to get around this limit.
If you know any better way of doing this please let me know.

```typescript
import { number, inferPatternType } from 'switching-pattern'
const unk = JSON.parse(JSON.stringify({ test: 123 })); // any

const { some, patterns } = match(unk);

const some1 = {
    test: number,
} as const;
switch (patterns) {
    case some(some1): {
        inferPatternType(unk, some1)
        unk // { readonly test: number }
        break
    }
    // or 
    case some(some1): {
        const b = unk as InferPatternType<typeof some1>;
        b // { readonly test: number }
        break
    }
}
```

### matching JS types

| Type                    | import                                      | description                                                                                           |
| ----------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| any Callable            | `import { callable } from 'switch-pattern'` | function, async function, arrow function                                                              |
| any number              | `import { number } from 'switch-pattern'`   | `typeof NaN` is a number, NaN will be matched. to exclude NaN use `custom((v) => !isNaN(v))` instead. |
| any bigint              | `import { bigint } from 'switch-pattern'`   |                                                                                                       |
| any string              | `import { string } from 'switch-pattern'`   |                                                                                                       |
| any value               | `import { unit } from 'switch-pattern'`     | designed to be a placeholder for any unknown value.                                                   |
| any object              | `import { object } from 'switch-pattern'`   | `null` is considered as objects in javascript. To match `null`, use primitive `null` instead.         |
| any array               | `import { array } from 'switch-pattern'`    | uses `Array.isArray()` under the hood.                                                                |
| null or undefined       | `import { nothing } from 'switch-pattern'`  | strict `null` or `undefined`                                                                          |
| any symbol              | `import { symbol } from 'switch-pattern'`   |                                                                                                       |
| any boolean value       | `import { boolean } from 'switch-pattern'`  | strict `true` or `false`, will not cast to truthy or falsy values.                                    |
| any Promise             | `import { promise } from 'switch-pattern'`  |                                                                                                       |
| custom compare function | `import { custom } from 'switch-pattern'`   | `matcher((matchValue: *infered from usage*) => boolean)`                                              |

## Development

```bash
yarn
```

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br/>
Feel free to check [issues page](https://github.com/piecioshka/switch-pattern/issues/).

## Show your support

Give a ⭐️ if this project helped you!

## License

[The MIT License](http://piecioshka.mit-license.org) @ 2023
