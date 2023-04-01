// @ts-check
import { build } from 'esbuild'
const shared = {
  bundle: true,
  // minifyIdentifiers: true,
  // minify: true,
  // minifySyntax: true,
  // minifyWhitespace: true,
  entryPoints: {
    matcher: 'src/matcher.ts'
  }
}
await Promise.all([
  build({
    ...shared,
    outdir: 'output/esm',
    format: 'esm'
  }).catch((err) => {
    console.error(err)
  }),
  build({
    ...shared,
    outdir: 'output/cjs',
    cjsBridge: true
  }).catch((err) => {
    console.error(err)
  })
])
