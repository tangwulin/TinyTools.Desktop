import { sentryVitePlugin } from '@sentry/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { execSync } from 'child_process'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'

const revision = execSync('git rev-parse HEAD').toString().trim().substring(0, 7)
const githubSHA = execSync('git rev-parse HEAD').toString().trim().toString()
process.env.revision = revision
process.env.githubSHA = githubSHA

export default ({ mode }) => {
  return defineConfig({
    main: {
      build: {
        sourcemap: true
      },
      plugins: [
        visualizer({ filename: 'visualizer_main.html', template: 'treemap' }),
        externalizeDepsPlugin(),
        mode === 'production' || mode === 'prod'
          ? sentryVitePlugin({
              org: 'aurora-studio',
              project: 'electron'
            })
          : undefined
      ]
    },

    preload: {
      build: {
        sourcemap: true
      },
      plugins: [
        visualizer({ filename: 'visualizer_preload.html', template: 'treemap' }),
        externalizeDepsPlugin(),
        mode === 'production' || mode === 'prod'
          ? sentryVitePlugin({
              org: 'aurora-studio',
              project: 'electron'
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
              project: 'electron'
            })
          : undefined
      ],
      assetsInclude: ['**/*.xlsx'],
      build: {
        chunkSizeWarningLimit: 1500,
        sourcemap: true
      },
      define: {
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
        __GITHUB_SHA__: JSON.stringify(process.env.githubSHA),
        __REVISION__: JSON.stringify(process.env.revision)
      }
    }
  })
}
