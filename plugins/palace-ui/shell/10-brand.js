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
