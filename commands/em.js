export const meta = {
  name: 'em',
  desc: 'Emoji lookup (+ Gitmoji)',
  category: 'dict',
  usage: 'em <name>',
  scope: 'universal',
}

const gitmoji = {
  feat: '✨', fix: '🐛', docs: '📝', perf: '⚡', remove: '🔥',
  test: '✅', wip: '🚧', refactor: '♻️', style: '💄', build: '📦',
  ci: '👷', revert: '⏪', merge: '🔀', deploy: '🚀', hotfix: '🚑',
  security: '🔒', config: '🔧', init: '🎉', breaking: '💥', dep: '⬆️',
  lint: '🚨', typo: '✏️', clean: '🗑️', move: '🚚', ui: '🎨',
  access: '♿', log: '🔊', db: '🗃️', i18n: '🌐', api: '👽',
}

const emoji = {
  smile: '😊', laugh: '😂', wink: '😉', cool: '😎', love: '❤️',
  heart: '❤️', star: '⭐', fire: '🔥', check: '✅', cross: '❌',
  warning: '⚠️', info: 'ℹ️', question: '❓', exclamation: '❗',
  thumbsup: '👍', thumbsdown: '👎', clap: '👏', wave: '👋',
  rocket: '🚀', sparkles: '✨', boom: '💥', zap: '⚡',
  bug: '🐛', wrench: '🔧', hammer: '🔨', key: '🔑', lock: '🔒',
  bulb: '💡', memo: '📝', book: '📖', link: '🔗', pin: '📌',
  clock: '🕐', calendar: '📅', folder: '📁', trash: '🗑️',
  ok: '👌', sun: '☀️', moon: '🌙', cloud: '☁️', rain: '🌧️',
  snow: '❄️', party: '🎉', gift: '🎁', trophy: '🏆', medal: '🏅',
  flag: '🚩', bell: '🔔', speaker: '🔊', mute: '🔇',
  eye: '👁️', pencil: '✏️', scissors: '✂️', phone: '📱', mail: '📧',
  globe: '🌐', tree: '🌳', flower: '🌸', dog: '🐶', cat: '🐱',
  up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️', arrow: '➡️',
}

const all = { ...emoji, ...gitmoji }

export const command = (arg) => {
  if (!arg) return 'Usage: em <name>  e.g. em fire  or  em feat (Gitmoji)'
  const key = arg.trim().toLowerCase()
  if (all[key]) return all[key]
  const matches = Object.entries(all).filter(([k]) => k.includes(key))
  if (matches.length === 1) return matches[0][1]
  if (matches.length > 1) return matches.map(([k, v]) => `${k} ${v}`).join('  ')
  return `No emoji found for "${arg}"`
}
