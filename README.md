# DriveFollow · 汽车销售跟进与询价承接

[连续询价案例](https://sienna-cat.github.io/drivefollow/inquiry.html) · [销售工作台](https://sienna-cat.github.io/drivefollow/) · [专业作品集](https://sienna-cat.github.io/drivefollow/portfolio/) · [产品设计](https://sienna-cat.github.io/drivefollow/evidence.html)

将客户原话、报价条件、联系许可、车型知识和跟进任务组织在一个可操作流程中。顾问查看依据、补充条件、确认任务，再处理执行和反馈。

## 核心设计
- 多轮询价：诉求、时间、许可分别记录，字段关联原话。
- 核实与确认：关系和报价独立检查，人工确认后创建任务。
- 状态管理：创建与执行分开，重复确认复用任务，条件变化重新检查，撤回取消待办。
- 销售工作台：客户管线、资料引用、草稿编辑、待办与试驾预约。
- 记录与反馈：刷新恢复、操作历史、采用/修改/驳回与 JSON 导出。

## 运行
公开网页使用示例数据，业务动作在浏览器内演示。连续询价使用规则状态流；销售工作台支持在本地配置模型草稿服务。

需要 Node.js 24+，无需安装运行依赖。
```sh
npm start
npm test
npm run build:static
```
本地地址 http://127.0.0.1:4173 。模型配置见 `.env.example`；密钥仅在本地服务端读取。GitHub Actions 在 main 更新后测试并发布静态页面。

## 源码导航
| 位置 | 职责 |
| --- | --- |
| public/modules/inquiry-case.js | 询价字段、许可、知识与任务状态 |
| public/inquiry.js | 连续案例交互与记录导出 |
| public/modules/domain.js | 销售工作台业务规则 |
| server.mjs | 本地接口、输入校验与可选模型适配 |
| tests/ | 业务行为与接口回归 |
| docs/portfolio/ | 项目方案、结果与规则实验 |

[需求与关键决策](docs/portfolio/v7/decisions.md) · [场景验收](docs/portfolio/v7/acceptance.md) · [迭代方法](docs/portfolio/v7/iteration.md)
