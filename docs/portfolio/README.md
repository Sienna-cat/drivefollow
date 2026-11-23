# 石亚楠 AI营销与任务型Agent作品集

**[在线作品集与四个可操作 Demo →](https://sienna-cat.github.io/drivefollow/portfolio/#demos)**

无需登录、安装或配置。模拟数据与浏览器规则，可直接生成建议、审核任务、体验外呼协同与运行评测。


V5，2026-11-23。以工作中的意向分流决策为主线，用四个独立原型与可复跑规则说明任务、人审和异常控制。互联网智能服务方向可从课程咨询案例开始。

**[打开22页作品集PDF](portfolio-v5.pdf)** · [直接下载PDF](https://raw.githubusercontent.com/Sienna-cat/drivefollow/main/docs/portfolio/portfolio-v5.pdf)

PDF含16页主线与6页证据附录。第4、5、16页可直接跳到本册附录，无需本地文件；封面及第3、8、12、14页提供对应 Demo 直达链接；第15页集中展示全部在线 Demo 和源码。手机或浏览器预览未显示跳转时，可下载用系统PDF阅读器打开。

## 按岗位阅读

| 方向 | 路线 | 支持材料 |
| --- | --- | --- |
| 汽车营销Agent / CRM | 04观望分流 → 09同任务规则 → 18指标口径 → 15原型 | [指标卡](metrics.md)、[规则对照与失败](rule-comparison.md) |
| 互联网AI应用 / 智能服务 | 17课程咨询 → 18指标归属 → 10验收 → 07任务机制 | [课程咨询完整案例](course-case.md)、[一线回放方案](field-replay.md) |

## 可复核材料

- [观望分流验证代码、输入与输出](intent-eval)：12条开发、24条合成冻结检查；参照未经业务双人标注。修订规则18/24符合参照，6条失败保留，不是独立盲测或真实模型成绩。
- [逐例CSV](intent-eval/逐例结果.csv)、[结构化原始结果](intent-eval/raw-results.json)、[规则/数据冻结哈希](intent-eval/freeze-manifest.json)。Python 3.10+可复跑，无第三方依赖。
- [历史指标口径](metrics.md)：同批约75%→约90%与整体介入率35%→15%属于外呼产品历史记录，不借用为课程RAG或单客户效果。
- [真实任务回放模板](field-replay-template.csv)：待执行，无参与者或采用/用时结果。

## 四个独立项目

| 项目 | 业务任务 | 入口 |
| --- | --- | --- |
| DriveFollow | 客户事实、知识来源、顾问确认及模拟试驾 | [在线 Demo](https://sienna-cat.github.io/drivefollow/) · [源码](https://github.com/Sienna-cat/drivefollow) |
| DrivePulse | 车主客群、资格、人审、任务状态与恢复 | [在线 Demo](https://sienna-cat.github.io/drivepulse/) · [源码](https://github.com/Sienna-cat/drivepulse) |
| DriveReach | 卖车对话、信息证据、转接/回拨与拒联 | [在线 Demo](https://sienna-cat.github.io/drivereach/) · [源码](https://github.com/Sienna-cat/drivereach) |
| LoopLab | 客群策略开发/冻结、地址候选与人工裁决 | [在线 Demo](https://sienna-cat.github.io/looplab/) · [源码](https://github.com/Sienna-cat/looplab) |

网页和 PDF 中的 Demo 链接可直接打开已部署的演示，无需登录、安装或启动服务。网页 Demo 在新标签页打开，便于返回作品集继续阅读。使用合成业务数据与浏览器规则，未接真实 CRM、电话或企微。真实模型效果、生产任务稳定性和业务收益仍待验证。

本版未重新评分，也未补造公司原PRD、历史分母、模型结果、真实访谈或一线使用记录。原始聊天、完整简历和个人联系方式不在此公开目录。
