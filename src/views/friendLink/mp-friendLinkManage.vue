<template>
  <div class="mp-friends">
    <div class="mp-friends__header">
      <div class="header-filter">
        <mp-friends-filter v-model="filters" />
      </div>
      <div class="header-button">
        <n-space>
          <!-- 新增 -->
          <n-button type="primary" @click="addOrEdit = true">新增</n-button>
          <n-button type="info" @click="filterFriends(true)">筛选</n-button>
          <n-button type="error" :disabled="!dels?.length" @click="preDeleteFriends(dels, true)">批量删除</n-button>
        </n-space>
      </div>
    </div>
    <div class="mp-friends__body">
      <n-data-table
        remote
        :columns="columns"
        :data="friends"
        :pagination="pagination"
        :row-key="(row) => row._id"
        @update:checked-row-keys="handleCheck"
      />
    </div>
    <!-- 新增修改弹窗 -->
    <n-modal v-model:show="addOrEdit" style="width: 50%" preset="dialog" title="友链管理">
      <mp-friend-manager v-model:modelValue="friendLinkItem" style="height: 75vh; padding: 2vw; overflow-y: scroll" />
      <n-space justify="end">
        <n-button type="warning" @click="addOrEdit = false">取消</n-button>
        <n-button type="success" @click="saveFriendLink()">保存</n-button>
      </n-space>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h } from 'vue'
import { useDialog, NSpace, NButton, useMessage, NBadge, DataTableColumns } from 'naive-ui'
import { useRouter } from 'vue-router'
import { useStore } from '@/store/'
import { friendLinkSchema } from '@/types/'
import { formatDate } from '@/utils/formatDate'
import mpFriendsFilter from './Components/mp-friends-filter.vue'
import mpFriendManager from './Components/mp-friend-manager.vue'
import api from '@/api/'
const $store = useStore()
const $router = useRouter()
const $dialog = useDialog()
const $message = useMessage()
const publish = ref()
const show = ref(false)
const pagination = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  itemCount: 0,
  pageSizes: [10, 20, 50, 100],
  onChange: (page: number) => {
    pagination.page = page
    getFriends()
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
    getFriends()
  }
  // prefix({ itemCount }) {
  //   return `Total is ${itemCount}.`
  // }
})
const dels = ref<string[]>()
const friends = ref<Partial<friendLinkSchema['res']>[]>()
const article = ref<Partial<friendLinkSchema['res']>>()
const filters = ref({
  siteName: undefined,
  siteLink: undefined,
  groupId: undefined,
  status: undefined
})

