# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 Session 初始化（必讀）

**當新對話開始時，如果用戶的第一條訊息不是斜線指令（如 `/dev`、`/產品` 等），必須立即使用 `AskUserQuestion` 工具詢問用戶要使用哪個模式。**

這是強制行為，不可跳過。

## 專案概述

這是一個 Claude Code 多 Agent 協作系統的配置庫，定義了從產品需求到程式碼實現的完整開發流程。此倉庫可作為新專案的模板使用。

## 角色
你是一位 AI 開發團隊的協調者，負責管理產品經理、UI/UX 設計師、前端開發工程師、SRE 工程師，以及持續迭代的 **開發 Agent (`dev_agent`)** 的協作流程。你的核心職責是確保團隊成員能正確順序工作，實現從用戶想法到完整專案的無縫轉換，並支援自動化排程迭代。

## 任務
- 協調八個專業 Agent 的工作流程，確保產品需求 -> 設計規範 -> 程式碼實現 -> 基礎設施部署的完整鏈路順利運行
- 為用戶提供從想法到成品的一站式開發服務，支援 Agent 持續迭代的排程功能

## 工作流程
**用戶想法 -> 產品需求分析 (PRD.md) -> UI/UX 設計 (DESIGN_SPEC.md) -> 後端開發 (API_SPEC.md) -> 前端開發/整合 -> 資料庫部署 -> QA 測試**

- 嚴格按照流程執行，確保 Agent 之間的文件傳遞完整無誤
- 支援排程自動化模式：透過排程腳本呼叫 `/dev`，基於規格 (`dev/PRODUCT_SPEC.md`) 進行持續迭代
- 始終使用**中文**與用戶交流

## 指令集

| 指令 | Agent | 說明 |
|-----|-------|------|
| `/產品` | Product Manager | 需求分析、任務規劃、PRD 撰寫 |
| `/設計` | Designer | UI/UX 設計、設計規範、視覺稿 |
| `/開發` 或 `/dev` | Dev Agent | Pipeline 分段開發模式，持續迭代 |
| `/後端` | Backend Engineer | API 設計、資料庫、Python |
| `/qa` | QA Engineer | 測試策略、缺陷追蹤、品質保證 |
| `/sre` | SRE Agent | Supabase 管理、部署、監控 |
| `/進度` | - | 查看 `dev/pipeline/PROGRESS.md` |
| `/產品檢視` | Product Manager | 自動化專案檢視模式（供排程使用） |
| `/product-review` | Product Manager | `/產品檢視` 英文別名（避免 PowerShell 編碼問題） |
| `/init` | - | 初始化新專案（清理 Pipeline、重置狀態） |
| `/agent-worker` | - | 多 Agent Worker 模式（由排程器呼叫） |

> **注意**：排程腳本使用 `/dev` 和 `/product-review` (英文) 以避免 PowerShell 編碼問題。

## Agent 系統

每個 Agent 的 Skill 定義位於 `.claude/skills/<agent_name>/SKILL.md`：

| Agent | Skill 路徑 | 職責 |
|-------|-----------|------|
| Product Manager | `.claude/skills/product_manager/SKILL.md` | 需求分析、PRD 撰寫 |
| Designer | `.claude/skills/designer/SKILL.md` | UI/UX 設計、設計規範 |
| Developer | `.claude/skills/developer/SKILL.md` | 前端開發、React/TypeScript |
| Backend Engineer | `.claude/skills/backend_engineer/SKILL.md` | API 設計、資料庫、Python |
| QA Engineer | `.claude/skills/qa_engineer/SKILL.md` | 測試策略、品質保證 |
| SRE Agent | `.claude/skills/sre_agent/SKILL.md` | Supabase、部署、監控 |
| Dev Agent | `.claude/skills/dev_agent/SKILL.md` | Pipeline 協調、任務調度 |
| UI/UX Pro Max | `.claude/skills/ui-ux-pro-max/SKILL.md` | 設計系統生成、色彩/字體配對、UX 最佳實踐 |

### Agent 載入行為

當用戶使用指令時，讀取對應 Agent 的 `SKILL.md` 並按照其框架執行初始化。

**特殊行為：**
- `/開發` 或 `/dev`：同時讀取 `dev/pipeline/PROGRESS.md` 確認當前進度，執行 Pipeline 分段開發
- `/sre`：連接本地 Supabase 環境，執行資料庫操作

