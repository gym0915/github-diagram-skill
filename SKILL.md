---
name: github-diagram-skill
description: Analyze a GitHub repository or local codebase and generate an interactive, self-contained HTML architecture map grounded in real files and relationships. Use for repo maps, module maps, dependency or assembly blueprints, repository structure diagrams, “这个项目怎么组织的”, “画仓库架构图”, or “这套代码怎么连起来的”. Do not use for generic business flowcharts, UI mockups, or tiny flat projects where reading the source is clearer.
---

# GitHub Diagram Skill

把代码仓库的职责分层、关键模块和真实关系整理成一张可交互的单文件 HTML 架构图。

## 工作流

1. 确认目标仓库和输出位置。输入可以是本地路径或 GitHub URL；用户给出的模块清单只是线索，不替代仓库证据。
2. 阅读 [分析方法](references/methodology.md)，检查 README、包清单、入口、配置、核心实现和测试。较大仓库可先运行 `node scripts/extract-modules.mjs <repo-path>` 获取文件清单。
3. 按实际职责提炼泳道和模块。模块数量与泳道数量是可读性建议，不是硬指标；合并重复职责，忽略 vendored、generated、cache 和依赖目录。
4. 只记录可由 import、配置、调用、生成或验证流程证明的关系。每个模块必须指向真实相对路径，不因目录相邻而臆造连线。
5. 按 [数据契约](references/data-schema.md) 编写 `MODULES`、`LINKS`、`LANES`、`KIND_CN` 和 `I18N`，复制 [HTML 引擎](assets/engine.html) 并替换 `__TITLE__`、`__SUBTITLE__`、`__DATA__`。
6. 运行 `node scripts/validate-html.mjs <output.html>`，再检查桌面与窄屏布局、浅色与深色主题、键盘可达性、hover、单击锁定和语言切换。

## 输出契约

- 交付一个无需构建步骤和外部资源的 HTML 文件。
- 图中只保留理解架构所需的关键文件；不要把完整目录树伪装成架构图。
- 模块路径和连线必须可追溯到仓库证据；不确定关系应省略或明确标注为推断。
- 产物不得包含生成机器的绝对路径、凭据或私有环境信息。
- 标题与卡片保持简短，详细说明放在检视面板；只有比较信息才使用表格。
- 最终说明输出路径、模块与连线数量，以及验证中的错误或警告。

## 判断边界

- 对单文件或职责极少的扁平项目，直接给出结构说明通常比强行画图更清楚。
- 这是仓库架构图，不是精确的全量调用图。若用户要求符号级调用关系，应改用静态分析工具并说明覆盖范围。
- 默认沿用用户语言；仅在用户需要双语交付时补齐中文和英文内容，但模板所需的基础 `I18N` 键仍必须存在。
- 视觉常量集中在 CSS token 中。调整视觉系统时阅读 [设计 Token](references/design-tokens.md)，不要在组件规则里散落重复值。
- 不确定如何划分某类仓库时，再阅读 [仓库类型参考](references/repo-types.md)。

## 资源

- `assets/engine.html`：数据驱动的单文件 HTML 引擎。
- `scripts/extract-modules.mjs`：文件清单与体量扫描，不负责语义聚类。
- `scripts/validate-html.mjs`：检查脚本语法、引用完整性、主题、语言和文件大小。
- `evals/`：触发、排除和邻近任务的路由回归样例。
- `references/methodology.md`：证据优先的仓库分析方法。
- `references/data-schema.md`：数据字段与约束。
- `references/design-tokens.md`：视觉 token 和主题规则。
- `references/repo-types.md`：按仓库类型划分职责的参考。
