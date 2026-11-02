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
    const STYLES = {"00-tokens":"/* =====================================================================\n * palace-ui / 00 · Design tokens (Primitive → Semantic → Component)\n * =====================================================================\n * Soft Minimal Dark. Depth comes from structure, type and lightness — not from\n * pure black, glows or large blurred shadows.\n *\n * The DSH client reads the `--dsw-*` semantic aliases from ui-theme; we remap\n * them here instead of restyling every component. The sheet is scoped to\n * `html body[...]` so it wins over ui-theme's `body[...]` declarations by both\n * specificity and order (this stylesheet is appended after the theme sheets).\n *\n * Layers in this file:\n *   1. `--pui-*` primitives — the only place literal values live.\n *   2. Static neutral ramp — desaturates the stock bluish greys so components\n *      that read `--dsw-static-*` directly follow the same neutral scale.\n *   3. Dark semantic aliases — surfaces, text, borders, states, buttons.\n *   4. Light semantic aliases — a coherent soft-minimal light twin.\n *   5. Geometry, typography, motion, elevation, scrollbar and focus tokens.\n * ===================================================================== */\n\n:root {\n  /* ---- 1. primitives: dark surfaces (5 lightness levels) -------------- */\n  --pui-canvas: #141414;\n  --pui-surface-1: #1c1c1c;\n  --pui-surface-2: #232323;\n  --pui-surface-3: #2b2b2b;\n  --pui-surface-4: #353535;\n  --pui-surface-5: #404040;\n\n  /* ---- primitives: dark text ----------------------------------------- */\n  --pui-text-primary: #e6e6e6;\n  --pui-text-secondary: #a1a1aa;\n  --pui-text-tertiary: #9a9aa3;\n  --pui-text-caption: #9c9ca6;\n  --pui-text-muted: #6e6e77;\n  --pui-text-on-light: #141414;\n\n  /* ---- primitives: borders (1px + alpha, never solid grey lines) ------ */\n  --pui-border-divider: rgba(255, 255, 255, 0.05);\n  --pui-border-default: rgba(255, 255, 255, 0.07);\n  --pui-border-hover: rgba(255, 255, 255, 0.12);\n  --pui-border-active: rgba(255, 255, 255, 0.2);\n  --pui-border-inverted: rgba(0, 0, 0, 0.07);\n\n  /* ---- primitives: semantic accents (low saturation, status only) ----- */\n  --pui-accent-sky: #38bdf8;\n  --pui-accent-sky-soft: #7dd3fc;\n  --pui-accent-emerald: #10b981;\n  --pui-accent-emerald-soft: #34d399;\n  --pui-accent-amber: #f59e0b;\n  --pui-accent-amber-soft: #fbbf24;\n  --pui-accent-rose: #f43f5e;\n  --pui-accent-rose-soft: #fb7185;\n  --pui-accent-violet: #a78bfa;\n\n  /* ---- primitives: radius ladder (concentric nesting) ----------------- */\n  --pui-radius-xs: 4px;\n  --pui-radius-sm: 8px;\n  --pui-radius-md: 10px;\n  --pui-radius-lg: 12px;\n  --pui-radius-card: 16px;\n  --pui-radius-input: 14px;\n  --pui-radius-panel: 24px;\n  --pui-radius-pill: 9999px;\n\n  /* ---- primitives: spacing (4px grid) --------------------------------- */\n  --pui-space-xs: 4px;\n  --pui-space-sm: 8px;\n  --pui-space-md: 12px;\n  --pui-space-lg: 16px;\n  --pui-space-xl: 24px;\n  --pui-space-2xl: 32px;\n\n  /* ---- primitives: motion --------------------------------------------- */\n  --pui-ease-out: cubic-bezier(0.16, 1, 0.3, 1);\n  --pui-ease-standard: cubic-bezier(0.4, 0, 0.2, 1);\n  --pui-duration-press: 110ms;\n  --pui-duration-hover: 150ms;\n  --pui-duration-panel: 220ms;\n  --pui-duration-modal: 240ms;\n\n  /* ---- primitives: touch ---------------------------------------------- */\n  --pui-touch-target: 44px;\n  --pui-touch-gap: 8px;\n\n  /* ---- typography primitives ------------------------------------------ */\n  --pui-font-ui: Inter, \"SF Pro Display\", \"SF Pro Text\", -apple-system, BlinkMacSystemFont,\n    \"PingFang SC\", \"Noto Sans CJK SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", system-ui,\n    sans-serif;\n  --pui-font-mono: \"JetBrains Mono\", \"Geist Mono\", \"SF Mono\", \"Fira Code\", \"Roboto Mono\",\n    Consolas, \"Liberation Mono\", Menlo, \"PingFang SC\", \"Microsoft YaHei\", monospace;\n}\n\n/* =====================================================================\n * 2. Static neutral ramp (shared by both themes, like the stock sheet).\n *    DSH components occasionally read the static scale directly; remapping\n *    it here keeps those spots from drifting back to the bluish palette.\n * ===================================================================== */\nhtml body {\n  --dsw-static-neutral-bluish-00: #ffffff;\n  --dsw-static-neutral-bluish-50: #fafafa;\n  --dsw-static-neutral-bluish-55: #f9f9fa;\n  --dsw-static-neutral-bluish-60: #f7f7f8;\n  --dsw-static-neutral-bluish-75: #f5f5f7;\n  --dsw-static-neutral-bluish-90: #f2f2f4;\n  --dsw-static-neutral-bluish-100: #ededf0;\n  --dsw-static-neutral-bluish-150: #e6e6ea;\n  --dsw-static-neutral-bluish-200: #dcdce1;\n  --dsw-static-neutral-bluish-300: #c7c7ce;\n  --dsw-static-neutral-bluish-310: #b9b9c2;\n  --dsw-static-neutral-bluish-400: #a1a1aa;\n  --dsw-static-neutral-bluish-500: #8a8a93;\n  --dsw-static-neutral-bluish-600: #6e6e77;\n  --dsw-static-neutral-bluish-700: #4a4a52;\n  --dsw-static-neutral-bluish-750: #3a3a40;\n  --dsw-static-neutral-bluish-800: #2e2e33;\n  --dsw-static-neutral-bluish-850: #262628;\n  --dsw-static-neutral-bluish-875: #202022;\n  --dsw-static-neutral-bluish-900: #1a1a1b;\n  --dsw-static-neutral-bluish-950: #141414;\n  --dsw-static-neutral-bluish-1000: #101011;\n\n  --dsw-static-neutral-00: #ffffff;\n  --dsw-static-neutral-50: #fafafa;\n  --dsw-static-neutral-100: #f2f2f4;\n  --dsw-static-neutral-150: #ececef;\n  --dsw-static-neutral-200: #e2e2e7;\n  --dsw-static-neutral-250: #d4d4da;\n  --dsw-static-neutral-300: #c4c4cb;\n  --dsw-static-neutral-400: #a1a1aa;\n  --dsw-static-neutral-500: #8a8a93;\n  --dsw-static-neutral-550: #7c7c85;\n  --dsw-static-neutral-600: #6e6e77;\n  --dsw-static-neutral-700: #333336;\n  --dsw-static-neutral-800: #2b2b2d;\n  --dsw-static-neutral-850: #232325;\n  --dsw-static-neutral-900: #161617;\n  --dsw-static-neutral-1000: #101011;\n}\n\n/* =====================================================================\n * 3. Dark semantics — the primary design target.\n * ===================================================================== */\nhtml body[data-ds-dark-theme] {\n  /* ---- surfaces: canvas → layer 3 ------------------------------------ */\n  --dsw-alias-bg-base: var(--pui-canvas);\n  --dsw-alias-bg-layer-1: var(--pui-surface-1);\n  --dsw-alias-bg-layer-2: var(--pui-surface-2);\n  --dsw-alias-bg-layer-3: var(--pui-surface-3);\n  --dsw-alias-bg-overlay: var(--pui-surface-2);\n  --dsw-alias-bg-module-platform: var(--pui-surface-1);\n  --dsw-alias-bg-multi-select: var(--pui-surface-3);\n  --dsw-alias-bg-skeleton: rgba(255, 255, 255, 0.06);\n  --dsw-alias-bg-document-preview: var(--pui-surface-1);\n  --dsw-alias-label-document-preview: var(--pui-text-secondary);\n  --dsw-alias-bg-document-selection: color-mix(in srgb, var(--pui-accent-sky) 40%, transparent);\n\n  /* ---- masks: dim without blur --------------------------------------- */\n  --dsw-alias-bg-mask-1: rgba(0, 0, 0, 0.55);\n  --dsw-alias-bg-mask-2: rgba(0, 0, 0, 0.35);\n  --dsw-alias-bg-mask-3: rgba(0, 0, 0, 0.7);\n  --dsw-alias-bg-mask-photo: rgba(0, 0, 0, 0.9);\n  --dsw-alias-bg-mask-drop: rgba(20, 20, 20, 0.72);\n\n  /* ---- text ---------------------------------------------------------- */\n  --dsw-alias-label-primary: var(--pui-text-primary);\n  --dsw-alias-label-secondary: var(--pui-text-secondary);\n  --dsw-alias-label-tertiary: var(--pui-text-tertiary);\n  --dsw-alias-label-caption: var(--pui-text-caption);\n  --dsw-alias-label-dimmed: var(--pui-text-muted);\n  --dsw-alias-label-primary-dimmed: #cfcfd6;\n  --dsw-alias-label-primary-bluish: var(--pui-text-primary);\n  --dsw-alias-label-primary-foreground: var(--pui-text-on-light);\n  --dsw-alias-label-primary-inverted: var(--pui-surface-1);\n  --dsw-alias-label-shimmer: rgba(255, 255, 255, 0.45);\n  --dsw-alias-menu-icon: var(--pui-text-secondary);\n  --dsw-alias-link: var(--pui-accent-sky-soft);\n  --dsw-alias-label-deep-diving: var(--pui-accent-sky-soft);\n  --dsw-alias-label-deep-diving-shimmer: var(--pui-accent-sky);\n\n  /* ---- borders ------------------------------------------------------- */\n  --dsw-alias-border-l1: var(--pui-border-divider);\n  --dsw-alias-border-l2: var(--pui-border-default);\n  --dsw-alias-border-l2-darkmode-thin: rgba(255, 255, 255, 0.06);\n  --dsw-alias-border-l3: rgba(255, 255, 255, 0.09);\n  --dsw-alias-border-l4: var(--pui-border-active);\n  --dsw-alias-border-inverted: var(--pui-border-inverted);\n  --dsw-alias-border-inverted2: rgba(0, 0, 0, 0.1);\n\n  /* ---- interaction --------------------------------------------------- */\n  --dsw-alias-interactive-bg-hover: rgba(255, 255, 255, 0.055);\n  --dsw-alias-interactive-bg-active: rgba(255, 255, 255, 0.09);\n  --dsw-alias-interactive-bg-hover-solid: var(--pui-surface-4);\n  --dsw-alias-interactive-bg-hover-accent: rgba(56, 189, 248, 0.12);\n  --dsw-alias-interactive-bg-hover-danger: rgba(244, 63, 94, 0.12);\n\n  /* ---- buttons: the primary action is a light chip with dark text ----- */\n  --dsw-alias-brand-primary: var(--pui-text-primary);\n  --dsw-alias-brand-primary-invert: var(--pui-canvas);\n  --dsw-alias-brand-primary-new-colorprimary-new-color: var(--pui-accent-sky);\n  --dsw-alias-brand-text: var(--pui-text-primary);\n  --dsw-alias-button-primary-fill: var(--pui-text-primary);\n  --dsw-alias-button-primary-hover: #f5f5f5;\n  --dsw-alias-button-primary-dimmed: var(--pui-surface-4);\n  --dsw-alias-button-contrast-fill: var(--pui-text-primary);\n  --dsw-alias-button-elevated-fill: var(--pui-surface-3);\n  --dsw-alias-button-floating-fill: var(--pui-surface-3);\n  --dsw-alias-button-floating-hover: var(--pui-surface-4);\n  --dsw-alias-button-ghost-active-fill: var(--pui-surface-3);\n  --dsw-alias-button-ghost-active-hover: var(--pui-surface-4);\n  --dsw-alias-button-ghost-active-border: var(--pui-border-hover);\n  --dsw-alias-button-info-fill: var(--pui-accent-sky);\n  --dsw-alias-button-info-hover: var(--pui-accent-sky-soft);\n  --dsw-alias-button-tool-bar-fill: rgba(20, 20, 20, 0.55);\n  --dsw-alias-button-tool-bar-fill-invisible: rgba(20, 20, 20, 0.3);\n  --dsw-alias-button-tool-bar-hover: rgba(53, 53, 53, 0.8);\n\n  /* ---- state colours (status marks, not decoration) ------------------- */\n  --dsw-alias-state-business-primary: var(--pui-accent-sky);\n  --dsw-alias-state-business-tertiary: rgba(56, 189, 248, 0.14);\n  --dsw-alias-state-success-primary: var(--pui-accent-emerald);\n  --dsw-alias-state-success-secondary: var(--pui-accent-emerald-soft);\n  --dsw-alias-state-success-tertiary: rgba(16, 185, 129, 0.14);\n  --dsw-alias-state-warn-primary: var(--pui-accent-amber);\n  --dsw-alias-state-warn-secondary: var(--pui-accent-amber-soft);\n  --dsw-alias-state-warn-tertiary: rgba(245, 158, 11, 0.14);\n  --dsw-alias-state-warn-label: var(--pui-accent-amber-soft);\n  --dsw-alias-state-error-primary: var(--pui-accent-rose);\n  --dsw-alias-state-error-secondary: var(--pui-accent-rose-soft);\n  --dsw-alias-state-done-primary: var(--pui-accent-violet);\n  --dsw-alias-state-idle-primary: var(--pui-text-muted);\n  --dsw-alias-code-diff-added: rgba(16, 185, 129, 0.14);\n  --dsw-alias-code-diff-deleted: rgba(244, 63, 94, 0.14);\n  --dsw-alias-file-diff-added-bg: rgba(16, 185, 129, 0.09);\n  --dsw-alias-file-diff-added-gutter: rgba(16, 185, 129, 0.05);\n  --dsw-alias-file-diff-added-marker: #34d399;\n  --dsw-alias-file-diff-deleted-bg: rgba(244, 63, 94, 0.09);\n  --dsw-alias-file-diff-deleted-gutter: rgba(244, 63, 94, 0.05);\n  --dsw-alias-file-diff-deleted-marker: #fb7185;\n\n  /* ---- markdown / artifacts ------------------------------------------ */\n  --dsw-alias-markdown-code-block: #1a1a1a;\n  --dsw-alias-markdown-code-block-banner: var(--pui-surface-2);\n  --dsw-alias-markdown-code-segment-selected: var(--pui-surface-3);\n  --dsw-alias-markdown-code-segment-unselected: #1a1a1a;\n  --dsw-alias-markdown-inline-code: #333336;\n  --dsw-alias-markdown-placeholder: rgba(255, 255, 255, 0.16);\n  --dsw-alias-markdown-tag: var(--pui-surface-3);\n  --dsw-alias-markdown-citation: var(--pui-surface-3);\n  --dsw-alias-turn-trigger-bg: var(--pui-surface-2);\n  --dsw-alias-turn-trigger-bg-hover: var(--pui-surface-3);\n\n  /* ---- surfaces specific to one feature ------------------------------- */\n  --dsw-specific-bubble: var(--pui-surface-3);\n  --dsw-specific-bubble-highlight: var(--pui-surface-4);\n  --dsw-specific-input-major: var(--pui-surface-3);\n  --dsw-specific-login-input: var(--pui-surface-2);\n  --dsw-specific-selector: var(--pui-surface-3);\n  --dsw-specific-sidebar-fill: var(--pui-surface-1);\n  --dsw-specific-sidebar-nav-item-active: var(--pui-surface-3);\n  --dsw-specific-sidebar-nav-item-active-accent: var(--pui-accent-sky);\n  --dsw-specific-tip: var(--pui-surface-2);\n  --dsw-specific-menu: rgba(31, 31, 31, 0.9);\n  --dsw-menu-surface-fill: rgba(31, 31, 31, 0.9);\n  --dsw-alias-menu-group-header-fill: rgba(31, 31, 31, 0.96);\n  --dsw-menu-backdrop-filter: blur(16px) saturate(120%);\n\n  /* ---- misc chrome ---------------------------------------------------- */\n  --dsw-alias-toast-bg: var(--pui-surface-4);\n  --dsw-alias-toast-label: var(--pui-text-primary);\n  --dsw-alias-tooltip-bg: var(--pui-surface-4);\n  --dsw-alias-tooltip-key-bg: color-mix(in srgb, var(--pui-surface-4), white 14%);\n  --dsw-alias-switch-thumb: #d4d4da;\n  --dsw-alias-scrollbar-bg-l1: rgba(255, 255, 255, 0.14);\n  --dsw-alias-scrollbar-bg-l2: rgba(255, 255, 255, 0.2);\n  --dsw-alias-scrollbar-hover-l1: rgba(255, 255, 255, 0.24);\n  --dsw-alias-scrollbar-hover-l2: rgba(255, 255, 255, 0.3);\n\n  /* ---- elevation: hairline stroke + faint, tight shadow ---------------- */\n  --dsw-elevation-stroke-color: var(--pui-border-active);\n  --dsw-shadow-lv1: 0 1px 2px rgba(0, 0, 0, 0.35);\n  --dsw-shadow-lv2: 0 2px 8px rgba(0, 0, 0, 0.4);\n  --dsw-shadow-lv3: 0 12px 32px rgba(0, 0, 0, 0.5);\n  --dsw-mask-blur: none;\n\n  --dsw-focus-ring-color: rgba(56, 189, 248, 0.65);\n  --dsw-focus-ring-width: 2px;\n\n  /* ---- radius --------------------------------------------------------- */\n  --dsw-radius-xs: var(--pui-radius-xs);\n  --dsw-radius-sm: var(--pui-radius-sm);\n  --dsw-radius-md: var(--pui-radius-md);\n  --dsw-radius-lg: var(--pui-radius-card);\n  --dsw-radius-xl: 20px;\n  --dsw-radius-panel: var(--pui-radius-panel);\n}\n\n/* Elevation is re-declared per element by the stock sheet; mirror that so a\n * surface's stroke-colour rebind still reaches its own shadow. */\nhtml body[data-ds-dark-theme],\nhtml body[data-ds-dark-theme] * {\n  --dsw-elevation-stroke: 0 0 0 0.5px var(--dsw-elevation-stroke-color);\n  --dsw-elevation-panel: var(--dsw-elevation-stroke), 0 6px 20px -12px rgba(0, 0, 0, 0.55),\n    0 1px 2px rgba(0, 0, 0, 0.25);\n  --dsw-elevation-prominent: var(--dsw-elevation-stroke), 0 16px 40px -16px rgba(0, 0, 0, 0.6),\n    0 2px 6px rgba(0, 0, 0, 0.3);\n  --dsw-elevation-soft: var(--dsw-elevation-stroke), 0 10px 28px -18px rgba(0, 0, 0, 0.5);\n}\n\n/* =====================================================================\n * 4. Light semantics — the light twin (kept coherent; not the main target).\n * ===================================================================== */\nhtml body:not([data-ds-dark-theme]) {\n  /* The --pui-* primitives are semantic in practice: components read them in\n   * both themes, so the light twin re-points them at the light surface ramp. */\n  --pui-canvas: #f7f7f8;\n  --pui-surface-1: #ffffff;\n  --pui-surface-2: #ffffff;\n  --pui-surface-3: #f0f0f2;\n  --pui-surface-4: #ececef;\n  --pui-surface-5: #e2e2e7;\n  --pui-text-primary: #1a1a1b;\n  --pui-text-secondary: #52525b;\n  --pui-text-tertiary: #5f5f68;\n  --pui-text-caption: #6b6b73;\n  --pui-text-muted: #75757e;\n  --pui-text-on-light: #ffffff;\n  --pui-border-divider: rgba(0, 0, 0, 0.05);\n  --pui-border-default: rgba(0, 0, 0, 0.07);\n  --pui-border-hover: rgba(0, 0, 0, 0.12);\n  --pui-border-active: rgba(0, 0, 0, 0.2);\n  --pui-border-inverted: rgba(255, 255, 255, 0.07);\n\n  --dsw-alias-bg-base: #f7f7f8;\n  --dsw-alias-bg-layer-1: #ffffff;\n  --dsw-alias-bg-layer-2: #ffffff;\n  --dsw-alias-bg-layer-3: #f0f0f2;\n  --dsw-alias-bg-overlay: #ffffff;\n  --dsw-alias-bg-mask-1: rgba(0, 0, 0, 0.28);\n  --dsw-alias-bg-mask-2: rgba(0, 0, 0, 0.12);\n  --dsw-alias-bg-mask-3: rgba(0, 0, 0, 0.42);\n  --dsw-alias-bg-mask-drop: rgba(255, 255, 255, 0.72);\n  --dsw-alias-bg-skeleton: rgba(0, 0, 0, 0.05);\n  --dsw-alias-bg-module-platform: #f0f0f2;\n  --dsw-alias-bg-multi-select: #ececef;\n  --dsw-alias-bg-document-preview: #f0f0f2;\n\n  --dsw-alias-label-primary: #1a1a1b;\n  --dsw-alias-label-secondary: #52525b;\n  --dsw-alias-label-tertiary: #5f5f68;\n  --dsw-alias-label-caption: #6b6b73;\n  --dsw-alias-label-dimmed: #75757e;\n  --dsw-alias-label-primary-dimmed: #333336;\n  --dsw-alias-label-primary-bluish: #1a1a1b;\n  --dsw-alias-label-primary-foreground: #ffffff;\n  --dsw-alias-label-primary-inverted: #ffffff;\n  --dsw-alias-label-shimmer: rgba(0, 0, 0, 0.3);\n  --dsw-alias-menu-icon: #52525b;\n  --dsw-alias-link: #0369a1;\n\n  --dsw-alias-border-l1: rgba(0, 0, 0, 0.05);\n  --dsw-alias-border-l2: rgba(0, 0, 0, 0.07);\n  --dsw-alias-border-l2-darkmode-thin: rgba(0, 0, 0, 0.07);\n  --dsw-alias-border-l3: rgba(0, 0, 0, 0.1);\n  --dsw-alias-border-l4: rgba(0, 0, 0, 0.16);\n\n  --dsw-alias-interactive-bg-hover: rgba(24, 24, 27, 0.05);\n  --dsw-alias-interactive-bg-active: rgba(24, 24, 27, 0.09);\n  --dsw-alias-interactive-bg-hover-solid: #ececef;\n  --dsw-alias-interactive-bg-hover-accent: rgba(14, 165, 233, 0.12);\n  --dsw-alias-interactive-bg-hover-danger: rgba(225, 29, 72, 0.08);\n\n  --dsw-alias-brand-primary: #18181b;\n  --dsw-alias-brand-text: #18181b;\n  --dsw-alias-button-primary-fill: #18181b;\n  --dsw-alias-button-primary-hover: #333336;\n  --dsw-alias-button-primary-dimmed: #d4d4da;\n  --dsw-alias-button-contrast-fill: #18181b;\n  --dsw-alias-button-elevated-fill: #ffffff;\n  --dsw-alias-button-floating-fill: #ffffff;\n  --dsw-alias-button-floating-hover: #f2f2f4;\n  --dsw-alias-button-ghost-active-fill: #ececef;\n  --dsw-alias-button-ghost-active-hover: #e2e2e7;\n  --dsw-alias-button-ghost-active-border: rgba(0, 0, 0, 0.16);\n  --dsw-alias-button-info-fill: #0369a1;\n  --dsw-alias-button-info-hover: #0284c7;\n\n  --dsw-alias-state-business-primary: #0369a1;\n  --dsw-alias-state-business-tertiary: rgba(3, 105, 161, 0.12);\n  --dsw-alias-state-success-primary: #059669;\n  --dsw-alias-state-success-secondary: #10b981;\n  --dsw-alias-state-success-tertiary: rgba(5, 150, 105, 0.12);\n  --dsw-alias-state-warn-primary: #d97706;\n  --dsw-alias-state-warn-secondary: #f59e0b;\n  --dsw-alias-state-warn-tertiary: rgba(217, 119, 6, 0.12);\n  --dsw-alias-state-warn-label: #b45309;\n  --dsw-alias-state-error-primary: #e11d48;\n  --dsw-alias-state-error-secondary: #f43f5e;\n  --dsw-alias-state-done-primary: #7c3aed;\n  --dsw-alias-state-idle-primary: #d4d4da;\n\n  --dsw-alias-markdown-code-block: #f6f6f7;\n  --dsw-alias-markdown-code-block-banner: #f0f0f2;\n  --dsw-alias-markdown-inline-code: #ececef;\n  --dsw-alias-markdown-tag: #ececef;\n  --dsw-alias-markdown-placeholder: rgba(0, 0, 0, 0.14);\n  --dsw-alias-turn-trigger-bg: #f0f0f2;\n  --dsw-alias-turn-trigger-bg-hover: #ececef;\n\n  --dsw-specific-bubble: #f0f0f2;\n  --dsw-specific-bubble-highlight: #e2e2e7;\n  --dsw-specific-input-major: #ffffff;\n  --dsw-specific-selector: #f0f0f2;\n  --dsw-specific-sidebar-fill: #fbfbfc;\n  --dsw-specific-sidebar-nav-item-active: #ececef;\n  --dsw-specific-sidebar-nav-item-active-accent: #0284c7;\n  --dsw-specific-tip: #f0f0f2;\n  --dsw-specific-menu: rgba(255, 255, 255, 0.9);\n  --dsw-menu-surface-fill: rgba(255, 255, 255, 0.9);\n  --dsw-alias-menu-group-header-fill: rgba(255, 255, 255, 0.96);\n\n  --dsw-alias-toast-bg: #18181b;\n  --dsw-alias-toast-label: #ffffff;\n  --dsw-alias-tooltip-bg: #18181b;\n  --dsw-alias-tooltip-key-bg: color-mix(in srgb, #18181b, white 18%);\n  --dsw-alias-switch-thumb: #ffffff;\n  --dsw-alias-scrollbar-bg-l1: rgba(0, 0, 0, 0.16);\n  --dsw-alias-scrollbar-bg-l2: rgba(0, 0, 0, 0.22);\n  --dsw-alias-scrollbar-hover-l1: rgba(0, 0, 0, 0.26);\n  --dsw-alias-scrollbar-hover-l2: rgba(0, 0, 0, 0.32);\n\n  --dsw-elevation-stroke-color: rgba(0, 0, 0, 0.08);\n  --dsw-focus-ring-color: rgba(2, 132, 199, 0.6);\n  --dsw-focus-ring-width: 2px;\n}\n\n/* Light syntax palette tuned for AA on the light code-block surface. */\nhtml body:not([data-ds-dark-theme]) {\n  --shiki-token-constant: #1864ab;\n  --shiki-token-string: #1e7e34;\n  --shiki-token-comment: #5c636a;\n  --shiki-token-keyword: #a61e4d;\n  --shiki-token-parameter: #b35c00;\n  --shiki-token-function: #5f3dc4;\n  --shiki-token-string-expression: #1e7e34;\n  --shiki-token-punctuation: #3b4045;\n  --shiki-token-link: #1864ab;\n}\n\n/* =====================================================================\n * 5. Geometry · typography · motion · focus (theme-independent)\n * ===================================================================== */\nhtml body {\n  --dsh-font-family-text-default: var(--pui-font-ui);\n  --dsh-font-family-code-default: var(--pui-font-mono);\n  --dsw-font-family: var(--dsh-font-family-text, var(--dsh-font-family-text-default));\n  --ds-font-family-code: var(--dsh-font-family-code, var(--dsh-font-family-code-default));\n\n  --ds-ease-in-out: var(--pui-ease-standard);\n  --ds-transition-duration: 0.18s;\n  --ds-transition-duration-fast: 0.11s;\n  --ds-transition-duration-slow: 0.24s;\n\n  --dsh-scrollbar-width: 6px;\n  --pui-line-length: 44rem;\n}\n\n/* =====================================================================\n * 6. Density / radius options (html[data-palace-*], set by client.js)\n * ===================================================================== */\nhtml[data-palace-radius='crisp'] body {\n  --pui-radius-card: 12px;\n  --pui-radius-input: 10px;\n  --pui-radius-panel: 18px;\n  --dsw-radius-lg: 12px;\n  --dsw-radius-xl: 16px;\n  --dsw-radius-panel: 18px;\n}\n\nhtml[data-palace-density='compact'] body {\n  --pui-space-md: 10px;\n  --pui-space-lg: 14px;\n  --pui-space-xl: 20px;\n  --pui-touch-target: 40px;\n}\n","05-fonts":"/* =====================================================================\n * palace-ui / 05 · Bundled webfonts (generated by scripts/fetch-fonts.mjs)\n * =====================================================================\n * Inter + JetBrains Mono (SIL Open Font License), latin subsets only. CJK\n * falls through to the platform stack declared in 00-tokens.css.\n * ===================================================================== */\n@font-face {\n  font-family: 'Inter';\n  font-style: normal;\n  font-weight: 100 900;\n  font-display: swap;\n  src: url(data:font/woff2;base64,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) format('woff2');\n  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;\n}\n\n@font-face {\n  font-family: 'JetBrains Mono';\n  font-style: normal;\n  font-weight: 100 800;\n  font-display: swap;\n  src: url(data:font/woff2;base64,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) format('woff2');\n  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;\n}\n","10-base":"/* =====================================================================\n * palace-ui / 10 · Base layer\n * =====================================================================\n * Global typography, selection, focus, scrollbars, motion and safe-area\n * plumbing. Component geometry lives in 20-components.css; phone behaviour in\n * 30-mobile.css.\n * ===================================================================== */\n\n/* ---- safe-area variables (single source of truth) -------------------- */\n:root {\n  --pui-safe-top: env(safe-area-inset-top, 0px);\n  --pui-safe-right: env(safe-area-inset-right, 0px);\n  --pui-safe-bottom: env(safe-area-inset-bottom, 0px);\n  --pui-safe-left: env(safe-area-inset-left, 0px);\n}\n\n/* ---- document / typography ------------------------------------------ */\nhtml {\n  -webkit-text-size-adjust: 100%;\n  text-size-adjust: 100%;\n  scroll-behavior: smooth;\n  background: var(--dsw-alias-bg-base);\n}\n\nhtml body {\n  font-family: var(--dsw-font-family);\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  text-rendering: optimizeLegibility;\n  font-synthesis-weight: none;\n}\n\nhtml body,\nhtml body button,\nhtml body input,\nhtml body textarea,\nhtml body select {\n  font-feature-settings: 'liga' 1, 'calt' 1;\n}\n\n/* Digits must not dance: time, sizes, counts and token usage are tabular. */\nhtml body time,\nhtml body code,\nhtml body kbd,\nhtml body samp,\nhtml body pre,\nhtml body [data-palace-num],\nhtml body [class*='_usage'],\nhtml body [class*='_token'],\nhtml body [class*='_meter'],\nhtml body [class*='_stats'],\nhtml body [class*='_count'],\nhtml body [class*='_meta'] {\n  font-variant-numeric: tabular-nums;\n}\n\n/* Prose gets balanced wrapping; code and terminals keep their own layout. */\nhtml body :where(p, li, dd, blockquote) {\n  text-wrap: pretty;\n}\n\n/* ---- selection ------------------------------------------------------- */\nhtml body ::selection {\n  background: color-mix(in srgb, var(--pui-accent-sky) 32%, transparent);\n  color: var(--pui-text-primary, inherit);\n}\n\n/* ---- focus: one visible ring, never colour-only ---------------------- */\nhtml body :focus-visible {\n  outline-color: var(--dsw-focus-ring-color, rgba(56, 189, 248, 0.65));\n  outline-offset: 2px;\n}\n\n/* Keyboard-only focus visibility (mouse clicks stay quiet). */\nhtml body[data-input-modality='pointer'] :focus-visible:not(:read-write) {\n  outline-color: transparent;\n}\nhtml body[data-input-modality='keyboard'] :focus-visible {\n  outline-color: var(--dsw-focus-ring-color, rgba(56, 189, 248, 0.65));\n}\n\n/* ---- scrollbars ------------------------------------------------------ */\nhtml body *::-webkit-scrollbar {\n  width: var(--dsh-scrollbar-width, 6px);\n  height: var(--dsh-scrollbar-width, 6px);\n}\nhtml body *::-webkit-scrollbar-track {\n  background: transparent;\n}\nhtml body *::-webkit-scrollbar-thumb {\n  background-color: var(--dsh-scrollbar-thumb, rgba(255, 255, 255, 0.14));\n  border-radius: var(--pui-radius-pill);\n  border: 1px solid transparent;\n  background-clip: content-box;\n}\nhtml body *::-webkit-scrollbar-thumb:hover {\n  background-color: var(--dsh-scrollbar-thumb-hover, rgba(255, 255, 255, 0.24));\n}\n\n/* ---- links ----------------------------------------------------------- */\nhtml body a {\n  text-underline-offset: 3px;\n  text-decoration-thickness: 1px;\n}\n\n/* ---- motion ---------------------------------------------------------- */\n/* Ease-out for exits, standard curve for movement: never springs, never\n * decorative bounce. */\nhtml body button,\nhtml body a,\nhtml body [role='button'],\nhtml body [role='tab'],\nhtml body [role='option'] {\n  transition-timing-function: var(--pui-ease-out);\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html {\n    scroll-behavior: auto;\n  }\n  html body *,\n  html body *::before,\n  html body *::after {\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n    transition-duration: 0.01ms !important;\n    scroll-behavior: auto !important;\n  }\n}\n\n/* The in-app \"reduce motion\" setting mirrors the OS preference. */\nhtml[data-palace-motion='reduced'] {\n  scroll-behavior: auto;\n}\nhtml[data-palace-motion='reduced'] body *,\nhtml[data-palace-motion='reduced'] body *::before,\nhtml[data-palace-motion='reduced'] body *::after {\n  animation-duration: 0.01ms !important;\n  animation-iteration-count: 1 !important;\n  transition-duration: 0.01ms !important;\n  scroll-behavior: auto !important;\n}\n\n/* ---- high contrast / forced colours ---------------------------------- */\n@media (forced-colors: active) {\n  html body :focus-visible {\n    outline: 2px solid Highlight;\n  }\n  html body .palace-ui-skip-link {\n    forced-color-adjust: none;\n  }\n}\n\n/* ---- PWA / standalone window ---------------------------------------- */\n@media (display-mode: standalone) {\n  html body {\n    overscroll-behavior-y: none;\n  }\n}\n\n/* ---- touch: never rely on hover for discoverability ------------------ */\n@media (hover: none) {\n  html body [data-palace-hover-only] {\n    opacity: 1 !important;\n  }\n}\n\n/* ---- text overflow helpers ------------------------------------------- */\nhtml body .palace-ui-truncate {\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\nhtml body .palace-ui-clamp-2 {\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n}\n\n/* ---- skip link (first tab stop) -------------------------------------- */\nhtml body .palace-ui-skip-link {\n  position: fixed;\n  top: calc(var(--pui-safe-top, 0px) + 8px);\n  left: calc(var(--pui-safe-left, 0px) + 8px);\n  z-index: 200;\n  display: inline-flex;\n  align-items: center;\n  min-height: 40px;\n  padding: 0 14px;\n  box-sizing: border-box;\n  border: 1px solid var(--dsw-alias-border-l3, var(--pui-border-hover));\n  border-radius: var(--pui-radius-md);\n  background: var(--dsw-alias-bg-layer-2, var(--pui-surface-2));\n  color: var(--dsw-alias-label-primary, var(--pui-text-primary));\n  box-shadow: var(--dsw-elevation-panel);\n  font-family: var(--dsw-font-family);\n  font-size: 13px;\n  font-weight: 500;\n  text-decoration: none;\n  transform: translateY(-160%);\n  transition: transform var(--pui-duration-panel) var(--pui-ease-out);\n}\nhtml body .palace-ui-skip-link:focus-visible {\n  transform: translateY(0);\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: 2px;\n}\n","20-shell":"/* =====================================================================\n * palace-ui / 20 · Shell chrome\n * =====================================================================\n * Owns the DSH shell's persistent chrome:\n *   1. Sidebar column — brand row, new-session action, global nav,\n *      workspace section header, workspace/session tree, footer launcher.\n *   2. Conversation header — session title + mode badge, 对话/轨迹 tabs,\n *      view overflow, right-side utility actions, blank/home header.\n *   3. Empty-state hero — Palace mark, headline, preview badge, hero chips.\n *\n * Visual rules (see DESIGN_CONTRACT.md):\n *   · 5-level surface ladder: canvas (0) → sidebar (1) → controls (2) →\n *     selected/active (3) → pressed (4). The header stays on canvas so the\n *     conversation column reads as one continuous sheet.\n *   · Depth comes from lightness + hairline strokes, never glow/shadow.\n *   · 4px spacing grid; radii from the --pui-radius ladder.\n *   · Times/counts use mono tabular numerals.\n *   · Hover lives behind @media (hover: hover); selected / focus / disabled\n *     are always rendered. Coarse pointers get ≥44px targets.\n *\n * Pinned DSH 0.2.1-rc.5 CSS-module hashes (audited in docs/palace-ui-shell.md):\n *   Frame      pI_x6G_{frame,sidebarCol,centerCol,handle}\n *   Sidebar    hHd-Xa_{root,collapsed,logoRow,brand,brandIdentity,brandMark,\n *              brandName,toggle,iconButton,newSession,newSessionContent,\n *              newSessionLabel,newSessionShortcut,panelList,panelRow,\n *              panelGlyph,panelTitle,moreAnchor,regionArea,footArea,\n *              footerActions,settingsArea,railMark,panelIcon,railIn,quietBars}\n *   Workspace  bhn1Oq_{root,rail,sectionHeader,sectionLabel,searchSlot,search,\n *              searchButton,searchInput,searchExpanded,headerActions,\n *              iconButton,listArea,treeBody,list,fade}\n *              YDXeBa_{projectRow,sessionRow,selected,menuOpen,title,time,\n *              meta,slot,folder,folderActive,chevron,arrow,rowActions,\n *              iconButton,dot,pinIndicator,archived}\n *   Header     wSkVaW_{root,header,headerBlank,headerLeading,titleRow,\n *              titleCluster,crumbs,crumbSeg,crumb,crumbCurrent,headerActions,\n *              headerUtilities,headerCorner,tabs,viewTabs,tab,tabActive,\n *              tabLabel,viewsMoreAnchor,viewsMore,viewsMoreActive,\n *              heroWorkspaceRow,heroOptions,composerHero}\n *   Badge      SVAs4q_label\n *   Open-in    OMoRSG_{split,main,chevron,appIcon}\n *   More       nL4_yW_moreButton\n *   Hero       pXSMma_{root,stack,headline,titleGroup,previewBadge,fishHitbox,\n *              fish,body,workspace,workspaceLabel,folder,chevron}\n *              cubgiG_{menuAnchor,seat,seatLabel,seatIcon,chevron}\n *   Footer     yHnPSG_{root,anchor,trigger,label}, VOzbGW_triggerRow\n *   Brand slot .pui-brand-name, .pui-mark, .pui-hero-mark (shell/10-brand.js)\n * ===================================================================== */\n\n/* =====================================================================\n * 1. Shell frame + sidebar column\n * ===================================================================== */\nhtml body .pI_x6G_frame {\n  background: var(--dsw-alias-bg-base);\n}\n\nhtml body .pI_x6G_sidebarCol {\n  background: var(--dsw-specific-sidebar-fill);\n  border-right: 1px solid var(--dsw-alias-border-l1);\n}\n\nhtml body .hHd-Xa_root {\n  --dsh-sidebar-inline-padding: 12px;\n  padding: 8px var(--dsh-sidebar-inline-padding) 10px;\n  font-size: 13.5px;\n  color: var(--dsw-alias-label-secondary);\n  background: var(--dsw-specific-sidebar-fill);\n}\n\n/* =====================================================================\n * 2. Brand row\n * ===================================================================== */\nhtml body .hHd-Xa_logoRow {\n  height: 52px;\n  margin: 0 0 6px;\n  padding: 0;\n  gap: 6px;\n  justify-content: space-between;\n  overflow: visible;\n}\n\nhtml body .hHd-Xa_brand {\n  flex: 1 1 auto;\n  min-width: 0;\n  height: 34px;\n  padding: 0 6px;\n  border-radius: var(--pui-radius-sm);\n  color: var(--dsw-alias-label-primary);\n  transition: background-color var(--pui-duration-hover) var(--pui-ease-out);\n}\n@media (hover: hover) {\n  html body .hHd-Xa_brand:hover {\n    background: var(--dsw-alias-interactive-bg-hover);\n  }\n}\nhtml body .hHd-Xa_brand:active {\n  background: var(--dsw-alias-interactive-bg-active);\n}\nhtml body .hHd-Xa_brand:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: 2px;\n}\n\nhtml body .hHd-Xa_brandIdentity {\n  gap: 9px;\n  height: 24px;\n}\nhtml body .hHd-Xa_brandMark {\n  color: var(--dsw-alias-label-primary);\n}\nhtml body .hHd-Xa_brandMark .pui-mark {\n  display: block;\n  width: 20px;\n  height: 20px;\n}\nhtml body .hHd-Xa_brandName {\n  height: 24px;\n  font-size: 15px;\n  font-weight: 600;\n  letter-spacing: -0.01em;\n  gap: 7px;\n}\n\n/* Lead-owned brand markup (shell/10-brand.js) — position only. */\nhtml body .pui-brand-name {\n  display: inline-flex;\n  align-items: center;\n  gap: 7px;\n  min-width: 0;\n  color: var(--dsw-alias-label-primary);\n  font-family: var(--pui-font-ui);\n  font-size: 15px;\n  font-weight: 600;\n  letter-spacing: -0.01em;\n  line-height: 20px;\n}\nhtml body .pui-brand-name__text {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\nhtml body .pui-brand-name__badge {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  height: 16px;\n  padding: 0 4px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: var(--pui-radius-xs);\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-caption);\n  font-family: var(--pui-font-mono);\n  font-size: 9px;\n  font-weight: 600;\n  letter-spacing: 0.06em;\n  line-height: 1;\n  text-transform: uppercase;\n}\n\nhtml body .hHd-Xa_toggle {\n  width: 28px;\n  height: 28px;\n  border-radius: var(--pui-radius-sm);\n  color: var(--dsw-alias-label-tertiary);\n  transition:\n    color var(--pui-duration-hover) var(--pui-ease-out),\n    background-color var(--pui-duration-hover) var(--pui-ease-out);\n}\n@media (hover: hover) {\n  html body .hHd-Xa_toggle:hover {\n    background: var(--dsw-alias-interactive-bg-hover);\n    color: var(--dsw-alias-label-primary);\n  }\n}\nhtml body .hHd-Xa_toggle:active {\n  background: var(--dsw-alias-interactive-bg-active);\n}\nhtml body .hHd-Xa_toggle:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: 2px;\n}\n\n/* =====================================================================\n * 3. New-session action — the sidebar's primary action\n * ===================================================================== */\nhtml body .hHd-Xa_newSession {\n  height: 38px;\n  margin: 0 0 10px;\n  padding: 0 10px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: var(--pui-radius-md);\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-primary);\n  font-size: 13.5px;\n  font-weight: 500;\n  line-height: 20px;\n  justify-content: flex-start;\n  transition:\n    background-color var(--pui-duration-hover) var(--pui-ease-out),\n    border-color var(--pui-duration-hover) var(--pui-ease-out);\n}\nhtml body .hHd-Xa_newSessionContent {\n  width: 100%;\n  justify-content: flex-start;\n  gap: 9px;\n  padding-left: 2px;\n}\nhtml body .hHd-Xa_newSessionContent > svg {\n  flex: none;\n  color: var(--dsw-alias-label-secondary);\n  transition: color var(--pui-duration-hover) var(--pui-ease-out);\n}\n@media (hover: hover) {\n  html body .hHd-Xa_newSession:hover {\n    background: var(--dsw-alias-bg-layer-3);\n    border-color: var(--dsw-alias-border-l3);\n  }\n  html body .hHd-Xa_newSession:hover .hHd-Xa_newSessionContent > svg {\n    color: var(--dsw-alias-label-primary);\n  }\n}\nhtml body .hHd-Xa_newSession:active {\n  background: var(--dsw-alias-interactive-bg-hover-solid);\n  border-color: var(--dsw-alias-border-l4);\n}\nhtml body .hHd-Xa_newSession:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: 2px;\n}\nhtml body .hHd-Xa_newSessionShortcut {\n  color: var(--dsw-alias-label-caption);\n  font-family: var(--pui-font-mono);\n  font-size: 10.5px;\n  font-weight: 500;\n  letter-spacing: 0.02em;\n}\nhtml body .hHd-Xa_newSession[disabled] {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n\n/* =====================================================================\n * 4. Global nav (插件 / 自动化任务 / 更多)\n * ===================================================================== */\nhtml body .hHd-Xa_panelList {\n  gap: 2px;\n  margin-bottom: 4px;\n  padding-bottom: 8px;\n  border-bottom: 1px solid var(--dsw-alias-border-l1);\n}\nhtml body .hHd-Xa_panelRow {\n  min-height: 36px;\n  margin: 0;\n  padding: 0 10px;\n  gap: 10px;\n  border: 1px solid transparent;\n  border-radius: var(--pui-radius-sm);\n  color: var(--dsw-alias-label-secondary);\n  font-size: 13.5px;\n  font-weight: 500;\n  line-height: 20px;\n  transition:\n    background-color var(--pui-duration-hover) var(--pui-ease-out),\n    color var(--pui-duration-hover) var(--pui-ease-out);\n}\n@media (hover: hover) {\n  html body .hHd-Xa_panelRow:hover {\n    background: var(--dsw-alias-interactive-bg-hover);\n    color: var(--dsw-alias-label-primary);\n  }\n}\nhtml body .hHd-Xa_panelRow:active {\n  background: var(--dsw-alias-interactive-bg-active);\n}\nhtml body .hHd-Xa_panelRow.hHd-Xa_panelActive,\nhtml body .hHd-Xa_panelRow[aria-expanded='true'] {\n  background: var(--dsw-alias-bg-layer-3);\n  border-color: var(--dsw-alias-border-l1);\n  color: var(--dsw-alias-label-primary);\n}\nhtml body .hHd-Xa_panelRow:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: -2px;\n}\nhtml body .hHd-Xa_panelGlyph {\n  color: var(--dsw-alias-label-tertiary);\n  transition: color var(--pui-duration-hover) var(--pui-ease-out);\n}\nhtml body .hHd-Xa_panelRow:hover .hHd-Xa_panelGlyph,\nhtml body .hHd-Xa_panelRow.hHd-Xa_panelActive .hHd-Xa_panelGlyph {\n  color: var(--dsw-alias-label-primary);\n}\nhtml body .hHd-Xa_panelTitle {\n  font-size: 13.5px;\n  font-weight: 500;\n  line-height: 20px;\n}\n\n/* =====================================================================\n * 5. Workspace section header (工作区 + search / sort / add)\n * ===================================================================== */\nhtml body .bhn1Oq_sectionHeader {\n  height: 30px;\n  margin: 2px 0 4px;\n  padding: 0 0 0 2px;\n  gap: 2px;\n  color: var(--dsw-alias-label-caption);\n}\nhtml body .bhn1Oq_sectionLabel {\n  padding-left: 8px;\n  color: var(--dsw-alias-label-caption);\n  font-size: 11px;\n  font-weight: 600;\n  letter-spacing: 0.08em;\n  line-height: 16px;\n}\nhtml body .bhn1Oq_iconButton,\nhtml body .bhn1Oq_searchButton,\nhtml body .bhn1Oq_clearButton {\n  width: 26px;\n  height: 26px;\n  border-radius: 6px;\n  color: var(--dsw-alias-label-tertiary);\n  transition:\n    background-color var(--pui-duration-hover) var(--pui-ease-out),\n    color var(--pui-duration-hover) var(--pui-ease-out);\n}\n@media (hover: hover) {\n  html body .bhn1Oq_iconButton:hover,\n  html body .bhn1Oq_searchButton:hover,\n  html body .bhn1Oq_clearButton:hover {\n    background: var(--dsw-alias-interactive-bg-hover);\n    color: var(--dsw-alias-label-primary);\n  }\n}\nhtml body .bhn1Oq_iconButton:active,\nhtml body .bhn1Oq_searchButton:active,\nhtml body .bhn1Oq_clearButton:active {\n  background: var(--dsw-alias-interactive-bg-active);\n}\nhtml body .bhn1Oq_iconButton:focus-visible,\nhtml body .bhn1Oq_searchButton:focus-visible,\nhtml body .bhn1Oq_clearButton:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: 2px;\n}\nhtml body .bhn1Oq_searchExpanded {\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: var(--pui-radius-sm);\n  background: var(--dsw-alias-bg-layer-2);\n  height: 30px;\n}\nhtml body .bhn1Oq_searchInput {\n  color: var(--dsw-alias-label-primary);\n  font-size: 13px;\n}\nhtml body .bhn1Oq_searchInput::placeholder {\n  color: var(--dsw-alias-label-dimmed);\n}\n\n/* =====================================================================\n * 6. Workspace + session tree\n * ===================================================================== */\nhtml body .bhn1Oq_listArea {\n  margin-left: -4px;\n}\nhtml body .bhn1Oq_list {\n  padding-bottom: 12px;\n}\nhtml body .bhn1Oq_fade {\n  background: linear-gradient(to bottom, transparent, var(--dsw-specific-sidebar-fill));\n  height: 20px;\n}\n\nhtml body .YDXeBa_projectRow,\nhtml body .YDXeBa_sessionRow {\n  position: relative;\n  border-radius: var(--pui-radius-sm);\n  padding: 0 8px;\n  color: var(--dsw-alias-label-secondary);\n  transition:\n    background-color var(--pui-duration-hover) var(--pui-ease-out),\n    color var(--pui-duration-hover) var(--pui-ease-out);\n}\nhtml body .YDXeBa_projectRow {\n  height: 32px;\n  gap: 6px;\n}\nhtml body .YDXeBa_sessionRow {\n  height: 34px;\n  gap: 0;\n}\nhtml body .YDXeBa_projectRow .YDXeBa_title,\nhtml body .YDXeBa_sessionRow .YDXeBa_title {\n  color: inherit;\n  font-size: 13.5px;\n  font-weight: 400;\n  line-height: 20px;\n  letter-spacing: 0;\n}\nhtml body .YDXeBa_projectRow .YDXeBa_title {\n  font-weight: 500;\n}\nhtml body .YDXeBa_sessionRow .YDXeBa_title {\n  margin: 0 8px 0 6px;\n}\nhtml body .YDXeBa_slot {\n  color: var(--dsw-alias-label-tertiary);\n}\nhtml body .YDXeBa_folderActive {\n  color: var(--dsw-alias-state-business-primary);\n}\nhtml body .YDXeBa_chevron {\n  color: var(--dsw-alias-label-caption);\n}\nhtml body .YDXeBa_arrow {\n  color: var(--dsw-alias-label-caption);\n}\n\n/* Row hover: quiet fill, title lifts one text step. */\n@media (hover: hover) {\n  html body .YDXeBa_projectRow:hover,\n  html body .YDXeBa_sessionRow:hover {\n    background: var(--dsw-alias-interactive-bg-hover);\n    color: var(--dsw-alias-label-primary);\n  }\n  html body .YDXeBa_sessionRow:hover .YDXeBa_time,\n  html body .YDXeBa_sessionRow.YDXeBa_menuOpen .YDXeBa_time {\n    color: var(--dsw-alias-label-caption);\n  }\n  html body .YDXeBa_projectRow:hover .YDXeBa_rowActions,\n  html body .YDXeBa_sessionRow:hover .YDXeBa_rowActions,\n  html body .YDXeBa_projectRow:focus-within .YDXeBa_rowActions,\n  html body .YDXeBa_sessionRow:focus-within .YDXeBa_rowActions,\n  html body .YDXeBa_projectRow:focus-visible .YDXeBa_rowActions,\n  html body .YDXeBa_sessionRow:focus-visible .YDXeBa_rowActions,\n  html body .YDXeBa_projectRow.YDXeBa_menuOpen .YDXeBa_rowActions,\n  html body .YDXeBa_sessionRow.YDXeBa_menuOpen .YDXeBa_rowActions {\n    display: inline-flex;\n    opacity: 1;\n    pointer-events: auto;\n  }\n}\n\n/* Selected session: level-3 fill + hairline, the strongest quiet state. */\nhtml body .YDXeBa_sessionRow.YDXeBa_selected {\n  background: var(--dsw-alias-bg-layer-3);\n  box-shadow: inset 0 0 0 1px var(--dsw-alias-border-l1);\n  color: var(--dsw-alias-label-primary);\n}\nhtml body .YDXeBa_sessionRow.YDXeBa_selected .YDXeBa_title {\n  font-weight: 500;\n}\n@media (hover: hover) {\n  html body .YDXeBa_sessionRow.YDXeBa_selected:hover {\n    background: var(--dsw-alias-interactive-bg-hover-solid);\n    color: var(--dsw-alias-label-primary);\n  }\n}\n\nhtml body .YDXeBa_sessionRow:active,\nhtml body .YDXeBa_projectRow:active {\n  background: var(--dsw-alias-interactive-bg-active);\n}\nhtml body .YDXeBa_projectRow:focus-visible,\nhtml body .YDXeBa_sessionRow:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: -2px;\n}\n\n/* Relative time: mono tabular numerals, quiet caption. */\nhtml body .YDXeBa_time {\n  flex: none;\n  color: var(--dsw-alias-label-caption);\n  font-family: var(--pui-font-mono);\n  font-size: 10.5px;\n  font-weight: 400;\n  font-variant-numeric: tabular-nums;\n  line-height: 16px;\n  letter-spacing: 0;\n}\nhtml body .YDXeBa_meta {\n  color: var(--dsw-alias-label-caption);\n  font-family: var(--pui-font-mono);\n  font-size: 11px;\n  font-variant-numeric: tabular-nums;\n}\nhtml body .YDXeBa_pinIndicator {\n  color: var(--dsw-alias-label-caption);\n}\n\n/* Running session mark: emerald status dot, no glow, no animation loop. */\nhtml body .YDXeBa_dot {\n  display: inline-flex;\n  flex: none;\n  align-items: center;\n  justify-content: center;\n  width: 8px;\n  height: 8px;\n  border-radius: var(--pui-radius-pill);\n  background: var(--dsw-alias-state-success-primary);\n  color: var(--dsw-alias-state-success-primary);\n}\nhtml body .YDXeBa_dot > svg {\n  width: 8px;\n  height: 8px;\n}\nhtml body .YDXeBa_archived .YDXeBa_title {\n  color: var(--dsw-alias-label-dimmed);\n}\n\nhtml body .YDXeBa_rowActions {\n  flex: none;\n  align-items: center;\n  gap: 2px;\n  opacity: 0;\n  pointer-events: none;\n  transition: opacity var(--pui-duration-hover) var(--pui-ease-out);\n}\nhtml body .YDXeBa_iconButton {\n  width: 22px;\n  height: 22px;\n  border-radius: 6px;\n  color: var(--dsw-alias-label-tertiary);\n}\n@media (hover: hover) {\n  html body .YDXeBa_iconButton:hover {\n    background: var(--dsw-alias-interactive-bg-hover);\n    color: var(--dsw-alias-label-primary);\n  }\n}\nhtml body .YDXeBa_iconButton:active {\n  background: var(--dsw-alias-interactive-bg-active);\n}\nhtml body .YDXeBa_iconButton:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: 2px;\n}\n\n/* Coarse primary pointer: row actions are never hover-gated. Each action gets\n * a full 44x44 target with 8px spacing; the relative time / chevron yield their\n * columns so the row does not overflow. */\n@media (pointer: coarse) {\n  html body .YDXeBa_projectRow .YDXeBa_rowActions,\n  html body .YDXeBa_sessionRow .YDXeBa_rowActions {\n    display: inline-flex;\n    gap: 8px;\n    opacity: 1;\n    pointer-events: auto;\n  }\n  html body .YDXeBa_projectRow .YDXeBa_chevron {\n    display: none;\n  }\n  html body .YDXeBa_sessionRow .YDXeBa_time,\n  html body .YDXeBa_sessionRow .YDXeBa_pinIndicator {\n    display: none;\n  }\n  /* Session rows expose a single 44x44 \"…\" menu on touch; archive / pin stay\n   * inside that menu, so the title keeps its width in the 280px sidebar. The\n   * slot wrapper carries an inline `display: contents`, so hide its buttons\n   * instead of the wrapper (no !important needed). */\n  html body .YDXeBa_sessionRow .YDXeBa_rowActions > [data-slot='sidebar.workspaces.session.row.action'] button {\n    display: none;\n  }\n  html body .YDXeBa_rowActions .YDXeBa_iconButton {\n    width: var(--pui-touch-target);\n    height: var(--pui-touch-target);\n    border-radius: var(--pui-radius-sm);\n  }\n}\n\n/* =====================================================================\n * 7. Sidebar footer (更多 / account launcher)\n * ===================================================================== */\nhtml body .hHd-Xa_footArea {\n  margin-top: 4px;\n  padding-top: 6px;\n  border-top: 1px solid var(--dsw-alias-border-l1);\n}\nhtml body .VOzbGW_triggerRow {\n  width: 100%;\n}\nhtml body .yHnPSG_trigger {\n  width: 100%;\n  height: 32px;\n  padding: 0 10px;\n  gap: 12px;\n  border-radius: var(--pui-radius-sm);\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 13.5px;\n  font-weight: 500;\n  justify-content: flex-start;\n  transition:\n    background-color var(--pui-duration-hover) var(--pui-ease-out),\n    color var(--pui-duration-hover) var(--pui-ease-out);\n}\nhtml body .yHnPSG_trigger svg {\n  flex: none;\n  color: var(--dsw-alias-label-tertiary);\n}\nhtml body .yHnPSG_label {\n  color: inherit;\n  font-size: 13.5px;\n  font-weight: 500;\n  line-height: 20px;\n}\n@media (hover: hover) {\n  html body .yHnPSG_trigger:hover {\n    background: var(--dsw-alias-interactive-bg-hover);\n    color: var(--dsw-alias-label-primary);\n  }\n  html body .yHnPSG_trigger:hover svg {\n    color: var(--dsw-alias-label-primary);\n  }\n}\nhtml body .yHnPSG_trigger:active {\n  background: var(--dsw-alias-interactive-bg-active);\n}\nhtml body .yHnPSG_trigger:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: -2px;\n}\n\n/* =====================================================================\n * 8. Collapsed rail (56px)\n * ===================================================================== */\nhtml body .hHd-Xa_root.hHd-Xa_collapsed {\n  padding: 10px 10px 8px;\n}\nhtml body .hHd-Xa_collapsed .hHd-Xa_logoRow {\n  justify-content: center;\n  height: 44px;\n  margin: 0 0 6px;\n  padding: 0;\n  gap: 0;\n}\nhtml body .hHd-Xa_collapsed .hHd-Xa_brand {\n  display: none;\n}\nhtml body .hHd-Xa_collapsed .hHd-Xa_toggle {\n  width: 36px;\n  height: 36px;\n  border-radius: var(--pui-radius-md);\n  color: var(--dsw-alias-label-primary);\n}\nhtml body .hHd-Xa_collapsed .hHd-Xa_railMark {\n  color: var(--dsw-alias-label-primary);\n}\nhtml body .hHd-Xa_collapsed .hHd-Xa_railMark .pui-mark {\n  display: block;\n  width: 22px;\n  height: 22px;\n}\nhtml body .hHd-Xa_collapsed .hHd-Xa_toggle .hHd-Xa_panelIcon {\n  display: none;\n  color: var(--dsw-alias-label-primary);\n}\n@media (hover: hover) {\n  html body .hHd-Xa_collapsed .hHd-Xa_toggle:hover {\n    background: var(--dsw-alias-bg-layer-2);\n  }\n  html body .hHd-Xa_collapsed .hHd-Xa_toggle:hover .hHd-Xa_panelIcon {\n    display: inline;\n  }\n  html body .hHd-Xa_collapsed .hHd-Xa_toggle:hover .hHd-Xa_railMark {\n    display: none;\n  }\n}\n\nhtml body .hHd-Xa_collapsed .hHd-Xa_newSession {\n  align-self: center;\n  width: 36px;\n  height: 36px;\n  margin: 0 0 10px;\n  padding: 0;\n  border-color: transparent;\n  border-radius: var(--pui-radius-md);\n  background: transparent;\n  color: var(--dsw-alias-label-secondary);\n  justify-content: center;\n}\nhtml body .hHd-Xa_collapsed .hHd-Xa_newSessionContent {\n  width: auto;\n  padding-left: 0;\n  justify-content: center;\n}\n@media (hover: hover) {\n  html body .hHd-Xa_collapsed .hHd-Xa_newSession:hover {\n    background: var(--dsw-alias-bg-layer-2);\n    color: var(--dsw-alias-label-primary);\n  }\n}\nhtml body .hHd-Xa_collapsed .hHd-Xa_newSession:active {\n  background: var(--dsw-alias-bg-layer-3);\n}\n\nhtml body .hHd-Xa_collapsed .hHd-Xa_panelList {\n  position: relative;\n  align-items: center;\n  gap: 6px;\n  margin-bottom: 14px;\n  padding-bottom: 0;\n  border-bottom: none;\n}\nhtml body .hHd-Xa_collapsed .hHd-Xa_panelList::after {\n  content: '';\n  position: absolute;\n  left: 50%;\n  bottom: -8px;\n  width: 20px;\n  height: 1px;\n  background: var(--dsw-alias-border-l1);\n  transform: translateX(-50%);\n}\nhtml body .hHd-Xa_collapsed .hHd-Xa_panelRow {\n  width: 36px;\n  height: 36px;\n  margin: 0;\n  padding: 0;\n  justify-content: center;\n  border-radius: var(--pui-radius-md);\n  color: var(--dsw-alias-label-secondary);\n}\nhtml body .hHd-Xa_collapsed .hHd-Xa_panelRow .hHd-Xa_panelTitle {\n  display: none;\n}\nhtml body .hHd-Xa_collapsed .hHd-Xa_panelGlyph svg {\n  width: 18px;\n  height: 18px;\n}\nhtml body .hHd-Xa_collapsed .hHd-Xa_panelRow.hHd-Xa_panelActive,\nhtml body .hHd-Xa_collapsed .hHd-Xa_panelRow[aria-expanded='true'] {\n  background: var(--dsw-alias-bg-layer-3);\n  border-color: transparent;\n  color: var(--dsw-alias-label-primary);\n}\n@media (hover: hover) {\n  html body .hHd-Xa_collapsed .hHd-Xa_panelRow:hover {\n    background: var(--dsw-alias-bg-layer-2);\n    color: var(--dsw-alias-label-primary);\n  }\n}\n\nhtml body .hHd-Xa_collapsed .hHd-Xa_regionArea {\n  margin-left: 0;\n  margin-right: 0;\n  padding-left: 0;\n}\nhtml body .hHd-Xa_collapsed .bhn1Oq_root.bhn1Oq_rail {\n  align-items: center;\n  padding-right: 0;\n}\nhtml body .hHd-Xa_collapsed .bhn1Oq_sectionHeader {\n  height: 36px;\n  margin: 0 0 6px;\n  padding: 0;\n  justify-content: center;\n  gap: 0;\n}\nhtml body .hHd-Xa_collapsed .bhn1Oq_sectionLabel {\n  display: none;\n}\nhtml body .hHd-Xa_collapsed .bhn1Oq_headerActions {\n  max-width: none;\n  gap: 0;\n}\nhtml body .hHd-Xa_collapsed .bhn1Oq_iconButton,\nhtml body .hHd-Xa_collapsed .bhn1Oq_searchButton {\n  width: 36px;\n  height: 36px;\n  border-radius: var(--pui-radius-md);\n  color: var(--dsw-alias-label-secondary);\n}\nhtml body .hHd-Xa_collapsed .bhn1Oq_search {\n  width: 36px;\n  height: 36px;\n  margin: 0 0 8px;\n  border-radius: var(--pui-radius-md);\n}\nhtml body .hHd-Xa_collapsed .bhn1Oq_searchButton svg {\n  width: 18px;\n  height: 18px;\n}\nhtml body .hHd-Xa_collapsed .bhn1Oq_listArea {\n  align-items: center;\n  margin-left: 0;\n  margin-right: 0;\n  padding-left: 0;\n}\nhtml body .hHd-Xa_collapsed .bhn1Oq_list {\n  margin-left: 0;\n  margin-right: 0;\n  padding-left: 0;\n  padding-right: 0;\n}\nhtml body .hHd-Xa_collapsed .YDXeBa_projectRow,\nhtml body .hHd-Xa_collapsed .YDXeBa_sessionRow {\n  width: 36px;\n  height: 36px;\n  padding: 0;\n  justify-content: center;\n  border-radius: var(--pui-radius-md);\n}\nhtml body .hHd-Xa_collapsed .YDXeBa_title,\nhtml body .hHd-Xa_collapsed .YDXeBa_time,\nhtml body .hHd-Xa_collapsed .YDXeBa_rowActions,\nhtml body .hHd-Xa_collapsed .YDXeBa_chevron {\n  display: none;\n}\nhtml body .hHd-Xa_collapsed .YDXeBa_folderActive {\n  color: var(--dsw-alias-state-business-primary);\n}\nhtml body .hHd-Xa_collapsed .hHd-Xa_footArea {\n  align-items: center;\n  margin-top: 0;\n  padding-top: 8px;\n}\nhtml body .hHd-Xa_collapsed .yHnPSG_trigger {\n  width: 36px;\n  height: 36px;\n  padding: 0;\n  justify-content: center;\n  border-radius: var(--pui-radius-md);\n}\nhtml body .hHd-Xa_collapsed .yHnPSG_label {\n  display: none;\n}\n\n/* =====================================================================\n * 9. Conversation header\n * ===================================================================== */\nhtml body .wSkVaW_header {\n  min-height: 0;\n  padding: 8px 16px 0 20px;\n  border-bottom: 1px solid var(--dsw-alias-border-l1);\n}\nhtml body .wSkVaW_headerBlank {\n  min-height: 48px;\n  padding: 10px 16px;\n  border-bottom: none;\n}\nhtml body .wSkVaW_titleRow {\n  min-height: 32px;\n}\nhtml body .wSkVaW_titleCluster {\n  gap: 10px;\n}\nhtml body .wSkVaW_headerLeading {\n  gap: 8px;\n}\n\n/* Session title / breadcrumb */\nhtml body .wSkVaW_crumbs {\n  gap: 2px;\n}\nhtml body .wSkVaW_crumb {\n  max-width: 260px;\n  padding: 4px 8px;\n  border-radius: var(--pui-radius-sm);\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 13.5px;\n  line-height: 20px;\n}\nhtml body button.wSkVaW_crumb {\n  transition:\n    background-color var(--pui-duration-hover) var(--pui-ease-out),\n    color var(--pui-duration-hover) var(--pui-ease-out);\n}\n@media (hover: hover) {\n  html body button.wSkVaW_crumb:hover {\n    background: var(--dsw-alias-interactive-bg-hover);\n    color: var(--dsw-alias-label-primary);\n  }\n}\nhtml body .wSkVaW_crumbCurrent {\n  color: var(--dsw-alias-label-primary);\n  font-size: 13.5px;\n  font-weight: 500;\n  letter-spacing: -0.005em;\n}\nhtml body .wSkVaW_crumbSep {\n  color: var(--dsw-alias-label-dimmed);\n  font-size: 13px;\n}\nhtml body .wSkVaW_headerActions {\n  gap: 8px;\n}\n\n/* Mode badge (标准模式) — informational pill, not a button. */\nhtml body .SVAs4q_label {\n  box-sizing: border-box;\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  height: 22px;\n  padding: 0 8px;\n  border: 1px solid var(--dsw-alias-border-l1);\n  border-radius: var(--pui-radius-pill);\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-secondary);\n  font-size: 11.5px;\n  font-weight: 500;\n  line-height: 1;\n  white-space: nowrap;\n}\nhtml body .SVAs4q_icon {\n  flex: none;\n  width: 13px;\n  height: 13px;\n  color: var(--dsw-alias-label-tertiary);\n}\n\n/* Right-side utilities */\nhtml body .wSkVaW_headerUtilities {\n  gap: 6px;\n  margin-left: 12px;\n}\nhtml body .wSkVaW_headerCorner {\n  margin-left: 6px;\n  margin-right: 0;\n}\nhtml body .wSkVaW_headerUtilities button,\nhtml body .wSkVaW_headerCorner button,\nhtml body .wSkVaW_headerActions button {\n  border-radius: var(--pui-radius-sm);\n  color: var(--dsw-alias-label-tertiary);\n  transition:\n    background-color var(--pui-duration-hover) var(--pui-ease-out),\n    color var(--pui-duration-hover) var(--pui-ease-out);\n}\n@media (hover: hover) {\n  html body .wSkVaW_headerUtilities button:hover,\n  html body .wSkVaW_headerCorner button:hover,\n  html body .wSkVaW_headerActions button:hover {\n    background: var(--dsw-alias-interactive-bg-hover);\n    color: var(--dsw-alias-label-primary);\n  }\n}\nhtml body .wSkVaW_headerUtilities button:active,\nhtml body .wSkVaW_headerCorner button:active {\n  background: var(--dsw-alias-interactive-bg-active);\n}\nhtml body .wSkVaW_headerUtilities button:focus-visible,\nhtml body .wSkVaW_headerCorner button:focus-visible,\nhtml body .wSkVaW_headerActions button:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: 2px;\n}\nhtml body .wSkVaW_headerUtilities button[aria-expanded='true'],\nhtml body .wSkVaW_headerCorner button[aria-expanded='true'] {\n  background: var(--dsw-alias-bg-layer-3);\n  color: var(--dsw-alias-label-primary);\n}\nhtml body .wSkVaW_headerUtilities button[disabled],\nhtml body .wSkVaW_headerCorner button[disabled] {\n  opacity: 0.4;\n  cursor: not-allowed;\n}\n\n/* VS Code split control: one hairline capsule, two quiet segments. */\nhtml body .OMoRSG_split {\n  height: 26px;\n  border: 1px solid var(--dsw-alias-border-l1);\n  border-radius: 7px;\n  background: transparent;\n  overflow: hidden;\n  transition: border-color var(--pui-duration-hover) var(--pui-ease-out);\n}\nhtml body .OMoRSG_main,\nhtml body .OMoRSG_chevron {\n  height: 24px;\n  padding: 0 6px;\n  border-radius: 0;\n  color: var(--dsw-alias-label-tertiary);\n  background: transparent;\n}\nhtml body .OMoRSG_chevron {\n  width: 20px;\n  padding: 0;\n  border-left: 1px solid var(--dsw-alias-border-l1);\n}\n@media (hover: hover) {\n  html body .OMoRSG_split:hover {\n    border-color: var(--dsw-alias-border-l3);\n  }\n  html body .OMoRSG_main:hover,\n  html body .OMoRSG_chevron:hover {\n    background: var(--dsw-alias-interactive-bg-hover);\n    color: var(--dsw-alias-label-primary);\n  }\n}\nhtml body .OMoRSG_main:active,\nhtml body .OMoRSG_chevron:active {\n  background: var(--dsw-alias-interactive-bg-active);\n}\nhtml body .OMoRSG_main:focus-visible,\nhtml body .OMoRSG_chevron:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: -2px;\n}\nhtml body .OMoRSG_appIcon {\n  width: 13px;\n  height: 13px;\n  opacity: 0.9;\n}\n\nhtml body .wSkVaW_headerCorner button {\n  width: 28px;\n  height: 28px;\n  border-radius: var(--pui-radius-sm);\n  color: var(--dsw-alias-label-tertiary);\n}\nhtml body .wSkVaW_headerCorner button svg {\n  color: currentColor;\n}\n\n/* =====================================================================\n * 10. View tabs (对话 / 轨迹) — segmented control, not underline tabs\n * ===================================================================== */\nhtml body .wSkVaW_tabs {\n  align-items: center;\n  gap: 8px;\n  margin-top: 6px;\n  padding-left: 0;\n  min-height: 30px;\n  min-width: 0;\n}\nhtml body .wSkVaW_viewTabs {\n  flex-wrap: nowrap;\n  gap: 2px;\n  padding: 2px;\n  min-height: 0;\n  max-width: 100%;\n  border: 1px solid var(--dsw-alias-border-l1);\n  border-radius: var(--pui-radius-sm);\n  background: var(--dsw-alias-bg-layer-1);\n}\nhtml body .wSkVaW_tab {\n  min-height: 26px;\n  padding: 0 10px;\n  border-radius: 6px;\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 12.5px;\n  font-weight: 500;\n  line-height: 26px;\n  transition:\n    background-color var(--pui-duration-hover) var(--pui-ease-out),\n    color var(--pui-duration-hover) var(--pui-ease-out);\n}\nhtml body .wSkVaW_tab:after {\n  display: none;\n}\n@media (hover: hover) {\n  html body .wSkVaW_tab:hover {\n    background: var(--dsw-alias-bg-layer-2);\n    color: var(--dsw-alias-label-primary);\n  }\n}\nhtml body .wSkVaW_tab:active {\n  background: var(--dsw-alias-interactive-bg-active);\n}\nhtml body .wSkVaW_tabActive {\n  background: var(--dsw-alias-bg-layer-3);\n  box-shadow: inset 0 0 0 1px var(--dsw-alias-border-l2);\n  color: var(--dsw-alias-label-primary);\n}\nhtml body .wSkVaW_tabActive:hover {\n  background: var(--dsw-alias-bg-layer-3);\n  color: var(--dsw-alias-label-primary);\n}\nhtml body .wSkVaW_tab:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: 2px;\n}\nhtml body .wSkVaW_tabLabel {\n  max-width: 120px;\n  font-size: 12.5px;\n  line-height: 26px;\n}\nhtml body .wSkVaW_viewsMoreAnchor {\n  margin-left: 2px;\n}\nhtml body .wSkVaW_viewsMore {\n  width: 26px;\n  height: 26px;\n  margin-top: 0;\n  border-radius: 6px;\n  color: var(--dsw-alias-label-tertiary);\n  transition:\n    background-color var(--pui-duration-hover) var(--pui-ease-out),\n    color var(--pui-duration-hover) var(--pui-ease-out);\n}\n@media (hover: hover) {\n  html body .wSkVaW_viewsMore:hover {\n    background: var(--dsw-alias-interactive-bg-hover);\n    color: var(--dsw-alias-label-primary);\n  }\n}\nhtml body .wSkVaW_viewsMore[aria-expanded='true'],\nhtml body .wSkVaW_viewsMoreActive {\n  background: var(--dsw-alias-bg-layer-3);\n  color: var(--dsw-alias-label-primary);\n}\nhtml body .wSkVaW_viewsMore:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: 2px;\n}\n/* Extra view actions injected into the tab row stay quiet. Scoped to buttons\n * that are not the tabs themselves so the active tab keeps its own colour. */\nhtml body .wSkVaW_tabs button:not(.wSkVaW_tab):not(.wSkVaW_viewsMore) {\n  border-radius: 6px;\n  color: var(--dsw-alias-label-tertiary);\n}\n@media (hover: hover) {\n  html body .wSkVaW_tabs button:not(.wSkVaW_tab):not(.wSkVaW_viewsMore):hover {\n    background: var(--dsw-alias-interactive-bg-hover);\n    color: var(--dsw-alias-label-primary);\n  }\n}\n\n/* =====================================================================\n * 11. Empty-state hero\n * ===================================================================== */\nhtml body .pXSMma_root {\n  padding: 0 24px;\n}\nhtml body .pXSMma_headline {\n  gap: 12px 10px;\n  color: var(--dsw-alias-label-primary);\n  font-size: clamp(22px, 4.6vw, 28px);\n  font-weight: 600;\n  letter-spacing: -0.015em;\n  line-height: 1.3;\n}\nhtml body .pXSMma_fishHitbox {\n  color: var(--dsw-alias-label-primary);\n  transition: color var(--pui-duration-hover) var(--pui-ease-out);\n}\nhtml body .pui-hero-mark {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n}\nhtml body .pui-hero-mark .pui-mark {\n  display: block;\n  width: 34px;\n  height: 34px;\n}\n@media (max-width: 480px) {\n  html body .pui-hero-mark .pui-mark {\n    width: 28px;\n    height: 28px;\n  }\n  html body .pXSMma_fishHitbox {\n    width: 28px;\n    height: 28px;\n  }\n}\nhtml body .pXSMma_titleGroup {\n  gap: 6px 10px;\n}\nhtml body .pXSMma_previewBadge {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  align-self: center;\n  height: 20px;\n  margin-top: 0;\n  padding: 0 8px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: var(--pui-radius-pill);\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-secondary);\n  font-family: var(--pui-font-ui);\n  font-size: 11px;\n  font-weight: 500;\n  line-height: 1;\n  white-space: nowrap;\n}\nhtml body .pXSMma_previewBadge::before {\n  content: '';\n  width: 5px;\n  height: 5px;\n  border-radius: var(--pui-radius-pill);\n  background: var(--dsw-alias-state-business-primary);\n}\nhtml body .pXSMma_body {\n  gap: 12px;\n}\n\n/* Hero chips (workspace + 标准模式) — one quiet capsule language. */\nhtml body .wSkVaW_heroWorkspaceRow {\n  justify-content: center;\n  gap: 8px;\n  margin-top: 4px;\n  padding: 0;\n  min-height: 30px;\n}\nhtml body .pXSMma_workspace,\nhtml body .cubgiG_seat {\n  height: 30px;\n  min-height: 30px;\n  padding: 0 10px;\n  gap: 6px;\n  border: 1px solid var(--dsw-alias-border-l1);\n  border-radius: var(--pui-radius-sm);\n  background: transparent;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12.5px;\n  font-weight: 500;\n  line-height: 20px;\n  transition:\n    background-color var(--pui-duration-hover) var(--pui-ease-out),\n    border-color var(--pui-duration-hover) var(--pui-ease-out),\n    color var(--pui-duration-hover) var(--pui-ease-out);\n}\n@media (hover: hover) {\n  html body .pXSMma_workspace:not(:disabled):hover,\n  html body .cubgiG_seat:hover {\n    background: var(--dsw-alias-bg-layer-2);\n    border-color: var(--dsw-alias-border-l2);\n    color: var(--dsw-alias-label-primary);\n  }\n}\nhtml body .pXSMma_workspace[aria-expanded='true'],\nhtml body .cubgiG_seat[aria-expanded='true'] {\n  background: var(--dsw-alias-bg-layer-3);\n  border-color: var(--dsw-alias-border-l3);\n  color: var(--dsw-alias-label-primary);\n}\nhtml body .pXSMma_workspace:focus-visible,\nhtml body .cubgiG_seat:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: 2px;\n}\nhtml body .pXSMma_workspace:disabled,\nhtml body .cubgiG_seat:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\nhtml body .pXSMma_folder,\nhtml body .cubgiG_seatIcon {\n  flex: none;\n  color: var(--dsw-alias-label-tertiary);\n}\nhtml body .pXSMma_workspaceLabel,\nhtml body .cubgiG_seatLabel {\n  color: inherit;\n  font-size: 12.5px;\n  font-weight: 500;\n  line-height: 20px;\n}\nhtml body .pXSMma_chevron,\nhtml body .cubgiG_chevron {\n  flex: none;\n  color: var(--dsw-alias-label-dimmed);\n}\nhtml body .wSkVaW_heroOptions {\n  gap: 6px;\n}\n/* The options slot is rendered as an empty wrapper (not :empty) when no plugin\n * contributes hero options; its `margin-left:auto` would push the chips to the\n * left edge, so hide it until it actually contains an actionable control. */\nhtml body .wSkVaW_heroOptions:not(:has(button, a, [role='button'], [role='menuitem'])) {\n  display: none;\n}\n\n/* =====================================================================\n * 12. Coarse pointers — 44px touch targets, no hover-only actions\n * ===================================================================== */\n@media (pointer: coarse) {\n  /* Sidebar: rows grow to a full touch target. */\n  html body .hHd-Xa_panelRow {\n    min-height: var(--pui-touch-target);\n  }\n  html body .YDXeBa_projectRow,\n  html body .YDXeBa_sessionRow {\n    height: var(--pui-touch-target);\n  }\n  html body .hHd-Xa_newSession {\n    height: var(--pui-touch-target);\n  }\n  html body .hHd-Xa_toggle,\n  html body .bhn1Oq_iconButton,\n  html body .bhn1Oq_searchButton,\n  html body .yHnPSG_trigger {\n    min-width: var(--pui-touch-target);\n    min-height: var(--pui-touch-target);\n  }\n  html body .bhn1Oq_sectionHeader {\n    height: 40px;\n  }\n\n  /* Collapsed rail: 44px content column inside the 56px strip. */\n  html body .hHd-Xa_root.hHd-Xa_collapsed {\n    padding-left: 6px;\n    padding-right: 6px;\n  }\n  html body .hHd-Xa_collapsed .hHd-Xa_toggle,\n  html body .hHd-Xa_collapsed .hHd-Xa_newSession,\n  html body .hHd-Xa_collapsed .hHd-Xa_panelRow,\n  html body .hHd-Xa_collapsed .bhn1Oq_iconButton,\n  html body .hHd-Xa_collapsed .bhn1Oq_searchButton,\n  html body .hHd-Xa_collapsed .yHnPSG_trigger {\n    width: var(--pui-touch-target);\n    height: var(--pui-touch-target);\n    min-width: var(--pui-touch-target);\n    min-height: var(--pui-touch-target);\n  }\n  html body .hHd-Xa_collapsed .bhn1Oq_search {\n    width: var(--pui-touch-target);\n    height: var(--pui-touch-target);\n  }\n\n  /* Header: visual size stays compact, hit area expands to 44px. */\n  html body .wSkVaW_headerUtilities button,\n  html body .wSkVaW_headerCorner button,\n  html body .wSkVaW_viewsMore {\n    position: relative;\n  }\n  html body .wSkVaW_headerUtilities button::after,\n  html body .wSkVaW_headerCorner button::after {\n    content: '';\n    position: absolute;\n    inset: -8px;\n  }\n  html body .wSkVaW_viewsMore::after {\n    content: '';\n    position: absolute;\n    inset: -9px;\n  }\n  html body .OMoRSG_split {\n    height: 36px;\n  }\n  html body .OMoRSG_main,\n  html body .OMoRSG_chevron {\n    position: relative;\n  }\n  html body .OMoRSG_main::after,\n  html body .OMoRSG_chevron::after {\n    content: '';\n    position: absolute;\n    inset: -5px 0;\n  }\n  html body .OMoRSG_main,\n  html body .OMoRSG_chevron {\n    height: 34px;\n  }\n  html body .OMoRSG_main {\n    min-width: 32px;\n  }\n  html body .OMoRSG_chevron {\n    width: 24px;\n  }\n  html body .wSkVaW_headerCorner button {\n    width: 32px;\n    height: 32px;\n  }\n  html body .wSkVaW_tab {\n    min-height: var(--pui-touch-target);\n    line-height: 40px;\n    padding: 0 14px;\n  }\n  html body .pXSMma_workspace,\n  html body .cubgiG_seat {\n    height: var(--pui-touch-target);\n    min-height: var(--pui-touch-target);\n  }\n}\n\n/* =====================================================================\n * 13. Narrow desktop / tablet — keep the chrome from crowding content\n * ===================================================================== */\n@media (max-width: 1024px) {\n  html body .wSkVaW_header {\n    padding: 8px 12px 0 16px;\n  }\n  html body .wSkVaW_crumb {\n    max-width: 180px;\n  }\n  html body .wSkVaW_headerUtilities {\n    margin-left: 8px;\n  }\n}\n@media (max-width: 860px) {\n  html body .wSkVaW_header {\n    padding: 8px 10px 0 14px;\n  }\n  html body .wSkVaW_crumb {\n    max-width: 140px;\n  }\n  html body .pXSMma_root {\n    padding: 0 16px;\n  }\n}\n","21-conversation":"/* =====================================================================\n * palace-ui / 21 · Conversation transcript\n * =====================================================================\n * The reading surface: transcript rhythm, user bubbles, assistant markdown,\n * code chrome, tables, reasoning / tool-call rows, turn status and action\n * rows, streaming and scroll affordances.\n *\n * Section map\n *   1. Frame, reading column, vertical rhythm\n *   2. User message + actions\n *   3. Assistant markdown (type scale, lists, quote, hr, links, inline code,\n *      images, misc inline elements)\n *   4. Code blocks (banner, wrap policy, scroll)\n *   5. Tables (internal scroll, sticky head, hairlines, numerals, zebra)\n *   6. Reasoning / tool rows (six-state language, terminal, web results)\n *   7. Turn status, action row, usage + time meta\n *   8. Streaming, scroll-to-bottom and error surfaces\n *   9. Responsive, touch, forced-colours, reduced motion\n *\n * Every selector is pinned to DSH 0.2.1-rc.5 CSS-module hashes; the hash map\n * and its role live in docs/palace-ui-conversation.md. Tokens only — a literal\n * colour must never appear in this file.\n * ===================================================================== */\n\n/* Component-local readable error text. Rose-soft reads well on the dark\n * canvas, but is too light on the light canvas; both resolve from tokens. */\nhtml body {\n  --pui-c-error-text: var(--pui-accent-rose-soft);\n}\n\nhtml body:not([data-ds-dark-theme]) {\n  --pui-c-error-text: color-mix(\n    in srgb,\n    var(--dsw-alias-state-error-primary) 86%,\n    var(--dsw-alias-label-primary)\n  );\n}\n\n/* Markdown links inherit the stock link colour in dark (11:1 on canvas); in\n * light the stock #0284c7 is 3.83:1, so mix towards text-primary for 4.9:1. */\nhtml body {\n  --pui-c-link: var(--dsw-alias-link);\n}\n\nhtml body:not([data-ds-dark-theme]) {\n  --pui-c-link: color-mix(in srgb, var(--dsw-alias-link) 82%, var(--dsw-alias-label-primary));\n}\n\n/* =====================================================================\n * 1. Frame · reading column · vertical rhythm\n * ===================================================================== */\n\n/* The transcript keeps the user-resizable DSH column width; we only tune the\n * scroll padding so anchor jumps and the sticky code banner breathe. */\nhtml body .EvIC1a_scroll {\n  padding-top: 20px;\n  padding-bottom: 28px;\n  scroll-padding-block: 24px;\n  overscroll-behavior-y: contain;\n}\n\nhtml body .EvIC1a_column {\n  min-width: 0;\n}\n\nhtml body .EvIC1a_flowItem {\n  min-width: 0;\n}\n\n/* A new user turn opens a new reading beat: room above the bubble, while the\n * stock inter-item gap keeps tool rows dense. Padding (not margin) avoids a\n * specificity fight with the stock gap machinery. */\nhtml body .EvIC1a_column > .EvIC1a_flowItem[data-chat-flow-kind='user'] {\n  padding-top: 22px;\n}\n\nhtml body .EvIC1a_column > .EvIC1a_flowItem[data-chat-flow-kind='user']:first-child {\n  padding-top: 0;\n}\n\nhtml body .EvIC1a_flowItem[data-chat-flow-kind='turn-process'] {\n  padding-top: 2px;\n}\n\nhtml body .EvIC1a_flowItem[data-chat-group-part='response'] {\n  padding-top: 2px;\n}\n\n/* Turn tail is the quiet end of a turn: keep it tight against the answer. */\nhtml body .EvIC1a_flowItem[data-chat-flow-kind='turn-tail'] {\n  padding-top: 2px;\n}\n\nhtml body .EvIC1a_turnSpacer {\n  height: 8px;\n}\n\n/* =====================================================================\n * 2. User message · surface-3 bubble, hover/focus actions\n * ===================================================================== */\n\nhtml body .Sixlwa_userRow {\n  gap: 2px;\n}\n\nhtml body .Sixlwa_userStack {\n  max-width: min(calc(var(--dsh-chat-content-width, 748px) * 0.78), 88%);\n  gap: 4px;\n}\n\nhtml body .Sixlwa_bubble {\n  background: var(--dsw-specific-bubble);\n  border: 1px solid var(--pui-border-default);\n  border-radius: var(--pui-radius-card) var(--pui-radius-card) var(--pui-radius-xs)\n    var(--pui-radius-card);\n  padding: 11px 16px;\n  font-size: calc(var(--dsh-content-font-size, 14px) + 1px);\n  line-height: 1.68;\n  color: var(--dsw-alias-label-primary);\n  white-space: pre-wrap;\n  word-break: break-word;\n  overflow-wrap: anywhere;\n}\n\n/* Attachments inside a user turn read as quiet chips, not cards. */\nhtml body .Sixlwa_attachmentRow {\n  gap: 6px;\n}\n\nhtml body .Sixlwa_referenceSummary,\nhtml body .Sixlwa_contextRow {\n  font-size: 11.5px;\n  line-height: 1.5;\n  color: var(--dsw-alias-label-tertiary);\n}\n\n/* User actions: the timestamp stays as a quiet meta line, the actionable\n * buttons reveal on hover/focus. Kept in flow so revealing never shifts the\n * transcript; touch devices always show the buttons. */\nhtml body .Sixlwa_userRow > .xzv4MW_actions {\n  opacity: 1;\n  transform: none;\n}\n\nhtml body .Sixlwa_userRow > .xzv4MW_actions .xzv4MW_action {\n  opacity: 0;\n  transition: opacity var(--pui-duration-hover) var(--pui-ease-out);\n}\n\nhtml body .Sixlwa_userRow:is(:hover, :focus-within) > .xzv4MW_actions .xzv4MW_action {\n  opacity: 1;\n}\n\nhtml body .xzv4MW_timeStart {\n  padding-right: 4px;\n  font-family: var(--pui-font-mono);\n  font-size: 11.5px;\n  line-height: 1;\n  letter-spacing: 0.01em;\n  color: var(--dsw-alias-label-tertiary);\n  font-variant-numeric: tabular-nums;\n}\n\n/* =====================================================================\n * 3. Assistant markdown — document-scale type, quiet chrome\n * ===================================================================== */\n\nhtml body .hWmORq_root {\n  font-size: calc(var(--dsh-content-font-size, 14px) + 1px);\n  line-height: 1.72;\n  color: var(--dsw-alias-label-primary);\n}\n\nhtml body .hWmORq_body {\n  gap: 14px;\n}\n\nhtml body .hWmORq_actions {\n  margin-top: 10px;\n}\n\nhtml body .hWmORq_stopped {\n  align-self: flex-start;\n  padding: 1px 7px;\n  border: 1px solid var(--pui-border-default);\n  border-radius: var(--pui-radius-sm);\n  background: var(--dsw-alias-interactive-bg-hover);\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 11.5px;\n  line-height: 18px;\n}\n\nhtml body ._markdown_1ypvv_5 {\n  font-size: calc(var(--dsh-content-font-size, 14px) + 1px);\n  line-height: 1.72;\n  color: var(--dsw-alias-label-primary);\n}\n\n/* Headings: tight, low-contrast letterspacing, no oversized hero type. */\nhtml body ._markdown_1ypvv_5 h1 {\n  margin: 30px 0 12px;\n  font-size: calc(var(--dsh-content-font-size, 14px) + 10px);\n  font-weight: 600;\n  line-height: 1.3;\n  letter-spacing: -0.018em;\n}\n\nhtml body ._markdown_1ypvv_5 h2 {\n  margin: 28px 0 10px;\n  font-size: calc(var(--dsh-content-font-size, 14px) + 5.5px);\n  font-weight: 600;\n  line-height: 1.36;\n  letter-spacing: -0.012em;\n}\n\nhtml body ._markdown_1ypvv_5 h3 {\n  margin: 22px 0 8px;\n  font-size: calc(var(--dsh-content-font-size, 14px) + 2.5px);\n  font-weight: 600;\n  line-height: 1.42;\n  letter-spacing: -0.006em;\n}\n\nhtml body ._markdown_1ypvv_5 h4 {\n  margin: 18px 0 6px;\n  font-size: calc(var(--dsh-content-font-size, 14px) + 1px);\n  font-weight: 600;\n  line-height: 1.5;\n}\n\nhtml body ._markdown_1ypvv_5 :where(h5, h6) {\n  margin: 16px 0 6px;\n  font-size: calc(var(--dsh-content-font-size, 14px) - 0.5px);\n  font-weight: 600;\n  line-height: 1.5;\n  color: var(--dsw-alias-label-secondary);\n}\n\nhtml body ._markdown_1ypvv_5 :where(h1, h2, h3, h4) strong {\n  color: inherit;\n}\n\n/* Body copy and lists. */\nhtml body ._markdown_1ypvv_5 p {\n  margin: 0 0 13px;\n}\n\nhtml body ._markdown_1ypvv_5 :where(ul, ol) {\n  margin: 13px 0 15px;\n  padding-left: 22px;\n}\n\nhtml body ._markdown_1ypvv_5 li {\n  margin-top: 5px;\n  padding-left: 2px;\n}\n\nhtml body ._markdown_1ypvv_5 li:first-child {\n  margin-top: 0;\n}\n\nhtml body ._markdown_1ypvv_5 li > :where(ul, ol) {\n  margin: 6px 0 2px;\n}\n\nhtml body ._markdown_1ypvv_5 li::marker {\n  color: var(--dsw-alias-label-tertiary);\n  line-height: 1.6;\n}\n\nhtml body ._markdown_1ypvv_5 :where(ul, ol) ol {\n  list-style-position: outside;\n  padding-left: 22px;\n}\n\n/* Quote: accent rule + a whisper of surface, never a second card. */\nhtml body ._markdown_1ypvv_5 blockquote {\n  margin: 16px 0;\n  padding: 10px 16px 10px 16px;\n  border-left: 2px solid var(--dsw-alias-state-business-primary);\n  border-radius: 0 var(--pui-radius-sm) var(--pui-radius-sm) 0;\n  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 52%, transparent);\n  color: var(--dsw-alias-label-secondary);\n}\n\nhtml body ._markdown_1ypvv_5 blockquote > :first-child {\n  margin-top: 0;\n}\n\nhtml body ._markdown_1ypvv_5 blockquote > :last-child {\n  margin-bottom: 0;\n}\n\nhtml body ._markdown_1ypvv_5 hr {\n  height: 1px;\n  margin: 26px 0;\n  border: 0;\n  background: var(--dsw-alias-border-l2);\n}\n\n/* Links: accent at rest, dotted underline on hover/focus, no colour-only cue. */\nhtml body ._markdown_1ypvv_5 a,\nhtml body ._markdown_1ypvv_5 ._fileLink_1ypvv_59 {\n  color: var(--pui-c-link);\n  font-weight: 500;\n  text-decoration: none;\n  transition: color var(--pui-duration-hover) var(--pui-ease-out);\n}\n\nhtml body ._markdown_1ypvv_5 a:is(:hover, :focus-visible),\nhtml body ._markdown_1ypvv_5 ._fileLink_1ypvv_59:is(:hover, :focus-visible) {\n  color: var(--pui-c-link);\n  text-decoration: underline dotted currentColor;\n  text-decoration-thickness: 1px;\n  text-underline-offset: 3px;\n}\n\nhtml body ._markdown_1ypvv_5 a:focus-visible,\nhtml body ._fileMention_1ypvv_85:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color, var(--pui-accent-sky));\n  outline-offset: 2px;\n  box-shadow: none;\n}\n\n/* Inline code: a 12.5px mono chip on the stock surface token. */\nhtml body ._markdown_1ypvv_5 :not(pre) > code {\n  display: inline-flex;\n  align-items: center;\n  box-sizing: border-box;\n  padding: 1px 5px;\n  border: 1px solid var(--dsw-alias-border-l1);\n  border-radius: var(--pui-radius-sm);\n  background: var(--dsw-alias-markdown-inline-code);\n  color: var(--dsw-alias-label-primary);\n  font-family: var(--pui-font-mono);\n  /* Stock sets `.875em !important`; a single matching !important is the only\n   * way to land the specified 12.5px chip size without changing the em base. */\n  font-size: 12.5px !important;\n  line-height: 1.5;\n  font-variant-numeric: tabular-nums;\n  vertical-align: baseline;\n}\n\nhtml body ._markdown_1ypvv_5 :where(h1, h2, h3, h4, h5, h6) code {\n  background: transparent;\n  border-color: transparent;\n  padding: 0;\n  font-size: 0.9em;\n}\n\n/* Images reserve their box from width/height attributes and never jump. */\nhtml body ._image_1ypvv_287 {\n  display: block;\n  width: auto;\n  max-width: 100%;\n  max-height: 420px;\n  height: auto;\n  margin: 2px 0;\n  border: 1px solid var(--pui-border-default);\n  border-radius: var(--pui-radius-lg);\n  background: var(--dsw-alias-bg-skeleton);\n  object-fit: contain;\n}\n\nhtml body ._imageButton_1ypvv_446 {\n  display: block;\n  max-width: min(100%, 640px);\n  margin: 12px 0;\n  padding: 0;\n  border-radius: var(--pui-radius-lg);\n  background: transparent;\n  cursor: zoom-in;\n}\n\nhtml body ._imageButton_1ypvv_446:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color, var(--pui-accent-sky));\n  outline-offset: 2px;\n}\n\nhtml body ._markdown_1ypvv_5 input[type='checkbox'] {\n  margin: 0 8px 0 0;\n  accent-color: var(--dsw-alias-label-secondary);\n}\n\n/* Inline semantics that occasionally appear in transcripts. */\nhtml body ._markdown_1ypvv_5 mark {\n  padding: 0 2px;\n  border-radius: var(--pui-radius-xs);\n  background: color-mix(in srgb, var(--pui-accent-amber) 22%, transparent);\n  color: var(--dsw-alias-label-primary);\n}\n\nhtml body ._markdown_1ypvv_5 kbd {\n  padding: 1px 5px;\n  border: 1px solid var(--pui-border-default);\n  border-bottom-color: var(--pui-border-hover);\n  border-radius: var(--pui-radius-xs);\n  background: var(--dsw-alias-bg-layer-2);\n  font-family: var(--pui-font-mono);\n  font-size: 11.5px;\n  line-height: 1.4;\n  color: var(--dsw-alias-label-secondary);\n}\n\n/* Compact markdown is used inside reasoning / tool disclosure bodies. */\nhtml body ._markdown_1ypvv_5._compact_1ypvv_331 {\n  font-size: calc(var(--dsh-content-font-size, 14px) - 0.5px);\n  line-height: 1.7;\n  color: var(--dsw-alias-label-secondary);\n}\n\nhtml body ._markdown_1ypvv_5._compact_1ypvv_331 :where(h1, h2, h3, h4) {\n  margin: 18px 0 8px;\n  font-size: calc(var(--dsh-content-font-size, 14px) + 1px);\n  color: var(--dsw-alias-label-primary);\n}\n\nhtml body ._markdown_1ypvv_5._compact_1ypvv_331 :where(p, ul, ol) {\n  margin-bottom: 9px;\n}\n\n/* =====================================================================\n * 4. Code blocks — language + copy chrome, internal scroll, wrap policy\n * ===================================================================== */\n\nhtml body .md-code-block {\n  position: relative;\n  margin: 16px 0;\n  border: 1px solid var(--pui-border-default);\n  border-radius: var(--pui-radius-lg);\n  background: var(--dsw-alias-markdown-code-block);\n}\n\nhtml body ._bannerWrap_7gxqk_24 {\n  background: var(--dsw-alias-markdown-code-block-banner);\n  border-bottom: 1px solid var(--pui-border-divider);\n  border-radius: var(--pui-radius-lg) var(--pui-radius-lg) 0 0;\n}\n\nhtml body ._header_1pq26_10 {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  min-height: 34px;\n  padding: 0 8px 0 12px;\n  background: transparent;\n  border-radius: inherit;\n  color: var(--dsw-alias-label-tertiary);\n  font-family: var(--pui-font-ui);\n  font-size: 11px;\n  line-height: 1;\n}\n\nhtml body ._heading_1pq26_23 {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  min-width: 0;\n}\n\nhtml body ._language_1pq26_30 {\n  flex: none;\n  color: var(--dsw-alias-label-tertiary);\n  font-family: var(--pui-font-mono);\n  font-size: 10.5px;\n  font-weight: 500;\n  line-height: 1;\n  letter-spacing: 0.07em;\n  text-transform: uppercase;\n}\n\nhtml body ._actions_1pq26_43 {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n  flex: none;\n}\n\nhtml body ._action_1pq26_43 {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 26px;\n  height: 26px;\n  padding: 0;\n  border: 0;\n  border-radius: var(--pui-radius-sm);\n  background: transparent;\n  color: var(--dsw-alias-label-tertiary);\n  cursor: pointer;\n  transition:\n    color var(--pui-duration-hover) var(--pui-ease-out),\n    background-color var(--pui-duration-hover) var(--pui-ease-out);\n}\n\nhtml body ._action_1pq26_43:hover {\n  background: var(--dsw-alias-interactive-bg-hover);\n  color: var(--dsw-alias-label-primary);\n}\n\nhtml body ._action_1pq26_43:active {\n  background: var(--dsw-alias-interactive-bg-active);\n}\n\n/* Wrap is on by default; a toggle pressed state should not out-shout the\n * language label, so it stays a quiet surface chip rather than an accent. */\nhtml body ._action_1pq26_43[aria-pressed='true'] {\n  color: var(--dsw-alias-label-secondary);\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n\nhtml body ._action_1pq26_43:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color, var(--pui-accent-sky));\n  outline-offset: 1px;\n}\n\n/* The pre is the only scroller: the page never widens. */\nhtml body .md-code-block pre {\n  max-width: 100%;\n  margin: 0;\n  padding: 12px 16px 16px;\n  overflow-x: auto;\n  overflow-y: hidden;\n  border-radius: 0 0 calc(var(--pui-radius-lg) - 1px) calc(var(--pui-radius-lg) - 1px);\n  background: transparent;\n  color: var(--dsw-alias-label-primary);\n  font-family: var(--pui-font-mono);\n  font-size: calc(var(--dsh-content-font-size, 14px) - 1.5px);\n  line-height: 20px;\n  font-variant-numeric: tabular-nums;\n  tab-size: 2;\n  overscroll-behavior-x: contain;\n  scrollbar-width: thin;\n}\n\nhtml body .md-code-block pre code {\n  font: inherit;\n  background: none;\n  padding: 0;\n  white-space: inherit;\n  overflow-wrap: inherit;\n  word-break: inherit;\n}\n\n/* Prose wrap (default): long code lines wrap, height grows smoothly. */\nhtml body .md-code-block[data-code-wrap='true'] pre {\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n  word-break: normal;\n}\n\n/* Wrap off: horizontal scroll inside the block, stable one-line height. */\nhtml body .md-code-block[data-code-wrap='false'] pre {\n  white-space: pre;\n  overflow-wrap: normal;\n  word-break: normal;\n}\n\n/* Bare markdown fences (no code-block card) follow the same chrome. */\nhtml body ._markdown_1ypvv_5 pre {\n  margin: 16px 0;\n  padding: 12px 16px;\n  max-width: 100%;\n  overflow: auto;\n  border: 1px solid var(--pui-border-default);\n  border-radius: var(--pui-radius-lg);\n  background: var(--dsw-alias-markdown-code-block);\n  font-family: var(--pui-font-mono);\n  font-size: calc(var(--dsh-content-font-size, 14px) - 1.5px);\n  line-height: 20px;\n  overscroll-behavior-x: contain;\n}\n\n/* =====================================================================\n * 5. Tables — internal horizontal scroll, sticky head, hairlines, numerals\n * ===================================================================== */\n\nhtml body ._markdown_1ypvv_5 ._tableScroll_1ypvv_192 {\n  max-width: 100%;\n  margin: 16px 0;\n  overflow-x: auto;\n  overflow-y: hidden;\n  overscroll-behavior-x: contain;\n  border: 1px solid var(--pui-border-default);\n  border-radius: var(--pui-radius-lg);\n  background: transparent;\n  scrollbar-width: thin;\n}\n\n/* The stock \"wide table\" bleeds into the column spare space; disable it so a\n * table can never widen the document at any viewport. */\nhtml body .hWmORq_body .md-table-wide,\nhtml body ._tableScroll_1ypvv_192.md-table-wide {\n  box-sizing: border-box;\n  width: 100%;\n  max-width: 100%;\n  margin-left: 0;\n  margin-right: 0;\n  padding-left: 0;\n  padding-right: 0;\n  padding-bottom: 0;\n  overflow-x: auto;\n}\n\nhtml body ._tableScroll_1ypvv_192:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color, var(--pui-accent-sky));\n  outline-offset: 2px;\n  box-shadow: none;\n}\n\nhtml body ._tableScroll_1ypvv_192 table {\n  width: 100%;\n  min-width: 100%;\n  border-collapse: separate;\n  border-spacing: 0;\n  text-align: start;\n  font-size: calc(var(--dsh-content-font-size, 14px) - 0.5px);\n  line-height: 1.55;\n  font-variant-numeric: tabular-nums;\n}\n\nhtml body ._tableScroll_1ypvv_192 thead th {\n  position: sticky;\n  top: 0;\n  z-index: 2;\n  padding: 9px 14px;\n  border: 0;\n  border-bottom: 1px solid var(--pui-border-hover);\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-secondary);\n  font-size: 11.5px;\n  font-weight: 600;\n  line-height: 1.5;\n  letter-spacing: 0.02em;\n  text-align: start;\n  white-space: nowrap;\n}\n\nhtml body ._tableScroll_1ypvv_192 tbody td {\n  padding: 10px 14px;\n  border: 0;\n  border-bottom: 1px solid var(--pui-border-divider);\n  color: var(--dsw-alias-label-primary);\n  font-size: calc(var(--dsh-content-font-size, 14px) - 0.5px);\n  line-height: 1.55;\n  text-align: start;\n  vertical-align: top;\n  overflow-wrap: anywhere;\n}\n\nhtml body ._tableScroll_1ypvv_192 tbody tr:last-child td {\n  border-bottom: 0;\n}\n\n/* Subtle zebra + hover; both stay inside the container. */\nhtml body ._tableScroll_1ypvv_192 tbody tr:nth-child(even) {\n  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 34%, transparent);\n}\n\nhtml body ._tableScroll_1ypvv_192 tbody tr:hover {\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n\nhtml body ._tableScroll_1ypvv_192 th:first-child,\nhtml body ._tableScroll_1ypvv_192 td:first-child {\n  padding-left: 14px;\n}\n\nhtml body ._tableScroll_1ypvv_192 td:last-child {\n  padding-right: 14px;\n}\n\nhtml body ._tableScroll_1ypvv_192 table code {\n  font-family: var(--pui-font-mono);\n  font-size: 11.5px;\n  line-height: 1.5;\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n}\n\n/* =====================================================================\n * 6. Reasoning / tool-call rows — six-state language, terminal, results\n * ===================================================================== */\n\n/* Shared disclosure base: one 28px quiet row, mono-ish metrics, no jump. */\nhtml body ._row_k7ery_26 {\n  height: 28px;\n  min-width: 0;\n  border-radius: var(--pui-radius-sm);\n  color: var(--dsw-alias-label-tertiary);\n  transition: color var(--pui-duration-hover) var(--pui-ease-out);\n}\n\nhtml body ._row_k7ery_26[data-expandable] {\n  cursor: pointer;\n}\n\nhtml body ._row_k7ery_26[data-expandable]:hover {\n  color: var(--dsw-alias-label-secondary);\n}\n\nhtml body ._row_k7ery_26:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color, var(--pui-accent-sky));\n  outline-offset: 1px;\n}\n\n/* The disclosure chevron replaces the state glyph on hover in stock CSS; let\n * keyboard focus reveal it too so the expand affordance is not hover-only. */\nhtml body ._row_k7ery_26:focus-visible ._iconIdle_k7ery_78 {\n  opacity: 0;\n}\n\nhtml body ._row_k7ery_26:focus-visible ._chevronHover_k7ery_84 {\n  opacity: 1;\n}\n\nhtml body .O_Ebla_title:focus-visible .O_Ebla_activityIcon {\n  opacity: 0;\n}\n\nhtml body .O_Ebla_title:focus-visible .O_Ebla_chevron {\n  opacity: 1;\n}\n\nhtml body ._leading_k7ery_50 {\n  margin-right: 7px;\n  color: var(--dsw-alias-label-tertiary);\n}\n\nhtml body ._row_k7ery_26:is(:hover, [aria-expanded='true']) ._leading_k7ery_50 {\n  color: var(--dsw-alias-label-secondary);\n}\n\nhtml body ._title_k7ery_100 {\n  color: var(--dsw-alias-label-secondary);\n  font-size: calc(var(--dsh-content-font-size, 14px) - 1px);\n  font-weight: 500;\n  line-height: 1.5;\n}\n\nhtml body ._row_k7ery_26:is(:hover, [aria-expanded='true']) ._title_k7ery_100 {\n  color: var(--dsw-alias-label-primary);\n}\n\n/* Tool-title classes at the same visual weight (bash / web / reasoning). */\nhtml body .CY-8Ka_title,\nhtml body .o3BgMG_title,\nhtml body .lcKema_title {\n  font-weight: 500;\n}\n\n/* Summary stays secondary and truncates with a soft edge while streaming. */\nhtml body .o3BgMG_summary,\nhtml body .o3BgMG_summarySuffix,\nhtml body .CY-8Ka_summary,\nhtml body .lcKema_summary,\nhtml body .lcKema_summaryText {\n  color: var(--dsw-alias-label-tertiary);\n  font-size: calc(var(--dsh-content-font-size, 14px) - 1.5px);\n  line-height: 1.5;\n}\n\nhtml body .o3BgMG_summary,\nhtml body .CY-8Ka_summary,\nhtml body .lcKema_summary {\n  min-width: 0;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  overflow: hidden;\n}\n\nhtml body .o3BgMG_sep,\nhtml body .CY-8Ka_sep,\nhtml body .lcKema_separator {\n  width: 3px;\n  height: 3px;\n  margin: 0 8px;\n  background: var(--dsw-alias-label-caption);\n}\n\n/* ---- six-state visual language ------------------------------------- *\n * idle/preparing  neutral       running   sky + subtle pulse\n * waiting         amber         completed emerald dot, neutral label\n * failed          restrained rose (+ retry affordance if DSH renders one)\n * cancelled       neutral stop\n * ------------------------------------------------------------------- */\n\n/* Running: colour the row, pulse the leading icon, keep geometry fixed. */\nhtml body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='running'] ._row_k7ery_26,\nhtml body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='running'] ._title_k7ery_100 {\n  color: var(--dsw-alias-state-business-primary);\n}\n\nhtml body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='running'] ._leading_k7ery_50,\nhtml body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='running'] .o3BgMG_summary,\nhtml body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='running'] .CY-8Ka_summary,\nhtml body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='running'] .lcKema_summary {\n  color: var(--dsw-alias-label-deep-diving);\n}\n\nhtml body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='running'] ._leading_k7ery_50::after {\n  content: '';\n  position: absolute;\n  inset: 1px;\n  border-radius: var(--pui-radius-pill);\n  background: var(--dsw-alias-state-business-tertiary);\n  animation: pui-conv-pulse 1.8s var(--pui-ease-standard) infinite;\n  pointer-events: none;\n}\n\n/* Waiting on the user: amber, still, no motion (not a fake progress bar). */\nhtml body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='waiting'] ._title_k7ery_100,\nhtml body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='waiting'] ._leading_k7ery_50 {\n  color: var(--dsw-alias-state-warn-label);\n}\n\nhtml body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='waiting'] ._row_k7ery_26 {\n  color: var(--dsw-alias-state-warn-label);\n  background: color-mix(in srgb, var(--dsw-alias-state-warn-tertiary) 55%, transparent);\n}\n\n/* Preparing / idle: neutral, slightly dimmed. */\nhtml body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='preparing'] ._title_k7ery_100,\nhtml body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='idle'] ._title_k7ery_100 {\n  color: var(--dsw-alias-label-tertiary);\n}\n\n/* Completed: neutral label, emerald only in the status dot. */\nhtml body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='ok'] ._leading_k7ery_50,\nhtml body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='done'] ._leading_k7ery_50,\nhtml body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='completed'] ._leading_k7ery_50 {\n  color: var(--dsw-alias-state-success-primary);\n}\n\n/* Failed: restrained rose on title/summary, soft tint, no glow. */\nhtml body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='error'] ._title_k7ery_100,\nhtml body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='failed'] ._title_k7ery_100,\nhtml body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='error'] ._leading_k7ery_50,\nhtml body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='failed'] ._leading_k7ery_50 {\n  color: var(--pui-c-error-text);\n}\n\nhtml body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='error'] ._row_k7ery_26,\nhtml body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='failed'] ._row_k7ery_26 {\n  color: var(--pui-c-error-text);\n  background: color-mix(in srgb, var(--dsw-alias-state-error-tertiary) 45%, transparent);\n}\n\nhtml body .o3BgMG_errorSummary,\nhtml body .o3BgMG_errorSummary ._text_1rdzk_17,\nhtml body .o3BgMG_ioText[data-error] {\n  color: var(--pui-c-error-text);\n}\n\n/* Cancelled / stopped: neutral, quiet, no alarm colour. */\nhtml body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='stopped'] ._row_k7ery_26,\nhtml body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='cancelled'] ._row_k7ery_26 {\n  color: var(--dsw-alias-label-tertiary);\n  opacity: 0.9;\n}\n\n/* Expanded tool body: aligned under the row, quiet scrollers. */\nhtml body .o3BgMG_bodyWrap {\n  padding: 2px 0 6px 23px;\n}\n\nhtml body .o3BgMG_bodyScroll,\nhtml body .o3BgMG_detailsBodyWrap {\n  scrollbar-width: thin;\n}\n\n/* io cards (tool input / output blocks). */\nhtml body .o3BgMG_ioCard {\n  margin: 2px 0;\n  border: 1px solid var(--pui-border-divider);\n  border-radius: var(--pui-radius-md);\n  background: var(--dsw-alias-markdown-code-block);\n  font-family: var(--pui-font-mono);\n  font-size: calc(var(--dsh-content-font-size, 14px) - 1.5px);\n  line-height: 1.55;\n}\n\nhtml body .o3BgMG_ioSection {\n  column-gap: 14px;\n  padding: 10px 14px;\n  max-height: 220px;\n}\n\nhtml body .o3BgMG_ioLabel {\n  color: var(--dsw-alias-label-tertiary);\n  font-family: var(--pui-font-mono);\n  font-size: 10.5px;\n  line-height: 1.6;\n  letter-spacing: 0.06em;\n  text-transform: uppercase;\n}\n\nhtml body .o3BgMG_ioText {\n  color: var(--dsw-alias-label-secondary);\n  font-family: var(--pui-font-mono);\n  font-size: calc(var(--dsh-content-font-size, 14px) - 1.5px);\n  line-height: 1.6;\n}\n\n/* Expanded reasoning: a quote rail, compact secondary prose. */\nhtml body .lcKema_thinkBody {\n  margin: 2px 0 4px 7px;\n  padding: 4px 0 2px 15px;\n  border-left: 1px solid var(--pui-border-default);\n}\n\n/* Bash / terminal card. */\nhtml body .CY-8Ka_bodyWrap {\n  padding: 2px 0 4px 23px;\n}\n\nhtml body .CY-8Ka_terminal,\nhtml body ._block_8z71b_1 {\n  margin: 2px 0;\n  border: 1px solid var(--pui-border-divider);\n  border-radius: var(--pui-radius-md);\n  background: var(--dsw-alias-markdown-code-block);\n  font-family: var(--pui-font-mono);\n  font-size: calc(var(--dsh-content-font-size, 14px) - 1.5px);\n  line-height: 20px;\n}\n\nhtml body ._header_8z71b_32 {\n  gap: 10px;\n  padding: 8px 12px 8px 30px;\n  max-height: 168px;\n  border-bottom: 1px solid var(--pui-border-divider);\n}\n\nhtml body ._prompt_8z71b_70 {\n  font-family: var(--pui-font-mono);\n  font-size: calc(var(--dsh-content-font-size, 14px) - 1.5px);\n  line-height: 20px;\n}\n\nhtml body ._promptLine_8z71b_78 {\n  gap: 8px;\n  line-height: 20px;\n}\n\nhtml body ._cwd_8z71b_108 {\n  color: var(--dsw-alias-label-tertiary);\n  font-weight: 600;\n}\n\nhtml body ._command_8z71b_115 {\n  color: var(--dsw-alias-label-primary);\n}\n\nhtml body ._copyButton_8z71b_132 {\n  padding: 2px 8px;\n  border: 1px solid var(--pui-border-default);\n  border-radius: var(--pui-radius-sm);\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-tertiary);\n  font-family: var(--pui-font-ui);\n  font-size: 11px;\n  line-height: 18px;\n  transition:\n    color var(--pui-duration-hover) var(--pui-ease-out),\n    background-color var(--pui-duration-hover) var(--pui-ease-out);\n}\n\nhtml body ._copyButton_8z71b_132:hover {\n  background: var(--dsw-alias-interactive-bg-hover);\n  color: var(--dsw-alias-label-primary);\n}\n\nhtml body ._copyButton_8z71b_132:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color, var(--pui-accent-sky));\n  outline-offset: 1px;\n}\n\nhtml body ._output_8z71b_152 {\n  max-height: 280px;\n  padding: 10px 14px 10px 0;\n  font-family: var(--pui-font-mono);\n  font-size: calc(var(--dsh-content-font-size, 14px) - 1.5px);\n  line-height: 20px;\n  color: var(--dsw-alias-label-secondary);\n  overflow: auto;\n  overscroll-behavior: contain;\n}\n\nhtml body ._line_8z71b_179 {\n  min-height: 20px;\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n}\n\nhtml body ._dot_1i3xo_2[data-state='done'] {\n  color: var(--dsw-alias-state-success-primary);\n}\n\nhtml body ._dot_1i3xo_2[data-state='error'] {\n  color: var(--dsw-alias-state-error-primary);\n}\n\nhtml body ._dot_1i3xo_2[data-state='warning'] {\n  color: var(--dsw-alias-state-warn-primary);\n}\n\nhtml body ._dot_1i3xo_2[data-state='idle'] {\n  color: var(--pui-text-muted);\n}\n\n/* Tool inspect affordance (\"查看\"): a quiet chip that only notices on hover. */\nhtml body .o3BgMG_inspectButton,\nhtml body .CY-8Ka_inspectButton {\n  margin: 4px 0 0;\n  padding: 2px 8px;\n  border: 1px solid var(--pui-border-default);\n  border-radius: var(--pui-radius-pill);\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 11px;\n  line-height: 16px;\n  cursor: pointer;\n  opacity: 0;\n  align-self: flex-start;\n  transition:\n    opacity var(--pui-duration-hover) var(--pui-ease-out),\n    color var(--pui-duration-hover) var(--pui-ease-out),\n    background-color var(--pui-duration-hover) var(--pui-ease-out);\n}\n\nhtml body ._row_k7ery_26:is(:hover, :focus-within) ~ .o3BgMG_inspectButton,\nhtml body .CY-8Ka_root:is(:hover, :focus-within) ~ .CY-8Ka_inspectButton,\nhtml body .o3BgMG_inspectButton:focus-visible,\nhtml body .CY-8Ka_inspectButton:focus-visible {\n  opacity: 1;\n}\n\nhtml body .o3BgMG_inspectButton:hover,\nhtml body .CY-8Ka_inspectButton:hover {\n  background: var(--dsw-alias-interactive-bg-hover-solid);\n  color: var(--dsw-alias-label-primary);\n}\n\n/* Web search sources + fetched web bodies. */\nhtml body ._block_ca4yc_1 {\n  margin: 4px 0 2px;\n  padding: 10px 14px;\n  border: 1px solid var(--pui-border-divider);\n  border-radius: var(--pui-radius-md);\n  background: var(--dsw-alias-markdown-code-block);\n}\n\nhtml body ._sources_ca4yc_40 {\n  gap: 8px;\n  max-height: 320px;\n  padding-left: 1.35em;\n}\n\nhtml body ._sourceLink_ca4yc_54 {\n  color: var(--pui-c-link);\n  font-size: calc(var(--dsh-content-font-size, 14px) - 0.5px);\n  font-weight: 500;\n  line-height: 1.5;\n  word-break: break-word;\n  text-decoration: none;\n}\n\nhtml body ._sourceLink_ca4yc_54:is(:hover, :focus-visible) {\n  text-decoration: underline dotted currentColor;\n  text-underline-offset: 3px;\n}\n\n/* The nested process group (activity summary + its members). */\nhtml body .O_Ebla_title {\n  min-height: 28px;\n  padding: 0;\n  gap: 7px;\n  color: var(--dsw-alias-label-tertiary);\n  font-size: calc(var(--dsh-content-font-size, 14px) - 1px);\n  line-height: 1.5;\n  transition: color var(--pui-duration-hover) var(--pui-ease-out);\n}\n\nhtml body .O_Ebla_title:is(:hover, :focus-visible, [aria-expanded='true']) {\n  color: var(--dsw-alias-label-secondary);\n}\n\nhtml body .O_Ebla_title:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color, var(--pui-accent-sky));\n  outline-offset: 2px;\n  border-radius: var(--pui-radius-sm);\n}\n\nhtml body .O_Ebla_title[aria-expanded='true'] {\n  padding-bottom: 4px;\n}\n\nhtml body .O_Ebla_body {\n  margin-top: 2px;\n  padding-bottom: 2px;\n  scrollbar-width: thin;\n}\n\nhtml body .O_Ebla_content {\n  gap: 2px;\n}\n\n/* Compact disclosure rows used as the process-group children get a slightly\n   tighter leading-icon gutter than free-standing rows. */\nhtml body .O_Ebla_content ._row_k7ery_26,\nhtml body .O_Ebla_content .CY-8Ka_root {\n  max-width: 100%;\n}\n\n/* =====================================================================\n * 7. Turn status · action row · usage + time\n * ===================================================================== */\n\n/* \"已完成，用时 2秒 ⌄\": a quiet meta rail between process and answer. */\nhtml body .l_V-RG_root {\n  box-sizing: border-box;\n  height: 34px;\n  padding: 0 2px 10px;\n  border-bottom: 1px solid var(--pui-border-divider);\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12.5px;\n  line-height: 1.5;\n  cursor: pointer;\n  transition: color var(--pui-duration-hover) var(--pui-ease-out);\n}\n\nhtml body .l_V-RG_root:is(:hover, :focus-visible, [aria-expanded='true']) {\n  color: var(--dsw-alias-label-primary);\n}\n\nhtml body .l_V-RG_root:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color, var(--pui-accent-sky));\n  outline-offset: 2px;\n}\n\nhtml body .l_V-RG_label {\n  font-size: 12.5px;\n  line-height: 1.5;\n  letter-spacing: 0.01em;\n}\n\nhtml body .l_V-RG_durationNumber {\n  font-family: var(--pui-font-mono);\n  font-size: 12.5px;\n  color: var(--dsw-alias-label-primary);\n  font-variant-numeric: tabular-nums;\n}\n\nhtml body .l_V-RG_chevron {\n  width: 13px;\n  height: 13px;\n  margin-left: 5px;\n  color: var(--dsw-alias-label-caption);\n  transition: transform var(--pui-duration-hover) var(--pui-ease-out);\n}\n\nhtml body .l_V-RG_root[data-open] .l_V-RG_chevron {\n  transform: rotate(180deg);\n}\n\n/* Assistant action row: always present, quiet at rest, crisp on interaction. */\nhtml body .TS9iAW_root {\n  gap: 8px;\n}\n\nhtml body .TS9iAW_actions {\n  margin-top: 4px;\n  margin-left: -6px;\n  gap: 2px;\n  height: 30px;\n}\n\nhtml body .xzv4MW_actions {\n  align-items: center;\n  gap: 2px;\n  height: 30px;\n}\n\nhtml body .xzv4MW_action {\n  width: 30px;\n  height: 30px;\n  padding: 7px;\n  border: 0;\n  border-radius: var(--pui-radius-sm);\n  background: transparent;\n  color: var(--dsw-alias-label-tertiary);\n  cursor: pointer;\n  transition:\n    color var(--pui-duration-hover) var(--pui-ease-out),\n    background-color var(--pui-duration-hover) var(--pui-ease-out),\n    transform var(--pui-duration-press) var(--pui-ease-out);\n}\n\nhtml body .xzv4MW_action svg {\n  width: 15px;\n  height: 15px;\n}\n\nhtml body .xzv4MW_action:hover {\n  background: var(--dsw-alias-interactive-bg-hover);\n  color: var(--dsw-alias-label-primary);\n}\n\nhtml body .xzv4MW_action:active {\n  transform: scale(0.94);\n  background: var(--dsw-alias-interactive-bg-active);\n}\n\nhtml body .xzv4MW_action:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color, var(--pui-accent-sky));\n  outline-offset: 1px;\n}\n\nhtml body .xzv4MW_action[data-unavailable] {\n  opacity: 0.35;\n  cursor: default;\n}\n\n/* Like / dislike (message feedback) share the action geometry. */\nhtml body ._8_XoUG_action {\n  width: 30px;\n  height: 30px;\n  padding: 7px;\n  border: 0;\n  border-radius: var(--pui-radius-sm);\n  background: transparent;\n  color: var(--dsw-alias-label-tertiary);\n  cursor: pointer;\n  transition:\n    color var(--pui-duration-hover) var(--pui-ease-out),\n    background-color var(--pui-duration-hover) var(--pui-ease-out);\n}\n\nhtml body ._8_XoUG_action svg {\n  width: 15px;\n  height: 15px;\n}\n\nhtml body ._8_XoUG_action:hover {\n  background: var(--dsw-alias-interactive-bg-hover);\n  color: var(--dsw-alias-label-primary);\n}\n\nhtml body ._8_XoUG_action[aria-pressed='true'] {\n  color: var(--dsw-alias-state-business-primary);\n  background: var(--dsw-alias-state-business-tertiary);\n}\n\nhtml body ._8_XoUG_action:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color, var(--pui-accent-sky));\n  outline-offset: 1px;\n}\n\nhtml body ._8_XoUG_action:disabled {\n  opacity: 0.35;\n  cursor: default;\n}\n\n/* Usage + timestamp: mono, tabular, separated by a hairline from the actions. */\nhtml body .xzv4MW_endInfo {\n  gap: 10px;\n  margin-left: 6px;\n  padding-left: 12px;\n  border-left: 1px solid var(--pui-border-divider);\n  color: var(--dsw-alias-label-tertiary);\n}\n\nhtml body .Q51KRG_root {\n  display: inline-flex;\n}\n\nhtml body .Q51KRG_trigger {\n  height: 26px;\n  padding: 2px 8px;\n  border: 1px solid transparent;\n  border-radius: var(--pui-radius-sm);\n  background: transparent;\n  color: var(--dsw-alias-label-tertiary);\n  font-family: var(--pui-font-mono);\n  font-size: 11.5px;\n  line-height: 20px;\n  font-variant-numeric: tabular-nums;\n  cursor: pointer;\n  transition:\n    color var(--pui-duration-hover) var(--pui-ease-out),\n    background-color var(--pui-duration-hover) var(--pui-ease-out),\n    border-color var(--pui-duration-hover) var(--pui-ease-out);\n}\n\nhtml body .Q51KRG_trigger svg {\n  width: 14px;\n  height: 14px;\n}\n\nhtml body .Q51KRG_trigger:hover,\nhtml body .Q51KRG_trigger[aria-expanded='true'] {\n  background: var(--dsw-alias-interactive-bg-hover);\n  border-color: var(--pui-border-divider);\n  color: var(--dsw-alias-label-secondary);\n}\n\nhtml body .Q51KRG_trigger:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color, var(--pui-accent-sky));\n  outline-offset: 1px;\n}\n\nhtml body .xzv4MW_timeEnd {\n  font-family: var(--pui-font-mono);\n  font-size: 11.5px;\n  line-height: 1;\n  color: var(--dsw-alias-label-tertiary);\n  font-variant-numeric: tabular-nums;\n}\n\n/* =====================================================================\n * 8. Streaming, scroll-to-bottom, error surfaces\n * ===================================================================== */\n\nhtml body .EvIC1a_running {\n  margin: 2px 0 6px;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12.5px;\n  line-height: 20px;\n}\n\nhtml body .EvIC1a_runningContent {\n  gap: 7px;\n}\n\nhtml body .EvIC1a_runningText {\n  font-variant-numeric: tabular-nums;\n  letter-spacing: 0.01em;\n}\n\nhtml body .EvIC1a_runningIcon {\n  color: var(--dsw-alias-state-business-primary);\n}\n\nhtml body .EvIC1a_runningDivider {\n  height: 1px;\n  margin: 6px 0 10px;\n  background: var(--pui-border-divider);\n}\n\n/* Scroll-to-bottom: a real button, visible focus, 44px on touch. */\nhtml body .EvIC1a_toBottomSlot {\n  bottom: 24px;\n  /* Keep the affordance out of the reading column when the viewport leaves a\n   * gutter (≥~1100px); on narrow screens it floats above the composer seat. */\n  padding-right: max(\n    calc(var(--dsh-composer-side-clearance, 16px) + 16px),\n    calc((100% - var(--dsh-chat-content-width, 748px)) / 2 - 78px)\n  );\n}\n\nhtml body .EvIC1a_toBottom {\n  width: 34px;\n  height: 34px;\n  border: 1px solid var(--pui-border-divider);\n  border-radius: var(--pui-radius-pill);\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-secondary);\n  box-shadow: var(--dsw-elevation-panel);\n  cursor: pointer;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  transition:\n    background-color var(--pui-duration-hover) var(--pui-ease-out),\n    color var(--pui-duration-hover) var(--pui-ease-out),\n    border-color var(--pui-duration-hover) var(--pui-ease-out),\n    transform var(--pui-duration-hover) var(--pui-ease-out);\n}\n\nhtml body .EvIC1a_toBottom:hover {\n  background: var(--dsw-alias-button-floating-hover);\n  border-color: var(--pui-border-hover);\n  color: var(--dsw-alias-label-primary);\n  transform: translateY(-1px);\n}\n\nhtml body .EvIC1a_toBottom:active {\n  transform: translateY(0);\n}\n\nhtml body .EvIC1a_toBottom:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color, var(--pui-accent-sky));\n  outline-offset: 2px;\n}\n\n/* Turn-level error surfaces. */\nhtml body .EvIC1a_openError {\n  color: var(--pui-c-error-text);\n  font-size: 12.5px;\n  line-height: 1.6;\n}\n\n/* Model-request retry status (details/summary rendered by the chat node). */\nhtml body .Sixlwa_retryRow {\n  margin-top: 4px;\n  color: var(--pui-c-error-text);\n  font-size: 12.5px;\n  line-height: 1.6;\n}\n\nhtml body .Sixlwa_retrySummary {\n  color: inherit;\n  padding: 2px 0;\n  border-radius: var(--pui-radius-sm);\n}\n\nhtml body .Sixlwa_retrySummary:hover {\n  color: var(--pui-c-error-text);\n}\n\nhtml body .Sixlwa_retrySummary:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color, var(--pui-accent-sky));\n  outline-offset: 2px;\n}\n\nhtml body .Sixlwa_retryDetails {\n  color: var(--pui-c-error-text);\n  font-size: 12px;\n  line-height: 1.65;\n}\n\nhtml body .Sixlwa_retryDetailLabel {\n  color: var(--dsw-alias-label-tertiary);\n}\n\nhtml body .EvIC1a_hint {\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 12px;\n  line-height: 1.6;\n}\n\nhtml body .EvIC1a_older button {\n  height: 28px;\n  padding: 0 12px;\n  border: 1px solid var(--pui-border-default);\n  border-radius: var(--pui-radius-pill);\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12px;\n  cursor: pointer;\n  transition:\n    background-color var(--pui-duration-hover) var(--pui-ease-out),\n    color var(--pui-duration-hover) var(--pui-ease-out);\n}\n\nhtml body .EvIC1a_older button:hover:not(:disabled) {\n  background: var(--dsw-alias-interactive-bg-hover-solid);\n  color: var(--dsw-alias-label-primary);\n}\n\n/* =====================================================================\n * 9. Responsive · touch · forced colours · reduced motion\n * ===================================================================== */\n\n@keyframes pui-conv-pulse {\n  0% {\n    opacity: 0.55;\n    transform: scale(0.72);\n  }\n  70% {\n    opacity: 0;\n    transform: scale(1.35);\n  }\n  100% {\n    opacity: 0;\n    transform: scale(1.35);\n  }\n}\n\n/* Tablet: keep the reading column comfortable, shorten code chrome a touch. */\n@media (max-width: 959px) {\n  html body .EvIC1a_scroll {\n    padding-top: 16px;\n    padding-bottom: 24px;\n  }\n\n  html body .Sixlwa_userStack {\n    max-width: 88%;\n  }\n\n  html body .hWmORq_root,\n  html body ._markdown_1ypvv_5 {\n    font-size: calc(var(--dsh-content-font-size, 14px) + 0.5px);\n    line-height: 1.7;\n  }\n}\n\n/* Phone: tighter gutters, full-width bubbles acceptable, no fixed heights. */\n@media (max-width: 767px) {\n  html body .EvIC1a_scroll {\n    padding: 12px 14px 24px;\n  }\n\n  html body .EvIC1a_column > .EvIC1a_flowItem[data-chat-flow-kind='user'] {\n    padding-top: 18px;\n  }\n\n  html body .Sixlwa_userStack {\n    max-width: 92%;\n  }\n\n  html body .Sixlwa_bubble {\n    padding: 10px 14px;\n    border-radius: var(--pui-radius-lg) var(--pui-radius-lg) var(--pui-radius-xs)\n      var(--pui-radius-lg);\n  }\n\n  html body ._markdown_1ypvv_5 h1 {\n    margin: 24px 0 10px;\n  }\n\n  html body ._markdown_1ypvv_5 h2 {\n    margin: 24px 0 8px;\n  }\n\n  html body ._header_1pq26_10 {\n    min-height: 36px;\n    padding: 0 6px 0 10px;\n  }\n\n  html body .md-code-block pre {\n    padding: 10px 12px 14px;\n    font-size: calc(var(--dsh-content-font-size, 14px) - 2px);\n  }\n\n  html body ._tableScroll_1ypvv_192 thead th,\n  html body ._tableScroll_1ypvv_192 tbody td {\n    padding: 8px 10px;\n  }\n\n  html body .l_V-RG_root {\n    height: 36px;\n  }\n\n  html body .xzv4MW_endInfo {\n    gap: 8px;\n    padding-left: 8px;\n    margin-left: 2px;\n  }\n\n  html body .xzv4MW_timeEnd {\n    font-size: 11px;\n  }\n}\n\n/* Touch: never hide actions behind hover. The pointer test matters — headless\n * desktop browsers report `hover: none` without being touch devices. */\n@media (hover: none) and (pointer: coarse) {\n  html body .Sixlwa_userRow > .xzv4MW_actions .xzv4MW_action {\n    opacity: 1;\n  }\n}\n\n@media (pointer: coarse) {\n  html body .xzv4MW_action,\n  html body ._8_XoUG_action {\n    width: 44px;\n    height: 44px;\n    padding: 14px;\n    border-radius: var(--pui-radius-md);\n  }\n\n  html body .xzv4MW_action svg,\n  html body ._8_XoUG_action svg {\n    width: 16px;\n    height: 16px;\n  }\n\n  html body .xzv4MW_actions,\n  html body .TS9iAW_actions {\n    height: 44px;\n    gap: 0;\n  }\n\n  html body .Q51KRG_trigger {\n    height: 44px;\n    min-width: 44px;\n    padding: 10px;\n    justify-content: center;\n  }\n\n  html body .o3BgMG_inspectButton,\n  html body .CY-8Ka_inspectButton {\n    min-height: 44px;\n    padding: 10px 12px;\n  }\n\n  html body .Sixlwa_retrySummary {\n    min-height: 44px;\n    align-items: center;\n    display: inline-flex;\n  }\n\n  html body ._action_1pq26_43 {\n    width: 44px;\n    height: 44px;\n  }\n\n  html body ._header_1pq26_10 {\n    min-height: 48px;\n  }\n\n  html body ._row_k7ery_26,\n  html body .O_Ebla_title,\n  html body .l_V-RG_root {\n    min-height: 44px;\n  }\n\n  html body .lcKema_root:not([data-expanded]) {\n    height: 44px;\n  }\n\n  html body .EvIC1a_toBottom {\n    width: 44px;\n    height: 44px;\n  }\n\n  html body ._copyButton_8z71b_132 {\n    min-height: 44px;\n    padding: 10px 12px;\n  }\n}\n\n/* Keyboard-users get a stronger focus ring on the small disclosure rows. */\nhtml body .O_Ebla_title:focus-visible,\nhtml body ._row_k7ery_26:focus-visible,\nhtml body .l_V-RG_root:focus-visible {\n  outline-offset: 2px;\n}\n\n/* High contrast: pair the state colour with the existing text/aria cues. */\n@media (forced-colors: active) {\n  html body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='running'] ._title_k7ery_100,\n  html body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='error'] ._title_k7ery_100 {\n    color: CanvasText;\n    font-weight: 600;\n  }\n\n  html body .EvIC1a_toBottom {\n    border: 1px solid ButtonText;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='running']\n    ._leading_k7ery_50::after {\n    animation: none;\n    opacity: 0;\n  }\n\n  html body .l_V-RG_chevron,\n  html body .EvIC1a_toBottom {\n    transition: none;\n  }\n}\n\n/* The in-app reduced-motion preference mirrors the OS one. */\nhtml[data-palace-motion='reduced'] body :is(.o3BgMG_root, .CY-8Ka_root, .lcKema_root)[data-state='running']\n  ._leading_k7ery_50::after {\n  animation: none;\n  opacity: 0;\n}\n","22-composer":"/* =====================================================================\n * palace-ui / 22 · Composer, input area & dock stats\n * =====================================================================\n * Soft Minimal Dark for the conversation composer (hero + session variants),\n * the attachments rail, the queue panel, the drop target and the statistics\n * dock under the card.\n *\n * Depth comes from structure and lightness: surface-3 card, a hairline stroke\n * drawn as an inset elevation line (no layout cost), soft elevation, and a\n * restrained sky focus ring on the whole capsule. The primary action is the\n * light chip with a dark glyph; stop is a neutral chip with a rose square.\n *\n * Everything is scoped `html body …` so it outranks the stock single-class\n * rules regardless of injection order, and every value resolves from the\n * `--pui-*` / `--dsw-*` token layers (no literal colours).\n *\n * DSH 0.2.1-rc.5 selector map (also recorded in docs/palace-ui-components.md):\n *   Composer seat/stack  wSkVaW_composerSeat, wSkVaW_composerStack,\n *                        wSkVaW_composerHero\n *   InputBar             uV2eYG_root, _hero, _card, _cardWorkspaceTrigger,\n *                        _overlayAnchor, _accessory, _scroll, _grow, _input,\n *                        _placeholder, _inputDisabled, _pending, _row, _tools,\n *                        _modes, _trailing, _standardControls, _activity,\n *                        _activityExpanded, _trailingActive, _add, _select,\n *                        _primary, _retry, _notice, _dock\n *   Permission chip      iWlSmW_trigger, _triggerIcon, _triggerLabel,\n *                        _chevron, _chevronOpen\n *   Model chip           _7KE1Ra_root, _trigger, _triggerLabel,\n *                        _triggerEffort, _chevron, _chevronOpen\n *   Stats pills          bOPqQW_anchor, _pill, _label, _sep\n *   Context meter        JObwrW_root, _trigger, _track, _fill, _percent\n *   Attachments rail     _54WpYG_rail, _imageItem, _thumbnail, _remove;\n *                        JVDQca_root, _rail, _item, _thumbnail, _remove,\n *                        _arrow, _arrowLeft, _arrowRight;\n *                        gSkjMW_card, _failed, _icon, _spinner, _body,\n *                        _retry, _name, _meta, _metaFailed, _remove,\n *                        _removeFailed, _progressTrack, _progressBar\n *   Drop target          BInVoG_mask, _wrap, _illustration, _title, _desc\n *   Queue panel          _7yHdaG_dock, _panel, _header, _lead, _count,\n *                        _chevron, _list, _row, _attachments, _file,\n *                        _fileIcon, _fileName, _fileSize, _thumb, _preview,\n *                        _actions, _status, _action\n *   Inline chips         q44v1G_reference, q44v1G_textRef; yAWgPa_chip,\n *                        _marker, _icon, _label, _invalid\n * ===================================================================== */\n\n/* ---------------------------------------------------------------------\n * 1. Local component tokens (derived from the shared layers only)\n * ------------------------------------------------------------------- */\nhtml body {\n  /* Concentric geometry: card 24, inner surfaces 16, controls 12. */\n  --pui-c-radius-card: var(--pui-radius-panel); /* 24 */\n  --pui-c-radius-inner: var(--pui-radius-card); /* 16 */\n  --pui-c-radius-control: var(--pui-radius-lg); /* 12 */\n\n  --pui-c-fill: var(--dsw-specific-input-major); /* surface-3 */\n  --pui-c-fill-raised: var(--dsw-alias-bg-layer-2); /* surface-2 */\n  --pui-c-stroke: var(--dsw-alias-border-l2);\n  --pui-c-stroke-hover: var(--pui-border-hover);\n  --pui-c-stroke-active: var(--pui-border-active);\n  --pui-c-chip-fill: var(--dsw-alias-interactive-bg-hover);\n  --pui-c-chip-fill-hover: var(--dsw-alias-interactive-bg-active);\n  --pui-c-scrim: var(--dsw-alias-bg-mask-drop);\n  --pui-c-ring: color-mix(in srgb, var(--dsw-focus-ring-color) 40%, transparent);\n  --pui-c-ring-soft: color-mix(in srgb, var(--dsw-focus-ring-color) 12%, transparent);\n  --pui-c-hairline: color-mix(in srgb, var(--pui-text-primary) 7%, transparent);\n  --pui-c-highlight: color-mix(in srgb, var(--pui-text-primary) 6%, transparent);\n  --pui-c-elevation: var(--dsw-elevation-soft, var(--dsw-shadow-lv2));\n  --pui-c-tint: color-mix(in srgb, var(--pui-accent-sky) 12%, transparent);\n\n  /* Error text: rose-soft on dark (legible), rose-500 on the light twin. */\n  --pui-c-danger-text: var(--dsw-alias-state-error-primary);\n\n  /* Single owner of the mobile tab-bar / keyboard clearance: the mobile sheet\n   * sets this once; the composer merely consumes it (never adds its own\n   * safe-area inset, so the maths cannot double-count). */\n  --pui-composer-bottom-clearance: 0px;\n}\n\n/* ---------------------------------------------------------------------\n * 2. Seat & stack — sticky bottom seat, capped draft scrollport\n * ------------------------------------------------------------------- */\nhtml body .wSkVaW_composerSeat {\n  /* Draft max height: 14ish lines on tall screens, never more than a third of\n   * the viewport, with internal scrolling handled by `.uV2eYG_scroll`. */\n  --dsh-composer-text-max-height: clamp(150px, 32dvh, 336px);\n}\n\nhtml body .wSkVaW_composerStack {\n  --dsh-composer-stack-gap: 6px;\n}\n\n/* ---------------------------------------------------------------------\n * 3. Composer card — the capsule\n * ------------------------------------------------------------------- */\nhtml body .uV2eYG_root {\n  padding-bottom: max(4px, var(--pui-composer-bottom-clearance));\n}\n\nhtml body .uV2eYG_card {\n  padding-top: 8px;\n  gap: 10px;\n  border-radius: var(--pui-c-radius-card);\n  background: var(--pui-c-fill);\n  --dsw-specific-input-major: var(--pui-c-fill);\n  --dsw-elevation-stroke-color: var(--pui-c-stroke);\n  /* Inset 1px hairline + soft elevation + a 1px top-light edge: iOS-like\n   * structure without a second border box or layout shift. */\n  box-shadow:\n    inset 0 0 0 1px var(--pui-c-stroke),\n    inset 0 1px 0 0 var(--pui-c-highlight),\n    var(--pui-c-elevation);\n  transition:\n    box-shadow var(--pui-duration-hover) var(--pui-ease-out),\n    background-color var(--pui-duration-hover) var(--pui-ease-out);\n}\n\n@media (hover: hover) {\n  html body .uV2eYG_card:hover {\n    box-shadow:\n      inset 0 0 0 1px var(--pui-c-stroke-hover),\n      inset 0 1px 0 0 var(--pui-c-highlight),\n      var(--pui-c-elevation);\n  }\n}\n\n/* Focus lives on the capsule, not the bare contenteditable: one ring for the\n * whole input surface. The composer autofocuses on a desktop session, so the\n * at-rest state only gets a soft sky edge; the strong ring is reserved for the\n * keyboard, where focus must be unmistakable. */\nhtml body .uV2eYG_card:focus-within {\n  box-shadow:\n    inset 0 0 0 1px color-mix(in srgb, var(--pui-accent-sky) 20%, var(--pui-c-stroke-hover)),\n    inset 0 1px 0 0 var(--pui-c-highlight),\n    0 0 0 3px var(--pui-c-ring-soft),\n    var(--pui-c-elevation);\n}\n\nhtml body .uV2eYG_card:focus-within:has(:focus-visible) {\n  box-shadow:\n    inset 0 0 0 1px color-mix(in srgb, var(--pui-accent-sky) 58%, var(--pui-c-stroke-hover)),\n    inset 0 1px 0 0 var(--pui-c-highlight),\n    0 0 0 4px color-mix(in srgb, var(--dsw-focus-ring-color) 20%, transparent),\n    var(--pui-c-elevation);\n}\n\n/* No-workspace picker: dashed inset marks the whole capsule as a target. */\nhtml body .uV2eYG_cardWorkspaceTrigger::after {\n  border-radius: var(--pui-c-radius-card);\n  border-color: var(--pui-c-stroke-active);\n  transition:\n    border-color var(--pui-duration-hover) var(--pui-ease-out),\n    background-color var(--pui-duration-hover) var(--pui-ease-out);\n}\n\nhtml body .uV2eYG_cardWorkspaceTrigger:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: 2px;\n}\n\n/* Removed / offline / parent-offline: the capsule recedes but keeps its\n * structure; the disabled editor text stays readable. */\nhtml body .uV2eYG_card:has(.uV2eYG_inputDisabled) {\n  background: color-mix(in srgb, var(--pui-c-fill) 74%, var(--dsw-alias-bg-base));\n}\n\n@media (hover: hover) {\n  html body .uV2eYG_cardWorkspaceTrigger:hover::after {\n    border-color: var(--dsw-alias-state-business-primary);\n    background: color-mix(in srgb, var(--pui-accent-sky) 4%, transparent);\n  }\n}\n\n/* ---------------------------------------------------------------------\n * 4. Draft editor — auto-grow, capped internal scroll, legible placeholder\n * ------------------------------------------------------------------- */\nhtml body .uV2eYG_scroll {\n  margin-right: 6px;\n}\n\nhtml body .uV2eYG_input {\n  min-height: 36px;\n  padding: 6px 12px 0 16px;\n  /* 14–15px / 1.6 type: inherits the user font-size preference, only the\n   * leading is normalised. */\n  line-height: 1.6;\n  color: var(--dsw-alias-label-primary);\n  caret-color: var(--dsw-alias-state-business-primary);\n  border-radius: var(--pui-c-radius-inner);\n}\n\nhtml body .uV2eYG_hero .uV2eYG_input {\n  /* Two 14px/1.6 lines + top pad: no fixed dead band below a one-line draft. */\n  min-height: 52px;\n}\n\nhtml body .uV2eYG_placeholder {\n  inset: 6px 12px auto 16px;\n  /* Secondary, not caption: the placeholder must stay legible (≈5.5:1 on the\n   * surface-3 card) — muted by comparison with the primary draft text. */\n  color: var(--dsw-alias-label-secondary);\n  line-height: 1.6;\n}\n\nhtml body .uV2eYG_hero .uV2eYG_placeholder {\n  -webkit-line-clamp: 2;\n  line-clamp: 2;\n}\n\nhtml body .uV2eYG_inputDisabled {\n  color: var(--dsw-alias-label-dimmed);\n}\n\nhtml body .uV2eYG_input[data-composer-chip-selected] {\n  caret-color: transparent;\n}\n\n/* Machine pending dot (adjudicating / submitting): sky status, never colour\n * alone — the send button's disabled/label state carries the meaning. */\nhtml body .uV2eYG_pending {\n  width: 7px;\n  height: 7px;\n  background: var(--pui-accent-sky-soft);\n  box-shadow: 0 0 0 3px color-mix(in srgb, var(--pui-accent-sky) 16%, transparent);\n}\n\n/* ---------------------------------------------------------------------\n * 5. Bottom control row — attach, chips, send/stop\n * ------------------------------------------------------------------- */\nhtml body .uV2eYG_row {\n  padding: 2px 10px 8px;\n  gap: 8px;\n}\n\nhtml body .uV2eYG_tools,\nhtml body .uV2eYG_modes,\nhtml body .uV2eYG_trailing,\nhtml body .uV2eYG_standardControls {\n  gap: 8px;\n}\n\nhtml body .uV2eYG_trailing {\n  align-items: center;\n}\n\n/* Attach (+): a quiet 30px square that reads as a control at rest. */\nhtml body .uV2eYG_add {\n  position: relative;\n  width: 30px;\n  height: 30px;\n  border-radius: var(--pui-c-radius-control);\n  background: var(--pui-c-chip-fill);\n  box-shadow: inset 0 0 0 0.5px var(--pui-border-divider);\n  color: var(--dsw-alias-label-secondary);\n  transition:\n    background-color var(--pui-duration-press) var(--pui-ease-out),\n    color var(--pui-duration-press) var(--pui-ease-out),\n    box-shadow var(--pui-duration-hover) var(--pui-ease-out);\n}\n\nhtml body .uV2eYG_add:active:not(:disabled) {\n  background: var(--pui-c-chip-fill-hover);\n  color: var(--dsw-alias-label-primary);\n}\n\nhtml body .uV2eYG_add:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: 2px;\n}\n\nhtml body .uV2eYG_add:disabled {\n  opacity: 0.45;\n  cursor: default;\n}\n\n@media (hover: hover) {\n  html body .uV2eYG_add:hover:not(:disabled) {\n    background: var(--pui-c-chip-fill-hover);\n    color: var(--dsw-alias-label-primary);\n    box-shadow: inset 0 0 0 0.5px var(--pui-c-stroke-hover);\n  }\n}\n\n/* Workdir / permission chip + model chip: hairline chips, 28px tall. */\nhtml body .iWlSmW_trigger,\nhtml body ._7KE1Ra_trigger,\nhtml body .uV2eYG_select {\n  position: relative;\n  height: 28px;\n  padding: 0 8px;\n  gap: 6px;\n  border-radius: var(--pui-c-radius-control);\n  background: transparent;\n  box-shadow: inset 0 0 0 0.5px var(--pui-border-default);\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12.5px;\n  transition:\n    background-color var(--pui-duration-hover) var(--pui-ease-out),\n    color var(--pui-duration-hover) var(--pui-ease-out),\n    box-shadow var(--pui-duration-hover) var(--pui-ease-out);\n}\n\nhtml body .iWlSmW_trigger:active:not(:disabled),\nhtml body ._7KE1Ra_trigger:active:not(:disabled) {\n  background: var(--pui-c-chip-fill-hover);\n}\n\nhtml body .iWlSmW_trigger:focus-visible,\nhtml body ._7KE1Ra_trigger:focus-visible:not([data-selection-focus]) {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: 2px;\n  box-shadow: inset 0 0 0 0.5px var(--pui-c-stroke-hover);\n}\n\nhtml body .iWlSmW_trigger:disabled,\nhtml body ._7KE1Ra_trigger:disabled {\n  color: var(--dsw-alias-label-dimmed);\n  box-shadow: inset 0 0 0 0.5px var(--pui-border-divider);\n}\n\nhtml body .iWlSmW_triggerIcon svg,\nhtml body ._7KE1Ra_triggerIcon svg {\n  width: 14px;\n  height: 14px;\n}\n\nhtml body .iWlSmW_chevron,\nhtml body ._7KE1Ra_chevron {\n  color: var(--dsw-alias-label-caption);\n}\n\n/* The model name is machine text: mono + tabular keeps versions aligned and\n * makes the vendor/effort split read as data rather than prose. */\nhtml body ._7KE1Ra_triggerLabel {\n  font-family: var(--pui-font-mono);\n  font-size: 12px;\n  font-weight: 500;\n  letter-spacing: -0.01em;\n  font-variant-numeric: tabular-nums;\n}\n\nhtml body ._7KE1Ra_triggerEffort {\n  font-family: var(--pui-font-mono);\n  font-size: 10.5px;\n  letter-spacing: 0.02em;\n  color: var(--dsw-alias-label-caption);\n}\n\n@media (hover: hover) {\n  html body .uV2eYG_row .iWlSmW_trigger:hover:not(:disabled),\n  html body .uV2eYG_row ._7KE1Ra_trigger:hover:not(:disabled) {\n    background: var(--pui-c-chip-fill);\n    box-shadow: inset 0 0 0 0.5px var(--pui-c-stroke-hover);\n    color: var(--dsw-alias-label-primary);\n  }\n\n  html body .uV2eYG_row ._7KE1Ra_trigger:hover:not(:disabled) ._7KE1Ra_triggerEffort {\n    color: var(--dsw-alias-label-tertiary);\n  }\n}\n\n/* Send: the light primary chip with a dark glyph (design-system primary).\n * Stop (same node when the session is running) is neutral with a rose mark. */\nhtml body .uV2eYG_primary {\n  position: relative;\n  width: 34px;\n  height: 34px;\n  border-radius: var(--pui-c-radius-control);\n  transform: none;\n  background: var(--dsw-alias-button-primary-fill);\n  color: var(--dsw-alias-label-primary-foreground);\n  box-shadow:\n    inset 0 1px 0 0 var(--pui-c-highlight),\n    0 1px 2px color-mix(in srgb, var(--pui-canvas) 65%, transparent);\n  transition:\n    background-color var(--pui-duration-press) var(--pui-ease-out),\n    color var(--pui-duration-press) var(--pui-ease-out),\n    box-shadow var(--pui-duration-hover) var(--pui-ease-out),\n    transform var(--pui-duration-press) var(--pui-ease-out);\n}\n\nhtml body .uV2eYG_primary:active:not(:disabled) {\n  transform: scale(0.96);\n  background: color-mix(in srgb, var(--dsw-alias-button-primary-fill) 84%, var(--pui-canvas));\n}\n\nhtml body .uV2eYG_primary:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: 2px;\n}\n\n/* Empty draft / uploads pending / unavailable: a quiet seat, not a disabled\n * primary that looks like a filled button. */\nhtml body .uV2eYG_primary:disabled {\n  opacity: 1;\n  background: var(--pui-c-chip-fill);\n  color: var(--dsw-alias-label-caption);\n  box-shadow: inset 0 0 0 0.5px var(--pui-border-divider);\n  transform: none;\n}\n\n/* Stop state: the only primary that renders a `<rect>` glyph. Neutral chip,\n * rose square — a status colour, not decoration. */\nhtml body .uV2eYG_primary:has(rect) {\n  background: var(--pui-surface-4);\n  color: var(--pui-accent-rose-soft);\n  box-shadow:\n    inset 0 0 0 0.5px var(--pui-border-hover),\n    0 1px 2px color-mix(in srgb, var(--pui-canvas) 55%, transparent);\n}\n\nhtml body .uV2eYG_primary:has(rect):disabled {\n  opacity: 1;\n  background: var(--pui-c-chip-fill);\n  color: var(--dsw-alias-label-dimmed);\n}\n\n/* A submitting spinner (newer DSH builds) turns instead of the arrow. */\nhtml body .uV2eYG_primary:has(svg circle) :is(svg) {\n  animation: pui-composer-spin 800ms linear infinite;\n}\n\n@keyframes pui-composer-spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n@media (hover: hover) {\n  html body .uV2eYG_primary:hover:not(:disabled) {\n    background: var(--dsw-alias-button-primary-hover);\n    box-shadow:\n      inset 0 1px 0 0 var(--pui-c-highlight),\n      0 2px 6px color-mix(in srgb, var(--pui-canvas) 70%, transparent);\n  }\n\n  html body .uV2eYG_primary:has(rect):hover:not(:disabled) {\n    background: var(--pui-surface-5);\n    color: var(--pui-accent-rose-soft);\n  }\n}\n\n/* ---------------------------------------------------------------------\n * 6. Notices & retry (queued / offline / failure strips)\n * ------------------------------------------------------------------- */\nhtml body .uV2eYG_notice {\n  width: calc(100% - 2 * var(--dsh-composer-side-clearance, 16px));\n  max-width: var(--dsh-composer-card-max-width);\n  margin-bottom: 8px;\n  padding: 6px 12px;\n  border-radius: var(--pui-radius-md);\n  background: var(--pui-c-fill-raised);\n  box-shadow: inset 0 0 0 0.5px var(--pui-border-divider);\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12.5px;\n  line-height: 18px;\n}\n\nhtml body .uV2eYG_retry {\n  min-height: 24px;\n  margin-left: 8px;\n  padding: 1px 9px;\n  border: 0.5px solid var(--pui-c-stroke-hover);\n  border-radius: var(--pui-radius-sm);\n  color: var(--dsw-alias-label-primary);\n  font-size: 11.5px;\n  cursor: pointer;\n  transition: background-color var(--pui-duration-hover) var(--pui-ease-out);\n}\n\nhtml body .uV2eYG_retry:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: 2px;\n}\n\n@media (hover: hover) {\n  html body .uV2eYG_retry:hover {\n    background: var(--pui-c-chip-fill);\n  }\n}\n\n/* ---------------------------------------------------------------------\n * 7. Attachments — file cards, image boxes, rails, upload/error states\n * ------------------------------------------------------------------- */\nhtml body ._54WpYG_rail {\n  padding: 4px 12px 0;\n  margin-bottom: -4px;\n}\n\nhtml body .JVDQca_root {\n  min-width: 0;\n}\n\nhtml body .JVDQca_rail {\n  gap: 8px;\n  padding: 2px 0;\n}\n\nhtml body .JVDQca_item {\n  height: 64px;\n}\n\n/* File card: raised inner surface, 16px radius (24 outer − 8 padding). */\nhtml body .gSkjMW_card {\n  width: 248px;\n  height: 64px;\n  padding: 0 12px;\n  gap: 10px;\n  border: 0.5px solid var(--pui-border-default);\n  border-radius: var(--pui-c-radius-inner);\n  background: var(--pui-c-fill-raised);\n  transition:\n    border-color var(--pui-duration-hover) var(--pui-ease-out),\n    background-color var(--pui-duration-hover) var(--pui-ease-out);\n}\n\nhtml body .gSkjMW_icon {\n  width: 28px;\n  height: 28px;\n}\n\nhtml body .gSkjMW_name {\n  color: var(--dsw-alias-label-primary);\n  font-family: var(--pui-font-mono);\n  font-size: 12.5px;\n  font-weight: 500;\n  line-height: 18px;\n  letter-spacing: -0.01em;\n}\n\n/* \"MD 50B\": type + human size are machine readings — mono, tabular, quiet. */\nhtml body .gSkjMW_meta {\n  color: var(--dsw-alias-label-secondary);\n  font-family: var(--pui-font-mono);\n  font-size: 10.5px;\n  line-height: 15px;\n  letter-spacing: 0.02em;\n  font-variant-numeric: tabular-nums;\n}\n\nhtml body .gSkjMW_retry {\n  border-radius: var(--pui-radius-xs);\n}\n\nhtml body .gSkjMW_retry:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: 2px;\n}\n\n/* Remove: small filled affordance, 44px pointer target, always present on\n * touch (the stock rule already forces opacity 1 there). */\nhtml body .gSkjMW_remove,\nhtml body ._54WpYG_remove,\nhtml body .JVDQca_remove {\n  width: 20px;\n  height: 20px;\n  border-radius: 50%;\n  background: var(--dsw-alias-button-primary-fill);\n  color: var(--dsw-alias-label-primary-foreground);\n  box-shadow: 0 1px 2px color-mix(in srgb, var(--pui-canvas) 60%, transparent);\n  opacity: 0;\n}\n\nhtml body .gSkjMW_remove::after,\nhtml body ._54WpYG_remove::after,\nhtml body .JVDQca_remove::after {\n  content: '';\n  position: absolute;\n  inset: -12px;\n}\n\nhtml body .gSkjMW_remove:focus-visible,\nhtml body ._54WpYG_remove:focus-visible,\nhtml body .JVDQca_remove:focus-visible {\n  opacity: 1;\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: 2px;\n}\n\nhtml body .gSkjMW_removeFailed {\n  background: var(--dsw-alias-state-error-primary);\n  color: var(--pui-text-primary);\n  opacity: 1;\n}\n\nhtml body .gSkjMW_failed {\n  border-color: color-mix(in srgb, var(--pui-accent-rose) 65%, transparent);\n}\n\nhtml body .gSkjMW_metaFailed {\n  color: var(--pui-c-danger-text);\n}\n\nhtml body .gSkjMW_spinner {\n  width: 18px;\n  height: 18px;\n  border-width: 1.5px;\n  color: var(--dsw-alias-label-secondary);\n}\n\n/* Upload progress: a real 2px reading, never a faked percentage. */\nhtml body .gSkjMW_progressTrack {\n  left: 12px;\n  right: 12px;\n  bottom: 6px;\n  height: 3px;\n  border-radius: var(--pui-radius-pill);\n  background: color-mix(in srgb, var(--pui-text-primary) 12%, transparent);\n}\n\nhtml body .gSkjMW_progressBar {\n  border-radius: inherit;\n  background: var(--pui-accent-sky);\n}\n\n/* Image thumbnails: stable 64px boxes with the raised hairline material. */\nhtml body ._54WpYG_thumbnail,\nhtml body .JVDQca_thumbnail {\n  width: 64px;\n  height: 64px;\n  border: 0.5px solid var(--pui-border-default);\n  border-radius: var(--pui-c-radius-inner);\n  background: var(--pui-c-fill-raised);\n}\n\nhtml body ._54WpYG_remove {\n  top: 5px;\n  right: 5px;\n}\n\nhtml body .JVDQca_remove {\n  top: 5px;\n  right: 5px;\n}\n\n/* Rail paging arrows: raised pill, hairline, panel elevation. */\nhtml body .JVDQca_arrow {\n  width: 28px;\n  height: 28px;\n  background: var(--pui-c-fill-raised);\n  color: var(--dsw-alias-label-secondary);\n  box-shadow:\n    inset 0 0 0 0.5px var(--pui-c-stroke),\n    var(--dsw-elevation-panel, var(--dsw-shadow-lv2));\n}\n\nhtml body .JVDQca_arrow:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: 2px;\n}\n\n@media (hover: hover) {\n  html body .gSkjMW_card:hover {\n    border-color: var(--pui-c-stroke-hover);\n    background: color-mix(in srgb, var(--pui-c-fill-raised) 82%, var(--pui-c-fill));\n  }\n\n  html body .gSkjMW_card:hover .gSkjMW_remove,\n  html body ._54WpYG_imageItem:hover ._54WpYG_remove,\n  html body .JVDQca_item:hover .JVDQca_remove {\n    opacity: 1;\n  }\n\n  html body .JVDQca_arrow:hover {\n    background: var(--pui-surface-4);\n    color: var(--dsw-alias-label-primary);\n  }\n}\n\n/* ---------------------------------------------------------------------\n * 8. Drop target — full-viewport scrim + one designed landing card\n * ------------------------------------------------------------------- */\nhtml body .BInVoG_mask {\n  background-color: var(--pui-c-scrim);\n  backdrop-filter: blur(6px);\n}\n\nhtml body .BInVoG_wrap {\n  max-width: min(560px, calc(100vw - 48px));\n  margin-top: 0;\n  padding: 40px 56px 36px;\n  border: 1px dashed color-mix(in srgb, var(--pui-accent-sky) 42%, var(--pui-border-hover));\n  border-radius: var(--pui-c-radius-card);\n  background: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 82%, transparent);\n  box-shadow: var(--dsw-elevation-prominent, var(--dsw-shadow-lv3));\n  animation: pui-composer-drop-in var(--pui-duration-panel) var(--pui-ease-out);\n}\n\nhtml body .BInVoG_illustration {\n  width: 92px;\n  height: 68px;\n  opacity: 0.9;\n}\n\nhtml body .BInVoG_title {\n  margin-top: 14px;\n  font-size: 17px;\n  font-weight: 600;\n  line-height: 26px;\n  letter-spacing: -0.01em;\n  color: var(--dsw-alias-label-primary);\n}\n\nhtml body .BInVoG_desc {\n  margin-top: 8px;\n  font-size: 12.5px;\n  line-height: 20px;\n  color: var(--dsw-alias-label-secondary);\n}\n\n@keyframes pui-composer-drop-in {\n  from {\n    opacity: 0;\n    transform: translateY(6px) scale(0.99);\n  }\n  to {\n    opacity: 1;\n    transform: none;\n  }\n}\n\n/* ---------------------------------------------------------------------\n * 9. Queue panel — messages waiting for the next turn\n * ------------------------------------------------------------------- */\nhtml body ._7yHdaG_panel {\n  border-radius: var(--pui-c-radius-card) var(--pui-c-radius-card) 0 0;\n  background: var(--pui-c-fill-raised);\n}\n\nhtml body ._7yHdaG_panel::before {\n  background: var(--pui-c-fill-raised);\n  backdrop-filter: none;\n}\n\nhtml body ._7yHdaG_panel::after {\n  border: 0.5px solid var(--pui-border-default);\n  border-bottom: none;\n}\n\nhtml body ._7yHdaG_header {\n  height: 34px;\n  padding: 4px 12px;\n  border-radius: var(--pui-radius-md);\n  color: var(--dsw-alias-label-primary);\n}\n\nhtml body ._7yHdaG_header:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: -2px;\n}\n\nhtml body ._7yHdaG_lead {\n  color: var(--dsw-alias-label-secondary);\n}\n\nhtml body ._7yHdaG_count {\n  font-size: 12.5px;\n  font-weight: 500;\n}\n\nhtml body ._7yHdaG_chevron {\n  color: var(--dsw-alias-label-tertiary);\n}\n\nhtml body ._7yHdaG_row {\n  min-height: 34px;\n  border-radius: var(--pui-radius-md);\n}\n\nhtml body ._7yHdaG_row + ._7yHdaG_row {\n  box-shadow: inset 0 1px 0 var(--pui-border-divider);\n}\n\nhtml body ._7yHdaG_file {\n  height: 24px;\n  border-color: var(--pui-border-divider);\n  border-radius: var(--pui-radius-sm);\n  background: var(--dsw-alias-bg-base);\n}\n\nhtml body ._7yHdaG_fileName {\n  font-family: var(--pui-font-mono);\n  font-size: 10.5px;\n  color: var(--dsw-alias-label-secondary);\n}\n\nhtml body ._7yHdaG_fileSize {\n  font-family: var(--pui-font-mono);\n  font-size: 9.5px;\n  color: var(--dsw-alias-label-tertiary);\n  font-variant-numeric: tabular-nums;\n}\n\nhtml body ._7yHdaG_preview {\n  font-size: 12px;\n  color: var(--dsw-alias-label-secondary);\n}\n\nhtml body ._7yHdaG_status {\n  font-family: var(--pui-font-mono);\n  font-size: 10.5px;\n  color: var(--dsw-alias-label-tertiary);\n}\n\nhtml body ._7yHdaG_action {\n  width: 28px;\n  height: 28px;\n  border-radius: var(--pui-radius-sm);\n  color: var(--dsw-alias-label-secondary);\n}\n\nhtml body ._7yHdaG_action:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: -2px;\n}\n\n@media (hover: hover) {\n  html body ._7yHdaG_header:hover:not(:disabled) {\n    background: var(--pui-c-chip-fill);\n  }\n\n  html body ._7yHdaG_action:hover:not(:disabled) {\n    background: var(--pui-c-chip-fill);\n    color: var(--dsw-alias-label-primary);\n  }\n}\n\n/* ---------------------------------------------------------------------\n * 10. Dock row — stats pills + context meter\n * ------------------------------------------------------------------- */\nhtml body .uV2eYG_dock {\n  flex-wrap: wrap;\n  gap: 6px;\n  row-gap: 4px;\n  padding-top: 6px;\n}\n\nhtml body .bOPqQW_anchor {\n  font-size: 11.5px;\n  line-height: 18px;\n}\n\nhtml body .bOPqQW_pill {\n  position: relative;\n  height: 22px;\n  gap: 6px;\n  padding: 2px 9px;\n  border-radius: var(--pui-radius-pill);\n  box-shadow: inset 0 0 0 0.5px var(--pui-border-divider);\n  color: var(--dsw-alias-label-tertiary);\n  font-family: var(--pui-font-mono);\n  font-size: 11px;\n  letter-spacing: 0.01em;\n  font-variant-numeric: tabular-nums;\n  transition:\n    color var(--pui-duration-hover) var(--pui-ease-out),\n    background-color var(--pui-duration-hover) var(--pui-ease-out),\n    box-shadow var(--pui-duration-hover) var(--pui-ease-out);\n}\n\nhtml body .bOPqQW_pill svg {\n  width: 13px;\n  height: 13px;\n  color: var(--dsw-alias-label-caption);\n}\n\nhtml body .bOPqQW_sep {\n  margin: 0 5px;\n  color: var(--dsw-alias-label-caption);\n}\n\nhtml body .bOPqQW_pill:focus-visible,\nhtml body .JObwrW_trigger:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: 2px;\n}\n\n/* Context meter: the ring is a data reading, the figure is tabular. */\nhtml body .JObwrW_trigger {\n  position: relative;\n  height: 22px;\n  gap: 6px;\n  padding: 2px 9px;\n  border-radius: var(--pui-radius-pill);\n  box-shadow: inset 0 0 0 0.5px var(--pui-border-divider);\n  color: var(--dsw-alias-label-tertiary);\n  font-family: var(--pui-font-mono);\n  font-size: 11px;\n  letter-spacing: 0.01em;\n  font-variant-numeric: tabular-nums;\n  transition:\n    color var(--pui-duration-hover) var(--pui-ease-out),\n    background-color var(--pui-duration-hover) var(--pui-ease-out),\n    box-shadow var(--pui-duration-hover) var(--pui-ease-out);\n}\n\nhtml body .JObwrW_trigger svg {\n  width: 13px;\n  height: 13px;\n}\n\nhtml body .JObwrW_track {\n  stroke: var(--dsw-alias-border-l3);\n}\n\nhtml body .JObwrW_fill {\n  stroke: var(--pui-text-secondary);\n}\n\nhtml body .JObwrW_trigger[aria-expanded='true'] {\n  background: var(--pui-c-chip-fill);\n  color: var(--dsw-alias-label-secondary);\n  box-shadow: inset 0 0 0 0.5px var(--pui-c-stroke-hover);\n}\n\n@media (hover: hover) {\n  html body .bOPqQW_pill:hover,\n  html body .JObwrW_trigger:hover {\n    background: var(--pui-c-chip-fill);\n    color: var(--dsw-alias-label-secondary);\n    box-shadow: inset 0 0 0 0.5px var(--pui-c-stroke-hover);\n  }\n\n  html body button.bOPqQW_pill:hover svg {\n    color: var(--dsw-alias-label-secondary);\n  }\n}\n\n/* ---------------------------------------------------------------------\n * 10b. Phone dock — icon-only stats\n *      Phones keep the dock on one line: each stat pill and the context\n *      meter collapse to its icon/ring. Text and separators are hidden\n *      (DSH still reveals the full figures in the portaled dialog on tap).\n *      Hit areas reach 44px through ::after on coarse pointers; the visual\n *      stays ~32px so adjacent icons keep >= 8px spacing.\n * ------------------------------------------------------------------- */\n@media (max-width: 767px), (max-width: 1023px) and (max-height: 480px) and (pointer: coarse) {\n  html body .uV2eYG_dock {\n    flex-wrap: nowrap;\n    justify-content: center;\n    gap: 8px;\n    row-gap: 0;\n  }\n\n  html body .bOPqQW_anchor {\n    flex: 0 0 auto;\n  }\n\n  /* The context meter's reading text (\"14%\") is the stock span inside the\n   * trigger; on phones only the ring stays, the figures live in the tap dialog. */\n  html body .JObwrW_trigger > span {\n    display: none;\n  }\n\n  html body .bOPqQW_pill,\n  html body .JObwrW_trigger {\n    position: relative;\n    width: 32px;\n    height: 32px;\n    min-width: 32px;\n    padding: 0;\n    gap: 0;\n    justify-content: center;\n  }\n\n  html body .bOPqQW_label,\n  html body .bOPqQW_sep,\n  html body .JObwrW_percent {\n    display: none;\n  }\n\n  html body .bOPqQW_pill svg,\n  html body .JObwrW_trigger svg {\n    width: 15px;\n    height: 15px;\n  }\n\n  /* 44px hit box centred on the 32px visual; inset:-6px keeps neighbours\n   * 8px apart while the pointer target stays >= 44px. */\n  html body .bOPqQW_pill::after,\n  html body .JObwrW_trigger::after {\n    content: '';\n    position: absolute;\n    inset: -6px;\n  }\n\n  /* Keyboard/AT users still see the ring on the icon-only control. */\n  html body .bOPqQW_pill:focus-visible,\n  html body .JObwrW_trigger:focus-visible {\n    outline: 2px solid var(--dsw-focus-ring-color);\n    outline-offset: 2px;\n  }\n}\n\n/* ---------------------------------------------------------------------\n * 11. Inline trigger chips — slash commands and @-references\n * ------------------------------------------------------------------- */\nhtml body .uV2eYG_input .q44v1G_reference {\n  padding: 0 5px;\n  border-radius: 6px;\n  color: var(--pui-accent-sky-soft);\n  background: var(--pui-c-tint);\n  box-shadow: inset 0 0 0 0.5px color-mix(in srgb, var(--pui-accent-sky) 20%, transparent);\n}\n\nhtml body .uV2eYG_input .yAWgPa_chip {\n  gap: 4px;\n  color: var(--pui-accent-sky-soft);\n}\n\nhtml body .uV2eYG_input .yAWgPa_invalid {\n  color: var(--pui-c-danger-text);\n  opacity: 0.75;\n  text-decoration: line-through;\n}\n\nhtml body .uV2eYG_input[data-composer-command][data-selected] > .q44v1G_reference {\n  background: color-mix(in srgb, var(--pui-accent-sky) 20%, transparent);\n}\n\n@media (hover: hover) {\n  html body .uV2eYG_input .q44v1G_reference:hover {\n    background: color-mix(in srgb, var(--pui-accent-sky) 18%, transparent);\n  }\n}\n\n/* ---------------------------------------------------------------------\n * 12. Coarse pointers — 44px targets, larger type, extra breathing room\n * ------------------------------------------------------------------- */\n@media (pointer: coarse) {\n  html body .uV2eYG_input {\n    min-height: 40px;\n  }\n\n  html body .uV2eYG_hero .uV2eYG_input {\n    min-height: 56px;\n  }\n\n  html body .uV2eYG_row {\n    padding: 4px 10px 10px;\n    gap: 10px;\n  }\n\n  html body .uV2eYG_tools,\n  html body .uV2eYG_modes,\n  html body .uV2eYG_trailing,\n  html body .uV2eYG_standardControls {\n    gap: 8px;\n  }\n\n  /* Primary icon actions: 40px visual box with a real 48px hit area, so the\n   * 44px probe square (QA: getBoundingClientRect + elementFromPoint corners)\n   * lands on the button itself, not on the card behind it. */\n  html body .uV2eYG_add {\n    width: 40px;\n    height: 40px;\n    border-radius: var(--pui-radius-input);\n  }\n\n  html body .uV2eYG_add::after {\n    content: '';\n    position: absolute;\n    inset: -4px;\n  }\n\n  /* Phone: the attach/command menu opens above the composer. Keep it inside\n   * the visible area (never above the top safe area) and scrollable, so it\n   * cannot be clipped at the top edge while the keyboard is closed. */\n  html body [class*='_3e4SsG_menu'] {\n    max-height: min(\n      360px,\n      calc(100dvh - var(--pui-safe-top) - var(--pui-composer-seat-height, 160px) - var(--pui-space-md))\n    );\n    overflow-y: auto;\n    overscroll-behavior: contain;\n  }\n\n  html body .uV2eYG_primary {\n    width: 40px;\n    height: 40px;\n    border-radius: var(--pui-radius-input);\n  }\n\n  html body .uV2eYG_primary::after {\n    content: '';\n    position: absolute;\n    inset: -4px;\n  }\n\n  /* Chips keep their 40px visual height; the tap box reaches 44px vertically\n   * without widening horizontally (adjacent chips keep their 8px gap). */\n  html body .iWlSmW_trigger,\n  html body ._7KE1Ra_trigger,\n  html body .uV2eYG_select {\n    height: 36px;\n    padding: 0 10px;\n    font-size: 13px;\n  }\n\n  html body .iWlSmW_trigger::after,\n  html body ._7KE1Ra_trigger::after {\n    content: '';\n    position: absolute;\n    inset: -6px 0;\n  }\n\n  html body .uV2eYG_input,\n  html body .uV2eYG_placeholder {\n    font-size: max(16px, var(--dsh-content-font-size, 14px));\n  }\n\n  html body .bOPqQW_pill,\n  html body .JObwrW_trigger {\n    height: 32px;\n    padding: 2px 10px;\n    font-size: 12px;\n  }\n\n  /* Wrapped dock rows sit 4px apart: expand by 2px each so sibling hit\n   * boxes meet at the gap instead of overlapping the row above. */\n  html body .bOPqQW_pill::after,\n  html body .JObwrW_trigger::after {\n    content: '';\n    position: absolute;\n    inset: -2px 0;\n  }\n\n  html body .uV2eYG_dock {\n    gap: 8px;\n  }\n\n  html body .gSkjMW_card {\n    width: 260px;\n    height: 68px;\n  }\n\n  html body .gSkjMW_name {\n    font-size: 13px;\n  }\n\n  html body .gSkjMW_meta {\n    font-size: 11px;\n  }\n\n  html body .gSkjMW_remove,\n  html body ._54WpYG_remove,\n  html body .JVDQca_remove {\n    width: 24px;\n    height: 24px;\n  }\n\n  html body ._7yHdaG_action {\n    position: relative;\n    width: 40px;\n    height: 40px;\n  }\n\n  html body ._7yHdaG_action::after {\n    content: '';\n    position: absolute;\n    inset: -4px;\n  }\n}\n\n/* ---------------------------------------------------------------------\n * 13. Narrow viewports — card-level rhythm only; the phone shell (tab bar,\n *     safe areas, drawer) is owned by 30-mobile.css, which also publishes\n *     --pui-composer-bottom-clearance (consumed once above).\n * ------------------------------------------------------------------- */\n@media (max-width: 767px) {\n  html body .uV2eYG_card {\n    gap: 8px;\n    padding-top: 6px;\n  }\n\n  html body .uV2eYG_row {\n    padding: 2px 8px 8px;\n  }\n\n  html body .uV2eYG_hero .uV2eYG_input {\n    min-height: 54px;\n  }\n\n  html body .uV2eYG_placeholder {\n    inset: 6px 10px auto 14px;\n  }\n\n  html body .uV2eYG_input {\n    padding: 6px 10px 0 14px;\n  }\n\n  html body ._54WpYG_rail {\n    padding: 4px 10px 0;\n  }\n\n  html body .uV2eYG_dock {\n    justify-content: center;\n  }\n\n  html body .bOPqQW_pill,\n  html body .JObwrW_trigger {\n    font-size: 10.5px;\n  }\n\n  html body .BInVoG_wrap {\n    padding: 32px 28px;\n  }\n\n  html body .BInVoG_title {\n    font-size: 16px;\n    line-height: 24px;\n  }\n}\n\n/* ---------------------------------------------------------------------\n * 14. Short viewports — keep the composer compact so it never eats the\n *     transcript (the draft keeps its own internal scroll).\n * ------------------------------------------------------------------- */\n@media (max-height: 640px) {\n  html body .wSkVaW_composerSeat {\n    --dsh-composer-text-max-height: 180px;\n  }\n\n  html body .uV2eYG_card {\n    gap: 8px;\n    padding-top: 6px;\n  }\n}\n\n/* Theme-scoped danger ink (component token, resolves from the accent ladder). */\nhtml body[data-ds-dark-theme] {\n  --pui-c-danger-text: var(--pui-accent-rose-soft);\n}\n\nhtml body:not([data-ds-dark-theme]) {\n  --pui-c-danger-text: var(--dsw-alias-state-error-primary);\n}\n\n/* Light twin: the top-edge highlight is a light bevel, not a dark smear. */\nhtml body:not([data-ds-dark-theme]) {\n  --pui-c-highlight: color-mix(in srgb, var(--pui-text-on-light) 72%, transparent);\n}\n","23-overlays":"/* =====================================================================\n * palace-ui / 23 · Overlays\n * =====================================================================\n * Dialogs (settings + confirmation primitives), drawers, popovers, dropdown\n * menus (model / session / account / view), the slash-command surface,\n * tooltips, toasts, skeletons and empty / no-result / offline / error panels.\n *\n * Rules honoured here (see DESIGN_CONTRACT.md):\n *   · Materials are surface-2 / surface-3; depth comes from a hairline border\n *     OR the elevation stroke — never both on one surface.\n *   · Backdrop blur lives only on menus/popovers (translucent material), never\n *     on dialogs, toasts or cards.\n *   · Panel radius 24, inner radius = outer − padding (concentric ladder).\n *   · Every interactive element has hover (hover-capable only), active,\n *     focus-visible and disabled states.\n *   · Escape / click-outside / focus-restore are DSH behaviour: styling only.\n *\n * Selector hashes pin DSH 0.2.1-rc.5 CSS-module names; the full hash map lives\n * in docs/palace-ui-overlays-mobile.md. All of them are attribute-matched\n * (`[class*='_item_4ub78_']`) so an unrelated hash bump is a no-op, not a\n * layout regression.\n * ===================================================================== */\n\n/* ---------------------------------------------------------------------\n * 0. Local component tokens (resolve from the shared token layer only)\n * ------------------------------------------------------------------- */\nhtml body {\n  /* The one material used by floating menus; opaque enough for text, tinted\n   * so the blurred content behind stays perceptible. */\n  --pui-overlay-menu-fill: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 86%, transparent);\n  --pui-overlay-menu-fill-strong: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 94%, transparent);\n  --pui-overlay-blur: blur(20px) saturate(140%);\n  --pui-overlay-border: var(--dsw-alias-border-l2);\n  --pui-overlay-selected: color-mix(in srgb, var(--dsw-alias-link) 14%, transparent);\n  --pui-overlay-selected-strong: color-mix(in srgb, var(--dsw-alias-link) 22%, transparent);\n  --pui-overlay-danger: color-mix(in srgb, var(--dsw-alias-state-error-primary) 13%, transparent);\n  --pui-overlay-shadow: var(--dsw-elevation-prominent);\n  --pui-overlay-shadow-soft: var(--dsw-elevation-soft);\n  --pui-overlay-panel-radius: var(--pui-radius-panel);\n  --pui-overlay-menu-radius: var(--pui-radius-input);\n  --pui-overlay-menu-pad: var(--pui-space-xs);\n  --pui-overlay-item-radius: var(--pui-radius-md);\n  --pui-overlay-item-height: 34px;\n  --pui-overlay-item-height-touch: var(--pui-touch-target);\n}\n\nhtml body:not([data-ds-dark-theme]) {\n  --pui-overlay-menu-fill: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 93%, transparent);\n  --pui-overlay-menu-fill-strong: color-mix(in srgb, var(--dsw-alias-bg-layer-2) 97%, transparent);\n  --pui-overlay-selected: color-mix(in srgb, var(--dsw-alias-link) 12%, transparent);\n  --pui-overlay-selected-strong: color-mix(in srgb, var(--dsw-alias-link) 18%, transparent);\n}\n\n/* ---------------------------------------------------------------------\n * 1. Motion — one panel entrance, reduced-motion respected by 10-base.css\n * ------------------------------------------------------------------- */\n@keyframes pui-overlay-in {\n  from {\n    opacity: 0;\n    transform: translateY(-4px) scale(0.985);\n  }\n  to {\n    opacity: 1;\n    transform: none;\n  }\n}\n\n@keyframes pui-overlay-fade-in {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n\n/* ---------------------------------------------------------------------\n * 2. Modal / dialog material\n * ------------------------------------------------------------------- */\n/* Generic modal primitive: .root_o6lrb_6 > .mask_o6lrb_18 / .dialog_o6lrb_33 */\nhtml body [class*='_root_o6lrb_'] {\n  z-index: 1200;\n  padding: max(24px, var(--pui-safe-top)) 24px max(24px, var(--pui-safe-bottom));\n}\n\nhtml body [class*='_mask_o6lrb_'] {\n  backdrop-filter: none;\n}\n\nhtml body [class*='_mask_o6lrb_']::after {\n  background: var(--dsw-alias-bg-mask-1);\n}\n\nhtml body [class*='_dialog_o6lrb_'] {\n  box-sizing: border-box;\n  border: 0;\n  border-radius: var(--pui-overlay-panel-radius);\n  background: var(--dsw-alias-bg-layer-2);\n  box-shadow: var(--pui-overlay-shadow);\n  --dsw-elevation-stroke-color: var(--pui-border-hover);\n  color: var(--dsw-alias-label-primary);\n  max-height: min(720px, calc(100dvh - 48px));\n  overscroll-behavior: contain;\n}\n\nhtml body [class*='_dialog_o6lrb_']:focus-visible,\nhtml body [class*='_dialog_o6lrb_']:focus {\n  outline: none;\n}\n\n/* The primitive's enter animation is subtle and short: a 4px rise, no bounce. */\nhtml body [class*='_dialog_o6lrb_'] {\n  animation: pui-overlay-in var(--pui-duration-panel) var(--pui-ease-out);\n}\n\nhtml body [class*='_header_o6lrb_'] {\n  padding: var(--pui-space-xl) var(--pui-space-lg) var(--pui-space-md) var(--pui-space-xl);\n  align-items: center;\n}\n\nhtml body [class*='_title_o6lrb_'] {\n  font-size: 16px;\n  font-weight: 600;\n  letter-spacing: -0.01em;\n  line-height: 24px;\n  color: var(--dsw-alias-label-primary);\n}\n\nhtml body [class*='_close_o6lrb_'] {\n  width: 32px;\n  height: 32px;\n  border-radius: var(--pui-radius-sm);\n  color: var(--dsw-alias-label-secondary);\n  transition: background-color var(--pui-duration-press) var(--pui-ease-out),\n    color var(--pui-duration-press) var(--pui-ease-out);\n}\n\nhtml body [class*='_description_o6lrb_'],\nhtml body [class*='_body_o6lrb_'] {\n  color: var(--dsw-alias-label-secondary);\n  font-size: 13.5px;\n  line-height: 21px;\n}\n\nhtml body [class*='_body_o6lrb_'] {\n  margin-top: var(--pui-space-lg);\n  padding: 0 var(--pui-space-xl);\n}\n\nhtml body [class*='_description_o6lrb_'] {\n  padding: 0 var(--pui-space-xl);\n}\n\nhtml body [class*='_footer_o6lrb_'] {\n  gap: var(--pui-space-sm);\n  padding: 0 var(--pui-space-xl) var(--pui-space-xl);\n}\n\n/* Modal action buttons: keep the density of a dialog footer, with a real\n * 44px hit area on coarse pointers. */\nhtml body [class*='_dialog_o6lrb_'] button,\nhtml body [role='dialog'] button {\n  touch-action: manipulation;\n}\n\nhtml body [class*='_modalAction'] {\n  min-height: 36px;\n  border-radius: var(--pui-radius-md);\n  font-weight: 500;\n}\n\n/* ---------------------------------------------------------------------\n * 3. Settings dialog (VOzbGW_* — dsh-client-ui-settings-general)\n * ------------------------------------------------------------------- */\nhtml body [class*='VOzbGW_overlay'] {\n  z-index: 1200;\n  align-items: center;\n  justify-content: center;\n  padding: max(24px, var(--pui-safe-top)) 24px max(24px, var(--pui-safe-bottom));\n}\n\nhtml body [class*='VOzbGW_mask'] {\n  inset: 0;\n  background: var(--dsw-alias-bg-mask-1);\n  backdrop-filter: none;\n}\n\nhtml body [class*='VOzbGW_panel'] {\n  box-sizing: border-box;\n  width: min(880px, calc(100vw - 48px));\n  height: min(800px, calc(100dvh - 48px));\n  border: 0;\n  border-radius: var(--pui-overlay-panel-radius);\n  background: var(--dsw-alias-bg-layer-2);\n  box-shadow: var(--pui-overlay-shadow);\n  --dsw-elevation-stroke-color: var(--pui-border-hover);\n  color: var(--dsw-alias-label-primary);\n  animation: pui-overlay-in var(--pui-duration-panel) var(--pui-ease-out);\n  overscroll-behavior: contain;\n}\n\nhtml body [class~='VOzbGW_nav'] {\n  width: 200px;\n  gap: var(--pui-space-lg);\n  padding: var(--pui-space-xl) var(--pui-space-md) 0;\n  border-right: 1px solid var(--dsw-alias-border-l1);\n}\n\nhtml body [class*='VOzbGW_navTitle'] {\n  padding: 0 var(--pui-space-md);\n  font-size: 16px;\n  font-weight: 600;\n  letter-spacing: -0.01em;\n  line-height: 24px;\n}\n\nhtml body [class*='VOzbGW_navList'] {\n  gap: 2px;\n}\n\nhtml body [class*='VOzbGW_navCell'] {\n  height: 38px;\n  border-radius: var(--pui-radius-md);\n  padding: 8px var(--pui-space-md);\n  gap: var(--pui-space-sm);\n  color: var(--dsw-alias-label-secondary);\n  font-size: 13.5px;\n  transition: background-color var(--pui-duration-press) var(--pui-ease-out),\n    color var(--pui-duration-press) var(--pui-ease-out);\n}\n\nhtml body [class*='VOzbGW_navCell'][class*='VOzbGW_active'] {\n  background: var(--dsw-specific-sidebar-nav-item-active);\n  color: var(--dsw-alias-label-primary);\n  font-weight: 500;\n  box-shadow: inset 2px 0 0 var(--dsw-specific-sidebar-nav-item-active-accent);\n}\n\nhtml body [class*='VOzbGW_navIcon'] {\n  color: var(--dsw-alias-menu-icon);\n}\n\nhtml body [class*='VOzbGW_navCell'][class*='VOzbGW_active'] [class*='VOzbGW_navIcon'] {\n  color: var(--dsw-alias-label-primary);\n}\n\nhtml body [class*='VOzbGW_header'] {\n  height: 56px;\n  padding: var(--pui-space-xl) var(--pui-space-md) var(--pui-space-sm) var(--pui-space-xl);\n  align-items: center;\n}\n\nhtml body [class*='VOzbGW_close'] {\n  width: 32px;\n  height: 32px;\n  border-radius: var(--pui-radius-sm);\n  transition: background-color var(--pui-duration-press) var(--pui-ease-out);\n}\n\nhtml body [class*='VOzbGW_options'] {\n  padding: 0 var(--pui-space-xl) var(--pui-space-xl);\n  overscroll-behavior: contain;\n}\n\nhtml body [class*='VOzbGW_content'] {\n  min-width: 0;\n}\n\n/* ---------------------------------------------------------------------\n * 4. Dropdown menus / popovers\n * ------------------------------------------------------------------- */\n/* Both menu engines share the surface + material pair:\n *   anchor-positioned  → [class*='_surface_ri079_']\n *   portal             → [class*='_list_4ub78_'][class*='_portal_4ub78_']\n * The blur is applied to the material layer only, so text never gets blurred\n * and the surface stays crisp on top of video/canvas content. */\nhtml body [class*='_surface_ri079_'] {\n  border: 0;\n  border-radius: var(--pui-overlay-menu-radius);\n  background: transparent;\n  box-shadow: none;\n  color: var(--dsw-alias-label-primary);\n  isolation: isolate;\n}\n\nhtml body [class*='_material_ri079_'] {\n  border-radius: inherit;\n  background: var(--pui-overlay-menu-fill);\n  -webkit-backdrop-filter: var(--pui-overlay-blur);\n  backdrop-filter: var(--pui-overlay-blur);\n  box-shadow: var(--pui-overlay-shadow);\n  --dsw-elevation-stroke-color: var(--pui-border-hover);\n}\n\n/* Fallback for a menu shell rendered without the shared material layer (e.g. a\n * future refactor): the shell itself carries the same material so menus never\n * turn into transparent, unreadable floating text. */\nhtml body :is(\n    [class*='_list_4ub78_'],\n    [class*='_7KE1Ra_menu'],\n    [class*='_3e4SsG_menu']\n  ):not(:has([class*='_material_ri079_'])) {\n  background: var(--pui-overlay-menu-fill);\n  -webkit-backdrop-filter: var(--pui-overlay-blur);\n  backdrop-filter: var(--pui-overlay-blur);\n  box-shadow: var(--pui-overlay-shadow);\n  --dsw-elevation-stroke-color: var(--pui-border-hover);\n}\n\nhtml body [class*='_list_4ub78_'],\nhtml body [class*='_submenu_4ub78_'] {\n  box-sizing: border-box;\n  border: 0;\n  border-radius: var(--pui-overlay-menu-radius);\n  padding: var(--pui-overlay-menu-pad);\n  gap: 0;\n  /* The fill + blur + shadow live on the shared [_material_ri079_] layer so\n   * there is exactly one translucent material per menu. */\n  background: transparent;\n  box-shadow: none;\n  color: var(--dsw-alias-label-primary);\n  z-index: 1100;\n}\n\nhtml body [class*='_list_4ub78_'] [class*='_material_ri079_'] {\n  box-shadow: none;\n}\n\nhtml body [class*='_portal_4ub78_'] {\n  position: fixed;\n  z-index: 1100;\n  max-width: min(360px, calc(100vw - 16px));\n}\n\nhtml body [class*='_scrollable_4ub78_'] {\n  max-height: min(calc(100dvh - 24px), 640px);\n}\n\nhtml body [class*='_viewport_4ub78_'] {\n  min-height: 0;\n}\n\n/* Feature menu shells (same material, one consistent radius). */\nhtml body [class*='moreMenu'],\nhtml body [class*='signedOutMenu'],\nhtml body [class*='viewsMoreMenu'],\nhtml body [class*='viewOptionsMenu'],\nhtml body [class*='zoomMenu'] {\n  border-radius: var(--pui-overlay-menu-radius);\n  padding: var(--pui-overlay-menu-pad);\n  background: transparent;\n  box-shadow: none;\n}\n\n/* ---- menu rows ------------------------------------------------------ */\nhtml body [class*='_itemWrap_4ub78_'] {\n  position: relative;\n}\n\nhtml body [class*='_item_4ub78_'],\nhtml body [class~='_7KE1Ra_option'],\nhtml body [class~='_7KE1Ra_option'],\nhtml body [class~='_7KE1Ra_cell'],\nhtml body [class~='_3e4SsG_item'] {\n  box-sizing: border-box;\n  min-height: var(--pui-overlay-item-height);\n  border: 0;\n  border-radius: var(--pui-overlay-item-radius);\n  padding: 6px 10px;\n  gap: var(--pui-space-sm);\n  color: var(--dsw-alias-label-primary);\n  font-size: 13px;\n  line-height: 20px;\n  cursor: pointer;\n  touch-action: manipulation;\n  transition: background-color var(--pui-duration-press) var(--pui-ease-out),\n    color var(--pui-duration-press) var(--pui-ease-out);\n  -webkit-tap-highlight-color: transparent;\n}\n\nhtml body [class*='_item_4ub78_'][class*='_itemWrap_4ub78_'],\nhtml body [class*='_item_4ub78_'] [class*='_itemWrap_4ub78_'] {\n  border-radius: var(--pui-overlay-item-radius);\n}\n\nhtml body [class*='_item_4ub78_']:is([aria-checked='true'], [aria-selected='true'], [class*='_selected_4ub78_']) {\n  background: var(--pui-overlay-selected);\n  color: var(--dsw-alias-label-primary);\n}\n\nhtml body [class*='_selectedFill_4ub78_'] {\n  background: var(--pui-overlay-selected);\n}\n\nhtml body [class*='_item_4ub78_']:focus-visible,\nhtml body [class~='_7KE1Ra_option']:focus-visible,\nhtml body [class~='_7KE1Ra_cell']:focus-visible,\nhtml body [class~='_3e4SsG_item']:focus-visible,\nhtml body [role='menuitem']:focus-visible,\nhtml body [role='menuitemradio']:focus-visible,\nhtml body [role='menuitemcheckbox']:focus-visible,\nhtml body [role='option']:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color, var(--pui-accent-sky));\n  outline-offset: -2px;\n}\n\nhtml body [class*='_item_4ub78_']:disabled,\nhtml body [class~='_7KE1Ra_option']:disabled,\nhtml body [class~='_7KE1Ra_cell']:disabled {\n  opacity: 0.42;\n  cursor: not-allowed;\n  color: var(--dsw-alias-label-dimmed);\n}\n\nhtml body [class*='_itemIcon_4ub78_'],\nhtml body [class*='_3e4SsG_itemIcon'] {\n  color: var(--dsw-alias-menu-icon);\n  width: 16px;\n  height: 16px;\n}\n\nhtml body [class*='_itemIcon_4ub78_'] svg {\n  width: 16px;\n  height: 16px;\n}\n\nhtml body [class*='_itemLabel_4ub78_'],\nhtml body [class*='_3e4SsG_itemName'] {\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  font-weight: 400;\n}\n\nhtml body [class*='_item_4ub78_']:is([class*='_selected_4ub78_'], [aria-checked='true'])\n  [class*='_itemLabel_4ub78_'] {\n  font-weight: 500;\n}\n\nhtml body [class*='_check_4ub78_'],\nhtml body [class*='_7KE1Ra_check'] {\n  color: var(--dsw-alias-state-business-primary);\n  flex: 0 0 16px;\n}\n\nhtml body [class*='_check_4ub78_'] svg,\nhtml body [class*='_7KE1Ra_check'] svg {\n  width: 14px;\n  height: 14px;\n}\n\nhtml body [class*='_danger_4ub78_'],\nhtml body [class*='_danger_4ub78_'] [class*='_itemIcon_4ub78_'] {\n  color: var(--dsw-alias-state-error-primary);\n}\n\nhtml body [class*='_label_4ub78_'],\nhtml body [class*='_3e4SsG_sectionTitle'],\nhtml body [class*='_3e4SsG_groupTitle'] {\n  padding: 6px 10px 4px;\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 11px;\n  font-weight: 500;\n  letter-spacing: 0.02em;\n  line-height: 16px;\n  text-transform: none;\n}\n\nhtml body [class*='_separator_4ub78_'] {\n  height: 1px;\n  margin: var(--pui-space-xs) 6px;\n  background: var(--dsw-alias-border-l1);\n}\n\nhtml body [class*='_shortcut_4ub78_'] [class*='_shortcutKeys_4ub78_'],\nhtml body [class*='_shortcutKeys_4ub78_'] {\n  color: var(--dsw-alias-label-caption);\n  font-family: var(--pui-font-mono);\n  font-size: 10.5px;\n  font-variant-numeric: tabular-nums;\n  line-height: 16px;\n}\n\nhtml body [class*='_footer_4ub78_'] {\n  margin-top: var(--pui-space-xs);\n  padding-top: var(--pui-space-xs);\n  border-top: 1px solid var(--dsw-alias-border-l1);\n}\n\nhtml body [class*='_submenu_4ub78_'] {\n  left: calc(100% + 8px);\n  border-radius: var(--pui-overlay-menu-radius);\n  min-width: 168px;\n}\n\n/* Hover only where hovering is a real input modality. */\n@media (hover: hover) {\n  html body [class*='_item_4ub78_']:hover:not(:disabled),\n  html body [class~='_7KE1Ra_option']:hover:not(:disabled),\n  html body [class~='_7KE1Ra_option']:hover:not(:disabled),\n  html body [class~='_7KE1Ra_cell']:hover:not(:disabled),\n  html body [class~='_3e4SsG_item']:hover:not(:disabled),\n  html body [role='menuitem']:hover:not(:disabled),\n  html body [role='option']:hover:not(:disabled) {\n    background: var(--dsw-alias-interactive-bg-hover);\n  }\n\n  html body [class*='_danger_4ub78_']:hover:not(:disabled) {\n    background: var(--pui-overlay-danger);\n  }\n\n  html body [class*='VOzbGW_navCell']:hover:not([class*='VOzbGW_active']) {\n    background: var(--dsw-alias-interactive-bg-hover);\n    color: var(--dsw-alias-label-primary);\n  }\n\n  html body [class*='_close_o6lrb_']:hover,\n  html body [class*='VOzbGW_close']:hover {\n    background: var(--dsw-alias-interactive-bg-hover);\n    color: var(--dsw-alias-label-primary);\n  }\n\n  html body [class*='_7KE1Ra_trigger']:hover:not(:disabled),\n  html body [class*='_7KE1Ra_searchClear']:hover {\n    background: var(--dsw-alias-interactive-bg-hover);\n  }\n}\n\n/* ---- model / reasoning menu (7KE1Ra_* anchor-positioned) ------------- */\nhtml body [class*='_7KE1Ra_menu'] {\n  z-index: 1100;\n  box-sizing: border-box;\n  width: max-content;\n  min-width: min(248px, calc(100vw - 24px));\n  max-width: min(420px, calc(100vw - 24px));\n  max-height: min(360px, calc(100dvh - 96px));\n  padding: var(--pui-overlay-menu-pad);\n  border: 0;\n  border-radius: var(--pui-overlay-menu-radius);\n  background: transparent;\n  box-shadow: none;\n  color: var(--dsw-alias-label-primary);\n  overflow: hidden;\n}\n\nhtml body [class*='_7KE1Ra_cellValue'] {\n  color: var(--dsw-alias-label-tertiary);\n  font-variant-numeric: tabular-nums;\n}\n\nhtml body [class*='_7KE1Ra_cellChevron'],\nhtml body [class*='_7KE1Ra_chevron'] {\n  color: var(--dsw-alias-menu-icon);\n}\n\nhtml body [class*='_7KE1Ra_status'],\nhtml body [class*='_7KE1Ra_empty'] {\n  padding: var(--pui-space-sm) var(--pui-space-md);\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 12px;\n  line-height: 18px;\n}\n\nhtml body [class*='_7KE1Ra_error'] {\n  border-radius: var(--pui-radius-md);\n  background: var(--dsw-alias-interactive-bg-hover-danger);\n  color: var(--dsw-alias-state-error-primary);\n  font-size: 11.5px;\n  line-height: 17px;\n}\n\nhtml body [class*='_7KE1Ra_warning'] {\n  border-radius: var(--pui-radius-md);\n  background: var(--dsw-alias-state-warn-tertiary);\n  color: var(--dsw-alias-state-warn-label);\n  font-size: 11.5px;\n  line-height: 17px;\n}\n\nhtml body [class*='_7KE1Ra_search'] {\n  border-radius: var(--pui-radius-sm);\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n\nhtml body [class*='_7KE1Ra_groups'] {\n  overscroll-behavior: contain;\n}\n\n/* ---- slash / command surface (3e4SsG_* — dsh-client-ui-input-trigger) -\n * This one is not a portal: it is absolutely positioned above the composer\n * and must never exceed the composer width. */\nhtml body [class*='_3e4SsG_menu'] {\n  z-index: 100;\n  box-sizing: border-box;\n  max-height: min(400px, 52dvh);\n  padding: var(--pui-overlay-menu-pad);\n  border: 0;\n  border-radius: var(--pui-radius-card);\n  background: transparent;\n  box-shadow: none;\n  color: var(--dsw-alias-label-primary);\n  overflow: hidden;\n}\n\nhtml body [class*='_3e4SsG_menu']::after {\n  background: linear-gradient(to bottom, transparent, var(--pui-overlay-menu-fill));\n}\n\nhtml body [class*='_3e4SsG_viewport'] {\n  overscroll-behavior: contain;\n  min-height: 0;\n}\n\nhtml body [class~='_3e4SsG_item'][class*='_3e4SsG_active'],\nhtml body [class~='_3e4SsG_item'][aria-selected='true'] {\n  background: var(--pui-overlay-selected);\n}\n\nhtml body [class*='_3e4SsG_itemName'] {\n  font-weight: 500;\n}\n\nhtml body [class*='_3e4SsG_itemAlias'] {\n  color: var(--dsw-alias-label-caption);\n  font-family: var(--pui-font-mono);\n  font-size: 11px;\n}\n\nhtml body [class*='_3e4SsG_itemDescription'] {\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 12px;\n}\n\nhtml body [class*='_3e4SsG_drill'] {\n  border-radius: var(--pui-radius-xs);\n  color: var(--dsw-alias-menu-icon);\n}\n\nhtml body [class*='_3e4SsG_crumbs'] {\n  border-bottom: 1px solid var(--dsw-alias-border-l1);\n  margin-bottom: var(--pui-space-xs);\n  padding: var(--pui-space-xs);\n}\n\nhtml body [class*='_3e4SsG_crumb'] {\n  border-radius: var(--pui-radius-xs);\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 11px;\n}\n\nhtml body [class*='_3e4SsG_crumbCurrent'] {\n  color: var(--dsw-alias-label-primary);\n}\n\n/* ---------------------------------------------------------------------\n * 5. Tooltips\n * ------------------------------------------------------------------- */\nhtml body [class*='_bubble_44yfq_'],\nhtml body [role='tooltip'] {\n  z-index: 1300;\n  max-width: min(320px, calc(100vw - 24px));\n  padding: 5px 9px;\n  border: 0;\n  border-radius: var(--pui-radius-sm);\n  background: var(--dsw-alias-tooltip-bg);\n  color: var(--pui-text-primary);\n  font-size: 12px;\n  line-height: 18px;\n  letter-spacing: 0.005em;\n  box-shadow: var(--dsw-shadow-lv2);\n  pointer-events: none;\n  -webkit-backdrop-filter: none;\n  backdrop-filter: none;\n}\n\nhtml body [class*='_bubble_44yfq_'][data-has-shortcut] {\n  padding-inline-end: 6px;\n}\n\nhtml body [class*='_label_44yfq_'] {\n  min-width: 0;\n}\n\nhtml body [class*='_key_38b9q_'],\nhtml body [class*='_joined_38b9q_'] {\n  min-width: 18px;\n  height: 18px;\n  padding: 0 4px;\n  border: 0;\n  border-radius: var(--pui-radius-xs);\n  background: var(--dsw-alias-tooltip-key-bg);\n  color: var(--dsw-alias-tooltip-label, var(--pui-text-primary));\n  font-family: var(--pui-font-mono);\n  font-size: 10.5px;\n  line-height: 18px;\n  text-align: center;\n}\n\n/* ---------------------------------------------------------------------\n * 6. Toasts\n * ------------------------------------------------------------------- */\nhtml body [class*='_toast_l6cvn_'],\nhtml body [role='alert'][class*='_toast'] {\n  top: calc(40px + var(--pui-safe-top));\n  z-index: 1400;\n  box-sizing: border-box;\n  max-width: min(640px, calc(100vw - 32px));\n  padding: 12px 16px;\n  gap: var(--pui-space-md);\n  border: 0;\n  border-radius: var(--pui-radius-input);\n  background: var(--dsw-alias-toast-bg);\n  color: var(--dsw-alias-toast-label);\n  font-size: 13.5px;\n  line-height: 21px;\n  box-shadow: var(--dsw-shadow-lv3);\n  --dsw-elevation-stroke-color: var(--pui-border-hover);\n}\n\nhtml body [class*='_icon_l6cvn_'] {\n  color: var(--dsw-alias-state-warn-primary);\n}\n\nhtml body [class*='_icon_l6cvn_'][class*='_success_l6cvn_'] {\n  color: var(--dsw-alias-state-success-primary);\n}\n\nhtml body [class*='_text_l6cvn_'] {\n  min-width: 0;\n  color: var(--dsw-alias-toast-label);\n}\n\nhtml body [class*='_action_l6cvn_'] {\n  margin-inline: var(--pui-space-xs);\n  border: 0;\n  background: none;\n  color: var(--dsw-alias-link);\n  font: inherit;\n  font-weight: 500;\n  text-decoration: underline;\n  text-decoration-color: color-mix(in srgb, var(--dsw-alias-link) 45%, transparent);\n  text-underline-offset: 3px;\n  cursor: pointer;\n  pointer-events: auto;\n}\n\n@media (hover: hover) {\n  html body [class*='_action_l6cvn_']:hover {\n    text-decoration-color: currentColor;\n  }\n}\n\n/* ---------------------------------------------------------------------\n * 7. Skeletons — honest loading placeholders, never fake percentages\n * ------------------------------------------------------------------- */\nhtml body :is(\n    [class*='_skeletonBar'],\n    [class*='_skeletonFill'],\n    [class*='_skeletonDot'],\n    [class*='_skeletonTitle'],\n    [class*='_skeletonHeading'],\n    [class*='_skeletonText'],\n    [class*='_skeletonDescription'],\n    [class*='_skeletonIcon']\n  ) {\n  background: var(--dsw-alias-bg-skeleton);\n  border-radius: var(--pui-radius-xs);\n}\n\nhtml body :is([class*='_skeletonTitle'], [class*='_skeletonHeading'], [class*='_skeletonIcon']) {\n  border-radius: var(--pui-radius-sm);\n}\n\nhtml body :is([class*='_skeletonBar'], [class*='_skeletonFill']) {\n  animation: pui-skeleton-pulse 1.8s var(--pui-ease-standard) infinite;\n}\n\n@keyframes pui-skeleton-pulse {\n  0%,\n  100% {\n    opacity: 1;\n  }\n  50% {\n    opacity: 0.55;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html body :is([class*='_skeletonBar'], [class*='_skeletonFill']) {\n    animation: none;\n  }\n}\n\n/* ---------------------------------------------------------------------\n * 8. Empty / no-result / offline / error panels\n * ------------------------------------------------------------------- */\nhtml body :is(\n    [class*='_empty'],\n    [class*='_emptyState'],\n    [class*='_emptyLine'],\n    [class*='_emptyTitle']\n  ) {\n  color: var(--dsw-alias-label-tertiary);\n}\n\nhtml body :is(\n    [class*='_emptyState'],\n    [class*='_empty'],\n    [class*='_candidateEmpty'],\n    [class*='_modelEmpty']\n  ):not(button) {\n  font-size: 13px;\n  line-height: 20px;\n}\n\nhtml body :is([class*='_emptyIcon'], [class*='_emptyStateIcon']) {\n  color: var(--dsw-alias-label-caption);\n  opacity: 0.8;\n}\n\nhtml body :is([class*='_emptyTitle']) {\n  color: var(--dsw-alias-label-secondary);\n  font-size: 13.5px;\n  font-weight: 500;\n}\n\nhtml body :is([class*='_emptyAction'], [class*='_emptyStateAction']) {\n  min-height: 32px;\n  border-radius: var(--pui-radius-sm);\n  padding: 4px 10px;\n  color: var(--dsw-alias-label-primary);\n  font-size: 12.5px;\n}\n\n@media (hover: hover) {\n  html body :is([class*='_emptyAction'], [class*='_emptyStateAction']):hover {\n    background: var(--dsw-alias-interactive-bg-hover);\n  }\n}\n\n/* Error lines and error banners: colour + weight, never colour alone — DSH\n * pairs them with an icon and text. */\nhtml body :is([class*='toastError'], [class*='_7KE1Ra_error'], [class*='_errorText']) {\n  color: var(--dsw-alias-state-error-primary);\n}\n\nhtml body :is([class*='toastError'], [class*='toastSuccess']) {\n  border-radius: var(--pui-radius-md);\n}\n\nhtml body :is([class*='_errorBanner'], [class*='_errorPanel'], [class*='_offline'], [class*='_offlineBanner']) {\n  border-radius: var(--pui-radius-card);\n  border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 32%, transparent);\n  background: var(--dsw-alias-interactive-bg-hover-danger);\n  color: var(--dsw-alias-state-error-primary);\n  padding: var(--pui-space-md) var(--pui-space-lg);\n}\n\n/* ---------------------------------------------------------------------\n * 9. Coarse pointers — 44px rows, hit-area expansion, no hover-only actions\n * ------------------------------------------------------------------- */\n@media (pointer: coarse) {\n  html body [class*='_item_4ub78_'],\n  html body [class~='_7KE1Ra_option'],\n  html body [class~='_7KE1Ra_option'],\n  html body [class~='_7KE1Ra_cell'],\n  html body [class~='_3e4SsG_item'] {\n    min-height: var(--pui-overlay-item-height-touch);\n    padding-block: 10px;\n  }\n\n  /* Small visual buttons (close, search clear) keep a 44px hit target without\n   * growing their painted size. */\n  html body :is([class*='_close_o6lrb_'], [class*='VOzbGW_close'], [class*='_7KE1Ra_searchClear']) {\n    position: relative;\n  }\n\n  html body :is([class*='_close_o6lrb_'], [class*='VOzbGW_close'], [class*='_7KE1Ra_searchClear'])::after {\n    content: '';\n    position: absolute;\n    inset: -8px;\n    border-radius: var(--pui-radius-md);\n  }\n\n  html body [class*='_action_l6cvn_'] {\n    min-height: 32px;\n    padding-inline: 4px;\n  }\n}\n\n/* ---------------------------------------------------------------------\n * 10. Small screens — overlays become sheets, never wider than the viewport\n * ------------------------------------------------------------------- */\n@media (max-width: 767px) {\n  html body [class*='_root_o6lrb_'] {\n    padding: var(--pui-safe-top) var(--pui-safe-right) var(--pui-safe-bottom) var(--pui-safe-left);\n    align-items: flex-end;\n  }\n\n  html body [class*='_dialog_o6lrb_'] {\n    width: 100%;\n    max-width: 100%;\n    max-height: min(86dvh, 720px);\n    border-radius: var(--pui-radius-panel) var(--pui-radius-panel) 0 0;\n    padding-bottom: calc(var(--pui-space-xl) + var(--pui-safe-bottom));\n  }\n\n  html body [class*='_header_o6lrb_'] {\n    padding: var(--pui-space-lg) var(--pui-space-md) var(--pui-space-sm) var(--pui-space-lg);\n  }\n\n  html body [class*='_body_o6lrb_'],\n  html body [class*='_description_o6lrb_'],\n  html body [class*='_footer_o6lrb_'] {\n    padding-inline: var(--pui-space-lg);\n  }\n\n  html body [class*='VOzbGW_overlay'] {\n    padding: var(--pui-safe-top) 0 0;\n    align-items: flex-end;\n  }\n\n  html body [class*='VOzbGW_panel'] {\n    /* Bottom sheet: nav becomes a horizontal tab strip above the content, so\n     * the panel itself must switch from desktop row layout to column. */\n    flex-direction: column;\n    width: 100%;\n    max-width: 100%;\n    height: min(88dvh, 800px);\n    border-radius: var(--pui-radius-panel) var(--pui-radius-panel) 0 0;\n  }\n\n  html body [class~='VOzbGW_nav'] {\n    width: 100%;\n    flex: none;\n    flex-direction: row;\n    gap: var(--pui-space-xs);\n    padding: var(--pui-space-sm) var(--pui-space-sm) 0;\n    border-right: 0;\n    overflow-x: auto;\n    scrollbar-width: none;\n  }\n\n  html body [class~='VOzbGW_nav']::-webkit-scrollbar {\n    display: none;\n  }\n\n  /* The settings title stays on the sheet: it is the accessible name of the\n   * dialog (aria-labelledby) and gives the sheet an identity. */\n  html body [class*='VOzbGW_navTitle'] {\n    flex: none;\n    padding: 0 8px 0 4px;\n    font-size: 15px;\n    line-height: 20px;\n    align-self: center;\n  }\n\n  html body [class*='VOzbGW_navList'] {\n    flex-direction: row;\n    gap: var(--pui-space-xs);\n  }\n\n  html body [class*='VOzbGW_navCell'] {\n    flex: none;\n    min-height: var(--pui-touch-target);\n    padding-inline: var(--pui-space-md);\n    white-space: nowrap;\n  }\n\n  html body [class*='VOzbGW_navCell'][class*='VOzbGW_active'] {\n    box-shadow: none;\n    background: var(--dsw-specific-sidebar-nav-item-active);\n  }\n\n  html body [class*='VOzbGW_content'] {\n    flex: 1;\n    min-height: 0;\n  }\n\n  html body [class*='VOzbGW_header'] {\n    height: auto;\n    padding: var(--pui-space-md) var(--pui-space-md) var(--pui-space-xs) var(--pui-space-lg);\n  }\n\n  html body [class*='VOzbGW_options'] {\n    padding: 0 var(--pui-space-md) calc(var(--pui-space-xl) + var(--pui-safe-bottom));\n  }\n\n  html body [class*='_list_4ub78_'] {\n    border-radius: var(--pui-radius-card);\n  }\n\n  html body [class*='_7KE1Ra_menu'] {\n    max-width: calc(100vw - 16px);\n    max-height: min(360px, calc(100dvh - var(--pui-safe-top) - var(--pui-safe-bottom) - 96px));\n  }\n\n  html body [class*='_3e4SsG_menu'] {\n    max-height: min(360px, 46dvh);\n  }\n\n  /* The toast sits under the status bar, not over the header controls. */\n  html body [class*='_toast_l6cvn_'] {\n    top: calc(12px + var(--pui-safe-top));\n  }\n}\n\n/* ---------------------------------------------------------------------\n * 11. Light theme refinements (tokens already flip; these add contrast)\n * ------------------------------------------------------------------- */\nhtml body:not([data-ds-dark-theme]) :is([class*='_item_4ub78_'], [class~='_3e4SsG_item']) {\n  color: var(--dsw-alias-label-primary);\n}\n\nhtml body:not([data-ds-dark-theme]) :is([class*='_label_4ub78_'], [class*='_3e4SsG_sectionTitle']) {\n  color: var(--dsw-alias-label-tertiary);\n}\n\n\n/* ---------------------------------------------------------------------\n * 12. Sidebar / panel empty states (observed hashes)\n * ------------------------------------------------------------------- */\n/* `bhn1Oq_empty` (sidebar session list \"无匹配会话\") and its action. */\nhtml body [class*='bhn1Oq_empty'] {\n  padding: 28px 12px;\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 12.5px;\n  line-height: 19px;\n  text-align: center;\n}\n\nhtml body [class*='bhn1Oq_emptyAction'] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 32px;\n  margin: 6px auto 0;\n  padding: 0 10px;\n  border-radius: var(--pui-radius-sm);\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12.5px;\n  font-weight: 500;\n  cursor: pointer;\n  transition: background-color var(--pui-duration-press) var(--pui-ease-out),\n    color var(--pui-duration-press) var(--pui-ease-out);\n}\n\n@media (hover: hover) {\n  html body [class*='bhn1Oq_emptyAction']:hover {\n    background: var(--dsw-alias-interactive-bg-hover);\n    color: var(--dsw-alias-label-primary);\n  }\n}\n\nhtml body [class*='bhn1Oq_emptyAction']:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color, var(--pui-accent-sky));\n  outline-offset: 2px;\n}\n","29-session-status":"/* =====================================================================\n * palace-ui / 29 · Phone session-status popover\n * =====================================================================\n * Companion to shell/45-session-status.js. The trigger only exists in the\n * phone layout (the same media query as 30-mobile.css) and fills the header\n * utilities seat; the popover is portalled to <body> and positioned in JS, so\n * every rule that styles it lives outside the narrow media query.\n *\n * Visual language follows the Playground control surface: surface-2 material\n * with the shared floating-menu fill, a hairline border, one elevation stroke,\n * 14px outer radius, 10px inner radius (14 − 4 padding), a 44px touch row and\n * a 4px/−4px entrance. Depth comes from the hairline, not from a glow.\n *\n * Rules honoured: no literal colours (only --pui-* / --dsw-*), no\n * !important, hover only under (hover: hover), focus-visible always present,\n * and the reduced-motion kill-switch in 10-base.css covers both animations.\n * ===================================================================== */\n\n/* ---------------------------------------------------------------------\n * 0. Local component tokens (resolved from the shared token layer)\n * ------------------------------------------------------------------- */\nhtml body {\n  --pui-ss-fill: var(--pui-overlay-menu-fill-strong);\n  --pui-ss-border: var(--pui-overlay-border);\n  --pui-ss-shadow: var(--pui-overlay-shadow);\n  --pui-ss-run: var(--dsw-alias-state-business-primary);\n  --pui-ss-radius: var(--pui-overlay-menu-radius);\n  --pui-ss-ring: var(--dsw-focus-ring-color, var(--pui-accent-sky));\n}\n\n/* ---------------------------------------------------------------------\n * 1. Trigger — phone layout only (matches every rule in 30-mobile.css)\n * ------------------------------------------------------------------- */\n.pui-ss {\n  display: none;\n}\n\n@media (max-width: 767px), (max-width: 1023px) and (max-height: 480px) and (pointer: coarse) {\n  .pui-ss {\n    display: flex;\n    flex: none;\n    align-items: center;\n    /* The utilities row gaps neighbours by 4px; 2px on each side keeps the\n     * 44px targets 8px apart without changing the button box. */\n    margin-inline: 2px;\n    min-width: 0;\n  }\n\n  html body .pui-ss-trigger {\n    position: relative;\n    box-sizing: border-box;\n    display: grid;\n    place-items: center;\n    width: var(--pui-touch-target);\n    height: var(--pui-touch-target);\n    padding: 0;\n    border: 0;\n    border-radius: var(--pui-radius-pill);\n    background: transparent;\n    color: var(--dsw-alias-label-secondary);\n    font: inherit;\n    cursor: pointer;\n    touch-action: manipulation;\n    -webkit-tap-highlight-color: transparent;\n  }\n\n  /* The 44px box is the hit target; the tinted disc stays 32px so the header\n   * row does not read as a second segmented group. */\n  html body .pui-ss-trigger::before {\n    content: '';\n    position: absolute;\n    inset: 6px;\n    border-radius: inherit;\n    background: transparent;\n    transition: background-color var(--pui-duration-press) var(--pui-ease-out);\n  }\n\n  html body .pui-ss-triggerIcon {\n    position: relative;\n    z-index: 1;\n    display: grid;\n    place-items: center;\n  }\n\n  html body .pui-ss-trigger[aria-expanded='true']::before {\n    background: var(--dsw-alias-interactive-bg-active);\n    color: var(--dsw-alias-label-primary);\n  }\n\n  html body .pui-ss-trigger[aria-expanded='true'] {\n    color: var(--dsw-alias-label-primary);\n  }\n\n  html body .pui-ss-trigger:active::before {\n    background: var(--dsw-alias-interactive-bg-active);\n  }\n\n  html body .pui-ss-trigger:focus-visible {\n    outline: 2px solid var(--pui-ss-ring);\n    outline-offset: 2px;\n  }\n\n  /* Running team/subagent work: a dot, never colour alone (the panel spells\n   * the state out in words). */\n  html body .pui-ss-badge {\n    position: absolute;\n    top: 8px;\n    right: 8px;\n    z-index: 2;\n    width: 7px;\n    height: 7px;\n    border-radius: var(--pui-radius-pill);\n    background: var(--pui-ss-run);\n    border: 1.5px solid var(--dsw-alias-bg-base);\n  }\n}\n\n@media (hover: hover) {\n  html body .pui-ss-trigger:hover::before {\n    background: var(--dsw-alias-interactive-bg-hover);\n  }\n}\n\n/* ---------------------------------------------------------------------\n * 2. Popover surface\n * ------------------------------------------------------------------- */\nhtml body .pui-ss-panel {\n  box-sizing: border-box;\n  display: flex;\n  flex-direction: column;\n  z-index: 1100;\n  overflow: hidden;\n  max-width: calc(100vw - 16px - var(--pui-safe-left) - var(--pui-safe-right));\n  border: 1px solid var(--pui-ss-border);\n  border-radius: var(--pui-ss-radius);\n  background: var(--pui-ss-fill);\n  -webkit-backdrop-filter: var(--pui-overlay-blur);\n  backdrop-filter: var(--pui-overlay-blur);\n  box-shadow: var(--pui-ss-shadow);\n  color: var(--dsw-alias-label-primary);\n  font-family: var(--dsw-font-family);\n  animation: pui-ss-in var(--pui-duration-panel) var(--pui-ease-out);\n  transform-origin: top right;\n}\n\nhtml body .pui-ss-panel[data-placement='above'] {\n  animation-name: pui-ss-in-up;\n  transform-origin: bottom right;\n}\n\n/* The panel is a programmatic focus target; its children own every ring. */\nhtml body .pui-ss-panel:focus,\nhtml body .pui-ss-panel:focus-visible {\n  outline: none;\n}\n\n@keyframes pui-ss-in {\n  from {\n    opacity: 0;\n    transform: translateY(-4px) scale(0.985);\n  }\n  to {\n    opacity: 1;\n    transform: none;\n  }\n}\n\n@keyframes pui-ss-in-up {\n  from {\n    opacity: 0;\n    transform: translateY(4px) scale(0.985);\n  }\n  to {\n    opacity: 1;\n    transform: none;\n  }\n}\n\n/* ---- head ---------------------------------------------------------- */\nhtml body .pui-ss-head {\n  display: flex;\n  flex: none;\n  align-items: flex-start;\n  gap: var(--pui-space-sm);\n  padding: 10px 8px 6px 12px;\n}\n\nhtml body .pui-ss-headText {\n  display: flex;\n  flex: 1 1 auto;\n  flex-direction: column;\n  gap: 1px;\n  min-width: 0;\n}\n\nhtml body .pui-ss-eyebrow {\n  color: var(--dsw-alias-label-secondary);\n  font-size: 11px;\n  font-weight: 510;\n  line-height: 14px;\n  letter-spacing: 0.04em;\n}\n\nhtml body .pui-ss-title {\n  overflow: hidden;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12px;\n  line-height: 17px;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\nhtml body .pui-ss-close {\n  position: relative;\n  flex: none;\n  display: grid;\n  place-items: center;\n  width: 36px;\n  height: 36px;\n  margin-top: -2px;\n  padding: 0;\n  border: 0;\n  border-radius: var(--pui-radius-sm);\n  background: transparent;\n  color: var(--dsw-alias-label-secondary);\n  cursor: pointer;\n  touch-action: manipulation;\n  transition:\n    background-color var(--pui-duration-press) var(--pui-ease-out),\n    color var(--pui-duration-press) var(--pui-ease-out);\n}\n\n/* 36px visual + 4px ring = a 44px touch target that never overlaps a row. */\nhtml body .pui-ss-close::after {\n  content: '';\n  position: absolute;\n  inset: -4px;\n  border-radius: inherit;\n}\n\nhtml body .pui-ss-close:active {\n  background: var(--dsw-alias-interactive-bg-active);\n  color: var(--dsw-alias-label-primary);\n}\n\nhtml body .pui-ss-close:focus-visible {\n  outline: 2px solid var(--pui-ss-ring);\n  outline-offset: 0;\n}\n\n/* ---- body ---------------------------------------------------------- */\nhtml body .pui-ss-body {\n  display: flex;\n  flex: 1 1 auto;\n  flex-direction: column;\n  gap: 2px;\n  min-height: 0;\n  padding: 0 var(--pui-space-xs) var(--pui-space-xs);\n  overflow-y: auto;\n  overscroll-behavior: contain;\n  -webkit-overflow-scrolling: touch;\n}\n\n/* ---- summary rows -------------------------------------------------- */\nhtml body .pui-ss-row {\n  box-sizing: border-box;\n  display: flex;\n  flex: none;\n  align-items: center;\n  gap: 10px;\n  width: 100%;\n  min-height: 52px;\n  padding: 6px 8px;\n  border: 0;\n  border-radius: var(--pui-radius-md);\n  background: transparent;\n  color: inherit;\n  font: inherit;\n  text-align: start;\n  cursor: pointer;\n  touch-action: manipulation;\n  -webkit-tap-highlight-color: transparent;\n  transition: background-color var(--pui-duration-press) var(--pui-ease-out);\n}\n\nhtml body .pui-ss-row[data-static='true'] {\n  cursor: default;\n}\n\nhtml body .pui-ss-rowIcon {\n  display: grid;\n  flex: none;\n  place-items: center;\n  width: 30px;\n  height: 30px;\n  border-radius: var(--pui-radius-sm);\n  background: var(--dsw-alias-interactive-bg-hover);\n  color: var(--dsw-alias-label-secondary);\n}\n\nhtml body .pui-ss-row[data-static='true'] .pui-ss-rowIcon {\n  color: var(--dsw-alias-label-secondary);\n  background: transparent;\n  box-shadow: inset 0 0 0 1px var(--pui-border-default);\n}\n\nhtml body .pui-ss-rowMain {\n  display: flex;\n  flex: 1 1 auto;\n  flex-direction: column;\n  gap: 1px;\n  min-width: 0;\n}\n\nhtml body .pui-ss-rowLabel {\n  color: var(--dsw-alias-label-secondary);\n  font-size: 11px;\n  line-height: 14px;\n}\n\nhtml body .pui-ss-rowValue {\n  overflow: hidden;\n  color: var(--dsw-alias-label-primary);\n  font-size: 13px;\n  font-weight: 510;\n  line-height: 18px;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\nhtml body .pui-ss-row[data-static='true'] .pui-ss-rowValue {\n  color: var(--dsw-alias-label-secondary);\n  font-weight: 400;\n}\n\nhtml body .pui-ss-rowDesc {\n  display: -webkit-box;\n  overflow: hidden;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 11px;\n  line-height: 15px;\n  -webkit-box-orient: vertical;\n  -webkit-line-clamp: 2;\n}\n\nhtml body .pui-ss-rowMeta {\n  flex: none;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 11px;\n  line-height: 14px;\n}\n\nhtml body .pui-ss-chevron {\n  display: grid;\n  flex: none;\n  place-items: center;\n  color: var(--dsw-alias-label-secondary);\n  transition: transform var(--pui-duration-hover) var(--pui-ease-out);\n}\n\nhtml body .pui-ss-chevron[data-expanded='true'] {\n  transform: rotate(90deg);\n}\n\nhtml body .pui-ss-row:active:not([data-static='true']) {\n  background: var(--dsw-alias-interactive-bg-active);\n}\n\nhtml body .pui-ss-row[aria-expanded='true'] {\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n\nhtml body .pui-ss-row:focus-visible,\nhtml body .pui-ss-item:focus-visible {\n  outline: 2px solid var(--pui-ss-ring);\n  outline-offset: -2px;\n}\n\n/* ---- inline detail (team roster / subagent catalog) ----------------- */\nhtml body .pui-ss-group {\n  display: flex;\n  flex: none;\n  flex-direction: column;\n  gap: 1px;\n  margin: 0 2px 4px;\n  padding: 2px;\n  border: 0.5px solid var(--pui-border-divider);\n  border-radius: var(--pui-radius-lg);\n  background: var(--dsw-alias-bg-layer-1);\n  animation: pui-ss-group-in 160ms var(--pui-ease-out);\n}\n\n@keyframes pui-ss-group-in {\n  from {\n    opacity: 0;\n    transform: translateY(-2px);\n  }\n  to {\n    opacity: 1;\n    transform: none;\n  }\n}\n\nhtml body .pui-ss-groupHead {\n  display: flex;\n  align-items: baseline;\n  justify-content: space-between;\n  gap: var(--pui-space-sm);\n  padding: 4px 8px 4px;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 11px;\n  line-height: 14px;\n}\n\nhtml body .pui-ss-item {\n  box-sizing: border-box;\n  display: flex;\n  align-items: center;\n  gap: var(--pui-space-sm);\n  width: 100%;\n  min-height: var(--pui-touch-target);\n  padding: 5px 8px;\n  border: 0;\n  border-radius: var(--pui-radius-sm);\n  background: transparent;\n  color: inherit;\n  font: inherit;\n  text-align: start;\n  cursor: pointer;\n  touch-action: manipulation;\n  transition: background-color var(--pui-duration-press) var(--pui-ease-out);\n}\n\nhtml body .pui-ss-item[data-current='true'],\nhtml body .pui-ss-item[data-static='true'] {\n  cursor: default;\n}\n\nhtml body .pui-ss-itemMain {\n  display: flex;\n  flex: 1 1 auto;\n  flex-direction: column;\n  gap: 1px;\n  min-width: 0;\n}\n\nhtml body .pui-ss-itemName {\n  overflow: hidden;\n  color: var(--dsw-alias-label-primary);\n  font-size: 12.5px;\n  line-height: 17px;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\nhtml body .pui-ss-itemMeta {\n  color: var(--dsw-alias-label-secondary);\n  font-size: 11px;\n  line-height: 14px;\n}\n\nhtml body .pui-ss-state {\n  display: inline-flex;\n  flex: none;\n  align-items: center;\n  gap: 4px;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 11px;\n  line-height: 14px;\n  white-space: nowrap;\n}\n\nhtml body .pui-ss-dot {\n  width: 6px;\n  height: 6px;\n  border-radius: var(--pui-radius-pill);\n  background: var(--dsw-alias-state-idle-primary);\n}\n\nhtml body .pui-ss-state[data-state='running'] {\n  color: var(--dsw-alias-label-primary);\n}\n\nhtml body .pui-ss-state[data-state='running'] .pui-ss-dot {\n  background: var(--pui-ss-run);\n}\n\nhtml body .pui-ss-state[data-state='failed'] {\n  color: var(--dsw-alias-state-error-secondary);\n}\n\nhtml body .pui-ss-state[data-state='failed'] .pui-ss-dot {\n  background: var(--dsw-alias-state-error-primary);\n}\n\nhtml body .pui-ss-state[data-state='provisioning'] {\n  color: var(--dsw-alias-state-warn-label);\n}\n\nhtml body .pui-ss-state[data-state='provisioning'] .pui-ss-dot {\n  background: var(--dsw-alias-state-warn-primary);\n}\n\nhtml body .pui-ss-tag {\n  flex: none;\n  padding: 0 6px;\n  border: 0.5px solid var(--pui-border-default);\n  border-radius: var(--pui-radius-pill);\n  color: var(--dsw-alias-label-secondary);\n  font-size: 10px;\n  line-height: 16px;\n}\n\nhtml body .pui-ss-item:active:not([data-current='true']):not([data-static='true']) {\n  background: var(--dsw-alias-interactive-bg-active);\n}\n\n/* ---- notes / empty / error ----------------------------------------- */\nhtml body .pui-ss-note {\n  display: flex;\n  align-items: flex-start;\n  gap: 6px;\n  margin: 2px 6px 6px;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 11px;\n  line-height: 16px;\n}\n\nhtml body .pui-ss-note[data-tone='error'] {\n  color: var(--dsw-alias-state-error-secondary);\n}\n\nhtml body .pui-ss-note[data-tone='warn'] {\n  color: var(--dsw-alias-state-warn-label);\n}\n\nhtml body .pui-ss-noteIcon {\n  display: inline-flex;\n  flex: none;\n  padding-top: 1px;\n}\n\n/* Action suffixes for rows whose accessible name is their own visible text\n * (axe: label-content-name-mismatch). */\nhtml body .pui-ss-sr {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  margin: -1px;\n  padding: 0;\n  overflow: hidden;\n  clip-path: inset(50%);\n  white-space: nowrap;\n  border: 0;\n}\n\n/* ---- foot ---------------------------------------------------------- */\nhtml body .pui-ss-foot {\n  flex: none;\n  padding: 7px 12px 9px;\n  border-top: 0.5px solid var(--pui-border-divider);\n  color: var(--dsw-alias-label-secondary);\n  font-size: 11px;\n  line-height: 15px;\n}\n\n/* The stock 「更多操作」 menu is folded into this panel on phones, so its two\n * Session actions live here as full-width 44px rows above the note. */\nhtml body .pui-ss-footActions {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  margin: 0 0 6px;\n}\n\nhtml body .pui-ss-action {\n  box-sizing: border-box;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  width: 100%;\n  min-height: var(--pui-touch-target);\n  padding: 0 8px;\n  border: 0;\n  border-radius: var(--pui-radius-sm);\n  background: transparent;\n  color: var(--dsw-alias-label-primary);\n  font: inherit;\n  font-size: 13px;\n  line-height: 18px;\n  text-align: start;\n  cursor: pointer;\n  touch-action: manipulation;\n  transition: background-color var(--pui-duration-press) var(--pui-ease-out);\n}\n\nhtml body .pui-ss-action:active {\n  background: var(--dsw-alias-interactive-bg-active);\n}\n\nhtml body .pui-ss-action:focus-visible {\n  outline: 2px solid var(--pui-ss-ring);\n  outline-offset: -2px;\n}\n\nhtml body .pui-ss-footNote {\n  margin: 0;\n}\n\n/* ---- hover-capable pointers only ----------------------------------- */\n@media (hover: hover) {\n  html body .pui-ss-row:hover:not([data-static='true']),\n  html body .pui-ss-item:hover:not([data-current='true']):not([data-static='true']),\n  html body .pui-ss-close:hover,\n  html body .pui-ss-action:hover {\n    background: var(--dsw-alias-interactive-bg-hover);\n  }\n\n  html body .pui-ss-close:hover {\n    color: var(--dsw-alias-label-primary);\n  }\n}\n\n/* ---- forced colours: keep the dot visible without relying on colour -- */\n@media (forced-colors: active) {\n  html body .pui-ss-dot {\n    forced-color-adjust: none;\n    background: CanvasText;\n  }\n\n  html body .pui-ss-panel {\n    border: 1px solid CanvasText;\n  }\n}\n","30-mobile":"/* =====================================================================\n * palace-ui / 30 · Mobile + PWA\n * =====================================================================\n * Phone shell (≤767px, plus landscape phones): 64px tab bar in the layout's\n * own bottom row, ≤56px header built from the native header slots, and a\n * 320px navigation drawer in `shell.overlay`.\n *\n * The layout recipe is the measured one from docs/ui-layout-notes.md §0:\n * zero the sidebar grid track, pin the centre column explicitly, and never\n * `display:none` the sidebar without that pin (the old black screen).\n *\n * Desktop is untouched: every layout rule lives inside the narrow media\n * query and the shell components only mount while matchMedia matches.\n * ===================================================================== */\n\n/* ---------------------------------------------------------------------\n * 1. Narrow layout — one media rule for portrait and landscape phones\n * ------------------------------------------------------------------- */\n@media (max-width: 767px), (max-width: 1023px) and (max-height: 480px) and (pointer: coarse) {\n  /* Dynamic viewport: the app is exactly as tall as the visible page area, so\n   * the composer seat never hides behind the URL bar. `visualViewport` updates\n   * --pui-vv-height while the software keyboard is open (50-mobile.js). */\n  html {\n    height: 100dvh;\n    overflow: hidden;\n    overscroll-behavior: none;\n  }\n\n  html body {\n    box-sizing: border-box;\n    height: 100dvh;\n    overflow: hidden;\n    overflow-x: hidden;\n    overscroll-behavior: none;\n    -webkit-text-size-adjust: 100%;\n  }\n\n  /* The AppFrame writes grid-template-columns inline; only !important wins. */\n  html body .pI_x6G_frame {\n    grid-template-columns: 0 minmax(0, 1fr) minmax(0px, 0px) !important;\n    height: 100dvh;\n    overflow: hidden;\n  }\n\n  /* Pin the real columns even though the sidebar leaves grid flow below. */\n  html body .pI_x6G_frame > .pI_x6G_centerCol {\n    grid-column: 2 !important;\n    min-width: 0;\n  }\n\n  html body .pI_x6G_frame > .pI_x6G_rightbarCol {\n    grid-column: 3 !important;\n    min-width: 0;\n  }\n\n  /* Phone navigation IS the Palace-styled native sidebar, presented as an\n   * overlay drawer: every stock affordance (新建会话, workspace tree, session\n   * rows, settings, search) keeps working instead of being re-implemented in a\n   * second, divergent drawer.\n   *\n   * We position it ourselves rather than relying on the frame's drawer mode,\n   * because the frame decides that from its own viewport width and can stay in\n   * the wide layout (collapsed rail) after a resize. The sidebar's expanded\n   * state (`data-sidebar-collapsed`) is the one thing that is always correct. */\n  html body .pI_x6G_frame:not([data-sidebar-collapsed]) > .pI_x6G_sidebarCol {\n    box-sizing: border-box;\n    display: flex !important;\n    position: fixed !important;\n    inset: 0 auto 0 0 !important;\n    width: min(320px, 88vw) !important;\n    z-index: 80;\n    visibility: visible !important;\n    background: var(--dsw-specific-sidebar-fill) !important;\n    border-right: 0 !important;\n    border-radius: 0 var(--pui-radius-panel) var(--pui-radius-panel) 0;\n    padding-top: var(--pui-safe-top);\n    padding-left: var(--pui-safe-left);\n    padding-bottom: var(--pui-safe-bottom);\n    box-shadow: var(--dsw-shadow-lv3);\n    overflow: hidden;\n  }\n\n  /* Closed rail: the 0px grid track already keeps it out of layout, so it only\n   * has to stop painting and stop taking focus. */\n  html body .pI_x6G_frame[data-sidebar-collapsed] > .pI_x6G_sidebarCol {\n    display: none !important;\n    border-right: 0 !important;\n  }\n\n  /* Phone drawer content: drop desktop-only chrome (shortcut hints) and give\n   * every row a 44px touch target. */\n  html body .pI_x6G_sidebarCol .pui-footer-action {\n    display: none !important;\n  }\n\n  html body .pI_x6G_sidebarCol [role='treeitem'],\n  html body .pI_x6G_sidebarCol [class*='panelRow'],\n  /* Button only: `[class*='newSession']` also matches the nested LabelMask /\n   * Content / Label spans, stretching them to 44px. The label then top-aligns\n   * its single 20px line, dropping the text 12px above the centred icon. */\n  html body .pI_x6G_sidebarCol button[class*='newSession'] {\n    min-height: var(--pui-touch-target);\n  }\n\n  html body .pI_x6G_sidebarCol [role='treeitem'] {\n    padding-block: 6px;\n  }\n\n  /* Tap-outside target for our own drawer (the frame's mask only exists in its\n   * built-in drawer mode). Sits under the drawer, above the app. */\n  .pui-m-sidebar-scrim {\n    position: fixed;\n    inset: 0;\n    z-index: 75;\n    background: var(--dsw-alias-bg-mask-1);\n    animation: pui-m-scrim-in 180ms var(--pui-ease-out) both;\n  }\n\n  @keyframes pui-m-scrim-in {\n    from {\n      opacity: 0;\n    }\n    to {\n      opacity: 1;\n    }\n  }\n\n  html body .pI_x6G_bottomRow {\n    background: transparent;\n    min-height: 0;\n  }\n\n  /* ---- conversation header → compact phone header ------------------ */\n  /* Phone conversation header — total ≈ 100px incl. safe-top:\n   *   safe-top (once, here) + 10px top pad\n   *   + 36px title row (menu button 36px, title ellipsizes in the rest)\n   *   + 8px gap + 44px view-tab row (44px touch targets)\n   *   + 8px bottom pad  ≈ 98px before the notch.\n   * safe-top is applied exactly once, on the padding-top below. */\n  html body .wSkVaW_header {\n    box-sizing: border-box;\n    min-height: 0;\n    padding: calc(var(--pui-safe-top) + 6px) calc(16px + var(--pui-safe-right)) 6px\n      calc(16px + var(--pui-safe-left));\n    /* Row 1: leading | crumbs | utilities. Row 2: the full-width tab strip.\n     * Row 3 only exists when installBadgeRow() moves the badges there. */\n    grid-template-columns: auto minmax(0, 1fr) auto;\n    column-gap: 8px;\n    row-gap: 6px;\n    border-bottom: 0.5px solid var(--dsw-alias-border-l1);\n    min-width: 0;\n    max-width: 100%;\n    overflow: hidden;\n  }\n\n  html body .wSkVaW_headerBlank {\n    box-sizing: border-box;\n    min-height: 0;\n    padding: calc(var(--pui-safe-top) + 10px) calc(16px + var(--pui-safe-right)) 10px\n      calc(16px + var(--pui-safe-left));\n    border-bottom: 0;\n  }\n\n  /* Flatten the title wrappers so crumbs / badges / utilities / tabs become\n   * direct grid items: a nested flex chain squeezed the title to ~68px. */\n  html body .wSkVaW_titleRow,\n  html body .wSkVaW_titleCluster {\n    display: contents;\n  }\n\n  html body .wSkVaW_headerLeading {\n    grid-area: 1 / 1;\n    flex: none;\n    gap: 8px;\n  }\n\n  html body .wSkVaW_crumbs {\n    grid-area: 1 / 2;\n    display: flex;\n    align-items: center;\n    gap: 2px;\n    min-width: 0;\n    flex: 1 1 auto;\n    max-width: 100%;\n  }\n\n  /* Session title: takes all remaining width and ellipsizes cleanly. */\n  html body .wSkVaW_crumb {\n    flex: 0 1 auto;\n    min-width: 0;\n    max-width: 100%;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n    padding: 6px 4px;\n    font-size: 15px;\n    line-height: 24px;\n  }\n\n  html body .wSkVaW_crumbCurrent {\n    flex: 1 1 auto;\n    min-width: 0;\n    font-size: 15px;\n    font-weight: 600;\n    line-height: 24px;\n  }\n\n  html body .wSkVaW_crumbSep {\n    flex: none;\n  }\n\n  /* The mode badge (标准模式 / 计划模式) stays reachable as a compact 24px\n   * chip, but it is `flex:none` on the far side of the title so it never\n   * squeezes the title below its ellipsis width. */\n  html body .SVAs4q_label {\n    flex: none;\n    box-sizing: border-box;\n    height: 24px;\n    padding: 0 8px;\n    gap: 4px;\n    font-size: 11px;\n    white-space: nowrap;\n  }\n\n  html body .SVAs4q_icon {\n    width: 12px;\n    height: 12px;\n  }\n\n  /* The stock \"更多操作\" menu held only Session-log download + feedback, and a\n   * second 44px control next to the Palace status trigger squeezed the title to\n   * ~100px. Both actions now live in the Palace status panel footer, so the\n   * phone header keeps exactly three 44px targets and the stock menu is hidden.\n   * Desktop keeps it untouched. */\n  html body .wSkVaW_headerUtilities button[aria-label='更多操作'],\n  html body .wSkVaW_headerUtilities button[aria-label='More actions'],\n  html body .wSkVaW_headerUtilities [class*='moreButton'] {\n    display: none;\n  }\n\n  html body .wSkVaW_headerUtilities {\n    grid-area: 1 / 3;\n    flex: none;\n    gap: 4px;\n    margin-left: 0;\n    justify-self: end;\n  }\n\n  /* Palace's session-status control owns the narrow mode/team/subagent\n   * entry points. Keep the stock cluster mounted for desktop, without making\n   * the stock generic overflow menu responsible for these missing actions. */\n  html body .wSkVaW_headerActions {\n    display: none;\n  }\n\n  html body .wSkVaW_headerCorner {\n    display: none;\n  }\n\n  /* View tabs: a full-width 44px row, clearly separated from the title. */\n  html body .wSkVaW_tabs {\n    box-sizing: border-box;\n    display: flex;\n    /* Full row width: DSH shows floor((width - 48) / 120) views, so the strip\n     * needs >= 288px to keep 对话 AND 轨迹 visible instead of one + overflow. */\n    grid-area: 2 / 1 / 3 / 4;\n    align-items: center;\n    margin-top: 0;\n    min-height: var(--pui-touch-target);\n    gap: 8px;\n    padding-left: 0;\n    min-width: 0;\n    max-width: 100%;\n    justify-self: start;\n  }\n\n  /* The tab strip's 更多会话视图 only exists to hold views that do not fit, so\n   * it stays hidden while both 对话 and 轨迹 are visible — and comes back\n   * automatically if a build ever ships a third view. */\n  html body .wSkVaW_tabs:has(.wSkVaW_viewTabs > button:nth-child(2):last-child) .wSkVaW_viewsMoreAnchor {\n    display: none;\n  }\n\n  /* Playground pill language: quiet unselected text, a small painted pill,\n   * and a real 44px button box (not overlapping pseudo-element hit areas). */\n  html body .wSkVaW_viewTabs {\n    flex-wrap: nowrap;\n    gap: 8px;\n    padding: 0;\n    min-height: var(--pui-touch-target);\n    min-width: 0;\n    max-width: 100%;\n    box-sizing: border-box;\n    border: 0;\n    background: transparent;\n  }\n\n  html body .wSkVaW_header .wSkVaW_tab {\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    min-width: var(--pui-touch-target);\n    min-height: var(--pui-touch-target);\n    padding: 0 10px;\n    border: 0;\n    border-radius: var(--pui-radius-pill);\n    background: transparent;\n    box-shadow: none;\n    font-size: 12px;\n    line-height: 20px;\n  }\n\n  html body .wSkVaW_header .wSkVaW_tab[aria-selected='true'] {\n    color: var(--pui-text-primary);\n    background: transparent;\n    box-shadow: none;\n  }\n\n  html body .wSkVaW_header .wSkVaW_tab[aria-selected='true'] .wSkVaW_tabLabel {\n    background: var(--pui-surface-3);\n    box-shadow: inset 0 0 0 1px var(--pui-border-default);\n  }\n\n  html body .wSkVaW_header .wSkVaW_tab:active .wSkVaW_tabLabel {\n    background: var(--dsw-alias-interactive-bg-active);\n  }\n\n  @media (hover: hover) {\n    html body .wSkVaW_header .wSkVaW_tab:hover .wSkVaW_tabLabel {\n      background: var(--pui-surface-3);\n    }\n  }\n\n  html body .wSkVaW_tabLabel {\n    max-width: 120px;\n    min-width: 0;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n    padding: 4px 10px;\n    border-radius: var(--pui-radius-pill);\n    font-size: 12px;\n    font-weight: 500;\n    line-height: 20px;\n    transition: background-color var(--pui-duration-hover) var(--pui-ease-out);\n  }\n\n  html body .wSkVaW_viewsMore {\n    flex: none;\n    width: 44px;\n    height: 44px;\n    margin-top: 0;\n  }\n\n\n  /* Desktop-only header affordances: an OS app split or right sidebar cannot\n   * fit a 390px column, and hiding them also kills their 2px divider. */\n  html body .wSkVaW_header [class*='_split'] {\n    display: none !important;\n  }\n\n  html body .wSkVaW_header button[aria-label='用 VS Code 打开'],\n  html body .wSkVaW_header button[aria-label='更多打开方式'],\n  html body .wSkVaW_header button[aria-label='Open in VS Code'],\n  html body .wSkVaW_header button[aria-label='More open options'],\n  html body .wSkVaW_header button[aria-label='打开右侧边栏'],\n  html body .wSkVaW_header button[aria-label='收起右侧边栏'],\n  html body .wSkVaW_header button[aria-label='Open right sidebar'],\n  html body .wSkVaW_header button[aria-label='Collapse right sidebar'] {\n    display: none !important;\n  }\n\n  /* ---- composer seat: only layout padding, no overlap fixes needed ---- */\n  html body .wSkVaW_composerHero {\n    padding-bottom: calc(var(--pui-space-xl) + var(--pui-safe-bottom));\n  }\n\n  /* No bottom tab bar any more, so the composer itself owns the home-indicator\n   * clearance (22-composer consumes this once; never double-count). */\n  html body .wSkVaW_composerSeat {\n    --pui-composer-bottom-clearance: var(--pui-safe-bottom);\n  }\n\n  /* ---- status bar / notch: the tab bar owns the bottom safe area ---- */\n  html[data-pui-keyboard='1'] {\n    height: var(--pui-vv-height, 100dvh);\n  }\n\n  html[data-pui-keyboard='1'] body {\n    height: var(--pui-vv-height, 100dvh);\n  }\n\n  html[data-pui-keyboard='1'] .pI_x6G_frame {\n    height: var(--pui-vv-height, 100dvh);\n  }\n\n  /* Keyboard open: `dvh` does not shrink on Android Chrome, so a menu sized\n   * from it runs under the keyboard. Clamp composer-anchored menus to the\n   * visible viewport (--pui-vv-height) minus the composer seat and scroll\n   * internally, so every option stays visible and tappable. */\n  html[data-pui-keyboard='1'] [class*='_3e4SsG_menu'] {\n    max-height: min(\n      360px,\n      calc(var(--pui-vv-height, 100dvh) - var(--pui-composer-seat-height, 160px) - var(--pui-safe-top) - var(--pui-space-md))\n    );\n    overflow-y: auto;\n    overscroll-behavior: contain;\n  }\n}\n\n/* ---------------------------------------------------------------------\n * 3. Header controls (slots: conversation.header.leading / utilities)\n * ------------------------------------------------------------------- */\n@media (max-width: 767px), (max-width: 1023px) and (max-height: 480px) and (pointer: coarse) {\n  /* The button box itself is 44×44 (QA-measurable hit target); negative block\n   * margins keep its layout box at 30px so the header stays ≤56px. The painted\n   * hover surface is a 28px pseudo-element, not the hit box. */\n  .pui-m-menu {\n    appearance: none;\n    position: relative;\n    display: grid;\n    place-items: center;\n    width: 44px;\n    height: 44px;\n    flex: none;\n    margin: -7px 8px -7px -8px;\n    padding: 0;\n    border: 0;\n    border-radius: 0;\n    background: transparent;\n    color: var(--dsw-alias-label-secondary);\n    cursor: pointer;\n    touch-action: manipulation;\n    -webkit-tap-highlight-color: transparent;\n    transition: color var(--pui-duration-press) var(--pui-ease-out);\n  }\n\n  .pui-m-menu::before {\n    content: '';\n    position: absolute;\n    inset: 8px;\n    border-radius: var(--pui-radius-sm);\n    background: transparent;\n    transition: background-color var(--pui-duration-press) var(--pui-ease-out);\n  }\n\n  .pui-m-menu svg {\n    position: relative;\n    z-index: 1;\n  }\n\n  .pui-m-menu svg {\n    width: 20px;\n    height: 20px;\n    fill: none;\n    stroke: currentColor;\n    stroke-width: 1.7;\n    stroke-linecap: round;\n    stroke-linejoin: round;\n  }\n\n  .pui-m-menu:active,\n  .pui-m-menu[aria-expanded='true'] {\n    color: var(--dsw-alias-label-primary);\n  }\n\n  .pui-m-menu:active::before,\n  .pui-m-menu[aria-expanded='true']::before {\n    background: var(--dsw-alias-interactive-bg-active);\n  }\n\n  /* Two 44×44 tap targets with an 8px gap. The visible \"compact capsule\" is a\n   * 30px-tall pseudo-element behind them, so hit size and painted size are\n   * independent and neither doubles up. */\n  .pui-m-actions {\n    position: relative;\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    padding: 0;\n    margin: -7px 0 -7px 0;\n    border: 0;\n    border-radius: 0;\n    background: transparent;\n    flex: none;\n  }\n\n  .pui-m-actions::before {\n    content: '';\n    position: absolute;\n    top: 7px;\n    bottom: 7px;\n    left: 4px;\n    right: 4px;\n    border: 1px solid var(--dsw-alias-border-l1);\n    border-radius: var(--pui-radius-pill);\n    background: var(--dsw-alias-bg-layer-2);\n    pointer-events: none;\n  }\n\n  .pui-m-actions button {\n    appearance: none;\n    position: relative;\n    z-index: 1;\n    display: grid;\n    place-items: center;\n    width: 44px;\n    height: 44px;\n    padding: 0;\n    border: 0;\n    border-radius: var(--pui-radius-pill);\n    background: transparent;\n    color: var(--dsw-alias-label-secondary);\n    cursor: pointer;\n    touch-action: manipulation;\n    -webkit-tap-highlight-color: transparent;\n    transition: background-color var(--pui-duration-press) var(--pui-ease-out);\n  }\n\n  .pui-m-actions button::after {\n    content: '';\n    position: absolute;\n    inset: 8px;\n    border-radius: var(--pui-radius-pill);\n    background: transparent;\n    transition: background-color var(--pui-duration-press) var(--pui-ease-out);\n  }\n\n  .pui-m-actions button:active::after,\n  .pui-m-actions button[aria-expanded='true']::after {\n    background: var(--dsw-alias-interactive-bg-active);\n  }\n\n  .pui-m-actions button svg {\n    position: relative;\n    z-index: 1;\n  }\n\n  .pui-m-actions button svg {\n    width: 18px;\n    height: 18px;\n    fill: none;\n    stroke: currentColor;\n    stroke-width: 1.7;\n    stroke-linecap: round;\n    stroke-linejoin: round;\n  }\n\n}\n\n@media (hover: hover) {\n  .pui-m-menu:hover,\n  .pui-m-actions button:hover {\n    color: var(--dsw-alias-label-primary);\n  }\n\n  .pui-m-menu:hover::before,\n  .pui-m-actions button:hover::after {\n    background: var(--dsw-alias-interactive-bg-hover);\n  }\n}\n\n/* ---------------------------------------------------------------------\n * 5. Landscape phones — tighter chrome\n * ------------------------------------------------------------------- */\n@media (max-width: 1023px) and (max-height: 480px) and (pointer: coarse) {\n  html body .wSkVaW_header {\n    padding-top: calc(var(--pui-safe-top) + 6px);\n  }\n\n  html body .wSkVaW_titleRow {\n    min-height: 32px;\n  }\n\n  .pui-m-actions button {\n    width: var(--pui-touch-target);\n    height: var(--pui-touch-target);\n  }\n}\n\n/* ---------------------------------------------------------------------\n * 6. PWA / standalone display mode\n * ------------------------------------------------------------------- */\n@media (display-mode: standalone) and (max-width: 767px) {\n  /* Standalone has no URL bar, so the safe-area top is the only chrome offset;\n   * it is already counted once in the header padding. */\n  html body {\n    overscroll-behavior-y: none;\n  }\n\n  /* Long-press/selection rings feel broken inside an installed app. */\n  .pui-m-actions,\n  .pui-m-menu {\n    -webkit-touch-callout: none;\n  }\n}\n\n/* ---------------------------------------------------------------------\n * 7. Reduced motion + coarse-pointer fallbacks\n * ------------------------------------------------------------------- */\n@media (prefers-reduced-motion: reduce) {\n  .pui-m-sidebar-scrim {\n    animation: none;\n  }\n}\n\nhtml[data-palace-motion='reduced'] .pui-m-sidebar-scrim {\n  animation: none;\n}\n","40-palace":"/* =====================================================================\n * palace-ui / 40 · Palace shell components\n * =====================================================================\n * Styles for the Lead-owned shell contributions: brand slots, command palette\n * and the Palace settings row. Component tokens are local (`--pui-c-*`) and\n * resolve from the shared layer; no literal palette values appear below.\n * ===================================================================== */\n\n/* ---------------------------------------------------------------------\n * Brand mark + wordmark (sidebar slots, hero mark)\n * --------------------------------------------------------------------- */\nhtml body .pui-mark {\n  display: block;\n  color: var(--dsw-alias-brand-primary, var(--pui-text-primary));\n}\n\nhtml body .pui-brand-name {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  min-width: 0;\n  color: var(--dsw-alias-label-primary, var(--pui-text-primary));\n  font-family: var(--pui-font-ui);\n  font-size: 15px;\n  font-weight: 600;\n  letter-spacing: -0.01em;\n  line-height: 1;\n}\n\nhtml body .pui-brand-name__text {\n  white-space: nowrap;\n}\n\nhtml body .pui-brand-name__badge {\n  padding: 1px 4px;\n  border: 1px solid var(--dsw-alias-border-l2, var(--pui-border-default));\n  border-radius: 4px;\n  color: var(--dsw-alias-label-tertiary, var(--pui-text-tertiary));\n  font-family: var(--pui-font-mono);\n  font-size: 9.5px;\n  font-weight: 500;\n  letter-spacing: 0.02em;\n  line-height: 1.2;\n  text-transform: uppercase;\n}\n\nhtml body .pui-hero-mark {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  color: var(--dsw-alias-brand-primary, var(--pui-text-primary));\n}\n\n/* ---------------------------------------------------------------------\n * Command palette — floating overlay above every column\n * --------------------------------------------------------------------- */\nhtml body .pui-palette-root {\n  position: fixed;\n  inset: 0;\n  z-index: 60;\n  display: flex;\n  align-items: flex-start;\n  justify-content: center;\n  padding: max(12vh, 64px) 16px 16px;\n  box-sizing: border-box;\n  pointer-events: none;\n}\n\nhtml body .pui-palette-scrim {\n  position: fixed;\n  inset: 0;\n  background: var(--dsw-alias-bg-mask-1, rgba(0, 0, 0, 0.55));\n  pointer-events: auto;\n  animation: pui-fade-in var(--pui-duration-panel) var(--pui-ease-out);\n}\n\nhtml body .pui-palette {\n  position: relative;\n  z-index: 1;\n  display: flex;\n  flex-direction: column;\n  width: min(600px, calc(100vw - 32px));\n  max-height: min(560px, calc(100dvh - 20vh));\n  overflow: hidden;\n  box-sizing: border-box;\n  color: var(--dsw-alias-label-primary, var(--pui-text-primary));\n  background: var(--pui-surface-2);\n  border: 1px solid var(--pui-border-default);\n  border-top-color: var(--pui-border-hover);\n  border-radius: var(--pui-radius-card);\n  box-shadow: var(--dsw-elevation-prominent);\n  pointer-events: auto;\n  animation: pui-palette-in var(--pui-duration-panel) var(--pui-ease-out);\n}\n\n@keyframes pui-palette-in {\n  from {\n    opacity: 0;\n    transform: translateY(-6px) scale(0.985);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0) scale(1);\n  }\n}\n\n@keyframes pui-fade-in {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n\nhtml body .pui-palette-search {\n  display: flex;\n  align-items: center;\n  gap: var(--pui-space-sm);\n  min-height: 52px;\n  padding: 0 var(--pui-space-lg);\n  border-bottom: 1px solid var(--pui-border-divider);\n  flex: none;\n}\n\nhtml body .pui-palette-search__icon {\n  display: inline-flex;\n  color: var(--dsw-alias-label-tertiary, var(--pui-text-tertiary));\n  flex: none;\n}\n\nhtml body .pui-palette-input {\n  flex: 1 1 auto;\n  min-width: 0;\n  height: 36px;\n  border: 0;\n  outline: none;\n  background: transparent;\n  color: var(--dsw-alias-label-primary, var(--pui-text-primary));\n  font-family: var(--pui-font-ui);\n  font-size: 15px;\n  line-height: 1.4;\n}\n\nhtml body .pui-palette-input::placeholder {\n  color: var(--dsw-alias-label-dimmed, var(--pui-text-muted));\n}\n\nhtml body .pui-palette-input:focus-visible {\n  outline: none;\n}\n\nhtml body .pui-palette-search__esc {\n  display: inline-flex;\n  flex: none;\n}\n\nhtml body .pui-palette-kbd {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  min-width: 20px;\n  height: 20px;\n  padding: 0 5px;\n  box-sizing: border-box;\n  border: 1px solid var(--pui-border-default);\n  border-radius: 5px;\n  background: var(--pui-surface-3);\n  color: var(--dsw-alias-label-tertiary, var(--pui-text-tertiary));\n  font-family: var(--pui-font-mono);\n  font-size: 10.5px;\n  font-variant-numeric: tabular-nums;\n  line-height: 1;\n}\n\nhtml body .pui-palette-list {\n  flex: 1 1 auto;\n  min-height: 0;\n  overflow-y: auto;\n  overscroll-behavior: contain;\n  padding: var(--pui-space-sm);\n  scrollbar-width: thin;\n}\n\nhtml body .pui-palette-group {\n  padding: 10px var(--pui-space-sm) 4px;\n  color: var(--dsw-alias-label-tertiary, var(--pui-text-tertiary));\n  font-size: 11px;\n  font-weight: 500;\n  letter-spacing: 0.02em;\n}\n\nhtml body .pui-palette-item {\n  display: flex;\n  align-items: center;\n  gap: var(--pui-space-md);\n  min-height: 40px;\n  padding: 0 var(--pui-space-sm);\n  box-sizing: border-box;\n  border: 1px solid transparent;\n  border-radius: var(--pui-radius-md);\n  color: var(--dsw-alias-label-secondary, var(--pui-text-secondary));\n  font-size: 14px;\n  line-height: 1.4;\n  cursor: pointer;\n  user-select: none;\n  transition:\n    background-color var(--pui-duration-hover) var(--pui-ease-out),\n    color var(--pui-duration-hover) var(--pui-ease-out),\n    border-color var(--pui-duration-hover) var(--pui-ease-out);\n}\n\nhtml body .pui-palette-item--active {\n  background: var(--pui-surface-3);\n  border-color: var(--pui-border-default);\n  color: var(--dsw-alias-label-primary, var(--pui-text-primary));\n}\n\nhtml body .pui-palette-item__icon {\n  display: inline-flex;\n  color: var(--dsw-alias-label-tertiary, var(--pui-text-tertiary));\n  flex: none;\n}\n\nhtml body .pui-palette-item--active .pui-palette-item__icon {\n  color: var(--dsw-alias-label-secondary, var(--pui-text-secondary));\n}\n\nhtml body .pui-palette-item__label {\n  flex: 1 1 auto;\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\nhtml body .pui-palette-item__check {\n  display: inline-flex;\n  color: var(--pui-accent-sky);\n  flex: none;\n}\n\nhtml body .pui-palette-item__hint {\n  color: var(--dsw-alias-label-tertiary, var(--pui-text-tertiary));\n  font-family: var(--pui-font-mono);\n  font-size: 11px;\n  flex: none;\n}\n\nhtml body .pui-palette-empty {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 4px;\n  padding: 36px 16px;\n  text-align: center;\n}\n\nhtml body .pui-palette-empty__title {\n  color: var(--dsw-alias-label-secondary, var(--pui-text-secondary));\n  font-size: 14px;\n  font-weight: 500;\n}\n\nhtml body .pui-palette-empty__hint {\n  color: var(--dsw-alias-label-tertiary, var(--pui-text-tertiary));\n  font-size: 12.5px;\n}\n\nhtml body .pui-palette-footer {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: var(--pui-space-sm);\n  min-height: 38px;\n  padding: 0 var(--pui-space-md);\n  border-top: 1px solid var(--pui-border-divider);\n  color: var(--dsw-alias-label-tertiary, var(--pui-text-tertiary));\n  font-size: 11.5px;\n  flex: none;\n}\n\nhtml body .pui-palette-footer__hints {\n  display: flex;\n  align-items: center;\n  gap: var(--pui-space-md);\n  flex-wrap: wrap;\n}\n\nhtml body .pui-palette-footer__hints > span {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n}\n\nhtml body .pui-palette-footer__brand {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  color: var(--dsw-alias-label-tertiary, var(--pui-text-tertiary));\n  font-family: var(--pui-font-mono);\n  font-size: 10.5px;\n  letter-spacing: 0.01em;\n}\n\nhtml body .pui-palette-footer__brand .pui-palette-kbd {\n  font-size: 9.5px;\n}\n\n/* Touch: the palette is a desktop chord, but it must stay usable if opened on\n * a tablet with a hardware keyboard and tapped. */\n@media (pointer: coarse) {\n  html body .pui-palette-item {\n    min-height: var(--pui-touch-target);\n  }\n}\n\n@media (max-width: 767px) {\n  html body .pui-palette-root {\n    padding: calc(var(--pui-safe-top) + 8px) 8px calc(var(--pui-safe-bottom) + 8px);\n    align-items: stretch;\n  }\n  html body .pui-palette {\n    width: 100%;\n    max-height: none;\n    height: 100%;\n    border-radius: var(--pui-radius-panel);\n  }\n  html body .pui-palette-footer {\n    display: none;\n  }\n}\n\n/* ---------------------------------------------------------------------\n * Settings → General → Palace 界面 row\n * --------------------------------------------------------------------- */\nhtml body .pui-setting-row {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: var(--pui-space-lg);\n  padding: 14px 2px;\n  border-top: 1px solid var(--dsw-alias-border-l1, var(--pui-border-divider));\n}\n\nhtml body .pui-setting-row__body {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  min-width: 0;\n}\n\nhtml body .pui-setting-row__title {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  color: var(--dsw-alias-label-primary, var(--pui-text-primary));\n  font-size: 14px;\n  font-weight: 500;\n  line-height: 1.4;\n}\n\nhtml body .pui-setting-row__mark {\n  display: inline-flex;\n  color: var(--dsw-alias-label-tertiary, var(--pui-text-tertiary));\n}\n\nhtml body .pui-setting-row__badge {\n  padding: 0 4px;\n  border: 1px solid var(--dsw-alias-border-l2, var(--pui-border-default));\n  border-radius: 4px;\n  color: var(--dsw-alias-label-tertiary, var(--pui-text-tertiary));\n  font-family: var(--pui-font-mono);\n  font-size: 9.5px;\n  font-weight: 500;\n  line-height: 1.4;\n}\n\nhtml body .pui-setting-row__desc {\n  max-width: 46ch;\n  color: var(--dsw-alias-label-tertiary, var(--pui-text-tertiary));\n  font-size: 12.5px;\n  line-height: 1.5;\n}\n\nhtml body .pui-setting-row__controls {\n  display: flex;\n  flex-wrap: wrap;\n  gap: var(--pui-space-sm) var(--pui-space-lg);\n  justify-content: flex-end;\n  flex: none;\n}\n\nhtml body .pui-segment {\n  display: flex;\n  align-items: center;\n  gap: var(--pui-space-sm);\n}\n\nhtml body .pui-segment__label {\n  color: var(--dsw-alias-label-tertiary, var(--pui-text-tertiary));\n  font-size: 12px;\n  white-space: nowrap;\n}\n\nhtml body .pui-segment__track {\n  display: inline-flex;\n  align-items: center;\n  gap: 2px;\n  padding: 2px;\n  background: var(--pui-surface-2);\n  border: 1px solid var(--dsw-alias-border-l2, var(--pui-border-default));\n  border-radius: var(--pui-radius-sm);\n}\n\nhtml body .pui-segment__option {\n  appearance: none;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 26px;\n  padding: 0 10px;\n  border: 1px solid transparent;\n  border-radius: 6px;\n  background: transparent;\n  color: var(--dsw-alias-label-secondary, var(--pui-text-secondary));\n  font: inherit;\n  font-size: 12px;\n  font-weight: 500;\n  line-height: 1;\n  white-space: nowrap;\n  cursor: pointer;\n  transition:\n    background-color var(--pui-duration-hover) var(--pui-ease-out),\n    color var(--pui-duration-hover) var(--pui-ease-out);\n}\n\nhtml body .pui-segment__option:hover {\n  color: var(--dsw-alias-label-primary, var(--pui-text-primary));\n}\n\nhtml body .pui-segment__option--on {\n  background: var(--pui-surface-4);\n  border-color: var(--pui-border-hover);\n  color: var(--dsw-alias-label-primary, var(--pui-text-primary));\n}\n\nhtml body .pui-segment__option:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: 1px;\n}\n\n@media (max-width: 767px) {\n  html body .pui-setting-row {\n    flex-direction: column;\n    gap: var(--pui-space-md);\n  }\n  html body .pui-setting-row__controls {\n    justify-content: flex-start;\n  }\n  html body .pui-segment__option {\n    min-height: 32px;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html body .pui-palette,\n  html body .pui-palette-scrim {\n    animation: none;\n  }\n}\n\n/* ---------------------------------------------------------------------\n * Sidebar footer action (command palette entry)\n * --------------------------------------------------------------------- */\nhtml body .pui-footer-action {\n  appearance: none;\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  max-width: 100%;\n  min-height: 30px;\n  padding: 0 8px;\n  box-sizing: border-box;\n  border: 1px solid transparent;\n  border-radius: var(--pui-radius-sm);\n  background: transparent;\n  color: var(--dsw-alias-label-tertiary, var(--pui-text-tertiary));\n  font: inherit;\n  font-size: 12.5px;\n  font-weight: 500;\n  line-height: 1;\n  cursor: pointer;\n  transition:\n    background-color var(--pui-duration-hover) var(--pui-ease-out),\n    color var(--pui-duration-hover) var(--pui-ease-out),\n    border-color var(--pui-duration-hover) var(--pui-ease-out);\n}\n\nhtml body .pui-footer-action:hover {\n  background: var(--pui-surface-3);\n  border-color: var(--pui-border-default);\n  color: var(--dsw-alias-label-primary, var(--pui-text-primary));\n}\n\nhtml body .pui-footer-action:active {\n  background: var(--pui-surface-4);\n}\n\nhtml body .pui-footer-action:focus-visible {\n  outline: 2px solid var(--dsw-focus-ring-color);\n  outline-offset: 1px;\n}\n\nhtml body .pui-footer-action__label {\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\nhtml body .pui-footer-action__kbd {\n  flex: none;\n  color: var(--dsw-alias-label-tertiary, var(--pui-text-tertiary));\n  font-family: var(--pui-font-mono);\n  font-size: 10px;\n  letter-spacing: 0.02em;\n}\n\n@media (pointer: coarse) {\n  html body .pui-footer-action {\n    min-height: var(--pui-touch-target);\n    min-width: var(--pui-touch-target);\n    justify-content: center;\n  }\n}\n\n/* ---------------------------------------------------------------------\n * Coarse-pointer hit areas for the settings steppers (Lead layer)\n * ---------------------------------------------------------------------\n * These stock controls are 12-24px tall inside a settings row; on touch\n * pointers the button box is raised to 44x44 with negative margins so the row\n * does not grow. Header utilities are intentionally left stock: on phones the\n * Palace mobile shell replaces the header with 44px controls, and at tablet\n * widths the header row is dense desktop chrome.\n */\n@media (pointer: coarse) {\n  html body button[aria-label='增大字号'],\n  html body button[aria-label='Increase font size'],\n  html body button[aria-label='减小字号'],\n  html body button[aria-label='Decrease font size'],\n  html body button[aria-label='更多字体设置'],\n  html body button[aria-label='More font settings'] {\n    position: relative;\n    z-index: 3;\n    min-width: var(--pui-touch-target);\n    min-height: var(--pui-touch-target);\n    margin: -6px;\n    box-sizing: border-box;\n  }\n}\n"};

    const STYLE_PREFIX = 'palace-ui-style-';
    const OPTIONS_KEY = 'palace-ui:options';
    const DEFAULT_OPTIONS = { density: 'comfortable', motion: 'system', radius: 'soft' };

    const sheets = [];
    const disposers = [];
    /** Runtime handles shared with slot components (set in apply). */
    let RT = null;

    /* ---- shell/00-mount.js ---- */
