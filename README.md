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
  some(compareWith: Partial<T>): Context | void
  exact(compareWith: T): Context | void
  deep: {
    some(compareWith: Partial<T>): Context | void
    exact(compareWith: T): Context | void
  }
}
```

### Top-tier TS & ESLint support

```typescript
import { match, number, string, unit } from ".";
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
    // TS Error: Type 'string' is not assignable to type 'symbol | 2'.
    case exact([number, "2", string]): {
        console.log("matched");
        break;
    }
    /** 
     * TS Error: Argument of type '[symbol, 2]' is not assignable to parameter of type 'readonly [symbol | 1, symbol | 2, symbol | "what"]'.
     * Source has 2 element(s) but target requires 3.
     */
    case exact([number, 2]): {
        console.log("matched");
        break;
    }
    /**
     *  Argument of type '{ name: symbol; }' is not assignable to parameter of type 'readonly [symbol | 1, symbol | 2, symbol | "what"]'.
     * Object literal may only specify known properties, and 'name' does not exist in type 'readonly [symbol | 1, symbol | 2, symbol | "what"]'.
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

### pattern matching types

```typescript
import {
  callable,
  match,
  number,
  string,
  unit,
  object,
  array,
  bigint,
  nothing,
  symbol,
  boolean,
  promise,
} from ".";
// index.spec.ts
describe("matching types", function () {
    it("unit (any)", function (done) {
        const { patterns, exact } = match({
            test: Symbol("something you never seen"),
        });

        switch (patterns) {
            case exact({ test: unit }): {
                done();
                break;
            }
            default: {
                throw new Error("matched nothing");
            }
        }
    });
    it("String", function (done) {
        const { patterns, exact } = match({ test: "str" });

        switch (patterns) {
            case exact({ test: string }): {
                done();
                break;
            }
            default: {
                throw new Error("matched nothing");
            }
        }
    });
    it("Number", function (done) {
        const { patterns, exact } = match({ test: 123 });

        switch (patterns) {
            case exact({ test: number }): {
                done();
                break;
            }
            default: {
                throw new Error("matched nothing");
            }
        }
    });
    it("Boolean", function (done) {
        const { patterns, exact } = match({ test: false });

        switch (patterns) {
            case exact({ test: boolean }): {
                done();
                break;
            }
            default: {
                throw new Error("matched nothing");
            }
        }
    });
    it("BigInt", function (done) {
        const { patterns, exact } = match({ test: BigInt(123) });

        switch (patterns) {
            case exact({ test: bigint }): {
                done();
                break;
            }
            default: {
                throw new Error("matched nothing");
            }
        }
    });
    it("Array", function (done) {
        const { patterns, exact } = match({ test: [] });

        switch (patterns) {
            case exact({ test: array }): {
                done();
                break;
            }
            default: {
                throw new Error("matched nothing");
            }
        }
    });
    it("Object", function (done) {
        const { patterns, exact } = match({ test: {} });

        switch (patterns) {
            case exact({ test: object }): {
                done();
                break;
            }
            default: {
                throw new Error("matched nothing");
            }
        }
    });
    it("Nothing (undefined)", function (done) {
        const { patterns, exact } = match({ test: undefined });

        switch (patterns) {
            case exact({ test: nothing }): {
                done();
                break;
            }
            default: {
                throw new Error("matched nothing");
            }
        }
    });
    it("Symbol", function (done) {
        const { patterns, exact } = match({
            test: Symbol("something you never seen 2"),
        });

        switch (patterns) {
            case exact({ test: symbol }): {
                done();
                break;
            }
            default: {
                throw new Error("matched nothing");
            }
        }
    });
    it("Callable", function (done) {
        const { patterns, exact } = match({
            fn() {
                return 1;
            },
            async fn2() {},
        });

        switch (patterns) {
            case exact({ fn: callable, fn2: callable }): {
                done();
                break;
            }
            default: {
                throw new Error("matched nothing");
            }
        }
    });
    it("Promise", function (done) {
        const { patterns, exact } = match({ p: Promise.resolve(42) });

        switch (patterns) {
            case exact({ p: promise }): {
                done();
                break;
            }
            default: {
                throw new Error("matched nothing");
            }
        }
    });
});
```

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

[The MIT License](http://piecioshka.mit-license.org) @ 2019