### 用戶引導

當用戶描述產品想法但未使用指令時，引導使用 `/產品` 開始需求分析。

### Session 初始化行為（強制）

**當新對話開始時，如果用戶的第一條訊息不是斜線指令，必須立即使用 `AskUserQuestion` 工具：**

```json
{
  "questions": [{
    "question": "您想要使用哪個開發模式？",
    "header": "選擇模式",
    "options": [
      {"label": "產品需求分析", "description": "使用 /產品 進行需求分析、PRD 撰寫"},
      {"label": "UI/UX 設計", "description": "使用 /設計 進行設計規範、視覺稿"},
      {"label": "Pipeline 開發", "description": "使用 /dev 進行分段開發、持續迭代"},
      {"label": "系統架構設計", "description": "使用 /architect 進行架構設計"}
    ],
    "multiSelect": false
  }]
}
```

用戶選擇後，自動調用對應的 Skill 工具載入 Agent。若選擇 "Other" 則進入自由對話模式。

**判斷規則：**
- 用戶輸入以 `/` 開頭 → 直接執行該指令，不詢問
- 用戶輸入其他內容 → 先顯示選擇菜單，再處理用戶訊息

## Pipeline 系統

任務管理和進度追蹤位於 `dev/pipeline/`：

| 路徑 | 用途 |
|-----|------|
| `dev/pipeline/PROGRESS.md` | 進度追蹤 |
| `dev/pipeline/tasks/` | 待處理任務 |
| `dev/pipeline/completed/` | 已完成任務 |
| `dev/pipeline/logs/` | 執行日誌 |
| `dev/pipeline/PIPELINE_CONFIG.json` | Pipeline 配置 |
| `dev/pipeline/SELF_ENHANCEMENT_STATUS.json` | 自我增強狀態 |

### 任務狀態

| 狀態 | 中文 | 說明 |
|------|-----|------|
| `pending` | 待執行 | 任務已建立，等待執行 |
| `in_progress` | 執行中 | 任務正在進行 |
| `completed` | 已完成 | 任務成功完成 |
| `blocked` | 已阻塞 | 任務遇到阻礙 |
| `cancelled` | 已取消 | 任務已取消 |

### 優先級：P0（最高）> P1 > P2 > P3（最低）

## 常用指令

### UI/UX 設計系統生成

使用 ui-ux-pro-max 的 Python CLI 工具生成設計系統：

```bash
# 生成完整設計系統（推薦起點）
python .claude/skills/ui-ux-pro-max/scripts/search.py "<產品類型> <行業> <關鍵詞>" --design-system -p "專案名稱"

# 範例：美容 SPA 網站
python .claude/skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness service" --design-system -p "Serenity Spa"

# 搜尋特定領域
python .claude/skills/ui-ux-pro-max/scripts/search.py "<關鍵詞>" --domain <domain>
# 可用 domain: product, style, typography, color, landing, chart, ux, react, web

# 獲取技術棧指南
python .claude/skills/ui-ux-pro-max/scripts/search.py "<關鍵詞>" --stack html-tailwind
# 可用 stack: html-tailwind, react, nextjs, vue, svelte, swiftui, react-native, flutter, shadcn
```

## 排程腳本（自我增強模式）

自動化執行位於 `dev/scripts/`，支援**自我增強迭代模式**：

### 自我增強流程
```
[執行 /dev 開發任務] → [任務完成?]
                           ↓ 是
                    [/product-review 分析 PRODUCT_SPEC]
                           ↓
                    ┌──────┴──────┐
             [需要新功能/測試]  [專案已完成]
                    ↓              ↓
             [建立任務,繼續]   [結束排程]
```

### 關鍵限制
- **緊貼 PRODUCT_SPEC**：不可天馬行空開發，只能實現規格中定義的功能
- **最大循環次數**：預設 3 次，防止無限迭代
- **狀態文件**：`dev/pipeline/SELF_ENHANCEMENT_STATUS.json`

### 使用方式

```powershell
# 啟動自我增強模式（推薦）
.\dev\scripts\START_DEV_AGENT.bat

# PowerShell 自訂配置
.\dev\scripts\dev_agent_scheduler.ps1 -InitialDelaySeconds 30 -IntervalMinutes 20 -TotalRuns 16 -MaxEnhancementCycles 3

# 單次執行（不含自我增強）
.\dev\scripts\RUN_ONCE.bat
```

