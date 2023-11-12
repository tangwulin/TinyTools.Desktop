import { AppDatabase } from '../db'

const db = AppDatabase.getInstance()

//TODO:处理星期天的复杂情况
export const getTodayCourse = () => db.coursesTable.where('on').equals(new Date().getDay()).first()

export const getCourseByWeek = (week: number) => db.coursesTable.where('on').equals(week).first()
export const getAllCourse = () => db.coursesTable.toArray()
