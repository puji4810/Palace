#!/usr/bin/env node
/*
 * Builds `client.js` from `client.template.js` + `styles/*.css`.
 *
 * The DSH client-module loader has no bundler: the browser receives client.js
 * verbatim, so the stylesheets are inlined into the served module as a JS map
 * (`STYLES`) in filename order. Keeping CSS in real .css files gives editors
 * and reviewers proper tooling; `node scripts/build.mjs --watch` regenerates on
 * change.
 *
 * Usage:
 *   node scripts/build.mjs          # one shot
 *   node scripts/build.mjs --watch  # rebuild on style/template change
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const styleDir = path.join(root, 'styles');
const shellDir = path.join(root, 'shell');
const templatePath = path.join(root, 'client.template.js');
const outPath = path.join(root, 'client.js');
const PLACEHOLDER = '/*__PALACE_UI_STYLES__*/';
const SHELL_PLACEHOLDER = '/*__PALACE_UI_SHELL__*/';

function build() {
  const files = fs
    .readdirSync(styleDir)
    .filter((f) => f.endsWith('.css'))
    .sort();
  const styles = {};
  for (const file of files) {
    const id = file.replace(/\.css$/, '');
    const css = fs.readFileSync(path.join(styleDir, file), 'utf8');
    styles[id] = css;
  }
  const shellFiles = fs
    .readdirSync(shellDir)
    .filter((f) => f.endsWith('.js'))
    .sort();
  const shell = shellFiles
    .map((file) => `/* ---- shell/${file} ---- */\n${fs.readFileSync(path.join(shellDir, file), 'utf8')}`)
    .join('\n');
  const template = fs.readFileSync(templatePath, 'utf8');
  if (!template.includes(PLACEHOLDER)) {
    throw new Error(`client.template.js is missing ${PLACEHOLDER}`);
  }
  if (!template.includes(SHELL_PLACEHOLDER)) {
    throw new Error(`client.template.js is missing ${SHELL_PLACEHOLDER}`);
  }
  const out = template
    .replace(PLACEHOLDER, () => JSON.stringify(styles))
    .replace(SHELL_PLACEHOLDER, () => shell);
  fs.writeFileSync(outPath, out);
  const bytes = Buffer.byteLength(out);
  const cssBytes = Object.values(styles).reduce((n, s) => n + Buffer.byteLength(s), 0);
  console.log(
    `[palace-ui] built client.js (${files.length} sheets, ${(cssBytes / 1024).toFixed(1)} KiB CSS, ${(bytes / 1024).toFixed(1)} KiB total)`,
  );
  return files;
}

build();

if (process.argv.includes('--watch')) {
  let timer = null;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        build();
      } catch (err) {
        console.error('[palace-ui] build failed:', err.message);
      }
    }, 80);
  };
  fs.watch(styleDir, schedule);
  fs.watchFile(templatePath, schedule);
  console.log('[palace-ui] watching styles/ and client.template.js');
}
