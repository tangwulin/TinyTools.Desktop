export interface SpinPrize {
  range?: number
  background?: string
  fonts?: {
    text: string
    top?: string | number
    fontColor?: string
    fontSize?: string | number
    fontStyle?: string
    fontWeight?: string | number
    lineHeight?: string | number
    wordWrap?: boolean
    lengthLimit?: string | number
    lineClamp?: number
  }[]
  imgs?: {
    src: string
    top?: string | number
    width?: string | number
    height?: string | number
  }[]
}
