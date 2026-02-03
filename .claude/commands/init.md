# /init - 初始化新專案

## 用途
快速重置 Pipeline 狀態並準備開始新專案開發。

## 執行步驟

### 1. 清理舊狀態
執行以下清理操作：

```powershell
# 清空任務目錄
Remove-Item dev/pipeline/tasks/*.md -Force -ErrorAction SilentlyContinue

# 備份已完成任務到 archive
$archiveDir = "dev/pipeline/archive/$(Get-Date -Format 'yyyy-MM-dd_HHmmss')"
New-Item -ItemType Directory -Path $archiveDir -Force
Move-Item dev/pipeline/completed/*.md $archiveDir -Force -ErrorAction SilentlyContinue

# 刪除狀態文件
Remove-Item dev/pipeline/SELF_ENHANCEMENT_STATUS.json -Force -ErrorAction SilentlyContinue
```

### 2. 重置 PROGRESS.md
將 `dev/pipeline/PROGRESS.md` 重置為初始狀態：

```markdown
# Pipeline Progress Tracking

## Last Update
- **Time**: [當前時間]
- **Agent**: System
- **Session**: Project Initialized

---

## Current Status

### Running Tasks
| Task ID | Name | Progress | Next Step |
|--------|------|-----|-------|
| - | None | - | Run /產品 to start |

### Pending Task Queue
| Priority | Task ID | Name | Status | Est. Hours |
|-------|--------|------|-----|---------|
| - | - | None | - | - |

### Completed Tasks
| Task ID | Name | Completion Date |
|--------|------|---------|
| - | - | - |

---

## Statistics

### Overall Progress
\`\`\`
Total Tasks: 0
Completed: 0 (0%)
In Progress: 0 (0%)
Pending: 0 (0%)
Blocked: 0 (0%)
\`\`\`

### Project Status
\`\`\`
⏳ Waiting for product requirements...
Run /產品 to start requirement analysis
\`\`\`
```

### 3. 檢查 PRODUCT_SPEC
- 如果 `dev/PRODUCT_SPEC.md` 存在且內容豐富（>50行），詢問用戶是否保留
- 如果不存在，從模板建立

### 4. 輸出初始化摘要

```
========================================
初始化完成！
========================================
已清理: X 個舊任務
已備份: X 個已完成任務
PROGRESS.md: 已重置

下一步:
1. 描述你的產品想法，或使用 /產品
2. 準備好後執行 /dev 或排程腳本
========================================
```

### 5. 詢問是否開始需求分析

詢問用戶：
> 是否現在開始需求分析？請描述你的產品想法，我會以 Product Manager 角色幫你分析並建立任務。

## 快捷方式

也可以使用批次檔：
```powershell
.\dev\scripts\INIT_PROJECT.bat
```

## 參數

| 參數 | 說明 |
|------|------|
| `-SkipRAG` | 跳過 RAG 環境設置 |
| `-SkipCleanup` | 跳過清理舊任務 |
| `-Quiet` | 靜默模式（無互動確認） |
