import genUniqueId from '../utils/genUniqueId'
import { Person } from './person'

export class Group {
  name: string
  description: string
  members: Person[]
  avatar: string
  uniqueId: string
  score: number = 0

  constructor(name: string, description: string, avatar: string) {
    this.name = name
    this.description = description
    this.avatar = avatar
    this.uniqueId = genUniqueId()
    this.members = []
  }
}
