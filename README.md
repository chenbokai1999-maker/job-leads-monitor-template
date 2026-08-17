# 可复用的公开岗位线索监控

这是一个“需求访谈 Skill + 静态岗位看板 + 可复制监控配方”。它不会继承模板作者的城市、岗位方向或个人背景：每位使用者先和 Codex 完成需求访谈、确认本地画像并批准一次试扫，之后才能开启定时监控。

网页负责展示、筛选和导出线索；真正的联网检索由每位使用者自己的 Codex 定时任务完成。GitHub Pages 不会在浏览器里主动抓取招聘网站，也不会绕过登录或平台限制，只展示最近一次合法扫描并推送到仓库的数据。

## 工作方式

1. Skill 通过分轮访谈理解机会类型、地点、目标/偏好/探索方向、背景证据、时间和硬性条件。
2. 使用者确认“需求卡”后，Skill 只把非敏感条件写入本机的 `config/candidate.local.json`。
3. Skill 先做一次不公开的小范围试扫；使用者确认范围正确后才能启动定时任务。
4. 定时任务按 A/B 可信度规则检索公开可索引来源，只更新岗位和扫描历史 JSON。
5. GitHub Pages 展示最新快照；个人投递状态保存在各自浏览器的 `localStorage`。
6. 目标变化或连续出现相同的不匹配原因时，Skill 回到访谈模式重新校准，不会自行放宽要求。

## 快速开始

1. 使用本仓库作为模板创建自己的仓库，并克隆到电脑。
2. 在 Codex 中安装或直接引用 `skill/monitor-job-leads`。
3. 让 Codex 读取 `prompts/first-run.md`，或直接说：“使用 `$monitor-job-leads`，先理解我的需求并建立岗位监控。”
4. 分轮回答问题，核对需求确认卡，并批准一次小范围试扫。使用者不需要手工填写模板作者的筛选项。
5. 当 `node scripts/validate-profile.mjs` 通过后，创建定时任务，让它读取 `prompts/hourly-monitor.md` 并在本仓库目录运行。
6. 依赖本地画像和文件的定时任务需要电脑保持开机且桌面应用运行。
7. 在 GitHub 仓库设置中启用 Pages，来源选择 `main` 分支的 `/docs` 目录。

## 需求画像包含什么

- 机会类型：实习、秋招/校招、社招、兼职、合同岗或探索转行。
- 必选、偏好和探索岗位方向，以及岗位关键词和理由。
- 必选/偏好地点与现场、混合、远程或灵活办公政策。
- 影响资格的教育、届次、经验、技能、语言、可到岗时间等非敏感事实。
- 硬性条件、较软偏好、排除项、公开来源时效和可信度范围。

画像不包含姓名、电话、邮箱、身份证、住址、私人社交账号、完整简历、Cookie 或 Token，并且默认不会被 Git 提交。

## 本地预览

由于网页使用 `fetch()` 读取 JSON，请通过本地 HTTP 服务预览，而不是双击 `index.html`：

```bash
python -m http.server 8000 --directory docs
```

然后打开 `http://localhost:8000`。

## 校验

检查空白配置样例的结构：

```bash
node scripts/validate-profile.mjs config/candidate.example.json --schema-only
```

检查本地画像已确认且试扫已批准，并检查公开数据：

```bash
node scripts/validate-profile.mjs
node scripts/validate-data.mjs
```

数据校验器会检查机会类型、岗位方向、字段、可信度、状态、URL、重复 ID、重复 URL、重复“公司/岗位/城市”组合，以及最近一次扫描统计。

## 隐私与安全

- 不要提交 `candidate.local.json`；Skill 在任何发布前都会确认它已被 Git 忽略。
- 不要把候选人画像、个性化匹配理由、姓名、联系方式、完整简历、Cookie、Token、二维码或私人招聘联系人写进公开 JSON。
- 不要自动投递、私信或付费。
- 受限页面只标记“需人工打开”；不绕过验证码、登录、robots 或反爬机制。

## 目录

```text
config/                    中性画像结构；本地画像不入库
docs/                      GitHub Pages 静态网页
docs/data/                 岗位与扫描历史 JSON
prompts/first-run.md       首次需求访谈与试扫规则
prompts/hourly-monitor.md  已确认画像的定时任务规则
scripts/validate-profile.mjs  本地画像与试扫状态校验
scripts/validate-data.mjs     公开岗位数据校验
skill/monitor-job-leads/      通用需求理解与岗位监控 Skill
```

MIT License
