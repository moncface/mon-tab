# CLAUDE.md — Mon [tab]

## Project Overview

Mon [tab] is a command palette launched from Chrome Omnibox. Keyword: `mon`

## Technical Constraints

- Chrome Manifest V3
- Service Worker based
- Offscreen Document for clipboard operations
- No external dependencies (no libraries). CLI version has optional dependency (mathjs)

## Command Structure

```
commands/
  ├── calc.js
  ├── rand.js
  ├── em.js
  ├── ratio.js
  ├── m.js (session variable)
  └── ... (1 command = 1 file)
```
