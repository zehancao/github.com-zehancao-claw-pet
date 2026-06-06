# 🦞 Claw Desktop Pet

openclaw 官方吉祥物 claw 的桌面宠物。

一只会果冻弹跳的红色小龙虾，趴在你的桌面上，陪你聊聊天。

![screenshot](https://docs.openclaw.ai/logo.svg)

## 适用人群

> **⚠️ 已部署 [OpenClaw](https://github.com/openclaw/openclaw) 的用户专属**

桌面宠通过本地的桥接服务（`xia-bridge.mjs`，端口 19999）与 OpenClaw 通信，需要 OpenClaw 环境支持。

## 安装

### 方式一：下载 .dmg（推荐）

1. 前往 [Releases](https://github.com/zehancao/github.com-zehancao-claw-pet/releases) 下载最新版
2. 打开 `.dmg`，将 **Claw Pet** 拖进 Applications
3. 双击打开 🦞

> 首次打开可能被 Gatekeeper 拦截：**系统设置 → 隐私与安全性 → 仍要打开**

### 方式二：从源码运行

```bash
git clone https://github.com/zehancao/github.com-zehancao-claw-pet.git
cd clawd-pet
npm install
npm start
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
| ✨ **趣味反馈** | 浮动文字、三连击彩蛋、危险词惊恐反应 |
| 🌙 **深夜模式** | 凌晨 0-5 点自动问候 |
| 😊 **表情状态** | 开心 / 思考 / 犯困 / 惊讶，眼睛联动 |
| 👁️ **自然眨眼** | 随机间隔眨眼睛 |

## 彩蛋

- **快速点 3 下龙虾** → 分身术！✨
- **输入"吃龙虾""蒸龙虾"等** → 惊恐抖动 😰
- **拖拽松手** → 随机飘出心情文字

## 构建

```bash
npm run build        # 打包 macOS .dmg
npm run build:win    # 打包 Windows .exe
```

## 技术栈

- [Electron](https://www.electronjs.org/)
- [OpenClaw](https://github.com/openclaw/openclaw)
- [Agency Agents](https://github.com/msitarzewski/agency-agents) — UI Designer + Whimsy Injector

## License

MIT
