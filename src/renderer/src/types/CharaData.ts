export type CharaData = {
  name: string
  charaKey: string
  images: string[]
  voiceBase: { [key: string]: string }
  voiceList: {
    title: string
    filename: string
    text: { language: string; content: string }[]
  }[]
}
