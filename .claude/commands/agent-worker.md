# /agent-worker - Multi-Agent Worker Mode

## Purpose
This command is invoked by the Multi-Agent Scheduler to execute a specific task in parallel with other agents. Each agent works on an isolated Git branch.

## Arguments (parsed from prompt text)
- `--task <TASK_ID>`: The task ID to execute (required)
- `--agent <AGENT_ID>`: The agent instance ID (required)
- `--branch <BRANCH_NAME>`: The Git branch for this task (optional, defaults to current branch)

**Example prompt**: `/agent-worker --task TASK_003 --agent agent_135214_9209 --branch task/task_003`

## Execution Flow

### 1. Initialize Agent Context
Parse the arguments from this prompt text using regex or string parsing:
- `TASK_ID`: Extract value after `--task` (required)
- `AGENT_ID`: Extract value after `--agent` (required)
- `BRANCH_NAME`: Extract value after `--branch` (optional, use current branch if not provided)

**CRITICAL**: You MUST extract these values from the prompt text above. Example:
- If prompt is `/agent-worker --task TASK_003 --agent agent_123 --branch task/task_003`
- Then: TASK_ID=TASK_003, AGENT_ID=agent_123, BRANCH_NAME=task/task_003

### 2. Load Task Details
Read `dev/pipeline/TASK_QUEUE.json` and find the task matching `TASK_ID`.

Extract:
- `title`: Task name
- `description`: Task requirements (detailed task specification)
- `scope_paths`: Array of directories this task can modify
- `agent_type`: The agent type (developer, backend, architect, designer, qa, sre)
- `skill_path`: Path to the agent's SKILL.md file
- `priority`: Task priority (P0-P3)
- `requirements`: List of specific requirements (from YAML tasks)
- `acceptance_criteria`: List of acceptance criteria (from YAML tasks)

### 3. Load Agent Skill
Load the skill from `skill_path` field directly (already resolved by scheduler).

If `skill_path` is not present, use the agent_type mapping:

| Agent Type | Skill Path |
|------------|------------|
| developer | `.claude/skills/developer/SKILL.md` |
| backend | `.claude/skills/backend_engineer/SKILL.md` |
| architect | `.claude/skills/architect_agent/SKILL.md` |
| designer | `.claude/skills/designer/SKILL.md` |
| qa | `.claude/skills/qa_engineer/SKILL.md` |
| sre | `.claude/skills/sre_agent/SKILL.md` |
| frontend | `.claude/skills/frontend_agent/SKILL.md` |
| dev | `.claude/skills/dev_agent/SKILL.md` |

If no match found, use `.claude/skills/dev_agent/SKILL.md`.

### 4. Verify Branch
Confirm we are on the correct Git branch:
```bash
git rev-parse --abbrev-ref HEAD
```

If not on the correct branch, switch to it:
```bash
git checkout <BRANCH_NAME>
```

### 4.5 Check for Previous Progress (Resume Mode)
If this branch has existing commits (from a previous interrupted session), review what was already done:

```bash
# Check if there are commits ahead of main
git log main..HEAD --oneline
```

If commits exist:
1. **Review existing changes**: Read the commit messages and changed files to understand progress
2. **Continue from where it left off**: Don't redo completed work
3. **Focus on remaining items**: Check acceptance_criteria to see what's still needed

This allows interrupted tasks to be resumed without losing progress.

### 5. Execute Task
Follow the loaded skill's workflow to complete the task:

1. **Understand**: Read related files in the scope
2. **Plan**: Create implementation approach
3. **Implement**: Write code, following scope restrictions
4. **Test**: Run relevant tests
5. **Commit**: Commit changes with proper message

**CRITICAL SCOPE RESTRICTION**:
- Only modify files within `scope_paths` and `scope_files`
- If you need to modify files outside scope, STOP and report the conflict
- This prevents conflicts with other parallel agents

### 6. Commit Changes
When implementation is complete:
```bash
git add <files within scope>
git commit -m "$(cat <<'EOF'
[TASK_ID] Task title

- Implementation details
- Changes made

Agent: AGENT_ID
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### 7. Update Task Status
After successful completion, the scheduler will:
- Update task status to `completed`
- Release path locks
- Merge branch if auto-merge is enabled

### 8. Output Summary
Print completion summary:
```
========================================
Agent Worker Task Complete
========================================
Task: TASK_ID - Task Title
Agent: AGENT_ID
Branch: BRANCH_NAME
Status: SUCCESS
Files Changed: X
Commits: Y
========================================
```

## Error Handling

### Scope Violation
If you need to modify files outside your assigned scope:
1. DO NOT modify the file
2. Output error message:
```
[SCOPE VIOLATION] Cannot modify <file_path>
This file is outside the assigned scope:
  Allowed paths: <scope_paths>
  Allowed files: <scope_files>
Please coordinate with the orchestrator to resolve.
```
3. Exit with non-zero code

### Test Failure
If tests fail:
1. Attempt to fix (up to 3 times)
2. If still failing, commit what works
3. Report partial completion

### Dependency Missing
If you discover a missing dependency:
1. Document in task notes
2. Exit with specific code for "blocked"

## Notes
- This command runs in non-interactive mode
- No user questions allowed - make reasonable decisions
- Stay within assigned scope to avoid conflicts
- All output is logged for debugging
- Scheduler monitors progress via process exit codes:
  - 0: Success
  - 1: General failure
  - 2: Scope violation
  - 3: Blocked (missing dependency)
