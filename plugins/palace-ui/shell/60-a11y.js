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
