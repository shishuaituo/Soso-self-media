# 第二阶段：MCP 能力分析与映射

## 一、Firefly 社媒数据 API 概览

### 基本信息
- **产品名称**：Firefly 社媒数据 API
- **文档地址**：https://firefly.qwjxqn.xyz/docs/agent-api
- **API 基础域名**：`https://firefly.qwjxqn.xyz`（待验证，文档示例使用 api.example.com 占位）
- **API Key**：（用户提供，不内置在 Skill 中）
- **计费方式**：积分制，1 积分 = ¥0.01，成功交付数据才扣费
- **接入方式**：REST API + MCP 双入口
- **Skill 调用方式**：通过 RunCommand 调用 curl / Python 发送 HTTP 请求（REST API 方式）

### 支持平台（4个）
| 平台 | 能力数量 | 积分成本范围 |
|------|----------|-------------|
| 抖音 | 5 个能力 | 2-13 积分/次 |
| 小红书 | 5 个能力 | 10-13 积分/次 |
| 微信视频号 | 6 个能力 | 10-13 积分/次 |
| 微信公众号 | 4 个能力 | 10-13 积分/次 |

---

## 二、MCP 工具清单（20个能力）

### 抖音 MCP 工具

| MCP 工具名 | 功能 | 积分/次 | 关键参数 |
|------------|------|---------|----------|
| `douyin_video_search` | 视频搜索 | 13 | keyword, sort_type, publish_time, filter_duration, content_type |
| `douyin_video_detail` | 视频详情 | 10 | aweme_id / share_url |
| `douyin_video_comments` | 视频评论 | 2 | aweme_id, cursor, count |
| `douyin_user_info` | 账号信息 | 2 | sec_user_id |
| `douyin_user_videos` | 账号作品 | 2 | sec_user_id, max_cursor, count, sort_type |

### 小红书 MCP 工具

| MCP 工具名 | 功能 | 积分/次 | 关键参数 |
|------------|------|---------|----------|
| `xhs_note_search` | 笔记搜索 | 13 | keyword, page, sort_type, note_type, time_filter |
| `xhs_note_detail` | 笔记详情 | 10 | note_id / share_text |
| `xhs_note_comments` | 笔记评论 | 13 | note_id / share_text, cursor, sort_strategy |
| `xhs_user_info` | 账号信息 | 13 | user_id / share_text |
| `xhs_user_notes` | 账号作品 | 13 | user_id / share_text, cursor |

### 微信视频号 MCP 工具

| MCP 工具名 | 功能 | 积分/次 |
|------------|------|---------|
| `wechat_channels_video_search` | 视频搜索 | 13 |
| `wechat_channels_video_detail` | 视频详情 | 10 |
| `wechat_channels_video_comments` | 视频评论 | 13 |
| `wechat_channels_video_share_url` | 视频分享链接 | 13 |
| `wechat_channels_user_profile` | 账号信息 | 13 |
| `wechat_channels_user_videos` | 账号作品 | 13 |

### 微信公众号 MCP 工具

| MCP 工具名 | 功能 | 积分/次 |
|------------|------|---------|
| `wechat_mp_article_detail` | 文章详情 | 10 |
| `wechat_mp_article_comments` | 文章评论 | 13 |
| `wechat_mp_account_profile` | 账号资料 | 13 |
| `wechat_mp_account_articles` | 账号文章列表 | 13 |

---

## 三、接入方式说明

### MCP 接入
- **Endpoint**：`/v1/mcp` 或 `/v1/mcp/{platform}`
- **鉴权**：`Authorization: Bearer <Firefly API Key>`
- **幂等**：传入 `request_id` 防止重复扣费

### REST API 接入
- **基础路径**：`/v1/{platform}/{capability}`
- **鉴权**：`X-API-Key: <Firefly API Key>`
- **幂等**：`X-Request-Id` 请求头

### 响应格式（统一信封）
```json
{
  "code": 0,
  "msg": "success",
  "request_id": "agent-request-id",
  "credits_charged": 2,
  "balance": 98,
  "data": {}
}
```

