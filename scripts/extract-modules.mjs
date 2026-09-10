#!/usr/bin/env node
/**
 * extract-modules.mjs
 * 半自动从目标仓库提取模块信息和文件关系。
 * 用法：node extract-modules.mjs <repo-path> [--out data.json]
 *
 * 输出格式：
 * {
 *   modules: [{id, lane, kind, title, files, ...}],
 *   links: [{from, to, label, ...}],
 *   stats: {fileCount, dirCount, ...}
 * }
 *
 * 这是半自动工具：只扫文件，不做语义理解。
 * 语义聚类（哪些文件属于哪个模块）由人 + LLM 一起决定。
 */
import fs from 'node:fs';
import path from 'node:path';

const repo = process.argv[2];
const outIdx = process.argv.indexOf('--out');
const outPath = outIdx > -1 ? process.argv[outIdx + 1] : null;

if (!repo) {
  console.error('用法: node extract-modules.mjs <repo-path> [--out data.json]');
  process.exit(1);
}

if (!fs.existsSync(repo) || !fs.statSync(repo).isDirectory()) {
  console.error(`仓库路径不存在或不是目录: ${repo}`);
  process.exit(1);
}

if (outIdx > -1 && !outPath) {
  console.error('--out 需要一个输出文件路径');
  process.exit(1);
}

const SKIP = new Set(['.git', 'node_modules', 'dist', 'build', '__pycache__', '.venv', 'venv']);

function walk(dir, depth = 0, max = 4) {
  if (depth > max) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    if (entry.name.startsWith('.') && entry.name !== '.gitignore') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push({ type: 'dir', path: path.relative(repo, full), depth });
      out.push(...walk(full, depth + 1, max));
    } else if (entry.isFile()) {
      const stat = fs.statSync(full);
      out.push({ type: 'file', path: path.relative(repo, full), size: stat.size, depth });
    }
  }
  return out;
}

const items = walk(repo);
const files = items.filter(i => i.type === 'file');
const dirs = items.filter(i => i.type === 'dir');

const byExt = {};
files.forEach(f => {
  const ext = path.extname(f.path).toLowerCase() || '(none)';
  byExt[ext] = (byExt[ext] || 0) + 1;
});

const bigFiles = files
  .filter(f => f.size > 1024)
  .sort((a, b) => b.size - a.size)
  .slice(0, 15)
  .map(f => `${(f.size / 1024).toFixed(1)}KB  ${f.path}`);

const result = {
  repo: path.basename(repo),
  scanned: new Date().toISOString(),
  stats: {
    fileCount: files.length,
    dirCount: dirs.length,
    byExt,
  },
  bigFiles,
  files: files.map(f => f.path),
  dirs: dirs.map(d => d.path),
};

if (outPath) {
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`✓ 扫描完成，写入 ${outPath}`);
  console.log(`  ${files.length} 个文件，${dirs.length} 个目录`);
} else {
  console.log(JSON.stringify(result, null, 2));
}