/**
 * mountShell — the single entry point the plugin's apply() calls.
 *
 * Each shell/*.js file adds one `mount*` function here (brand, palette,
 * settings, mobile, pwa). Keep them idempotent and disposable: DSH can unload a
 * plugin fiber without reloading the page.
 */
function mountShell({ ctx, RT, h, React, register, setOption, disposers }) {
  const contributions = [
    ['brand', typeof mountBrand === 'function' ? mountBrand : null],
    ['footer', typeof mountFooterAction === 'function' ? mountFooterAction : null],
    ['palette', typeof mountCommandPalette === 'function' ? mountCommandPalette : null],
    ['settings', typeof mountSettings === 'function' ? mountSettings : null],
    ['chrome', typeof mountChrome === 'function' ? mountChrome : null],
    ['sessionStatus', typeof mountSessionStatus === 'function' ? mountSessionStatus : null],
    ['mobile', typeof mountMobile === 'function' ? mountMobile : null],
    ['a11y', typeof mountA11y === 'function' ? mountA11y : null],
  ];
  for (const [name, mount] of contributions) {
    if (!mount) continue;
    try {
      const dispose = mount({
        ctx,
        RT,
        h,
        React,
        register: (slot, options, component) => register(ctx, slot, options, component),
        setOption,
        disposers,
      });
      if (typeof dispose === 'function') disposers.push(dispose);
    } catch (err) {
      console.warn(`[palace-ui] shell/${name} failed`, err);
    }
  }
}

