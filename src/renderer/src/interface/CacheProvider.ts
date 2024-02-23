export interface CacheProvider {
  get: (key: string) => Promise<string | undefined | void>
  set: (key: string, value: any) => Promise<void>
  del: (key: string) => Promise<void>
  add: (url: string) => Promise<void>
}
