<template>
  <div
    id="SeatView"
    class="flex items-center justify-center flex-col h-auto m-auto"
    style="height: 100%"
  >
    <div id="target-div" class="md:w-fit p-4" style="margin: 0 auto">
      <div class="flex items-center justify-center mb-4">
        <n-button :size="'large'">讲台</n-button>
      </div>
      <div>
        <SeatTable
          v-model:seats="allSeats"
          v-model:rendering-list="oldRenderingList"
          :key="stKey"
          @update="updateHandler"
          :disable="isPreview || loading"
        />
      </div>
      <div class="flex justify-center mt-4">
        <p>{{ currentDate }} {{ currentTime }}</p>
      </div>
    </div>
    <div class="flex items-center justify-center mt-4 flex-col">
      <!-- 调试工具栏 -->
      <n-collapse v-show="enableDevelopFeature">
        <n-collapse-item title="调试工具" name="debugTool">
          <div class="flex flex-col items-center justify-center">
            <n-button-group>
              <n-button @click="colorEdge" :disabled="loading || isPreview"
              >染色边缘座位
              </n-button>
              <n-button
                @click="removeEdgeColor"
                :disabled="loading || isPreview"
              >去除所有染色
              </n-button>
            </n-button-group>
          </div>
        </n-collapse-item>
      </n-collapse>

      <div
        class="flex items-center justify-center flex-col md:flex-row flex-wrap md:w-3/5 lg:w-7/12"
      >
        <!-- 操作区域 -->
        <!--        <n-button @click="reloadSeatTable" :disabled="loading">重载座位表组件</n-button>-->
        <n-tooltip trigger="hover">
          <!--suppress VueUnrecognizedSlot -->
          <template #trigger>
            <n-button
              @click="replaceSeats"
              :loading="loading"
              :disabled="loading || isPreview"
            >
              <template #icon>
                <n-icon>
                  <RefreshDot />
                </n-icon>
              </template>
              重新排列座位
            </n-button>
          </template>
          ”优化“后的排座位方式，不会连续两次抽到边缘位置
        </n-tooltip>
        <n-tooltip trigger="hover">
          <!--suppress VueUnrecognizedSlot -->
          <template #trigger>
            <n-button
              @click="rollSeats(5)"
              :loading="loading"
              :disabled="loading || isPreview"
            >
              <template #icon>
                <n-icon>
                  <RefreshDot />
                </n-icon>
              </template>
              按规则Roll座位
            </n-button>
          </template>
          先随机5次并展示每次结果，再将原始位置按“重新排列座位”的做法排列（虚 晃
          一 枪）
        </n-tooltip>
        <n-button @click="save(scale)" :disabled="loading || isPreview"
        >保存图片
        </n-button>
        <n-dropdown :options="saveOptions" @select="save">
          <n-button :disabled="loading || isPreview">
            <template #icon>
              <ArrowDropDownFilled />
            </template>
          </n-button>
        </n-dropdown>
        <n-button @click="showHistory = true" :disabled="loading"
        >历史记录
        </n-button>
        <n-tooltip trigger="hover">
          <!--suppress VueUnrecognizedSlot -->
          <template #trigger>
            <n-popconfirm
              positive-text="确定"
              :negative-text="null"
              @positive-click="rollSeats(times)"
            >
              <!--suppress VueUnrecognizedSlot -->
              <template #trigger>
                <n-button :loading="loading" :disabled="loading || isPreview">
                  <template #icon>
                    <n-icon>
                      <RefreshDot />
                    </n-icon>
                  </template>
                  玩把大的！
                </n-button>
              </template>
              <div class="flex flex-row items-center">
                次数：
                <n-input-number
                  clearable
                  :precision="0"
                  v-model:value="times"
                />
              </div>
            </n-popconfirm>
          </template>
          与”按规则Roll座位“一样，只不过次数可以改
        </n-tooltip>
        <n-tooltip trigger="hover">
          <!--suppress VueUnrecognizedSlot -->
          <template #trigger>
            <n-button
              @click="gacha"
              :loading="loading"
              :disabled="loading || isPreview"
            >
              <template #icon>
                <n-icon>
                  <RefreshDot />
                </n-icon>
              </template>
              抽卡！
            </n-button>
          </template>
          与”重新排列座位“一样，只不过会一个个的展示结果
        </n-tooltip>
        <n-tooltip trigger="hover">
          <!--suppress VueUnrecognizedSlot -->
          <template #trigger>
            <n-button
              @click="reSort"
              :loading="loading"
              :disabled="loading || isPreview"
            >
              <template #icon>
                <n-icon>
                  <Refresh />
                </n-icon>
              </template>
              随机排列座位
            </n-button>
          </template>
          真·随机排列座位
          <del>，六亲不认的那种</del>
        </n-tooltip>
      </div>
      <div>
        <n-button-group v-show="enableOldToolBar">
          <n-button @click="showSetting">设置</n-button>
          <n-button @click="showManager" :disabled="loading || isPreview"
          >人员管理
          </n-button>
          <n-button @click="showMultiAddModal" :disabled="loading || isPreview"
          >增加人员
          </n-button>
        </n-button-group>
      </div>
    </div>

    <n-drawer v-model:show="showHistory" :width="'31vw'">
      <n-drawer-content :native-scrollbar="false">
        <template #header>
          <p>历史记录</p>
        </template>
        <history-drawer v-model:is-preview="isPreview" v-model:temp="temp" />
        <template #footer v-if="isPreview">
          <n-button type="error" ghost @click="exitPreview" class="ml-auto">
            退出预览
          </n-button>
        </template>
      </n-drawer-content>
    </n-drawer>

    <div class="absolute top-0 left-0 mt-4 ml-4" v-if="isPreview">
      <n-button type="error" @click="exitPreview"> 退出预览</n-button>
    </div>

    <div class="absolute top-0 right-0 mt-4 mr-4" v-if="isPreview">
      <n-button type="success" @click="saveHistory('手动保存')">
        保存当前
      </n-button>
    </div>

    <!--    <div class="fixed bottom-0 left-0 mb-2 ml-2 text-xs">-->
    <!--      <p>-->
    <!--        TinyTools v{{ version }} Build-->
    <!--        <a :href="githubLink" target="_blank">{{ revision }}</a>-->
    <!--      </p>-->
    <!--    </div>-->
    <div class="fixed bottom-0 right-0 mb-2 mr-2">
      <audio
        controls
        id="player"
        src="https://music.163.com/song/media/outer/url?id=430620198.mp3"
      ></audio>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch, toRaw } from "vue";
