/**
 * Palace UI · phone header session-status popover.
 *
 * Why this exists: the stock per-session readings — the Agent-preset label and
 * the agent-team / subagent-catalog triggers — live in
 * `conversation.session.header.actions`. `styles/30-mobile.css` hides that
 * cluster on a phone (`display: none`) so the title and the view tabs keep
 * their width. The data was therefore rendered but unreachable: tapping
 * something inside a display:none subtree can open a panel whose anchored
 * position is 0×0, i.e. invisible.
 *
 * This component registers its own visible trigger in the header utilities
 * seat and renders its OWN popover. It never clicks a hidden control and never
 * invents a reading: every number comes from the live Client store that the
 * stock header uses.
 *
 * Real data, as read by the stock components:
 *   · mode          — `session.projectionValues.agentPreset` (AgentPresetLabel);
 *                     the shipped label's own text/title is used for the
 *                     localized name and description when it is on the page,
 *                     with the registry ids as a fallback.
 *   · team          — the Lead Session's `agentTeam` projection
 *                     (experimental-client-ui-agent-team). A teammate session
 *                     reads its direct parent, exactly like TeamAction.
 *   · subagents     — the current Session's `subagentCatalog` projection
 *                     (client-ui-subagent): direct children, mode and label.
 *   · running/idle  — `useSessionStatus`, falling back to the list `running`
 *                     flag (the same preference the shipped rows use).
 *
 * Actions are real navigation, not a local copy of the feature:
 *   · mode row     — opens the real Settings dialog (the shipped launcher →
 *                    account-menu 「设置」 route, because the public
 *                    `ctx.shortcuts` face in 0.2.1-rc.5 has no `invoke`;
 *                    `settings.open` is still used when a build exposes it),
 *                    then selects the `Agent 预设` section.
 *   · team member  — `ctx.uiWorkspace.openSession(memberId)`.
 *   · subagent     — `ctx.uiWorkspace.openSession({ parentSessionId,
 *                    childSessionId, mode })`; external tasks are not navigable.
 *
 * Wiring: shell/00-mount.js carries
 *   ['sessionStatus', typeof mountSessionStatus === 'function' ? mountSessionStatus : null],
 * so this file only needs to ship. No template inject change is required: the
 * plugin already injects `slots`, `sessions`, `uiWorkspace`, `shortcuts` and
 * `layout`.
 *
 * Placement: `shell.overlay` is a root seat, but header utilities is a session
 * seat with the exact standard props this reading needs, so the trigger lives
 * there (it is visible on the phone layout) and the popover is portalled to
 * document.body with fixed geometry computed from the header anchor and
 * `visualViewport` (keyboard/URL-bar safe). Desktop keeps the stock header.
 */

/** The exact phone-layout media query from styles/30-mobile.css. */
const PUI_SS_MEDIA = '(max-width: 767px), (max-width: 1023px) and (max-height: 480px) and (pointer: coarse)';

const PUI_SS_MARGIN = 8;
const PUI_SS_GAP = 8;
const PUI_SS_MAX_WIDTH = 320;
const PUI_SS_MAX_HEIGHT = 460;
const PUI_SS_MIN_HEIGHT = 96;

/** Agent-preset ids → the shipped Chinese names, used only when the label is absent. */
const PUI_SS_MODE_NAMES = {
  standard: '标准模式',
  ptc: 'PTC 模式',
  minimal: '极简模式',
  cordis: '创造模式',
};

const PUI_SS_PATHS = {
  status: 'M3 12h3.6l2.2-5.2 3.2 10.4 2.1-5.2H21',
  mode: 'M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6zM18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z',
  team:
    'M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 20v-2a4 4 0 0 0-3-3.87M16 2.13a4 4 0 0 1 0 7.75',
  subagent: 'M4 4v9a3 3 0 0 0 3 3h10M13 12l4 4-4 4',
  chevron: 'M9 6l6 6-6 6',
  close: 'M18 6 6 18M6 6l12 12',
  warning: 'M12 4l9 16H3zM12 10v4M12 17h.01',
};

/**
 * Render one local icon (self-contained so the file can be unit-tested and the
 * popover keeps working without the shared icon set).
 * @param name - local icon name.
 * @param size - square edge in CSS px.
 * @returns a React SVG element.
 */
function puiSsIcon(name, size) {
  return h(
    'svg',
    {
      width: size || 16,
      height: size || 16,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.6,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': 'true',
      focusable: 'false',
      'data-pui-ss-icon': name,
    },
    h('path', { d: PUI_SS_PATHS[name] || PUI_SS_PATHS.status }),
  );
}

/**
 * Name for the Agent-preset id. The shipped `AgentPresetLabel` already holds
 * the locale-correct name (and its description in `title`); prefer it, then
 * the shipped registry ids, then the raw id.
 * @param presetId - projection value, possibly undefined.
 * @param shippedText - textContent of the shipped label, when it is on the page.
 * @returns display name, or null when the session records no preset.
 */
function puiSsModeName(presetId, shippedText) {
  const text = typeof shippedText === 'string' ? shippedText.trim() : '';
  if (text && text !== presetId) return text;
  if (typeof presetId === 'string' && presetId.length > 0) {
    return PUI_SS_MODE_NAMES[presetId] || presetId;
  }
  return null;
}

/**
 * Read the shipped Agent-preset label (the element hidden with the header
 * actions on a phone). This is the page's real, localized reading; it is never
 * fabricated and the fallback map above covers a missing/unmounted label.
 * @param doc - document-like object (injected for tests).
 * @returns `{ text, description }` or null.
 */
function puiSsReadModeLabel(doc) {
  if (!doc || typeof doc.querySelector !== 'function') return null;
  const el = doc.querySelector(
    'header.wSkVaW_header .wSkVaW_headerActions [class*="SVAs4q_label"]',
  );
  if (!el) return null;
  const text = typeof el.textContent === 'string' ? el.textContent.trim() : '';
  const description = typeof el.getAttribute === 'function' ? el.getAttribute('title') : null;
  if (!text && !description) return null;
  return { text: text || undefined, description: description || undefined };
}