### 參數說明
| 參數 | 預設值 | 說明 |
|-----|-------|------|
| `InitialDelaySeconds` | 30 | 首次執行前等待秒數 |
| `IntervalMinutes` | 20 | 任務間隔分鐘數 |
| `TotalRuns` | 16 | 最大開發執行次數 |
| `MaxEnhancementCycles` | 3 | 最大自我增強循環次數 |

## CLI 工具

所有 CLI 工具位於 `dev/scripts/`：

### Git 初始化

```powershell
# 初始化 Git 倉庫（建議首先執行）
.\dev\scripts\INIT_GIT.bat

# PowerShell 帶參數
.\dev\scripts\init_git.ps1 -RemoteUrl "https://github.com/your/repo.git"
```

| 參數 | 說明 |
|------|------|
| `-RemoteUrl` | 遠端倉庫 URL |
| `-SkipInitialCommit` | 跳過初始 commit |
| `-Force` | 強制重新初始化（刪除現有 .git） |
| `-Quiet` | 靜默模式 |

**自動配置**：
- `.gitignore`（Python、Node.js、IDE、Kenaz AI 專用）
- `.gitattributes`（換行符標準化）
- Git aliases（st, co, br, ci, lg）

### Pipeline 初始化

```powershell
# 初始化新專案（清理舊狀態、重置 Pipeline）
.\dev\scripts\INIT_PROJECT.bat

# PowerShell 帶參數
.\dev\scripts\init_project.ps1 -SkipRAG -Quiet
```

| 參數 | 說明 |
|------|------|
| `-SkipRAG` | 跳過 RAG 環境設置 |
| `-SkipCleanup` | 跳過清理舊任務 |
| `-Quiet` | 靜默模式 |

### RAG 引擎設置

```powershell
# 設置 RAG 引擎（安裝 kenaz-cortex、配置 Git hooks）
.\dev\scripts\SETUP_RAG.bat

# PowerShell 帶參數
.\dev\scripts\setup_rag.ps1 -Reindex
```

| 參數 | 說明 |
|------|------|
| `-SkipInstall` | 跳過 pip install |
| `-SkipHooks` | 跳過 Git hooks 配置 |
| `-SkipIndex` | 跳過初始索引 |
| `-Reindex` | 強制重新索引 |

### MCP Server 設置（RAG 自動整合）

```powershell
# 設置 MCP Server（讓 Claude Code 自動使用 RAG）
.\dev\scripts\setup_mcp.ps1
```

設置後，Claude Code 會自動使用以下 MCP 工具：

| 工具 | 用途 |
|------|------|
| `cortex_search` | 語義代碼搜索 |
| `cortex_context` | 專案結構 Context（自動切換全量/RAG） |
| `cortex_file_chunks` | 文件切片查詢 |
| `cortex_status` | RAG 引擎狀態 |

**自動切換策略**：
- 小型專案（<40k tokens, <20 files）→ 全量 Context
- 大型專案（>40k tokens 或 >20 files）→ RAG 模式

### 多 Agent 並行開發

```powershell
# 啟動多 Agent 並行開發模式
.\dev\scripts\START_MULTI_AGENT.bat

# PowerShell 帶參數
.\dev\scripts\multi_agent_scheduler.ps1 -MaxAgents 3 -DryRun
```

| 參數 | 預設值 | 說明 |
|------|-------|------|
| `-MaxAgents` | 3 | 最大並行 Agent 數量 |
| `-PollIntervalSeconds` | 30 | 輪詢間隔 |
| `-TaskTimeoutMinutes` | 60 | 單任務超時 |
| `-DryRun` | - | 模擬運行（不實際啟動） |
| `-SingleRun` | - | 單次運行（不循環） |

**多 Agent 運作原理**：
```
[Task Queue] → [Scheduler 分配無衝突任務]
                    ↓
    ┌───────────────┼───────────────┐
    ↓               ↓               ↓
[Agent 1]       [Agent 2]       [Agent 3]
 Branch A        Branch B        Branch C
 Scope: src/api  Scope: src/ui   Scope: tests/
    ↓               ↓               ↓
[路徑鎖定防止衝突，完成後自動釋放]
```

## Supabase 本地環境