import { NButton, NButtonGroup, NIcon, NTooltip, useMessage } from "naive-ui";
import { Refresh, RefreshDot } from "@vicons/tabler";
import { ArrowDropDownFilled } from "@vicons/material";
import SeatTable from "../components/SeatTable.vue";
import HistoryDrawer from "../components/HistoryDrawer.vue";
import { domToPng } from "modern-screenshot";
import { useSeatStore } from "../stores/seat";
import { usePersonStore } from "../stores/person";
import { useSettingStore } from "../stores/setting";
import { storeToRefs } from "pinia";
import {
  getRenderingList,
  parseEdgeSeatIndex,
  replaceArrayElements
} from "../assets/script/seatHelper";
import { debounce, shuffle } from "lodash-es";
import {
  getDefaultBgm,
  getDefaultFinalBgm
} from "../assets/script/musicHelper";
import { useRouter } from "vue-router";

const message = useMessage();
const router = useRouter();

const seatWorker = new Worker(
  new URL("../assets/script/seatWorker.js", import.meta.url),
  {
    type: "module"
  }
);

const seatStore = useSeatStore();
const personStore = usePersonStore();
const settingStore = useSettingStore();

const { allSeats, oldRenderingList, history } = storeToRefs(seatStore);
const { personList } = storeToRefs(personStore);
const {
  bgms,
  finalBgms,
  isBGMInitialized,
  enableBgm,
  enableFinalBgm,
  enableFadein,
  fadeinTime,
  scale,
  enableDevelopFeature,
  enableOldToolBar
} = storeToRefs(settingStore);

const temp = ref({ allSeats: null, oldRenderingList: null });
const showHistory = ref(false);
const currentDate = ref("");
const currentTime = ref("");
const loading = ref(false);
const isPreview = ref(false);
const times = ref(5);
const stKey = ref(Math.random());
let msgReactive = null;

const colorEdge = () => {
  const edgeIndex = parseEdgeSeatIndex(allSeats.value.length);
  edgeIndex.forEach((index) => {
    allSeats.value[index].color = "#43a447";
  });
  oldRenderingList.value = getRenderingList(
    allSeats.value,
    oldRenderingList.value
  );
};

const removeEdgeColor = () => {
  allSeats.value.forEach((item) => {
    item.color = null;
  });
  oldRenderingList.value = getRenderingList(
    allSeats.value,
    oldRenderingList.value
  );
};

if (bgms.value.length === 0 || finalBgms.value.length === 0)
{
  bgms.value = getDefaultBgm();
  finalBgms.value = getDefaultFinalBgm();
  isBGMInitialized.value = true;
}

let bgmList = shuffle(toRaw(bgms.value));
let bgmIndex = 0;

let finalBgmList = shuffle(toRaw(finalBgms.value));
let finalBgmIndex = 0;

