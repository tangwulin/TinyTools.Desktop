<br />
<p style="text-align: center;">
<a href="https://github.com/tangwulin/TinyTools.Desktop" target="blank">
    <img src="logo.png" alt="Logo" style="height: 16em">
  </a>
  <h2 style="text-align: center;font-weight: 600">TinyTools</h2>

  <p style="text-align: center;">
    一个班级管理工具集
    <br />
    <a href="#%EF%B8%8F-安装" target="blank"><strong>📦️ 下载安装包</strong></a>&nbsp;&nbsp;|&nbsp;&nbsp;
    <a href="https://qm.qq.com/cgi-bin/qm/qr?k=uzG7G5F3KZHdTiM4iLhpu-75XjFDHLLp&jump_from=webapi&authKey=buoIUVnbAl04s8AdlaApJAV94ZjnU12GwPz7M0iEPrNe6UXchAAIIJ37VSguYBIk" target="blank"><strong>💬 加入交流群</strong></a>
    <br />
    <br />
  </p>

## ✨ 特性

[//]: # (- ✈️ 使用WebWorker处理数据，拒绝慢、卡 ~~（当然要是你的机器太差也没办法）~~)
- ✅ 使用 Vue+Vite 开发，轻量、快速
- ⚙️ 全新编写的多种抽选算法，支持公平抽选
- 🎶 内置数十首坤曲 ~~增添一些抽座位时的乐趣~~
- 📃 内含随机抽选工具
- 🛠  更多特性开发中

## 📦️ 安装

[//]: # (Tauri 版本目前仅支持 Windows。（有谁要ubuntu和macos的可以发个issue&#41;)

[//]: # ()
[//]: # (已知Bug：无法拖动座位（这个锅是Webview2的，我不背）)

访问本项目的 [Releases](https://github.com/tangwulin/TinyTools.Desktop/releases)
页面下载安装包。

## 🔧 开发
### 初始化项目和依赖

```sh
pnpm install
```

### 开发

```sh
pnpm dev
```

### 构建

```bash
# For windows
pnpm build:win_x64

# For macOS
pnpm build:mac

# For Linux
pnpm build:linux
```

## 👷‍♂️ 打包客户端


如果在 Release 页面没有找到适合你的设备的安装包的话，你可以根据下面的步骤来打包自己的客户端。


1. 打包 Electron 需要用到 Node.js 和 Pnpm。可前往 [Node.js 官网](https://nodejs.org/zh-cn/) 下载安装包。安装 Node.js

   后可在终端里执行 `npm install -g pnpm` 来安装 Pnpm。


2. 使用 `git clone --recursive https://github.com/tangwulin/TinyTools.Desktop.git` 克隆本仓库到本地。


3. 使用 `pnpm install` 安装项目依赖。

4. 选择下列表格的命令来打包适合的你的安装包，打包出来的文件在 `/dist` 目录下。了解更多信息可访问 [electron-builder 文档](https://www.electron.build/cli)

| 命令                                       | 说明                      |
| ------------------------------------------ | ------------------------- |
| `pnpm build:win_ia32`  | Windows 32 位             |
| `pnpm build:win_arm64` | Windows ARM               |


## ☑️ Todo

查看 Todo 请访问本项目的 [Projects](https://github.com/tangwulin/TinyTools.Desktop/projects/1)

欢迎提 Issue 和 Pull request。

## 📜 开源许可

本项目仅供个人学习研究使用，禁止用于商业及非法用途。

基于 [MIT license](https://opensource.org/licenses/MIT) 许可进行开源。

## 🖼️ 截图

（暂时没有，有空补上）

## ❤️ 开源项目鸣谢（排名不分先后）
- [NaiveUI](https://github.com/tusen-ai/naive-ui)
- [Electron-vite](https://github.com/alex8088/electron-vite)
- [modern-screenshot](https://github.com/qq15725/modern-screenshot)
- [仿明日方舟UI](https://github.com/lxchapu/arknights)
