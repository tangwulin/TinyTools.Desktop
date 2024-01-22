export class Group {
  id?: number
  name: string
  description: string
  membersID: number[] = []
  avatar: string
  score: number = 0

  constructor(
    name: string,
    description: string,
    avatar: string,
    membersID?: number[],
    id?: number
  ) {
    this.name = name
    this.description = description
    this.avatar = avatar
    this.membersID = membersID ?? []
    if (id) this.id = id
  }
}
