/** Log levels supported by the cli logger */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}
let currentLevel: LogLevel = 'info'
/** Change the minimum level which gets printed */
export function setLogLevel(level: LogLevel): void {
  currentLevel = level
}
/** Print a message if the level is above the current minimum level */
export function log(level: LogLevel, message: string): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[currentLevel]) return
  const prefix = level === 'info' ? '' : `[${level}] `
  console.log(`${prefix}${message}`)
}
/** Leveled cli logger */
export const logger = {
  debug: (message: string) => log('debug', message),
  info: (message: string) => log('info', message),
  warn: (message: string) => log('warn', message),
  error: (message: string) => log('error', message),
}
