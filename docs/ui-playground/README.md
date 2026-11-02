# Palace UI Playground

独立 React + TypeScript + Tailwind v4 组件评审页面。所有 8 类在一个可搜索页面中展示；不替换 DSH 现有工作台。

## 运行

```sh
cd docs/ui-playground
npm ci
npm run dev -- --host 0.0.0.0 --port 3090
# 或生产预览
npm run build
npm run preview -- --host 0.0.0.0 --port 3090 --strictPort
```

预览地址：<http://127.0.0.1:3090/>。同局域网其他设备需使用此主机局域网 IP 和端口；不包含鉴权与公网部署，不应暴露敏感数据。构建文件在 [dist](dist/index.html)，可挂载到任意静态站点子路径（相对资源路径）。不修改已有 3080 / 3082 服务。

## 页面功能

- 全部 Foundation / Buttons / Inputs / Navigation / Surfaces / Feedback / AI / Data 集中展示。
- 左侧定位、组件搜索、无结果反馈；⌘ / Ctrl + K 命令面板，Tab 浏览命令、Enter 执行。
- 八态按钮矩阵与受控预览、密度切换和触控热区检查。
- 可操作弹窗、抽屉、Popover、Tooltip、Toast、排序表格、文件预览和进度。
- 本地 AI 流式、停止/重试/编辑/复制，模型与模式、附件预览和六态 Agent 时间线。
- 确认设计按钮只写入浏览器 localStorage，不修改生产应用。

## 复用入口

- [设计系统](../ui-design-system.md)
- [Tokens](tokens.css) 是源，现有 [Tailwind v3 配置参考](tailwind.config.js) 为早期映射；本应用实际使用 [Tailwind v4 @theme](styles.css)。
- [基础组件](components.tsx) 与 [AI/数据组件](ai.tsx)。本地演示数据不能直接当作生产权限、工具或模型适配器。

## 测试

```sh
npm run build
# 在另一终端启动生产预览，默认测试 http://127.0.0.1:3090/
npm test
```

测试使用 Playwright 与 axe-core，默认 Chrome 可执行文件 `/opt/google/chrome/chrome`。测试输出 [test-results.json](test-results.json)，截图保存于 [screenshots](screenshots/desktop.png)。覆盖桌面 1440×1000、平板 834×1112、手机 390×844、横屏 844×390 的根页面溢出，搜索、Command、按钮禁用、弹窗/Popover、Toast、移动抽屉、减弱动效和自动无障碍。

### 本轮实测结果

2026-11-02：生产构建与 TypeScript 通过；四种视口根页面均无横向溢出；上述交互检查通过；axe WCAG 2 A/AA + 2.1 AA 自动扫描 **0 项违规**，浏览器未捕获运行异常。为保证小字号错误文本对比度，新增 `--text-danger`（Rose 300），原始 Rose 500 保留给语义色点。自动扫描不代表所有场景完全无障碍。

### 尚需真实设备验收

- iOS Safari / Android 安装 PWA 的系统键盘、地址栏伸缩、非零四向 Safe Area。
- VoiceOver / TalkBack 的朗读顺序与流式摘要。
- 低性能设备与超长生产会话；本地样本不等同后端集成测试。

本 Playground 不是可安装 PWA（无 service worker），避免缓存未确认的设计。动态视口和安全区布局已准备，安装型 PWA 由后续产品开发独立接入。
