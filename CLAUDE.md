# CLAUDE.md — Mon [tab]

## プロジェクト概要

Mon [tab] は Chrome Omnibox から起動するコマンドパレット。キーワード: `mon`

## 技術制約

- Chrome Manifest V3
- Service Worker ベース
- Offscreen Document で clipboard 操作
- Chrome拡張は外部依存なし（ライブラリ不使用）。CLI版はオプショナル依存あり（mathjs）

## コマンド構成

```
commands/
  ├── calc.js
  ├── conv.js
  ├── rand.js
  ├── em.js
  ├── ratio.js
  ├── m.js (変数メモリ)
  └── ...（1 command = 1 file）
```

## 既知のバグ

- `mon m` の変数メモリにバグあり（修正予定）