/**
 * One projection snapshot, normalised for the reading below.
 * @param projections - `sessions.list.projectionsBySession`.
 * @param sessionId - owner of the projection.
 * @returns `{ value, state, error }`.
 */
function puiSsProjection(projections, sessionId) {
  const snapshot = projections && projections[sessionId];
  if (!snapshot) return { data: {}, state: 'idle', error: null };
  return {
    data: snapshot.values || {},
    state: snapshot.state || 'idle',
    error: snapshot.error || null,
  };
}

/**
 * Collapse projection lifecycle + refresh status into the few states the panel
 * shows. `missing` distinguishes "no team" from "no subagents" once a baseline
 * read has settled.
 * @param hasValue - whether the projection key exists.
 * @param state - projection lifecycle.
 * @param settled - whether the on-open baseline read completed.
 * @param missing - state name used when the value is legitimately absent.
 * @returns 'ready' | 'loading' | 'error' | 'migration' | missing.
 */
function puiSsValueState(hasValue, state, settled, missing) {
  if (hasValue) return 'ready';
  if (state === 'error') return 'error';
  if (state === 'migration-required') return 'migration';
  if (state === 'loading') return 'loading';
  if (settled) return missing;
  return 'loading';
}

/**
 * Status of one Session identity, from the unified status map with the list
 * `running` flag as the shipped fallback.
 * @param statuses - `useSessionStatus` snapshot (Map or plain object).
 * @param byId - session list rows.
 * @param id - Session identity.
 * @returns true/false/undefined.
 */
function puiSsRunning(statuses, byId, id) {
  let status;
  if (statuses && typeof statuses.get === 'function') status = statuses.get(id);
  else if (statuses && typeof statuses === 'object') status = statuses[id];
  if (status && typeof status.running === 'boolean') return status.running;
  const row = byId && byId[id];
  return row && typeof row.running === 'boolean' ? row.running : undefined;
}

/**
 * Derive every reading the popover shows. Pure: the component and the tests
 * feed it the exact Client store snapshots the stock header reads.
 *
 * @param input - `{ sessionId, summary, address, projections, statuses, byId,
 *   listPhase, refreshSettled, modeLabel }`.
 * @returns `{ sessionId, title, mode, team, subagents, anyRunning }`.
 */
function puiSsReading(input) {
  const sessionId = input && input.sessionId;
  const summary = (input && input.summary) || null;
  const address = input && input.address;
  const projections = (input && input.projections) || {};
  const statuses = input && input.statuses;
  const byId = (input && input.byId) || {};
  const listPhase = input && input.listPhase;
  const settled = !!(input && input.refreshSettled);
  const modeLabel = (input && input.modeLabel) || null;

  // TeamAction reads the Lead Session: a teammate conversation shows the team
  // that owns it, while a plain child reads its own (empty) projection.
  const leadSessionId = (address && address.parentSessionId) || sessionId;
  const teamSnap = puiSsProjection(projections, leadSessionId);
  const rawTeam = teamSnap.data.agentTeam;
  const teamState = puiSsValueState(
    rawTeam !== undefined,
    teamSnap.state,
    settled && !(listPhase === 'pending' || listPhase === 'loading'),
    'unavailable',
  );
  const teamMembers = [];
  const teamTasks = [];
  if (rawTeam && Array.isArray(rawTeam.members)) {
    for (const member of rawTeam.members) {
      if (!member || typeof member.id !== 'string' || member.id.length === 0) continue;
      const row = byId[member.id];
      teamMembers.push({
        id: member.id,
        name:
          typeof member.name === 'string' && member.name.length > 0
            ? member.name
            : (row && row.displayTitle) || member.id,
        role: member.role === 'lead' ? 'lead' : 'teammate',
        phase: member.phase === 'provisioning' || member.phase === 'failed' ? member.phase : 'active',
        error: typeof member.error === 'string' ? member.error : undefined,
        running: puiSsRunning(statuses, byId, member.id) === true,
        current: member.id === sessionId,
      });
    }
  }
  if (rawTeam && Array.isArray(rawTeam.tasks)) {
    for (const task of rawTeam.tasks) {
      if (!task || task.status === 'deleted') continue;
      teamTasks.push(task);
    }
  }
  const teamRunning = teamMembers.filter((member) => member.running).length;

  const subSnap = puiSsProjection(projections, sessionId);
  const rawSub = subSnap.data.subagentCatalog;
  const subState = puiSsValueState(rawSub !== undefined, subSnap.state, settled, 'empty');
  const subagents = [];
  if (Array.isArray(rawSub)) {
    for (const entry of rawSub) {
      if (!entry || typeof entry.id !== 'string' || entry.id.length === 0) continue;
      const row = byId[entry.id];
      const mode = entry.mode === 'one-shot' || entry.mode === 'continuable' || entry.mode === 'external' ? entry.mode : 'unknown';
      subagents.push({
        id: entry.id,
        mode,
        label:
          typeof entry.label === 'string' && entry.label.length > 0
            ? entry.label
            : (row && row.displayTitle) || entry.id,
        title: (row && row.title) || (row && row.displayTitle) || entry.id,
        running: puiSsRunning(statuses, byId, entry.id) === true,
        navigable: mode !== 'external',
      });
    }
  }
  const subRunning = subagents.filter((entry) => entry.running).length;

  const presetId =
    summary && summary.projectionValues && typeof summary.projectionValues.agentPreset === 'string'
      ? summary.projectionValues.agentPreset
      : undefined;
  const mode = {
    id: presetId,
    name: puiSsModeName(presetId, modeLabel && modeLabel.text),
    description: modeLabel && modeLabel.description,
  };

  const failure =
    rawTeam && typeof rawTeam.failure === 'string' && rawTeam.failure.length > 0
      ? rawTeam.failure
      : undefined;

  return {
    sessionId,
    title: (summary && (summary.displayTitle || summary.title)) || '',
    mode,
    team: {
      leadSessionId,
      state: teamState,
      members: teamMembers,
      count: teamMembers.length,
      runningCount: teamRunning,
      tasks: teamTasks,
      taskCount: teamTasks.length,
      openTaskCount: teamTasks.filter(
        (task) => task.status === 'pending' || task.status === 'in_progress',
      ).length,
      error: teamSnap.error,
      failure,
    },
    subagents: {
      state: subState,
      items: subagents,
      count: subagents.length,
      runningCount: subRunning,
      error: subSnap.error,
    },
    anyRunning: teamRunning > 0 || subRunning > 0,
  };
}

