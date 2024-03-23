import { storeToRefs } from 'pinia'
import avatarConfig from '../data/avatars.json'
import { useSettingStore } from '../stores/setting'
import { Group } from '../types/group'
import { Person } from '../types/person'
import { caching } from './CacheService'

const genshin = avatarConfig['genshin']
const arknights = avatarConfig['arknights']
const starRail = avatarConfig['starRail']
const blueArchive = avatarConfig['blueArchive']
// noinspection SpellCheckingInspection
const umamusume = avatarConfig['umamusume']

function generateHash(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
  }
  return Math.abs(hash)
}

/**
 * 获取头像地址
 * @param sex number 性别,1:男,2:女
 * @param works number[] 作品
 */
export const getAvatarUrls = (sex: number, works: number[]) => {
  let result: {
    url: string
    description: string
  }[] = []
  works = works || [1, 2, 3]
  works = works.sort((a, b) => a - b)
  switch (sex) {
    case 1:
      works.forEach((work) => {
        switch (work) {
          case 1:
            result = result.concat(genshin.male)
            break
          case 2:
            result = result.concat(arknights.male)
            break
          case 3:
            result = result.concat(starRail.male)
            break
          default:
            break
        }
      })
      break
    case 2:
      works.forEach((work) => {
        switch (work) {
          case 1:
            result = result.concat(genshin.female)
            break
          case 2:
            result = result.concat(arknights.female)
            break
          case 3:
            result = result.concat(starRail.female)
            break
          case 4:
            result = result.concat(blueArchive.female)
            break
          case 5:
            result = result.concat(umamusume.female)
            break
          default:
            break
        }
      })
      break
    default:
      break
  }
  return result.map((item) => ({ url: caching(item.url), description: item.description }))
}

function selectAvatar(studentId: string, avatarCount: number) {
  const hashValue = generateHash(studentId)
  return hashValue % avatarCount
}

const setting = useSettingStore()
const { enableFallbackAvatar, avatarWorks } = storeToRefs(setting)

const male = getAvatarUrls(1, avatarWorks.value)
const female = getAvatarUrls(2, avatarWorks.value)

export const getAvatar = (
  item: Person | Group | { number: string } | { name: string; id?: number }
) => {
  if (!item) return null
  if ('avatar' in item && item.avatar) return item.avatar
  if (!enableFallbackAvatar.value) return null
  if ('disabledAvatar' in item && item.disabledAvatar) return null
  const sn =
    'number' in item && item?.number ? item.number : 'name' in item ? item.name + item.id : ''
  let urls: { url: string; description: string }[]
  switch (
    'genderCode' in item ? item.genderCode : 9 // 1:男,2:女,9:未知
  ) {
    case 1:
      urls = male
      break
    case 2:
      urls = female
      break
    default:
      urls = male.concat(female)
      break
  }
  return urls[selectAvatar(sn, urls.length)]?.url ?? null
}
