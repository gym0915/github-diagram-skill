# 数据契约

## MODULES 字段

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | string | ✓ | 唯一短 ID，1–3 字符（如 `T1`、`D2`），大写字母开头 |
| `lane` | string | ✓ | 对应一个 `LANES.id`；名称应简短且稳定 |
| `kind` | string | ✓ | 对应 `KIND_CN` 中存在的分类键 |
| `color` | CSS color | ✓ | 推荐引用语义 token，如 `var(--c-token)` |
| `title` | string | ✓ | 模块名（i18n：见下） |
| `sub` | string | ✓ | 定位短语 ≤ 12 字（i18n） |
| `files` | string | ✓ | 真实文件路径，`<br>` 分隔多文件 |
| `do` | string | ✓ | 一句话职责（i18n） |
| `flow` | string[] | ✗ | 模块具有明确阶段时使用 |
| `tables` | Table[] | ✗ | 结构化规格 |
| `i18n` | object | ✗ | 模块内字符串覆盖默认 |

### Table 子结构

```ts
{
  name: string;     // 表格名（i18n）
  head: string[];   // 表头（i18n）
  rows: Array<Array<string | {html: string}>>; // 默认纯文本；显式对象可放受信任 HTML
}
```

普通字符串会被 HTML 转义。只有 Skill 作者生成且不含仓库原始输入的受信任片段，
才可使用 `{html: '<span>…</span>'}`。可用的展示片段包括：
- `<span class="tag y">` `n` `w` — 状态标签
- `<span class="sw" style="background:#XXX">` — 色块预览
- `<span class="sw light" ...>` — 浅色块（带边框）
- `<span class="sw ladder">` — 灰阶渐变
- `<span class="sw dark">Aa</span>` — 暗卡样本
- 不要把文件名、README 内容或其他未转义的仓库文本放入 `html`

### 模块级 i18n

```js
i18n: {
  en: {
    title: '...',
    sub: '...',
    do: '...',
    flow: ['step 1', 'step 2'],   // 可单独覆盖
    tables: [
      {name: 'Section', head: ['A','B'], rows: [['x','y']]}
    ]
  }
}
```

不提供 `i18n.en` 的字段直接用中文版。

## LINKS 字段

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `from` | string | ✓ | 源模块 id |
| `to` | string | ✓ | 目标模块 id |
| `color` | CSS color | ✓ | 推荐使用 `var(--c-main)`、`var(--c-token)`、`var(--c-ref)` 或 `var(--c-qa)` |
| `label` | string | ✓ | 关系标签（i18n） |
| `dash` | bool | ✗ | 虚线 = 参考 / 校验回环 |
| `i18n` | object | ✗ | 英文 label 覆盖 |

## LANES 字段

```ts
{
  id: 'in',                    // 与 MODULES.lane 对应
  lab: '输入',                  // 中文名
  sub: 'INTENT',                // 英文缩写
  i18n: { en: { lab: 'Input', sub: 'INTENT' } }
}
```

## I18N 全局

页面通用字符串（标题、按钮、提示语）放在顶层 `I18N` 对象：

```js
const I18N = {
  zh: {
    title: 'Lieflat Charts · 组装蓝图',
    panel: '检视面板',
    panelSub: 'INSPECTOR',
    panelHint: '悬停任意模块查看规格',
    what: '做什么',
    flow: '流程',
    spec: '规格',
    files: '文件',
    upstream: '上游',
    downstream: '下游',
    legend: {
      main: '主流程：决策 → 取码 → 组装',
      token: 'Token 注入：形 / 字 / 动 / 色',
      ref: '参考与正本同步',
      qa: '质检回环',
    },
    themeLight: '日间',
    themeDark: '夜间',
    themeAuto: '跟随系统',
    langZh: '中',
    langEn: 'EN',
  },
  en: { ... }
};
```

## 校验规则

- `MODULES.length` 通常在 8–20；超出时给出可读性警告，不作为事实错误
- `LINKS.length` 通常在 10–25；超出时给出可读性警告，不应诱导虚构关系
- 每个 `LINKS.from` 和 `LINKS.to` 必须存在于 `MODULES`
- `LANES.length` 通常在 3–7
- 每个 `MODULES.lane` 必须存在于 `LANES`
- 同一对 (from, to) 不重复（避免连线重叠）
- 表格仅在确有比较信息时使用，不为满足格式而强制添加

校验脚本见 `scripts/validate-html.mjs`。
