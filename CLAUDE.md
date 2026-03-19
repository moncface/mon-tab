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
  ├── ld.js (distillation — CLI only)
  ├── lv.js (view/query — CLI only)
  ├── lc.js (distill + clipboard — CLI only)
  ├── lp.js (cross-project — CLI only)
  ├── lt.js (token comparison — CLI only)
  ├── clip.js (clipboard read — CLI only)
  └── ... (1 command = 1 file)
```

## .lndf Distillation

`mon ld` generates `.lndf/current.lndf` from git + package.json + npm test.

Output fields: project name, branch, last commit, changed files, wip, stack, test (pass/fail/timeout), error (stderr tail), status.

`test:fail` or `test:timeout` → `status:debugging` (overrides all).
No `scripts.test` → `test:` / `error:` fields omitted.

## Chrome Web Store Submission Checklist

- manifest.json の全 permissions について、コード内に対応する `chrome.*` API 呼び出しが存在することを確認
- 未使用権限は削除。将来用の先取り宣言は禁止 (CWS Purple Potassium 違反)
- `activeTab` で代替可能な場合は `tabs` を使わない