/* ---- shell/05-icons.js ---- */
/**
 * Shared inline icon set (Lucide-style 24×24 geometry, currentColor, 1.6px
 * stroke). Kept as data so every shell contribution draws the same language
 * without pulling a package into the client module.
 */
const PUI_ICON_PATHS = {
  command:
    'M9 6a3 3 0 1 0-3 3h3V6zm0 12a3 3 0 1 1-3-3h3v3zm6-12a3 3 0 1 1 3 3h-3V6zm0 12a3 3 0 1 0 3-3h-3v3zM9 9h6v6H9z',
  plus: 'M12 5v14M5 12h14',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z',
  palette:
    'M12 21a9 9 0 1 1 0-18c4.97 0 9 3.58 9 8 0 2.5-2 4-4 4h-2.5a2 2 0 0 0-1.5 3.3A1.8 1.8 0 0 1 12 21zM7.5 11.5h.01M10.5 7.5h.01M15 7.5h.01M17 11.5h.01',
  panels:
    'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM9 5v14',
  calendar:
    'M4 6h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM8 3v4M16 3v4M3 11h18',
  sidebar:
    'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM8.5 5v14',
  moon: 'M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  monitor: 'M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8 20h8M12 16v4',
  arrowUp: 'M12 19V5M6 11l6-6 6 6',
  copy: 'M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1',
  check: 'M20 6 9 17l-5-5',
  x: 'M18 6 6 18M6 6l12 12',
  chevronDown: 'M6 9l6 6 6-6',
  chevronRight: 'M9 6l6 6-6 6',
  file: 'M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7zM14 3v4h4',
  folder: 'M3 7a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',
  terminal: 'M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM7 10l3 3-3 3M13 16h4',
  keyboard:
    'M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM7 10h.01M10 10h.01M13 10h.01M16 10h.01M8 14h8',
  sparkles:
    'M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6zM18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z',
  zap: 'M13 2 4 14h6l-1 8 9-12h-6z',
  message: 'M21 12a8 8 0 0 1-8 8H5l-2 2V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  users:
    'M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 20v-2a4 4 0 0 0-3-3.87M16 2.13a4 4 0 0 1 0 7.75',
  archive:
    'M4 4h16v4H4zM5 8h14v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1zM10 12h4',
  pin: 'M12 17v5M9 3h6l-1 6 3 3H7l3-3z',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4M12 17h.01',
};

