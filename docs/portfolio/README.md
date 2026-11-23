# 石亚楠 AI 营销与 CRM 产品作品集

**[在线作品集](https://sienna-cat.github.io/drivefollow/portfolio/) · [在线 Demo](https://sienna-cat.github.io/drivefollow/portfolio/#demos) · [22 页 PDF](portfolio-v5.pdf)**

V6 · 2026-11-23。围绕外呼意向分流与企微承接，展示个人职责、产品方案、规则评测和交互原型；补充人群策略、地址核验及课程咨询案例。

PDF 包含 16 页项目主册及 6 页补充材料。封面及第 3、8、12、14、15 页可直接打开对应 Demo；网页演示在新标签页打开。PDF 下载路径保持兼容，内容已更新为 V6。

## 项目阅读索引

| 方向 | 建议页码 | 补充材料 |
| --- | --- | --- |
| 汽车营销 Agent / CRM | 04 意向分流 → 09 规则评测 → 18 业务指标 → 15 在线演示 | [指标说明](metrics.md)、[规则对照与失败分析](rule-comparison.md) |
| 互联网 AI 应用 / 智能服务 | 17 课程咨询 → 07 异常处理 → 10 验收指标 → 18 业务指标 | [课程咨询案例](course-case.md)、[任务回放方案](field-replay.md) |

## 四个独立项目

| 项目 | 主要内容 | 入口 |
| --- | --- | --- |
| DrivePulse | 车主运营、人群筛选、人工审核与任务恢复 | [在线 Demo](https://sienna-cat.github.io/drivepulse/) · [源码](https://github.com/Sienna-cat/drivepulse) |
| DriveFollow | 购车信息、跟进建议、顾问确认及模拟试驾 | [在线 Demo](https://sienna-cat.github.io/drivefollow/) · [源码](https://github.com/Sienna-cat/drivefollow) |
| DriveReach | 卖车对话、意向字段、转接与回拨 | [在线 Demo](https://sienna-cat.github.io/drivereach/) · [源码](https://github.com/Sienna-cat/drivereach) |
| LoopLab | 人群策略开发与冻结测试、地址核验与复核 | [在线 Demo](https://sienna-cat.github.io/looplab/) · [源码](https://github.com/Sienna-cat/looplab) |

Demo 无需登录或安装，使用合成数据与浏览器规则，操作保存在当前浏览器。原型未接入真实 CRM、电话或企微；真实模型效果及业务收益待验证。

## 评测与统计口径

- [意向分流评测](intent-eval)：12 条开发样例、24 条冻结检查样例；修订规则 18/24 符合参照，保留 6 条失败。规则与参照由同一 AI 助手编写，非独立盲测或真实模型测试。
- [逐例结果](intent-eval/逐例结果.csv)、[原始输出](intent-eval/raw-results.json)、[版本哈希](intent-eval/freeze-manifest.json)：使用 Python 3.10+ 可复跑，无第三方依赖。
- [历史指标](metrics.md)：整通意向约 75% → 约 90%、整体介入率 35% → 15% 属于外呼产品历史记录，不能直接归因于课程 RAG 或单个客户项目。样本量、统计窗口及配置版本待补。
- [任务回放模板](field-replay-template.csv)：用于后续业务试点，尚无实际采用率及耗时结果。

历史业务数据、合成评测与模拟对话分别报告，不合并样本或效果。公开材料包括作品集、案例和验证代码。
