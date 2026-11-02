/**
 * Mobile + PWA shell (phone widths, incl. landscape phones).
 *
 * Ported from the retired `plugins/palace-mobile` client so palace-ui is
 * self-sufficient, then restyled for Soft Minimal Dark:
 *   · navigation→ the stock DSH sidebar (opened by the menu button) is the
 *                 phone's only navigation surface; it already carries tasks
 *                 and account/settings. Palace no longer mounts a second
 *                 drawer and no longer contributes a bottom tab bar, so the
 *                 conversation and composer reach the bottom safe area.
 *   · header    → fills `conversation.header.leading` (menu) and
 *                 `conversation.session.header.utilities` (compact action pill)
 *   · drawer    → `shell.overlay` with real `ctx.sessions` / `ctx.workspaces` /
 *                 `ctx.uiWorkspace` data, focus trap, scrim and Escape
 *
 * Desktop is untouched: components mount only while `matchMedia` narrow
 * matches and every style rule lives in a narrow media query.
 *
 * Convention note: `register(slot, options, component)` is the curried helper
 * provided by shell/00-mount.js.
 */
function mountMobile({ ctx, RT, h, React, register }) {
  const { useEffect, useState } = React;

  const NARROW =
    '(max-width: 767px), (max-width: 1023px) and (max-height: 480px) and (pointer: coarse)';
  const ROOT_CLASS = 'pui-m-on';

  /* ------------------------------------------------------------------ *
   * Icons — same 24×24 / 1.6px stroke language as shell/05-icons.js, plus
   * the four tab glyphs it does not carry.
   * ------------------------------------------------------------------ */
  const PUI_M_PATHS = {
    menu: 'M4 7h16M4 12h16M4 17h10',
    chat: 'M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-9.5a7.5 7.5 0 0 1 7.5-7.5h2a7.5 7.5 0 0 1 7.5 7.5z',
    tasks: 'M9 11.5l2 2 4-4M4.5 4.5h15v15h-15z',
    files: 'M3 7.5a1.5 1.5 0 0 1 1.5-1.5h4l2 2h9a1.5 1.5 0 0 1 1.5 1.5v8.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18z',
    me: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 21a7.5 7.5 0 0 1 15 0',
    plus: 'M12 5v14M5 12h14',
    search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4.3-4.3',
    close: 'M6 6l12 12M18 6L6 18',
    folder: 'M3 7.5a1.5 1.5 0 0 1 1.5-1.5h4l2 2h9a1.5 1.5 0 0 1 1.5 1.5v8.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18z',
    plugins: 'M12 3.5l2.8 2.8L12 9.1 9.2 6.3zM12 14.9l2.8 2.8-2.8 2.8-2.8-2.8zM6.3 9.2l2.8 2.8-2.8 2.8-2.8-2.8zM17.7 9.2l2.8 2.8-2.8 2.8-2.8-2.8z',
    settings:
      'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z',
    back: 'M15 6l-6 6 6 6',
    empty: 'M4 7.5h16M4 12h16M4 16.5h10',
    offline: 'M3 3l18 18M8.5 15.5a5 5 0 0 1 7 0M5.5 12.5a10 10 0 0 1 3.2-2.1M12 19h.01',
    warning: 'M12 4l9 16H3zM12 10v4M12 17h.01',
    refresh: 'M20 11a8 8 0 1 0-2.3 5.6M20 5v6h-6',
  };

  function puiMIcon(name, size) {
    const d = PUI_M_PATHS[name] || PUI_M_PATHS.empty;
    return h(
      'svg',
      {
        viewBox: '0 0 24 24',
        width: size || 20,
        height: size || 20,
        'aria-hidden': 'true',
        focusable: 'false',
      },
      h('path', { d }),
    );
  }

  /* ------------------------------------------------------------------ *
   * Module-level runtime (set in mountMobile, read by slot components)
   * ------------------------------------------------------------------ */
  let puiMRT = null;

  /* ---- header: menu button (conversation.header.leading, single) ---- */
  /** True while the native sidebar column is not collapsed (open on phones). */
  function puiMSidebarIsOpen() {
    const frame = document.querySelector('[class*="pI_x6G_frame"]');
    return !!frame && !frame.hasAttribute('data-sidebar-collapsed');
  }

  /** Track the frame's own sidebar drawer state (the frame owns the transform). */
  function puiMUseSidebarOpen() {
    const [open, setOpen] = useState(puiMSidebarIsOpen);
    useEffect(() => {
      const frame = document.querySelector('[class*="pI_x6G_frame"]');
      if (!frame) return undefined;
      const sync = () => setOpen(puiMSidebarIsOpen());
      const observer = new MutationObserver(sync);
      observer.observe(frame, {
        attributes: true,
        attributeFilter: ['data-sidebar-collapsed', 'data-sidebar-drawer'],
      });
      sync();
      return () => observer.disconnect();
    }, []);
    return open;
  }

  /** Open/close the native Palace sidebar drawer. */
  function puiMToggleSidebar(force) {
    try {
      const ctx2 = puiMRT.ctx;
      const open = puiMSidebarIsOpen();
      if (force === undefined || force !== open) ctx2.layout.toggleSidebar();
    } catch (err) {
      console.warn('[palace-ui] mobile toggleSidebar failed', err);
    }
  }

  function PuiMMenuButton() {
    const open = puiMUseSidebarOpen();
    return h(
      'button',
      {
        type: 'button',
        className: 'pui-m-menu',
        'aria-label': open ? '关闭导航' : '打开导航',
        'aria-expanded': open ? 'true' : 'false',
        onClick: () => puiMToggleSidebar(),
      },
      puiMIcon('menu'),
    );
  }

  /**
   * Tap-outside scrim for the native sidebar drawer, plus the phone behaviour
   * the stock sidebar does not implement at this width: close after navigating
   * (its own auto-close keys off the layout store's viewport width, which can be
   * stale) and never leave the drawer open over the conversation.
   */
  function PuiMSidebarScrim() {
    const open = puiMUseSidebarOpen();

    useEffect(() => {
      const onNavigate = (event) => {
        const target = event.target;
        if (!target || typeof target.closest !== 'function') return;
        if (!target.closest('[class*="pI_x6G_sidebarCol"]')) return;
        // Only rows that change the main panel; menus/popovers stay open.
        const row = target.closest(
          '[role="treeitem"], [class*="newSession"], [class*="workspaceRow"], [class*="sessionRow"]',
        );
        if (!row) return;
        setTimeout(() => {
          if (puiMSidebarIsOpen()) puiMToggleSidebar(false);
        }, 160);
      };
      document.addEventListener('click', onNavigate, true);
      return () => document.removeEventListener('click', onNavigate, true);
    }, []);

    if (!open) return null;
    return h('div', {
      className: 'pui-m-sidebar-scrim',
      'aria-hidden': 'true',
      onClick: () => puiMToggleSidebar(false),
    });
  }

  /* ---- header: compact action pill (…session.header.utilities, list) ---- */
  /**
   * Start a blank session exactly like the stock sidebar does: no explicit
   * workspace id. Passing one resolved from our own snapshot could point at a
   * workspace the navigation layer refuses, which made the button a silent
   * no-op (the app stayed in the current session).
   */
  function puiMStartSession() {
    try {
      puiMRT.ctx.uiWorkspace.startSession();
    } catch (err) {
      console.warn('[palace-ui] mobile startSession failed', err);
    }
    // Narrow navigation closes the drawer on selectPanel internally.
    puiMToggleSidebar(false);
  }

  /** Focus the stock sidebar's session search once the drawer is open. */
  function puiMFocusSidebarSearch() {
    const focus = () => {
      const input = document.querySelector(
        '[class*="pI_x6G_sidebarCol"] input[type="search"], [class*="pI_x6G_sidebarCol"] input[type="text"]',
      );
      if (input) {
        try {
          input.focus({ preventScroll: true });
        } catch (err) {
          /* ignore */
        }
        return true;
      }
      return false;
    };
    requestAnimationFrame(() => {
      if (focus()) return;
      setTimeout(focus, 160);
    });
  }

  function PuiMHeaderActions() {
    const sidebarOpen = puiMUseSidebarOpen();
    return h(
      'div',
      { className: 'pui-m-actions', role: 'group', 'aria-label': '会话操作' },
      h(
        'button',
        { type: 'button', 'aria-label': '新建会话', title: '新建会话', onClick: puiMStartSession },
        puiMIcon('plus', 18),
      ),
      h(
        'button',
        {
          type: 'button',
          'aria-label': '搜索会话',
          title: '搜索会话',
          'aria-expanded': sidebarOpen ? 'true' : 'false',
          onClick: () => {
            puiMToggleSidebar(true);
            puiMFocusSidebarSearch();
          },
        },
        puiMIcon('search', 18),
      ),
    );
  }

  /* ------------------------------------------------------------------ *
   * Mount / dispose (narrow-only, matchMedia-driven)
   * ------------------------------------------------------------------ */
  function attach() {
    let mounted = false;
    const disposers = [];
    let detachViewport = () => {};
    let detachDisplayMode = () => {};

    try {
      puiMRT = { ctx };
    } catch (err) {
      console.error('[palace-ui] mobile init failed', err);
      return () => {};
    }

    /* Slot registrations must be disposable on a narrow→wide switch, so use the
     * slot registry directly (the curried helper only disposes on plugin
     * unload). Falls back to the helper if the slots service is unavailable. */
    const add = (slot, options, component) => {
      try {
        if (ctx.slots && typeof ctx.slots.inject === 'function') {
          const dispose = ctx.slots.inject(slot, () =>
            ctx.slots.register({ name: slot, ...options }, component),
          );
          disposers.push(dispose);
        } else {
          register(slot, options, component);
        }
      } catch (err) {
        console.warn(`[palace-ui] mobile cannot register into ${slot}`, err);
      }
    };

    const installViewport = () => {
      const vv = window.visualViewport;
      const root = document.documentElement;
      if (!vv) return () => {};
      let frame = 0;
      const update = () => {
        frame = 0;
        const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
        root.style.setProperty('--pui-vv-height', `${Math.round(vv.height)}px`);
        root.style.setProperty('--pui-keyboard-inset', `${Math.round(inset)}px`);
        // Measured composer seat height, so overlays anchored above it (the +
        // attach / command menu) can clamp to the really visible area instead
        // of a hard-coded guess.
        const seat = document.querySelector(
          '[class*="wSkVaW_composerHero"], [class*="uV2eYG_root"]',
        );
        if (seat) {
          const h = Math.round(seat.getBoundingClientRect().height);
          if (h > 0) root.style.setProperty('--pui-composer-seat-height', `${h}px`);
        }
        const keyboard = inset > 120;
        if (keyboard !== root.hasAttribute('data-pui-keyboard')) {
          if (keyboard) root.setAttribute('data-pui-keyboard', '1');
          else root.removeAttribute('data-pui-keyboard');
        }
      };
      const schedule = () => {
        if (frame) return;
        frame = window.requestAnimationFrame(update);
      };
      update();
      vv.addEventListener('resize', schedule);
      vv.addEventListener('scroll', schedule);
      window.addEventListener('orientationchange', schedule);
      return () => {
        if (frame) window.cancelAnimationFrame(frame);
        vv.removeEventListener('resize', schedule);
        vv.removeEventListener('scroll', schedule);
        window.removeEventListener('orientationchange', schedule);
        root.style.removeProperty('--pui-vv-height');
        root.style.removeProperty('--pui-keyboard-inset');
        root.style.removeProperty('--pui-composer-seat-height');
        root.removeAttribute('data-pui-keyboard');
      };
    };

    const installDisplayMode = () => {
      const mq = window.matchMedia('(display-mode: standalone)');
      const apply = () => {
        if (mq.matches) document.documentElement.setAttribute('data-pui-standalone', '1');
        else document.documentElement.removeAttribute('data-pui-standalone');
      };
      apply();
      if (mq.addEventListener) mq.addEventListener('change', apply);
      else if (mq.addListener) mq.addListener(apply);
      return () => {
        if (mq.removeEventListener) mq.removeEventListener('change', apply);
        else if (mq.removeListener) mq.removeListener(apply);
        document.documentElement.removeAttribute('data-pui-standalone');
      };
    };

    const mount = (want) => {
      if (want === mounted) return;
      if (want) {
        mounted = true;
        document.documentElement.classList.add(ROOT_CLASS);
        /* No `shell.bottom` contribution: the drawer owns every secondary
         * destination, so the conversation and composer reach the bottom safe
         * area instead of sitting behind a tab bar. */
        add('conversation.header.leading', { priority: -1 }, PuiMMenuButton);
        add('conversation.session.header.utilities', { id: 'palace-m-actions', order: 10 }, PuiMHeaderActions);
        add('shell.overlay', { id: 'palace-m-sidebar-scrim', order: 5 }, PuiMSidebarScrim);
        detachViewport = installViewport();
        detachDisplayMode = installDisplayMode();
      } else {
        mounted = false;
        for (const dispose of disposers.splice(0).reverse()) {
          try {
            dispose();
          } catch (err) {
            console.warn('[palace-ui] mobile dispose failed', err);
          }
        }
        detachViewport();
        detachViewport = () => {};
        detachDisplayMode();
        detachDisplayMode = () => {};
        document.documentElement.classList.remove(ROOT_CLASS);
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
      puiMRT = null;
    };
  }

  return attach();
}
