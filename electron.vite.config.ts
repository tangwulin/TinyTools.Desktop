import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import { execSync } from 'child_process'

const revision = execSync('git rev-parse HEAD').toString().trim().substring(0, 7)
const githubSHA = execSync('git rev-parse HEAD').toString().trim().toString()
process.env.revision = revision
process.env.githubSHA = githubSHA

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
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
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __GITHUB_SHA__: JSON.stringify(process.env.githubSHA),
      __REVISION__: JSON.stringify(process.env.revision)
    }
  }
})
