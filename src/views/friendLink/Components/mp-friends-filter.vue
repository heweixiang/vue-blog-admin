<template>
  <div class="mp-friend-filter">
    <n-form inline :label-width="60" :model="conditions">
      <n-form-item label="网站标题：">
        <n-input v-model:value="conditions.siteName" placeholder="请输入标题或正文内容" />
      </n-form-item>
      <n-form-item label="网站链接：">
        <n-input v-model:value="conditions.siteLink" placeholder="网站链接" />
      </n-form-item>
      <n-form-item label="分组：" path="original">
        <n-select v-model:value="conditions.groupId" :options="friendGroups" clearable />
      </n-form-item>
      <n-form-item label="状态：" path="original">
        <n-select v-model:value="conditions.status" :options="friendLinkStatusList" clearable />
      </n-form-item>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { friendLinkSchema } from '@/types/'
import { useStore } from '@/store/'
const $store = useStore()
interface propsType {
  modelValue: Partial<friendLinkSchema['req']>
}
interface emitType {
  (e: 'update:modelValue', value: Partial<friendLinkSchema['req']>): void
}
defineProps<propsType>()
const emits = defineEmits<emitType>()
const conditions = ref({
  siteName: undefined,
  siteLink: undefined,
  groupId: undefined,
  status: undefined
})
watch(conditions.value, () => {
  emits('update:modelValue', conditions.value)
})
const friendLinkStatusList = [ // 状态: 0: 申请中 1: 已通过 2: 未通过 -1: 已删除
  { label: '申请中', value: 0 },
  { label: '已通过', value: 1 },
  { label: '未通过', value: 2 },
  { label: '已删除', value: -1 }
]
const friendGroups = $store.state.friendGroups.map((item) => {
  return {
    label: item.name,
    value: item._id
  }
})
</script>

<style lang="scss">
.mp-friend-filter {
  .n-form {
    .n-form-item {
      width: 200px;
      margin-right: 12px;
    }
  }
}
</style>