/** Render one shared icon as a React element. */
function puiIcon(name, size, extra) {
  const path = PUI_ICON_PATHS[name] || PUI_ICON_PATHS.help;
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
      ...(extra || {}),
    },
    h('path', { d: path }),
  );
}

/* ---- shell/10-brand.js ---- */
/**
 * Brand slots: the stock DeepSeek whale becomes the Palace arch mark. These
 * slots are `single`/`root`; priority −1 shadows the shipped occupant without
 * touching the surrounding chrome.
 */
function mountBrand({ h, React, register }) {
  const Mark = ({ size }) =>
    h(
      'svg',
      {
        className: 'pui-mark',
        width: size || 22,
        height: size || 22,
        viewBox: '0 0 24 24',
        fill: 'none',
        'aria-hidden': 'true',
        focusable: 'false',
      },
      h('path', {
        d: 'M5.5 20V11.5a6.5 6.5 0 0 1 13 0V20',
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round',
      }),
      h('path', {
        d: 'M9.25 20v-5.1a2.75 2.75 0 0 1 5.5 0V20',
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round',
        opacity: 0.55,
      }),
      h('path', {
        d: 'M3.5 20h17',
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round',
      }),
    );

  const Name = () =>
    h(
      'span',
      { className: 'pui-brand-name' },
      h('span', { className: 'pui-brand-name__text' }, 'Palace'),
      h('span', { className: 'pui-brand-name__badge', 'aria-hidden': 'true' }, 'UI'),
    );

  register('sidebar.brand.mark', { priority: -1 }, Mark);
  register('sidebar.brand.name', { priority: -1 }, Name);
  register('conversation.hero.brand.mark', { priority: -1 }, ({ size, className }) =>
    h('span', { className: `pui-hero-mark ${className || ''}`.trim() }, h(Mark, { size: size || 34 })),
  );
}

