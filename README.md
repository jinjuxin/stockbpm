# 开发标准模板

这是一套可复制到任意项目的轻量开发标准模板，目标是先固化流程与产物，再逐步演进为 skill 和 agent。

适用流程：

1. 需求
2. 原型
3. 原型确认
4. 技术方案
5. 方案确认
6. 开发
7. 测试
8. 验收
9. 文档

目录说明：

- `docs/process/`：流程与门禁说明
- `docs/templates/`：各阶段输出模板
- `docs/project/`：项目约束与边界模板
- `skills/`：后续演进为 skill 的骨架

建议使用方式：

1. 先复制整个目录到目标项目
2. 根据项目实际情况补充模块边界、技术约束、命名规范
3. 先用模板跑通 3 到 5 个真实需求
4. 模板稳定后，再抽成 skill
5. 最后再让 agent 按流程调用

当前包含文件：

- `docs/process/01-标准开发流程.md`
- `docs/process/02-阶段门禁说明.md`
- `docs/project/01-项目约束模板.md`
- `docs/project/02-模块归属与边界模板.md`
- `docs/project/03-接口与配置规范模板.md`
- `docs/templates/需求任务卡模板.md`
- `docs/templates/原型评审模板.md`
- `docs/templates/技术方案模板.md`
- `docs/templates/测试清单模板.md`
- `docs/templates/验收清单模板.md`
- `docs/templates/文档回写模板.md`
- `skills/README.md`
- `skills/01-需求澄清-skill骨架.md`
- `skills/02-技术方案-skill骨架.md`
- `skills/03-测试验收-skill骨架.md`
