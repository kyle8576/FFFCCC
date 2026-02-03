# /product-review - Automated Project Review Mode (English alias)

> This is an English alias for `/產品檢視` to avoid PowerShell encoding issues.

## Purpose
This command is used for automated self-enhancement iteration. When all development tasks are completed, this command is automatically called to review the project status and decide the next step.

## Execution Steps

Please execute the project review analysis according to the following steps:

### 1. Read Required Files
- Read `.claude/skills/product_manager/SKILL.md` to adopt the Product Manager role
- Read `dev/PRODUCT_SPEC.md` to understand product specifications (if not exists, read `dev/PRODUCT_SPEC_FOR_AI_template.md`)
- Read `dev/pipeline/PROGRESS.md` to understand current progress
- List `dev/pipeline/completed/` directory to understand completed tasks

### 2. Project Gap Analysis
Analyze based on the read information:
1. **Feature Coverage**: Compare the feature requirements in PRODUCT_SPEC with completed tasks
2. **Core Feature Check**: Confirm whether all P0/P1 core features have been implemented
3. **Test Coverage**: Check if there are sufficient test tasks
4. **Quality Check**: Whether QA verification or optimization tasks are needed

### 3. Decision Output
**Important Constraints**:
- Must strictly follow PRODUCT_SPEC, cannot add features randomly
- Only add features that are clearly defined in PRODUCT_SPEC but not yet implemented
- Project completion criteria: All core features (P0/P1) in PRODUCT_SPEC have been implemented

Based on the analysis results, make one of the following decisions:

#### Decision A: Need to Continue Development
If there are core features in PRODUCT_SPEC that have not been implemented:
1. Create new tasks in `dev/pipeline/tasks/`
2. Update `dev/pipeline/PROGRESS.md`
3. Write status file:

```json
// dev/pipeline/SELF_ENHANCEMENT_STATUS.json
{
  "status": "continue",
  "decision": "Add development tasks",
  "reason": "There are unfinished core features in PRODUCT_SPEC: [list features]",
  "new_tasks": ["TASK_XXX", "TASK_YYY"],
  "timestamp": "ISO timestamp format"
}
```

#### Decision B: Need Testing/QA
If core features are implemented but lack testing:
1. Create QA test tasks in `dev/pipeline/tasks/`
2. Update `dev/pipeline/PROGRESS.md`
3. Write status file:

```json
{
  "status": "continue",
  "decision": "Add testing tasks",
  "reason": "Core features completed, quality verification needed",
  "new_tasks": ["TASK_XXX_QA"],
  "timestamp": "ISO timestamp format"
}
```

#### Decision C: Project Completed
If all core features in PRODUCT_SPEC are implemented with basic testing:
1. Write status file:

```json
{
  "status": "complete",
  "decision": "Project completed",
  "reason": "All core features (P0/P1) in PRODUCT_SPEC have been implemented, project has reached deliverable state",
  "summary": {
    "total_completed": number,
    "core_features": ["list of completed core features"]
  },
  "timestamp": "ISO timestamp format"
}
```

#### Decision D: Project Completed with Suggestions
If PRODUCT_SPEC core features are completed, but AI identifies optimization opportunities or extensible features (outside PRODUCT_SPEC scope):
1. **Do not automatically create tasks** (because they are outside PRODUCT_SPEC scope)
2. Write status file, record suggestions for user reference:

```json
{
  "status": "complete_with_suggestions",
  "decision": "Project completed with optimization suggestions",
  "reason": "PRODUCT_SPEC core features implemented, following are additional optimization suggestions",
  "summary": {
    "total_completed": number,
    "core_features": ["list of completed core features"]
  },
  "suggestions": [
    {
      "type": "optimization/feature/enhancement",
      "title": "Suggestion name",
      "description": "Detailed description",
      "priority": "P2/P3",
      "effort": "low/medium/high"
    }
  ],
  "next_action": "Suggest user evaluate and manually run /產品 to add requirements",
  "timestamp": "ISO timestamp format"
}
```

> **Note**: This decision is still considered "complete", scheduler will end. Suggestions are for user reference only and will not be automatically executed.

### 4. Output Format
After completion, output a brief summary:

```
========================================
Project Review Analysis Complete
========================================
Decision: [continue/complete/complete_with_suggestions]
Reason: [brief explanation]
New Tasks: [if any]
Optimization Suggestions: [if any, list count]
========================================
```

## Notes
- This command is designed for automated scheduling
- No user interaction required, proceed directly with analysis and decision
- Strictly follow PRODUCT_SPEC, cannot imagine new features
- Status file `SELF_ENHANCEMENT_STATUS.json` is the key dependency for the scheduler script