### 错误码
| HTTP | code | msg | 说明 |
|------|------|-----|------|
| 400 | 1001 | 参数错误 | |
| 401 | 1401 | 密钥无效 | |
| 402 | 1402 | 积分不足 | |
| 404 | 1404 | 能力不存在 | |
| 429 | 1429 | 请求过于频繁 | |
| 404 | 2404 | 内容不存在或未收录 | |
| 502 | 1502 | 上游数据源暂不可用 | |
| 503 | 1503 | 服务繁忙 | |
| 504 | 1504 | 上游超时 | |

---

## 四、方法论 → MCP 能力映射

将视频中的五阶段方法论与 MCP 能力进行映射：

### 阶段1：挖掘选题

**视频中的动作**：调用自媒体调研 Skill，搜索相关内容，列出候选选题清单

**可使用的 MCP 工具**：

| 动作 | MCP 工具 | 说明 | 成本 |
|------|----------|------|------|
| 搜索热门内容 | `douyin_video_search` / `xhs_note_search` | 按关键词搜索，获取热门视频/笔记 | 13 积分/次 |
| 筛选高赞内容 | 搜索接口的 sort_type 参数 | 按点赞排序，找到爆款 | - |
| 按时间筛选 | 搜索接口的 publish_time / time_filter | 限定最近一周/半年的内容 | - |

**选题挖掘工作流设计**：
1. 输入领域关键词（如 "AI 工具"）
2. 调用搜索接口，按最多点赞排序，限定最近一周
3. 取前 20 条高赞内容
4. 分析标题和描述中的高频关键词
5. 生成候选选题清单

**积分成本估算**：13 积分/平台 ≈ ¥0.13/平台

---

### 阶段2：研究对标账号

**视频中的动作**：发送爆款视频链接或博主主页链接，整理账号信息，生成账号拆解报告

**可使用的 MCP 工具**：

| 动作 | MCP 工具 | 说明 | 成本 |
|------|----------|------|------|
| 获取账号信息 | `douyin_user_info` / `xhs_user_info` | 粉丝数、获赞数、简介等 | 2-13 积分/次 |
| 获取账号作品列表 | `douyin_user_videos` / `xhs_user_notes` | 查看全部作品，分析内容规律 | 2-13 积分/次 |
| 通过分享链接解析 | video_detail / note_detail | 用户贴链接后先解析出 ID | 10 积分/次 |

**账号拆解工作流设计**：
1. 输入账号链接或 sec_user_id / user_id
2. 调用账号信息接口，获取基础数据
3. 调用账号作品接口，获取作品列表（取前 30 条）
4. 对作品数据进行分析：
   - 内容主题分类
   - 发布频率和时间规律
   - 爆款作品（高赞高评论）筛选
   - 互动数据统计（平均点赞、评论、转发）
5. 生成账号拆解报告

**积分成本估算**（抖音）：2 + 2 = 4 积分 ≈ ¥0.04/账号
**积分成本估算**（小红书）：13 + 13 = 26 积分 ≈ ¥0.26/账号

---

### 阶段3：拆解爆款结构

**视频中的动作**：提炼高频选题、开头钩子和内容结构

**可使用的 MCP 工具**：

| 动作 | MCP 工具 | 说明 | 成本 |
|------|----------|------|------|
| 获取爆款详情 | `douyin_video_detail` / `xhs_note_detail` | 获取标题、描述、正文等完整内容 | 10 积分/次 |
| 获取评论内容 | `douyin_video_comments` / `xhs_note_comments` | 分析用户反馈、高频问题 | 2-13 积分/次 |

**爆款拆解工作流设计**：
1. 输入 3-5 个爆款内容链接
2. 调用详情接口，获取完整内容（标题、正文/文案、标签等）
3. 调用评论接口，获取热门评论
4. 对内容进行结构化分析：
   - 开头钩子分析（前 3 秒/前 30 字）
   - 内容结构拆解（起承转合）
   - 高频选题方向提取
   - 金句/亮点提取
   - 评论区热点问题提取
