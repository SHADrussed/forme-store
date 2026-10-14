import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const out = path.resolve('../portfolio/screenshots');
const qa = path.resolve('../portfolio/qa');
await mkdir(out, { recursive: true });
await mkdir(qa, { recursive: true });
let executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
if (!executablePath && process.platform === 'win32') {
  const cache = path.join(process.env.LOCALAPPDATA, 'ms-playwright');
  const versions = (await readdir(cache)).filter(x => /^chromium-\d+$/.test(x)).sort().reverse();
  if (versions.length) executablePath = path.join(cache, versions[0], 'chrome-win64/chrome.exe');
}
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const report = { date: new Date().toISOString(), browser: browser.version(), baseURL: process.env.PREVIEW_URL || 'http://127.0.0.1:5173', checks: [], errors: [], screenshots: [] };
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
const page = await context.newPage();
page.on('pageerror', e => report.errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') report.errors.push(m.text()); });
page.on('response', r => { if (r.status() >= 400) report.errors.push(`${r.status()} ${r.url()}`); });
async function settle() {
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(img => img.decode().catch(() => {}))); });
}
async function shot(name, fullPage = false) { await settle(); await page.screenshot({ path: path.join(out, name), fullPage, animations: 'disabled' }); report.screenshots.push(name); }
async function layout(width) {
  const result = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, broken: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src) }));
  assert.equal(result.document, result.viewport, `Horizontal overflow at ${width}`);
  assert.deepEqual(result.broken, [], `Broken images at ${width}`);
  report.checks.push({ name: `layout-${width}`, ...result });
}
async function accessibility(name) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  report.checks.push({ name, violations: result.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.map(n => ({ html:n.html, summary:n.failureSummary })) })) });
  return result.violations;
}
try {
  await page.goto(report.baseURL, { waitUntil: 'networkidle' });
  await settle();
  await layout(1440);
  await shot('forme-desktop-1440-hero.png');
  await shot('forme-desktop-1440-full.png', true);
  await page.locator('#collection').scrollIntoViewIfNeeded();
  await page.evaluate(() => document.getElementById('collection').scrollIntoView());
  await shot('forme-desktop-1440-catalog.png');
  await accessibility('axe-desktop');
  await page.getByRole('button', { name: 'Сумки', exact:true }).click();
  assert.equal(await page.locator('.product').count(), 1);
  assert.match(await page.locator('.product-name').innerText(), /Weekend/);
  await page.getByRole('button', { name: 'Рюкзаки', exact:true }).click();
  assert.match(await page.locator('.product-name').innerText(), /Daily/);
  await page.getByRole('button', { name: 'Аксессуары', exact:true }).click();
  assert.match(await page.locator('.product-name').innerText(), /Pocket/);
  await page.getByRole('button', { name: 'Всё' }).click();
  assert.equal(await page.locator('.product').count(), 3);
  await page.getByRole('button', { name: 'Добавить в избранное: Daily / 01', exact:true }).click();
  assert.equal(await page.locator('.count').innerText(), '1');
  await page.getByRole('button', { name: 'Избранное, товаров: 1' }).click();
  assert.equal(await page.locator('.product').count(), 1);
  await page.getByRole('button', { name: 'Убрать из избранного: Daily / 01', exact:true }).click();
  assert.equal(await page.locator('.empty-state').count(), 1);
  await page.getByRole('button', { name: 'Вернуться к коллекции' }).click();
  await page.getByRole('button', { name: 'Подробнее: Pocket / 03' }).click();
  assert.equal(await page.locator('dialog').evaluate(d => d.open), true);
  await shot('forme-desktop-1440-product.png');
  await accessibility('axe-product-dialog');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => Boolean(document.activeElement.closest('dialog'))), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('dialog').evaluate(d => d.open), false);
  assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), 'Подробнее: Pocket / 03');
  await page.getByRole('button', { name: 'Связаться с FORME' }).click();
  assert.equal(await page.getByText('Это демонстрационный сайт вымышленного бренда.', {exact:false}).isVisible(), true);
  await page.getByRole('button', { name: 'Понятно' }).click();
  report.checks.push({ name: 'interactions', passed: ['3 category filters', 'reset filter', 'favorite add/remove/count', 'favorites empty state', 'product dialog', 'dialog focus trap and Escape', 'focus restored', 'contact dialog'] });
  await page.setViewportSize({ width:390, height:844 });
  await page.goto(report.baseURL, { waitUntil:'networkidle' });
  await settle(); await layout(390);
  await shot('forme-mobile-390-hero.png');
  await shot('forme-mobile-390-full.png', true);
  await accessibility('axe-mobile');
  await page.getByRole('button', {name:'Открыть меню'}).click();
  assert.equal(await page.locator('#mobile-menu').isVisible(), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('button', {name:'Открыть меню'}).getAttribute('aria-expanded'), 'false');
  await page.getByRole('button', {name:'Открыть меню'}).click();
  await page.locator('#mobile-menu').getByRole('link', {name:'Коллекция'}).click();
  assert.equal(await page.locator('#mobile-menu').count(), 0);
  assert.match(page.url(), /#collection$/);
  await page.getByRole('button', {name:'Подробнее: Daily / 01'}).click();
  assert.equal(await page.locator('dialog').evaluate(d => d.open), true);
  await shot('forme-mobile-390-product.png');
  await accessibility('axe-mobile-dialog');
  await page.keyboard.press('Escape');
  report.checks.push({name:'mobile-interactions', passed:['menu toggle', 'Escape and focus', 'anchor navigation', 'product dialog']});
  for (const width of [320,375,768,1024,1920]) { await page.setViewportSize({width,height:900}); await settle(); await layout(width); }
  await page.goto(`${report.baseURL}/credits.html`);
  assert.equal(await page.title(), 'Источники изображений — FORME DEMO');
  report.checks.push({name:'credits-page', passed:true});
  assert.deepEqual(report.errors, []);
  assert.equal(report.checks.filter(c => c.violations?.length).length, 0, 'Accessibility violations — see report');
  report.success = true;
} catch (error) { report.success = false; report.failure = error.stack; process.exitCode = 1; }
finally { await writeFile(path.join(qa, 'browser-report.json'), JSON.stringify(report,null,2)); console.log(JSON.stringify(report,null,2)); await browser.close(); }