/** Human text for one member's status (never colour-only). */
function puiSsMemberStatus(member) {
  if (member.phase === 'failed') return { key: 'failed', text: '失败' };
  if (member.running) return { key: 'running', text: '运行中' };
  if (member.phase === 'provisioning') return { key: 'provisioning', text: '准备中' };
  return { key: 'idle', text: '空闲' };
}

/** Human text for one subagent row. */
function puiSsSubagentStatus(entry) {
  if (entry.running) return { key: 'running', text: '运行中' };
  if (entry.mode === 'external') return { key: 'external', text: '外部任务' };
  return { key: 'idle', text: '空闲' };
}

/** `可继续 / 一次性 / 外部 / 未知` for a catalog mode. */
function puiSsSubagentMode(mode) {
  if (mode === 'continuable') return '可继续';
  if (mode === 'one-shot') return '一次性';
  if (mode === 'external') return '外部';
  return '未知';
}

/** Accessible name for the trigger; carries the same counts the panel shows. */
function puiSsTriggerLabel(reading) {
  const mode = reading && reading.mode && reading.mode.name ? `模式 ${reading.mode.name}` : '模式未记录';
  const team =
    reading.team.state === 'ready'
      ? `团队 ${reading.team.count} 人`
      : reading.team.state === 'loading'
        ? '团队读取中'
        : '无团队数据';
  const sub =
    reading.subagents.state === 'ready'
      ? `子代理 ${reading.subagents.count} 个`
      : reading.subagents.state === 'loading'
        ? '子代理读取中'
        : '无子代理数据';
  return `会话状态：${mode}，${team}，${sub}`;
}

/**
 * Exact navigation target for one subagent row, in the durable address shape
 * `openSession` accepts. External tasks are not conversations and return null.
 * @param parentSessionId - the catalog owner.
 * @param entry - catalog row.
 * @returns SessionId address object, or null.
 */
function puiSsSubagentTarget(parentSessionId, entry) {
  if (!entry || entry.navigable === false) return null;
  const mode = entry.mode === 'continuable' || entry.mode === 'one-shot' ? entry.mode : 'unknown';
  return { parentSessionId, childSessionId: entry.id, mode };
}

/**
 * Measure the visual viewport for placement. Effects only (SSR safe).
 * @returns `{ width, layoutHeight, visualTop, visualHeight }`.
 */
function puiSsViewport() {
  if (typeof window === 'undefined') {
    return { width: 390, layoutHeight: 844, visualTop: 0, visualHeight: 844 };
  }
  const vv = window.visualViewport;
  return {
    width: vv ? vv.width : window.innerWidth,
    layoutHeight: window.innerHeight,
    visualTop: vv ? vv.offsetTop : 0,
    visualHeight: vv ? vv.height : window.innerHeight,
  };
}

/**
 * Fixed geometry for the popover. Anchored below the header anchor and
 * clamped to the visual viewport, so an open software keyboard or a
 * collapsible URL bar narrows the panel instead of hiding it.
 *
 * @param rect - anchor rect (the header, or the trigger when it is not inside one).
 * @param view - puiSsViewport() result.
 * @returns inline style fields plus `placement`.
 */
function puiSsPlacement(rect, view) {
  const vw = Math.max(240, view.width || 390);
  const top = view.visualTop || 0;
  const visibleBottom = top + (view.visualHeight || view.layoutHeight || 640);
  const width = Math.min(PUI_SS_MAX_WIDTH, Math.max(200, vw - PUI_SS_MARGIN * 2));
  const anchorRight = typeof rect.right === 'number' ? rect.right : (rect.left || 0) + 44;
  const left = Math.min(
    Math.max(PUI_SS_MARGIN, anchorRight - width),
    Math.max(PUI_SS_MARGIN, vw - width - PUI_SS_MARGIN),
  );
  const belowTop = (rect.bottom || 0) + PUI_SS_GAP;
  const below = visibleBottom - belowTop - PUI_SS_MARGIN;
  const above = (rect.top || 0) - top - PUI_SS_GAP - PUI_SS_MARGIN;
  const openAbove = below < 200 && above > below;
  if (openAbove) {
    const maxHeight = Math.max(PUI_SS_MIN_HEIGHT, Math.min(PUI_SS_MAX_HEIGHT, above));
    return {
      left,
      width,
      bottom: (view.layoutHeight || visibleBottom) - (rect.top || 0) + PUI_SS_GAP,
      maxHeight,
      placement: 'above',
    };
  }
  const maxHeight = Math.max(PUI_SS_MIN_HEIGHT, Math.min(PUI_SS_MAX_HEIGHT, below));
  return { left, width, top: belowTop, maxHeight, placement: 'below' };
}

/** Strip `placement` before handing the geometry to React's style prop. */
function puiSsStyleOf(placement) {
  if (!placement) return { position: 'fixed', left: 0, top: 0, visibility: 'hidden' };
  const style = {
    position: 'fixed',
    left: placement.left,
    width: placement.width,
    maxHeight: placement.maxHeight,
  };
  if (typeof placement.top === 'number') style.top = placement.top;
  if (typeof placement.bottom === 'number') style.bottom = placement.bottom;
  return style;
}

