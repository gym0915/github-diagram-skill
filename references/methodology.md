# 怎么分析一个目标仓库

把"读仓库"这件事拆成 6 个动作，每个动作产出明确可写入数据数组的产物。

## Step 1 · 建立仓库事实

优先读取：
- `README.md`（或 `README.en.md`）— 了解用途、用户、主要功能
- 主 SKILL 文件（多数 skill 仓库都有一个 `SKILL.md` / `AGENTS.md` / `CLAUDE.md`）
- `package.json` / `pyproject.toml` / `Cargo.toml`（如有）— 依赖、入口脚本

同时检查入口文件、核心实现和测试，记录：
- 这是给谁用的（人 / AI Agent / 程序员）
- 触发词是什么
- 输出物形态（HTML / CLI / API / 库）
- 主要依赖是什么

## Step 2 · 目录与体量

```bash
ls -la
find . -not -path './.git/*' -not -path './node_modules/*' -maxdepth 2
```

记下：
- 顶层文件 / 目录清单
- 关键子目录（templates / scripts / examples / docs / schemas）
- 文件大小量级（哪几个是大文件、哪几个是配置）

## Step 3 · 提炼模块（核心动作）

按 **泳道** 聚类。泳道应来自仓库的实际职责；下面只是常见模式，不是固定分类：

| 泳道 | 包含什么 |
|---|---|
| 输入 INTENT | 用户的输入形态、参数解析、CLI 入口 |
| 规范层 DECIDE | 规则文档、决策表、目录、约束清单 |
| 资源层 SOURCE | 模板 / 真实样例 / 索引 / 仓库内参考实现 |
| Token 与运行时 STYLE | 设计 token、配置、第三方依赖 |
| 组装 BUILD | 渲染代码、骨架、构建脚本、组装器 |
| 质检与交付 SHIP | 校验脚本、烟测、CI、发布 |

通常挑选 8–20 个模块；小型仓库可以更少，复杂仓库应优先合并职责而不是无限增加卡片：
- 每个模块 = 1 个职责清晰的实体
- 实体可以是"1 个文件"或"1 组文件"（如"5 份 gallery"算 1 个模块）
- 命名要短：≤ 8 字中文 / 3 词英文

## Step 4 · 提炼连线

观察模块之间可验证的关系：
- `from` 模块的文件被 `to` 模块引用
- 配置注入、生成步骤和验证流程也可以形成关系
- 目录相邻、命名相似或主观推测不算证据

关系分 4 类（颜色编码）：

| 关系 | 颜色 | 含义 |
|---|---|---|
| 主流程 | 琥珀 | 必须走的控制流，缺一不可 |
| Token 注入 | 青绿 | 设计 token 向下注入到产物 |
| 参考同步 | 灰 | 模板内嵌副本同步正本 / 同级参考 |
| 质检回环 | 浅灰 | 产物 → 校验 → 交付 |

连线数通常控制在 10–25 条；以覆盖关键关系且保持可读为准。

## Step 5 · 填数据

每个模块用以下 schema（详见 data-schema.md）：

```js
{
  id: 'T1',           // 唯一短 ID
  lane: 'tok',        // 泳道
  kind: 'token',      // input/doc/res/token/ext/asm/qa
  color: 'var(--c-token)', // 模块主色，引用模板中的语义 token
  title: 'mono-tokens.js',  // 模块名
  sub: '风格唯一正本',  // 定位短语 ≤ 8 字
  files: 'mono-tokens.js',  // 真实路径
  do: '统一色、字、形、动、几何工具与卡片 CSS。',  // 一句话职责
  flow: ['步骤1', '步骤2'],  // 可选：有明确阶段的模块使用
  tables: [           // 可选：结构化规格
    {name: '色板', head: ['名称', '值'], rows: [['INK', '#1C1C1A']]}
  ],
  i18n: {             // 可选：模块内字符串覆盖默认
    en: {
      title: 'mono-tokens.js',
      sub: 'Style single source of truth',
      do: 'Unify color, font, shape, motion, geometry tools and card CSS.',
    }
  }
}
```

连线：

```js
{
  from: 'D1', to: 'D2',
  color: 'var(--c-main)', // 主流程语义色
  label: '主力 L1–L15',
  dash: false,            // 虚线 = 参考 / 校验
  i18n: { en: { label: 'Main L1–L15' } }
}
```

## Step 6 · 渲染与自检

```bash
# 1. 复制 assets/engine.html，并替换三个插槽；产物写入当前 Skill 项目的 output/
# __TITLE__ / __SUBTITLE__ / __DATA__

# 2. 校验
node scripts/validate-html.mjs output/<descriptive-name>.html

# 3. 校验通过后，在 Codex 当前任务的右侧浏览器面板打开看效果
# 使用 mcp__codex_app__open_in_codex：
# target: { type: "browser", url: "file://<HTML 的绝对路径>" }
# placement: "right"
# 不要使用 open、osascript 或系统浏览器。
```

## 反模式（要避开）

- ❌ 整页照抄原仓库的 README — 蓝图是"看图说话"，不是"复读"
- ❌ 模板块写成多段散文 — 表格化才方便扫读
- ❌ 把"我自己理解"塞进 `do` — 只写"这个文件实际干什么"
- ❌ 连线没颜色区分 — 颜色即语义，全灰看不出主流程
- ❌ 为满足数量区间而虚构模块或连线 — 数量只是可读性建议
- ❌ 30+ 模块全堆一页 — 多了就合并职责或拆成多张图
