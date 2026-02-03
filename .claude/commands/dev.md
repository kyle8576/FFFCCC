# /dev - Pipeline 分段開發模式

正在讀取開發協調 Agent...

請按照以下步驟執行：

1. **讀取 Agent Skill**：讀取 `.claude/skills/dev_agent/SKILL.md` 內容並按照其框架執行。

2. **讀取當前進度**：讀取 `dev/pipeline/PROGRESS.md` 確認當前狀態。

3. **執行 Pipeline 流程**：
   - 【進度管理】：檢查待辦任務佇列
   - 【任務執行】：選取最優先任務並完成
   - 【日誌記錄】：寫入執行日誌至 `dev/pipeline/logs/`
   - 【更新進度】：更新 `dev/pipeline/PROGRESS.md`

請開始執行 Pipeline 開發迭代。
