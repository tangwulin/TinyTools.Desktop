import { IPerson } from './IPerson'

export interface IGroup {
  id?: number
  name: string
  description: string
  members: IPerson[]
  avatar: string
  // uniqueId: string
  score: number
}
