import { storeToRefs } from 'pinia'
import { useSettingStore } from '../stores/setting'
import { Group } from '../types/group'
import { Person } from '../types/person'

function generateHash(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
  }
  return Math.abs(hash)
}

const maleGenshin = [
  {
    src: 'https://i0.hdslb.com/bfs/article/558dae2786d93a7ea8b7f9e67dface124a0ca275.jpg',
    description: '林尼'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/9794c93a39790b115142a0d920c1278f96dcca50.jpg',
    description: '菲米尼'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/d535d2199e35bfad24ffb081e2d0f3fb0e3ddad3.jpg',
    description: '卡维'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/591d974894794dcebfc0f83cd32ddb01ef4fdeda.jpg',
    description: '白术'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/2d03041163fee31a8ac4e379f66847185458b898.jpg',
    description: '米卡'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/a5c49a722289b9cb3e764dd89edd9688385e9653.jpg',
    description: '散兵（流浪者）'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/8a62808ede44ce1b59e20252504a0bf4890ba231.jpg',
    description: '艾尔海森'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/921ef6095df5ab142613cd27b2a7f52c861badb1.jpg',
    description: '空'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/b2712b0aea3ea559e03413ef262fb5de573e1791.jpg',
    description: '温迪（巴巴托斯）'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/3956ff65670244439aea2e0cb55eab4e846f5f40.jpg',
    description: '凯亚'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/8d7f5329aa0e8560d22abe2f70f01dcfe36f6dd0.jpg',
    description: '迪卢克'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/0c0695359926e3753733bab0ff729a6431677881.jpg',
    description: '班尼特'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/2dff569092c6aacae75df54f75bb0edae2af02eb.jpg',
    description: '雷泽'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/e5046f6c48dcca18851f3ea77b8bc808091e980f.jpg',
    description: '阿贝多'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/cecc1994c3e417aec0cde65b4d130dda8f72b929.jpg',
    description: '钟离（摩拉克斯）'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/a49dde421aad659d7c27a08dd58ac8cf82f9025a.jpg',
    description: '魈'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/fd02f49efd639acb1e14236b95e59cfca2bebfc3.jpg',
    description: '行秋'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/429f65019fa89cdfb0fa10df436a53457d9d107b.jpg',
    description: '重云'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/e7d54f8c534ea32bb6eb8902d185b681d3172e31.jpg',
    description: '达达利亚（公子）'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/118c6927c242ad014ca4f5ff9eaf1c428ac86dde.jpg',
    description: '枫原万叶'
  },

  {
    src: 'https://i0.hdslb.com/bfs/article/0ba3b841fd183dc8cf51af9ac9c824ab306a976a.jpg',
    description: '神里绫人'
  },

  {
    src: 'https://i0.hdslb.com/bfs/article/da22cac37f2b81243bc7b1d0ab6cc31a48164a52.jpg',
    description: '五郎'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/ca76c1447de1878336b7892e668fe7ef90dd00ef.jpg',
    description: '托马'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/a7ecf5a781c6a6b34926032c30358ef2d1f93540.jpg',
    description: '荒泷一斗'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/a8eb8cf588ea20768f8e46683c54219adbeefc25.jpg',
    description: '鹿野院平藏'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/d44f42d2936d5fb66bdb8403623370316021eee6.jpg',
    description: '提纳里'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/68b10f0589e84559dfcfecb23593ea91e286642d.jpg',
    description: '柯莱'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/a5af6a9862da18dad99becca198b02687795114c.jpg',
    description: '赛诺'
  }
]

