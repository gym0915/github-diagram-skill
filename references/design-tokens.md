# 设计 Token 规范

## 核心原则

**可复用的视觉决策集中在 CSS 变量中。** 色值和尺寸可以出现在 token 定义里，
但不要在组件规则和数据数组中重复散落。主题切换和字号微调应通过 token 完成。

## 必备 Token

```css
:root {
  /* 色（dark 主题默认，light 通过 media query 覆盖） */
  --bg: #12120F;          /* 页面底色 */
  --panel: #1C1C1A;       /* 卡片底色 */
  --line: #33332C;        /* 分隔线 */
  --dot: #2E2D29;         /* 内嵌元素底色 */

  --ink: #F0EFEB;         /* 主文字 / 数据 */
  --muted: #8F8E88;       /* 次级文字 / 副标题 */
  --faint: #55554F;       /* 辅助文字 / 来源行 */
  --paper: #F0EFEB;       /* 反色背景（亮元素） */
  --grid: #DEDDD6;        /* 网格 / 发丝线 */

  /* 关系色（不随主题变化，全图统一） */
  --c-main: #F2D17E;      /* 琥珀 · 主流程 */
  --c-token: #9FE1CB;     /* 青绿 · Token 注入 */
  --c-ref: #8F8E88;       /* 灰 · 参考 */
  --c-qa: #B0AFA9;        /* 浅灰 · 质检 */

  /* 字号 / 字重 */
  --fs-1: 21px; --fs-2: 14px; --fs-3: 12.5px;
  --fs-4: 11.5px; --fs-5: 10.5px; --fs-6: 9.5px;
  --fw-bold: 700; --fw-extra: 800;

  /* 圆角 / 间距 */
  --r-card: 12px; --r-tag: 99px; --r-swatch: 5px;
  --gap-grid: 12px; --gap-stage: 22px; --pad-card: 18px 20px;

  /* 动画 */
  --t-fast: 0.18s; --t-med: 0.5s;
  --ease: cubic-bezier(.2,.7,.3,1.3);
}

@media (prefers-color-scheme: light) {
  :root {
    --bg: #F0EFEB;
    --panel: #FFFFFF;
    --line: #DEDDD6;
    --dot: #EFEEEA;
    --ink: #1C1C1A;
    --muted: #6A6963;
    --faint: #8F8E88;
    --paper: #1C1C1A;
    --grid: #D8D7D1;
    --c-ref: #6A6963;
    --c-qa: #8F8E88;
  }
}
```

## 手动主题覆盖

系统设置之外，加一组 `data-theme` 属性让用户手动切换：

```css
[data-theme="dark"] { /* 同 :root 暗色 */ }
[data-theme="light"] { /* 同 media light 块 */ }
```

```js
// 切换逻辑
const THEMES = ['auto', 'dark', 'light'];
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme === 'auto' ? '' : theme;
  localStorage.setItem('bp.theme', theme);
}

btn.addEventListener('click', () => {
  const current = localStorage.getItem('bp.theme') || 'auto';
  applyTheme(THEMES[(THEMES.indexOf(current) + 1) % THEMES.length]);
});
applyTheme(localStorage.getItem('bp.theme') || 'auto');
```

切换按钮文案根据当前主题显示下一个状态：
- 当前 dark → 显示「日间」点击后变 light
- 当前 light → 显示「跟随系统」点击后变 auto
- 当前 auto → 显示「夜间」点击后变 dark

## 关系色（连线条目用）

| 关系 | Token | 含义 |
|---|---|---|
| 主流程 | `var(--c-main)` 琥珀 | 必须走的控制流 |
| Token 注入 | `var(--c-token)` 青绿 | 风格系统向下注入 |
| 参考同步 | `var(--c-ref)` 灰 | 模板副本 / 同级参考 |
| 质检回环 | `var(--c-qa)` 浅灰 | 校验 → 反馈 |

## 色块预览规范

| Token | 用途 | 边框 |
|---|---|---|
| `.sw` | 普通色块（深色） | 1px rgba(255,255,255,.08) |
| `.sw.light` | 浅色块 | 1px var(--line) |
| `.sw.ladder` | 7 级灰阶渐变 | 1px var(--line) |
| `.sw.dark` | 暗卡样本 | 1px var(--line) |

## 字号层级

| Token | 用途 |
|---|---|
| `--fs-1` | 页面 h1 |
| `--fs-2` | 检视面板模块名 |
| `--fs-3` | 检视面板正文 / 表格 |
| `--fs-4` | 卡片副标题 / 检视面板段落 |
| `--fs-5` | 卡片文件路径 / tag |
| `--fs-6` | 表头 uppercase / 角标 / 状态标签 |

## 动画性格

```css
.mod { transition: opacity var(--t-fast), border-color var(--t-fast), transform var(--t-fast); }
.mod:hover { transform: translateY(-2px); }

@media (prefers-reduced-motion: reduce) {
  .mod, .wire, .wlabel { transition: none; }
  .mod:hover { transform: none; }
}
```
