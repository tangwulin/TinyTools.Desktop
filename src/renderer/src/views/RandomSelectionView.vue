<script setup>
import { Dice, DiceOutline } from "@vicons/ionicons5";
import { ref, watch } from "vue";
import { usePersonStore } from "../stores/person";
import { storeToRefs } from "pinia";
import { NButton } from "naive-ui";
import { shuffle } from "lodash-es";
import raffleBgm from "../assets/audio/raffle-2.mp3";

const personStore = usePersonStore();
const { personList } = storeToRefs(personStore);

const showFastModal = ref(false);
const showAdvancedModal = ref(false);
const number = ref(1);
const isSelected = ref(false);
const selectedPerson = ref([]);
const selectedSex = ref([1, 2, 9]);
const selectionList = ref([]);

const hasHover1 = ref(false);
const hasHover2 = ref(false);

// const itemsEachRow = ref(4);

const sexes = [
  { label: "男", value: 1 },
  { label: "女", value: 2 },
  { label: "未填写", value: 9 }
]; //此处参考了GB/T 2261.1-2003

const handler = (fast) => {
  const list = fast ? personList.value : selectionList.value;
  // const len = list.length;
  // const result = [];
  // const set = new Set();
  // while (set.size < number.value) {
  //   const index = Math.floor(Math.random() * len);
  //   if (!set.has(index)) {
  //     set.add(index);
  //     result.push(list[index]);
  //   }
  // }
  // 实测发现，上述算法在数据量较大时，性能较差，故改用lodash的shuffle方法
  showFastModal.value = false;
  showAdvancedModal.value = false;

  isSelected.value = true;
  const player = document.querySelector("audio");
  player.play();
  const interval = setInterval(() => {
    selectedPerson.value = shuffle(list).slice(0, number.value);
  }, 250);
  setTimeout(() => {
    clearInterval(interval);
  }, 3000);
};

function createOptions(x)
{
  return x.map((item) => ({
    label: item.name,
    value: item.uniqueId,
    disabled: false
  }));
}

function createValues(x)
{
  return x.map((item) => item.uniqueId);
}

const options1 = ref(createOptions(personList.value));
const value1 = ref(createValues(personList.value));

selectionList.value = personList.value.filter((item) =>
  value1.value.includes(item.uniqueId)
);

watch(selectedSex, () => {
  options1.value = createOptions(
    personList.value.filter((item) => selectedSex.value.includes(item.sex))
  );
  value1.value = createValues(
    personList.value.filter((item) => selectedSex.value.includes(item.sex))
  );
});
watch(
  value1,
  () => {
    selectionList.value = personList.value.filter((item) =>
      value1.value.includes(item.uniqueId)
    );
  },
  { deep: true }
);

