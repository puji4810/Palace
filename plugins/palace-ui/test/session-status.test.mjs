#!/usr/bin/env node
/**
 * Independent tests for shell/45-session-status.js + styles/29-session-status.css.
 *
 * No DSH server and no session are started. The shell file is evaluated the
 * same way the client loader concatenates it (inside a shared factory scope
 * with `h`/`React` injected), then:
 *   · pure reading/placement/target/label helpers are unit-tested against the
 *     real Client store shapes (`projectionsBySession.values.agentTeam`,
 *     `values.subagentCatalog`, `byId[*].projectionValues.agentPreset`, the
 *     `useSessionStatus` Map, `SessionProjectionSnapshot`);
 *   · the slot registration is exercised with a fake Cordis/slot scope;
 *   · the component and the panel are rendered with react-dom/server for every
 *     data state (ready / loading / empty / unavailable / error / expanded);
 *   · when a local Chrome + Playwright + esbuild exist (the Playground's own
 *     dependencies), a browser fixture checks the real CSS/interaction contract:
 *     visible trigger, portalled panel within the visual viewport, focus,
 *     Tab trap, Escape + focus restore, outside click, disclosure navigation,
 *     mode entry, desktop hiding, and an axe scan of the open dialog.
 *
 * Run: node --test plugins/palace-ui/test/session-status.test.mjs
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const shellPath = path.resolve(here, '../shell/45-session-status.js');
const cssPath = path.resolve(here, '../styles/29-session-status.css');
const tokensPath = path.resolve(here, '../styles/00-tokens.css');
const basePath = path.resolve(here, '../styles/10-base.css');
const overlaysPath = path.resolve(here, '../styles/23-overlays.css');
const mobilePath = path.resolve(here, '../styles/30-mobile.css');
const playground = path.resolve(here, '../../../docs/ui-playground');
const requireFromPlayground = createRequire(path.join(playground, 'package.json'));

const React = requireFromPlayground('react');
const ReactDOMServer = requireFromPlayground('react-dom/server');

// Browser verification is optional: a bare checkout (or CI without Chrome)
// still runs the pure/SSR tests and skips only the fixture section.
let esbuild = null;
let chromium = null;
let AxeBuilder = null;
try {
  esbuild = requireFromPlayground('esbuild');
  ({ chromium } = requireFromPlayground('playwright'));
  ({ AxeBuilder } = requireFromPlayground('@axe-core/playwright'));
} catch {
  esbuild = null;
  chromium = null;
  AxeBuilder = null;
}

const source = fs.readFileSync(shellPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');

// Evaluate the file the way the client factory does: `h`/`React` are shared
// scope names. `new Function` keeps the values in this realm so structural
// assertions do not trip over cross-realm prototypes.
const evaluate = new Function(
  'React',
  'h',
  `${source}
return {
  PUI_SS_MEDIA,
  PUI_SS_MODE_NAMES,
  PUI_SS_MAX_WIDTH,
  PuiSsPanel,
  PuiSessionStatus,
  PuiSsPortal,
  mountSessionStatus,
  puiSsIcon,
  puiSsModeName,
  puiSsReadModeLabel,
  puiSsProjection,
  puiSsValueState,
  puiSsRunning,
  puiSsReading,
  puiSsMemberStatus,
  puiSsSubagentStatus,
  puiSsSubagentMode,
  puiSsTriggerLabel,
  puiSsSubagentTarget,
  puiSsViewport,
  puiSsPlacement,
  puiSsStyleOf,
  puiSsFindAgentPresetSection,
  puiSsOpenModeSettings,
};`,
);

const {
  PUI_SS_MEDIA,
  PuiSsPanel,
  PuiSessionStatus,
  mountSessionStatus,
  puiSsModeName,
  puiSsReadModeLabel,
  puiSsProjection,
  puiSsValueState,
  puiSsReading,
  puiSsMemberStatus,
  puiSsSubagentStatus,
  puiSsSubagentMode,
  puiSsTriggerLabel,
  puiSsSubagentTarget,
  puiSsViewport,
  puiSsPlacement,
  puiSsStyleOf,
  puiSsFindAgentPresetSection,
  puiSsOpenModeSettings,
} = evaluate(React, React.createElement);

/* ------------------------------------------------------------------ *
 * Fixtures — exact shapes the stock header components read
 * ------------------------------------------------------------------ */

const LEAD = 'sess-lead';
const SCOUT = 'sess-scout';
const BUILDER = 'sess-builder';
const REVIEWER = 'sess-reviewer';
const ONESHOT = 'sess-oneshot';
const EXTERNAL = 'sess-external';

function statusMap(entries) {
  const map = new Map();
  for (const [id, running] of Object.entries(entries)) {
    map.set(id, { running, pendingInteraction: undefined, completionUnread: false });
  }
  return map;
}

function listRow(id, extra = {}) {
  return {
    id,
    displayTitle: id,
    title: id,
    running: false,
    blank: false,
    updatedAt: 1,
    retainedBy: { mainView: 0 },
    ...extra,
  };
}

const byId = {
  [LEAD]: listRow(LEAD, {
    displayTitle: '重构会话状态弹层',
    title: '重构会话状态弹层',
    retainedBy: { mainView: 1 },
    projectionValues: { agentPreset: 'standard' },
  }),
  [SCOUT]: listRow(SCOUT, {
    displayTitle: 'Scout',
    running: true,
    projectionValues: { agentPreset: 'standard' },
  }),
  [BUILDER]: listRow(BUILDER, { displayTitle: 'Builder' }),
  [REVIEWER]: listRow(REVIEWER, { displayTitle: 'Reviewer', running: true }),
  [ONESHOT]: listRow(ONESHOT, { displayTitle: '一次性检查' }),
  [EXTERNAL]: listRow(EXTERNAL, { displayTitle: 'External job' }),
};

