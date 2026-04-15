# montab

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Dev tools in your address bar & terminal. Type `mon` — get results.
>
> by [moncface](https://github.com/moncface)

## Install

### CLI

```bash
npm install -g mon-tab
mon uuid
mon --version
echo "b64 hello" | mon
```

### Chrome Extension

1. Clone this repo
2. Open `chrome://extensions` → Enable **Developer Mode** → **Load unpacked** → select this folder

Type `mon` in the address bar, press **Tab**, enter a command. Press **Enter** to copy the result.

## Commands

| Command | Result |
|---|---|
| `uuid` | `550e8400-e29b-41d4-a716-...` |
| `pw` | `Xk#9mP2@vL5q!...` (16 chars) |
| `pw 32 an` | 32-char alphanumeric password |
| `sha hello` | `2cf24dba5fb0a30e...` (SHA-256) |
| `b64 hello` | `aGVsbG8=` |
| `b64d aGVsbG8=` | `hello` |
| `jwt <token>` | decoded payload (JSON) |
| `ts` | `1741000000` (unix timestamp) |
| `now` | `2026-03-04T14:30:00.000Z` |
| `upper hello world` | `HELLO WORLD` |
| `lower HELLO` | `hello` |
| `slug Hello World!` | `hello-world` |
| `camel hello-world` | `helloWorld` |
| `snake helloWorld` | `hello_world` |
| `cal 2026-03-15` | `Sunday, March 15, 2026` |
| `age 1990-05-01` | `35 years old` |
| `lorem` | Lorem ipsum sentence |
| `wc hello world` | `2 words, 11 chars` |
| `calc 1920/1080` | `1920/1080 = 1.777777778` |
| `calc sqrt(144)` | `sqrt(144) = 12` |
| `calc 2 inch to cm` | `5.08 cm` (CLI, via math.js) |
| `px 24` | `1.5rem` |
| `ascii A` | `65` |
| `http 404` | `404 Not Found` |
| `port 443` | `443 — HTTPS` |
| `mime png` | `png → image/png` |
| `chmod 755` | `rwxr-xr-x` |
| `cc JP` | `Japan / JPY / +81` |
| `tel +81` | `+81 — Japan` |
| `zip 150-0001` | `東京都渋谷区神宮前` |
| `rand` | `0.7382...` (0–1) |
| `rand 1 6` | `3` (dice roll) |
| `em fire` | `🔥` |
| `em feat` | `✨` (Gitmoji) |
| `ratio 16 9 1920` | `1080` |
| `rx /[0-9]+/g abc123` | 2 matches: "123" @3, ... |
| `json {"a":1}` | formatted + validated JSON |
| `url https://x.com/p?q=1` | parsed URL components |
| `email user@example.com` | Valid / Invalid |
| `ip 192.168.1.1` | IPv4 info (class, scope) |
| `sv 1.2.3 2.0.0` | `1.2.3 < 2.0.0` |
| `rem 30m review PR` | reminder in 30 min (Chrome) |
| `rem ls` | list active reminders |
| `m w 1920` | set variable `w = 1920` |
| `calc mw * 2` | `1920 * 2 = 3840` |
| `ld` | .lndf distillation (project snapshot + test result) |
| `lv` | show .lndf state / query hako index |
| `lv --reindex` | build SQLite index from hako/ |
| `lv --tag sql` | search hako by tag |
| `lv --after 2026-03` | search hako by date |
| `lv --stats` | show hako index statistics |
| `lc` | distillation + clipboard copy |
| `lp create myproj` | create source collection project |
| `lp add myproj file` | add source to project |
| `lp view myproj` | list sources with preview |
| `lp dump myproj` | concatenate all sources |
| `lp list` | list all projects |
| `lt` | LNDF vs JSON token comparison |
| `clip` | read clipboard content |
| `?` | list all commands |

## Project Structure

```
mon-tab/
├── commands/       ← shared commands (1 file = 1 command)
├── core/           ← shared core (runner.js)
├── cli/bin/        ← CLI entry point (npm bin)
├── skills/lndf/    ← SKILL.md for AI tools
├── chrome/         ← Chrome-specific UI
├── icons/          ← extension icons
└── manifest.json   ← Chrome extension manifest
```

CLI wrapper: [mon-cli](https://github.com/moncface/mon-cli).

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add commands.

## Why

Opening a new tab to generate a UUID, encode base64, or look up an HTTP status code is friction you don't need. `montab` puts the tools where you already are — Chrome's address bar or your terminal.

## Roadmap

70+ commands planned. See [ISSUE_ROADMAP.md](ISSUE_ROADMAP.md).

## Privacy

All commands run locally in your browser. No data is collected or sent to external servers — except `zip`, which queries a postal code API (`zipcloud.ibsnet.co.jp`) with the code you enter. No analytics, no tracking, no accounts.

## Support

If montab saves you time:

[![Support moncface](https://img.shields.io/badge/%E2%98%95_Support_moncface-Ko--fi-FF5E5B?style=for-the-badge)](https://ko-fi.com/moncface)

## License

MIT