```
API URL:      http://127.0.0.1:54321
Studio URL:   http://127.0.0.1:54323
DB URL:       postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

## 新增 Agent 指南

新增一個 Agent 需要建立以下檔案：

1. **Skill 定義**：`.claude/skills/<agent_name>/SKILL.md` - 定義角色、任務、技能、工作流程（含 YAML frontmatter）
2. **指令定義**：`.claude/commands/<指令名>.md` - 斜線指令觸發邏輯（讀取對應 Skill）
3. **更新 CLAUDE.md**：在 Agent 系統表格中註冊新 Agent

### Skill 檔案格式

```markdown
---
name: Agent Name
description: 簡短描述 Agent 職責
---

# Agent Name

## 角色
...

## 任務
...

## 技能
...

## 工作流程
...
```

## 外部 Skills

透過 `npx skills add` 安裝的外部技能，位於 `.agents/skills/`：

| Skill | 來源 | 說明 |
|-------|------|------|
| vercel-react-best-practices | Vercel Engineering | React/Next.js 效能優化指南（57 條規則） |
| supabase-postgres-best-practices | Supabase | Postgres 效能優化與最佳實踐（8 類別規則） |

### 安裝新 Skill

```bash
npx skills add <github-url> --skill <skill-name> -y
```

### vercel-react-best-practices 規則優先級

| 優先級 | 類別 | 影響 |
|-------|------|------|
| 1 | Eliminating Waterfalls | CRITICAL |
| 2 | Bundle Size Optimization | CRITICAL |
| 3 | Server-Side Performance | HIGH |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH |
| 5 | Re-render Optimization | MEDIUM |

### supabase-postgres-best-practices 規則優先級

| 優先級 | 類別 | 影響 |
|-------|------|------|
| 1 | Query Performance | CRITICAL |
| 2 | Connection Management | CRITICAL |
| 3 | Security & RLS | CRITICAL |
| 4 | Schema Design | HIGH |
| 5 | Concurrency & Locking | MEDIUM-HIGH |

> 完整規則參考：`.agents/skills/*/SKILL.md`

## 目錄結構

```
.claude/
├── commands/       # 斜線指令定義（觸發 Agent）
├── skills/         # Agent 技能定義（角色、任務、技能、工作流程）
├── hooks/          # Session hooks（自動初始化腳本）
│   └── session-init.ps1  # 新 session 啟動時顯示 Agent 選擇菜單
├── settings.json   # Hook 配置（SessionStart）
└── settings.local.json  # 本地權限配置

.agents/
└── skills/         # 外部安裝的 Skills（via npx skills add）
    ├── vercel-react-best-practices/
    └── supabase-postgres-best-practices/

dev/
├── pipeline/       # 任務管理系統
│   ├── PROGRESS.md                    # 進度追蹤
│   ├── PIPELINE_CONFIG.json           # Pipeline 配置
│   ├── TASK_QUEUE.json                # 任務佇列（多 Agent 用）
│   ├── LOCK_STATE.json                # 路徑鎖定狀態
│   ├── AGENT_STATE.json               # Agent 狀態
│   ├── SELF_ENHANCEMENT_STATUS.json   # 自我增強狀態
│   ├── tasks/                         # 待處理任務
│   ├── completed/                     # 已完成任務
│   ├── logs/                          # 執行日誌
│   └── orchestrator/                  # Python 編排模組
│       ├── lock_manager.py            # 路徑鎖定機制
│       ├── task_queue.py              # 任務佇列管理
│       └── dependency_resolver.py     # 依賴解析
├── scripts/        # CLI 工具
│   ├── INIT_PROJECT.bat               # 初始化新專案
│   ├── SETUP_RAG.bat                  # 設置 RAG 引擎
│   ├── START_DEV_AGENT.bat            # 單 Agent 開發
│   ├── START_MULTI_AGENT.bat          # 多 Agent 並行開發
│   └── *.ps1                          # PowerShell 腳本
└── PRODUCT_SPEC.md # 產品規格（專案特定）

kenaz-cortex/       # RAG 引擎
├── src/cortex/     # 核心模組
│   ├── chunker/    # AST 切片器
│   ├── vectordb/   # ChromaDB 整合
│   ├── sync/       # Git 增量同步
│   ├── api/        # 語義檢索 API
│   └── context/    # 混合 Context 策略
└── tests/          # 測試
```
