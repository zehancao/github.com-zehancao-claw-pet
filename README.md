# 🦞 Claw Desktop Pet

OpenClaw 桌面伴侣宠物。一只会果冻弹跳的红色小龙虾，趴在你的桌面上，陪你聊聊天。

## 适用人群

> **⚠️ 已部署 [OpenClaw](https://github.com/openclaw/openclaw) 的用户专属**

桌面宠通过本地的桥接服务（`xia-bridge.mjs`，端口 19999）与 OpenClaw 通信，需要 OpenClaw 环境支持。

## 安装

### 方式一：下载 .dmg（推荐）

1. 前往 [Releases](https://github.com/zehancao/github.com-zehancao-claw-pet/releases) 下载最新版
2. 打开 `.dmg`，将 **Claw Pet** 拖进 Applications
3. 双击打开 🦞

> **macOS 首次打开提示"已损坏"：**
> 因为 Claw Pet 没有 Apple 开发者签名（$99/年），Gatekeeper 会拦截。
> 
> **解决方法一（终端）：**
> ```bash
> sudo xattr -d com.apple.quarantine /Applications/Claw\ Pet.app
> ```
> 
> **解决方法二（访达）：**
> 1. 打开访达 → 应用程序
> 2. 右键 Claw Pet → 选择"打开"
> 3. 点"仍然打开"
>
> 不是病毒，是开源软件，放心用。

### 方式二：从源码运行

```bash
git clone https://github.com/zehancao/github.com-zehancao-claw-pet.git
cd github.com-zehancao-claw-pet
npm install
npm start

> 关掉后重新启动，再跑一次 `npm start` 或 `npx electron .` 即可。
> 
> **卸载：** 关掉应用，直接删除项目文件夹 `rm -rf github.com-zehancao-claw-pet`，不留任何系统残留。
```

### 前提：运行桥接服务

```bash
node xia-bridge.mjs &
```

确保 `localhost:19999` 可访问。

## 功能

| 功能 | 说明 |
|------|------|
| 🦞 **浮动桌面** | 透明窗口，永远在最上层，不抢焦点 |
| 👆 **拖拽移动** | 按住龙虾拖动，松手有果冻弹跳回弹 |
| 💬 **点击聊天** | 点龙虾弹出输入框，走 OpenClaw 对话 |
| 🖥️ **打开终端** | 右键菜单 → 打开终端，直接进入 OpenClaw CLI |
| 🌐 **打开网页版** | 右键菜单 → 打开 `127.0.0.1:18789` 控制台 |
| 🕐 **报时特效** | 右键 → 报时，全屏彩色数字弹跳消散 |
| ✨ **分身术彩蛋** | 快速点 3 下龙虾，变出分身窗口随机位置 |
| 🌙 **深夜模式** | 凌晨 0-5 点自动问候 |
| 😊 **表情状态** | 开心 / 思考 / 犯困 / 惊讶，眼睛眨眼联动 |

## 右键菜单

```
🕐 报时              → 全屏时间特效
🖥️ 打开终端           → Terminal → openclaw CLI
🌐 打开网页版          → 浏览器 → 127.0.0.1:18789
🌀 分身全部召回       → 关掉所有分身窗口（有分身时才显示）
──
📌 隐藏到顶部栏       → 缩到顶栏 Tray 图标
──
🔁 重启 Claw         → 重启应用
──
🚪 退出              → 彻底退出
```

> 顶栏 Tray 图标点一下显示/隐藏窗口，右键出菜单。

## 彩蛋

- **快速点 3 下龙虾** → 分身术！变出随机位置的克隆窗口
- **输入"吃龙虾""蒸龙虾"等** → 惊恐抖动 😰
- **拖拽松手** → 随机飘出心情文字

## 构建

```bash
npm run build        # 打包 macOS .dmg
npm run build:win    # 打包 Windows .exe（需 Windows 环境）
```

## 技术栈

- [Electron](https://www.electronjs.org/)
- [OpenClaw](https://github.com/openclaw/openclaw)
- [Agency Agents](https://github.com/msitarzewski/agency-agents) — UI Designer + Whimsy Injector

## License

MIT
