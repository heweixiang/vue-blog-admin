/**
 * @desc 友链管理
 * @author touchfish
 */

import http from '@/http/'
import { friendLinkGroupSchema, friendLinkSchema, httpRes } from '@/types/'
type REQ = friendLinkGroupSchema['req']
export default {
  // 获取友链分组列表
  getFriendGroupList<RES = friendLinkGroupSchema['res']>(payload?: REQ): Promise<httpRes<RES[]>> {
    return http('get', '/api/front/friendLinkGroup/List', payload)
  },
  // 获取友链列表
  getFriendList<RES = friendLinkSchema['res']>(payload?: REQ): Promise<httpRes<RES[]>> {
    return http('get', '/api/admin/friendLink/list', payload)
  },
  // 删除友链<可批量>,传入id字符串
  deleteFriend<RES = any>(payload: REQ): Promise<RES> {
    return http('delete', '/api/admin/friendLink/delete', payload)
  },
  // 通过友链
  passFriend<RES = any>(payload: REQ): Promise<RES> {
    return http('put', '/api/admin/friendLink/pass', payload)
  },
  // 拒绝友链
  rejectFriend<RES = any>(payload: REQ): Promise<RES> {
    return http('put', '/api/admin/friendLink/reject', payload)
  },
  // 插入或更新
  insertOrUpdate<RES = any>(payload: REQ): Promise<RES> {
    return http('post', '/api/admin/friendLink/insertOrUpdate', payload)
  }
}
