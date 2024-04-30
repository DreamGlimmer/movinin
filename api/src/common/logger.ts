import winston, { format, transports } from 'winston'

let ENABLE_LOGGING = true
let ENABLE_ERROR_LOGGING = true

const logFormat = format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)

const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json(),
    format.prettyPrint(),
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        logFormat,
      ),
    }),
    //
    // - Write all logs with importance level of `error` or less to `logs/error.log`
    // - Write all logs with importance level of `info` or less to `logs/all.log`
    //
    new transports.File({ filename: 'logs/error.log', level: 'error', format: logFormat }),
    new transports.File({ filename: 'logs/all.log', level: 'info', format: logFormat }),
  ],
})

export const info = (message: string, obj?: any) => {
  if (ENABLE_LOGGING) {
    if (obj) {
      logger.info(`${message} ${JSON.stringify(obj)}`)
    } else {
      logger.info(message)
    }
  }
}

export const error = (message: string, obj?: unknown) => {
  if (ENABLE_LOGGING && ENABLE_ERROR_LOGGING) {
    if (obj instanceof Error) {
      logger.error(`${message} ${obj.message}`) // ${err.stack}
    } else if (obj) {
      logger.error(`${message} ${JSON.stringify(obj)}`)
    } else {
      logger.error(message)
    }
  }
}

export const enableLogging = () => {
  ENABLE_LOGGING = true
}

export const disableLogging = () => {
  ENABLE_LOGGING = false
}

export const enableErrorLogging = () => {
  ENABLE_ERROR_LOGGING = true
}

export const disableErrorLogging = () => {
  ENABLE_ERROR_LOGGING = false
}
