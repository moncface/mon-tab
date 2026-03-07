# Contributing to Mon [tab]

## Project Structure

```
mon-tab/
├── manifest.json        ← Chrome extension manifest (project root = extension root)
├── background.js        ← Chrome adapter (thin — omnibox + clipboard only)
├── core/                ← Shared core (all platforms import from here)
│   └── runner.js        ← Command router
├── commands/            ← Shared commands (1 file = 1 command)
│   ├── index.js         ← Registry — auto-builds command list from modules
│   ├── _template.js     ← Copy this to create a new command
│   ├── var-store.js     ← Variable memory system
│   ├── help.js          ← Auto-generated help (? command)
│   └── ...              ← Individual commands (uuid.js, b64.js, etc.)
├── chrome/              ← Chrome-specific UI pages
│   ├── offscreen.*      ← Clipboard helper (Manifest V3 requirement)
│   ├── options.*        ← Settings page
│   └── pw-generator.*   ← Password generator popup
├── icons/               ← Extension icons (16/48/128px)
├── package.json         ← npm publish config
└── ISSUE_ROADMAP.md     ← Version history + planned features
```

## Adding a New Command

This is the most common contribution. You only need to touch **2 files**:

### 1. Create `commands/your-command.js`

Copy `commands/_template.js` and fill in:

```js
export const meta = {
  name: 'your-command',
  desc: 'What it does (shown in help)',
  category: 'encoding',       // generators | encoding | time | string | math | css | dict | geo | lookup | variable | system
  usage: 'your-command <arg>',
  scope: 'universal',         // universal | chrome | cli
}

export const command = (arg) => {
  return arg.toUpperCase()     // Your logic here
}
```

### 2. Register in `commands/index.js`

Add one import and one entry to the `modules` array:

```js
import * as yourCommandMod from './your-command.js'

const modules = [
  // ... existing commands ...
  ['your-command', yourCommandMod],   // ← add this line
  ['?', helpMod],                     // keep ? last
]
```

That's it. The registry auto-generates help text, CLI support, and everything else.

### Test locally

```bash
npx mon-tab your-command test-input
```

## Meta Fields Reference

| Field | Required | Description |
|---|---|---|
| `name` | yes | Command name (matches registry key) |
| `desc` | yes | One-line description for help |
| `category` | yes | Category for `? <category>` filtering |
| `usage` | yes | Usage pattern for docs |
| `scope` | yes | `universal` / `chrome` / `cli` |
| `example` | no | `{ input, output }` for docs |
| `noSubstitute` | no | `true` to skip variable substitution |
| `aliases` | no | Array of alias names |

## Architecture

**Shared core** (`core/runner.js` + `commands/`) is platform-neutral. This repo is the Chrome adapter:

- **Chrome**: `background.js` — handles omnibox events + clipboard

Other platforms live in separate repositories and import `core/` + `commands/` via the `mon-tab` npm package:

- **CLI**: [mon-cli](https://github.com/moncface/mon-cli)
- **VSCode**: mon-tab-vscode (planned)
- **Obsidian**: mon-tab-obsidian (planned)

Commands should NOT use `chrome.*` APIs directly (use `scope: 'chrome'` for Chrome-only commands). The `var-store.js` handles Chrome/Node differences with try/catch graceful degradation.

## Chrome Web Store Packaging

The project root doubles as the Chrome extension root (`manifest.json` is at root). To package for Chrome Web Store:

```bash
zip -r mon-tab.zip . -x ".git/*" "node_modules/*" ".gitignore" "package.json" "CONTRIBUTING.md" "*.log"
```