const male = [
  {
    src: "https://i0.hdslb.com/bfs/article/558dae2786d93a7ea8b7f9e67dface124a0ca275.jpg",
    describe: "林尼"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/9794c93a39790b115142a0d920c1278f96dcca50.jpg",
    describe: "菲米尼"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/d535d2199e35bfad24ffb081e2d0f3fb0e3ddad3.jpg",
    describe: "卡维"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/591d974894794dcebfc0f83cd32ddb01ef4fdeda.jpg",
    describe: "白术"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/2d03041163fee31a8ac4e379f66847185458b898.jpg",
    describe: "米卡"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/a5c49a722289b9cb3e764dd89edd9688385e9653.jpg",
    describe: "散兵（流浪者）"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/8a62808ede44ce1b59e20252504a0bf4890ba231.jpg",
    describe: "艾尔海森"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/921ef6095df5ab142613cd27b2a7f52c861badb1.jpg",
    describe: "空"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/b2712b0aea3ea559e03413ef262fb5de573e1791.jpg",
    describe: "温迪（巴巴托斯）"
  },

  {
    src: "https://i0.hdslb.com/bfs/article/3956ff65670244439aea2e0cb55eab4e846f5f40.jpg",
    describe: "凯亚"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/8d7f5329aa0e8560d22abe2f70f01dcfe36f6dd0.jpg",
    describe: "迪卢克"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/0c0695359926e3753733bab0ff729a6431677881.jpg",
    describe: "班尼特"
  },

  {
    src: "https://i0.hdslb.com/bfs/article/2dff569092c6aacae75df54f75bb0edae2af02eb.jpg",
    describe: "雷泽"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/e5046f6c48dcca18851f3ea77b8bc808091e980f.jpg",
    describe: "阿贝多"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/cecc1994c3e417aec0cde65b4d130dda8f72b929.jpg",
    describe: "钟离（摩拉克斯）"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/a49dde421aad659d7c27a08dd58ac8cf82f9025a.jpg",
    describe: "魈"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/fd02f49efd639acb1e14236b95e59cfca2bebfc3.jpg",
    describe: "行秋"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/429f65019fa89cdfb0fa10df436a53457d9d107b.jpg",
    describe: "重云"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/e7d54f8c534ea32bb6eb8902d185b681d3172e31.jpg",
    describe: "达达利亚（公子）"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/118c6927c242ad014ca4f5ff9eaf1c428ac86dde.jpg",
    describe: "枫原万叶"
  },

  {
    src: "https://i0.hdslb.com/bfs/article/0ba3b841fd183dc8cf51af9ac9c824ab306a976a.jpg",
    describe: "神里绫人"
  },

  {
    src: "https://i0.hdslb.com/bfs/article/da22cac37f2b81243bc7b1d0ab6cc31a48164a52.jpg",
    describe: "五郎"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/ca76c1447de1878336b7892e668fe7ef90dd00ef.jpg",
    describe: "托马"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/a7ecf5a781c6a6b34926032c30358ef2d1f93540.jpg",
    describe: "荒泷一斗"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/a8eb8cf588ea20768f8e46683c54219adbeefc25.jpg",
    describe: "鹿野院平藏"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/d44f42d2936d5fb66bdb8403623370316021eee6.jpg",
    describe: "提纳里"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/68b10f0589e84559dfcfecb23593ea91e286642d.jpg",
    describe: "柯莱"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/a5af6a9862da18dad99becca198b02687795114c.jpg",
    describe: "赛诺"
  }
];

