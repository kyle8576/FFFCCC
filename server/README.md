# Tournament WebSocket Server

即時同步賽程狀態的 WebSocket 服務器。

## 本地運行

```bash
cd server
npm install
npm start
```

服務器會在 `ws://localhost:8080` 運行。

## 部署到 Fly.io

### 1. 安裝 Fly CLI

```bash
# Windows (PowerShell)
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# 或使用 npm
npm install -g flyctl
```

### 2. 登入 Fly.io

```bash
fly auth login
```

### 3. 部署

```bash
cd server
fly launch --name tournament-bracket-ws --region nrt --no-deploy
fly deploy
```

### 4. 獲取 WebSocket URL

部署完成後，WebSocket URL 為：
```
wss://tournament-bracket-ws.fly.dev
```

### 5. 更新前端環境變數

在專案根目錄建立 `.env` 文件：
```
VITE_WS_URL=wss://tournament-bracket-ws.fly.dev
```

然後重新建構前端：
```bash
npm run build
```

## 架構說明

```
[Admin 瀏覽器] ──WebSocket──┐
                            │
[Viewer 瀏覽器 1] ──WebSocket──┼──→ [Fly.io WebSocket Server]
                            │         ↓
[Viewer 瀏覽器 2] ──WebSocket──┘    廣播狀態更新給所有連接的客戶端
```