/**
 * The shipped settings launcher. On a phone the sidebar is display:none, but
 * its dialog is portalled to <body>, so a programmatic click still opens the
 * real settings surface; the account-menu entry below is the 0.2.1-rc.5 path.
 * @param doc - document-like object.
 * @returns the trigger element, or null.
 */
function puiSsSettingsLauncher(doc) {
  if (!doc || typeof doc.querySelector !== 'function') return null;
  return (
    doc.querySelector('[data-slot="settings.launcher"] button') ||
    doc.querySelector('[data-slot="sidebar.settings"] button[aria-haspopup]') ||
    doc.querySelector('button[aria-label="账号菜单"]') ||
    doc.querySelector('button[aria-label="Account menu"]')
  );
}

/**
 * The account menu's settings row. Exact labels only: "设置" / "Settings"
 * (the shipped copy), so another menu item can never be mistaken for it.
 * @param doc - document-like object.
 * @returns the menu item, or null.
 */
function puiSsSettingsMenuItem(doc) {
  if (!doc || typeof doc.querySelectorAll !== 'function') return null;
  const items = doc.querySelectorAll('[role="menuitem"], [role="option"]');
  for (const item of items) {
    const text = typeof item.textContent === 'string' ? item.textContent.trim() : '';
    if (text === '设置' || text === 'Settings' || text === '偏好设置' || text === 'Preferences') {
      return item;
    }
  }
  return null;
}

/**
 * Find the real "Agent 预设" settings nav row inside the opened Settings
 * dialog. Locale-aware for the shipped zh/en labels; returns null when the row
 * is absent, in which case the dialog simply stays on its current section.
 * @param root - Settings dialog element.
 * @returns the nav button, or null.
 */
function puiSsFindAgentPresetSection(root) {
  if (!root || typeof root.querySelectorAll !== 'function') return null;
  const buttons = root.querySelectorAll('nav button');
  for (const button of buttons) {
    const text = typeof button.textContent === 'string' ? button.textContent.trim() : '';
    if (!/(预设|presets?)/i.test(text)) continue;
    if (/(子代理|subagent|循环|loop)/i.test(text)) continue;
    return button;
  }
  return null;
}

/**
 * Open the real mode entry and put the Agent-preset section in front.
 *
 * 0.2.1-rc.5 exposes `shortcuts.register` but not `shortcuts.invoke` on the
 * public face, so the shipped path on a phone is the real launcher →
 * account-menu 「设置」 (the same route the Palace palette uses). Once the
 * dialog exists, the nav row whose label is the shipped "Agent 预设" /
 * "Agent presets" is selected; if that row is missing (another locale), the
 * dialog still opens on its default section instead of pretending otherwise.
 *
 * @param shortcuts - `ctx.shortcuts` face (invoke used when a build has it).
 * @param doc - document (injected for tests).
 * @param raf - frame scheduler (injected for tests).
 * @returns whether a real entry was taken.
 */
function puiSsOpenModeSettings(shortcuts, doc, raf) {
  const documentRef = doc || (typeof document !== 'undefined' ? document : null);
  if (!documentRef || typeof documentRef.querySelector !== 'function') return false;
  // setTimeout, not requestAnimationFrame: the menu/dialog mount across a few
  // ticks, and a backgrounded tab pauses rAF entirely.
  const schedule = raf || ((cb) => setTimeout(cb, 16));
  const dialogOpen = () => {
    try {
      return documentRef.querySelector('[data-shortcut-modal="settings"]');
    } catch (err) {
      return null;
    }
  };
  const already = dialogOpen();
  if (already) {
    // Already open: `settings.open` would CLOSE it (the command toggles), so
    // only reveal the section.
    const section = puiSsFindAgentPresetSection(already);
    if (section && typeof section.click === 'function') section.click();
    return true;
  }

  let invoked = false;
  try {
    if (shortcuts && typeof shortcuts.invoke === 'function') {
      shortcuts.invoke('settings.open', {
        source: 'menu',
        region: 'page',
        modal: null,
        target: null,
      });
      invoked = true;
    }
  } catch (err) {
    console.warn('[palace-ui] session-status: settings.open failed', err);
  }

  let launcherClicked = false;
  const step = (phase, tries) => {
    const dialog = dialogOpen();
    if (dialog) {
      const section = puiSsFindAgentPresetSection(dialog);
      if (section && typeof section.click === 'function') {
        try {
          section.click();
        } catch (err) {
          /* the dialog is still usable on its default section */
        }
        return;
      }
      // The dialog can mount before its nav ledger fills in; keep waiting for
      // the real row instead of leaving the user on the default section.
      if (tries < 48) schedule(() => step('dialog', tries + 1));
      return;
    }
    if (phase === 'launcher') {
      const launcher = puiSsSettingsLauncher(documentRef);
      if (!launcher) return;
      const expanded =
        typeof launcher.getAttribute === 'function'
          ? launcher.getAttribute('aria-expanded')
          : null;
      if (!launcherClicked) {
        launcherClicked = true;
        // Clicking an already-open launcher would close its menu.
        if (expanded !== 'true') {
          try {
            launcher.click();
          } catch (err) {
            return;
          }
        }
      }
      phase = 'menu';
    } else if (phase === 'menu') {
      const item = puiSsSettingsMenuItem(documentRef);
      if (item) {
        try {
          item.click();
        } catch (err) {
          return;
        }
        phase = 'dialog';
      }
    }
    if (tries < 48) {
      schedule(() => step(phase, tries + 1));
    } else if (phase === 'menu' && typeof documentRef.dispatchEvent === 'function') {
      // We opened a menu and never found the row: close it again.
      try {
        documentRef.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      } catch (err) {
        /* nothing sensible left to do */
      }
    }
  };
  schedule(() => step(invoked ? 'dialog' : 'launcher', 0));
  return true;
}

/**
 * One popover row for a real reading. Interactive rows are buttons; rows whose
 * data is absent/loading are static, so nothing looks tappable that cannot act.
 */
