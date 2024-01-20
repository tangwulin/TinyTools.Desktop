import { sentryVitePlugin } from '@sentry/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { execSync } from 'child_process'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'

const revision = execSync('git rev-parse HEAD').toString().trim().substring(0, 7)
const githubSHA = execSync('git rev-parse HEAD').toString().trim().toString()
process.env.revision = revision
process.env.githubSHA = githubSHA

export default defineConfig({
  main: {
    build: {
      sourcemap: true
    },
    plugins: [
      externalizeDepsPlugin(),
      sentryVitePlugin({
        org: 'aurora-studio',
        project: 'electron'
      })
    ]
  },

  preload: {
    build: {
      sourcemap: true
    },
    plugins: [
      externalizeDepsPlugin(),
      sentryVitePlugin({
        org: 'aurora-studio',
        project: 'electron'
      })
    ]
  },

  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
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
      sentryVitePlugin({
        org: 'aurora-studio',
        project: 'electron'
      })
    ],
    assetsInclude: ['**/*.xlsx'],
    build: {
      chunkSizeWarningLimit: 1500,
      // rollupOptions: {
      //   output: {
      //     manualChunks(id) {
      //       if (id.includes('node_modules')) {
      //         return 'vendor'
      //       }
      //     }
      //   }
      // }
      sourcemap: true
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __GITHUB_SHA__: JSON.stringify(process.env.githubSHA),
      __REVISION__: JSON.stringify(process.env.revision)
    }
  }
})
