export class ScoreHistory {
  time: number
  score: number
  description: string
  ownerId: number
  ownerType: 'person' | 'group'

  constructor(score: number, description: string, ownerId: number, ownerType: 'person' | 'group') {
    this.time = Date.now()
    this.score = score
    this.description = description
    this.ownerId = ownerId
    this.ownerType = ownerType
  }
}