const showSetting = () => {
  router.push({ name: "setting" });
};
const showManager = () => {
  router.push({ name: "personManage" });
};
const showMultiAddModal = () => {
  router.push({ name: "personManage", query: { showAddModal: "true" } });
};

/**
 * 播放音频。
 *
 * @param {Object} option - 音频选项对象。
 * @param {string} option.url - 音频的URL。
 * @param {number} option.offset - 音频的起始播放时间（单位：秒）。
 * @param {string?} option.name - 音频的名称。
 */
const play = (option) => {
  const player = document.getElementById("player");
  player.src = option.url;
  player.currentTime = option.offset;
  if (option.name)
  {
    message.info("正在播放：" + option.name);
    console.log("正在播放：" + option.name);
  }
  if (enableFadein.value)
  {
    const originVol = player.volume;
    player.volume = 0;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      player.volume = player.volume + originVol / 50;
      if (i >= 50) clearInterval(interval);
    }, (fadeinTime.value * 1000) / 50);
  }
  player.play();
};
/**
 * 从抽选时音乐库里面挑一首出来放。
 */
const playBgm = () => {
  if (!enableBgm.value) return;
  const bgm = bgmList[bgmIndex];
  console.log(bgmList);
  if (bgmIndex < bgmList.length - 1) bgmIndex++;
  else bgmIndex = 0;
  play(bgm);
};
/**
 * 顾名思义，暂停用的
 */
const pauseBgm = () => {
  const player = document.getElementById("player");
  player.pause();
};

const playFinalBgm = () => {
  if (!enableFinalBgm.value) return;
  const bgm = finalBgmList[finalBgmIndex];
  console.log(finalBgmList);
  if (finalBgmIndex < finalBgmList.length - 1) finalBgmIndex++;
  else finalBgmIndex = 0;
  play(bgm);
};

// 在组件挂载时开始更新日期和时间
onMounted(() => {
  updateDateTime();
  setInterval(updateDateTime, 1000);
  const player = document.getElementById("player");
  player.volume = 0.6; //关 音 菩 萨
});

// 在组件卸载时停止更新日期和时间
onUnmounted(() => {
  clearInterval(updateDateTime);
});

// 更新日期和时间
function updateDateTime()
{
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();
  currentDate.value = date;
  currentTime.value = time;
}

const updateHandler = debounce(
  () => {
    saveHistory("手动更改");
  },
  100,
  { maxWait: 2000 }
);

const saveOptions = [
  {
    label: "图片分辨率（宽度）",
    key: 1,
    disabled: true
  },
  {
    label: "1080P",
    key: 2
  },
  {
    label: "4K",
    key: 4
  }
];
/**
 * 保存当前座位为图片
 * @param {number}x 倍率，为横向分辨率/960
 * @returns {Promise<void>}
 */
const save = async (x) => {
  loading.value = true;
  msgReactive = message.create("正在生成图片……", {
    type: "loading",
    duration: 0
  });

  const target = document.getElementById("target-div");
  const options = {
    filter: (node) => {
      try
      {
        return !node.classList.contains("n-button--dashed");
      }
      catch
      {
        return true;
      }
    },
    backgroundColor: "#FFFFFF",
    scale: (960 * x) / target.clientWidth
  };
  scale.value = x;
  domToPng(target, options)
    .then((dataUrl) => {
      const link = document.createElement("a");
      link.download =
        "seat-" + currentDate.value + "-" + currentTime.value + ".png";
      link.href = dataUrl;
      link.click();
    })
    .then(() => {
      msgReactive.content = "保存成功";
      msgReactive.type = "success";
      loading.value = false;
      setTimeout(() => {
        msgReactive.destroy();
        msgReactive = null;
      }, 3000);
    });
};

/**
 * 在allSeats或oldRenderingList为空的情况下初始化。
 */
if (allSeats.value === null || oldRenderingList.value === null)
{
  if (history.value.length !== 0)
  {
    allSeats.value = history.value[0].allSeats;
    oldRenderingList.value = history.value[0].oldRenderingList;
  }
  else
  {
    allSeats.value = personList.value.map((item, index) => {
      return { name: item.name, index: index, isSeat: true };
    });
    oldRenderingList.value = getRenderingList(allSeats.value, []);
  }
}

if (
  (personList.value.length !== 0 && allSeats.value.length === 0) ||
  personList.value.length !== allSeats.value.length
)
{
  allSeats.value = personList.value.map((item, index) => {
    return { name: item.name, index: index, isSeat: true };
  });
  console.log("seat has been initialized");
}
/**
 * 保存当前座位到历史记录
 * @param {string?} type 抽选类型，会显示在历史记录里面
 */