function PuiSsSummaryRow(props) {
  const { rowKey, rowIcon, label, value, description, meta, expanded, interactive, onClick } = props;
  const content = [
    h('span', { className: 'pui-ss-rowIcon', 'aria-hidden': 'true', key: 'icon' }, rowIcon),
    h(
      'span',
      { className: 'pui-ss-rowMain', key: 'main' },
      h('span', { className: 'pui-ss-rowLabel', key: 'label' }, label),
      h('span', { className: 'pui-ss-rowValue', key: 'value' }, value),
      description ? h('span', { className: 'pui-ss-rowDesc', key: 'desc' }, description) : null,
    ),
    meta ? h('span', { className: 'pui-ss-rowMeta', key: 'meta' }, meta) : null,
    interactive
      ? h(
          'span',
          {
            className: 'pui-ss-chevron',
            'data-expanded': expanded ? 'true' : undefined,
            'aria-hidden': 'true',
            key: 'chev',
          },
          puiSsIcon('chevron', 14),
        )
      : null,
  ];
  if (!interactive) {
    return h(
      'div',
      { className: 'pui-ss-row', 'data-static': 'true', 'data-row': rowKey },
      content,
    );
  }
  return h(
    'button',
    {
      type: 'button',
      className: 'pui-ss-row',
      'data-row': rowKey,
      'aria-expanded': expanded === undefined ? undefined : expanded ? 'true' : 'false',
      onClick,
    },
    content,
  );
}

/**
 * The popover itself: a real dialog surface with the three readings, inline
 * disclosures for team/subagent detail, and row-level focus/status treatments.
 * No hooks — it is also rendered directly by the tests via react-dom/server.
 */
