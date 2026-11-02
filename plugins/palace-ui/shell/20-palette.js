/**
 * Command palette (⌘K / Ctrl+K) — the Raycast-style keyboard surface.
 *
 * Registered into `shell.overlay` (list/root). It owns its own open state so it
 * can listen for the global chord without another plugin's cooperation, and it
 * talks to DSH only through the services in the plugin's inject list.
 */
function mountCommandPalette({ ctx, RT, h, React, register }) {
  const { useCallback, useEffect, useMemo, useRef, useState } = React;

  const isMac = /Mac|iPhone|iPad|iPod/.test(
    (typeof navigator !== 'undefined' && (navigator.platform || navigator.userAgent)) || '',
  );
  const modLabel = isMac ? '⌘' : 'Ctrl';
  const kbd = (value) => h('kbd', { className: 'pui-palette-kbd' }, value);

  const PALETTE_ID = 'pui-palette-list';

  function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);
    const inputRef = useRef(null);
    const restoreRef = useRef(null);
    const [, bump] = useState(0);

    useEffect(() => RT && RT.subscribe(() => bump((n) => n + 1)), []);

    const close = useCallback(() => {
      setOpen(false);
      setQuery('');
      setActive(0);
    }, []);

    const openSettings = useCallback(() => {
      try {
        const shortcuts = ctx.shortcuts;
        if (shortcuts && typeof shortcuts.invoke === 'function') {
          shortcuts.invoke('settings.open', {
            source: 'menu',
            region: 'page',
            modal: null,
            target: null,
          });
          return true;
        }
      } catch (err) {
        console.warn('[palace-ui] settings shortcut failed', err);
      }
      // Fallback: the account launcher owns the settings panel.
      const launcher =
        document.querySelector('[data-slot="settings.launcher"] button') ||
        document.querySelector('button[aria-label="账号菜单"]') ||
        document.querySelector('button[aria-label="Account menu"]');
      if (!launcher) return false;
      launcher.click();
      window.setTimeout(() => {
        const items = [...document.querySelectorAll('[role="menuitem"], button, [role="option"]')];
        const target = items.find(
          (el) => (el.textContent || '').trim() === '设置' || (el.textContent || '').trim() === 'Settings',
        );
        if (target) target.click();
      }, 120);
      return true;
    }, []);

    const sessionRows = useCallback(() => {
      try {
        const snap = ctx.sessions && ctx.sessions.list && ctx.sessions.list.getSnapshot();
        if (!snap || !Array.isArray(snap.ids)) return [];
        return snap.ids
          .map((id) => snap.byId[id])
          .filter(Boolean)
          .filter((row) => !row.blank)
          .slice(0, 40)
          .map((row) => ({
            id: `session:${row.id}`,
            group: '会话',
            icon: row.running ? 'zap' : 'message',
            label: row.displayTitle || row.title || row.id,
            keywords: row.id,
            hint: '',
            run: () => {
              try {
                ctx.uiWorkspace.openSession(row.id);
              } catch (err) {
                console.warn('[palace-ui] openSession failed', err);
              }
              close();
            },
          }));
      } catch {
        return [];
      }
    }, [close]);

    const commands = useMemo(() => {
      const themePref = RT && ctx.theme ? ctx.theme.getTheme().preference : 'dark';
      const opts = (RT && RT.options) || {};
      const list = [
        {
          id: 'new-session',
          group: '操作',
          icon: 'plus',
          label: '新建会话',
          keywords: 'new session chat 新建 对话',
          run: () => {
            try {
              const snapshot = ctx.workspaces && ctx.workspaces.list.getSnapshot();
              const first = snapshot && snapshot.items && snapshot.items[0];
              if (first) ctx.uiWorkspace.startSession(first.workspaceId);
              else ctx.uiWorkspace.startSession();
            } catch (err) {
              console.warn('[palace-ui] startSession failed', err);
            }
            close();
          },
        },
        {
          id: 'toggle-sidebar',
          group: '操作',
          icon: 'sidebar',
          label: '收起 / 展开侧边栏',
          keywords: 'sidebar toggle 侧栏 折叠',
          run: () => {
            try {
              ctx.layout.toggleSidebar();
            } catch (err) {
              console.warn('[palace-ui] toggleSidebar failed', err);
            }
            close();
          },
        },
        {
          id: 'settings',
          group: '操作',
          icon: 'settings',
          label: '打开设置',
          keywords: 'settings preferences 设置 偏好',
          hint: isMac ? modLabel + ',' : 'Ctrl ,',
          run: () => {
            openSettings();
            close();
          },
        },
        {
          id: 'plugins',
          group: '操作',
          icon: 'panels',
          label: '插件管理',
          keywords: 'plugins 插件 扩展',
          run: () => {
            try {
              ctx.layout.selectPanel('plugins');
            } catch (err) {
              console.warn('[palace-ui] selectPanel(plugins) failed', err);
            }
            close();
          },
        },
        {
          id: 'schedules',
          group: '操作',
          icon: 'calendar',
          label: '自动化任务',
          keywords: 'schedule tasks 自动化 任务 定时',
          run: () => {
            try {
              ctx.layout.selectPanel('schedules');
            } catch (err) {
              console.warn('[palace-ui] selectPanel(schedules) failed', err);
            }
            close();
          },
        },
        {
          id: 'theme-dark',
          group: '外观',
          icon: 'moon',
          label: '外观：深色',
          keywords: 'theme dark 外观 主题 深色',
          checked: themePref === 'dark',
          run: () => {
            try {
              ctx.theme.setTheme('dark');
            } catch (err) {
              console.warn('[palace-ui] setTheme failed', err);
            }
            close();
          },
        },
        {
          id: 'theme-light',
          group: '外观',
          icon: 'sun',
          label: '外观：浅色',
          keywords: 'theme light 外观 主题 浅色',
          checked: themePref === 'light',
          run: () => {
            try {
              ctx.theme.setTheme('light');
            } catch (err) {
              console.warn('[palace-ui] setTheme failed', err);
            }
            close();
          },
        },
        {
          id: 'theme-system',
          group: '外观',
          icon: 'monitor',
          label: '外观：跟随系统',
          keywords: 'theme system auto 外观 主题 系统',
          checked: themePref === 'system',
          run: () => {
            try {
              ctx.theme.setTheme('system');
            } catch (err) {
              console.warn('[palace-ui] setTheme failed', err);
            }
            close();
          },
        },
        {
          id: 'density',
          group: '外观',
          icon: 'panels',
          label: '密度：' + (opts.density === 'compact' ? '紧凑' : '舒适'),
          keywords: 'density compact 密度 紧凑 舒适',
          run: () => {
            RT.setOption('density', opts.density === 'compact' ? 'comfortable' : 'compact');
            close();
          },
        },
        {
          id: 'motion',
          group: '外观',
          icon: 'zap',
          label: '动效：' + (opts.motion === 'reduced' ? '减弱' : '完整'),
          keywords: 'motion animation reduce 动效 动画 减弱',
          run: () => {
            RT.setOption('motion', opts.motion === 'reduced' ? 'system' : 'reduced');
            close();
          },
        },
      ];
      return list;
    }, [ctx, close, isMac, modLabel, openSettings]);

    const items = useMemo(() => {
      const q = query.trim().toLowerCase();
      const all = [...commands, ...sessionRows()];
      if (!q) return all;
      return all.filter((item) => {
        const hay = `${item.label} ${item.group} ${item.keywords || ''}`.toLowerCase();
        return q.split(/\s+/).every((part) => hay.includes(part));
      });
    }, [commands, query, sessionRows]);

    const grouped = useMemo(() => {
      const out = [];
      let lastGroup = null;
      for (const item of items) {
        if (item.group !== lastGroup) {
          out.push({ heading: item.group, key: `h:${item.group}` });
          lastGroup = item.group;
        }
        out.push(item);
      }
      return out;
    }, [items]);

    useEffect(() => {
      const onKey = (event) => {
        const mod = isMac ? event.metaKey : event.ctrlKey;
        if (mod && !event.altKey && !event.shiftKey && (event.key === 'k' || event.key === 'K')) {
          if (event.isComposing) return;
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
          return;
        }
        if (!open) return;
        if (event.key === 'Escape') {
          event.preventDefault();
          close();
        }
      };
      const onOpenEvent = () => setOpen(true);
      window.addEventListener('keydown', onKey, true);
      window.addEventListener('palace-ui:open-palette', onOpenEvent);
      return () => {
        window.removeEventListener('keydown', onKey, true);
        window.removeEventListener('palace-ui:open-palette', onOpenEvent);
      };
    }, [close, isMac, open]);

    useEffect(() => {
      if (!open) {
        const previous = restoreRef.current;
        if (previous && typeof previous.focus === 'function') {
          try {
            previous.focus({ preventScroll: true });
          } catch {
            /* element may have left the document */
          }
        }
        restoreRef.current = null;
        return;
      }
      restoreRef.current = document.activeElement;
      const frame = window.requestAnimationFrame(() => inputRef.current && inputRef.current.focus());
      return () => window.cancelAnimationFrame(frame);
    }, [open]);

    useEffect(() => {
      if (!open) return;
      const row = document.getElementById(`pui-palette-item-${active}`);
      if (row && typeof row.scrollIntoView === 'function') {
        row.scrollIntoView({ block: 'nearest' });
      }
    }, [active, open]);

    const runItem = (item) => {
      if (!item) return;
      try {
        item.run();
      } catch (err) {
        console.warn('[palace-ui] command failed', err);
        close();
      }
    };

    const onInputKeyDown = (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActive((value) => (items.length ? (value + 1) % items.length : 0));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActive((value) => (items.length ? (value - 1 + items.length) % items.length : 0));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        runItem(items[active]);
      } else if (event.key === 'Tab') {
        // Single focusable control: keep focus inside the dialog.
        event.preventDefault();
        if (inputRef.current) inputRef.current.focus();
      } else if (event.key === 'Home') {
        event.preventDefault();
        setActive(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        setActive(Math.max(0, items.length - 1));
      }
    };

    useEffect(() => {
      setActive((value) => (items.length ? Math.min(value, items.length - 1) : 0));
    }, [items.length]);

    if (!open) return null;

    return h(
      'div',
      { className: 'pui-palette-root' },
      h('div', { className: 'pui-palette-scrim', onClick: close, 'aria-hidden': 'true' }),
      h(
        'div',
        {
          className: 'pui-palette',
          role: 'dialog',
          'aria-modal': 'true',
          'aria-label': '命令面板',
          onMouseDown: (event) => event.stopPropagation(),
        },
        h(
          'div',
          { className: 'pui-palette-search' },
          h('span', { className: 'pui-palette-search__icon' }, puiIcon('search', 16)),
          h('input', {
            ref: inputRef,
            type: 'text',
            className: 'pui-palette-input',
            placeholder: '搜索命令或会话…',
            value: query,
            spellCheck: false,
            autoComplete: 'off',
            role: 'combobox',
            'aria-expanded': 'true',
            'aria-controls': PALETTE_ID,
            'aria-autocomplete': 'list',
            'aria-activedescendant':
              items.length && items[active] ? `pui-palette-item-${active}` : undefined,
            onChange: (event) => {
              setQuery(event.target.value);
              setActive(0);
            },
            onKeyDown: onInputKeyDown,
          }),
          h('span', { className: 'pui-palette-search__esc' }, kbd('Esc')),
        ),
        h(
          'div',
          { className: 'pui-palette-list', id: PALETTE_ID, role: 'listbox', 'aria-label': '命令列表' },
          grouped.length === 0
            ? h(
                'div',
                { className: 'pui-palette-empty' },
                h('span', { className: 'pui-palette-empty__title' }, '没有匹配的命令'),
                h('span', { className: 'pui-palette-empty__hint' }, '换个关键词，或按 Esc 关闭'),
              )
            : grouped.map((entry) => {
                if (entry.heading) {
                  return h(
                    'div',
                    { className: 'pui-palette-group', role: 'presentation', key: entry.key },
                    entry.heading,
                  );
                }
                const index = items.indexOf(entry);
                const selected = index === active;
                return h(
                  'div',
                  {
                    key: entry.id,
                    id: `pui-palette-item-${index}`,
                    role: 'option',
                    'aria-selected': selected ? 'true' : 'false',
                    tabIndex: -1,
                    className: selected ? 'pui-palette-item pui-palette-item--active' : 'pui-palette-item',
                    onMouseMove: () => {
                      if (!selected) setActive(index);
                    },
                    onClick: () => runItem(entry),
                  },
                  h('span', { className: 'pui-palette-item__icon' }, puiIcon(entry.icon || 'command', 16)),
                  h('span', { className: 'pui-palette-item__label' }, entry.label),
                  entry.checked
                    ? h('span', { className: 'pui-palette-item__check' }, puiIcon('check', 15))
                    : null,
                  entry.hint ? h('span', { className: 'pui-palette-item__hint' }, entry.hint) : null,
                );
              }),
        ),
        h(
          'div',
          { className: 'pui-palette-footer' },
          h(
            'span',
            { className: 'pui-palette-footer__hints' },
            h('span', null, kbd('↑'), kbd('↓'), ' 选择'),
            h('span', null, kbd('↵'), ' 执行'),
            h('span', null, kbd('Esc'), ' 关闭'),
          ),
          h(
            'span',
            { className: 'pui-palette-footer__brand' },
            'Palace',
            h('span', { className: 'pui-palette-kbd' }, modLabel + ' K'),
          ),
        ),
      ),
    );
  }

  register('shell.overlay', { id: 'palace-palette', order: 90 }, CommandPalette);
}
