const ESC = String.fromCharCode(27)
const RESET = `${ESC}[0m`

const enabled = process.stdout.isTTY && !process.env.NO_COLOR

/**
 * @param {string} code
 * @returns {(text: string|number) => string}
 */
const style = (code) => (text) =>
  enabled ? `${ESC}[${code}m${text}${RESET}` : String(text)

/**
 * ANSI color helpers. Each is a no-op when output is not a TTY or NO_COLOR is set.
 */
export const c = {
  dim: style('2'),
  bold: style('1'),
  red: style('31'),
  green: style('32'),
  yellow: style('33'),
  cyan: style('36'),
}