const agentTeam = {
  members: [
    { id: LEAD, name: 'Lead', role: 'lead', phase: 'active' },
    { id: SCOUT, name: 'Scout', role: 'teammate', phase: 'active' },
    { id: BUILDER, name: 'Builder', role: 'teammate', phase: 'provisioning' },
  ],
  tasks: [
    { id: 'task-1', status: 'in_progress', subject: '梳理头部槽位' },
    { id: 'task-2', status: 'completed', subject: '完成契约' },
    { id: 'task-3', status: 'deleted', subject: '已删除' },
  ],
};

const subagentCatalog = [
  { id: REVIEWER, createdAt: 1, mode: 'continuable', label: 'Reviewer' },
  { id: ONESHOT, createdAt: 2, mode: 'one-shot', label: '一次性检查' },
  { id: EXTERNAL, createdAt: 3, mode: 'external', label: '外部任务' },
];

function projections(overrides = {}) {
  return {
    [LEAD]: {
      state: 'ready',
      error: null,
      values: { agentTeam, subagentCatalog },
    },
    ...overrides,
  };
}

const statuses = statusMap({ [LEAD]: false, [SCOUT]: true, [BUILDER]: false, [REVIEWER]: true, [ONESHOT]: false });

function readingInput(overrides = {}) {
  return {
    sessionId: LEAD,
    summary: byId[LEAD],
    address: undefined,
    projections: projections(),
    statuses,
    byId,
    listPhase: 'ready',
    refreshSettled: true,
    modeLabel: { text: '标准模式', description: '处理代码、文件和资料。' },
    ...overrides,
  };
}

function panelProps(overrides = {}) {
  return {
    reading: puiSsReading(readingInput()),
    placement: { left: 62, width: 320, top: 115, maxHeight: 460, placement: 'below' },
    panelId: 'pui-ss-test',
    panelRef: undefined,
    closeRef: undefined,
    expanded: null,
    onToggle: () => {},
    onClose: () => {},
    onMode: () => {},
    onOpenMember: () => {},
    onOpenSubagent: () => {},
    onKeyDown: () => {},
    ...overrides,
  };
}

function renderPanel(overrides = {}) {
  return ReactDOMServer.renderToStaticMarkup(React.createElement(PuiSsPanel, panelProps(overrides)));
}

function renderTrigger(overrides = {}) {
  const props = {
    sessionId: LEAD,
    useSessions: (selector) => selector({ ids: Object.keys(byId), byId, phase: 'ready', projectionsBySession: projections() }),
    useSession: (selector) => selector({ subagent: undefined }),
    useSessionStatus: (selector) => selector(statuses),
    services: {
      readModeLabel: () => null,
      refresh: () => Promise.resolve(),
      openSession: () => true,
      openMode: () => true,
    },
    ...overrides,
  };
  return ReactDOMServer.renderToStaticMarkup(React.createElement(PuiSessionStatus, props));
}

/* ------------------------------------------------------------------ *
 * 1. Reading — real shapes, no invented numbers
 * ------------------------------------------------------------------ */

test('the reading comes from the real projections: mode, team members/tasks, subagent catalog', () => {
  const reading = puiSsReading(readingInput());
  assert.equal(reading.title, '重构会话状态弹层');
  assert.equal(reading.mode.id, 'standard');
  assert.equal(reading.mode.name, '标准模式');
  assert.equal(reading.mode.description, '处理代码、文件和资料。');
  assert.equal(reading.team.state, 'ready');
  assert.equal(reading.team.leadSessionId, LEAD);
  assert.equal(reading.team.count, 3);
  assert.equal(reading.team.runningCount, 1);
  assert.equal(reading.team.taskCount, 2, 'deleted tasks are not counted');
  assert.equal(reading.team.openTaskCount, 1);
  assert.deepEqual(
    reading.team.members.map((member) => [member.id, member.role, member.running, member.current]),
    [
      [LEAD, 'lead', false, true],
      [SCOUT, 'teammate', true, false],
      [BUILDER, 'teammate', false, false],
    ],
  );
  assert.equal(reading.subagents.state, 'ready');
  assert.equal(reading.subagents.count, 3);
  assert.equal(reading.subagents.runningCount, 1);
  assert.deepEqual(
    reading.subagents.items.map((entry) => [entry.id, entry.mode, entry.label, entry.navigable]),
    [
      [REVIEWER, 'continuable', 'Reviewer', true],
      [ONESHOT, 'one-shot', '一次性检查', true],
      [EXTERNAL, 'external', '外部任务', false],
    ],
  );
  assert.equal(reading.anyRunning, true);
});

test('a teammate conversation reads its Lead team but its own subagent catalog', () => {
  const reading = puiSsReading(
    readingInput({
      sessionId: SCOUT,
      summary: byId[SCOUT],
      address: { parentSessionId: LEAD, childSessionId: SCOUT, mode: 'continuable' },
      projections: projections({
        [SCOUT]: { state: 'ready', error: null, values: {} },
      }),
      modeLabel: null,
    }),
  );
  assert.equal(reading.team.leadSessionId, LEAD);
  assert.equal(reading.team.count, 3);
  assert.equal(reading.team.members.find((member) => member.id === SCOUT).current, true);
  assert.equal(reading.subagents.state, 'empty');
  assert.equal(reading.subagents.count, 0);
  assert.equal(reading.mode.name, '标准模式', 'registry id fallback still names the preset');
});

