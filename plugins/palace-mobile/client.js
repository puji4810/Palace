/*
 * palace-mobile · Client module
 *
 * Mobile-only shell for Palace, replacing the stock DSH sidebar on narrow
 * screens (<= 767px). Desktop (>= 768px) is untouched: nothing registers.
 *
 * Design rules learned from the live DOM (see docs/ui-layout-notes.md):
 *  - The AppFrame is a CSS grid whose first track is the sidebar rail (56px
 *    when collapsed). Hiding the sidebar *element* with display:none breaks
 *    auto-placement (the centre column inherits the 0px track and the page goes
 *    black). The safe fix is to keep the element in flow and zero its track:
 *    `.pI_x6G_frame[data-sidebar-collapsed]` gets `0px minmax(0,1fr) 0px`.
 *  - Slots: menu -> conversation.header.leading (single), action pill ->
 *    conversation.session.header.utilities (list), tab bar -> shell.bottom
 *    (single, priority -1 shadows the Inspector devtools dock on narrow only),
 *    drawer -> shell.overlay (list, floating layer).
 *  - The tab bar lives in the layout's own row 2, so the composer can never be
 *    covered by it; no padding hacks on the scroll container.
 *
 * Colours use the real theme tokens (--dsw-alias-label-primary, ...) so light
 * and dark themes both work; design-system values are the fallbacks.
 */
