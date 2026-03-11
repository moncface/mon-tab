import * as uuidMod  from './uuid.js'
import * as pwMod    from './pw.js'
import * as shaMod   from './sha.js'
import * as loremMod from './lorem.js'
import * as b64Mod   from './b64.js'
import * as b64dMod  from './b64d.js'
import * as jwtMod   from './jwt.js'
import * as tsMod    from './ts.js'
import * as nowMod   from './now.js'
import * as calMod   from './cal.js'
import * as ageMod   from './age.js'
import * as upperMod from './upper.js'
import * as lowerMod from './lower.js'
import * as slugMod  from './slug.js'
import * as camelMod from './camel.js'
import * as snakeMod from './snake.js'
import * as wcMod    from './wc.js'
import * as calcMod  from './calc.js'
import * as pxMod    from './px.js'
import * as asciiMod from './ascii.js'
import * as httpMod  from './http.js'
import * as portMod  from './port.js'
import * as mimeMod  from './mime.js'
import * as chmodMod from './chmod.js'
import * as ccMod    from './cc.js'
import * as telMod   from './tel.js'
import * as zipMod   from './zip.js'
import * as mMod     from './m.js'
import * as mpMod    from './mp.js'
import * as mlMod    from './ml.js'
import * as mcMod    from './mc.js'
import * as randMod  from './rand.js'
import * as emMod    from './em.js'
import * as ratioMod from './ratio.js'
import * as remMod   from './rem.js'
import * as optMod   from './opt.js'
import * as rxMod    from './rx.js'
import * as jsonMod  from './json.js'
import * as urlMod   from './url.js'
import * as emailMod from './email.js'
import * as ipMod    from './ip.js'
import * as svMod    from './semver.js'
// CLI-only stubs — real implementations loaded by CLI entry point
// Chrome cannot load node:fs/path/child_process from ld.js/lv.js/lc.js
const cliStub = (name, desc) => ({
  meta: { name, desc, category: 'lndf', usage: name, scope: 'cli' },
  command: () => `"${name}" is CLI-only — run: mon ${name}`,
})
const ldMod = cliStub('ld', '.lndf distillation (generate project snapshot)')
const lvMod = cliStub('lv', 'Show .lndf distillation state')
const lcMod = cliStub('lc', '.lndf distillation + clipboard copy')

import * as helpMod  from './help.js'
import { setCommandList } from './help.js'

// --- Registry: add new commands here (1 line each) ---
const modules = [
  ['uuid',  uuidMod],
  ['pw',    pwMod],
  ['sha',   shaMod],
  ['lorem', loremMod],
  ['b64',   b64Mod],
  ['b64d',  b64dMod],
  ['jwt',   jwtMod],
  ['ts',    tsMod],
  ['now',   nowMod],
  ['cal',   calMod],
  ['age',   ageMod],
  ['upper', upperMod],
  ['lower', lowerMod],
  ['slug',  slugMod],
  ['camel', camelMod],
  ['snake', snakeMod],
  ['wc',    wcMod],
  ['calc',  calcMod],
  ['px',    pxMod],
  ['ascii', asciiMod],
  ['http',  httpMod],
  ['port',  portMod],
  ['mime',  mimeMod],
  ['chmod', chmodMod],
  ['cc',    ccMod],
  ['tel',   telMod],
  ['zip',   zipMod],
  ['m',     mMod],
  ['mp',    mpMod],
  ['ml',    mlMod],
  ['mc',    mcMod],
  ['rand',  randMod],
  ['em',    emMod],
  ['ratio', ratioMod],
  ['rem',   remMod],
  ['opt',   optMod],
  ['rx',    rxMod],
  ['json',  jsonMod],
  ['url',   urlMod],
  ['email', emailMod],
  ['ip',    ipMod],
  ['sv',    svMod],
  ['ld',    ldMod],
  ['lv',    lvMod],
  ['lc',    lcMod],
  ['?',     helpMod],
]

// Build registry and exports
export const registry = new Map()
export const commands = {}

for (const [name, mod] of modules) {
  const meta = mod.meta ?? { name, scope: 'universal' }
  registry.set(name, { run: mod.command, meta: { name, ...meta } })
  commands[name] = mod.command

  if (meta.aliases) {
    for (const alias of meta.aliases) {
      registry.set(alias, { run: mod.command, meta: { name, ...meta } })
      commands[alias] = mod.command
    }
  }
}

// noSubstitute set (derived from meta, no more hardcoding)
export const noSubstituteSet = new Set(
  [...registry.entries()]
    .filter(([, v]) => v.meta.noSubstitute)
    .map(([k]) => k)
)

// Command list for help (excludes aliases and help itself)
export const commandList = [...registry.entries()]
  .filter(([name, v]) => v.meta.name === name && name !== '?')
  .map(([name, v]) => ({ name, ...v.meta }))

// Inject command list into help
setCommandList(commandList)
