import genUniqueId from '../utils/genUniqueId'

export class Audio {
  name: string
  url: string
  offset: number
  uniqueId: string

  constructor(name: string, url: string, offset: number) {
    this.name = name
    this.url = url
    this.offset = offset
    this.uniqueId = genUniqueId()
  }
}
