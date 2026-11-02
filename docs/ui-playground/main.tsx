import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Layers,
  Search,
  Command,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Check,
  ChevronRight,
  PanelLeft,
  Box,
  Type,
  MousePointer2,
  TextCursorInput,
  PanelsTopLeft,
  MessageSquare,
  Database,
  Zap,
  SlidersHorizontal,
  ExternalLink,
  Home,
  Folder,
  Settings,
  HelpCircle,
  Copy,
  Loader2,
  CheckCircle2,
  AlertCircle,
  WifiOff,
} from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Button, Overlay, CopyButton, useSlidingIndicator, type InteractiveState } from './components';
import { AIPreview, DataPreview } from './ai';
import { Select } from './select';
import { PillGroup } from './pill';
import './controls.css';
import './styles.css';
const groups = [
  {
    id: 'foundation',
    name: 'Foundation',
    zh: '设计基础',
    icon: Layers,
    items: 'Colors · Typography · Spacing · Radius',
  },
  {
    id: 'buttons',
    name: 'Buttons',
    zh: '操作按钮',
    icon: MousePointer2,
    items: 'Primary · Secondary · Ghost · Icon',
  },
  {
    id: 'inputs',
    name: 'Inputs',
    zh: '表单输入',
    icon: TextCursorInput,
    items: 'Textarea · Search · Select · Checkbox',
  },
  {
    id: 'navigation',
    name: 'Navigation',
    zh: '导航系统',
    icon: PanelsTopLeft,
    items: 'Sidebar · Tabs · Dock · Breadcrumb',
  },
  {
    id: 'surfaces',
    name: 'Surfaces',
    zh: '容器与浮层',
    icon: Box,
    items: 'Card · Popover · Dialog · Drawer',
  },
  {
    id: 'feedback',
    name: 'Feedback',
    zh: '状态反馈',
    icon: Zap,
    items: 'Toast · Tooltip · Skeleton · Progress',
  },
  {
    id: 'ai',
    name: 'AI Components',
    zh: '智能工作流',
    icon: MessageSquare,
    items: 'Composer · Message · Artifact · Agent Timeline',
  },
  {
    id: 'data',
    name: 'Data display',
    zh: '数据展示',
    icon: Database,
    items: 'Table · File List · Code Block · Status Badge',
  },
];
const states: InteractiveState[] = [
  'default',
  'hover',
  'active',
  'focus',
  'disabled',
  'loading',
  'success',
  'error',
];
function App() {
  const [search, setSearch] = useState('');
  const [active, setActive] = useState('foundation');
  const [nav, setNav] = useState(false);
  const [command, setCommand] = useState(false);
  const [cmdSearch, setCmdSearch] = useState('');
  const [state, setState] = useState<InteractiveState>('default');
  const [toast, setToast] = useState('');
  const [touch, setTouch] = useState(false);
  const [density, setDensity] = useState('comfortable');
  const [modelChoice, setModelChoice] = useState('DeepSeek-V4.1');
  const [tab, setTab] = useState('概览');
  const [dock, setDock] = useState('对话');
  const [progress, setProgress] = useState(64);
  const [input, setInput] = useState('');
  const [approved, setApproved] = useState(() => localStorage.getItem('palace-ui-approved') === 'yes');
  const [offline, setOffline] = useState(!navigator.onLine);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const tabsSlide = useSlidingIndicator<HTMLDivElement>(tab);
  const dockSlide = useSlidingIndicator<HTMLElement>(dock);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommand((v) => !v);
      }
    };
    window.addEventListener('keydown', fn);
    const online = () => setOffline(!navigator.onLine);
    window.addEventListener('online', online);
    window.addEventListener('offline', online);
    return () => {
      window.removeEventListener('keydown', fn);
      window.removeEventListener('online', online);
      window.removeEventListener('offline', online);
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const ob = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-12% 0px -70% 0px' },
    );
    document.querySelectorAll('main section[id]').forEach((e) => ob.observe(e));
    return () => ob.disconnect();
  }, [search]);
  const jump = (id: string) => {
    setSearch('');
    setActive(id);
    setNav(false);
    setCommand(false);
    setTimeout(
      () =>
        document
          .getElementById(id)
          ?.scrollIntoView({
            behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
          }),
      0,
    );
  };
  const matching = groups.filter((g) =>
    (g.name + g.zh + g.items).toLowerCase().includes(search.toLowerCase()),
  );
  const navigation = (
    <>
      <div className="sidebar-label">WORKSPACE / DESIGN</div>
      <div className="nav-list">
        {groups.map((g) => (
          <button
            key={g.id}
            aria-current={active === g.id ? 'location' : undefined}
            className={`nav-item ${active === g.id ? 'selected' : ''}`}
            onClick={() => jump(g.id)}
          >
            <g.icon />
            <span>{g.name}</span>
            <span className="nav-count">04</span>
          </button>
        ))}
      </div>
      <div className="sidebar-note">
        <span className="status-dot" /> 统一标准，专注创造<p>Build once. Design consistently.</p>
      </div>
    </>
  );
  return (
    <Tooltip.Provider delayDuration={250}>
      <div className={`playground ${touch ? 'inspect-touch' : ''}`} data-density={density}>
        <a className="skip-link" href="#content">
          跳转到组件内容
        </a>
        <aside className="sidebar">
          <a href="#" className="brand" aria-label="Palace UI 首页">
            <div className="brand-mark">
              <Layers />
            </div>
            <strong>
              Palace<span> / UI</span>
            </strong>
            <span className="version">0.1</span>
          </a>
          <button className="sidebar-search" onClick={() => setCommand(true)}>
            <Search />
            <span>快速查找组件</span>
            <kbd>⌘ K</kbd>
          </button>
          {navigation}
          <div className="sidebar-bottom">
            <div className="avatar">P</div>
            <div>
              Palace Design System<small>Soft Minimal Dark</small>
            </div>
            <span className="status-dot" />
          </div>
        </aside>
        <div className="workspace">
          <header className="topbar">
            <div className="row">
              <Button
                variant="ghost"
                className="mobile-menu"
                aria-label="打开分类导航"
                onClick={() => setNav(true)}
              >
                <PanelLeft />
              </Button>
              <span className="muted">Design system</span>
              <ChevronRight />
              <span>Playground</span>
              <span className="badge">v0.1.0</span>
            </div>
            <div className="row">
              <span className="top-status">
                <span className="status-dot" /> All systems consistent
              </span>
              <Button variant="ghost" aria-label="打开命令面板" onClick={() => setCommand(true)}>
                <Command />
              </Button>
            </div>
          </header>
          {offline && (
            <div role="status" className="offline-banner">
              <WifiOff />
              当前离线 · 已加载的组件仍可操作，附件不会上传。
            </div>
          )}
          <main id="content">
            <div className="hero">
              <div className="eyebrow">
                <span className="tiny-square" /> THE PALACE DESIGN LANGUAGE <span className="hero-line" />
              </div>
              <div className="hero-title">
                <h1>
                  Less noise.
                  <br />
                  <span>More clarity.</span>
                </h1>
                <div className="hero-symbol" aria-hidden="true">
                  <Layers strokeWidth={0.7} />
                </div>
              </div>
              <div className="hero-footer">
                <p>
                  一套安静、有序、可复用的 AI Workspace 设计系统。
                  <br />
                  <span className="muted">以明度建立层次，让内容成为主角。</span>
                </p>
                <Button variant="secondary" onClick={() => jump('ai')}>
                  体验 AI 组件 <ArrowUpRight />
                </Button>
              </div>
              <div className="metrics">
                <div>
                  <strong>08</strong>
                  <span>组件分类</span>
                </div>
                <div>
                  <strong>
                    32<span>+</span>
                  </strong>
                  <span>基础组件</span>
                </div>
                <div>
                  <strong>08</strong>
                  <span>交互状态</span>
                </div>
                <div>
                  <strong>AA</strong>
                  <span>无障碍目标</span>
                </div>
                <div className="metrics-note">
                  <span className="status-dot" /> React · Design Tokens · Tailwind
                </div>
              </div>
            </div>
            <div className="catalog-toolbar">
              <div className="row">
                <h2>组件预览</h2>
                <span className="badge">Component library</span>
              </div>
              <label className="search-field">
                <Search />
                <input
                  aria-label="搜索组件"
                  placeholder="搜索组件、分类…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <kbd>/</kbd>
              </label>
            </div>
            <div className="preview-toolbar">
              <div className="row">
                <SlidersHorizontal />
                <span>交互预览</span>
              </div>
              <div className="row muted">
                <span id="state-label">按钮状态</span>
                <Select
                  label="按钮预览状态"
                  hideLabel
                  size="sm"
                  value={state}
                  onChange={(v) => setState(v as InteractiveState)}
                  options={states.map((s) => ({ value: s, label: s }))}
                />
              </div>
              <label className="row muted">
                <input type="checkbox" checked={touch} onChange={(e) => setTouch(e.target.checked)} />{' '}
                触控热区
              </label>
              <div className="row muted">
                <span id="density-label">密度</span>
                <Select
                  label="预览密度"
                  hideLabel
                  size="sm"
                  value={density}
                  onChange={setDensity}
                  options={[
                    { value: 'comfortable', label: '舒适' },
                    { value: 'compact', label: '紧凑' },
                  ]}
                />
              </div>
            </div>
            {matching.length === 0 && (
              <div className="empty-state">
                <Search />
                <h3>没有找到相关组件</h3>
                <p className="muted">试试搜索 Composer、Buttons 或「导航」。</p>
                <Button onClick={() => setSearch('')}>清除搜索</Button>
              </div>
            )}
            {matching.map((g, i) => (
              <section id={g.id} key={g.id} className="catalog-section">
                <div className="section-heading">
                  <div className="section-icon">
                    <g.icon />
                  </div>
                  <div>
                    <h2>
                      {g.name}
                      <span>{g.zh}</span>
                    </h2>
                    <p>{g.items}</p>
                  </div>
                  <span className="section-index">0{groups.indexOf(g) + 1} / 08</span>
                </div>
                {g.id === 'foundation' && (
                  <div className="foundation-grid">
                    <div className="specimen wide">
                      <div className="specimen-head">
                        <h3>Surface & color</h3>
                        <span>01 — 明度层级</span>
                      </div>
                      <div className="surface-swatches">
                        {['Background', 'Surface 1', 'Surface 2', 'Surface 3', 'Surface 4'].map((name, j) => (
                          <div key={name}>
                            <div className={`surface-swatch swatch-${j}`}>
                              <span>0{j}</span>
                            </div>
                            <strong>{name}</strong>
                            <code>{['#141414', '#1E1E1E', '#262626', '#2F2F2F', '#3A3A3A'][j]}</code>
                          </div>
                        ))}
                      </div>
                      <div className="semantic-colors">
                        {['info', 'success', 'warning', 'danger'].map((v, j) => (
                          <div key={v}>
                            <span className={`semantic-dot ${v}`} />
                            <span>{['Sky · 信息', 'Emerald · 完成', 'Amber · 等待', 'Rose · 错误'][j]}</span>
                            <code>{['#38BDF8', '#10B981', '#F59E0B', '#F43F5E'][j]}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="specimen">
                      <div className="specimen-head">
                        <h3>Typography</h3>
                        <span>02 — 排版</span>
                      </div>
                      <div className="type-sample">
                        <div>
                          <h2>Designed for focus.</h2>
                          <code>24 / 600</code>
                        </div>
                        <div>
                          <h3>让复杂，归于简单。</h3>
                          <code>17 / 600</code>
                        </div>
                        <div>
                          <p>清晰的表达，是最好的界面。</p>
                          <code>15 / 400</code>
                        </div>
                        <div>
                          <span className="muted">次要信息，恰到好处。</span>
                          <code>12.5 / 400</code>
                        </div>
                        <div>
                          <span className="mono">DeepSeek-V4.1 · 15.5 KB</span>
                          <code>Mono</code>
                        </div>
                      </div>
                    </div>
                    <div className="specimen">
                      <div className="specimen-head">
                        <h3>Spacing & radius</h3>
                        <span>03 — 几何</span>
                      </div>
                      <div className="spacing-scale">
                        {[4, 8, 12, 16, 24, 32].map((n, j) => (
                          <div key={n}>
                            <span className={`space-bar space-${j}`} />
                            <code>{n}</code>
                          </div>
                        ))}
                      </div>
                      <div className="radius-scale">
                        {['sm', 'md', 'lg', '2xl', 'full'].map((n, j) => (
                          <div key={n}>
                            <div className={`radius-sample radius-${n}`} />
                            <code>{['8', '12', '16', '24', 'Full'][j]}</code>
                          </div>
                        ))}
                      </div>
                      <div className="token-note">
                        <span className="mono">R outer = R inner + padding</span>
                        <span>同心圆角 · 4px 基础网格</span>
                      </div>
                    </div>
                  </div>
                )}
                {g.id === 'buttons' && (
                  <div className="specimen">
                    <div className="specimen-head">
                      <h3>Intent, without excess.</h3>
                      <span>44px min touch target</span>
                    </div>
                    <div className="button-variants">
                      {(['primary', 'secondary', 'ghost', 'icon'] as const).map((v, j) => (
                        <div key={v}>
                          <Button
                            variant={v}
                            stateOverride={state}
                            aria-label={v === 'icon' ? '添加项目' : undefined}
                            onClick={() => setToast(`${v} 操作已触发`)}
                          >
                            {v === 'icon' ? (
                              <Plus />
                            ) : (
                              <>
                                <Plus />
                                {['创建工作区', '保存更改', '了解更多'][j]}
                              </>
                            )}
                          </Button>
                          <code>{v}</code>
                        </div>
                      ))}
                    </div>
                    <div className="state-matrix">
                      {states.map((s) => (
                        <div key={s}>
                          <Button stateOverride={s} onClick={() => setToast(`${s} 状态按钮已点击`)}>
                            {s === 'success' ? '已保存' : s === 'error' ? '重试操作' : 'Button'}
                          </Button>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                    <p className="caption">
                      上方选择器可切换按钮状态；实际悬停、按压与键盘 Tab 同样可用。Loading 仅为状态样本。
                    </p>
                  </div>
                )}
                {g.id === 'inputs' && (
                  <div className="two-col">
                    <div className="specimen stack">
                      <div className="specimen-head">
                        <h3>Text inputs</h3>
                        <span>默认 / Focus / 错误 / 禁用</span>
                      </div>
                      <label className="stack">
                        工作区名称
                        <input
                          className="field"
                          placeholder="例如：Design exploration"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                        />
                      </label>
                      <label className="stack">
                        任务说明
                        <textarea className="field" rows={3} placeholder="描述你想完成的任务…" />
                      </label>
                      <label className="stack">
                        错误状态
                        <input
                          className="field field-error"
                          aria-invalid="true"
                          aria-describedby="input-error"
                          defaultValue="workspace/"
                        />
                        <span id="input-error" className="error-text">
                          <AlertCircle /> 名称不能包含斜杠，请重新输入。
                        </span>
                      </label>
                      <input aria-label="只读示例" className="field" disabled value="当前权限下不可编辑" />
                    </div>
                    <div className="specimen stack">
                      <div className="specimen-head">
                        <h3>Selection & search</h3>
                        <span>原生键盘可访问</span>
                      </div>
                      <div className="stack">
                        <span id="model-label">模型</span>
                        <Select
                          label="模型"
                          value={modelChoice}
                          onChange={setModelChoice}
                          options={[
                            { value: 'DeepSeek-V4.1', label: 'DeepSeek-V4.1' },
                            { value: 'DeepSeek Reasoner', label: 'DeepSeek Reasoner' },
                            { value: 'more', label: '更多模型（暂不可用）', disabled: true },
                          ]}
                        />
                      </div>
                      <label className="search-field">
                        <Search />
                        <input
                          type="search"
                          aria-label="工作区搜索"
                          placeholder="搜索工作区…"
                          onChange={(e) =>
                            setToast(e.target.value ? `在示例中搜索：${e.target.value}` : '已清空')
                          }
                        />
                      </label>
                      <label className="check-row">
                        <input type="checkbox" defaultChecked />
                        <span>
                          开启深度思考<small>在执行前进行更完整的推理</small>
                        </span>
                      </label>
                      <label className="check-row">
                        <input type="checkbox" />
                        <span>
                          联网搜索<small>需要时获取最新信息</small>
                        </span>
                      </label>
                      <label className="check-row">
                        <input type="checkbox" disabled />
                        <span className="muted">组织策略锁定（禁用）</span>
                      </label>
                      <div className="notice">所有输入保留原生编辑快捷键，不覆盖 ⌘ / Ctrl + A、C、V。</div>
                    </div>
                  </div>
                )}
                {g.id === 'navigation' && (
                  <div className="two-col">
                    <div className="specimen">
                      <div className="specimen-head">
                        <h3>Sidebar & breadcrumb</h3>
                        <span>上下文始终可见</span>
                      </div>
                      <nav aria-label="示例面包屑" className="breadcrumb">
                        <button onClick={() => setToast('工作区 · 示例层级')}>
                          <Home />
                          工作区
                        </button>
                        <ChevronRight />
                        <button onClick={() => setToast('设计项目 · 示例层级')}>设计项目</button>
                        <ChevronRight />
                        <span aria-current="page">组件库</span>
                      </nav>
                      <div className="mini-sidebar">
                        {['概览', '会话', '文件', '设置'].map((name, j) => {
                          const Icon = [Home, MessageSquare, Folder, Settings][j];
                          return (
                            <button
                              key={name}
                              className={`nav-item ${tab === name ? 'selected' : ''}`}
                              onClick={() => setTab(name)}
                            >
                              <Icon />
                              {name}
                              {tab === name && <span className="nav-count">当前</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="specimen stack">
                      <div className="specimen-head">
                        <h3>Tabs & dock</h3>
                        <span>为不同层级分开使用</span>
                      </div>
                      <div
                        role="tablist"
                        aria-label="示例导航"
                        className="tabs"
                        ref={tabsSlide.containerRef}
                      >
                        {['概览', '会话', '文件'].map((name) => (
                          <button
                            role="tab"
                            aria-selected={tab === name}
                            data-slide-active={tab === name ? 'true' : undefined}
                            tabIndex={tab === name ? 0 : -1}
                            key={name}
                            onClick={() => setTab(name)}
                            onKeyDown={(e) => {
                              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                                e.preventDefault();
                                const items = ['概览', '会话', '文件'];
                                const next = (items.indexOf(name) + (e.key === 'ArrowRight' ? 1 : 2)) % 3;
                                setTab(items[next]);
                                (e.currentTarget.parentNode?.children[next] as HTMLElement).focus();
                              }
                            }}
                          >
                            {name}
                          </button>
                        ))}
                        <span
                          aria-hidden="true"
                          className="tabs-indicator"
                          data-ready={tabsSlide.box.ready || undefined}
                          style={{
                            transform: `translateX(${tabsSlide.box.offset}px)`,
                            width: tabsSlide.box.size,
                          }}
                        />
                      </div>
                      <div role="tabpanel" className="tab-panel">
                        <span className="muted">当前视图</span>
                        <strong>{tab}</strong>
                        <p>切换导航不会丢失上方输入的工作区名称。</p>
                      </div>
                      <nav className="dock" aria-label="示例底部导航" ref={dockSlide.containerRef}>
                        {['对话', '任务', '文件', '我的'].map((name, j) => {
                          const Icon = [MessageSquare, Box, Folder, Settings][j];
                          return (
                            <button
                              key={name}
                              aria-current={dock === name ? 'page' : undefined}
                              data-slide-active={dock === name ? 'true' : undefined}
                              onClick={() => setDock(name)}
                            >
                              <Icon />
                              <span>{name}</span>
                            </button>
                          );
                        })}
                        <span
                          aria-hidden="true"
                          className="dock-indicator"
                          data-ready={dockSlide.box.ready || undefined}
                          style={{
                            transform: `translateX(${dockSlide.box.offset}px)`,
                            width: dockSlide.box.size,
                          }}
                        />
                      </nav>
                      <p className="caption">移动对话视图仅保留 Composer，不叠加大型 Dock。</p>
                    </div>
                  </div>
                )}
                {g.id === 'surfaces' && (
                  <div className="two-col">
                    <div className="specimen">
                      <div className="specimen-head">
                        <h3>Card</h3>
                        <span>内容决定高度</span>
                      </div>
                      <div className="feature-card">
                        <div className="row between">
                          <div className="section-icon">
                            <Layers />
                          </div>
                          <span className="badge badge-success">✓ Ready</span>
                        </div>
                        <h3>留白有度，层次有序。</h3>
                        <p className="muted">
                          微边框和表面明度构建空间。没有多余的投影，让注意力留在任务本身。
                        </p>
                        <Button onClick={() => setToast('已将当前组件添加到收藏')} variant="ghost">
                          收藏此组件 <ArrowRight />
                        </Button>
                      </div>
                    </div>
                    <div className="specimen stack">
                      <div className="specimen-head">
                        <h3>Overlays</h3>
                        <span>Focus trap · Escape · Restore</span>
                      </div>
                      <div className="overlay-demo">
                        <div>
                          <Box />
                          <span>
                            <strong>Popover</strong>
                            <small>轻量上下文操作</small>
                          </span>
                          <Popover.Root>
                            <Popover.Trigger asChild>
                              <Button>
                                打开 <ArrowUpRight />
                              </Button>
                            </Popover.Trigger>
                            <Popover.Portal>
                              <Popover.Content className="popover-content" sideOffset={8}>
                                <h3>工作区偏好</h3>
                                <label className="check-row">
                                  <input type="checkbox" defaultChecked /> 自动保存草稿
                                </label>
                                <label className="check-row">
                                  <input type="checkbox" /> 发送完成通知
                                </label>
                                <Popover.Close asChild>
                                  <Button variant="ghost">完成</Button>
                                </Popover.Close>
                              </Popover.Content>
                            </Popover.Portal>
                          </Popover.Root>
                        </div>
                        <div>
                          <PanelsTopLeft />
                          <span>
                            <strong>Dialog</strong>
                            <small>聚焦单一决策</small>
                          </span>
                          <Overlay
                            title="创建工作区"
                            description="这是独立预览操作，不会创建真实项目。"
                            trigger={
                              <Button>
                                打开 <ArrowUpRight />
                              </Button>
                            }
                          >
                            <label className="stack">
                              工作区名称
                              <input autoFocus className="field" placeholder="我的新工作区" />
                            </label>
                            <Button
                              variant="primary"
                              onClick={() => setToast('示例工作区已创建，可按 Escape 关闭')}
                            >
                              创建工作区
                            </Button>
                          </Overlay>
                        </div>
                        <div>
                          <PanelLeft />
                          <span>
                            <strong>Drawer</strong>
                            <small>保留页面任务上下文</small>
                          </span>
                          <Overlay
                            drawer
                            title="项目详情"
                            description="侧边抽屉 · 不打断当前浏览位置。"
                            trigger={
                              <Button>
                                打开 <ArrowUpRight />
                              </Button>
                            }
                          >
                            <div className="feature-card">
                              <span className="badge">Design exploration</span>
                              <h3>Palace Design System</h3>
                              <p className="muted">
                                本地展示，无外部数据请求。按 Escape 或点击遮罩关闭，焦点返回打开按钮。
                              </p>
                            </div>
                          </Overlay>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {g.id === 'feedback' && (
                  <div className="two-col">
                    <div className="specimen stack">
                      <div className="specimen-head">
                        <h3>Toast & tooltip</h3>
                        <span>清晰，不打断</span>
                      </div>
                      <div className="toast-sample">
                        <CheckCircle2 />
                        <div>
                          <strong>更改已保存</strong>
                          <p>你的工作区偏好已更新。</p>
                        </div>
                        <span className="mono muted">now</span>
                      </div>
                      <div className="row wrap">
                        <Button onClick={() => setToast('✓ 更改已保存 — 这是即时反馈示例')}>
                          触发 Toast
                        </Button>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <Button variant="ghost" aria-label="复制快捷键说明">
                              <HelpCircle /> 悬停或聚焦
                            </Button>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content className="tooltip-content" sideOffset={8}>
                              所有重要操作也支持键盘访问
                              <Tooltip.Arrow />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </div>
                      <div className="notice error-text">
                        <AlertCircle /> 请求未完成，已保留草稿。
                        <Button variant="ghost" onClick={() => setToast('示例重试成功，草稿未丢失')}>
                          重试
                        </Button>
                      </div>
                    </div>
                    <div className="specimen stack">
                      <div className="specimen-head">
                        <h3>Skeleton & progress</h3>
                        <span>仅展示有依据的进度</span>
                      </div>
                      <div className="skeleton-preview" aria-label="内容加载骨架" role="status">
                        <div className="skeleton skeleton-avatar" />
                        <div className="stack grow">
                          <div className="skeleton skeleton-line" />
                          <div className="skeleton skeleton-line short" />
                          <div className="skeleton skeleton-line shorter" />
                        </div>
                        <span className="sr-only">正在加载内容</span>
                      </div>
                      <div className="row between">
                        <span>示例文件导入</span>
                        <span className="mono muted">{progress} / 100 records</span>
                      </div>
                      <progress aria-label="示例文件导入进度" max={100} value={progress} />
                      <Button
                        onClick={() => {
                          if (progressTimer.current) clearInterval(progressTimer.current);
                          setProgress(0);
                          progressTimer.current = setInterval(
                            () =>
                              setProgress((p) => {
                                if (p >= 100) {
                                  clearInterval(progressTimer.current!);
                                  return 100;
                                }
                                return Math.min(p + 4, 100);
                              }),
                            70,
                          );
                        }}
                      >
                        重新演示导入
                      </Button>
                      <p className="caption">
                        此进度对应本地计数演示；未知时长的 Agent 只显示运行指示，不虚构百分比。
                      </p>
                    </div>
                  </div>
                )}
                {g.id === 'ai' && <AIPreview />}
                {g.id === 'data' && <DataPreview />}
              </section>
            ))}
            <footer className="page-footer">
              <div>
                <Layers />
                <span>Built on clarity.</span>
                <small>PALACE UI / SOFT MINIMAL DARK</small>
              </div>
              <Overlay
                title="确认设计基线"
                description="确认仅保存在此浏览器，作为视觉评审记录；不会开始修改现有产品页面。"
                trigger={
                  <Button variant={approved ? 'secondary' : 'primary'}>
                    {approved ? <Check /> : null}
                    {approved ? '已记录确认' : '确认这套设计'} <ArrowUpRight />
                  </Button>
                }
              >
                <p>
                  请先检查基础色阶、按钮状态、移动导航与 AI 对话。确认后，后续页面将复用相同 Tokens
                  和组件，而不是重新设计。
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    localStorage.setItem('palace-ui-approved', 'yes');
                    setApproved(true);
                    setToast('已记录此浏览器的设计确认。可按 Escape 返回。');
                  }}
                >
                  记录确认
                </Button>
              </Overlay>
            </footer>
          </main>
        </div>
        <Overlay
          drawer
          open={nav}
          onOpenChange={setNav}
          title="组件分类"
          description="快速跳转至同一页面的组件分区。"
        >
          {navigation}
        </Overlay>
        <Overlay
          open={command}
          onOpenChange={setCommand}
          title="Command palette"
          description="搜索组件分类；⌘ / Ctrl + K 打开，Escape 关闭。"
        >
          <label className="search-field">
            <Search />
            <input
              autoFocus
              aria-label="命令搜索"
              placeholder="你想前往哪里？"
              value={cmdSearch}
              onChange={(e) => setCmdSearch(e.target.value)}
            />
          </label>
          <div className="command-results">
            {groups
              .filter((g) => (g.name + g.zh + g.items).toLowerCase().includes(cmdSearch.toLowerCase()))
              .map((g) => (
                <button key={g.id} className="nav-item" onClick={() => jump(g.id)}>
                  <g.icon />
                  {g.name}
                  <span className="nav-count">{g.zh}</span>
                  <ArrowRight />
                </button>
              ))}
            {!groups.some((g) =>
              (g.name + g.zh + g.items).toLowerCase().includes(cmdSearch.toLowerCase()),
            ) && <p className="muted">没有匹配命令。</p>}
          </div>
        </Overlay>
        <div className="toast-region" role="status" aria-live="polite">
          {toast && (
            <div className="toast-live">
              <CheckCircle2 />
              <span>{toast}</span>
              <button aria-label="关闭通知" className="icon-btn" onClick={() => setToast('')}>
                ×
              </button>
            </div>
          )}
        </div>
      </div>
    </Tooltip.Provider>
  );
}
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
