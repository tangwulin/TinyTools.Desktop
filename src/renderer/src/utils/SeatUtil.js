export const parseIndexToGroups = (index) => {
  switch ((index + 1) % 11)
  {
    case 1:
    case 2:
      return 1
    case 4:
    case 5:
      return 2
    case 7:
    case 8:
      return 3
    case 10:
    case 0:
      return 4
    default:
      return 5
  }
}

/**
 *两边到中间
 * @param {[{color: null, isSeat: boolean, name: string, index: number},
 * {color: null, isSeat: boolean, name: string, index: number},
 * {color: null, isSeat: boolean, name: null},
 * {color: null, isSeat: boolean, name: string, index: number},
 * {color: null, isSeat: boolean, name: string, index: number}]} origin
 */
export const outerToMiddle = (origin) => {
  let group1 = []
  let group2 = []
  let group3 = []
  let group4 = []
  let group5 = []

  origin.forEach((item, index) => {
    switch (parseIndexToGroups(index))
    {
      case 1:
        group1.push(item)
        break
      case 2:
        group2.push(item)
        break
      case 3:
        group3.push(item)
        break
      case 4:
        group4.push(item)
        break
      default:
        group5.push(item)
    }
  })
  return [
    group1.filter(item => item.isSeat),
    group2.filter(item => item.isSeat),
    group3.filter(item => item.isSeat),
    group4.filter(item => item.isSeat),
    group5,
  ]
}