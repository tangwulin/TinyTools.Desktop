import { Group } from './group'
import genUniqueId from '../utils/genUniqueId'

export class Person {
  name: string
  genderCode: 0 | 1 | 2 | 9 //根据GB/T 2261.1-2003，分别指代未知的性别、男性、女性、未说明的性别
  number: string
  group: Group[]
  uniqueId: string
  avatar: string = ''
  score: number = 0

  constructor(name: string, genderCode: 0 | 1 | 2 | 9, number: string, uniqueId?: string) {
    this.name = name
    this.genderCode = genderCode
    this.number = number
    this.uniqueId = uniqueId ?? genUniqueId()
    this.group = []
  }

  get gender() {
    switch (this.genderCode) {
      case 0:
        return '未知'
      case 1:
        return '男'
      case 2:
        return '女'
      case 9:
        return '未说明'
      default:
        return '未知'
    }
  }
}
