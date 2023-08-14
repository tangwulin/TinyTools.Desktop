export const getDefaultBgm = () => {
  return [
    {
      name: 'Never Gonna Give You Up',
      url: 'https://music.163.com/song/media/outer/url?id=5221167.mp3',
      offset: 0,
      uniqueId: generateUniqueId()
    },
    {
      name: '好运来',
      url: 'https://music.163.com/song/media/outer/url?id=333750.mp3',
      offset: 1,
      uniqueId: generateUniqueId()
    },
    {
      name: '烟distance',
      url: 'https://music.163.com/song/media/outer/url?id=2039800852.mp3',
      offset: 0,
      uniqueId: generateUniqueId()
    },
    {
      name: 'Tunak Tunak Tun',
      url: 'https://music.163.com/song/media/outer/url?id=1303214808.mp3',
      offset: 3,
      uniqueId: generateUniqueId()
    },
    {
      name: '阳光彩虹小白鸡',
      url: 'https://music.163.com/song/media/outer/url?id=1948834228.mp3',
      offset: 0,
      uniqueId: generateUniqueId()
    },
    {
      name: '水手',
      url: 'https://music.163.com/song/media/outer/url?id=5238221.mp3',
      offset: 72.2,
      uniqueId: generateUniqueId()
    },
    {
      name: 'Usagi Flap',
      url: 'https://music.163.com/song/media/outer/url?id=2016944846.mp3',
      offset: 0,
      uniqueId: generateUniqueId()
    },
  ]
}

export const getDefaultFinalBgm = () => {
  return [
    {
      name: 'Liyue 璃月',
      url: 'https://music.163.com/song/media/outer/url?id=1492276411.mp3',
      offset: 154.5,
      uniqueId: generateUniqueId()
    },
    {
      name: 'The Magnificent Seven',
      url: 'https://music.163.com/song/media/outer/url?id=430620198.mp3',
      offset: 0,
      uniqueId: generateUniqueId()
    },
    // {
    //   name: '刚好遇见你',
    //   url: 'https://music.163.com/song/media/outer/url?id=459159104.mp3',
    //   offset: 36,
    //   uniqueId: generateUniqueId()
    // },
    {
      name: '刚好遇见你',
      url: 'https://music.163.com/song/media/outer/url?id=486188225.mp3', //这不应该是最后的音源，只是现在没解决音乐解析的问题
      offset: 36,
      uniqueId: generateUniqueId()
    },
  ]
}

export function generateUniqueId()
{
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}