test('running state prefers the unified status Map and falls back to the list row', () => {
  const fallback = puiSsReading(readingInput({ statuses: statusMap({}) }));
  const scout = fallback.team.members.find((member) => member.id === SCOUT);
  assert.equal(scout.running, true, 'list running flag is the shipped fallback');
  const reviewer = fallback.subagents.items.find((entry) => entry.id === REVIEWER);
  assert.equal(reviewer.running, true);
});

test('missing/loading/error/migration projections have distinct honest states', () => {
  assert.equal(puiSsValueState(true, 'idle', false, 'unavailable'), 'ready');
  assert.equal(puiSsValueState(false, 'idle', false, 'unavailable'), 'loading');
  assert.equal(puiSsValueState(false, 'idle', true, 'unavailable'), 'unavailable');
  assert.equal(puiSsValueState(false, 'loading', true, 'unavailable'), 'loading');
  assert.equal(puiSsValueState(false, 'error', true, 'unavailable'), 'error');
  assert.equal(puiSsValueState(false, 'migration-required', true, 'unavailable'), 'migration');
  assert.equal(puiSsValueState(false, 'ready', true, 'empty'), 'empty');

  const idle = puiSsReading(readingInput({ refreshSettled: false, projections: {} }));
  assert.equal(idle.team.state, 'loading');
  assert.equal(idle.subagents.state, 'loading');

  const settled = puiSsReading(readingInput({ projections: {} }));
  assert.equal(settled.team.state, 'unavailable');
  assert.equal(settled.subagents.state, 'empty');

  const failed = puiSsReading(
    readingInput({
      projections: {
        [LEAD]: { state: 'error', error: new Error('projection read failed'), values: {} },
      },
    }),
  );
  assert.equal(failed.team.state, 'error');
  assert.equal(failed.team.error.message, 'projection read failed');
  assert.equal(failed.subagents.state, 'error');
});

test('no session summary means no invented mode', () => {
  const reading = puiSsReading(readingInput({ summary: undefined, modeLabel: null }));
  assert.equal(reading.mode.id, undefined);
  assert.equal(reading.mode.name, null);
  assert.equal(puiSsReading(readingInput()).mode.name, '标准模式');
});

/* ------------------------------------------------------------------ *
 * 2. Helpers — labels, targets, settings entry
 * ------------------------------------------------------------------ */

test('the shipped localized label wins over the id map, with a safe fallback', () => {
  assert.equal(puiSsModeName('standard', '标准模式'), '标准模式');
  assert.equal(puiSsModeName('custom-review', '代码审查'), '代码审查');
  assert.equal(puiSsModeName('ptc', undefined), 'PTC 模式');
  assert.equal(puiSsModeName('cordis', ''), '创造模式');
  assert.equal(puiSsModeName('custom-review', null), 'custom-review');
  assert.equal(puiSsModeName(undefined, null), null);
});

test('the mode label is read from the hidden header-actions label', () => {
  const label = {
    textContent: '  标准模式  ',
    getAttribute: (name) => (name === 'title' ? '处理代码、文件和资料。' : null),
  };
  const doc = { querySelector: (selector) => (selector.includes('SVAs4q_label') ? label : null) };
  assert.deepEqual(puiSsReadModeLabel(doc), {
    text: '标准模式',
    description: '处理代码、文件和资料。',
  });
  assert.equal(puiSsReadModeLabel({ querySelector: () => null }), null);
  assert.equal(puiSsReadModeLabel(null), null);
});

test('subagent navigation uses the durable address and excludes external tasks', () => {
  assert.deepEqual(
    puiSsSubagentTarget(LEAD, { id: REVIEWER, mode: 'continuable', navigable: true }),
    { parentSessionId: LEAD, childSessionId: REVIEWER, mode: 'continuable' },
  );
  assert.deepEqual(
    puiSsSubagentTarget(LEAD, { id: ONESHOT, mode: 'one-shot', navigable: true }),
    { parentSessionId: LEAD, childSessionId: ONESHOT, mode: 'one-shot' },
  );
  assert.equal(puiSsSubagentTarget(LEAD, { id: EXTERNAL, mode: 'external', navigable: false }), null);
  assert.equal(puiSsSubagentTarget(LEAD, null), null);
});

test('the trigger name carries the same counts the panel shows', () => {
  const label = puiSsTriggerLabel(puiSsReading(readingInput()));
  assert.match(label, /标准模式/);
  assert.match(label, /团队 3 人/);
  assert.match(label, /子代理 3 个/);
  const empty = puiSsTriggerLabel(puiSsReading(readingInput({ projections: {} })));
  assert.match(empty, /无团队数据/);
  assert.match(empty, /无子代理数据/);
});

test('mode entry opens the real settings dialog and selects the Agent-preset section', () => {
  const calls = [];
  let dialogOpen = false;
  const navButton = { textContent: 'Agent 预设', click: () => calls.push({ section: 'agent-presets' }) };
  const other = { textContent: '子代理', click: () => calls.push({ section: 'subagents' }) };
  const dialog = { querySelectorAll: () => [other, navButton] };
  const doc = {
    querySelector: (selector) => (dialogOpen && selector.includes('data-shortcut-modal') ? dialog : null),
    querySelectorAll: () => [],
    dispatchEvent: () => {},
  };
  const shortcuts = {
    invoke(id, context) {
      calls.push({ id, context });
      dialogOpen = true;
    },
  };
  const invoked = puiSsOpenModeSettings(shortcuts, doc, (cb) => cb());
  assert.equal(invoked, true);
  assert.deepEqual(calls[0], {
    id: 'settings.open',
    context: { source: 'menu', region: 'page', modal: null, target: null },
  });
  assert.deepEqual(calls[1], { section: 'agent-presets' });
  assert.equal(puiSsFindAgentPresetSection(dialog).textContent, 'Agent 预设');
  assert.equal(puiSsFindAgentPresetSection({ querySelectorAll: () => [other] }), null);
});

