# Product Specification
# 16 人單淘汰賽程系統（Monolith）

## Feature ID Index

| Feature ID | 名稱 | 優先級 | 狀態 |
|------------|------|--------|------|
| F-001 | 賽程資料模型與狀態管理 | P1 | pending |
| F-002 | 賽程狀態 API | P1 | pending |
| F-003 | 管理操作 API | P1 | pending |
| F-004 | WebSocket 即時推播 | P1 | pending |
| F-005 | 狀態持久化 | P2 | pending |
| F-006 | 觀眾端賽程展示 | P1 | pending |
| F-006.1 | Viewer 頁面版型 | P1 | pending |
| F-006.2 | Bracket 組件渲染 | P1 | pending |
| F-006.3 | LIVE 高亮與狀態顯示 | P1 | pending |
| F-006.4 | WebSocket 訂閱 | P1 | pending |
| F-007 | 管理端控制介面 | P1 | pending |
| F-007.1 | Admin 頁面與驗證 | P1 | pending |
| F-007.2 | setLive / setWinner 互動 | P1 | pending |
| F-007.3 | Undo 與操作回饋 | P1 | pending |
| F-008 | UI/UX 設計規範 | P1 | pending |
| F-009 | RWD 響應式設計 | P1 | pending |
| F-009.1 | RWD 設計規範 | P1 | pending |
| F-009.2 | Viewer 頁面 RWD | P1 | pending |
| F-009.3 | Admin 頁面 RWD | P1 | pending |

---

## Overview

用一個單體服務（Monolith）提供賽程展示頁、管理頁、狀態 API 與即時同步，讓賽事進行可被「治理」，觀眾端可即時看到當前進行的賽局與晉級結果。

### 使用情境
- 小型活動 / 公司內部賽事 / 現場螢幕投影
- 需要一個「一鍵啟動」的賽程顯示系統
- 現場管理者可快速點選晉級、設定 LIVE，觀眾端自動更新

### 技術架構
- **前後端不分離（Monolith）**
- 同一個後端同時提供：
  - 靜態頁面（觀眾端、管理端）
  - API（`GET /state`、`POST /action`）
  - WebSocket（`/ws`）做即時推播
- 權限採用 **假權限（低門檻防呆）**

---

## Features

### F-001: 賽程資料模型與狀態管理
**描述**：建立 16 人單淘汰賽的完整資料模型

**Players 資料結構**：
- `id`: p1~p16
- `name`: Team 1~Team 16

**Matches 資料結構**：
- `id`: m1~m15
- `round`: R16/QF/SF/F
- `a`, `b`: playerId 或 null（TBD）
- `winner`: playerId 或 null
- `status`: pending/live/done
- `next`: `{ id: "m9", slot: "a" }` 或 null（決賽）

**State 資料結構**：
- `players[]`
- `matches{}`
- `liveMatchId`
- `history[]`（undo 快照）
- `updatedAt`

**Bracket 對戰表**：
```
R16 (8場)     QF (4場)      SF (2場)      F (1場)
m1 ─┬─ m9 ─┬
m2 ─┘      │─ m13 ─┬
m3 ─┬─ m10 ┘       │
m4 ─┘              │─ m15 (Final)
m5 ─┬─ m11 ─┬      │
m6 ─┘       │─ m14 ┘
m7 ─┬─ m12 ─┘
m8 ─┘
```

---

### F-002: 賽程狀態 API
**描述**：提供 GET /state 端點回傳完整賽程狀態

**端點**：`GET /state`

**回應格式**：
```json
{
  "players": [...],
  "matches": {...},
  "liveMatchId": "m6" | null,
  "updatedAt": "2026-02-04T12:00:00Z"
}
```

---

### F-003: 管理操作 API
**描述**：提供 POST /action 端點執行管理操作

**端點**：`POST /action`

**Header**：`x-admin-pass: <password>`

**支援的 Action Types**：

1. **setLive**
   ```json
   { "type": "setLive", "matchId": "m6" }
   ```
   - 條件：`a` 與 `b` 都已確定且 `winner` 尚未產生

2. **setWinner**
   ```json
   { "type": "setWinner", "matchId": "m6", "winnerSlot": "a" }
   ```
   - 設定勝者並推進至下一輪

3. **undo**
   ```json
   { "type": "undo" }
   ```
   - 撤回上一個操作

4. **reset**（可選）
   ```json
   { "type": "reset" }
   ```
   - 重置整個賽程

---

### F-004: WebSocket 即時推播
**描述**：透過 WebSocket 即時同步狀態給所有連線的客戶端

**端點**：`WS /ws`

**行為**：
- 連線後 server 立即推一次完整 state
- state 變更後 broadcast 給所有 clients

---

### F-005: 狀態持久化
**描述**：將狀態落盤至 state.json，重啟後可回復

**檔案**：`state.json`

**行為**：
- 每次狀態變更後寫入檔案
- 服務啟動時讀取並回復狀態

---

### F-006: 觀眾端賽程展示
**描述**：觀眾端頁面展示完整賽程

#### F-006.1: Viewer 頁面版型
- Header：標題 + 管理員按鈕
- LIVE 區塊：顯示目前賽局或「尚未設定」
- Bracket 區：四輪欄位布局

