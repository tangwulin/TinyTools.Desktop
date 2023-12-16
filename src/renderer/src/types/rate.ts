export class Rate {
  id?: number
  name: string
  score: number
  description?: string

  constructor(name: string, score: number, description?: string, id?: number) {
    this.name = name
    this.score = score
    this.description = description
    this.id = id
  }
}