const femaleGenshin = [
  {
    src: 'https://i0.hdslb.com/bfs/article/e9ccd96c60a68a8879fe53f0460de3d00b1f81d1.jpg',
    description: '坎蒂丝'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/326c1611f909d7ec2b577e796ba5f118edcf9fce.jpg',
    description: '多莉'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/481f34bad82deeea8e5a4a79113c718338bd5880.jpg',
    description: '妮露'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/dd49fda3d85162645f0857ab453c068e92779258.jpg',
    description: '莱依拉'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/73c8aed025ed6bcf2a7b1e6ab9aed4496b84a812.jpg',
    description: '珐露珊'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/dbd558aae671fa8b9c6e27534d3f25d7e56dc561.jpg',
    description: '派蒙（更新版）'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/2791a94d8c9df663368d6061ef7740550abd283c.jpg',
    description: '八重神子'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/8b581a9d4891c7cae1d152c95c59cfcf9a2e391b.jpg',
    description: '九条裟罗'
  },

  {
    src: 'https://i0.hdslb.com/bfs/article/8c4130d981654016f1ba6998d2f591064c0dfaeb.jpg',
    description: '久岐忍'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/4da72834401f6ccd23b85188098494a3cd2cd260.jpg',
    description: '早柚'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/62f9e7eb8f36f83efb7c39c93038a5f1bc04b4a8.jpg',
    description: '珊瑚宫心海'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/b57f7a2ffe90a9eb8387a068507e6c3e5f4f6f40.jpg',
    description: '神里绫华'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/b0cc273cb6c6cfbbbd19de2605b108a28891c671.jpg',
    description: '宵宫'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/0ea45d9d027a182609777403d606720f233bff9e.jpg',
    description: '刻晴皮肤'
  },

  {
    src: 'https://i0.hdslb.com/bfs/article/3d2473d3ee07e5ec205554fb6252cc08969d4e48.jpg',
    description: '雷电将军（影-巴尔泽布）'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/89123c29cb31e1f8b12f25d50b4a31fc300c0a80.jpg',
    description: '香菱'
  },

  {
    src: 'https://i0.hdslb.com/bfs/article/46dff6f06f5d17dcfb471545e0ddf27b447a6c86.jpg',
    description: '凝光'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/585cd74b5a714f5e8150bb2f2a3c23b6220e91fd.jpg',
    description: '烟绯'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/46239d0e1f11edf65fae907420ca2ebd894faa4c.jpg',
    description: '北斗'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/9c991b59a1f8b016f0e709e39eaf3bb3c37a65a6.jpg',
    description: '申鹤'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/5908fb24dce612e2146e3a6f398cb74082b0f867.jpg',
    description: '云堇'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/2ab989ae710cf8373084c5606290e12f9c05048b.jpg',
    description: '辛焱'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/eef20e36908452d61cae4055a7c3c29db86035bb.jpg',
    description: '夜兰'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/2e929564356e26272837e631b12e68137b27d843.jpg',
    description: '埃洛伊'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/a78172af22a23dd3c81f397e56200043de4939ce.jpg',
    description: '可莉'
  },

  {
    src: 'https://i0.hdslb.com/bfs/article/fe6fb41beefdbbb19d535f8c8761d5266201daef.jpg',
    description: '甘雨'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/7fb01eb1b24dd46c47271200de28cefad854471c.jpg',
    description: '胡桃'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/a4fcee83232b553a24905f563fdfd0d169839b48.jpg',
    description: '七七'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/eb78ee7236f30694051d0d75f68edbbf0d1d3129.jpg',
    description: '刻晴'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/2f006ca5c0e6b172b4d13c54f1422f5d3247b5e8.jpg',
    description: '迪奥娜'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/1d68a0d70f5640458a63b0aa7b04c8fc568b38dc.jpg',
    description: '诺艾尔'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/d25b716845088d67b74626bdcb0eb8147e873207.jpg',
    description: '菲谢尔'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/36ceb1504c941b6a8b62935dda72bf40486a75f6.jpg',
    description: '砂糖'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/524f7f82b17e125a003c0cda24cf295a72aa19e9.jpg',
    description: '罗莎莉亚'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/4d1ee4ba32269fa1ab6886484773bc75fa2b4bd4.jpg',
    description: '优菈'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/9eb614203141a466bc5b526d7c62a9634b44ab5e.jpg',
    description: '丽莎'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/59ee10f29cda92ebef9b67530826a08daf6c890f.jpg',
    description: '琴'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/954f7fc984fb47ed1b4a27f9f54794aa77608d5c.jpg',
    description: '莫娜'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/b3589e622a332b2133407c7336c2f0a53431cf91.jpg',
    description: '芭芭拉'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/4c46a8c0a2c52f91568bfd03ba25451bcf2a230a.jpg',
    description: '荧'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/b638650721a9fb36c225302ad22d4d2b15b14199.jpg',
    description: '安柏'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/17612de9558e1d8de7ec20d983e2ad6e09ff19d5.jpg',
    description: '纳西妲'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/85babd1efb1023c4b7d069e1da767b96c2c830d3.jpg',
    description: '琳妮特'
  },

  {
    src: 'https://i0.hdslb.com/bfs/article/364884f1fbf86bc40bdb5b932662c55e489b4fa6.jpg',
    description: '绮良良'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/9370e534b87071af0f4a94d6adcba71b1f708362.jpg',
    description: '迪希雅'
  },
  {
    src: 'https://i0.hdslb.com/bfs/article/83dc734c1b6a07c6e7a8015df444249c0c8bc74d.jpg',
    description: '瑶瑶'
  }
]

