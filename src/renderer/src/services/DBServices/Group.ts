import db from '../../db'
import { Group } from '../../types/group'
import { DynamicListConfig, getDynamicList } from '../../utils/DBUtil'

export const getGroupList = async () => await db.groups.toArray()
export const getDynamicGroupList = <E>(config?: DynamicListConfig<Group, E>) =>
  getDynamicList(db.groups, config)

export const getGroup = async (id: number) => await db.groups.get(id)

export const addGroup = async (group: Group) => await db.groups.add(group)

export const updateGroup = async (id: number, group: Group) => await db.groups.update(id, group)

export const deleteGroup = async (id: number) =>
  db.transaction('rw', db.groups, db.rateHistories, async () => {
    db.groups.delete(id)
    db.rateHistories.where('ownerId').equals(id).delete()
  })
/**
 * 从所有小组中删除指定成员
 * (外层事务需要将db.groups加入作用域)
 * @param personId
 */
export const deleteMemberByIdFromAllGroups = async (personId: number) =>
  db.transaction('rw', db.groups, async () => {
    await db.groups
      .filter((group) => group.memberIds.includes(personId))
      .modify((group) => {
        group.memberIds = group.memberIds.filter((memberId) => memberId !== personId)
      })
  })
