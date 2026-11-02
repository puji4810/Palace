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
