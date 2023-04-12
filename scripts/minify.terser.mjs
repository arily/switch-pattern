// @ts-check
import * as url from 'url'
import { join, relative, resolve, dirname } from 'path'
import { readFile, writeFile, readdir } from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import { minify } from 'terser'

async function getFiles (dir) {
  const dirents = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(dirents.map((dirent) => {
    const res = resolve(dir, dirent.name)
    return dirent.isDirectory() ? getFiles(res) : res
  }))
  return Array.prototype.concat(...files)
}
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const folder = join(__dirname, '../dist')
if (!existsSync(folder)) {
  mkdirSync(folder)
}

const size = function getReadableFileSizeString (fileSizeInBytes) {
  let i = -1
  const byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB']
  do {
    fileSizeInBytes /= 1024
    i++
  } while (fileSizeInBytes > 1024)

  return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i]
}

function ensureDirectoryExistence (filePath) {
  const _dirname = dirname(filePath)
  if (existsSync(_dirname)) {
    return true
  }
  ensureDirectoryExistence(_dirname)
  mkdirSync(_dirname)
}

const _minify = async (code) => {
  const result = await minify(code, {
    ecma: 2020,
    compress: {
      arguments: true,
      hoist_props: true,
      keep_fnames: false,
      expression: true,
      booleans: true,
      module: true,
      inline: true,
      // unsafe_arrows: true,
      // unsafe_comps: true,
      // unsafe_Function: true,
      // unsafe_math: true,
      // unsafe_methods: true,
      passes: 3
    },
    mangle: {
      eval: true,
      toplevel: true
    },
    format: {
      wrap_func_args: false
    }
  })
  if (!result.code) {
    return code
  }
  return result.code
}
const output = join(__dirname, '../output/')
const dist = join(__dirname, '../dist/')

async function job (code) {
  console.info('input size:', size(code.length))
  code = await _minify(code)
  console.info('minified code size:', size(code.length))
  return code
}

async function writeBack (path, code) {
  ensureDirectoryExistence(path)
  writeFile(path, code, 'utf-8')
}
getFiles(output).then(paths => {
  paths.map(async path => {
    // omit macros (files are empty)
    if (path.includes('.macro.')) return

    const _path = relative(output, path)
    const __path = join(dist, _path)
    // console.log(path, _path, __path)
    let code = await readFile(path, 'utf-8')
    if (!path.includes('.d.ts')) {
      console.log('job: ', __path)
      code = await job(code)
    }
    return writeBack(__path, code)
  })
})
