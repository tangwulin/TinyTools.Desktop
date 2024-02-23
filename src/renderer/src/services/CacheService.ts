import { CacheProvider } from '../interface/CacheProvider'

export const createCache = (provider: CacheProvider) => {
  return (url: string) => {
    return provider.get(url).then((data) => {
      if (data) {
        return data
      } else {
        //将url发给provider，让provider去获取数据存入缓存
        provider.add(url)
        return url
      }
    })
  }
}