const saveHistory = (type) => {
  const data = {
    time: Date.now(),
    allSeats: [
      ...toRaw(
        allSeats.value.slice().map((item) => {
          return { ...item, color: null };
        })
      )
    ],
    oldRenderingList: [
      ...toRaw(oldRenderingList.value)
        .slice()
        .map((item) => {
          return { ...item, color: null };
        })
    ],
    isCurrent: true,
    type: type || "???"
  };
  history.value = history.value.map((item) => {
    return { ...item, isCurrent: false };
  });
  if (history.value.length !== 0 && history.value[0].type === "手动更改")
  { //这里没有对初始位置进行判断，因为到这个页面意味着已经开始正常使用了
    if (data.time - history.value[0].time > 60 * 1000)
      history.value.unshift(data);
    else history.value[0] = data;
  }
  else
  {
    history.value = history.value.map((item) => {
      return { ...item, isCurrent: false, isShowing: false };
    });
    history.value.unshift(data);
  }
  isPreview.value = false;
  if (type === "手动保存" || type === "手动更改") message.success("保存成功");
};
/**
 * 真·随机排列座位，六亲不认的那种
 * @returns {Promise<void>}
 */
const reSort = async () => {
  loading.value = true;
  await nextTick();
  allSeats.value = shuffle(allSeats.value).map((item, index) => {
    return { ...item, index: index };
  });
  await nextTick();
  await saveHistory("随机排列座位");
  setTimeout(() => {
    loading.value = false;
  }, 50);
};
/**
 * 与”重新排列座位“一样，只不过会一个个的展示结果
 * @returns {Promise<void>}
 */
const gacha = async () => {
  loading.value = true;
  playBgm();
  const data = JSON.parse(JSON.stringify(allSeats.value));
  console.log("主线程向worker发送消息：", data);
  seatWorker.postMessage(data);
  setTimeout(async () => {
    pauseBgm();
    await saveHistory("抽卡！");
    loading.value = false;
    playFinalBgm();
  }, allSeats.value.length * 550);
};
/**
 * 先随机指定次数次并展示每次结果，再将原始位置按“重新排列座位”的做法排列（虚 晃 一 枪）
 * @param {number} x 次数
 * @returns {Promise<void>}
 */
const rollSeats = async (x) => {
  loading.value = true;
  await nextTick();
  const originSeats = [...allSeats.value];
  let count = 0; // 计数器

  playBgm();

  const intervalId = setInterval(async () => {
    // 执行某个操作
    allSeats.value = shuffle(allSeats.value).map((item, index) => {
      return {
        ...item,
        index: index
      };
    });
    await nextTick();
    count++; // 增加计数器

    if (count === x + 1)
    {
      clearInterval(intervalId); // 达到执行次数后清除定时器
      setTimeout(() => {
        loading.value = false;
      }, 500);
      allSeats.value = replaceArrayElements(originSeats).map((item, index) => {
        return {
          ...item,
          index: index
        };
      });
      await saveHistory("按规则Roll座位");
      pauseBgm();
      playFinalBgm();
    }
  }, 500);
};
/**
 * ”优化“后的排座位方式，不会连续两次抽到边缘位置
 * @returns {Promise<void>}
 */
const replaceSeats = async () => {
  loading.value = true;
  console.log("开始重新排列座位");
  const stopwatch = performance.now();
  await nextTick();
  allSeats.value = replaceArrayElements(allSeats.value).map((item, index) => {
    return { ...item, index: index };
  });
  await nextTick();
  console.log("执行完成,用时" + (performance.now() - stopwatch) + "ms");
  setTimeout(async () => {
    await saveHistory("重新排列座位");
    loading.value = false;
  }, 50);
};
/**
 * 通过刷新key的方式重新渲染SeatTable组件
 * @returns {Promise<void>}
 */
const reloadSeatTable = async () => {
  allSeats.value = [...allSeats.value]; //这里不是脱裤子放屁，是为了触发侦听器
  stKey.value = Math.random(); //刷新一下SeatTable组件
  console.log("SeatTable has been reload");
};
/**
 * 退出预览状态
 */
const exitPreview = () => {
  isPreview.value = false;
  oldRenderingList.value = temp.value.oldRenderingList;
  allSeats.value = temp.value.allSeats;
  history.value = history.value.map((item) => {
    return { ...item, isShowing: false };
  });
};

window.addEventListener("beforeunload", isPreview ? exitPreview : () => {});

watch(personList, reloadSeatTable);

watch(allSeats, () => {
  console.log("seat changed");
});

watch(oldRenderingList, () => {
  stKey.value = Math.random();
});

seatWorker.onmessage = function(event) {
  console.log("收到Web Worker的更新");
  allSeats.value = event.data;
  reloadSeatTable();
};
</script>

<style scoped>

</style>
