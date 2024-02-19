export class Group {
  id?: number
  name: string
  description: string
  memberIds: number[] = []
  avatar: string
  score: number = 0

  constructor(
    name: string,
    description: string,
    avatar: string,
    memberIds?: number[],
    id?: number
  ) {
    this.name = name
    this.description = description
    this.avatar = avatar
    this.memberIds = memberIds ?? []
    if (id) this.id = id
  }
}