test('mode entry falls back to the shipped launcher → account-menu 设置 entry', () => {
  const calls = [];
  let menuOpen = false;
  let dialogOpen = false;
  const navButton = { textContent: 'Agent 预设', click: () => calls.push('section') };
  const settingsDialog = { querySelectorAll: () => [navButton] };
  const menuItem = {
    textContent: '设置',
    click: () => {
      menuOpen = false;
      dialogOpen = true;
      calls.push('menu-item');
    },
  };
  const launcher = {
    click: () => {
      menuOpen = true;
      calls.push('launcher');
    },
  };
  const doc = {
    querySelector: (selector) => {
      if (selector.includes('data-shortcut-modal')) return dialogOpen ? settingsDialog : null;
      if (selector.includes('settings.launcher')) return launcher;
      return null;
    },
    querySelectorAll: (selector) => (menuOpen && selector.includes('menuitem') ? [menuItem] : []),
    dispatchEvent: () => calls.push('escape'),
  };
  // `shortcuts.invoke` is absent on the public 0.2.1-rc.5 face.
  const invoked = puiSsOpenModeSettings({}, doc, (cb) => cb());
  assert.equal(invoked, true);
  assert.deepEqual(calls, ['launcher', 'menu-item', 'section']);
});

test('an already-open Settings dialog is never toggled shut', () => {
  const calls = [];
  const navButton = { textContent: 'Agent presets', click: () => calls.push('section') };
  const dialog = { querySelectorAll: () => [navButton] };
  const doc = {
    querySelector: (selector) => (selector.includes('data-shortcut-modal') ? dialog : null),
    querySelectorAll: () => [],
  };
  const shortcuts = {
    invoke() {
      throw new Error('settings.open would close the dialog');
    },
  };
  assert.equal(puiSsOpenModeSettings(shortcuts, doc, (cb) => cb()), true);
  assert.deepEqual(calls, ['section']);
});

test('the section is selected after the dialog finishes mounting its nav', () => {
  const calls = [];
  let dialogVisible = false;
  let navReady = false;
  let tick = 0;
  const navButton = { textContent: 'Agent 预设', click: () => calls.push('section') };
  const dialog = { querySelectorAll: () => (navReady ? [navButton] : []) };
  const menuItem = { textContent: '设置', click: () => { dialogVisible = true; calls.push('menu-item'); } };
  const launcher = { click: () => calls.push('launcher') };
  const doc = {
    querySelector: (selector) => {
      if (selector.includes('data-shortcut-modal')) return dialogVisible ? dialog : null;
      if (selector.includes('settings.launcher')) return launcher;
      return null;
    },
    querySelectorAll: () => [menuItem],
    dispatchEvent: () => {},
  };
  const schedule = (cb) => {
    tick += 1;
    // The dialog mounts first, its section ledger one tick later.
    if (tick === 3) navReady = true;
    if (tick > 60) throw new Error('poll did not settle');
    cb();
  };
  assert.equal(puiSsOpenModeSettings({}, doc, schedule), true);
  assert.deepEqual(calls, ['launcher', 'menu-item', 'section']);
  assert.ok(tick <= 6, `settled in ${tick} ticks`);
});

/* ------------------------------------------------------------------ *
 * 3. Placement — phone header, keyboard, landscape
 * ------------------------------------------------------------------ */

test('the panel sits under the header, inside the visual viewport, right-aligned', () => {
  const header = { top: 0, bottom: 107, left: 0, right: 390 };
  const placement = puiSsPlacement(header, { width: 390, layoutHeight: 844, visualTop: 0, visualHeight: 844 });
  assert.equal(placement.placement, 'below');
  assert.equal(placement.width, 320);
  assert.equal(placement.left, 62, '8px window margin, not the trigger edge');
  assert.equal(placement.top, 115);
  assert.equal(placement.maxHeight, 460);
  const style = puiSsStyleOf(placement);
  assert.equal(style.position, 'fixed');
  assert.equal(style.left, 62);
  assert.equal(style.top, 115);
  assert.equal(style.maxHeight, 460);
});

test('the panel shrinks inside the visible viewport when the keyboard is open', () => {
  const header = { top: 0, bottom: 107, left: 0, right: 390 };
  const keyboard = puiSsPlacement(header, {
    width: 390,
    layoutHeight: 844,
    visualTop: 0,
    visualHeight: 520,
  });
  assert.equal(keyboard.placement, 'below');
  assert.equal(keyboard.maxHeight, 397, 'visible height minus header, gap and margin');
  const landscape = puiSsPlacement(
    { top: 0, bottom: 52, left: 0, right: 844 },
    { width: 844, layoutHeight: 390, visualTop: 0, visualHeight: 390 },
  );
  assert.equal(landscape.width, 320);
  assert.ok(landscape.top + landscape.maxHeight <= 390 - 8 + 0.01);
});

test('a small viewport never makes the panel wider than the screen', () => {
  const placement = puiSsPlacement(
    { top: 0, bottom: 96, left: 0, right: 300 },
    { width: 300, layoutHeight: 640, visualTop: 0, visualHeight: 640 },
  );
  assert.equal(placement.width, 284);
  assert.equal(placement.left, 8);
  assert.ok(placement.left + placement.width <= 300 - 8);
});

