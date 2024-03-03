export class Prize {
  name: string
  amount: number
  backgroundColor?: string
  percentage?: number

  constructor(name: string, amount: number, backgroundColor?: string, percentage?: number) {
    this.name = name
    this.amount = amount
    this.backgroundColor = backgroundColor
    this.percentage = percentage
  }
}
