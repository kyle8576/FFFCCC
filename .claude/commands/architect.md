# /architect - 系統架構設計

正在讀取系統架構師 Agent...

請按照以下步驟執行：

1. **讀取 Agent Skill**：讀取 `.claude/skills/architect_agent/SKILL.md` 內容並按照其框架執行。

2. **讀取產品規格**：讀取 `dev/PRODUCT_SPEC.md` 確認總體目標和功能需求。

3. **執行架構師職責**：
   - 分析產品規格，識別系統模組
   - 將需求拆解為可並行執行的任務
   - 為每個任務定義 Scope（路徑範圍）
   - 設定任務之間的依賴關係
   - 將任務分派給適合的 Agent
   - 撰寫模組接口規範

4. **產出文件**：
   - 更新 `dev/pipeline/TASK_QUEUE.json`
   - 建立任務文件至 `dev/pipeline/tasks/`
   - 撰寫接口文檔至 `docs/`

請開始執行系統架構設計。
