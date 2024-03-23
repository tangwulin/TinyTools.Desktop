import { format } from 'date-fns'
import log from 'electron-log'

// 生成当前日期的格式化字符串作为日志文件的名称
const logFileName = format(new Date(), 'yyyy-MM-dd_HH-mm-ss') + '.log'
// 日志文件的路径

log.transports.file.level = 'debug'
log.transports.file.maxSize = 10024300
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}'

log.transports.file.resolvePathFn = () => 'log\\' + logFileName

const logger = log.scope('main')
export default logger
