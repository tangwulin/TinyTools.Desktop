export class ScoreHistory {
  time: number
  score: number
  description: string
  ownerId: string
  ownerType: 'person' | 'group'
  constructor(score: number, description: string, ownerId: string, ownerType: 'person' | 'group') {
    this.time = Date.now()
    this.score = score
    this.description = description
    this.ownerId = ownerId
    this.ownerType = ownerType
  }
}