const maleArknights = [
  {
    src: 'https://prts.wiki/images/9/95/头像_苍苔.png',
    description: '苍苔',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/7/7e/头像_圣约送葬人.png',
    description: '圣约送葬人',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/8/85/头像_隐现.png',
    description: '隐现',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/c/cf/头像_Friston-3.png',
    description: 'Friston-3',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/e/e0/头像_休谟斯.png',
    description: '休谟斯',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/8/81/头像_火龙S黑角.png',
    description: '火龙S黑角',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/0/09/头像_重岳.png',
    description: '重岳',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/7/79/头像_谜图.png',
    description: '谜图',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/8/82/头像_雪绒.png',
    description: '雪绒',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/2/2e/头像_白铁.png',
    description: '白铁',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/8/87/头像_铅踝.png',
    description: '铅踝',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/5/50/头像_罗小黑.png',
    description: '罗小黑',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/0/08/头像_玛恩纳.png',
    description: '玛恩纳',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/9/98/头像_至简.png',
    description: '至简',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/e/e2/头像_承曦格雷伊.png',
    description: '承曦格雷伊',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/1/1e/头像_黑键.png',
    description: '黑键',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/1/1c/头像_车尔尼.png',
    description: '车尔尼',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/7/72/头像_流明.png',
    description: '流明',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/5/5c/头像_掠风.png',
    description: '掠风',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/5/58/头像_褐果.png',
    description: '褐果',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/d/d2/头像_见行者.png',
    description: '见行者',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/e/e5/头像_老鲤.png',
    description: '老鲤',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/f/fb/头像_暮落.png',
    description: '暮落',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/9/9f/头像_灵知.png',
    description: '灵知',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/7/70/头像_蚀清.png',
    description: '蚀清',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/0/05/头像_水月.png',
    description: '水月',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/4/42/头像_龙舌兰.png',
    description: '龙舌兰',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/d/d2/头像_异客.png',
    description: '异客',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/c/c1/头像_闪击.png',
    description: '闪击',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/c/cb/头像_战车.png',
    description: '战车',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/0/04/头像_乌有.png',
    description: '乌有',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/e/ec/头像_山.png',
    description: '山',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/4/49/头像_奥斯塔.png',
    description: '奥斯塔',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/6/6a/头像_芳汀.png',
    description: '芳汀',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/2/2a/头像_棘刺.png',
    description: '棘刺',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/5/54/头像_孑.png',
    description: '孑',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/2/2a/头像_贾维.png',
    description: '贾维',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/e/ea/头像_断崖.png',
    description: '断崖',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/0/03/头像_莱恩哈特.png',
    description: '莱恩哈特',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/9/97/头像_极境.png',
    description: '极境',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/d/d8/头像_THRM-EX.png',
    description: 'THRM-EX',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/8/83/头像_傀影.png',
    description: '傀影',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/e/e7/头像_慑砂.png',
    description: '慑砂',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/3/31/头像_阿.png',
    description: '阿',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/4/41/头像_吽.png',
    description: '吽',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/0/04/头像_布洛卡.png',
    description: '布洛卡',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/b/b2/头像_拜松.png',
    description: '拜松',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/c/c1/头像_伊桑.png',
    description: '伊桑',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/d/da/头像_送葬人.png',
    description: '送葬人',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/d/d6/头像_炎客.png',
    description: '炎客',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/c/cd/头像_赫拉格.png',
    description: '赫拉格',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/f/fe/头像_格雷伊.png',
    description: '格雷伊',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/3/30/头像_斑点.png',
    description: '斑点',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/b/b7/头像_月见夜.png',
    description: '月见夜',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/2/27/头像_银灰.png',
    description: '银灰',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/e/e4/头像_角峰.png',
    description: '角峰',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/2/27/头像_讯使.png',
    description: '讯使',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/b/b3/头像_史都华德.png',
    description: '史都华德',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/9/94/头像_安赛尔.png',
    description: '安赛尔',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/f/f6/头像_安德切尔.png',
    description: '安德切尔',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/b/b7/头像_12F.png',
    description: '12F',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/9/93/头像_巡林者.png',
    description: '巡林者',
    sex: '男'
  },
  {
    src: 'https://prts.wiki/images/f/f1/头像_黑角.png',
    description: '黑角',
    sex: '男'
  },
  { src: 'https://prts.wiki/images/8/82/头像_Castle-3.png', description: 'Castle-3', sex: '男' }
]

