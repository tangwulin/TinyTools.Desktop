/*
 *注意：每个 schema 版本的定义都应该把此时的类型照抄下来，而不是直接引用。
 */
export interface schemaVersion1 {
  version: {
    schema: 1
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
  }[],
  config:Config
}
interface Config {
  coloringEdgeSeats: boolean;
  bgms: Audio[];
  finalBgms: Audio[];
  isBGMInitialized: boolean;
  enableBgm: boolean;
  enableFinalBgm: boolean;
  enableFadein: boolean;
  fadeinTime: number;
  enableDocking: boolean;
  enableDevelopFeature: boolean;
  enableOldToolBar: boolean;
  lotteryMode: number;
  isFirstSetup: boolean;
  enableAvatar: boolean;
  enableFallbackAvatar: boolean;
  avatarWorks: number[];
}

// 原始类型
interface Audio {
  name: string
  url: string
  offset: number
  uniqueId: string
}