const female = [
  {
    src: "https://i0.hdslb.com/bfs/article/e9ccd96c60a68a8879fe53f0460de3d00b1f81d1.jpg",
    describe: "坎蒂丝"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/326c1611f909d7ec2b577e796ba5f118edcf9fce.jpg",
    describe: "多莉"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/481f34bad82deeea8e5a4a79113c718338bd5880.jpg",
    describe: "妮露"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/dd49fda3d85162645f0857ab453c068e92779258.jpg",
    describe: "莱依拉"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/73c8aed025ed6bcf2a7b1e6ab9aed4496b84a812.jpg",
    describe: "珐露珊"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/dbd558aae671fa8b9c6e27534d3f25d7e56dc561.jpg",
    describe: "派蒙（更新版）"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/2791a94d8c9df663368d6061ef7740550abd283c.jpg",
    describe: "八重神子"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/8b581a9d4891c7cae1d152c95c59cfcf9a2e391b.jpg",
    describe: "九条裟罗"
  },

  {
    src: "https://i0.hdslb.com/bfs/article/8c4130d981654016f1ba6998d2f591064c0dfaeb.jpg",
    describe: "久岐忍"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/4da72834401f6ccd23b85188098494a3cd2cd260.jpg",
    describe: "早柚"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/62f9e7eb8f36f83efb7c39c93038a5f1bc04b4a8.jpg",
    describe: "珊瑚宫心海"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/b57f7a2ffe90a9eb8387a068507e6c3e5f4f6f40.jpg",
    describe: "神里绫华"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/b0cc273cb6c6cfbbbd19de2605b108a28891c671.jpg",
    describe: "宵宫"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/0ea45d9d027a182609777403d606720f233bff9e.jpg",
    describe: "刻晴皮肤"
  },

  {
    src: "https://i0.hdslb.com/bfs/article/3d2473d3ee07e5ec205554fb6252cc08969d4e48.jpg",
    describe: "雷电将军（影-巴尔泽布）"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/89123c29cb31e1f8b12f25d50b4a31fc300c0a80.jpg",
    describe: "香菱"
  },

  {
    src: "https://i0.hdslb.com/bfs/article/46dff6f06f5d17dcfb471545e0ddf27b447a6c86.jpg",
    describe: "凝光"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/585cd74b5a714f5e8150bb2f2a3c23b6220e91fd.jpg",
    describe: "烟绯"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/46239d0e1f11edf65fae907420ca2ebd894faa4c.jpg",
    describe: "北斗"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/9c991b59a1f8b016f0e709e39eaf3bb3c37a65a6.jpg",
    describe: "申鹤"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/5908fb24dce612e2146e3a6f398cb74082b0f867.jpg",
    describe: "云堇"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/2ab989ae710cf8373084c5606290e12f9c05048b.jpg",
    describe: "辛焱"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/eef20e36908452d61cae4055a7c3c29db86035bb.jpg",
    describe: "夜兰"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/2e929564356e26272837e631b12e68137b27d843.jpg",
    describe: "埃洛伊"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/a78172af22a23dd3c81f397e56200043de4939ce.jpg",
    describe: "可莉"
  },

  {
    src: "https://i0.hdslb.com/bfs/article/fe6fb41beefdbbb19d535f8c8761d5266201daef.jpg",
    describe: "甘雨"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/7fb01eb1b24dd46c47271200de28cefad854471c.jpg",
    describe: "胡桃"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/a4fcee83232b553a24905f563fdfd0d169839b48.jpg",
    describe: "七七"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/eb78ee7236f30694051d0d75f68edbbf0d1d3129.jpg",
    describe: "刻晴"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/2f006ca5c0e6b172b4d13c54f1422f5d3247b5e8.jpg",
    describe: "迪奥娜"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/1d68a0d70f5640458a63b0aa7b04c8fc568b38dc.jpg",
    describe: "诺艾尔"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/d25b716845088d67b74626bdcb0eb8147e873207.jpg",
    describe: "菲谢尔"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/36ceb1504c941b6a8b62935dda72bf40486a75f6.jpg",
    describe: "砂糖"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/524f7f82b17e125a003c0cda24cf295a72aa19e9.jpg",
    describe: "罗莎莉亚"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/4d1ee4ba32269fa1ab6886484773bc75fa2b4bd4.jpg",
    describe: "优菈"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/9eb614203141a466bc5b526d7c62a9634b44ab5e.jpg",
    describe: "丽莎"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/59ee10f29cda92ebef9b67530826a08daf6c890f.jpg",
    describe: "琴"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/954f7fc984fb47ed1b4a27f9f54794aa77608d5c.jpg",
    describe: "莫娜"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/b3589e622a332b2133407c7336c2f0a53431cf91.jpg",
    describe: "芭芭拉"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/4c46a8c0a2c52f91568bfd03ba25451bcf2a230a.jpg",
    describe: "荧"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/b638650721a9fb36c225302ad22d4d2b15b14199.jpg",
    describe: "安柏"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/17612de9558e1d8de7ec20d983e2ad6e09ff19d5.jpg",
    describe: "纳西妲"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/85babd1efb1023c4b7d069e1da767b96c2c830d3.jpg",
    describe: "琳妮特"
  },

  {
    src: "https://i0.hdslb.com/bfs/article/364884f1fbf86bc40bdb5b932662c55e489b4fa6.jpg",
    describe: "绮良良"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/9370e534b87071af0f4a94d6adcba71b1f708362.jpg",
    describe: "迪希雅"
  },
  {
    src: "https://i0.hdslb.com/bfs/article/83dc734c1b6a07c6e7a8015df444249c0c8bc74d.jpg",
    describe: "瑶瑶"
  }
];

const all = male.concat(female);

function generateHash(input)
{
  let hash = 0;
  for (let i = 0; i < input.length; i++)
  {
    hash = (hash << 5) - hash + input.charCodeAt(i);
  }
  return Math.abs(hash);
}

function selectAvatar(studentId, avatarCount)
{
  const hashValue = generateHash(studentId);
  return hashValue % avatarCount;
}