const femaleArknights = [
  {
    src: 'https://prts.wiki/images/f/f0/头像_纯烬艾雅法拉.png',
    description: '纯烬艾雅法拉',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/7/74/头像_琳琅诗怀雅.png',
    description: '琳琅诗怀雅',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/0/0e/头像_青枳.png',
    description: '青枳',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/e/e3/头像_凛视.png',
    description: '凛视',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/7/70/头像_提丰.png',
    description: '提丰',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/c/cd/头像_寒檀.png',
    description: '寒檀',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/d/d1/头像_空构.png',
    description: '空构',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/3/3a/头像_缪尔赛思.png',
    description: '缪尔赛思',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/9/9e/头像_霍尔海雅.png',
    description: '霍尔海雅',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/0/0d/头像_淬羽赫默.png',
    description: '淬羽赫默',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/a/ab/头像_玫拉.png',
    description: '玫拉',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/8/8c/头像_伊内丝.png',
    description: '伊内丝',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/e/e8/头像_洋灰.png',
    description: '洋灰',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/f/fe/头像_摩根.png',
    description: '摩根',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/4/45/头像_U-Official.png',
    description: 'U-Official',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/2/2e/头像_麒麟X夜刀.png',
    description: '麒麟X夜刀',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/8/8a/头像_仇白.png',
    description: '仇白',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/4/4a/头像_铎铃.png',
    description: '铎铃',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/a/aa/头像_林.png',
    description: '林',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/f/fa/头像_火哨.png',
    description: '火哨',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/8/81/头像_截云.png',
    description: '截云',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/9/94/头像_焰影苇草.png',
    description: '焰影苇草',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/e/ed/头像_和弦.png',
    description: '和弦',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/b/b8/头像_缄默德克萨斯.png',
    description: '缄默德克萨斯',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/1/1c/头像_斥罪.png',
    description: '斥罪',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/b/bc/头像_石英.png',
    description: '石英',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/3/3f/头像_明椒.png',
    description: '明椒',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/d/dd/头像_达格达.png',
    description: '达格达',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/6/6c/头像_海沫.png',
    description: '海沫',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/b/b0/头像_但书.png',
    description: '但书',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/1/1b/头像_百炼嘉维尔.png',
    description: '百炼嘉维尔',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/1/1b/头像_鸿雪.png',
    description: '鸿雪',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/1/15/头像_晓歌.png',
    description: '晓歌',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/4/4f/头像_多萝西.png',
    description: '多萝西',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/4/48/头像_星源.png',
    description: '星源',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/8/8d/头像_濯尘芙蓉.png',
    description: '濯尘芙蓉',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/3/34/头像_埃拉托.png',
    description: '埃拉托',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/b/be/头像_归溟幽灵鲨.png',
    description: '归溟幽灵鲨',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/5/57/头像_艾丽妮.png',
    description: '艾丽妮',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/3/3f/头像_号角.png',
    description: '号角',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/d/d4/头像_洛洛.png',
    description: '洛洛',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/d/d9/头像_海蒂.png',
    description: '海蒂',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/b/b8/头像_菲亚梅塔.png',
    description: '菲亚梅塔',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/1/12/头像_风丸.png',
    description: '风丸',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/a/ab/头像_澄闪.png',
    description: '澄闪',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/0/08/头像_夏栎.png',
    description: '夏栎',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/2/2c/头像_令.png',
    description: '令',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/a/a1/头像_夜半.png',
    description: '夜半',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/3/39/头像_寒芒克洛丝.png',
    description: '寒芒克洛丝',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/a/ab/头像_九色鹿.png',
    description: '九色鹿',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/4/43/头像_极光.png',
    description: '极光',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/7/71/头像_耶拉.png',
    description: '耶拉',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/0/03/头像_耀骑士临光.png',
    description: '耀骑士临光',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/c/c8/头像_焰尾.png',
    description: '焰尾',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/9/9f/头像_野鬃.png',
    description: '野鬃',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/2/29/头像_蜜莓.png',
    description: '蜜莓',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/b/b0/头像_布丁.png',
    description: '布丁',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/c/c5/头像_正义骑士号.png',
    description: '正义骑士号',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/a/a1/头像_远牙.png',
    description: '远牙',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/2/21/头像_灰毫.png',
    description: '灰毫',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/9/96/头像_琴柳.png',
    description: '琴柳',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/0/0f/头像_桑葚.png',
    description: '桑葚',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/5/52/头像_罗比菈塔.png',
    description: '罗比菈塔',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/d/df/头像_假日威龙陈.png',
    description: '假日威龙陈',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/b/b8/头像_羽毛笔.png',
    description: '羽毛笔',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/a/ad/头像_帕拉斯.png',
    description: '帕拉斯',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/d/dd/头像_卡涅利安.png',
    description: '卡涅利安',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/a/a8/头像_绮良.png',
    description: '绮良',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/9/95/头像_贝娜.png',
    description: '贝娜',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/9/92/头像_深靛.png',
    description: '深靛',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/8/80/头像_浊心斯卡蒂.png',
    description: '浊心斯卡蒂',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/c/c5/头像_凯尔希.png',
    description: '凯尔希',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/0/0d/头像_歌蕾蒂娅.png',
    description: '歌蕾蒂娅',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/f/fe/头像_赤冬.png',
    description: '赤冬',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/3/34/头像_熔泉.png',
    description: '熔泉',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/f/f8/头像_暴雨.png',
    description: '暴雨',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/6/64/头像_灰烬.png',
    description: '灰烬',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/5/51/头像_霜华.png',
    description: '霜华',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/6/6b/头像_夕.png',
    description: '夕',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/6/6d/头像_嵯峨.png',
    description: '嵯峨',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/2/20/头像_炎狱炎熔.png',
    description: '炎狱炎熔',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/9/93/头像_图耶.png',
    description: '图耶',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/b/bb/头像_空弦.png',
    description: '空弦',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/9/9a/头像_爱丽丝.png',
    description: '爱丽丝',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/c/cb/头像_豆苗.png',
    description: '豆苗',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/8/8d/头像_卡夫卡.png',
    description: '卡夫卡',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/1/1f/头像_罗宾.png',
    description: '罗宾',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/5/5e/头像_松果.png',
    description: '松果',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/5/5b/头像_阿米娅(近卫).png',
    description: '阿米娅(近卫)',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/3/3b/头像_迷迭香.png',
    description: '迷迭香',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/0/06/头像_泥岩.png',
    description: '泥岩',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/3/34/头像_絮雨.png',
    description: '絮雨',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/d/d8/头像_杰克.png',
    description: '杰克',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/f/f7/头像_瑕光.png',
    description: '瑕光',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/f/f8/头像_鞭刃.png',
    description: '鞭刃',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/2/28/头像_泡泡.png',
    description: '泡泡',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/e/e1/头像_史尔特尔.png',
    description: '史尔特尔',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/d/d3/头像_四月.png',
    description: '四月',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/3/30/头像_薄绿.png',
    description: '薄绿',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/7/74/头像_森蚺.png',
    description: '森蚺',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/a/ac/头像_燧石.png',
    description: '燧石',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/b/b9/头像_特米米.png',
    description: '特米米',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/e/e9/头像_酸糖.png',
    description: '酸糖',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/3/36/头像_安哲拉.png',
    description: '安哲拉',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/1/1d/头像_蜜蜡.png',
    description: '蜜蜡',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/c/c6/头像_稀音.png',
    description: '稀音',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/5/55/头像_铃兰.png',
    description: '铃兰',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/b/b5/头像_亚叶.png',
    description: '亚叶',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/4/43/头像_卡达.png',
    description: '卡达',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/6/63/头像_早露.png',
    description: '早露',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/e/e9/头像_苦艾.png',
    description: '苦艾',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/4/43/头像_波登可.png',
    description: '波登可',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/b/b6/头像_月禾.png',
    description: '月禾',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/1/18/头像_石棉.png',
    description: '石棉',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/d/d6/头像_W.png',
    description: 'W',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/9/93/头像_温蒂.png',
    description: '温蒂',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/3/36/头像_巫恋.png',
    description: '巫恋',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/8/84/头像_铸铁.png',
    description: '铸铁',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/2/2c/头像_刻刀.png',
    description: '刻刀',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/d/de/头像_风笛.png',
    description: '风笛',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/2/2f/头像_柏喙.png',
    description: '柏喙',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/f/f4/头像_宴.png',
    description: '宴',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/1/19/头像_清流.png',
    description: '清流',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/4/4a/头像_刻俄柏.png',
    description: '刻俄柏',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/8/81/头像_惊蛰.png',
    description: '惊蛰',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/9/9c/头像_年.png',
    description: '年',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/2/24/头像_雪雉.png',
    description: '雪雉',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/3/30/头像_煌.png',
    description: '煌',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/3/3b/头像_灰喉.png',
    description: '灰喉',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/f/ff/头像_安比尔.png',
    description: '安比尔',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/7/7a/头像_苇草.png',
    description: '苇草',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/0/0b/头像_莫斯提马.png',
    description: '莫斯提马',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/e/ed/头像_槐琥.png',
    description: '槐琥',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/a/ac/头像_梅.png',
    description: '梅',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/a/ad/头像_微风.png',
    description: '微风',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/4/4d/头像_麦哲伦.png',
    description: '麦哲伦',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/a/af/头像_红云.png',
    description: '红云',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/a/ab/头像_坚雷.png',
    description: '坚雷',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/e/ee/头像_星极.png',
    description: '星极',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/9/9d/头像_桃金娘.png',
    description: '桃金娘',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/d/d4/头像_黑.png',
    description: '黑',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/5/53/头像_格劳克斯.png',
    description: '格劳克斯',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/3/39/头像_锡兰.png',
    description: '锡兰',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/6/63/头像_苏苏洛.png',
    description: '苏苏洛',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/c/cf/头像_陈.png',
    description: '陈',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/5/50/头像_诗怀雅.png',
    description: '诗怀雅',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/1/16/头像_泡普卡.png',
    description: '泡普卡',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/5/53/头像_斯卡蒂.png',
    description: '斯卡蒂',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/2/29/头像_格拉尼.png',
    description: '格拉尼',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/a/a7/头像_夜魔.png',
    description: '夜魔',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/c/c2/头像_猎蜂.png',
    description: '猎蜂',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/c/cd/头像_空爆.png',
    description: '空爆',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/3/36/头像_暴行.png',
    description: '暴行',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/e/ee/头像_塞雷娅.png',
    description: '塞雷娅',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/0/07/头像_星熊.png',
    description: '星熊',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/6/64/头像_夜莺.png',
    description: '夜莺',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/5/54/头像_闪灵.png',
    description: '闪灵',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/c/ca/头像_安洁莉娜.png',
    description: '安洁莉娜',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/c/cc/头像_艾雅法拉.png',
    description: '艾雅法拉',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/e/ed/头像_伊芙利特.png',
    description: '伊芙利特',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/b/ba/头像_推进之王.png',
    description: '推进之王',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/a/ad/头像_能天使.png',
    description: '能天使',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/d/dd/头像_食铁兽.png',
    description: '食铁兽',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/c/c5/头像_狮蝎.png',
    description: '狮蝎',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/5/58/头像_空.png',
    description: '空',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/e/e6/头像_真理.png',
    description: '真理',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/d/d7/头像_初雪.png',
    description: '初雪',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/7/7d/头像_崖心.png',
    description: '崖心',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/2/27/头像_守林人.png',
    description: '守林人',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/7/72/头像_普罗旺斯.png',
    description: '普罗旺斯',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/f/f1/头像_火神.png',
    description: '火神',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/a/ab/头像_可颂.png',
    description: '可颂',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/f/f5/头像_雷蛇.png',
    description: '雷蛇',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/a/ac/头像_红.png',
    description: '红',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/1/1a/头像_临光.png',
    description: '临光',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/3/30/头像_华法琳.png',
    description: '华法琳',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/3/39/头像_赫默.png',
    description: '赫默',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/0/07/头像_梅尔.png',
    description: '梅尔',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/f/fa/头像_天火.png',
    description: '天火',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/3/36/头像_阿米娅.png',
    description: '阿米娅',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/e/ea/头像_陨星.png',
    description: '陨星',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/3/3b/头像_白金.png',
    description: '白金',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/6/63/头像_蓝毒.png',
    description: '蓝毒',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/2/28/头像_幽灵鲨.png',
    description: '幽灵鲨',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/b/bf/头像_拉普兰德.png',
    description: '拉普兰德',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/f/fe/头像_因陀罗.png',
    description: '因陀罗',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/2/2b/头像_芙兰卡.png',
    description: '芙兰卡',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/5/57/头像_德克萨斯.png',
    description: '德克萨斯',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/c/cd/头像_凛冬.png',
    description: '凛冬',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/8/83/头像_白面鸮.png',
    description: '白面鸮',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/2/2f/头像_阿消.png',
    description: '阿消',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/5/57/头像_地灵.png',
    description: '地灵',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/d/d1/头像_深海色.png',
    description: '深海色',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/0/07/头像_古米.png',
    description: '古米',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/0/02/头像_蛇屠箱.png',
    description: '蛇屠箱',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/6/6a/头像_调香师.png',
    description: '调香师',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/c/cc/头像_嘉维尔.png',
    description: '嘉维尔',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/d/d9/头像_末药.png',
    description: '末药',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/d/dd/头像_暗索.png',
    description: '暗索',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/c/ce/头像_砾.png',
    description: '砾',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/f/fc/头像_慕斯.png',
    description: '慕斯',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/5/57/头像_艾丝黛尔.png',
    description: '艾丝黛尔',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/2/29/头像_霜叶.png',
    description: '霜叶',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/1/13/头像_缠丸.png',
    description: '缠丸',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/a/a1/头像_杜宾.png',
    description: '杜宾',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/b/bb/头像_红豆.png',
    description: '红豆',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/6/63/头像_清道夫.png',
    description: '清道夫',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/b/b4/头像_白雪.png',
    description: '白雪',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/1/14/头像_流星.png',
    description: '流星',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/6/63/头像_杰西卡.png',
    description: '杰西卡',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/6/63/头像_远山.png',
    description: '远山',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/5/55/头像_夜烟.png',
    description: '夜烟',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/8/83/头像_梓兰.png',
    description: '梓兰',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/d/d3/头像_芙蓉.png',
    description: '芙蓉',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/f/fb/头像_炎熔.png',
    description: '炎熔',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/b/b9/头像_克洛丝.png',
    description: '克洛丝',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/3/32/头像_米格鲁.png',
    description: '米格鲁',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/8/87/头像_卡缇.png',
    description: '卡缇',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/4/4b/头像_玫兰莎.png',
    description: '玫兰莎',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/1/1f/头像_翎羽.png',
    description: '翎羽',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/c/c8/头像_香草.png',
    description: '香草',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/4/41/头像_芬.png',
    description: '芬',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/2/24/头像_杜林.png',
    description: '杜林',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/b/b2/头像_夜刀.png',
    description: '夜刀',
    sex: '女'
  },
  {
    src: 'https://prts.wiki/images/b/b6/头像_Lancet-2.png',
    description: 'Lancet-2',
    sex: '女'
  }
]

