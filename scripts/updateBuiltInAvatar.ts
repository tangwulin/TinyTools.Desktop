// Description: 更新内置头像
import axios from 'axios'
import * as fs from 'fs'
import puppeteer, { type Page } from 'puppeteer'

const avatars = {}

const stopwatch = performance.now()
updateBuiltInAvatar().then(() => {
  console.log(avatars)
  console.log(`耗时：${(performance.now() - stopwatch) / 1000}秒`)
  fs.writeFileSync('./src/renderer/src/config/avatars.json', JSON.stringify(avatars))
})

async function updateBuiltInAvatar() {
  const browser = await puppeteer.launch({ headless: 'new' })
  await Promise.all([
    updateGenshin(await browser.newPage(), {
      webUrl: 'https://wiki.biligame.com/ys/%E8%A7%92%E8%89%B2',
      genderWebUrl: 'https://wiki.biligame.com/ys/%E8%A7%92%E8%89%B2%E7%AD%9B%E9%80%89',
      blackList: []
    }),
    updateArknights(await browser.newPage(), {
      webUrl: 'https://prts.wiki/w/%E5%B9%B2%E5%91%98%E4%B8%80%E8%A7%88',
      blackList: []
    }),
    updateBlueArchive({ blackList: [] }),
    updateStarRail(),
    updateUmamusume(await browser.newPage(), {
      webUrl: 'https://wiki.biligame.com/umamusume/%E8%B5%9B%E9%A9%AC%E5%A8%98%E4%B8%80%E8%A7%88',
      blackList: []
    })
  ]).then(() => {
    browser.close()
  })
}

const updateGenshin = async (
  page: Page,
  config: { webUrl: string; genderWebUrl: string; blackList: string[] }
) => {
  await page.setViewport({ width: 1080, height: 1024 })
  console.log(config.webUrl)
  await page.goto(config.webUrl)
  await page.waitForSelector('#CardSelectTr > div:nth-child(83)')

  const tarveler = [
    {
      description: '空',
      url: 'https://i0.hdslb.com/bfs/article/921ef6095df5ab142613cd27b2a7f52c861badb1.jpg@1256w_1256h_!web-article-pic.avif'
    },
    {
      description: '荧',
      url: 'https://i0.hdslb.com/bfs/article/4c46a8c0a2c52f91568bfd03ba25451bcf2a230a.jpg@1256w_1256h_!web-article-pic.avif'
    }
  ]

  const result = (
    await page.$$eval('#CardSelectTr > div', (el) => {
      return el.map((item) => {
        return {
          description: item.querySelector('div.L').innerHTML,
          // url: `https:${item.querySelector('img').getAttribute('data-url').split('@')[0]}`
          url: item.querySelector('a.image > img').getAttribute('src') //小图片，节省带宽
        }
      })
    })
  )
    .filter((item) => !config.blackList.includes(item.description))
    .concat(...tarveler)

  await page.goto(config.genderWebUrl)
  await page.waitForSelector('#CardSelectTr > tbody > tr:nth-child(82)')

  const genderResult = (
    await page.$$eval('#CardSelectTr > tbody > tr', (el) => {
      return el.map((item) => {
        return {
          description: item.querySelector('td:nth-child(1) > a').getAttribute('title'),
          gender: item.querySelector('td:nth-child(6)').innerHTML.trim()
        }
      })
    })
  ).concat(
    ...[
      { description: '空', gender: '男' },
      { description: '荧', gender: '女' }
    ]
  )

  console.log(result)
  console.log(genderResult)

  const male = []
  const female = []
  result.forEach((item) => {
    switch (genderResult.find((x) => x.description === item.description)?.gender) {
      case '男':
        male.push(item)
        break
      case '女':
        female.push(item)
        break
      default:
        break
    }
  })
  console.log(male, female)
  if (male.length === 0 || female.length === 0) {
    throw new Error('原神头像获取失败')
  }
  avatars['genshin'] = { male, female }
  await page.close()
}

const updateArknights = async (page: Page, config: { webUrl: string; blackList: string[] }) => {
  await page.setViewport({ width: 1080, height: 1024 })
  console.log(config.webUrl)
  await page.goto(config.webUrl)
  await page.waitForSelector('#filter-result > div:nth-child(50)')
  await page.select('#pagination > div.paginations-container > select', '200')
  await page.waitForSelector('#filter-result > div:nth-child(200)')
  const male = []
  const female = []
  for (let i = 0; i < 2; i++) {
    const result = (
      await page.$$eval('#filter-result > div', (el) => {
        return el.map((item) => {
          return {
            name: item.querySelector('div.name > div > a > div').innerHTML,
            url: item.querySelector('div.avatar > div > a > img').getAttribute('data-src'),
            gender: item.querySelector('div.other > div.sex').innerHTML
          }
        })
      })
    ).filter((item) => !config.blackList.includes(item.name))

    result.forEach((item) => {
      switch (item.gender) {
        case '男':
          male.push({ description: item.name, url: item.url })
          break
        case '女':
          female.push({ description: item.name, url: item.url })
          break
        default:
          break
      }
    })
    if (i === 0) {
      await page.click(
        '#pagination > div.paginations-container > div.checkbox-container > div:nth-child(2)'
      )
    }
  }
  console.log(male, female)
  if (male.length === 0 || female.length === 0) {
    throw new Error('明日方舟头像获取失败')
  }
  avatars['arknights'] = { male, female }
  await page.close()
}