5. 生成爆款结构分析报告 + 可复用模板

**积分成本估算**（抖音，5 条爆款）：(10 + 2) × 5 = 60 积分 ≈ ¥0.60
**积分成本估算**（小红书，5 条爆款）：(10 + 13) × 5 = 115 积分 ≈ ¥1.15

---

### 阶段4：生成内容初稿

**视频中的动作**：加入自己的人设和经历，生成专属视频初稿

**MCP 能力支撑**：
- 此阶段主要依赖 LLM 的生成能力
- MCP 提供数据支撑（前面三个阶段的数据积累）
- 人设信息由用户配置

**初稿生成工作流设计**：
1. 输入选定的选题
2. 基于爆款结构模板
3. 注入用户人设信息（背景、风格、经历等）
4. 生成内容初稿
5. 输出格式：文案/脚本

**积分成本估算**：0 积分（纯 LLM 生成，不消耗 API 积分）

---

## 五、能力覆盖评估

### 视频方法论 vs MCP 能力对比

| 视频中的能力 | MCP 是否支持 | 说明 |
|-------------|-------------|------|
| 搜索热门内容 | ✅ 支持 | video_search / note_search |
| 按点赞/时间筛选 | ✅ 支持 | sort_type + publish_time 参数 |
| 账号基础信息 | ✅ 支持 | user_info |
| 账号作品列表 | ✅ 支持 | user_videos / user_notes |
| 内容详情（标题/文案） | ✅ 支持 | video_detail / note_detail |
| 评论获取 | ✅ 支持 | video_comments / note_comments |
| 通过分享链接解析 | ✅ 支持 | share_url / share_text 参数 |
| 多平台统一搜索 | ✅ 支持 | 4 个平台，各自独立接口 |
| 内容分析（自动拆解） | ❌ 不支持 | 需要 LLM 自己分析数据 |
| 初稿生成 | ❌ 不支持 | 需要 LLM 自己生成 |

### 结论
MCP 提供了**数据获取能力**，而**分析和生成能力**需要由 Skill 中的 LLM 来完成。Skill 的核心价值在于：
1. 封装数据获取的流程（调用哪些接口、参数怎么传）
2. 提供分析框架（如何从数据中提炼选题、结构、规律）
3. 串联工作流（选题 → 对标 → 拆解 → 生成）

---

## 六、关键发现与注意事项

### 1. 抖音性价比最高
抖音的账号信息、账号作品、评论接口仅需 2 积分/次，远低于其他平台。适合大量采集数据。

### 2. 搜索接口成本最高
所有平台的搜索接口都是 13 积分/次，应合理使用搜索次数，尽量通过账号作品接口批量获取内容。

### 3. 幂等机制
传入 request_id 可以防止重复扣费，Skill 中应该自动生成幂等键。

### 4. 失败不扣费
上游超时、内容未收录、参数错误等失败场景不扣积分。可以放心调用。

### 5. 余额前置拦截
余额不足时会在打数据源前返回，避免无意义消耗。Skill 中可以适当提示用户余额。

### 6. API 基础域名待确认
文档示例使用 `api.example.com` 作为占位符，实际 API 域名需要确认（可能是 `firefly.qwjxqn.xyz` 或 `api.firefly.qwjxqn.xyz`）。

---

## 七、待确认事项

1. **API 基础域名**：实际调用的 base URL 是什么？
2. **MCP 服务端部署**：是直接调用 Firefly 的 MCP endpoint，还是需要自己部署 MCP server？
3. **数据返回结构**：各接口返回的具体字段有哪些（影响分析逻辑设计）？
4. **分享链接支持范围**：抖音的 share_url 和小红书的 share_text 支持哪些格式的链接？

---

## 八、下一步

确认 API 基础 URL 和接入方式后，进入第三阶段：
- Skill 架构设计
- 模块划分和接口定义
- 工作流编排设计