/* ---- shell/15-footer.js ---- */
/**
 * Sidebar footer action: a discoverable entry point for the command palette.
 *
 * The palette also listens for this event, so the footer button and the
 * ⌘K/Ctrl+K chord share one code path. In the collapsed rail the button stays
 * icon-only (DSH owns the rail geometry; the aria-label is always present).
 */
function mountFooterAction({ h, register }) {
  const openPalette = () => {
    window.dispatchEvent(new CustomEvent('palace-ui:open-palette'));
  };

  const FooterAction = ({ wide }) =>
    h(
      'button',
      {
        type: 'button',
        className: 'pui-footer-action',
        onClick: openPalette,
        'aria-label': '命令面板（Ctrl K）',
        title: wide ? undefined : '命令面板',
      },
      puiIcon('command', 16),
      wide ? h('span', { className: 'pui-footer-action__label' }, '命令') : null,
      wide ? h('span', { className: 'pui-footer-action__kbd', 'aria-hidden': 'true' }, 'Ctrl K') : null,
    );

  register('sidebar.footer.action', { id: 'palace-palette', order: 10 }, FooterAction);
}

/* ---- shell/20-palette.js ---- */
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

/* ---- shell/30-settings.js ---- */
/**
 * Settings → General → "Palace 界面" row.
 *
 * `settings.general.item` is the additive seat for one preference row; the row
 * draws its own internals and writes through our local options store. Values
 * persist in localStorage and apply as `html[data-palace-*]` attributes.
 */
