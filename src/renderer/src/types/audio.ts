import genUniqueId from '../utils/genUniqueId'

export class Audio {
  name: string
  src: string
  offset: number
  uniqueId: string

  constructor(name: string, src: string, offset: number, uniqueId: string) {
    this.name = name
    this.src = src
    this.offset = offset
    this.uniqueId = genUniqueId()
  }
}
