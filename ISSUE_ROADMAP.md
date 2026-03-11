# Roadmap: planned commands
<!-- moncface/mon-tab -->

## v0.1 — shipped
- [x] uuid, pw, b64, b64d, ts, now, upper, lower, slug, zip (JP)

## v0.2 — shipped
- [x] sha — SHA-256 hash
- [x] jwt — decode JWT payload
- [x] camel / snake — case conversion
- [x] cal — day of week
- [x] age — age from birthdate
- [x] lorem — placeholder text
- [x] wc — word/char count
- [x] px — px ↔ rem

## v0.3 — shipped
- [x] http — HTTP status code lookup
- [x] mime — MIME type lookup
- [x] port — well-known port lookup
- [x] chmod — permission bits
- [x] ascii — char ↔ code

## v0.4 — shipped
- [x] cc — country code
- [x] tel — country dial code
- [x] calc — math expression

## v0.9.0 — shipped
- [x] Code review fixes (clipboard API, TextEncoder, try/catch, arg parsing)
- [x] Split commands/ into individual files
- [x] Date validation for cal/age
- [x] JWT signature warning

## v0.9.5 — shipped
- [x] Options page (settings panel)
  - by moncface / GitHub / X / Buy Me a Coffee / email
  - Version display
  - Variable default storage setting (session / persistent)
- [x] opt command — open settings in popup window (480x600)

## v0.9.8 — shipped
- [x] Variable memory (m commands)
  - m <name> <value> — set session variable
  - mp <name> <value> — set persistent variable
  - m <name> — read variable
  - ml — list all variables
  - mc <name> — delete variable
  - mc — clear session / mc p — clear persistent
  - Variables usable in all commands (e.g. calc mw * mh)

## v0.9.9 — shipped
- [x] pw enhancement
  - pw <n> <charset> — charset: an (alphanumeric), n (numbers only), a (letters only)
  - pw set — popup window (length slider, uppercase/lowercase/numbers/symbols checkboxes)
  - Settings saved to chrome.storage.local, applied to default `pw`

## v0.9.10 — shipped (current)
- [x] Use action popup for pw set / opt (auto-close on focus loss)
- [x] Unified accent color (#7ecfff) across pw-generator and options
- [x] rem — set a reminder (Chrome notification)
  - rem <time> <message> — set reminder (30s, 5m, 1h, 1h30m)
  - rem ls — list active reminders
  - rem clear — clear all reminders

## v0.9.11 — shipped
- [x] rand — random number generator
- [x] em — emoji lookup (+ Gitmoji)
- [x] ratio — aspect ratio calculator

## Multi-repo restructure — done
- [x] Shared core — add meta to commands, registry pattern, extract core/runner.js
- [x] npm `mon-tab` v0.1.0 published (core + commands available as npm package)
- [x] Directory restructure: extension/ → root + chrome/ + icons/
- [x] CLI split to separate repo (moncface/mon-cli)
- [x] CONTRIBUTING.md

## CLI v0.3 + Chrome refactor — done
- [x] .lndf distillation commands (ld, lv, lc) — CLI-only
- [x] SKILL.md for AI tools
- [x] Categorized help output
- [x] stdin pipe support (`echo "b64 hello" | mon`)
- [x] Exit codes (0 success, 1 error)
- [x] --version / --help flags
- [x] Chrome refactor: CLI-only command stubs in index.js
- [x] Chrome refactor: var-store.js injection pattern (zero node:* imports)
- [x] npm v0.3.2 published

## v1.0.0 — public release
- [ ] Command suggestions (prefix match)
- [ ] rx — regex tester (popup window)
- [ ] math.js integration for calc
- [ ] 70 commands target

## v1.5 — global / API
- [ ] zip (global)
- [ ] npm — latest version
- [ ] dns — DNS lookup
- [ ] fx — currency exchange
- [ ] wx — weather
- [ ] log — command history viewer (popup window)

## v2.0 — multi-platform
- [ ] VSCode extension
- [ ] Obsidian plugin