window.__ModuleLoader__.load({
  id: '@local/palace-mobile',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useState, useEffect, useRef, useMemo } = React;

    const STYLE_ID = 'palace-mobile-style';
    const NARROW = '(max-width: 767px), (max-width: 1023px) and (max-height: 480px) and (pointer: coarse)';

    /* ------------------------------------------------------------------ *
     * Styles
     * ------------------------------------------------------------------ */
    const CSS = `
/* Narrow-screen layout: zero the sidebar grid track instead of hiding the
   column (display:none shifts auto-placement and collapses the centre).
   The second query covers phones in landscape, which are wider than 767px. */
@media (max-width: 767px), (max-width: 1023px) and (max-height: 480px) and (pointer: coarse) {
  /* The AppFrame writes grid-template-columns inline, so the override needs
     !important. Keep the sidebar element in grid flow (display:none would make
     the centre column auto-place into the 0px track and blank the page); just
     zero its track and hide it while the layout reports it collapsed. */
  .pI_x6G_frame {
    grid-template-columns: 0px minmax(0, 1fr) minmax(0px, 0px) !important;
  }
  /* Pin the real columns even if the sidebar ever leaves grid flow. */
  .pI_x6G_frame > .pI_x6G_centerCol { grid-column: 2 !important; }
  .pI_x6G_frame > .pI_x6G_rightbarCol { grid-column: 3 !important; }
  .pI_x6G_frame[data-sidebar-collapsed] > .pI_x6G_sidebarCol {
    border-right: 0 !important;
    visibility: hidden !important;
  }
  /* If the stock sidebar is expanded (settings/account escape hatch), present it
     as an overlay drawer instead of squeezing the 390px centre column. */
  .pI_x6G_frame:not([data-sidebar-collapsed]) > .pI_x6G_sidebarCol {
    position: fixed !important;
    top: 0;
    bottom: 0;
    left: 0;
    width: 280px !important;
    z-index: 24;
    visibility: visible !important;
    background: var(--dsw-alias-bg-layer-1, #1c1c1e) !important;
    border-right: 1px solid var(--dsw-alias-border-l1, rgba(255, 255, 255, 0.08)) !important;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.35);
  }
  /* Declutter the phone header: desktop-only affordances would either open an
     OS app or split the 390px column in two. Session menus and view tabs stay. */
  /* The open-in-app split group keeps a 2px divider even with its buttons
     hidden; drop the whole group. */
  .wSkVaW_header [class*="_split"] { display: none !important; }
  .wSkVaW_header button[aria-label="用 VS Code 打开"],
  .wSkVaW_header button[aria-label="更多打开方式"],
  .wSkVaW_header button[aria-label="Open in VS Code"],
  .wSkVaW_header button[aria-label="More open options"],
  .wSkVaW_header button[aria-label="打开右侧边栏"],
  .wSkVaW_header button[aria-label="收起右侧边栏"],
  .wSkVaW_header button[aria-label="Open right sidebar"],
  .wSkVaW_header button[aria-label="Collapse right sidebar"] {
    display: none !important;
  }
}

/* --- bottom tab bar (lives in the layout's shell.bottom row) --- */
.pm-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  box-sizing: border-box;
  height: calc(64px + env(safe-area-inset-bottom, 0px));
  padding: 4px 6px calc(4px + env(safe-area-inset-bottom, 0px));
  background: var(--dsw-alias-bg-layer-2, #242424);
  border-top: 1px solid var(--dsw-alias-border-l1, rgba(255, 255, 255, 0.06));
}
.pm-tab {
  appearance: none;
  border: 0;
  background: none;
  color: var(--dsw-alias-label-secondary, #8e8e93);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-width: 0;
  padding: 0;
  border-radius: 12px;
  font: inherit;
  font-size: 11px;
  line-height: 1.2;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: color 160ms ease, background-color 160ms ease;
}
.pm-tab:active { background: var(--dsw-alias-bg-layer-1, rgba(255, 255, 255, 0.05)); }
.pm-tab[aria-current="true"] { color: var(--dsw-alias-label-primary, #e5e5e5); }
.pm-tab svg, .pm-drawer svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  flex: none;
}
.pm-tab svg { width: 22px; height: 22px; }

/* --- header controls --- */
.pm-menu {
  appearance: none;
  border: 0;
  width: 36px;
  height: 36px;
  margin-left: -4px;
  border-radius: 9999px;
  background: var(--dsw-alias-bg-layer-2, #242424);
  color: var(--dsw-alias-label-secondary, #8e8e93);
  display: grid;
  place-items: center;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.pm-menu:active { background: var(--dsw-alias-bg-layer-1, #303030); }
.pm-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border-radius: 9999px;
  background: var(--dsw-alias-bg-layer-2, #242424);
  flex: none;
}
.pm-actions button {
  appearance: none;
  border: 0;
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  background: none;
  color: var(--dsw-alias-label-secondary, #8e8e93);
  display: grid;
  place-items: center;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.pm-actions button:active { background: var(--dsw-alias-bg-layer-1, #303030); }
.pm-menu svg, .pm-actions svg, .pm-ico {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* --- drawer --- */
.pm-root { position: fixed; inset: 0; z-index: 30; pointer-events: none; }
.pm-scrim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  opacity: 0;
  pointer-events: none;
  transition: opacity 200ms ease;
}
.pm-scrim[data-open="true"] { opacity: 1; pointer-events: auto; }
.pm-drawer {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: min(86vw, 340px);
  display: flex;
  flex-direction: column;
  transform: translateX(-102%);
  transition: transform 220ms ease;
  background: var(--dsw-alias-bg-layer-1, #1c1c1e);
  border-right: 1px solid var(--dsw-alias-border-l1, rgba(255, 255, 255, 0.07));
  border-radius: 0 18px 18px 0;
  padding-top: env(safe-area-inset-top, 0px);
  pointer-events: auto;
  overflow: hidden;
}
.pm-drawer[data-open="true"] { transform: translateX(0); }
.pm-dhead {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 12px 8px;
}
.pm-dhead h2 {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #e5e5e5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pm-dhead button, .pm-dfoot button {
  appearance: none;
  border: 0;
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: none;
  color: var(--dsw-alias-label-secondary, #8e8e93);
  display: grid;
  place-items: center;
  cursor: pointer;
  flex: none;
}
.pm-dhead button:active { background: var(--dsw-alias-bg-layer-2, #242424); }
.pm-brand { display: flex; align-items: center; gap: 6px; }
.pm-brand b { font-size: 15px; font-weight: 600; color: var(--dsw-alias-label-primary, #e5e5e5); }
.pm-dot {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: var(--dsw-alias-state-success-primary, #10b981);
  flex: none;
}
.pm-search {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 2px 12px 8px;
  padding: 8px 10px;
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-2, #242424);
  color: var(--dsw-alias-label-secondary, #8e8e93);
}
.pm-search input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: none;
  font: inherit;
  font-size: 14px;
  color: var(--dsw-alias-label-primary, #e5e5e5);
}
.pm-search input::placeholder { color: var(--dsw-alias-label-secondary, #8e8e93); }
.pm-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 8px 16px;
  overscroll-behavior: contain;
}
.pm-sec {
  padding: 14px 10px 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--dsw-alias-label-secondary, #8e8e93);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pm-row {
  appearance: none;
  border: 0;
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  background: none;
  color: var(--dsw-alias-label-primary, #e5e5e5);
  font: inherit;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.pm-row:active { background: var(--dsw-alias-bg-layer-2, #242424); }
.pm-row[aria-current="true"] { background: var(--dsw-alias-bg-layer-2, #242424); }
.pm-row .pm-label {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.pm-row .pm-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pm-row small, .pm-meta {
  font-size: 12px;
  font-weight: 400;
  color: var(--dsw-alias-label-secondary, #8e8e93);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pm-row small { flex: none; }
.pm-run {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: var(--dsw-alias-state-success-primary, #10b981);
  flex: none;
  animation: pm-pulse 1.5s ease-in-out infinite;
}
@keyframes pm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
.pm-empty {
  padding: 28px 12px;
  text-align: center;
  font-size: 13px;
  color: var(--dsw-alias-label-secondary, #8e8e93);
}
.pm-crumbs {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 6px 8px;
  overflow-x: auto;
  scrollbar-width: none;
}
.pm-crumbs button {
  appearance: none;
  border: 0;
  background: none;
  color: var(--dsw-alias-label-secondary, #8e8e93);
  font: inherit;
  font-size: 12px;
  padding: 6px 4px;
  cursor: pointer;
  flex: none;
}
.pm-crumbs button:last-child { color: var(--dsw-alias-label-primary, #e5e5e5); }
.pm-crumbs span { color: var(--dsw-alias-label-secondary, #8e8e93); font-size: 12px; }
@media (prefers-reduced-motion: reduce) {
  .pm-scrim, .pm-drawer, .pm-tab, .pm-run { transition: none; animation: none; }
}
`;

    /* ------------------------------------------------------------------ *
     * Icons (linear, stroke 1.5–1.6, per design system)
     * ------------------------------------------------------------------ */
    const svg = (d, cls) => h('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true', className: cls || undefined }, h('path', { d }));
    const ICON = {
      menu: 'M4 7h16M4 12h16M4 17h10',
      chat: 'M4 5h16v11H9l-5 4z',
      tasks: 'M9 11l2 2 4-4M4 4h16v16H4z',
      files: 'M3 7h6l2 2h10v10H3zM3 7V5h6l2 2',
      me: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
      plus: 'M12 5v14M5 12h14',
      search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4.3-4.3',
      close: 'M6 6l12 12M18 6L6 18',
      folder: 'M3 7h6l2 2h10v10H3zM3 7V5h6l2 2',
      back: 'M15 6l-6 6 6 6',
      plugins: 'M12 3l3 3-3 3-3-3zM12 15l3 3-3 3-3-3zM6 9l3 3-3 3-3-3zM18 9l3 3-3 3-3-3z',
      settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
    };

    /* ------------------------------------------------------------------ *
     * Tiny state plumbing (works inside slot components, no context needed)
     * ------------------------------------------------------------------ */
    function createStore(initial) {
      let state = initial;
      const subs = new Set();
      return {
        get: () => state,
        set(patch) {
          const next = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
          state = next;
          for (const fn of [...subs]) fn();
        },
        subscribe(fn) {
          subs.add(fn);
          return () => subs.delete(fn);
        },
      };
    }
    function useStore(store) {
      return React.useSyncExternalStore(store.subscribe, store.get, store.get);
    }
    /** Subscribe to a DSH SnapshotStore if it exposes the standard face. */
    function useSnapshot(source) {
      const subscribe = (cb) => {
        try {
          const dispose = source && source.subscribe ? source.subscribe(cb) : undefined;
          return typeof dispose === 'function' ? dispose : () => {};
        } catch (err) {
          return () => {};
        }
      };
      const read = () => {
        try {
          return source && source.getSnapshot ? source.getSnapshot() : undefined;
        } catch (err) {
          return undefined;
        }
      };
      return React.useSyncExternalStore(subscribe, read, read);
    }

    /* ------------------------------------------------------------------ *
     * Formatting helpers
     * ------------------------------------------------------------------ */
    function relativeTime(ts) {
      if (!ts) return '';
      const diff = Date.now() - ts;
      if (diff < 60e3) return '刚刚';
      if (diff < 3600e3) return `${Math.floor(diff / 60e3)} 分钟前`;
      if (diff < 86400e3) return `${Math.floor(diff / 3600e3)} 小时前`;
      const d = new Date(ts);
      const now = new Date();
      if (d.getFullYear() === now.getFullYear()) return `${d.getMonth() + 1}月${d.getDate()}日`;
      return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
    }
    function basename(p) {
      if (!p) return '';
      const parts = String(p).split('/').filter(Boolean);
      return parts[parts.length - 1] || p;
    }

    /* ------------------------------------------------------------------ *
     * Module-level runtime (set in apply, read by slot components)
     * ------------------------------------------------------------------ */
    let RT = null;

    /* ---- header: menu button (conversation.header.leading, single) ---- */
    function MenuButton() {
      const ui = useStore(RT.ui);
      return h('button', {
        type: 'button',
        className: 'pm-menu',
        'aria-label': '打开导航',
        'aria-expanded': ui.drawer === 'nav' ? 'true' : 'false',
        onClick: () => RT.ui.set({ drawer: ui.drawer === 'nav' ? null : 'nav' }),
      }, svg(ICON.menu));
    }

    /* ---- header: action pill (conversation.session.header.utilities, list) ---- */
    function HeaderActions() {
      const ui = useStore(RT.ui);
      const ctx = RT.ctx;
      const startSession = () => {
        try {
          const ws = firstWorkspace(ctx);
          if (ws) ctx.uiWorkspace.startSession(ws.workspaceId);
          else ctx.uiWorkspace.startSession();
          RT.ui.set({ drawer: null, tab: 'chat' });
          ctx.layout.selectPanel(null);
        } catch (err) {
          console.warn('[palace-mobile] startSession failed', err);
        }
      };
      return h('div', { className: 'pm-actions' },
        h('button', { type: 'button', 'aria-label': '新建会话', title: '新建会话', onClick: startSession }, svg(ICON.plus)),
        h('button', {
          type: 'button',
          'aria-label': '搜索会话',
          title: '搜索会话',
          'aria-expanded': ui.drawer === 'nav' ? 'true' : 'false',
          onClick: () => RT.ui.set({ drawer: ui.drawer === 'nav' ? null : 'nav', focusSearch: true }),
        }, svg(ICON.search)));
    }

    /* ---- bottom tab bar (shell.bottom, single, shadows Inspector dock) ---- */
    const TABS = [
      { key: 'chat', label: '对话', d: ICON.chat },
      { key: 'tasks', label: '任务', d: ICON.tasks },
      { key: 'files', label: '文件', d: ICON.files },
      { key: 'me', label: '我的', d: ICON.me },
    ];
    function TabBar() {
      const ui = useStore(RT.ui);
      const ctx = RT.ctx;
      const go = (key) => {
        if (key === 'chat') {
          RT.ui.set({ tab: 'chat', drawer: null });
          ctx.layout.selectPanel(null);
        } else if (key === 'tasks') {
          RT.ui.set({ tab: 'tasks', drawer: null });
          ctx.layout.selectPanel('schedules');
        } else if (key === 'files') {
          RT.ui.set({ tab: 'files', drawer: 'files' });
          ctx.layout.selectPanel(null);
        } else {
          RT.ui.set({ tab: 'me', drawer: 'me' });
          ctx.layout.selectPanel(null);
        }
      };
      const active = ui.drawer === 'files' ? 'files' : ui.drawer === 'me' ? 'me' : ui.tab;
      return h('nav', { className: 'pm-tabs', 'aria-label': '主导航' },
        TABS.map((t) => h('button', {
          key: t.key,
          type: 'button',
          className: 'pm-tab',
          'aria-current': active === t.key ? 'true' : 'false',
          onClick: () => go(t.key),
        }, svg(t.d), h('span', null, t.label))));
    }

    /* ------------------------------------------------------------------ *
     * Data helpers
     * ------------------------------------------------------------------ */
    function firstWorkspace(ctx) {
      try {
        const snap = ctx.workspaces && ctx.workspaces.list && ctx.workspaces.list.getSnapshot
          ? ctx.workspaces.list.getSnapshot()
          : null;
        const items = (snap && snap.items) || [];
        return items.length ? items[0] : null;
      } catch (err) {
        return null;
      }
    }
    function workspaceList(ctx) {
      try {
        const snap = ctx.workspaces && ctx.workspaces.list && ctx.workspaces.list.getSnapshot
          ? ctx.workspaces.list.getSnapshot()
          : null;
        return (snap && snap.items) || [];
      } catch (err) {
        return [];
      }
    }

    /** Grouped session rows for the navigation drawer. */
    function sessionGroups(ctx, sessionsSnap, workspacesSnap, query) {
      const groups = [];
      const byId = (sessionsSnap && sessionsSnap.byId) || {};
      const ids = (sessionsSnap && sessionsSnap.ids) || [];
      const archived = new Set((workspacesSnap && workspacesSnap.archivedSessionIds) || []);
      const q = query.trim().toLowerCase();
      const seen = new Set();
      const match = (row) => {
        if (!row) return false;
        if (archived.has(row.id)) return false;
        if (!q) return true;
        const label = row.displayTitle || row.title || '';
        return label.toLowerCase().includes(q) || String(row.cwd || '').toLowerCase().includes(q);
      };
      const items = (workspacesSnap && workspacesSnap.items) || [];
      for (const ws of items) {
        const rows = [];
        for (const id of ws.sessionIds || []) {
          const row = byId[id];
          if (!row || seen.has(id) || !match(row)) continue;
          if (!q && row.blank) continue; // hide blank drafts unless searching
          seen.add(id);
          rows.push(row);
        }
        rows.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        if (rows.length) groups.push({ title: ws.title || basename(ws.path), path: ws.path, rows });
      }
      const loose = ids
        .filter((id) => !seen.has(id))
        .map((id) => byId[id])
        .filter((row) => row && match(row) && (q || !row.blank));
      loose.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      if (loose.length) groups.push({ title: groups.length ? '其他会话' : '会话', rows: loose });
      return groups;
    }

    /* ------------------------------------------------------------------ *
     * Drawer
     * ------------------------------------------------------------------ */
    function closeDrawer() {
      // Closing the 文件/我的 sheet returns to the conversation tab, so the
      // bottom bar never claims a view that is no longer on screen.
      RT.ui.set((state) => ({
        drawer: null,
        focusSearch: false,
        tab: state.tab === 'files' || state.tab === 'me' ? 'chat' : state.tab,
      }));
    }

    function SessionRows({ groups, currentId, onOpen }) {
      const nodes = [];
      for (const group of groups) {
        nodes.push(h('div', { className: 'pm-sec', key: `sec:${group.title}` }, group.title));
        for (const row of group.rows) {
          const children = [
            row.running ? h('span', { className: 'pm-run', 'aria-hidden': 'true', key: 'run' }) : null,
            h('span', { className: 'pm-label', key: 'label' },
              h('span', { className: 'pm-title' }, row.displayTitle || row.title || row.id || '未命名会话')),
            row.running ? null : h('small', { key: 'time' }, relativeTime(row.updatedAt)),
          ];
          nodes.push(h('button', {
            key: row.id,
            type: 'button',
            className: 'pm-row',
            'aria-current': row.id === currentId ? 'true' : 'false',
            onClick: () => onOpen(row.id),
          }, ...children));
        }
      }
      return h(React.Fragment, null, nodes);
    }

    function NavigationPane() {
      const ctx = RT.ctx;
      const ui = useStore(RT.ui);
      const sessionsSnap = useSnapshot(ctx.sessions && ctx.sessions.list);
      const workspacesSnap = useSnapshot(ctx.workspaces && ctx.workspaces.list);
      const [query, setQuery] = useState('');
      const inputRef = useRef(null);
      useEffect(() => {
        if (ui.focusSearch && inputRef.current) inputRef.current.focus();
      }, [ui.focusSearch]);
      const groups = useMemo(
        () => sessionGroups(ctx, sessionsSnap, workspacesSnap, query),
        [ctx, sessionsSnap, workspacesSnap, query]);
      const open = (id) => {
        try {
          ctx.uiWorkspace.openSession(id);
        } catch (err) {
          console.warn('[palace-mobile] openSession failed', err);
        }
        RT.ui.set({ drawer: null, tab: 'chat', focusSearch: false });
        ctx.layout.selectPanel(null);
      };
      const newSession = () => {
        try {
          const ws = firstWorkspace(ctx);
          if (ws) ctx.uiWorkspace.startSession(ws.workspaceId);
          else ctx.uiWorkspace.startSession();
        } catch (err) {
          console.warn('[palace-mobile] startSession failed', err);
        }
        RT.ui.set({ drawer: null, tab: 'chat', focusSearch: false });
        ctx.layout.selectPanel(null);
      };
      const rows = groups.flatMap((g) => g.rows);
      return h(React.Fragment, null,
        h('label', { className: 'pm-search' },
          svg(ICON.search),
          h('input', {
            ref: inputRef,
            value: query,
            placeholder: '搜索会话标题或路径',
            'aria-label': '搜索会话',
            onChange: (e) => setQuery(e.target.value),
          })),
        h('div', { className: 'pm-body' },
          h('button', { type: 'button', className: 'pm-row', onClick: newSession },
            svg(ICON.plus, 'pm-ico'), h('span', { className: 'pm-label' }, h('span', { className: 'pm-title' }, '新建会话'))),
          rows.length
            ? h(SessionRows, { groups, onOpen: open })
            : h('div', { className: 'pm-empty' }, query ? '没有匹配的会话' : '暂无会话')));
    }

    function FilesPane() {
      const ctx = RT.ctx;
      const [path, setPath] = useState(() => {
        const ws = firstWorkspace(RT.ctx);
        return ws && ws.path ? ws.path : null;
      });
      const [listing, setListing] = useState(null);
      const [error, setError] = useState(null);
      const [loading, setLoading] = useState(false);
      useEffect(() => {
        let aborted = false;
        setLoading(true);
        setError(null);
        Promise.resolve()
          .then(() => ctx.uiWorkspace.listDirectory(path || undefined))
          .then((value) => {
            if (!aborted) setListing(value);
          })
          .catch((err) => {
            if (aborted) return;
            const message = err && err.message ? err.message : String(err);
            setError(/browse capability|directory-picker\/unavailable/.test(message)
              ? '当前服务端只提供系统原生选目录，无法在网页里浏览目录。'
              : message);
          })
          .finally(() => {
            if (!aborted) setLoading(false);
          });
        return () => { aborted = true; };
      }, [ctx, path]);
      const crumbs = (listing && listing.crumbs) || [];
      return h(React.Fragment, null,
        crumbs.length ? h('div', { className: 'pm-crumbs' },
          crumbs.map((crumb, i) => h(React.Fragment, { key: crumb.path || i },
            i ? h('span', { 'aria-hidden': 'true' }, '›') : null,
            h('button', { type: 'button', onClick: () => setPath(crumb.path) },
              crumb.name === '/' ? '/' : (i === 0 ? 'Home' === crumb.name ? 'Home' : crumb.name : crumb.name))))) : null,
        h('div', { className: 'pm-body' },
          loading ? h('div', { className: 'pm-empty' }, '加载中…') : null,
          error ? h('div', { className: 'pm-empty' }, error) : null,
          !loading && !error && listing
            ? (listing.entries && listing.entries.length
              ? listing.entries.map((entry) => h('button', {
                key: entry.path,
                type: 'button',
                className: 'pm-row',
                onClick: () => setPath(entry.path),
              }, svg(ICON.folder, 'pm-ico'), h('span', { className: 'pm-label' }, h('span', { className: 'pm-title' }, entry.name))))
              : h('div', { className: 'pm-empty' }, '这个目录没有子文件夹'))
            : null));
    }

    function MePane() {
      const ctx = RT.ctx;
      const workspacesSnap = useSnapshot(ctx.workspaces && ctx.workspaces.list);
      const sessionsSnap = useSnapshot(ctx.sessions && ctx.sessions.list);
      const items = (workspacesSnap && workspacesSnap.items) || [];
      const sessionCount = (sessionsSnap && sessionsSnap.ids && sessionsSnap.ids.length) || 0;
      const goPanel = (panelId) => {
        RT.ui.set({ drawer: null, tab: 'chat' });
        try { ctx.layout.selectPanel(panelId); } catch (err) { console.warn('[palace-mobile] selectPanel', err); }
      };
      const nativeSidebar = () => {
        RT.ui.set({ drawer: null });
        try { ctx.layout.toggleSidebar(); } catch (err) { console.warn('[palace-mobile] toggleSidebar', err); }
      };
      return h('div', { className: 'pm-body' },
        items.length
          ? items.map((ws) => h('button', {
            key: ws.workspaceId,
            type: 'button',
            className: 'pm-row',
            onClick: () => {
              try { ctx.uiWorkspace.openWorkspace(ws.workspaceId); } catch (err) { console.warn(err); }
              RT.ui.set({ drawer: null, tab: 'chat' });
              ctx.layout.selectPanel(null);
            },
          }, svg(ICON.folder, 'pm-ico'),
          h('span', { className: 'pm-label' },
            h('span', { className: 'pm-title' }, ws.title || basename(ws.path)),
            h('span', { className: 'pm-meta' }, `${ws.path} · ${(ws.sessionIds || []).length} 个会话`))))
          : h('div', { className: 'pm-empty' }, '暂无工作区'),
        h('div', { className: 'pm-sec' }, `会话 ${sessionCount} 个`),
        h('button', { type: 'button', className: 'pm-row', onClick: () => goPanel('plugins') },
          svg(ICON.plugins, 'pm-ico'), h('span', { className: 'pm-label' }, h('span', { className: 'pm-title' }, '插件管理'))),
        h('button', { type: 'button', className: 'pm-row', onClick: () => goPanel('schedules') },
          svg(ICON.tasks, 'pm-ico'), h('span', { className: 'pm-label' }, h('span', { className: 'pm-title' }, '自动化任务'))),
        h('button', { type: 'button', className: 'pm-row', onClick: nativeSidebar },
          svg(ICON.settings, 'pm-ico'), h('span', { className: 'pm-label' }, h('span', { className: 'pm-title' }, '设置与账号（原生侧栏）'))));
    }

    function Drawer() {
      const ui = useStore(RT.ui);
      const open = ui.drawer !== null && ui.drawer !== undefined;
      const title = ui.drawer === 'files' ? '文件' : ui.drawer === 'me' ? '我的' : 'Palace';
      return h('div', { className: 'pm-root', 'aria-hidden': open ? 'false' : 'true' },
        h('div', {
          className: 'pm-scrim',
          'data-open': open ? 'true' : 'false',
          onClick: closeDrawer,
        }),
        h('aside', {
          className: 'pm-drawer',
          'data-open': open ? 'true' : 'false',
          role: 'dialog',
          'aria-label': title,
          'aria-modal': open ? 'true' : 'false',
        },
        h('div', { className: 'pm-dhead' },
          ui.drawer === 'nav'
            ? h('span', { className: 'pm-brand' },
              h('span', { className: 'pm-dot', 'aria-hidden': 'true' }),
              h('b', null, 'Palace'))
            : h('h2', null, title),
          h('button', { type: 'button', 'aria-label': '关闭', onClick: closeDrawer }, svg(ICON.close, 'pm-ico'))),
        ui.drawer === 'nav' ? h(NavigationPane) : null,
        ui.drawer === 'files' ? h(FilesPane) : null,
        ui.drawer === 'me' ? h(MePane) : null));
    }

    /* ------------------------------------------------------------------ *
     * Mount
     * ------------------------------------------------------------------ */
    return {
      inject: ['slots', 'sessions', 'uiWorkspace', 'layout', 'workspaces'],
      apply(ctx) {
        let mounted = false;
        let disposers = [];
        let removeStyle = () => {};
        try {
          removeStyle = ensureStyle();
          RT = { ctx, ui: createStore({ drawer: null, tab: 'chat', focusSearch: false }) };
        } catch (err) {
          console.error('[palace-mobile] init failed', err);
          return () => {};
        }

        const register = (slot, options, component) => {
          try {
            const dispose = ctx.slots.inject(slot, () => ctx.slots.register({ name: slot, ...options }, component));
            disposers.push(dispose);
          } catch (err) {
            console.warn(`[palace-mobile] cannot register into ${slot}`, err);
          }
        };

        const mount = (want) => {
          if (want === mounted) return;
          if (want) {
            mounted = true;
            document.documentElement.classList.add('pm-on');
            // Row 2 of the layout: the composer can never be overlapped by this.
            // priority -1 shadows the Inspector devtools dock on narrow screens
            // only (desktop never mounts, so the dock stays there).
            register('shell.bottom', { priority: -1 }, TabBar);
            register('conversation.header.leading', { priority: -1 }, MenuButton);
            register('conversation.session.header.utilities', { id: 'palace-actions', order: 10 }, HeaderActions);
            register('shell.overlay', { id: 'palace-drawer', order: 20 }, Drawer);
          } else {
            mounted = false;
            for (const dispose of disposers.splice(0).reverse()) {
              try { dispose(); } catch (err) { console.warn('[palace-mobile] dispose failed', err); }
            }
            document.documentElement.classList.remove('pm-on');
            RT.ui.set({ drawer: null, focusSearch: false });
          }
        };

        const mq = window.matchMedia(NARROW);
        const onChange = () => mount(mq.matches);
        mount(mq.matches);
        if (mq.addEventListener) mq.addEventListener('change', onChange);
        else if (mq.addListener) mq.addListener(onChange);

        return () => {
          if (mq.removeEventListener) mq.removeEventListener('change', onChange);
          else if (mq.removeListener) mq.removeListener(onChange);
          mount(false);
          removeStyle();
          RT = null;
        };
      },
    };

    /* ------------------------------------------------------------------ *
     * Style injection
     * ------------------------------------------------------------------ */
    function ensureStyle() {
      const existing = document.getElementById(STYLE_ID);
      if (existing) return () => {};
      const el = document.createElement('style');
      el.id = STYLE_ID;
      el.textContent = CSS;
      document.head.append(el);
      return () => el.remove();
    }
  },
});
