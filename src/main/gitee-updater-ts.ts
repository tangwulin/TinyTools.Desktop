import type { CustomPublishOptions, UpdateInfo } from 'builder-util-runtime'
import { ResolvedUpdateFileInfo } from 'electron-updater'
import { BaseUpdater } from 'electron-updater/out/BaseUpdater'
import { Provider, resolveFiles } from 'electron-updater/out/providers/Provider'
import * as yaml from 'js-yaml'

function findSuitableRelease(releases: any[], allowPrerelease: boolean): any {
  if (!releases.length) return

  for (const release of releases) {
    if (release.prerelease && !allowPrerelease) continue
    return release
  }

  return releases[0]
}

interface GiteeUpdaterConfig {
  repo: string
  updateManifest: string
}

export class GiteeProvider extends Provider<UpdateInfo> {
  config: GiteeUpdaterConfig
  updater: BaseUpdater

  constructor(options: CustomPublishOptions, updater: any, runtimeOptions: any) {
    super(runtimeOptions)
    this.config = <GiteeUpdaterConfig>(<any>options).config
    this.updater = <BaseUpdater>updater
  }

  async fetchReleases() {
    let apiEndpointUrl = new URL(`https://gitee.com/api/v5/repos/${this.config.repo}/releases`)
    let response = (await this.httpRequest(apiEndpointUrl)) ?? ''
    let result = <any[]>JSON.parse(response)
    return result.reverse()
  }

  async getLatestVersion(): Promise<UpdateInfo> {
    let allowPrerelease = this.updater.allowPrerelease

    let suitableRelease = await this.fetchReleases().then((x) =>
      findSuitableRelease(x, allowPrerelease)
    )

    let baseUrl = new URL(suitableRelease['assets'][0].browser_download_url)
    let urlOfManifest = new URL(this.config.updateManifest, baseUrl)
    let manifest = await this.httpRequest(urlOfManifest)

    let result = yaml.load(manifest)

    result['releaseName'] = suitableRelease['name']
    result['releaseNotes'] = suitableRelease['body']
    result['baseUrl'] = baseUrl

    return <UpdateInfo>result
  }

  resolveFiles(updateInfo: UpdateInfo): ResolvedUpdateFileInfo[] {
    return resolveFiles(updateInfo, updateInfo['baseUrl'])
  }
}

export function createGiteeUpdaterOptions(config: GiteeUpdaterConfig): CustomPublishOptions {
  return {
    provider: 'custom',
    updateProvider: GiteeProvider,
    config
  }
}
