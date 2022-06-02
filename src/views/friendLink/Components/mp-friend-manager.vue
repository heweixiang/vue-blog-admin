<template>
  <div>
    <n-form :model="conditions">
      <n-form-item label="网站名称：">
        <n-input v-model:value="conditions.siteName" placeholder="网站名称" />
      </n-form-item>
      <n-form-item label="网站链接：">
        <n-input v-model:value="conditions.siteLink" placeholder="网站链接" />
      </n-form-item>
      <!-- 头像 -->
      <n-form-item label="网站头像：" path="original">
        <n-input v-model:value="conditions.siteAvatar" placeholder="网站头像" />
      </n-form-item>
      <!-- 网站介绍 -->
      <n-form-item label="网站介绍：" path="original">
        <n-input v-model:value="conditions.siteDescribe" placeholder="网站介绍" />
      </n-form-item>
      <!-- 网站排序 -->
      <n-form-item label="网站排序：" path="original">
        <n-input v-model:value="conditions.sort" placeholder="网站排序" />
      </n-form-item>
      <!-- 网站邮箱 -->
      <n-form-item label="网站邮箱：" path="original">
        <n-input v-model:value="conditions.email" placeholder="网站邮箱" />
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
import { ref, watch, onMounted } from 'vue'
import { friendLinkSchema } from '@/types/'
import { useStore } from '@/store/'
const $store = useStore()
// props和emits

interface propsType {
  modelValue: Partial<friendLinkSchema['req']>
}
const props = withDefaults(defineProps<propsType>(), {
  modelValue: {
    type: Object,
    default: () => ({}),
    required: true
  }
})
interface emitType {
  (e: 'update:modelValue', value: Partial<friendLinkSchema['req']>): void
}
const emits = defineEmits<emitType>()
const conditions = ref({
  _id: '',
  siteName: undefined,
  siteLink: undefined,
  siteAvatar: undefined,
  siteDescribe: undefined,
  sort: undefined,
  email: undefined,
  groupId: undefined,
  status: undefined
})

onMounted(() => {
  if (props.modelValue) {
    conditions.value = props.modelValue
  }
})
// 同步 props 到 conditions
watch(
  () => props.modelValue,
  (val) => {
    Object.assign(conditions, val)
  }
)
watch(conditions.value, () => {
  emits('update:modelValue', conditions.value)
})
const friendLinkStatusList = [
  // 状态: 0: 申请中 1: 已通过 2: 未通过 -1: 已删除
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

<style lang="sass" scoped>
</style>