function PuiSsPanel(props) {
  const {
    reading,
    placement,
    panelId,
    panelRef,
    closeRef,
    expanded,
    onToggle,
    onClose,
    onMode,
    onOpenMember,
    onOpenSubagent,
    onKeyDown,
    onDownload,
    onFeedback,
    canDownload,
    canFeedback,
  } = props;
  const team = reading.team;
  const sub = reading.subagents;
  const teamListId = `${panelId}-team`;
  const subListId = `${panelId}-sub`;

  let teamValue;
  let teamMeta;
  let teamInteractive = false;
  if (team.state === 'ready' && team.count > 0) {
    teamValue =
      team.taskCount > 0
        ? `${team.count} 名成员 · ${team.taskCount} 个任务`
        : `${team.count} 名成员`;
    teamMeta = '详情';
    teamInteractive = true;
  } else if (team.state === 'ready') {
    teamValue = '无团队成员';
    teamMeta = '—';
  } else if (team.state === 'loading') {
    teamValue = '读取中…';
    teamMeta = '—';
  } else if (team.state === 'error') {
    teamValue = '读取失败';
    teamMeta = '—';
  } else if (team.state === 'migration') {
    teamValue = '需要迁移会话记录';
    teamMeta = '—';
  } else {
    teamValue = '无团队数据';
    teamMeta = '—';
  }

  let subValue;
  let subMeta;
  let subInteractive = false;
  if (sub.state === 'ready' && sub.count > 0) {
    subValue =
      sub.runningCount > 0
        ? `${sub.count} 个子代理 · ${sub.runningCount} 运行中`
        : `${sub.count} 个子代理`;
    subMeta = '详情';
    subInteractive = true;
  } else if (sub.state === 'ready') {
    subValue = '无子代理';
    subMeta = '—';
  } else if (sub.state === 'loading') {
    subValue = '读取中…';
    subMeta = '—';
  } else if (sub.state === 'error') {
    subValue = '读取失败';
    subMeta = '—';
  } else if (sub.state === 'migration') {
    subValue = '需要迁移会话记录';
    subMeta = '—';
  } else {
    subValue = '无子代理';
    subMeta = '—';
  }

  const modeValue = reading.mode.name || '未记录';
  const teamDetail =
    expanded === 'team' && team.state === 'ready'
      ? h(
          'div',
          { className: 'pui-ss-group', id: teamListId, role: 'group', 'aria-label': '团队成员' },
          h(
            'div',
            { className: 'pui-ss-groupHead' },
            h('span', null, '团队成员'),
            h(
              'span',
              null,
              team.runningCount > 0
                ? `${team.count} 名 · ${team.runningCount} 运行中`
                : `${team.count} 名`,
            ),
          ),
          team.members.length === 0
            ? h('p', { className: 'pui-ss-note' }, '团队编队为空。')
            : team.members.map((member) => {
                const status = puiSsMemberStatus(member);
                const role = member.role === 'lead' ? 'Lead' : '成员';
                const detail = role;
                const body = [
                  h(
                    'span',
                    { className: 'pui-ss-itemMain', key: 'main' },
                    h('span', { className: 'pui-ss-itemName' }, member.name),
                    h('span', { className: 'pui-ss-itemMeta' }, detail),
                  ),
                  h(
                    'span',
                    { className: 'pui-ss-state', 'data-state': status.key, key: 'state' },
                    h('span', { className: 'pui-ss-dot', 'aria-hidden': 'true' }),
                    status.text,
                  ),
                ];
                if (member.current) {
                  return h(
                    'div',
                    {
                      className: 'pui-ss-item',
                      'data-current': 'true',
                      key: member.id,
                      'aria-current': 'true',
                    },
                    body,
                    h('span', { className: 'pui-ss-tag' }, '当前'),
                  );
                }
                return h(
                  'button',
                  {
                    type: 'button',
                    className: 'pui-ss-item',
                    key: member.id,
                    onClick: () => onOpenMember(member.id),
                    title: member.error,
                  },
                  body,
                  h('span', { className: 'pui-ss-sr', key: 'action' }, '打开会话'),
                );
              }),
          team.failure
            ? h(
                'p',
                { className: 'pui-ss-note', 'data-tone': 'warn', role: 'alert' },
                h('span', { className: 'pui-ss-noteIcon', 'aria-hidden': 'true' }, puiSsIcon('warning', 14)),
                `团队记录有误：${team.failure}`,
              )
            : null,
        )
      : null;

  const subDetail =
    expanded === 'sub' && sub.state === 'ready'
      ? h(
          'div',
          { className: 'pui-ss-group', id: subListId, role: 'group', 'aria-label': '子代理' },
          h(
            'div',
            { className: 'pui-ss-groupHead' },
            h('span', null, '子代理'),
            h(
              'span',
              null,
              sub.runningCount > 0 ? `${sub.count} 个 · ${sub.runningCount} 运行中` : `${sub.count} 个`,
            ),
          ),
          sub.items.length === 0
            ? h('p', { className: 'pui-ss-note' }, '这个会话还没有子代理。')
            : sub.items.map((entry) => {
                const status = puiSsSubagentStatus(entry);
                const modeText = puiSsSubagentMode(entry.mode);
                const meta = entry.navigable ? modeText : '不可打开';
                const body = [
                  h(
                    'span',
                    { className: 'pui-ss-itemMain', key: 'main' },
                    h('span', { className: 'pui-ss-itemName' }, entry.label),
                    h('span', { className: 'pui-ss-itemMeta' }, meta),
                  ),
                  h(
                    'span',
                    { className: 'pui-ss-state', 'data-state': status.key, key: 'state' },
                    h('span', { className: 'pui-ss-dot', 'aria-hidden': 'true' }),
                    status.text,
                  ),
                ];
                if (!entry.navigable) {
                  return h(
                    'div',
                    {
                      className: 'pui-ss-item',
                      'data-static': 'true',
                      key: entry.id,
                      title: '外部任务没有可打开的本地会话',
                    },
                    body,
                  );
                }
                return h(
                  'button',
                  {
                    type: 'button',
                    className: 'pui-ss-item',
                    key: entry.id,
                    onClick: () => onOpenSubagent(entry),
                    title: entry.title,
                  },
                  body,
                  h('span', { className: 'pui-ss-sr', key: 'action' }, '打开会话'),
                );
              }),
        )
      : null;

  return h(
    'div',
    {
      ref: panelRef,
      id: panelId,
      className: 'pui-ss-panel',
      role: 'dialog',
      'aria-modal': 'false',
      'aria-label': '会话状态',
      tabIndex: -1,
      style: puiSsStyleOf(placement),
      'data-placement': placement ? placement.placement : 'below',
      onKeyDown,
    },
    h(
      'div',
      { className: 'pui-ss-head' },
      h(
        'div',
        { className: 'pui-ss-headText' },
        h('span', { className: 'pui-ss-eyebrow' }, '会话状态'),
        reading.title
          ? h('span', { className: 'pui-ss-title', title: reading.title }, reading.title)
          : null,
      ),
      h(
        'button',
        {
          ref: closeRef,
          type: 'button',
          className: 'pui-ss-close',
          'aria-label': '关闭会话状态',
          onClick: onClose,
        },
        puiSsIcon('close', 14),
      ),
    ),
    h(
      'div',
      { className: 'pui-ss-body' },
      h(PuiSsSummaryRow, {
        rowKey: 'mode',
        rowIcon: puiSsIcon('mode', 16),
        label: '模式',
        value: modeValue,
        description: reading.mode.description,
        meta: reading.mode.id ? '设置' : '打开设置',
        interactive: true,
        onClick: onMode,
      }),
      h(PuiSsSummaryRow, {
        rowKey: 'team',
        rowIcon: puiSsIcon('team', 16),
        label: '团队',
        value: teamValue,
        meta: teamMeta,
        interactive: teamInteractive,
        expanded: expanded === 'team',
        onClick: () => onToggle('team'),
      }),
      teamDetail,
      h(PuiSsSummaryRow, {
        rowKey: 'subagents',
        rowIcon: puiSsIcon('subagent', 16),
        label: '子代理',
        value: subValue,
        meta: subMeta,
        interactive: subInteractive,
        expanded: expanded === 'sub',
        onClick: () => onToggle('sub'),
      }),
      subDetail,
      team.state === 'error'
        ? h(
            'p',
            { className: 'pui-ss-note', 'data-tone': 'error', role: 'alert' },
            '团队信息读取失败',
            team.error && team.error.message ? `：${team.error.message}` : '。',
          )
        : null,
      sub.state === 'error'
        ? h(
            'p',
            { className: 'pui-ss-note', 'data-tone': 'error', role: 'alert' },
            '子代理目录读取失败',
            sub.error && sub.error.message ? `：${sub.error.message}` : '。',
          )
        : null,
      team.state === 'unavailable'
        ? h(
            'p',
            { className: 'pui-ss-note' },
            '这个会话没有可读取的团队编队（Agent 团队未启用，或尚未创建团队）。',
          )
        : null,
    ),
    h(
      'div',
      { className: 'pui-ss-foot' },
      canDownload || canFeedback
        ? h(
            'div',
            { className: 'pui-ss-footActions', role: 'group', 'aria-label': '会话操作' },
            canDownload
              ? h(
                  'button',
                  {
                    type: 'button',
                    className: 'pui-ss-action',
                    onClick: onDownload,
                  },
                  '下载 Session 日志',
                )
              : null,
            canFeedback
              ? h(
                  'button',
                  {
                    type: 'button',
                    className: 'pui-ss-action',
                    onClick: onFeedback,
                  },
                  '反馈',
                )
              : null,
          )
        : null,
      h('p', { className: 'pui-ss-note pui-ss-footNote' }, '数据来自当前会话，随会话状态更新'),
    ),
  );
}

/**
 * Body portal. `react-dom` is a module-loader seed like `react`; when it is
 * unavailable (or during static rendering) the panel renders in place, and
 * its fixed geometry still escapes the header's `overflow: hidden`.
 */
function PuiSsPortal(props) {
  if (typeof document === 'undefined' || !document.body) return props.children;
  let dom = null;
  try {
    if (typeof require === 'function') dom = require('react-dom');
  } catch (err) {
    dom = null;
  }
  if (dom && typeof dom.createPortal === 'function') {
    return dom.createPortal(props.children, document.body);
  }
  return props.children;
}

