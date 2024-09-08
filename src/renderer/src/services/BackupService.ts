import Dexie from 'dexie'
import { importData } from './DataService'

export class AppBackupDatabase extends Dexie {
  private static _instance: AppBackupDatabase

  backup!: Dexie.Table<any, number>

  constructor() {
    super('AppBackupDatabase')
    this.version(1).stores({
      backup: '++id, timestamp'
    })
  }

  public static getInstance(): AppBackupDatabase {
    if (!AppBackupDatabase._instance) {
      AppBackupDatabase._instance = new AppBackupDatabase()
    }
    return AppBackupDatabase._instance
  }

  public async getLatestBackup() {
    return this.backup.orderBy('timestamp').last()
  }

  public async addBackup(data: any) {
    return this.backup.add(data)
  }

  public async deleteBackup(id: number) {
    return this.backup.delete(id)
  }

  public async restoreBackup(id: number) {
    const data = await this.backup.get(id)
    if (data) {
      await importData(data)
    }
    throw new Error('备份不存在')
  }
}

export default AppBackupDatabase.getInstance()
