# mon[tab]

> Type `mon` + Tab in Chrome's address bar. Instant results. No new tabs.

## Install

1. Clone this repo
2. Open `chrome://extensions` → Enable **Developer Mode** → **Load unpacked** → select this folder

## Usage

Type `mon` in the address bar, press **Tab**, then enter a command. Press **Enter** to copy the result to clipboard.

| Command | Result |
|---|---|
| `uuid` | `550e8400-e29b-41d4-a716-...` |
| `pw` | `Xk#9mP2@vL5q!...` (16 chars) |
| `pw 32` | 32-character password |
| `b64 hello` | `aGVsbG8=` |
| `b64d aGVsbG8=` | `hello` |
| `ts` | `1741000000` (unix timestamp) |
| `now` | `2026-03-04T14:30:00.000Z` |
| `upper hello world` | `HELLO WORLD` |
| `lower HELLO` | `hello` |
| `slug Hello World!` | `hello-world` |
| `zip 150-0001` | `東京都渋谷区神宮前` |
| `?` | list all commands |

## Why

Opening a new tab to generate a UUID, encode base64, or look up an HTTP status code is friction you don't need. `mon[tab]` puts the tools directly in Chrome's address bar — the one UI element already at your fingertips.

## Roadmap

70+ commands planned. See [roadmap](https://github.com/moncface/mon/issues).

Contributions welcome — each command is a single independent file in `commands/`.

## License

MIT
