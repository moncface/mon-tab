# mon[tab]

> Dev tools in your address bar & terminal. Type `mon` — get results.
>
> by [moncface](https://github.com/moncface)

## Platforms

| Platform | Status | Install |
|---|---|---|
| **Chrome** | v0.9.9 | [Load unpacked](#chrome-extension) |
| **CLI** | v0.1.0 | `npm i -g mon-tab` |
| **VSCode** | planned | — |
| **Obsidian** | planned | — |

## CLI

```bash
npx mon-tab uuid          # 550e8400-e29b-41d4-a716-...
npx mon-tab b64 hello     # aGVsbG8=
npx mon-tab calc 1920/1080  # 1920/1080 = 1.777777778
npx mon-tab ?             # list all commands
```

Or install globally:

```bash
npm i -g mon-tab
mon uuid
mon b64 hello
```

## Chrome Extension

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
| `px 24` | `1.5rem` |
| `ascii A` | `65` |
| `http 404` | `404 Not Found` |
| `port 443` | `443 — HTTPS` |
| `mime png` | `png → image/png` |
| `chmod 755` | `rwxr-xr-x` |
| `cc JP` | `Japan / JPY / +81` |
| `tel +81` | `+81 — Japan` |
| `zip 150-0001` | `東京都渋谷区神宮前` |
| `m w 1920` | set variable `w = 1920` |
| `calc mw * 2` | `1920 * 2 = 3840` |
| `?` | list all commands |

## Project Structure

```
mon-tab/
├── commands/       ← shared commands (1 file = 1 command)
├── core/           ← shared core (runner.js)
├── chrome/         ← Chrome-specific UI
├── cli/            ← CLI entry point
├── vscode/         ← VSCode extension (planned)
├── obsidian/       ← Obsidian plugin (planned)
└── manifest.json   ← Chrome extension manifest
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add commands.

## Why

Opening a new tab to generate a UUID, encode base64, or look up an HTTP status code is friction you don't need. `mon[tab]` puts the tools where you already are — Chrome's address bar or your terminal.

## Roadmap

70+ commands planned. See [ISSUE_ROADMAP.md](ISSUE_ROADMAP.md).

## Support

If mon[tab] saves you time:

- [Buy Me a Coffee](https://buymeacoffee.com/moncface)

## License

MIT
