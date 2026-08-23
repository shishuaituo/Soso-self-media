# 存档目录说明

本目录存放 Soso-self-media Skill 的拆解成果和进化知识库。

## 目录结构

```
archive/
├── README.md              # 本文件
├── topics/                # 选题挖掘存档（按日期命名）
│   └── YYYY-MM-DD_关键词.md
├── accounts/              # 对标账号存档（按日期+账号名命名）
│   └── YYYY-MM-DD_账号名.md
├── breakdowns/            # 爆款拆解存档（按日期命名）
│   └── YYYY-MM-DD_N条样本.md
├── drafts/                # 初稿存档（可选，按日期命名）
│   └── YYYY-MM-DD_选题.md
└── knowledge/             # 进化知识库（随拆解自动更新）
    ├── hooks.md           # 钩子类型库
    ├── structures.md      # 结构模板库
    ├── quotes.md          # 行业金句库
    ├── topics-trends.md   # 选题趋势库
    └── insights.md        # 方法论洞察库
```

## 命名规则

- 选题存档：`YYYY-MM-DD_关键词.md`（如 `2026-08-23_板材避坑.md`）
- 账号存档：`YYYY-MM-DD_账号名.md`（如 `2026-08-23_锐哥聊装修.md`）
- 拆解存档：`YYYY-MM-DD_N条样本.md`（如 `2026-08-23_3条样本.md`）
- 初稿存档：`YYYY-MM-DD_选题.md`（如 `2026-08-23_板材避坑指南.md`）

## 存档格式

每个存档文件包含 YAML 元数据头 + 完整报告内容：

```yaml
---
date: 2026-08-23
platform: douyin
cost: 32
sample_count: 3
---
```

## 知识库更新规则

1. 每次拆解完成后，自动提取新知识并更新 knowledge/ 下对应文件
2. 新发现的钩子/结构/金句标注 "NEW" 来源
3. 各知识库文件头部记录"最后更新日期"和"已积累数量"
4. 已有条目不重复添加，仅追加新发现