test('a trigger low on the screen flips the panel above itself', () => {
  const placement = puiSsPlacement(
    { top: 300, bottom: 344, left: 0, right: 390 },
    { width: 390, layoutHeight: 400, visualTop: 0, visualHeight: 400 },
  );
  assert.equal(placement.placement, 'above');
  assert.equal(placement.bottom, 400 - 300 + 8);
  assert.equal(placement.maxHeight, 284);
});

test('SSR-safe viewport defaults do not touch window', () => {
  assert.deepEqual(puiSsViewport(), {
    width: 390,
    layoutHeight: 844,
    visualTop: 0,
    visualHeight: 844,
  });
});

/* ------------------------------------------------------------------ *
 * 4. Registration + rendered markup (react-dom/server)
 * ------------------------------------------------------------------ */

test('mount registers its own visible header utilities cell', () => {
  let registered = null;
  const ctx = {
    uiWorkspace: { openSession: () => {} },
    shortcuts: { invoke: () => {} },
    sessions: { refreshProjections: () => Promise.resolve() },
  };
  mountSessionStatus({
    ctx,
    register: (slot, options, component) => {
      registered = { slot, options, component };
    },
  });
  assert.equal(registered.slot, 'conversation.session.header.utilities');
  assert.equal(registered.options.id, 'palace-session-status');
  assert.equal(registered.options.order, 5);
  assert.equal(typeof registered.component, 'function');
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(registered.component, {
      sessionId: LEAD,
      useSessions: (selector) => selector({ ids: Object.keys(byId), byId, phase: 'ready', projectionsBySession: projections() }),
      useSession: (selector) => selector({ subagent: undefined }),
      useSessionStatus: (selector) => selector(statuses),
    }),
  );
  assert.match(html, /class="pui-ss"/);
  assert.match(html, /aria-haspopup="dialog"/);
});

test('the closed trigger is a named, collapsed dialog button', () => {
  const html = renderTrigger();
  assert.match(html, /<button[^>]*class="pui-ss-trigger"/);
  assert.match(html, /aria-haspopup="dialog"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-label="会话状态：模式 标准模式，团队 3 人，子代理 3 个"/);
  assert.doesNotMatch(html, /aria-controls/);
  assert.doesNotMatch(html, /pui-ss-panel/, 'closed means no hidden dialog in the DOM');
  assert.match(html, /pui-ss-badge/, 'running work is signalled on the trigger');
});

test('the open panel marks up mode, team and subagent readings', () => {
  const html = renderPanel();
  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-modal="false"/);
  assert.match(html, /aria-label="会话状态"/);
  assert.match(html, /data-row="mode"/);
  assert.match(html, /模式/);
  assert.match(html, /标准模式/);
  assert.match(html, /处理代码、文件和资料。/);
  assert.match(html, /设置/);
  assert.doesNotMatch(html, /aria-label="当前模式/);
  assert.match(html, /data-row="team"/);
  assert.match(html, /3 名成员 · 2 个任务/);
  assert.match(html, /data-row="subagents"/);
  assert.match(html, /3 个子代理 · 1 运行中/);
  assert.match(html, /数据来自当前会话，随会话状态更新/);
  assert.doesNotMatch(html, /无团队数据/);
});

