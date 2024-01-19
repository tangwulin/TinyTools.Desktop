export class Seat {
  displayName: string
  locationIndex: number
  color: string | null | undefined
  ownerId: number | null | undefined

  constructor(
    displayName: string,
    locationIndex: number,
    color?: string | null,
    ownerId?: number | null
  ) {
    this.displayName = displayName
    this.locationIndex = locationIndex
    this.color = color
    this.ownerId = ownerId
  }
}
