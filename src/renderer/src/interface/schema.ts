/*
 *注意：每个 schema 版本的定义都应该把此时的类型照抄下来，而不是直接引用。
 */
export interface schemaVersion1 {
  id?: number
  version: {
    schema: 1
    db: 1
    app: string
  }
  timestamp: number
  persons: {
    id?: number
    name: string
    genderCode: 0 | 1 | 2 | 9 //根据GB/T 2261.1-2003，分别指代未知的性别、男性、女性、未说明的性别
    number: string
    avatar: string
    score: number
  }[]
  groups: {
    id?: number
    name: string
    description: string
    memberIds: number[]
    avatar: string
    score: number
  }[]
  seatTable: {
    type: 'seat' | 'aisle' | 'empty'
    data?: {
      displayName: string
      locationIndex: number
      color: string | null | undefined
      personId: number | null | undefined
    }
    locationIndex?: number
  }[]
  seatHistories: {
    timestamp: number
    seatTable: {
      type: 'seat' | 'aisle' | 'empty'
      data?: {
        displayName: string
        locationIndex: number
        color: string | null | undefined
        personId: number | null | undefined
      }
      locationIndex?: number
    }[]
    type: string
  }[]
  rates: {
    id?: number
    name: string
    score: number
    description?: string
  }[]
  rateHistories: {
    timestamp: number
    score: number
    description: string
    ownerId: number
    ownerType: 'person' | 'group'
  }[]
  config: Config
}

interface Config {
  coloringEdgeSeats: boolean
  bgms: Audio[]
  finalBgms: Audio[]
  isBGMInitialized: boolean
  enableBgm: boolean
  enableFinalBgm: boolean
  enableFadein: boolean
  fadeinTime: number
  enableDocking: boolean
  enableDevelopFeature: boolean
  enableOldToolBar: boolean
  lotteryMode: number
  isFirstSetup: boolean
  enableAvatar: boolean
  enableFallbackAvatar: boolean
  avatarWorks: number[]
}

export interface schemaVersion2 {
  id?: number
  version: {
    schema: 2
    db: 2
    app: string
  }
  timestamp: number
  persons: {
    id?: number
    name: string
    genderCode: 0 | 1 | 2 | 9 //根据GB/T 2261.1-2003，分别指代未知的性别、男性、女性、未说明的性别
    number: string
    avatar: string
    score: number
  }[]
  groups: {
    id?: number
    name: string
    description: string
    memberIds: number[]
    avatar: string
    score: number
  }[]
  seatTable: {
    type: 'seat' | 'aisle' | 'empty'
    data?: {
      displayName: string
      locationIndex: number
      color: string | null | undefined
      personId: number | null | undefined
    }
    locationIndex?: number
  }[]
  seatHistories: {
    timestamp: number
    seatTable: {
      type: 'seat' | 'aisle' | 'empty'
      data?: {
        displayName: string
        locationIndex: number
        color: string | null | undefined
        personId: number | null | undefined
      }
      locationIndex?: number
    }[]
    type: string
  }[]
  rates: {
    id?: number
    name: string
    score: number
    description?: string
  }[]
  rateHistories: {
    timestamp: number
    score: number
    description: string
    ownerId: number
    ownerType: 'person' | 'group'
  }[]
  config: {
    bgms: {
      name: string
      url: string
      offset: number
      uniqueId: string
    }[]
    finalBgms: {
      name: string
      url: string
      offset: number
      uniqueId: string
    }[]
    isBGMInitialized: boolean
    enableBgm: boolean
    enableFinalBgm: boolean
    enableFadein: boolean
    fadeinTime: number
    enableDocking: boolean
    enableDevelopFeature: boolean
    enableOldToolBar: boolean
    lotteryMode: number
    isFirstSetup: boolean
    enableAvatar: boolean
    enableFallbackAvatar: boolean
    avatarWorks: number[]
  }
  courses: {
    order: number
    time: { start: { hour: number; minute: number }; end: { hour: number; minute: number } }
    mon: string
    tue: string
    wed: string
    thu: string
    fri: string
    spe1: string
    spe2: string
    spe3: string
    spe4: string
    spe5: string
  }[]
}