test('team detail lists the real roster and never re-opens the current chat', () => {
  const html = renderPanel({ expanded: 'team' });
  assert.match(html, /id="pui-ss-test-team"/);
  assert.match(html, /role="group" aria-label="团队成员"/);
  assert.match(html, /Scout/);
  assert.match(html, /Builder/);
  assert.match(html, /准备中/);
  assert.match(html, /运行中/);
  assert.match(html, /aria-current="true"/);
  assert.match(html, /pui-ss-tag">当前</);
  assert.equal((html.match(/<button[^>]*class="pui-ss-item"/g) || []).length, 2, 'lead is static, two teammates are buttons');
});

test('subagent detail shows modes and keeps external tasks non-navigable', () => {
  const html = renderPanel({ expanded: 'sub' });
  assert.match(html, /id="pui-ss-test-sub"/);
  assert.match(html, /可继续/);
  assert.match(html, /一次性/);
  assert.match(html, /外部任务/);
  assert.match(html, /不可打开/);
  assert.doesNotMatch(html, /pui-ss-tag">外部</);
  assert.match(html, /pui-ss-sr">打开会话</);
  assert.doesNotMatch(html, /aria-label="打开 Reviewer/);
});

test('empty / unavailable / error states look real instead of promising detail', () => {
  const emptyHtml = renderPanel({
    reading: puiSsReading(readingInput({ projections: {} })),
  });
  assert.match(emptyHtml, /无团队数据/);
  assert.match(emptyHtml, /无子代理/);
  assert.match(emptyHtml, /Agent 团队未启用/);
  assert.doesNotMatch(emptyHtml, /aria-expanded/);

  const errorHtml = renderPanel({
    reading: puiSsReading(
      readingInput({
        projections: {
          [LEAD]: { state: 'error', error: new Error('读不到投影'), values: {} },
        },
      }),
    ),
  });
  assert.match(errorHtml, /团队信息读取失败：读不到投影/);
  assert.match(errorHtml, /role="alert"/);

  const loadingHtml = renderPanel({
    reading: puiSsReading(readingInput({ projections: {}, refreshSettled: false })),
  });
  assert.match(loadingHtml, /读取中…/);
});

test('a read-but-empty catalog is static, never an empty "详情" disclosure', () => {
  const html = renderPanel({
    reading: puiSsReading(
      readingInput({
        projections: {
          [LEAD]: { state: 'ready', error: null, values: { subagentCatalog: [] } },
        },
      }),
    ),
  });
  assert.match(html, /无子代理/);
  assert.doesNotMatch(html, /data-row="subagents"[^>]*aria-expanded/);
  assert.doesNotMatch(html, /0 个子代理/);
});

test('status vocabulary is text, never colour-only', () => {
  assert.deepEqual(puiSsMemberStatus({ phase: 'failed', running: false }), { key: 'failed', text: '失败' });
  assert.deepEqual(puiSsMemberStatus({ phase: 'active', running: true }), { key: 'running', text: '运行中' });
  assert.deepEqual(puiSsMemberStatus({ phase: 'provisioning', running: false }), {
    key: 'provisioning',
    text: '准备中',
  });
  assert.deepEqual(puiSsMemberStatus({ phase: 'active', running: false }), { key: 'idle', text: '空闲' });
  assert.deepEqual(puiSsSubagentStatus({ mode: 'external', running: false }), {
    key: 'external',
    text: '外部任务',
  });
  assert.equal(puiSsSubagentMode('continuable'), '可继续');
  assert.equal(puiSsSubagentMode('one-shot'), '一次性');
  assert.equal(puiSsSubagentMode('external'), '外部');
  assert.equal(puiSsSubagentMode('unknown'), '未知');
});

/* ------------------------------------------------------------------ *
 * 5. Stylesheet contract
 * ------------------------------------------------------------------ */

test('the stylesheet uses tokens only and keeps the phone layout contract', () => {
  // Comments describe the rules; check only the declarations.
  const code = css.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(code, /#[0-9a-f]{3,8}\b/i, 'no literal hex colours');
  assert.doesNotMatch(code, /\brgba?\(/i, 'no literal rgb colours');
  assert.doesNotMatch(code, /\bhsla?\(/i, 'no literal hsl colours');
  assert.doesNotMatch(code, /!important/, 'no !important');
  assert.match(css, /--pui-ss-fill: var\(--pui-overlay-menu-fill-strong\)/);
  assert.match(code, /\.pui-ss \{\n  display: none;/);
  assert.ok(css.includes(PUI_SS_MEDIA), 'same media query as 30-mobile.css');
  assert.match(css, /min-height: var\(--pui-touch-target\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media \(hover: hover\)/);
  assert.match(css, /@media \(forced-colors: active\)/);
  assert.match(css, /backdrop-filter: var\(--pui-overlay-blur\)/);
  assert.doesNotMatch(css, /display: none !important/);
});

/* ------------------------------------------------------------------ *
 * 6. Browser fixture — only when the Playground's own toolchain exists
 * ------------------------------------------------------------------ */

const hasChrome = fs.existsSync('/opt/google/chrome/chrome');
const browserSkip =
  hasChrome && chromium && esbuild && AxeBuilder
    ? false
    : 'local Chrome / Playwright / esbuild / axe unavailable';

test('browser: phone header trigger + portalled popover behaviour', { skip: browserSkip }, async (t) => {
  const harness = `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    const h = React.createElement;
    ${source}
    const LEAD = ${JSON.stringify(LEAD)};
    const SCOUT = ${JSON.stringify(SCOUT)};
    const BUILDER = ${JSON.stringify(BUILDER)};
    const REVIEWER = ${JSON.stringify(REVIEWER)};
    const ONESHOT = ${JSON.stringify(ONESHOT)};
    const EXTERNAL = ${JSON.stringify(EXTERNAL)};
    const byId = ${JSON.stringify(byId)};
    const agentTeam = ${JSON.stringify(agentTeam)};
    const subagentCatalog = ${JSON.stringify(subagentCatalog)};
    const statuses = new Map([
      [LEAD, { running: false }],
      [SCOUT, { running: true }],
      [BUILDER, { running: false }],
      [REVIEWER, { running: true }],
      [ONESHOT, { running: false }],
    ]);
    const list = { ids: Object.keys(byId), byId, phase: 'ready', projectionsBySession: { [LEAD]: { state: 'ready', error: null, values: { agentTeam, subagentCatalog } } } };
    const log = { openSession: [], openMode: 0, refresh: [] };
    const services = {
      openSession(target) { log.openSession.push(target); return true; },
      openMode() { log.openMode += 1; return true; },
      refresh(id) { log.refresh.push(id); return Promise.resolve(); },
      readModeLabel() { return puiSsReadModeLabel(document); },
    };
    window.__puiSsHarness = {
      boot() {
        const root = createRoot(document.getElementById('trigger-slot'));
        root.render(h(PuiSessionStatus, {
          sessionId: LEAD,
          useSessions: (selector) => selector(list),
          useSession: (selector) => selector({ subagent: undefined }),
          useSessionStatus: (selector) => selector(statuses),
          services,
        }));
      },
      log,
    };
  `;
  const bundle = await esbuild.build({
    stdin: { contents: harness, resolveDir: playground, loader: 'js' },
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    target: 'es2022',
    logLevel: 'silent',
  });

  const browser = await chromium.launch({
    executablePath: '/opt/google/chrome/chrome',
    headless: true,
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  try {
    await page.setContent(`<!doctype html>
      <html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
      <body>
        <div class="pI_x6G_frame" style="display:grid;grid-template-columns:0 minmax(0,1fr) 0">
          <div class="pI_x6G_centerCol">
            <header class="wSkVaW_header">
              <div class="wSkVaW_headerLeading"><button type="button" class="pui-m-menu" aria-label="打开导航">≡</button></div>
              <div class="wSkVaW_titleRow"><div class="wSkVaW_titleCluster">
                <nav class="wSkVaW_crumbs" aria-label="会话层级"><span class="wSkVaW_crumbSeg"><span class="wSkVaW_crumb wSkVaW_crumbCurrent">重构会话状态弹层</span></span></nav>
                <div class="wSkVaW_headerActions" style="display:none"><span class="SVAs4q_label" title="处理代码、文件和资料。">标准模式</span></div>
                <div class="wSkVaW_headerUtilities"><div data-slot="conversation.session.header.utilities" style="display:contents"><div id="trigger-slot" style="display:contents"></div></div></div>
              </div></div>
              <div class="wSkVaW_tabs"><div class="wSkVaW_viewTabs"><button type="button" class="wSkVaW_tab wSkVaW_tabActive">对话</button><button type="button" class="wSkVaW_tab">轨迹</button></div></div>
            </header>
            <main style="height:600px">对话内容</main>
          </div>
        </div>
      </body></html>`);
    for (const file of [tokensPath, basePath, overlaysPath, mobilePath, cssPath]) {
      await page.addStyleTag({ path: file });
    }
    // The shipped app is dark; 00-tokens keys the dark twin off <body>.
    await page.evaluate(() => document.body.setAttribute('data-ds-dark-theme', ''));
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    await page.evaluate(() => window.__puiSsHarness.boot());

    const trigger = page.locator('.pui-ss-trigger');
    await trigger.waitFor();
    const panel = page.locator('.pui-ss-panel');

    await t.test('trigger is visible on a phone and the stock actions stay hidden', async () => {
      const box = await trigger.boundingBox();
      assert.ok(box && box.width >= 44 && box.height >= 44, '44px touch target');
      assert.equal(await page.locator('.wSkVaW_headerActions').isVisible(), false);
      assert.equal(await page.evaluate(() => window.__puiSsHarness.log.refresh.length), 0);
    });

    await t.test('opening ports the dialog to <body>, inside the visual viewport', async () => {
      await trigger.click();
      await panel.waitFor();
      await page.waitForFunction(
        () => document.querySelector('.pui-ss-panel')?.contains(document.activeElement),
      );
      const geometry = await page.evaluate(() => {
        const panelEl = document.querySelector('.pui-ss-panel');
        const header = document.querySelector('header.wSkVaW_header').getBoundingClientRect();
        const rect = panelEl.getBoundingClientRect();
        return {
          parentIsBody: panelEl.parentElement === document.body,
          rect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom },
          headerBottom: header.bottom,
          role: panelEl.getAttribute('role'),
          activeInside: panelEl.contains(document.activeElement),
          expanded: document.querySelector('.pui-ss-trigger').getAttribute('aria-expanded'),
          controls: document.querySelector('.pui-ss-trigger').getAttribute('aria-controls'),
          panelId: panelEl.id,
          refresh: window.__puiSsHarness.log.refresh.slice(),
        };
      });
      assert.equal(geometry.parentIsBody, true);
      assert.equal(geometry.role, 'dialog');
      assert.equal(geometry.activeInside, true, 'focus moves into the dialog');
      assert.equal(geometry.expanded, 'true');
      assert.equal(geometry.controls, geometry.panelId);
      assert.ok(geometry.rect.left >= 7.5);
      assert.ok(geometry.rect.right <= 390 - 7.5);
      assert.ok(geometry.rect.top >= geometry.headerBottom);
      assert.ok(geometry.rect.bottom <= 844 - 7.5);
      assert.equal(geometry.refresh.length >= 1, true, 'a real projection baseline is requested');
    });

    await t.test('Escape closes and returns focus to the trigger', async () => {
      await page.keyboard.press('Escape');
      await panel.waitFor({ state: 'detached' });
      await page.waitForFunction(() => document.activeElement?.classList.contains('pui-ss-trigger'));
      const focus = await page.evaluate(() => document.activeElement && document.activeElement.className);
      assert.match(String(focus), /pui-ss-trigger/);
      assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
    });

    await t.test('outside pointerdown dismisses without stealing focus back', async () => {
      await trigger.click();
      await panel.waitFor();
      await page.mouse.click(40, 500);
      await panel.waitFor({ state: 'detached' });
    });

    await t.test('mode row is the real settings entry', async () => {
      await trigger.click();
      await panel.waitFor();
      const modeText = await panel.locator('[data-row="mode"]').innerText();
      assert.match(modeText, /标准模式/);
      await panel.locator('[data-row="mode"]').click();
      await panel.waitFor({ state: 'detached' });
      assert.equal(await page.evaluate(() => window.__puiSsHarness.log.openMode), 1);
    });

    await t.test('team disclosure lists the roster and opens a real teammate session', async () => {
      await trigger.click();
      await panel.waitFor();
      const teamRow = panel.locator('[data-row="team"]');
      await teamRow.click();
      const group = panel.locator('.pui-ss-group');
      await group.waitFor();
      assert.match(await group.innerText(), /Scout/);
      assert.match(await group.innerText(), /准备中/);
      const current = group.locator('[data-current="true"]');
      assert.match(await current.innerText(), /当前/);
      await group.getByRole('button', { name: /Scout/ }).click();
      await panel.waitFor({ state: 'detached' });
      assert.deepEqual(await page.evaluate(() => window.__puiSsHarness.log.openSession), [SCOUT]);
    });

    await t.test('subagent disclosure uses the durable address; external rows stay static', async () => {
      await trigger.click();
      await panel.waitFor();
      await panel.locator('[data-row="subagents"]').click();
      const group = panel.locator('.pui-ss-group');
      await group.waitFor();
      assert.equal(await group.locator('[data-static="true"]').count(), 1);
      assert.match(await group.innerText(), /外部任务/);
      await group.getByRole('button', { name: /Reviewer/ }).click();
      await panel.waitFor({ state: 'detached' });
      const calls = await page.evaluate(() => window.__puiSsHarness.log.openSession);
      assert.deepEqual(calls.at(-1), {
        parentSessionId: LEAD,
        childSessionId: REVIEWER,
        mode: 'continuable',
      });
    });

    await t.test('Tab stays inside the dialog', async () => {
      await trigger.click();
      await panel.waitFor();
      for (let i = 0; i < 8; i += 1) await page.keyboard.press('Tab');
      assert.equal(
        await page.evaluate(() => document.querySelector('.pui-ss-panel').contains(document.activeElement)),
        true,
      );
      await page.keyboard.press('Escape');
      await panel.waitFor({ state: 'detached' });
    });

    await t.test('short visual viewport keeps the panel on screen', async () => {
      await page.setViewportSize({ width: 390, height: 520 });
      await trigger.click();
      await panel.waitFor();
      const geometry = await page.evaluate(() => {
        const rect = document.querySelector('.pui-ss-panel').getBoundingClientRect();
        const header = document.querySelector('header.wSkVaW_header').getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, headerBottom: header.bottom };
      });
      assert.ok(geometry.top >= geometry.headerBottom);
      assert.ok(geometry.bottom <= 520 - 7.5);
      await page.keyboard.press('Escape');
      await panel.waitFor({ state: 'detached' });
      await page.setViewportSize({ width: 390, height: 844 });
    });

    await t.test('axe finds no violation in the open dialog (dark and light)', async () => {
      await trigger.click();
      await panel.waitFor();
      try {
        for (const theme of ['dark', 'light']) {
          await page.evaluate((next) => {
            const root = document.body;
            if (next === 'dark') root.setAttribute('data-ds-dark-theme', '');
            else root.removeAttribute('data-ds-dark-theme');
          }, theme);
          await page.waitForTimeout(60);
          const results = await new AxeBuilder({ page }).include('.pui-ss-panel').analyze();
          const summary = results.violations.map(
            (violation) => `${violation.id}:${violation.nodes.length}`,
          );
          assert.deepEqual(
            results.violations.map((violation) => violation.id),
            [],
            `${theme} axe violations: ${summary.join(', ')}`,
          );
        }
        await page.evaluate(() => document.body.setAttribute('data-ds-dark-theme', ''));
      } finally {
        await page.keyboard.press('Escape').catch(() => {});
        await panel.waitFor({ state: 'detached' }).catch(() => {});
      }
    });

    await t.test('small text clears WCAG AA contrast on the composited panel fill', async () => {
      await trigger.click();
      await panel.waitFor();
      try {
        const rows = await page.evaluate(() => {
          const parse = (value) => {
            const nums = (value.match(/[\d.]+/g) || []).map(Number);
            let [r, g, b, a] = nums;
            if (/^color\(/.test(value) || (r <= 1 && g <= 1 && b <= 1)) {
              r *= 255;
              g *= 255;
              b *= 255;
            }
            return [r, g, b, a];
          };
          const channel = (v) => {
            const n = v / 255;
            return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
          };
          const lum = ([r, g, b]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
          const blend = (fg, bg) => {
            const alpha = fg.length > 3 && Number.isFinite(fg[3]) ? fg[3] : 1;
            return [0, 1, 2].map((i) => fg[i] * alpha + bg[i] * (1 - alpha));
          };
          const pageBg = parse(getComputedStyle(document.body).backgroundColor).slice(0, 3);
          const panelEl = document.querySelector('.pui-ss-panel');
          const panelBg = blend(parse(getComputedStyle(panelEl).backgroundColor), pageBg);
          const nodes = panelEl.querySelectorAll(
            '.pui-ss-eyebrow,.pui-ss-title,.pui-ss-rowLabel,.pui-ss-rowValue,.pui-ss-rowDesc,.pui-ss-rowMeta,.pui-ss-foot',
          );
          return [...nodes].map((el) => {
            const fg = parse(getComputedStyle(el).color).slice(0, 3);
            const a = lum(fg);
            const b = lum(panelBg);
            return {
              cls: el.className,
              text: el.textContent.trim().slice(0, 20),
              ratio: Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100,
            };
          });
        });
        assert.ok(rows.length >= 8, `checked ${rows.length} text nodes`);
        for (const row of rows) {
          assert.ok(row.ratio >= 4.5, `${row.cls} “${row.text}” contrast ${row.ratio}:1`);
        }
      } finally {
        await page.keyboard.press('Escape').catch(() => {});
        await panel.waitFor({ state: 'detached' }).catch(() => {});
      }
    });

    await t.test('desktop hides the trigger and closes an open panel', async () => {
      if ((await panel.count()) > 0) {
        await page.keyboard.press('Escape');
        await panel.waitFor({ state: 'detached' });
      }
      await trigger.click();
      await panel.waitFor();
      await page.setViewportSize({ width: 1024, height: 800 });
      await panel.waitFor({ state: 'detached' });
      assert.equal(await trigger.isVisible(), false);
      await page.setViewportSize({ width: 390, height: 844 });
    });

    assert.deepEqual(pageErrors, [], 'no runtime errors in the fixture');
  } finally {
    await context.close().catch(() => {});
    await browser.close();
  }
});
