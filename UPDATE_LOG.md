# Updater Log

## v3.99.1-beta.4

- feat: 提取公共方法
- feat: 增加设置项
- feat: 增加无头像时的fallback
- feat: 增加无头像时的fallback
- fix: code style
- feat: 改用方括号访问属性值
- fix: code style
- feat: 把依赖打进一个js
- fix: 修复无法获取模板的bug（不知道为啥原生a标签不行
- feat: 自动导入
- feat: 统一由屏幕高度调整窗口大小（竖屏设备自求多福
- feat: 向导结束页层级调整
- feat: 统一保存的图片为4K分辨率
- fix: 修复模板无法获取的问题
- feat: 初始化向导优化
- feat: 值日表初步
- feat: 改个名字
- feat: 为配置向导-导入课程表增加重新导入功能
- feat: 为配置向导-分配座位增加抽选座位功能
- feat: 移除不需要的组件
- feat: (origin/dev) 一点小修改
- fix: 修复新抽选方式在外圈数量多于里面的情况下的问题
- feat: 更新pnpm-lock.yaml


## v3.99.1-beta.3
- feat: 增加讲台视角
- feat: 增加首次使用欢迎页面
- feat: 增加了一些设置
- feat: 增加了一些提示
- feat: 增加课程表相关功能

## v3.99.1-beta.2
- Release Workflow的测试罢了

## v3.99.1-beta.1
- feat: 转用Electron
- 这是一个大更新，但是我不想写更新日志（还是pre-release吧)

## v3.1.0
- feat: 添加了结算音乐功能
- 优化了触屏设备的使用体验

## v3.0.0
### 大更新！增加了历史记录功能，修复了 ~~（亿）~~ 一些Bug

- feat: 移除了图片格式的选择 ~~（因为新库实际上生成了个png嵌进svg，就没必要了）~~，改为选择分辨率
- feat: 在座位正在抽选时不允许拖动
- feat: 优化按钮辨识度
- fix: 禁止抽选过程中打开历史记录
- new: 添加新音乐：Usagi Flap ~~（sensei我啊）~~
- fix: 修复了未正确设置bgm初始化状态的问题
- fix: 修复了非正常情况下的问题
- fix: 修复初始化座位时的问题（这个问题坑我好惨
- fix: 修复预览时刷新页面会导致预览未正常退出的问题
- feat: 增加手动保存功能
- feat: 增加了拖动后自动保存和限流功能
- feat: 增加当前展示座位和实际座位提示
- feat: 在预览时锁定座位
- feat: 增加了显示当前座位和抽选时的抽选方式的功能
- fix: 修复多次退出预览时无法正常恢复的问题
- feat: **增加历史记录功能**
- fix: 去除不必要样式
- fix: 修复了调整窗口大小后部分设置显示不正常的情况
- fix: 增加指向tauri的链接
- fix: 修复自定义缩放和保存成功后提示不消失的问题


## v2.2.0

- fix: 修复了保存图片时样式错乱的问题
- feat: 增加了保存svg格式图片的功能
- feat: 增加了调整保存png时缩放的功能
- UI上的小调整

## v2.1.0

- fix: 修复Production时WebWorker无法使用的问题
- fix: 修复了无法更新的问题
- feat: 优化UI
- 增加了关于页面

## v2.0.6

- fix: 修正CI Workflow中的问题：pubkey多了个/n

## v2.0.5

- fix: 修正CI Workflow中的问题：更改包管理器为pnpm

## v2.0.4

- fix: 修复CI Workflow

## v2.0.3

- fix: 修复CI Workflow

## v2.0.2

- feat: 增加了自动更新功能

## v2.0.1

- fix: 修复抽卡时产生的问题
- feat: 使用展开语法改写逻辑

## v2.0.0

- feat: 增加了类似于抽卡的排座位流程

## v1.3.0

优化音乐时的随机算法
