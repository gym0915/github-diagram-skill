# GitHub Diagram Skill

一个面向通用 Agent 的仓库架构图 Skill。它会读取 GitHub 仓库或本地代码仓库中的真实文件、入口、配置、导入关系和验证流程，生成无需构建、无需外部资源的交互式单文件 HTML 架构图。

它适合回答：

- 这个项目是怎么组织的？
- 哪些模块负责什么，它们之间如何连接？
- 能不能把这个 GitHub 仓库画成一张可交互的架构图？

它不是完整目录树生成器，也不是符号级调用图分析器。对于业务流程图、UI 原型或函数级调用关系，应使用更适合的工具。

## 特性

- 证据优先：模块和连线必须能从仓库文件、导入、配置、调用、生成或验证流程中追溯。
- 单文件交付：生成的 HTML 内联 CSS、JavaScript 和数据，不依赖构建步骤或外部 CDN。
- 交互式浏览：支持模块检视、关系高亮、hover、单击锁定、主题切换和中英文切换。
- 响应式布局：生成后检查桌面与窄屏布局，并在浏览器中预览。

## 安装

这是一个通用 Skill，不是需要 `npm install` 的独立 Web 应用。

如何安装：

```text
安装 skill: https://github.com/gym0915/github-diagram-skill
```

安装完成后，在支持 Skills 的 Agent 中提出仓库架构分析请求即可触发该 Skill。若当前会话没有立即识别到更新，重新打开会话即可。

## 使用

### 调用方式

GitHub 仓库：

```text
/github-diagram-skill https://github.com/owner/repository
```

本地仓库：

```text
/github-diagram-skill /path/to/local/repository
```

默认产物写入当前 Skill 项目的 `output/<descriptive-name>.html`。生成完成后，可在浏览器中打开本地 HTML。

## 效果预览

![交互式架构图效果预览](docs/images/architecture-preview.png)

## 工作流

1. 确认目标仓库和输出位置。
2. 阅读 README、包清单、入口、配置、核心实现和测试。
3. 按实际职责提炼泳道和模块，忽略 vendored、generated、cache 和依赖目录。
4. 只保留有仓库证据支持的关系，不因目录相邻而臆造连线。
5. 根据数据契约填充模块、连线、泳道和国际化数据。
6. 生成单文件 HTML。
7. 在浏览器中预览最终产物。

详细规则见 [`SKILL.md`](SKILL.md)，分析方法见 [`references/methodology.md`](references/methodology.md)。

## 项目结构

```text
.
├── SKILL.md                         # Skill 入口与执行契约
├── assets/engine.html               # 数据驱动的单文件 HTML 引擎
├── references/
│   ├── data-schema.md               # MODULES、LINKS、LANES 等字段约束
│   ├── design-tokens.md             # 视觉 token 和主题规则
│   ├── methodology.md               # 证据优先的分析方法
│   └── repo-types.md                # 不同仓库类型的划分参考
├── evals/                           # 触发、排除和邻近任务样例
└── output/                          # 生成的架构图 HTML
```

## 边界与注意事项

- 这是架构理解图，不承诺覆盖完整的运行时调用链。
- 用户要求函数级或符号级调用图时，应改用静态分析工具，并明确覆盖范围。
- 不确定的关系应省略或标注为推断。
- 产物不能包含生成机器的绝对路径、凭据或私有环境信息。
- 生成前检查同名文件，避免覆盖已有 HTML。

## License

[MIT](LICENSE)
