# FinPath — 完整工程文档包 V1.0（第二次交付）

生成日期：2026-10-27。状态：**可评审的实施基线（Proposed Baseline）**，并非已通过用户逐条批准的最终业务决定。

## 你已经完成了什么

`M00-BOOTSTRAP-000` 已由本地 Codex 完成并验证。本包**不包含项目初始化指令**，也不要求重新 clone/init、覆盖 `.git`、覆盖现有 `README.md`、`AGENTS.md` 或 `docs/PROJECT-STATUS.md`。

## 完整交付与最小上下文

本包一次性包含完整 PRD / 架构 / 算法 / 53 个可分步执行的任务规格。所有文档**一次放进仓库**，但 Codex **每轮只执行一个 Step**：

1. 读取仓库根目录已存在的 `AGENTS.md`、本包 `AGENTS.ADDENDUM.md` 的约束（经用户审阅后合并到现有 AGENTS.md）。
2. 读取用户指定的 `tasks/Mxx/Mxx-yy.md`，检查 `tasks/INDEX.md` 的前置条件。
3. 只读取该 Step 的 `Source docs` 指向的少量文档与具体代码/测试。
4. 只实施当前 Step，运行适用检查，更新任务状态，报告结果并**停止**。
5. 不自动继续下一步；不自动 push、部署、创建云资源或修改正式账户。

**“一次只读一个文档”不是严格禁止引用必要契约。** 正确规则是“一次**执行一个任务**、只读取它需要的最小文档集”。例如资金池任务必须同时知道账本不变量和目标状态，否则会破坏资产一致性。

## Windows PowerShell 导入

项目路径：`D:\myWORK\project\finpath`，当前 git remote 由你本机确认，建议保持 `git@github.com:guangtian0330/personalFinance.git`。

1. 将 ZIP 解压到临时目录，不要直接覆盖 Git 仓库根文件。
2. 确认 `git status`，保护已经存在的修改。
3. 将本包的 `docs/` 和 `tasks/` 文件合并到仓库同名目录；不要覆盖现有 `docs/PROJECT-STATUS.md`。
4. 审阅 `AGENTS.ADDENDUM.md` 并合并到既有 `AGENTS.md`；把 `README-CODEX.md` 作为索引文档保存。
5. 提交文档变更（不强制推送）。
6. 在 Codex 中先执行 `M00-01`，只有用户明确授权后才进入下一个 Step。

推荐在 Codex 的 Windows Native 环境直接打开：`D:\myWORK\project\finpath`。

## 文档与任务的状态模型

- `docs/requirements/PRD.md`：产品目标、流程、功能范围、行为约束。
- `docs/requirements/FEATURE-CATALOG.md`：带稳定 ID 的可追溯功能目录。
- `docs/architecture/`：部署、模块边界、DB schema、API、权限与重要不变量。
- `docs/algorithms/`：有版本的公式、假设、验证数据、学术及开源来源。
- `docs/roadmap/ROADMAP.md`：M00–M09，53 个候选 Step 及集成门槛。
- `tasks/INDEX.md`：真实的单任务执行次序、依赖与读取清单。
- `tasks/Mxx/Mxx-yy.md`：单次 Codex 执行规格（53 个），含测试和停止条件。
- `docs/decisions/ADR-0001-proposed-baseline.md`：尚需用户最终确认的架构决定。

## 优先评审的产品决定

见 `docs/decisions/OPEN-DECISIONS.md`。默认采用：最多 3 个活跃顶层目标；应急流动性不占额度；目标转移需确认；以可审计复式分录为内核、简单 UI 为表层；云端 Web 首发；真实认证和跨租户隔离必须在公开上传真实数据前完成。

## 使用 Codex 的一条指令

> 只执行 `tasks/M00/M00-01.md`。先读 `AGENTS.md`、`tasks/INDEX.md` 的本任务行和该文件 `Source docs`，核对本地代码与前置条件。不得一次性加载所有 docs/tasks，不得执行 M00-02，不得 push 或部署。完成验证后汇报并停止。

如果文档与仓库实际代码冲突，**不要强行覆盖代码或声称成功**；先列出差异和一个可评审的 ADR/修订建议。