function mountSettings({ RT, h, React, register }) {
  const { useEffect, useState } = React;

  const SEGMENTS = [
    {
      id: 'density',
      label: '密度',
      options: [
        { value: 'comfortable', label: '舒适' },
        { value: 'compact', label: '紧凑' },
      ],
    },
    {
      id: 'radius',
      label: '圆角',
      options: [
        { value: 'soft', label: '柔和' },
        { value: 'crisp', label: '紧凑' },
      ],
    },
    {
      id: 'motion',
      label: '动效',
      options: [
        { value: 'system', label: '跟随系统' },
        { value: 'reduced', label: '减弱' },
      ],
    },
  ];

  function PalaceSettingsRow() {
    const [options, setOptions] = useState(() => (RT ? { ...RT.options } : {}));
    useEffect(() => {
      if (!RT) return undefined;
      return RT.subscribe(() => setOptions({ ...RT.options }));
    }, []);

    return h(
      'div',
      { className: 'pui-setting-row', 'data-palace-settings': '' },
      h(
        'div',
        { className: 'pui-setting-row__body' },
        h(
          'div',
          { className: 'pui-setting-row__title' },
          h('span', { className: 'pui-setting-row__mark' }, puiIcon('sparkles', 14)),
          h('span', null, 'Palace 界面'),
          h('span', { className: 'pui-setting-row__badge' }, 'UI'),
        ),
        h(
          'div',
          { className: 'pui-setting-row__desc' },
          '界面密度、圆角风格与非必要动效。偏好保存在本机浏览器，不会同步到服务端。',
        ),
      ),
      h(
        'div',
        { className: 'pui-setting-row__controls' },
        SEGMENTS.map((segment) =>
          h(
            'div',
            { className: 'pui-segment', key: segment.id, role: 'group', 'aria-label': segment.label },
            h('span', { className: 'pui-segment__label' }, segment.label),
            h(
              'div',
              { className: 'pui-segment__track', role: 'radiogroup', 'aria-label': segment.label },
              segment.options.map((option) =>
                h(
                  'button',
                  {
                    key: option.value,
                    type: 'button',
                    role: 'radio',
                    'aria-checked': options[segment.id] === option.value ? 'true' : 'false',
                    className:
                      options[segment.id] === option.value
                        ? 'pui-segment__option pui-segment__option--on'
                        : 'pui-segment__option',
                    onClick: () => {
                      if (!RT) return;
                      RT.setOption(segment.id, option.value);
                      setOptions({ ...RT.options });
                    },
                  },
                  option.label,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  register('settings.general.item', { id: 'palace-ui', order: 50 }, PalaceSettingsRow);
}

/* ---- shell/45-session-status.js ---- */
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

/* ---- shell/50-mobile.js ---- */
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

/* ---- shell/60-a11y.js ---- */
/**
 * Keyboard access for the stock session tree.
 *
 * DSH renders session rows as `role="treeitem" tabindex="-1"` with a click
 * handler, so with a keyboard the list is unreachable (no roving tabindex in
 * the stock package). This enhancement is DOM-only and idempotent:
 *   - every session row becomes tabbable (tabindex=0)
 *   - Enter / Space activates the row (same path as a click)
 *   - ArrowUp / ArrowDown move between rows, Home / End jump to the ends
 *   - a MutationObserver re-applies after React re-renders
 * It never re-implements opening logic and removes nothing on dispose besides
 * its listeners/observer (the rows are owned by DSH).
 */
function mountA11y({ disposers }) {
  const ROW = '[role="treeitem"]';
  const attached = new WeakSet();
  const touched = new Set();
  let scheduled = false;
  let observer = null;

  const rows = () => {
    const sidebar = document.querySelector('[data-slot="sidebar"]');
    if (!sidebar) return [];
    return [...sidebar.querySelectorAll(ROW)].filter((row) => row.getClientRects().length > 0);
  };

  const focusRow = (row) => {
    row.setAttribute('tabindex', '0');
    row.focus({ preventScroll: false });
  };

  const onKeyDown = (event) => {
    const row = event.currentTarget;
    const list = rows();
    const index = list.indexOf(row);
    if (index < 0) return;
    switch (event.key) {
      case 'Enter':
      case ' ':
      case 'Spacebar':
        event.preventDefault();
        row.click();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (list[index + 1]) focusRow(list[index + 1]);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (list[index - 1]) focusRow(list[index - 1]);
        break;
      case 'Home':
        event.preventDefault();
        focusRow(list[0]);
        break;
      case 'End':
        event.preventDefault();
        focusRow(list[list.length - 1]);
        break;
      default:
        break;
    }
  };

  const apply = () => {
    scheduled = false;
    if (!document.documentElement.classList.contains('palace-ui')) return;
    for (const row of rows()) {
      const ti = row.getAttribute('tabindex');
      if (ti === null || ti === '-1') row.setAttribute('tabindex', '0');
      if (attached.has(row)) continue;
      attached.add(row);
      touched.add(row);
      row.addEventListener('keydown', onKeyDown);
    }
  };

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(apply);
  };

  observer = new MutationObserver(schedule);
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['tabindex', 'role', 'data-sidebar-collapsed', 'aria-expanded'],
  });
  schedule();
  // Re-apply when the sidebar is expanded/collapsed (rows remount).
  window.addEventListener('palace-ui:rows-changed', schedule);

  dispose();
  function dispose() {
    disposers.push(() => {
      if (observer) observer.disconnect();
      window.removeEventListener('palace-ui:rows-changed', schedule);
      for (const row of touched) {
        try {
          row.removeEventListener('keydown', onKeyDown);
        } catch {
          /* row already replaced by React */
        }
      }
      touched.clear();
    });
  }
}


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
