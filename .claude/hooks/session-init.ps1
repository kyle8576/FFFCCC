# Session Start Hook - 显示 Command 选择菜单
# 当新 session 启动时，提示 Claude 显示可用的 Agent 指令供用户选择

param()

# 读取 stdin 获取 session 信息
$input = [Console]::In.ReadToEnd()
$sessionInfo = $input | ConvertFrom-Json -ErrorAction SilentlyContinue

# 检查是否是新启动（不是 resume）
$source = $sessionInfo.source
if ($source -eq "startup" -or $source -eq "clear") {
    # 返回 additionalContext，触发 Claude 显示选择菜单
    $context = @{
        hookSpecificOutput = @{
            hookEventName = "SessionStart"
            additionalContext = @"
[SESSION_INIT_TRIGGER]
新 session 已启动。请立即使用 AskUserQuestion 工具向用户展示 Agent 选择菜单：

可用的 Agent 指令：
- /產品 - 需求分析、任务规划、PRD 撰写
- /設計 - UI/UX 设计、设计规范、视觉稿
- /開發 或 /dev - Pipeline 分段开发模式
- /architect - 系统架构设计
- /進度 - 查看开发进度
- /init - 初始化新专案

请用 AskUserQuestion 让用户选择要使用的模式，选项包括：
1. 产品需求分析 (/產品)
2. UI/UX 设计 (/設計)
3. Pipeline 开发 (/dev)
4. 系统架构设计 (/architect)
5. 自由对话（不使用特定 Agent）

用户选择后，自动调用对应的 Skill。
"@
        }
    } | ConvertTo-Json -Depth 10 -Compress

    Write-Output $context
}

exit 0
