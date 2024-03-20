import { format } from 'date-fns'
import { app } from 'electron'
import path from 'path'
import pino from 'pino'

// 生成当前日期的格式化字符串作为日志文件的名称
const logFileName = format(new Date(), 'yyyy-MM-dd_HH-mm-ss') + '.log'

const transports = pino.transport({
  targets: [
    {
      target: 'pino/file',
      options: {
        destination: path.join(app.getPath('logs'), logFileName)
      }
    },
    {
      target: 'pino-pretty',
      options: {
        destination: 1
      }
    }
  ]
})

export const logger = pino(transports)

logger.info('Logger initialized')
logger.info(`Log file path:${path.join(app.getPath('logs'), logFileName)}`)
