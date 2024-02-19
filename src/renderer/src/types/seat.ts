export class Seat {
  displayName: string
  locationIndex: number
  color: string | null | undefined
  personId: number | null | undefined

  constructor(
    displayName: string,
    locationIndex: number,
    color?: string | null,
    personId?: number | null
  ) {
    this.displayName = displayName
    this.locationIndex = locationIndex
    this.color = color
    this.personId = personId
  }
}
