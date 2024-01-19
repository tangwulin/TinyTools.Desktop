export class Person {
  id?: number
  name: string
  genderCode: 0 | 1 | 2 | 9 //根据GB/T 2261.1-2003，分别指代未知的性别、男性、女性、未说明的性别
  number: string
  avatar: string = ''
  score: number = 0

  constructor(
    name: string,
    genderCode: 0 | 1 | 2 | 9,
    number: string,
    id?: number,
    avatar?: string
  ) {
    this.name = name
    this.genderCode = genderCode
    this.number = number
    if (id) this.id = id
    if (avatar) this.avatar = avatar
  }
}
