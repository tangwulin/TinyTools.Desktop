export class Rate {
  name: string
  score: number
  description?: string

  constructor(name: string, score: number, description?: string) {
    this.name = name
    this.score = score
    this.description = description
  }
}
