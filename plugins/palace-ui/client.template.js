/*
 * palace-ui · Client module
 *
 * Soft Minimal Dark design system for the DSH web GUI.
 *
 * Served verbatim to the browser (no bundler): `styles/*.css` are inlined into
 * STYLES by scripts/build.mjs. Edit the .css files, never the generated map.
 *
 * Layers:
 *   1. `styles/*.css` — token remap + component refinements, injected as <style>
 *      elements in filename order after the stock theme sheets.
 *   2. Shell slots — brand mark, command palette, settings row, mobile chrome.
 *   3. Document/PWA metadata and input-modality adaptations.
 */
window.__ModuleLoader__.load({
  id: '@local/palace-ui',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useEffect, useMemo, useRef, useState } = React;

    /** Inlined by scripts/build.mjs: { "00-tokens": "css text", ... }. */
    const STYLES = /*__PALACE_UI_STYLES__*/;

    const STYLE_PREFIX = 'palace-ui-style-';
    const OPTIONS_KEY = 'palace-ui:options';
    const DEFAULT_OPTIONS = { density: 'comfortable', motion: 'system', radius: 'soft' };

    const sheets = [];
    const disposers = [];
    /** Runtime handles shared with slot components (set in apply). */
    let RT = null;

    /*__PALACE_UI_SHELL__*/

    /* ------------------------------------------------------------------ *
     * Options (localStorage, applied as html data attributes)
     * ------------------------------------------------------------------ */
    function readOptions() {
      try {
        const raw = window.localStorage.getItem(OPTIONS_KEY);
        if (!raw) return { ...DEFAULT_OPTIONS };
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_OPTIONS, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
      } catch {
        return { ...DEFAULT_OPTIONS };
      }
    }

    function applyOptions(options) {
      const html = document.documentElement;
      html.dataset.palaceDensity = options.density === 'compact' ? 'compact' : 'comfortable';
      html.dataset.palaceMotion = options.motion === 'reduced' ? 'reduced' : 'system';
      html.dataset.palaceRadius = options.radius === 'crisp' ? 'crisp' : 'soft';
    }

    function writeOptions(options) {
      applyOptions(options);
      try {
        window.localStorage.setItem(OPTIONS_KEY, JSON.stringify(options));
      } catch {
        /* storage may be unavailable; the in-memory attributes still apply */
      }
    }

    /* ------------------------------------------------------------------ *
     * Styles
     * ------------------------------------------------------------------ */
    function injectStyles() {
      for (const [id, css] of Object.entries(STYLES)) {
        let el = document.getElementById(STYLE_PREFIX + id);
        if (!el) {
          el = document.createElement('style');
          el.id = STYLE_PREFIX + id;
          el.setAttribute('data-palace-ui', '');
          document.head.append(el);
        }
        el.textContent = css;
        sheets.push({
          el,
          remove() {
            el.remove();
          },
        });
      }
    }

    function disposeAll() {
      for (const dispose of disposers.splice(0).reverse()) {
        try {
          dispose();
        } catch (err) {
          console.warn('[palace-ui] dispose failed', err);
        }
      }
      for (const sheet of sheets.splice(0).reverse()) {
        try {
          sheet.remove();
        } catch (err) {
          console.warn('[palace-ui] style dispose failed', err);
        }
      }
    }

    /* ------------------------------------------------------------------ *
     * Document metadata / PWA
     * ------------------------------------------------------------------ */
    function applyDocumentMeta() {
      const html = document.documentElement;
      html.classList.add('palace-ui');
      html.setAttribute('data-palace-ui', 'v2');

      // Skip link: first tab stop jumps past the shell chrome into the main view.
      if (!document.querySelector('.palace-ui-skip-link')) {
        const main = document.querySelector('main') || document.querySelector('[data-slot="main"]');
        if (main && !main.id) main.id = 'palace-ui-main';
        const skip = document.createElement('a');
        skip.className = 'palace-ui-skip-link';
        skip.href = main ? `#${main.id}` : '#root';
        skip.textContent = '跳到主要内容';
        skip.addEventListener('click', (event) => {
          const target = document.getElementById('palace-ui-main') || document.querySelector('main');
          if (!target) return;
          event.preventDefault();
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
          target.scrollIntoView({ block: 'start', behavior: 'instant' });
        });
        document.body.insertBefore(skip, document.body.firstChild);
      }

      // Android/iOS standalone chrome colour + status bar treatment.
      let themeColor = document.querySelector('meta[name="theme-color"]');
      if (!themeColor) {
        themeColor = document.createElement('meta');
        themeColor.setAttribute('name', 'theme-color');
        document.head.append(themeColor);
      }
      themeColor.setAttribute('content', '#141414');
      themeColor.setAttribute('data-palace-ui', '');

      let viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        // viewport-fit=cover is required for safe-area insets on iOS.
        const content = viewport.getAttribute('content') || '';
        if (!/viewport-fit/.test(content)) {
          viewport.setAttribute(
            'content',
            `${content.replace(/\s*$/, '')}, viewport-fit=cover`.replace(/^,\s*/, ''),
          );
        }
      }

      // A data-URL manifest keeps the shell installable without a host route.
      // Icons travel inline as SVG data URLs so the install prompt has artwork;
      // a service worker is deliberately not registered (no offline claims).
      if (!document.querySelector('link[rel="manifest"][data-palace-ui]')) {
        const icon = `data:image/svg+xml,${encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">' +
            '<rect width="24" height="24" rx="6" fill="#141414"/>' +
            '<path d="M6.5 19v-7.5a5.5 5.5 0 0 1 11 0V19" stroke="#e6e6e6" stroke-width="1.7" stroke-linecap="round"/>' +
            '<path d="M9.8 19v-4.2a2.2 2.2 0 0 1 4.4 0V19" stroke="#8a8a93" stroke-width="1.5" stroke-linecap="round"/>' +
            '<path d="M4.8 19h14.4" stroke="#e6e6e6" stroke-width="1.7" stroke-linecap="round"/>' +
            '</svg>',
        )}`;
        const manifest = {
          id: './',
          name: 'Palace',
          short_name: 'Palace',
          description: 'Palace — AI workspace',
          start_url: './',
          scope: './',
          display: 'standalone',
          display_override: ['standalone', 'minimal-ui'],
          background_color: '#141414',
          theme_color: '#141414',
          icons: [
            { src: icon, sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
            { src: icon, sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
          ],
        };
        const link = document.createElement('link');
        link.rel = 'manifest';
        link.setAttribute('data-palace-ui', '');
        link.href = `data:application/manifest+json,${encodeURIComponent(JSON.stringify(manifest))}`;
        document.head.append(link);
      }

      for (const [name, content] of [
        ['apple-mobile-web-app-capable', 'yes'],
        ['apple-mobile-web-app-status-bar-style', 'black-translucent'],
        ['apple-mobile-web-app-title', 'Palace'],
        ['mobile-web-app-capable', 'yes'],
      ]) {
        if (!document.querySelector(`meta[name="${name}"][data-palace-ui]`)) {
          const meta = document.createElement('meta');
          meta.name = name;
          meta.content = content;
          meta.setAttribute('data-palace-ui', '');
          document.head.append(meta);
        }
      }
    }

    /* ------------------------------------------------------------------ *
     * Slot contributions
     * ------------------------------------------------------------------ */
    function register(ctx, slot, options, component) {
      try {
        const dispose = ctx.slots.inject(slot, () =>
          ctx.slots.register({ name: slot, ...options }, component),
        );
        disposers.push(dispose);
        return true;
      } catch (err) {
        console.warn(`[palace-ui] cannot register into ${slot}`, err);
        return false;
      }
    }

    /** Callback used by settings/palette components to update options. */
    function setOption(key, value) {
      if (!RT) return;
      RT.options = { ...RT.options, [key]: value };
      writeOptions(RT.options);
      RT.emit();
    }

    /* ------------------------------------------------------------------ *
     * Plugin entry
     * ------------------------------------------------------------------ */
    return {
      inject: ['slots', 'locale', 'theme', 'sessions', 'layout', 'uiWorkspace', 'workspaces', 'shortcuts'],
      apply(ctx) {
        try {
          applyDocumentMeta();
          injectStyles();
          const options = readOptions();
          applyOptions(options);
          RT = {
            ctx,
            options,
            listeners: new Set(),
            setOption,
            emit() {
              for (const listener of RT.listeners) {
                try {
                  listener();
                } catch (err) {
                  console.warn('[palace-ui] listener failed', err);
                }
              }
            },
            subscribe(fn) {
              // Capture the set: React can run an effect cleanup after plugin
              // disposal (RT is null then), and a throw here would crash the
              // root slot and blank the whole app.
              const listeners = RT && RT.listeners;
              if (!listeners) return () => {};
              listeners.add(fn);
              return () => {
                listeners.delete(fn);
              };
            },
          };
        } catch (err) {
          console.error('[palace-ui] init failed', err);
          return () => {};
        }

        /* Shell contributions are mounted by shell.js (kept separate so the
         * design tokens can ship without any React code). */
        try {
          mountShell({ ctx, RT, h, React, register, setOption, disposers });
        } catch (err) {
          console.error('[palace-ui] shell mount failed', err);
        }

        return () => {
          disposeAll();
          document.documentElement.classList.remove('palace-ui');
          document.documentElement.removeAttribute('data-palace-ui');
          document.documentElement.removeAttribute('data-palace-density');
          document.documentElement.removeAttribute('data-palace-motion');
          document.documentElement.removeAttribute('data-palace-radius');
          RT = null;
        };
      },
    };
  },
});
