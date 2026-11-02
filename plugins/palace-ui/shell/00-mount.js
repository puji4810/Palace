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
