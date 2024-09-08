import { sentryVitePlugin } from '@sentry/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { execSync } from 'child_process'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import Inspect from 'vite-plugin-inspect'

const revision = execSync('git rev-parse HEAD').toString().trim().substring(0, 7)
const githubSHA = execSync('git rev-parse HEAD').toString().trim().toString()
process.env.revision = revision
process.env.githubSHA = githubSHA
const now = new Date()
const year = now.getFullYear()
const month = now.getMonth()
const date = now.getDate()
const buildDate = `${year}/${month + 1}/${date}`
process.env.buildDate = buildDate

export default ({ mode }) => {
  return defineConfig({
    main: {
      build: {
        sourcemap: true,
        target: 'node16'
      },
      plugins: [
        visualizer({ filename: 'visualizer_main.html', template: 'treemap' }),
        externalizeDepsPlugin(),
        mode === 'production' || mode === 'prod'
          ? sentryVitePlugin({
              org: 'aurora-studio',
              project: 'electron',
              authToken: process.env.SENTRY_AUTH_TOKEN
            })
          : undefined
      ]
    },

    preload: {
      build: {
        sourcemap: true,
        target: 'node16'
      },
      plugins: [
        visualizer({ filename: 'visualizer_preload.html', template: 'treemap' }),
        externalizeDepsPlugin(),
        mode === 'production' || mode === 'prod'
          ? sentryVitePlugin({
              org: 'aurora-studio',
              project: 'electron',
              authToken: process.env.SENTRY_AUTH_TOKEN
            })
          : undefined
      ]
    },

    renderer: {
      resolve: {
        alias: {
          '@renderer': resolve('src/renderer/src')
        }
      },
      plugins: [
        Inspect(),
        visualizer({ filename: 'visualizer_renderer.html', template: 'treemap' }),
        vue(),
        AutoImport({
          imports: [
            'vue',
            {
              'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar']
            }
          ]
        }),
        Components({
          resolvers: [NaiveUiResolver()]
        }),
        mode === 'production' || mode === 'prod'
          ? sentryVitePlugin({
              org: 'aurora-studio',
              project: 'electron',
              authToken: process.env.SENTRY_AUTH_TOKEN
            })
          : undefined
      ],
      assetsInclude: ['**/*.xlsx'],
      build: {
        chunkSizeWarningLimit: 1500,
        sourcemap: true,
        target: 'es2022'
      },
      define: {
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
        __GITHUB_SHA__: JSON.stringify(process.env.githubSHA),
        __REVISION__: JSON.stringify(process.env.revision),
        __BUILD_DATE__: JSON.stringify(process.env.buildDate)
      }
    }
  })
}
