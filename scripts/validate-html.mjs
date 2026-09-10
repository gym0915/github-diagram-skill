#!/usr/bin/env node
/**
 * validate-html.mjs
 * 校验最终蓝图 HTML 的结构与数据完整性。
 * 用法：node scripts/validate-html.mjs output/<descriptive-name>.html
 *
 * 校验项：
 * 1. <script> 过 node --check 语法
 * 2. MODULES 数量是否处于 8–20 的可读性建议区间
 * 3. LINKS 数量是否处于 10–25 的可读性建议区间
 * 4. 所有 LINKS.from/to 引用存在
 * 5. LANES 数量是否处于 3–7 的建议区间，所有模块 lane 命中
 * 6. I18N 同时有 zh 和 en
 * 7. (from, to) 组合无重复
 * 8. 内联 size < 200KB
 * 9. 使用 CSS 变量（设计 token 固化）
 * 10. 支持主题切换（[data-theme] 或 prefers-color-scheme）
 * 11. 语言切换按钮存在（data-lang）
 * 12. 产物不引用外部资源或泄漏绝对用户路径
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const file = process.argv[2];
if (!file) {
  console.error('用法: node scripts/validate-html.mjs output/<descriptive-name>.html');
  process.exit(1);
}

if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
  console.error(`找不到 HTML 文件: ${file}`);
  process.exit(1);
}

const html = fs.readFileSync(file, 'utf8');
const sizeKB = (html.length / 1024).toFixed(1);
const errors = [];
const warnings = [];

// 1. 抽 <script>
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) {
  errors.push('未找到 <script> 段');
  finish(sizeKB, errors, warnings);
}
const script = m[1];
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blueprint-check-'));
const tmpJs = path.join(tmpDir, 'inline-script.mjs');
fs.writeFileSync(tmpJs, script);

try {
  execFileSync(process.execPath, ['--check', tmpJs], { stdio: 'pipe' });
  log('✓', 'script 语法通过');
} catch (e) {
  errors.push('script 语法错误: ' + e.message);
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

if (errors.length) finish(sizeKB, errors, warnings);

// 2. 静态解析数据（用正则，避免执行）
const moduleMatches = [...script.matchAll(/\{\s*id:\s*'([A-Z][A-Z0-9]{0,2})',\s*lane:\s*'([a-z][a-z0-9-]*)',\s*kind:\s*'([a-z][a-z0-9-]*)'/g)];
const MODULES = moduleMatches.map(m => ({ id: m[1], lane: m[2], kind: m[3] }));

const linkMatches = [...script.matchAll(/\{\s*from:\s*'([A-Z][A-Z0-9]{0,2})',\s*to:\s*'([A-Z][A-Z0-9]{0,2})'/g)];
const LINKS = linkMatches.map(m => ({ from: m[1], to: m[2] }));

const laneMatches = [...script.matchAll(/\{\s*id:\s*'([a-z][a-z0-9-]*)',\s*lab:\s*'([^']+)'/g)];
const LANES = laneMatches.map(m => ({ id: m[1], lab: m[2] }));

// 3. MODULES 数量
if (MODULES.length === 0) {
  errors.push('未解析到任何 MODULES');
} else if (MODULES.length < 8 || MODULES.length > 20) {
  warnings.push(`MODULES 数量 ${MODULES.length} 不在 8–20 建议区间`);
} else {
  log('✓', `MODULES 数量 ${MODULES.length}`);
}

// 4. LINKS 数量
if (LINKS.length < 10 || LINKS.length > 25) {
  warnings.push(`LINKS 数量 ${LINKS.length} 不在 10–25 建议区间`);
} else {
  log('✓', `LINKS 数量 ${LINKS.length}`);
}

// 5. 引用完整性
const ids = new Set(MODULES.map(m => m.id));
const dangling = LINKS.filter(l => !ids.has(l.from) || !ids.has(l.to));
if (dangling.length) {
  errors.push(`悬空引用: ${dangling.map(l => `${l.from}→${l.to}`).join(', ')}`);
} else {
  log('✓', '所有连线引用存在');
}

// 6. LANES
if (LANES.length === 0) {
  errors.push('未解析到任何 LANES');
} else if (LANES.length < 3 || LANES.length > 7) {
  warnings.push(`LANES 数量 ${LANES.length} 超出 3–7 建议区间`);
} else {
  log('✓', `LANES 数量 ${LANES.length}`);
}

const laneIds = new Set(LANES.map(l => l.id));
const missingLanes = [...new Set(MODULES.map(m => m.lane).filter(lane => !laneIds.has(lane)))];
if (missingLanes.length) {
  errors.push(`模块引用了不存在的泳道: ${missingLanes.join(', ')}`);
} else {
  log('✓', '所有模块泳道引用存在');
}

const duplicateModuleIds = MODULES.map(m => m.id).filter((id, index, all) => all.indexOf(id) !== index);
if (duplicateModuleIds.length) {
  errors.push(`重复模块 id: ${[...new Set(duplicateModuleIds)].join(', ')}`);
} else {
  log('✓', '模块 id 唯一');
}

// 7. I18N 存在
if (!/I18N\s*=\s*\{[\s\S]*zh:/.test(script) || !/I18N\s*=\s*\{[\s\S]*en:/.test(script)) {
  errors.push('I18N 缺少 zh 或 en');
} else {
  log('✓', 'I18N 包含 zh + en');
}

// 8. (from, to) 去重
const seen = new Set();
const dupes = [];
LINKS.forEach(l => {
  const k = `${l.from}→${l.to}`;
  if (seen.has(k)) dupes.push(k);
  seen.add(k);
});
if (dupes.length) {
  errors.push(`重复连线: ${dupes.join(', ')}`);
} else {
  log('✓', '无重复连线');
}

// 9. 文件大小
if (html.length > 200 * 1024) {
  warnings.push(`文件大小 ${sizeKB}KB 超过 200KB`);
} else {
  log('✓', `文件大小 ${sizeKB}KB`);
}

// 10. 设计 token 固化（CSS 变量）
const cssMatch = html.match(/<style>([\s\S]*?)<\/style>/);
const css = cssMatch ? cssMatch[1] : '';
const varCount = (css.match(/var\(--/g) || []).length;
if (varCount < 20) {
  warnings.push(`CSS 变量使用 ${varCount} 次偏少（建议 ≥ 20）`);
} else {
  log('✓', `CSS 变量使用 ${varCount} 次`);
}

// 11. 主题切换支持
const hasDataTheme = /\[data-theme=/.test(css);
const hasPrefers = /prefers-color-scheme/.test(css);
if (hasDataTheme && hasPrefers) {
  log('✓', '主题切换：手动 + 系统自动');
} else if (hasDataTheme) {
  log('✓', '主题切换：手动');
} else if (hasPrefers) {
  warnings.push('仅有 prefers-color-scheme，无手动 override');
} else {
  errors.push('未发现主题切换机制');
}

// 12. 语言切换按钮
const hasLangBtn = /data-lang=/.test(html) && /localStorage\.setItem\('bp\.lang'/.test(script);
if (hasLangBtn) {
  log('✓', '语言切换按钮 + localStorage 持久化');
} else {
  errors.push('未检测到语言切换按钮 (data-lang) 或 localStorage 持久化');
}

// 13. 自包含与路径泄漏
if (/<script\b[^>]*\bsrc\s*=|<link\b[^>]*\bhref\s*=\s*["']https?:|<(?:img|audio|video)\b[^>]*\bsrc\s*=\s*["']https?:/i.test(html)) {
  errors.push('检测到外部脚本、样式或媒体资源；产物应保持自包含');
} else {
  log('✓', '未检测到外部资源');
}

if (/(?:\/Users\/|\/home\/|[A-Za-z]:\\\\Users\\\\)/.test(html)) {
  errors.push('检测到生成机器的绝对用户路径');
} else {
  log('✓', '未检测到绝对用户路径');
}

finish(sizeKB, errors, warnings);

function log(icon, msg) { console.log(`${icon} ${msg}`); }
function finish(size, errors, warnings) {
  console.log(`\n文件大小：${size}KB`);
  console.log(`错误：${errors.length}  警告：${warnings.length}`);
  if (errors.length) {
    console.log('\n错误：');
    errors.forEach(e => console.log('  ✗ ' + e));
  }
  if (warnings.length) {
    console.log('\n警告：');
    warnings.forEach(w => console.log('  ! ' + w));
  }
  process.exit(errors.length ? 1 : 0);
}