const maleStarrail = [
  {
    src: 'https://patchwiki.biligame.com/images/sr/8/87/ao9ujwqwbjv68ij6vr490p3pkqzkn9p.png',
    description: '丹恒•饮月'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/f/fe/jxzzi5kp8jdw1fuhnahn6qyy9vl9nu6.png',
    description: '刃'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/3/3f/76fj7jis4ar1utfxuy204n14n4e2xdr.png',
    description: '罗刹'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/0/08/czu13ylijhjhge0q7kifg1fl1vrgzvw.png',
    description: '景元'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/5/5a/swlg2ahlftwx9z924nvu68g8z17nhrb.png',
    description: '彦卿'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/8/88/50zxvgnvb1njodfwajzqm92q1plno9i.png',
    description: '杰帕德'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/f/fd/6nla1tj05d8kb93s9q4cbdzlhtcpth0.png',
    description: '瓦尔特'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/1/1f/qb9pytrok6o1ma7fpev9x4vpkafrnfr.png',
    description: '卢卡'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/1/11/sh2jzpg6tg4xqhcnefwyepnc9g11wup.png',
    description: '阿兰'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/e/e4/9m1i1oehsc917nw0yooftpopq6phd70.png',
    description: '桑博'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/7/7e/28gsf434fv7tkrzx2hnnypj4uv0af5b.png',
    description: '丹恒'
  }
]