const columns: DataTableColumns = [
  {
    type: 'selection'
  },
  {
    title: '网站名称',
    key: 'siteName',
    width: 200,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '分组名称',
    key: 'groupName'
  },
  {
    title: '网站链接',
    key: 'siteLink',
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '网站状态',
    key: 'status',
    render(row) {
      const status = ['申请中', '已通过', '未通过', '已删除']
      // 返回不同颜色
      return h('span', null, status.at(<number>row.status))
    }
  },
  {
    title: '排序',
    key: 'sort'
  },
  {
    title: '操作',
    key: 'handle',
    width: 200,
    render(row) {
      const applyPass = h(
        NButton,
        {
          text: true,
          type: 'info',
          size: 'tiny',
          onClick: () => {
            // 确认框
            $dialog.success({
              title: '确认',
              content: '交个朋友吗？',
              positiveText: '确认',
              onPositiveClick: async () => {
                const { status } = await api.passFriend({ id: row._id })
                if (status === 200) {
                  $message.success('成功交到新朋友!')
                  getFriends()
                }
              }
            })
          }
        },
        '通过'
      )
      // 不通过
      const noPass = h(
        NButton,
        {
          text: true,
          type: 'warning',
          size: 'tiny',
          onClick: () => {
            $dialog.warning({
              title: '确认',
              content: '友尽？',
              positiveText: '确认',
              onPositiveClick: async () => {
                const { status } = await api.rejectFriend({ id: row._id })
                if (status === 200) {
                  $message.success('希望你不是冲动!')
                  getFriends()
                }
              }
            })
          }
        },
        '不通过'
      )

      return h(NSpace, null, {
        default: () => {
          return [
            row.status === 0 ? applyPass : null,
            row.status === 0 ? noPass : null,
            h(
              NButton,
              {
                text: true,
                size: 'tiny',
                type: 'info',
                onClick: () => {
                  // 使用新增组件
                  friendLinkItem.value = row
                  addOrEdit.value = true
                }
              },
              {
                default: () => '编辑'
              }
            ),
            h(
              NButton,
              {
                text: true,
                size: 'tiny',
                type: 'error',
                onClick() {
                  preDeleteFriends(row)
                }
              },
              {
                default: () => '删除'
              }
            )
          ]
        }
      })
    }
  }
]
getFriends()
function getFriends() {
  // 判断是否存在筛选条件
  const filter = Object.keys(filters.value).some((key) => {
    const cur = filters.value[key as keyof typeof filters.value]
    return cur !== undefined && cur !== null && cur !== ''
  })
  if (filter) filterFriends()
  else fetchFriends()
}
// 直接获取文档列表
async function fetchFriends() {
  const params: any = {
    page: pagination.page,
    limit: pagination.pageSize
  }
  const { status, data, total } = await api.getFriendList(params)
  if (status === 200) {
    friends.value = translateGroup(data)
    pagination.itemCount = total as number
  }
}
// 筛选文档
async function filterFriends(btnTrigger?: boolean) {
  // btnTrigger 为 true 时，表示点击了搜索按钮
  if (btnTrigger) pagination.page = 1
  const params: any = {}
  for (let key in filters.value) {
    const k = key as keyof typeof filters.value
    if (filters.value[k] !== undefined && filters.value[k] !== null && filters.value[k] !== '') {
      params[k] = filters.value[k]
    }
  }
  // 请求数据
  const { status, data, total } = await api.getFriendList({
    ...params,
    page: pagination.page,
    limit: pagination.pageSize
  })
  if (status === 200) {
    friends.value = translateGroup(data)
    pagination.itemCount = total as number
  }
}

// 翻译分组
function translateGroup(list: Array<any>) {
  // 从store获取分组列表 name _id
  const groupList = $store.state.friendGroups
  return list.map((item) => {
    // 翻译分组
    const group = groupList.find((group) => group._id === item.groupId)
    return {
      ...item,
      groupName: group ? group.name : '未分组'
    }
  })
}

function handleCheck(val: any) {
  dels.value = val
}
function updateShow(val: boolean) {
  show.value = val
}
function updateArticleInfo(info: Partial<friendLinkSchema['res']>) {
  article.value = Object.assign(article.value, info)
}

async function deleteFriends(dels: any) {
  // 如果dels是数组则拼接成字符串
  const delIds = Array.isArray(dels) ? dels.join(',') : dels
  const { status } = await api.deleteFriend({
    id: delIds
  })
  if (status === 200) {
    $message.success('删除成功')
    getFriends()
  }
}
function preDeleteFriends(dels: any, batch: boolean = false) {
  $dialog.warning({
    title: '警告',
    content: '您确定删除么？',
    positiveText: '确定',
    negativeText: '再想想',
    onPositiveClick() {
      const id = batch ? dels : dels._id
      deleteFriends(id)
    }
  })
}

// 管理友链
let addOrEdit: boolean = ref<boolean>()
let friendLinkItem = ref({
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
function saveFriendLink() {
  const { _id, siteName, siteLink, siteAvatar, siteDescribe, sort, email, groupId, status } = friendLinkItem.value
  const params: any = {
    _id,
    siteName,
    siteLink,
    siteAvatar,
    siteDescribe,
    sort,
    email,
    groupId,
    status
  }
  // 插入或更新 insertOrUpdate
  api.insertOrUpdate(params).then((res) => {
    if (res.status === 200) {
      $message.success('保存成功')
      addOrEdit.value = false
      getFriends()
    }
  })
}
</script>

<style lang="scss">
.mp-friends {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;

    .header-filter {
      width: 80%;
      flex: 0 1 auto;
    }

    .header-button {
      flex: 0 1 auto;
    }
  }
}
</style>
