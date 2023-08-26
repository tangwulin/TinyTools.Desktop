import { defineStore } from "pinia";
import { ref } from "vue";

export const useSettingStore = defineStore(
  "setting",
  () => {
    const coloringEdgeSeats = ref(false);

    const bgms = ref([]);
    const finalBgms = ref([]);
    const isBGMInitialized = ref(false);
    const enableBgm = ref(true);
    const enableFinalBgm = ref(true);
    const enableFadein = ref(true);
    const fadeinTime = ref(3);

    const scale = ref(2);
    const enableQuickSave = ref(false);

    const enableDocking = ref(false);

    const enableDevelopFeature = ref(false);

    const enableOldToolBar = ref(false);

    const lotteryMode=ref("or");

    const isFirstSetup = ref(true);
    return {
      coloringEdgeSeats,
      bgms,
      finalBgms,
      isBGMInitialized,
      enableBgm,
      enableFinalBgm,
      enableFadein,
      fadeinTime,
      scale,
      enableQuickSave,
      enableDocking,
      enableDevelopFeature,
      enableOldToolBar,
      lotteryMode,
      isFirstSetup,
    };
  },
  {
    persist: true,
  }
);
