<script lang="ts" setup>
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 云间清醒梦 from '../../../assets/images/ArknightUI/activity/云间清醒梦.jpg'
import 夏日嘉年华 from '../../../assets/images/ArknightUI/activity/夏日嘉年华.jpg'
import 多利的任务单 from '../../../assets/images/ArknightUI/activity/多利的任务单.jpg'
import 引领者试炼 from '../../../assets/images/ArknightUI/activity/引领者试炼.jpg'
import 氤氲奇境 from '../../../assets/images/ArknightUI/activity/氤氲奇境.jpg'
import 火山旅梦 from '../../../assets/images/ArknightUI/activity/火山旅梦.jpg'
import 绿野幻梦 from '../../../assets/images/ArknightUI/activity/绿野幻梦.jpg'

import newsLabel from '../../../assets/images/ArknightUI/news-label.png'

//TODO:把这个东西拆出去到一个JSON文件里
const activityList = [
  {
    name: '多利的任务单',
    bannerImg: 多利的任务单
  },
  {
    name: '火山旅梦',
    bannerImg: 火山旅梦
  },
  {
    name: '绿野幻梦',
    bannerImg: 绿野幻梦
  },
  {
    name: '夏日嘉年华',
    bannerImg: 夏日嘉年华
  },
  {
    name: '氤氲奇境',
    bannerImg: 氤氲奇境
  },
  {
    name: '引领者试炼',
    bannerImg: 引领者试炼
  },
  {
    name: '云间清醒梦',
    bannerImg: 云间清醒梦
  }
]
</script>

<template>
  <div class="news-banner">
    <img :src="newsLabel" alt="news label" class="label" />
    <Swiper
      :autoplay="{ delay: 4000, disableOnInteraction: false }"
      :modules="[Autoplay, Pagination]"
      :pagination="{
        clickable: true
      }"
      :space-between="30"
      :speed="800"
      loop
    >
      <SwiperSlide v-for="item in activityList" :key="item.name">
        <img :alt="item.name" :src="item.bannerImg" class="banner-image" />
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<style lang="scss" scoped>
.news-banner {
  position: relative;
  width: 290px;
  pointer-events: auto;
}

.label {
  position: absolute;
  z-index: 10;
  top: -4px;
  left: -5px;
  width: 40%;
}

.banner-image {
  display: block;
  width: 100%;
  height: 110px;
  object-fit: cover;
}

.swiper {
  :deep(.swiper-pagination) {
    display: flex;
    margin-top: 5px;
    position: static;
  }

  :deep(.swiper-pagination-bullet) {
    margin: 0;
    height: 5px;
    flex-grow: 1;
    border-radius: 0;
    opacity: 1;
    background-color: #ffffff;

    &:not(:last-child) {
      margin-right: 6px;
    }
  }

  :deep(.swiper-pagination-bullet-active) {
    background-color: #ff9919;
  }
}
</style>