#### F-006.2: Bracket 組件渲染
- 顯示四輪：R16（8場）、QF（4場）、SF（2場）、F（1場）
- 每場比賽卡片包含：
  - matchId
  - round 標籤
  - A/B 選手名稱（缺席顯示 TBD）
  - WIN 標記（已結束場次）

#### F-006.3: LIVE 高亮與狀態顯示
- LIVE 場次高亮（外框、陰影、標籤）
- 頁面上方顯示 LIVE 快訊

#### F-006.4: WebSocket 訂閱
- 自動訂閱 state 更新
- 斷線時 fallback 至輪詢（每 3 秒）

---

### F-007: 管理端控制介面
**描述**：管理端頁面提供賽程控制功能

#### F-007.1: Admin 頁面與驗證
- 密碼輸入框
- 從 Viewer 跳轉：prompt 密碼 → `/admin?pass=...`

#### F-007.2: setLive / setWinner 互動
- 點擊 match 卡片 → setLive
- 點擊 A/B 選手 → setWinner

#### F-007.3: Undo 與操作回饋
- Undo 按鈕
- 操作錯誤提示（Toast/Alert）

---

### F-008: UI/UX 設計規範
**描述**：定義整體視覺風格與互動規範

**視覺優先級**：
1. LIVE 最醒目（高亮外框、動態效果）
2. done 場次次醒目（WIN 標籤）
3. TBD 最弱（灰色/提示）

**色彩系統**：
- 主色：用於 LIVE 高亮
- 勝利色：用於 WIN 標記
- 中性色：用於一般狀態
- 禁用色：用於 TBD

---

### F-009: RWD 響應式設計
**描述**：讓觀眾端與管理端支援手機與桌面兩種螢幕尺寸

#### F-009.1: RWD 設計規範
- **斷點定義**：
  - 桌面：≥768px（預設佈局）
  - 手機：<768px（響應式佈局）
- **Bracket 手機版策略**：
  - 方案 A：垂直堆疊（每輪獨立區塊，上下滾動）
  - 方案 B：橫向滾動（保持四欄，左右滑動）
  - 推薦方案 A，更適合單手操作
- **觸控優化**：點擊區域至少 44x44px

#### F-009.2: Viewer 頁面 RWD
- Header 響應式（標題縮短、按鈕圖示化）
- LIVE 區塊在手機上置頂固定或摺疊
- Bracket 區依設計規範調整佈局
- 字體大小響應式縮放

#### F-009.3: Admin 頁面 RWD
- 管理按鈕在手機上放大（觸控友好）
- setLive/setWinner 操作區域加大
- Undo 按鈕固定在螢幕底部（手機版）
- 密碼輸入框適配軟鍵盤

---

## Technical Requirements

### 技術棧
- **後端**：Node.js + Express + ws
- **前端**：原生 HTML/CSS/JS 或輕量框架
- **資料儲存**：記憶體 + state.json 落盤

### API 規格
| 端點 | 方法 | 描述 |
|------|------|------|
| `/` | GET | 觀眾端頁面 |
| `/admin` | GET | 管理端頁面 |
| `/state` | GET | 取得完整狀態 |
| `/action` | POST | 執行管理操作 |
| `/ws` | WS | 即時推播 |

### 非功能需求
- **部署簡單**：一台 Node 服務即可啟動
- **可靠性**：重啟後可從 state.json 回復
- **可維護性**：state、action、render 分層清楚
- **低延遲**：WS 推播 < 1 秒，輪詢保底 < 3 秒
- **防呆**：不可設置不完整對戰為 LIVE；不可重複設定 winner

---

## Target Users

### 觀眾端（Viewer）
- 只讀權限
- 觀看賽程與 LIVE 狀態

### 管理端（Admin）
- 透過假密碼進入
- 對賽程狀態進行控制
- 操作：setLive、setWinner、undo

---

## Success Metrics

1. 管理者在 **5 秒內**可完成一次「設 LIVE + 決定勝者」操作
2. 觀眾端在 **1 秒內**收到狀態更新（WS 推播）
3. 任一輪次晉級後，下一輪對戰卡片能正確顯示選手（無 TBD 漏洞）

---

## Acceptance Criteria

1. 觀眾端可看到完整 16 人單淘汰賽程
2. 管理端可成功設定任意一場為 LIVE（符合條件才可）
3. 管理端可點擊 A/B 產生勝者，並自動推進下一輪
4. 觀眾端能即時看到 LIVE 與晉級變化（WS）
5. Undo 可撤回上一個操作並同步到所有端

---

## Out of Scope（本期不做）

- 真正的使用者系統、登入、RBAC 權限
- 多場同時 LIVE、賽程自動排程、時間表
- BO3/BO5、比分、局數、計時器
- 選手資料管理後台
- 公網部署與安全加固（HTTPS、Rate limit、CSRF）

---

## Milestones

### M1 — MVP 可用
- Monolith server（Express + ws）
- `/` Viewer 頁
- `/admin` Admin 頁（假密碼跳轉）
- `GET /state` + `POST /action`
- WS 即時推播 + Viewer 高亮 LIVE
- setLive / setWinner / undo 完整流程

### M2 — 視覺優化（可選）
- Bracket 連接線（SVG 或 CSS）
- RWD 排版調整
- 操作回饋（toast、確認提示）

---

*Created by Product Manager Agent on 2026-02-04*
