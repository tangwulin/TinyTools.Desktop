<!--suppress SpellCheckingInspection, SpellCheckingInspection -->
<script setup>
import { computed, h, onMounted, ref } from 'vue'
import { PlaylistAdd, Refresh } from '@vicons/tabler'
import { InfoFilled } from '@vicons/material'
import { useSettingStore } from '@/stores/setting'
import { NButton, NCard, NDataTable, NForm, NModal, useMessage } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { generateUniqueId, getDefaultBgm } from '@/assets/script/musicHelper'
import { debounce } from 'lodash-es'

const message = useMessage()
const setting = useSettingStore()
const { bgms, isBGMInitialized } = storeToRefs(setting)

const showEditModal = ref(false)
const formData = ref({ name: '', url: '', offset: 0, uniqueId: '' })
const tableHeight = ref(200)
const dtKey = ref(Math.random())

onMounted(() => {
  tableHeight.value = document.getElementById('bgmSettingContainer').clientHeight - 80
})

window.addEventListener('resize', debounce(() => {
  tableHeight.value = document.getElementById('bgmSettingContainer').clientHeight - 80
}, 200))

const addHandler = () => {
  showEditModal.value = true
}
const playHandler = (row) => {
  const player = document.getElementById('player')
  player.src = row.url
  player.currentTime = row.offset
  player.volume = 0.5
  player.play()
}
const editHandler = (row) => {
  formData.value = { ...row }
  isEdit = true
  showEditModal.value = true
}
const deleteHandler = (row) => {

  bgms.value = bgms.value.filter(item => item.uniqueId !== row.uniqueId)
  message.success('删除成功')
}
const handler = () => {
  if (!isEdit) bgms.value.push({ ...formData.value, uniqueId: generateUniqueId() })
  else
  {
    bgms.value = bgms.value.map(item => {
      if (item.uniqueId === formData.value.uniqueId)
      {
        return formData.value // 使用展开语法更新 title 属性
      }
      return item // 非匹配的元素保持原样
    })
  }
  message.success(cardTitle.value + '成功')
  showEditModal.value = false
}

let isEdit = false
const cardTitle = computed(() => {return isEdit ? '编辑' : '添加'})

if (bgms.value.length === 0 && !isBGMInitialized.value)
{
  isBGMInitialized.value = true
  bgms.value = getDefaultBgm()
}

const createColumns = (play, edit, del) => {
  return [
    {
      title: '歌曲名',
      key: 'name',

    },
    {
      title: '开始时间（秒）',
      key: 'offset',
    },
    {
      title()
      {
        return h(
            'div',
            { class: 'flex items-center justify-between' },
            [
              h(
                  'div',
                  { class: 'ml-2', innerHTML: '操作' }
              ),
              h(
                  NButton,
                  {
                    strong: true,
                    type: 'warning',
                    size: 'small',
                    class: 'p-2',
                    renderIcon: () => {return h(Refresh)},
                    onClick: () => {
                      bgms.value = getDefaultBgm()
                      message.success('重置成功')
                    }
                  },
                  { default: () => '重置' }
              ),
              h(
                  NButton,
                  {
                    strong: true,
                    type: 'primary',
                    size: 'small',
                    class: 'p-2',
                    renderIcon: () => {return h(PlaylistAdd)},
                    onClick: addHandler
                  },
                  { default: () => '添加' }
              ),
            ])
      },
      key: 'actions',
      width: 200,
      render(row)
      {
        return h('div', { class: 'flex flex-row' }, [
          h(
              NButton,
              {
                strong: true,
                tertiary: true,
                size: 'small',
                onClick: () => play(row)
              },
              { default: () => '播放' }
          ),
          h(
              NButton,
              {
                strong: true,
                tertiary: true,
                size: 'small',
                onClick: () => edit(row)
              },
              { default: () => '编辑' }
          ),
          h(
              NButton,
              {
                strong: true,
                tertiary: true,
                size: 'small',
                onClick: () => del(row)
              },
              { default: () => '删除' }
          )
        ])
      }
    }
  ]
}

const columns = createColumns(playHandler, editHandler, deleteHandler)
const rules = {
  name: [
    {
      required: true
    }
  ],
  url: [
    {
      required: true,
      validator(rule, value)
      {
        if (!value)
        {
          return new Error('需要填写链接')
        }
        else if (!/^(?:(http|https|ftp):\/\/)?((|[\w-]+\.)+[a-z0-9]+)(?:(\/[^/?#]+)*)?(\?[^#]+)?(#.+)?$/i.test(value))
        {
          return new Error('链接不合法')
        }
        return true
      },
      trigger: ['input', 'blur']
    }
  ]
}
</script>

<template>
  <n-data-table
      :columns="columns"
      :data="bgms"
      :pagination="false"
      :bordered="false"
      :max-height="tableHeight"
      :key="dtKey"
  >
  </n-data-table>
  <n-modal :show="showEditModal">
    <n-card
        style="width: 50%"
        :title="cardTitle"
        :bordered="true"
        size="small"
        closable
        @close="showEditModal=false"
    >

      <n-form
          :label-width="80"
          :model="formData"
          :rules="rules"
      >
        <n-form-item label="歌曲名" path="name">
          <n-input v-model:value="formData.name" placeholder=""/>
        </n-form-item>
        <n-form-item label="直链地址" path="url">
          <n-input v-model:value="formData.url" placeholder=""/>
          <n-popover trigger="hover" placement="right" :duration="500">
            <template #trigger>
              <n-button text>
                <template #icon>
                  <n-icon>
                    <info-filled/>
                  </n-icon>
                </template>
              </n-button>
            </template>
            <span>eg:网易云音乐外链格式：https://music.163.com/song/media/outer/url?id={歌曲id}.mp3</span>
          </n-popover>
        </n-form-item>
        <n-form-item label="开始时间（秒）" path="offset">
          <n-input-number v-model:value="formData.offset" clearable/>
        </n-form-item>
      </n-form>
      <div class="flex justify-end">
        <n-button
            type="primary"
            :disabled="!(formData.url.length!==0&&formData.name.length!==0)"
            @click="handler">保存
        </n-button>
      </div>
    </n-card>
  </n-modal>
</template>

<style scoped>

</style>