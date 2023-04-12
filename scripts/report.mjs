// @ts-check
const size = function getReadableFileSizeString (fileSizeInBytes) {
  let i = -1
  const byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB']
  do {
    fileSizeInBytes /= 1024
    i++
  } while (fileSizeInBytes > 1024)

  return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i]
}

export default function report (sizes) {
  const report = sizes.map(e => {
    const input = e.before.length
    const output = e.after.length
    return {
      path: e.path,
      input: size(input),
      output: size(output),
      ratio: (output / input).toLocaleString(undefined, { style: 'percent' })
    }
  })
  console.table(report)
}