const updateBlueArchive = async (config: { blackList: string[] }) => {
  await axios
    .get('https://api.kivo.wiki/api/v1/data/students/?page=1&page_size=500&is_npc=false')
    .then((res) => {
      const female = res.data.data.students
        .map((item) => {
          const description = `${item.family_name}${item.given_name}${
            item.skin.length > 0 ? `(${item.skin})` : ''
          }`
          return { description, url: `https:${item.avatar}` }
        })
        .filter((item) => !config.blackList.includes(item.description))
      if (female.length === 0) {
        throw new Error('蔚蓝档案头像获取失败')
      }
      avatars['blueArchive'] = { male: [], female }
    })
}

const updateStarRail = async () => {
  //这个没有找到现成的给机器区分性别的方法，先手动吧（
  avatars['starRail'] = {
    male: [
      {
        description: '银枝',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/0/0d/CharacterIcon_1302.webp'
      },
      {
        description: '丹恒•饮月',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/4/43/CharacterIcon_1213.webp'
      },
      {
        description: '卢卡',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/c/c3/CharacterIcon_1111.webp'
      },
      {
        description: '景元',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/7/7a/CharacterIcon_1204.webp'
      },
      {
        description: '刃',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/0/0d/CharacterIcon_1205.webp'
      },
      {
        description: '罗刹',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/2/2c/CharacterIcon_1203.webp'
      },
      {
        description: '瓦尔特',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/f/f9/CharacterIcon_1004.webp'
      },
      {
        description: '杰帕德',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/c/ce/CharacterIcon_1104.webp'
      },
      {
        description: '丹恒',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/0/0f/CharacterIcon_1002.webp'
      },
      {
        description: '阿兰',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/5/59/CharacterIcon_1008.webp'
      },
      {
        description: '桑博',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/1/10/CharacterIcon_1108.webp'
      }
    ],
    female: [
      {
        description: '寒鸦',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/f/f6/CharacterIcon_1215.webp'
      },
      {
        description: '藿藿',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/d/dc/CharacterIcon_1217.webp'
      },
      {
        description: '托帕&账账',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/4/4c/CharacterIcon_1112.webp'
      },
      {
        description: '桂乃芬',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/0/0b/CharacterIcon_1210.webp'
      },
      {
        description: '镜流',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/9/97/CharacterIcon_1212.webp'
      },
      {
        description: '符玄',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/d/d7/CharacterIcon_1208.webp'
      },
      {
        description: '玲可',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/4/49/CharacterIcon_1110.webp'
      },
      {
        description: '卡芙卡',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/a/a1/CharacterIcon_1005.webp'
      },
      {
        description: '驭空',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/4/41/CharacterIcon_1207.webp'
      },
      {
        description: '银狼',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/9/95/CharacterIcon_1006.webp'
      },
      {
        description: '希儿',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/3/32/CharacterIcon_1102.webp'
      },
      {
        description: '姬子',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/d/d0/CharacterIcon_1003.webp'
      },
      {
        description: '布洛妮娅',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/a/a7/CharacterIcon_1101.webp'
      },
      {
        description: '克拉拉',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/e/e2/CharacterIcon_1107.webp'
      },
      {
        description: '彦卿',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/4/41/CharacterIcon_1209.webp'
      },
      {
        description: '白露',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/0/01/CharacterIcon_1211.webp'
      },
      {
        description: '开拓者',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/c/c2/CharacterIcon_8002.webp'
      },
      {
        description: '开拓者',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/a/ab/CharacterIcon_8004.webp'
      },
      {
        description: '三月七',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/8/84/CharacterIcon_1001.webp'
      },
      {
        description: '艾丝妲',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/2/2f/CharacterIcon_1009.webp'
      },
      {
        description: '黑塔',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/0/00/CharacterIcon_1013.webp'
      },
      {
        description: '希露瓦',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/f/f6/CharacterIcon_1103.webp'
      },
      {
        description: '娜塔莎',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/9/92/CharacterIcon_1105.webp'
      },
      {
        description: '佩拉',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/d/d2/CharacterIcon_1106.webp'
      },
      {
        description: '虎克',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/1/11/CharacterIcon_1109.webp'
      },
      {
        description: '青雀',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/f/f8/CharacterIcon_1201.webp'
      },
      {
        description: '停云',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/2/20/CharacterIcon_1202.webp'
      },
      {
        description: '素裳',
        url: 'https://huiji-public.huijistatic.com/starrail/uploads/7/71/CharacterIcon_1206.webp'
      }
    ]
  }
}

const updateUmamusume = async (page: Page, config: { webUrl: string; blackList: string[] }) => {
  await page.setViewport({ width: 1080, height: 1024 })
  console.log(config.webUrl)
  await page.goto(config.webUrl)
  await page.waitForSelector(
    '#mw-content-text > div > div.main-line-wrap > div > div > div:nth-child(1) > span:nth-child(132)'
  )
  const female = await page.$$eval(
    '#mw-content-text > div > div.main-line-wrap > div > div > div:nth-child(1) > span',
    (el) => {
      return el.map((item) => {
        return {
          description: item.querySelector('span > div > center > a').innerHTML,
          url: item.querySelector('span > div > a > img').getAttribute('src')
        }
      })
    }
  )
  avatars['umamusume'] = { male: [], female }
  await page.close()
}
