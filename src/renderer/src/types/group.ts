import { Person } from './person'
import { IGroup } from '../interface/IGroup'

export class Group implements IGroup {
  id?: number
  name: string
  description: string
  members: Person[]
  avatar: string
  // uniqueId: string
  score: number = 0

  constructor(name: string, description: string, avatar: string, members?: Person[], id?: number) {
    this.name = name
    this.description = description
    this.avatar = avatar
    this.members = members ?? []
    if (id) this.id = id
  }
}
