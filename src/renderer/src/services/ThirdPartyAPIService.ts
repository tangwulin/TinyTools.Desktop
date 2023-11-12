import { type ElectronAPI } from '@electron-toolkit/preload'
import { ClassInfo } from '../interface/classInfo'
import { Course } from '../interface/course'
import { School } from '../interface/school'

const electron = window.electron as ElectronAPI

export class ThirdPartyAPIService {
  mac: string
  classId?: number
  protected apiUrl: string

  constructor(apiUrl: string, mac: string) {
    this.apiUrl = apiUrl
    this.mac = mac
  }

  public static async getSchoolList(): Promise<School[]> {
    return electron.ipcRenderer.invoke('getSchoolList')
  }

  public setApiUrl(apiUrl: string) {
    this.apiUrl = apiUrl
  }

  public setMac(mac: string) {
    if (mac.length !== 12) {
      // 12 hex digits
      throw new Error('Invalid MAC address')
    } else {
      this.mac = mac
    }
  }

  public setClassId(classId: number) {
    if (classId < 0) {
      throw new Error('Invalid class ID')
    } else {
      this.classId = classId
    }
  }

  public async initClassInfo(): Promise<ClassInfo> {
    return electron.ipcRenderer
      .invoke('initClassInfo', [this.apiUrl, this.mac])
      .then((classInfo: ClassInfo) => {
        this.classId = classInfo.classId
        return classInfo
      })
  }

  public async getCourseList(): Promise<Course[]> {
    return electron.ipcRenderer.invoke('getCourseList', [this.apiUrl, this.classId])
  }
}
