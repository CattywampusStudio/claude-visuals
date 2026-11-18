// Writes the README's pictures: each background as the mod draws it, saved as an SVG that moves on its own.
// Run from anywhere after changing a scene or a theme (Node 22.18 or later, which reads TypeScript as is):
//   node scripts/images.ts
import { mkdirSync, writeFileSync } from 'node:fs'

import { backdrop } from '../studio-looks/hooks/scene.ts'
import type { Kind } from '../studio-looks/hooks/scene.ts'
import { THEMES } from '../studio-looks/hooks/themes.ts'

// each background, in a theme that suits it
const PICTURES: readonly (readonly [Kind, string])[] = [
  ['grid', 'synthwave'],
  ['sunset', 'retro-sunset'],
  ['city', 'night-city'],
  ['lamp', 'neon-arcade'],
  ['soft', 'dusk'],
  ['pixels', 'pixel-dust'],
  ['rain', 'green-rain'],
  ['plotter', 'ink'],
  ['weave', 'ember'],
  ['flock', 'dusk'],
  ['nebula', 'synthwave'],
  ['ridges', 'static'],
  ['circuit', 'green-rain'],
  ['tunnel', 'neon-arcade'],
  ['borealis', 'aurora'],
  ['kaleidoscope', 'midnight-pop'],
  ['aquarium', 'backstage'],
  ['valley', 'retro-sunset'],
]

const out = new URL('../images/', import.meta.url)
mkdirSync(out, { recursive: true })
for (const [kind, id] of PICTURES) {
  const theme = THEMES.find(t => t.id === id)
  if (!theme) throw new Error(`no theme called ${id}`)
  // a size of its own, so the file shows at the right shape wherever it is opened
  const svg = backdrop(theme, kind, true).replace('<svg ', '<svg width="1600" height="1000" ')
  writeFileSync(new URL(`${kind}.svg`, out), svg)
  console.log(`${kind}.svg  ${theme.label}  ${(svg.length / 1024).toFixed(0)} KB`)
}
