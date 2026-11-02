import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const pick = async (page, comboLabel, optionText) => { await page.getByRole("combobox", { name: comboLabel }).click(); await page.getByRole("option", { name: optionText, exact: true }).click(); };
const browser = await chromium.launch({
  executablePath: '/opt/google/chrome/chrome',
  headless: true,
  args: ['--no-sandbox'],
});
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await mkdir('screenshots', { recursive: true });
const results = [];
try {
  for (const [name, width, height] of [
    ['desktop', 1440, 1000],
    ['tablet', 834, 1112],
    ['mobile', 390, 844],
    ['landscape', 844, 390],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto('http://127.0.0.1:3090/');
    await page.locator('h1').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `screenshots/${name}.png`, fullPage: name === 'mobile' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert.equal(overflow, false, `${name} horizontal overflow`);
    results.push({ name, overflow });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('http://127.0.0.1:3090/');
  await page.getByRole('textbox', { name: '搜索组件', exact: true }).fill('no-match-xyz');
  await page.getByText('没有找到相关组件').waitFor();
  await page.getByRole('button', { name: '清除搜索', exact: true }).click();
  assert.equal(await page.locator('main > section').count(), 8);
  await page.keyboard.press('Control+k');
  await page.getByRole('dialog', { name: 'Command palette' }).waitFor();
  await page.getByRole('textbox', { name: '命令搜索' }).fill('buttons');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /Buttons/ })
    .click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await pick(page, '按钮预览状态', 'disabled');
  assert.equal(await page.locator('.button-variants button:disabled').count(), 4);
  await pick(page, '按钮预览状态', 'default');
  await page.locator('#surfaces').getByRole('button', { name: '打开' }).nth(1).click();
  await page.getByRole('dialog', { name: '创建工作区' }).waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('dialog', { name: '创建工作区' }).waitFor({ state: 'hidden' });
  await page.locator('#surfaces').getByRole('button', { name: '打开' }).nth(0).click();
  await page.getByText('工作区偏好', { exact: true }).waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '触发 Toast', exact: true }).click();
  await page.locator('.toast-live').waitFor();
  await pick(page, 'Conversation sample', 'Empty sample');
  await page.getByText('A fresh starting point').waitFor();
  await page.getByRole('button', { name: /Plan a calmer workspace/ }).click();
  await page.locator('.ai-root textarea').waitFor();
  const send = page.locator('.ai-composer').getByRole('button', { name: /send/i });
  await send.click();
  await page.waitForTimeout(250);
  await page.locator('.ai-composer').getByRole('button', { name: /stop/i }).click();
  await page.locator('.ai-agent').getByRole('button', { name: 'Refuse', exact: true }).click();
  await page.locator('.ai-agent > .ai-panel-head').getByText('Cancelled', { exact: true }).waitFor();
  await page.locator('.ai-agent').getByRole('radio', { name: 'Awaiting approval', exact: true }).click();
  await page.getByRole('button', { name: 'Approve demo', exact: true }).click();
  await page.locator('.ai-agent > .ai-panel-head').getByText('Completed', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Hide steps', exact: true }).click();
  assert.equal(await page.locator('.ai-timeline').isVisible(), false);
  await page.getByLabel('Filter sample files').fill('xyz-no-file');
  await page
    .locator('.ai-data-table tbody tr')
    .filter({ hasText: /no/i })
    .waitFor()
    .catch(() => {});
  await page.getByLabel('Filter sample files').fill('');
  await page.locator('.ai-data-table').getByRole('button', { name: 'Size', exact: true }).click();
  assert.equal(await page.locator('.ai-data-table th').nth(1).getAttribute('aria-sort'), 'ascending');
  await pick(page, 'Conversation sample', 'Ready sample');
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  results.push({
    axe: axe.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
    })),
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:3090/');
  await page.getByRole('button', { name: '打开分类导航' }).click();
  await page
    .getByRole('dialog', { name: '组件分类' })
    .getByRole('button', { name: /AI Components/ })
    .click();
  await page.getByRole('dialog', { name: '组件分类' }).waitFor({ state: 'hidden' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const duration = await page
    .locator('.btn')
    .first()
    .evaluate((e) => getComputedStyle(e).transitionDuration);
  results.push({ reducedMotion: duration });
  results.push({ errors });
  await writeFile('test-results.json', JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  assert.equal(errors.length, 0);
  assert.equal(axe.violations.length, 0, 'Accessibility violations must be resolved');
} finally {
  await browser.close();
}
