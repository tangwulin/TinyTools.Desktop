export interface IPerson {
  id?: number
  name: string
  genderCode: 0 | 1 | 2 | 9 //根据GB/T 2261.1-2003，分别指代未知的性别、男性、女性、未说明的性别
  number: string
  avatar: string
  score: number
}
