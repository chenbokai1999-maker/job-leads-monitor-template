# 可复用的公开实习线索监控

这是一个“静态岗位看板 + 可复制监控配方”。网页负责展示、筛选和导出线索；真正的联网检索由每位使用者自己的 Codex 定时任务完成。

> GitHub Pages 不会在浏览器里主动抓取招聘网站，也不会绕过登录或平台限制。它只展示最近一次合法扫描并推送到仓库的数据。

## 工作方式

1. Codex 读取本机的 `config/candidate.local.yml`。
2. 定时任务检索公开可索引来源，并按 A/B 可信度规则核验。
3. 任务只更新 `docs/data/leads.json` 和 `docs/data/scan-history.json`。
4. 校验通过后提交并推送；GitHub Pages 展示最新快照。
5. “待核验 / 准备投递 / 已投递 / 不合适”保存在各自浏览器的 `localStorage`，不会进入仓库。

## 快速开始

1. 使用本仓库作为模板，创建自己的仓库并克隆到电脑。
2. 复制 `config/candidate.example.yml` 为 `config/candidate.local.yml`，填写城市、岗位方向、届次和到岗条件。该文件默认不会被 Git 提交。
3. 在 Codex 中安装或直接引用 `skill/monitor-internship-leads`。
4. 创建定时任务，让它读取 `prompts/hourly-monitor.md` 并在本仓库目录运行。
5. 先手动测试一轮，再开启每小时运行。依赖本地文件的定时任务需要电脑保持开机且桌面应用运行。
6. 在 GitHub 仓库设置中启用 Pages，来源选择 `main` 分支的 `/docs` 目录。

## 本地预览

由于网页使用 `fetch()` 读取 JSON，请通过本地 HTTP 服务预览，而不是双击 `index.html`：

```bash
python -m http.server 8000 --directory docs
```

然后打开 `http://localhost:8000`。

## 校验

```bash
node scripts/validate-data.mjs
```

校验器会检查字段、可信度、状态、URL、重复 ID、重复 URL、重复“公司/岗位/城市”组合，以及最近一次扫描统计。

## 隐私与安全

- 不要提交 `candidate.local.yml`。
- 不要提交姓名、联系方式、完整简历、Cookie、Token、二维码或私人招聘联系人信息。
- 不要自动投递、私信或付费。
- 受限页面只标记“需人工打开”；不绕过验证码、登录、robots 或反爬机制。

## 目录

```text
config/                    候选人条件样例；本地配置不入库
docs/                      GitHub Pages 静态网页
docs/data/                 岗位与扫描历史 JSON
prompts/hourly-monitor.md  可复制的定时任务规则
scripts/validate-data.mjs  零依赖数据校验
skill/                     可选的 Codex 技能
```

MIT License
