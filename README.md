# Claude Pet 🦀

一个可爱的 Electron 桌面宠物螃蟹，悬浮在屏幕上实时显示 Claude Code 的工作状态。

## 功能

- 实时监控 Claude Code 会话状态
- 螃蟹根据状态切换表情和动画：
  - **思考中** — 螃蟹冒出思考泡泡，身体微微脉动
  - **编码中** — 螃蟹张开嘴，上下弹跳
  - **执行命令** — 螃蟹左右摇晃
  - **完成** — 螃蟹眯眼微笑，蹦跳庆祝
  - **空闲** — 螃蟹轻轻浮动，等待指令
- 气泡提示随机显示状态文案
- 系统托盘驻留，双击托盘图标显示/隐藏

## 下载安装

前往 [Releases](https://github.com/Carliber/claude-pet/releases/latest) 下载最新版本：

1. 下载对应平台的压缩包
2. 解压到任意目录
3. 运行可执行文件启动

## 从源码运行

需要 Node.js >= 18：

```bash
npm install
npm start
```

## 打包

```bash
npm run build:win      # Windows x64
npm run build:mac      # macOS Intel
npm run build:mac-arm  # macOS Apple Silicon
```

打包产物输出到 `dist/` 目录。

## 工作原理

1. 启动后监听 `~/.claude/projects/` 目录下所有 JSONL 会话文件
2. 解析 JSONL 条目中的 `type`（assistant/user）和 `stop_reason`（tool_use/end_turn）
3. 聚合多个并发会话的状态，按优先级：编码 > 思考 > 完成 > 空闲
4. 将状态通过 IPC 推送到渲染进程，螃蟹实时更新表情和动画

## 项目结构

```
claude-pet/
├── src/
│   ├── main.js        # Electron 主进程 + JSONL 监听器
│   └── preload.js     # 上下文桥接
├── assets/
│   ├── pet.html       # Canvas 螃蟹渲染 + CSS 动画
│   └── icon.png       # 托盘图标
└── package.json
```

## 技术栈

- Electron 33
- Canvas 2D 绘图
- 原生 fs.watch 文件监听

## 致谢

灵感来源：[Joe-fly/claude-pet](https://github.com/Joe-fly/claude-pet)

## License

[AGPL-3.0](LICENSE)