/**
 * The header trigger + phone popover.
 *
 * Standard session header props (`sessionId`, `useSession`, `useSessions`,
 * `useSessionStatus`) come from the slot owner; `services` is injected by
 * `mountSessionStatus`.
 */
function PuiSessionStatus(props) {
  const { sessionId, useSessions, useSession, useSessionStatus, services } = props;
  const sessionsHook = typeof useSessions === 'function' ? useSessions : (selector) => selector(undefined);
  const sessionHook = typeof useSession === 'function' ? useSession : (selector) => selector(undefined);
  const statusHook =
    typeof useSessionStatus === 'function' ? useSessionStatus : (selector) => selector(undefined);

  const list = sessionsHook((state) => state);
  const summary = sessionsHook((state) => (state && state.byId ? state.byId[sessionId] : undefined));
  const projections = sessionsHook((state) => (state && state.projectionsBySession) || {});
  const statuses = statusHook((value) => value);
  const address = sessionHook((snapshot) => (snapshot && snapshot.subagent ? snapshot.subagent.address : undefined));

  const [open, setOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState(null);
  const [placement, setPlacement] = React.useState(null);
  const [modeLabel, setModeLabel] = React.useState(null);
  const [settled, setSettled] = React.useState(false);
  const triggerRef = React.useRef(null);
  const panelRef = React.useRef(null);
  const closeRef = React.useRef(null);
  const frameRef = React.useRef(0);
  const sessionRef = React.useRef(sessionId);
  const rawId = React.useId();
  const panelId = `pui-ss-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const reading = puiSsReading({
    sessionId,
    summary,
    address,
    projections,
    statuses,
    byId: (list && list.byId) || {},
    listPhase: list && list.phase,
    refreshSettled: settled,
    modeLabel,
  });

  const close = React.useCallback((restoreFocus) => {
    setOpen(false);
    setExpanded(null);
    // Focus synchronously: the trigger outlives the panel, and this must also
    // work when the page is backgrounded and animation frames are throttled.
    if (restoreFocus) {
      const trigger = triggerRef.current;
      if (trigger) trigger.focus({ preventScroll: true });
    }
  }, []);

  const openPanel = React.useCallback(() => {
    setOpen(true);
    setExpanded(null);
    setModeLabel(services && services.readModeLabel ? services.readModeLabel() : null);
    setSettled(false);
  }, [services]);

  const toggle = React.useCallback(() => {
    if (open) close(true);
    else openPanel();
  }, [open, close, openPanel]);

  const openTarget = React.useCallback(
    (target) => {
      const ok = services && services.openSession ? services.openSession(target) : false;
      if (ok) close(false);
    },
    [services, close],
  );

  // Switching conversations closes the surface; the old readings are stale.
  React.useEffect(() => {
    if (sessionRef.current === sessionId) return;
    sessionRef.current = sessionId;
    setOpen(false);
    setExpanded(null);
  }, [sessionId]);

  // On open: read the shipped mode label, and ask the real Client for a
  // projection baseline so an unopened conversation still reports truth.
  React.useEffect(() => {
    if (!open) {
      setPlacement(null);
      return undefined;
    }
    setModeLabel(services && services.readModeLabel ? services.readModeLabel() : null);
    setSettled(false);
    let alive = true;
    const jobs = [];
    if (services && typeof services.refresh === 'function') {
      jobs.push(services.refresh(sessionId));
      if (reading.team.leadSessionId && reading.team.leadSessionId !== sessionId) {
        jobs.push(services.refresh(reading.team.leadSessionId));
      }
    }
    Promise.all(jobs.map((job) => Promise.resolve(job).catch(() => {}))).then(() => {
      if (alive) setSettled(true);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sessionId, services]);

  // Real placement + dismissal + focus ownership while open.
  React.useEffect(() => {
    if (!open) return undefined;
    const measure = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const anchorEl = (trigger.closest && trigger.closest('header')) || trigger;
      const rect = anchorEl.getBoundingClientRect();
      setPlacement(puiSsPlacement(rect, puiSsViewport()));
    };
    measure();
    const schedule = () => {
      if (frameRef.current) return;
      const raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (cb) => setTimeout(cb, 16);
      frameRef.current = raf(() => {
        frameRef.current = 0;
        measure();
      });
    };
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    if (vv) {
      vv.addEventListener('resize', schedule);
      vv.addEventListener('scroll', schedule);
    }
    const onPointerDown = (event) => {
      const target = event.target;
      if (!target) return;
      if (panelRef.current && panelRef.current.contains(target)) return;
      if (triggerRef.current && triggerRef.current.contains(target)) return;
      close(false);
    };
    const onKey = (event) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      event.preventDefault();
      event.stopPropagation();
      close(true);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKey);
    return () => {
      if (frameRef.current) {
        const cancel = typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : clearTimeout;
        cancel(frameRef.current);
        frameRef.current = 0;
      }
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      if (vv) {
        vv.removeEventListener('resize', schedule);
        vv.removeEventListener('scroll', schedule);
      }
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  // Focus the dialog once its geometry is applied. A plain effect (not rAF)
  // works even when the page is backgrounded and frames are throttled; the
  // panel is still visibility:hidden while placement is null.
  React.useEffect(() => {
    if (!open || !placement) return;
    const panel = panelRef.current;
    if (panel && !panel.contains(document.activeElement)) panel.focus({ preventScroll: true });
  }, [open, placement]);

  // Leaving the phone layout (trigger hidden by CSS) must not orphan the panel.
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const mq = window.matchMedia(PUI_SS_MEDIA);
    const onChange = () => {
      if (!mq.matches) close(false);
    };
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onChange);
    else if (typeof mq.addListener === 'function') mq.addListener(onChange);
    return () => {
      if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', onChange);
      else if (typeof mq.removeListener === 'function') mq.removeListener(onChange);
    };
  }, [close]);

  const onPanelKeyDown = (event) => {
    const panel = panelRef.current;
    if (!panel) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    }
    const focusables = () => {
      const nodes = panel.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])');
      return Array.from(nodes).filter((node) => node.getClientRects && node.getClientRects().length > 0);
    };
    if (event.key === 'Tab') {
      const nodes = focusables();
      if (nodes.length === 0) {
        event.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      const nodes = focusables();
      if (nodes.length === 0) return;
      event.preventDefault();
      const index = nodes.indexOf(document.activeElement);
      let next = 0;
      if (event.key === 'End') next = nodes.length - 1;
      else if (event.key === 'ArrowDown') next = index < 0 ? 0 : (index + 1) % nodes.length;
      else if (event.key === 'ArrowUp') next = index < 0 ? nodes.length - 1 : (index - 1 + nodes.length) % nodes.length;
      nodes[next].focus();
    }
  };

  const panel = open
    ? h(
        PuiSsPortal,
        null,
        h(PuiSsPanel, {
          reading,
          placement,
          panelId,
          panelRef,
          closeRef,
          expanded,
          onToggle: (key) => setExpanded((current) => (current === key ? null : key)),
          onClose: () => close(true),
          onMode: () => {
            close(false);
            if (services && services.openMode) services.openMode();
          },
          onOpenMember: (id) => {
            close(false);
            openTarget(id);
          },
          onOpenSubagent: (entry) => {
            close(false);
            openTarget(puiSsSubagentTarget(sessionId, entry));
          },
          canDownload: typeof services.canDownload === 'function' && services.canDownload(),
          canFeedback: typeof services.canFeedback === 'function' && services.canFeedback(),
          onDownload: () => {
            close(false);
            services.download(sessionId);
          },
          onFeedback: () => {
            close(false);
            services.feedback(sessionId);
          },
          onKeyDown: onPanelKeyDown,
        }),
      )
    : null;

  return h(
    React.Fragment,
    null,
    h(
      'span',
      { className: 'pui-ss', 'data-open': open ? '1' : undefined },
      h(
        'button',
        {
          ref: triggerRef,
          type: 'button',
          className: 'pui-ss-trigger',
          'aria-label': puiSsTriggerLabel(reading),
          'aria-haspopup': 'dialog',
          'aria-expanded': open ? 'true' : 'false',
          'aria-controls': open ? panelId : undefined,
          title: '会话状态',
          onClick: toggle,
        },
        h('span', { className: 'pui-ss-triggerIcon', 'aria-hidden': 'true' }, puiSsIcon('status', 18)),
        reading.anyRunning
          ? h('span', { className: 'pui-ss-badge', 'aria-hidden': 'true', 'data-tone': 'running' })
          : null,
      ),
    ),
    panel,
  );
}

/**
 * Register the header trigger. Returns nothing: `register` owns disposal
 * through the slot fiber, matching the other Palace shell contributions.
 *
 * @param deps - `{ ctx, h, React, register }` from shell/00-mount.js.
 */
function mountSessionStatus({ ctx, register }) {
  const services = {
    /** Real Session navigation (known id or durable subagent address). */
    openSession(target) {
      if (!target) return false;
      try {
        if (ctx && ctx.uiWorkspace && typeof ctx.uiWorkspace.openSession === 'function') {
          ctx.uiWorkspace.openSession(target);
          return true;
        }
      } catch (err) {
        console.warn('[palace-ui] session-status: openSession failed', err);
      }
      return false;
    },
    /** Real mode entry: the shipped Settings dialog, Agent-preset section. */
    openMode() {
      return puiSsOpenModeSettings(ctx && ctx.shortcuts);
    },
    /** Real projection baseline for the current/Lead Session. */
    refresh(sessionId) {
      try {
        if (ctx && ctx.sessions && typeof ctx.sessions.refreshProjections === 'function') {
          return ctx.sessions.refreshProjections(sessionId);
        }
      } catch (err) {
        console.warn('[palace-ui] session-status: projection refresh failed', err);
      }
      return Promise.resolve();
    },
    /** The shipped localized preset label (hidden with the header actions). */
    readModeLabel() {
      return puiSsReadModeLabel(typeof document !== 'undefined' ? document : null);
    },
    /**
     * Whether the stock Session-log exporter is available. Phones hide the
     * stock 「更多操作」 button (it only held download + feedback) and this
     * panel carries those two actions instead, so the header keeps three
     * 44px controls and the title its width.
     */
    canDownload() {
      const exporter = ctx && typeof ctx.get === 'function' ? ctx.get('sessionLogDownload') : undefined;
      return !!exporter && typeof exporter.download === 'function';
    },
    /** Start the real Session export for this Session. */
    download(sessionId) {
      const exporter = ctx && typeof ctx.get === 'function' ? ctx.get('sessionLogDownload') : undefined;
      if (!exporter || typeof exporter.download !== 'function') return false;
      try {
        exporter.download(sessionId);
        return true;
      } catch (err) {
        console.warn('[palace-ui] session-status: download failed', err);
        return false;
      }
    },
    /** Whether the shipped feedback dialog is available. */
    canFeedback() {
      const feedback = ctx && typeof ctx.get === 'function' ? ctx.get('feedbackUi') : undefined;
      return !!feedback && typeof feedback.openSession === 'function';
    },
    /** Open the real feedback dialog for this Session. */
    feedback(sessionId) {
      const ui = ctx && typeof ctx.get === 'function' ? ctx.get('feedbackUi') : undefined;
      if (!ui || typeof ui.openSession !== 'function') return false;
      try {
        ui.openSession(sessionId);
        return true;
      } catch (err) {
        console.warn('[palace-ui] session-status: feedback failed', err);
        return false;
      }
    },
  };

  if (typeof register !== 'function') {
    console.warn('[palace-ui] session-status: no slot registrar');
    return;
  }
  register(
    'conversation.session.header.utilities',
    { id: 'palace-session-status', order: 5 },
    (props) => h(PuiSessionStatus, { ...props, services }),
  );
}