const femaleStarrail = [
  {
    src: 'https://patchwiki.biligame.com/images/sr/4/40/cx5g1x6u0u122j49mtb8k4cjzg24pka.png',
    description: '卡芙卡'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/b/b7/ovhwp6d1z8kunhzg4jvpq6eiljk1jj0.png',
    description: '银狼'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/a/ae/4c95c0nvx7sofiv8nfmxpkslazhi2cd.png',
    description: '开拓者•存护'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/b/b8/r7wiq4ulhzs4ie0u1vz0vn6robwbich.png',
    description: '开拓者•毁灭'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/f/f8/5p06mtesw8xma24gk48opn8ryw94tyb.png',
    description: '白露'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/0/08/i7568mf4wku3nmvwjbn3owfvn7jrfb9.png',
    description: '姬子'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/1/12/ppj9btc9d4k11mt05ggb8x5h50o813w.png',
    description: '克拉拉'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/2/2c/dgohcdqulbu8zu7navozyucanc7erk0.png',
    description: '希儿'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/f/f2/9p7bq5l31ehtahpqds7gmy6kb7ta0st.png',
    description: '布洛妮娅'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/5/5a/oxyfdg8l3q91hfzeyc1py2xya231ahe.png',
    description: '驭空'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/e/e5/c9que0xmmixsyd85k2kslgv5xmbv7yw.png',
    description: '停云'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/0/0f/17w420wdgo3hlgou172c6zrh7tdotcq.png',
    description: '青雀'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/7/71/l7kyq11qx41xufyje1wq086wmg799iq.png',
    description: '黑塔'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/8/8e/c09cwu1rh3gdjby43dgjpsy6t6ml6uu.png',
    description: '素裳'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/2/23/fs8fwe5lhac0x50wr9kz7h4gyolq3hd.png',
    description: '娜塔莎'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/e/e5/q8c9bkv089il1ccti1eqk8njix73d79.png',
    description: '希露瓦'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/7/77/qujhwl76sfp3ukulldq2fxcl50e6mn4.png',
    description: '佩拉'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/1/1f/jqukvnrnqd8kckbyyidbfeztxmu981x.png',
    description: '虎克'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/5/52/5d2081brj2nw5afmba441lle1dpd4ha.png',
    description: '三月七'
  },
  {
    src: 'https://patchwiki.biligame.com/images/sr/2/2f/3m0m8c2xkihv4micgyd71kqs0stsflm.png',
    description: '艾丝妲'
  }
]

/**
 * 获取头像地址
 * @param sex number 性别,1:男,2:女
 * @param works number[] 作品,1:原神,2:明日方舟,3:崩坏·星穹铁道
 */
export const getAvatarUrls = (sex: number, works: number[]) => {
  let result: {
    src: string
    description: string
  }[] = []
  works = works || [1, 2, 3]
  works = works.sort((a, b) => a - b)
  switch (sex) {
    case 1:
      works.forEach((work) => {
        switch (work) {
          case 1:
            result = result.concat(maleGenshin)
            break
          case 2:
            result = result.concat(maleArknights)
            break
          case 3:
            result = result.concat(maleStarrail)
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
            result = result.concat(femaleGenshin)
            break
          case 2:
            result = result.concat(femaleArknights)
            break
          case 3:
            result = result.concat(femaleStarrail)
            break
          default:
            break
        }
      })
      break
    default:
      break
  }
  return result
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
    'number' in item && item?.number ? item.number : 'name' in item ? item.name + item.id ?? '' : ''
  let urls: { src: string; description: string }[]
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
  return urls[selectAvatar(sn, urls.length)].src
}