const getAvatar = (person) => {
  const sex = person.sex;
  let avatarCount;
  const sn =person.number?person.number:person.uniqueId;
  switch (sex)
  {
    case 1:
      avatarCount = male.length;
      return male[selectAvatar(sn, avatarCount)].src;
    case 2:
      avatarCount = female.length;
      return female[selectAvatar(sn, avatarCount)].src;
    default:
      avatarCount = all.length;
      return all[selectAvatar(sn, avatarCount)].src;
  }
};
</script>

<template>
  <n-layout style="height: calc(100% - 0.5rem); width: 100%">
    <n-layout-content style="height: calc(100% - 1rem - 6rem)">
      <div class="flex flex-col justify-center items-center h-full">
        <audio :src="raffleBgm" />
        <n-layout
          v-if="isSelected"
          content-style="display:flex;height:100%;width:100%;"
          :native-scrollbar="false"
        >
          <div
            style="
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              margin:auto;
            "
          >
            <div
              v-for="item in selectedPerson"
              style="
                width: 8rem;
                height: 8rem;
                background: #fff;
                box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.1);
                border-radius: 1rem;
                margin: 0.5rem;
              "
            >
              <div
                style="
                  width: 100%;
                  height: 100%;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                "
              >
                <n-avatar
                  style="margin-bottom: 1rem"
                  size="large"
                  :src="item?.avatar||getAvatar(item)"
                />
                <span style="font-size: 1.5rem">{{ item?.name }}</span>
              </div>
            </div>
          </div>
        </n-layout>
        <n-p depth="3" style="font-size: 2rem" v-else> 还没有抽选……</n-p>
      </div>
    </n-layout-content>
    <n-layout-footer position="absolute">
      <n-divider style="margin: 0" />
      <div
        style="height: 6rem"
        class="flex flex-row justify-around items-center"
      >
        <div
          style="margin: auto; width: 4rem; cursor: pointer"
          class="flex flex-col justify-center items-center"
          @click="showFastModal = true"
          @mouseenter="hasHover1 = true"
          @mouseleave="hasHover1 = false"
        >
          <n-icon size="2rem">
            <Dice v-if="hasHover1" />
            <DiceOutline v-else />
          </n-icon>
          <span>快速开始</span>
        </div>
        <div
          style="margin: auto; width: 4rem; cursor: pointer"
          class="flex flex-col justify-center items-center"
          @click="showAdvancedModal = true"
          @mouseenter="hasHover2 = true"
          @mouseleave="hasHover2 = false"
        >
          <n-icon size="2rem">
            <Dice v-if="hasHover2" />
            <DiceOutline v-else />
          </n-icon>
          <span>自定义</span>
        </div>
      </div>
    </n-layout-footer>
  </n-layout>

  <n-modal v-model:show="showFastModal">
    <n-card
      style="width: 50%"
      title="快速抽选"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      closable
      @close="showFastModal = false"
    >
      数量
      <n-input-number
        v-model:value="number"
        :min="1"
        :max="personList.length"
        button-placement="both"
      />
      <template #footer>
        <div class="flex justify-end">
          <n-button type="primary" @click="handler(true)">开始</n-button>
        </div>
      </template>
    </n-card>
  </n-modal>

  <n-modal v-model:show="showAdvancedModal">
    <n-card
      style="width: 50%; overflow-y: auto; overflow-x: hidden"
      title="高级抽选"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      closable
      @close="showAdvancedModal = false"
    >
      数量
      <n-input-number
        v-model:value="number"
        :min="1"
        :max="selectionList.length"
        button-placement="both"
      />
      <n-divider style="margin: 1rem 0" />
      <div>
        <n-collapse>
          <n-collapse-item title="性别范围" name="1">
            <n-checkbox-group v-model:value="selectedSex">
              <n-space item-style="display: flex;">
                <n-checkbox
                  v-for="sex in sexes"
                  :label="sex.label"
                  :value="sex.value"
                />
              </n-space>
            </n-checkbox-group>
          </n-collapse-item>
          <n-collapse-item title="人员范围" name="2">
            <n-transfer
              ref="transfer"
              v-model:value="value1"
              :options="options1"
              source-filterable
            />
          </n-collapse-item>
        </n-collapse>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <n-button type="primary" @click="handler(false)">开始</n-button>
        </div>
      </template>
    </n-card>
  </n-modal>
</template>

<style scoped></style>
