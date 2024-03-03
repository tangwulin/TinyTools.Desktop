<script setup lang="ts">
import { useDialog } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { schemaVersion, supportedSchemaVersion } from '../../config'
import backupDB from '../../services/BackupService'

const router = useRouter()

const dialog = useDialog()

const percentage = ref(0)

onMounted(async () => {
  const latestBackup = await backupDB.getLatestBackup()
  console.log(latestBackup)
  if (latestBackup) {
    percentage.value = 33
    if (latestBackup.version.schema < schemaVersion) {
      percentage.value = 66
      await backupDB.restoreBackup(latestBackup.id)
      fininshUpdate()
    }
    if (latestBackup.version.schema === schemaVersion) {
      fininshUpdate()
    }
    if (!supportedSchemaVersion.includes(latestBackup.version.schema)) {
      dialog.warning({
        title: '警告',
        content:
          '检测到备份文件的版本高于当前应用支持的版本，推测你可能降级安装了应用，请面对可能的数据丢失和应用工作异常',
        positiveText: '确定',
        onPositiveClick: () => {
          fininshUpdate()
        }
      })
    }
  } else {
    setTimeout(() => {
      fininshUpdate()
    }, 500)
  }
})

function fininshUpdate() {
  localStorage.setItem('updateFlag', String(false))
  percentage.value = 100
  router.push({ name: 'mainWindow' })
}
</script>

<template>
  <div class="flex justify-center items-center">
    <p>应用正在恢复数据，请稍侯……</p>
    <n-progress type="circle" :percentage="percentage" />
  </div>
</template>

<style scoped></style>
