# SKILL: .lndf — Project Distillation

## What is .lndf?

.lndf (LLM-Native Data Format) is a minimal project state snapshot.
It contains only what the LLM cannot infer from training data.

## File Location

```
{project-root}/.lndf/
  ├── current.lndf      ← latest snapshot
  └── history/           ← timestamped snapshots
```

## Format

```
---
project-name
branch:main
last:fix authentication bug
changed:src/auth.js,src/middleware.js
wip:oauth-integration
stack:node,express,ts
status:active development
---
```

## Fields

| Field | Source | Meaning |
|-------|--------|---------|
| Line 1 | package.json name or directory | Project name |
| branch | git | Current branch |
| last | git | Last commit message |
| changed | git | Files with uncommitted changes (comma-separated) |
| wip | git | Branch name if not main/master (work in progress) |
| stack | package.json + config files | Detected tech stack |
| status | git | `active development` or `clean` |

## Reading Rules

- Key:value pairs, one per line, wrapped in `---`
- No quotes, no brackets, no JSON
- Empty fields are omitted (defaults are silence)
- Humans may add custom fields — treat them as additional context
- Do NOT ask for information already present in the .lndf file

## Commands

```bash
mon ld    # generate .lndf snapshot from git + package.json
mon lv    # view current .lndf
mon lc    # generate + copy to clipboard
```

## When You See a .lndf File

1. Read it to understand current project state
2. `changed` tells you what was recently modified
3. `wip` tells you what the developer is working on
4. Use your training data for everything else (framework conventions, patterns)
