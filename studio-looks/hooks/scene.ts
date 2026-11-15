// The full-window lava lamp for any theme: four wash colours as wax that rises,
// sinks and merges through a blur-then-threshold "goo" filter, a glow from the
// base. One SVG serves both modes: its colours are CSS variables that a
// prefers-color-scheme rule swaps. No logo or wording. Two more scenes follow the
// lamp: dissolving pixels and falling symbols. Six more drawn scenes are in scenery.ts.
import { SCENERIES, SCENERY, seeded } from './scenery.ts'
import type { Scenery } from './scenery.ts'
import type { Mode, Theme } from './themes.ts'

/**
 * 'lamp': wax that merges (filtered). 'soft': soft glows, no filter, lighter to draw.
 * 'pixels': squares that fade in, drift up and dissolve. 'rain': columns of symbols falling.
 * The rest are the drawn scenes of scenery.ts.
 */
export type Kind = 'lamp' | 'soft' | 'pixels' | 'rain' | Scenery
export const KINDS: readonly Kind[] = ['lamp', 'soft', 'pixels', 'rain', ...SCENERIES]

const W = 1600
const H = 1000

// left, start height (0 top, 1 bottom), radius, wash index, travel (negative rises), sideways drift, seconds, start offset in seconds
const BLOBS: [number, number, number, number, number, number, number, number][] = [
  [0.08, 1.04, 170, 0, -0.92, 46, 34, 0],
  [0.24, 1.07, 120, 1, -0.86, -36, 43, 11],
  [0.42, 1.05, 190, 2, -0.94, 30, 38, 19],
  [0.63, 1.06, 140, 3, -0.84, -44, 47, 6],
  [0.84, 1.04, 180, 0, -0.9, 34, 41, 25],
  [0.16, 0.06, 110, 1, 0.84, 32, 40, 9],
  [0.52, -0.02, 150, 0, 0.88, -26, 49, 22],
  [0.93, 0.3, 100, 2, 0.62, -34, 36, 14],
  [0.34, 0.44, 90, 3, -0.42, 40, 45, 27],
  [0.02, 0.5, 120, 2, 0.46, 24, 52, 3],
  [0.74, 0.5, 96, 1, -0.5, -30, 44, 31],
  [0.97, 0.9, 130, 3, -0.7, -22, 39, 17],
]

const vars = (m: Mode, wax: number) => `--ground:${m.ground};${m.washes.map((c, i) => `--w${i}:${c}`).join(';')};--wax:${wax}`

// Squares and symbols at rest: the same drawing with its animations switched off.
const atRest = (svg: string): string => svg.replace(/<\/svg>\s*$/, `<style>*{animation:none!important}</style></svg>`)

/** The background behind the chat: a scene, moving or at rest. */
export const backdrop = (theme: Theme, kind: Kind, moving: boolean): string => {
  if (kind === 'pixels') return moving ? pixels(theme) : atRest(pixels(theme))
  if (kind === 'rain') return moving ? rain(theme) : atRest(rain(theme))
  if (kind !== 'lamp' && kind !== 'soft') return SCENERY[kind](theme, moving)
  const goo = kind !== 'soft'

  const style =
    `<style>` +
    `svg{${vars(theme.dark, 0.7)}}` +
    `@media (prefers-color-scheme:light){svg{${vars(theme.light, 0.5)}}}` +
    `.ground{fill:var(--ground)}` +
    [0, 1, 2, 3].map(i => `.c${i}{fill:var(--w${i})}.s${i}{stop-color:var(--w${i})}`).join('') +
    `.wax{opacity:var(--wax)}` +
    `.b{transform-box:fill-box;transform-origin:50% 50%}` +
    (moving
      ? `.b{animation:float 40s ease-in-out infinite alternate}` +
        `@keyframes float{0%{transform:translate(0,0) scale(1,1)}40%{transform:translate(var(--dx),calc(var(--dy)*.4)) scale(.86,1.2)}75%{transform:translate(calc(var(--dx)*-1),calc(var(--dy)*.75)) scale(.93,1.1)}100%{transform:translate(0,var(--dy)) scale(1.06,.92)}}` +
        `.glow{animation:breathe 11s ease-in-out infinite alternate}@keyframes breathe{from{opacity:.45}to{opacity:.85}}` +
        `@media (prefers-reduced-motion:reduce){.b,.glow{animation:none}}`
      : '') +
    `</style>`

  const defs =
    `<defs>` +
    (goo
      ? `<filter id="goo" filterUnits="userSpaceOnUse" x="-200" y="-200" width="${W + 400}" height="${H + 400}" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="34" result="b"/><feGaussianBlur in="SourceAlpha" stdDeviation="34" result="a"/><feComposite in="a" in2="a" operator="arithmetic" k1="0" k2="24" k3="0" k4="-10" result="m"/><feComposite in="b" in2="m" operator="in" result="c"/><feMerge result="s"><feMergeNode in="c"/><feMergeNode in="c"/><feMergeNode in="c"/><feMergeNode in="c"/></feMerge><feGaussianBlur in="s" stdDeviation="8"/></filter>`
      : [0, 1, 2, 3].map(i => `<radialGradient id="g${i}"><stop class="s${i}" offset="0" stop-opacity="1"/><stop class="s${i}" offset=".55" stop-opacity=".75"/><stop class="s${i}" offset="1" stop-opacity="0"/></radialGradient>`).join('')) +
    `<radialGradient id="glow" cx="50%" cy="100%" r="80%"><stop class="s2" offset="0" stop-opacity=".55"/><stop class="s2" offset="1" stop-opacity="0"/></radialGradient>` +
    `</defs>`

  const blobs = BLOBS.map(([x, y, r, c, travel, drift, dur, delay]) => {
    const dy = Math.round(H * travel)
    const size = goo ? r : Math.round(r * 1.45)
    const fill = goo ? `class="b c${c}"` : `class="b" fill="url(#g${c})"`
    const anim = moving ? `;animation-duration:${dur}s;animation-delay:-${delay}s` : ''
    // a still lamp is caught mid-rise, not lined up along the edges
    const at = moving ? '' : ` transform="translate(${Math.round(drift * 0.6)} ${Math.round(dy * 0.45)})"`
    return `<ellipse ${fill}${at} style="--dx:${drift}px;--dy:${dy}px${anim}" cx="${Math.round(W * x)}" cy="${Math.round(H * y)}" rx="${size}" ry="${Math.round(size * 1.08)}"/>`
  }).join('')

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">` +
    defs +
    style +
    `<rect class="ground" x="-400" y="-400" width="${W + 800}" height="${H + 800}"/>` +
    `<rect class="glow" x="-400" y="${Math.round(H * 0.4)}" width="${W + 800}" height="${Math.round(H * 0.6) + 400}" fill="url(#glow)" opacity=".7"/>` +
    `<g class="wax"${goo ? ' filter="url(#goo)"' : ''}>${blobs}</g>` +
    `</svg>`
  )
}

const frame = (theme: Theme, wax: [number, number], css: string, defs: string, body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">` +
  `<defs>${defs}<radialGradient id="glow" cx="50%" cy="100%" r="80%"><stop class="s2" offset="0" stop-opacity=".4"/><stop class="s2" offset="1" stop-opacity="0"/></radialGradient></defs>` +
  `<style>svg{${vars(theme.dark, wax[0])};--text:${theme.dark.text}}@media (prefers-color-scheme:light){svg{${vars(theme.light, wax[1])};--text:${theme.light.text}}}` +
  `.ground{fill:var(--ground)}${[0, 1, 2, 3].map(i => `.c${i}{fill:var(--w${i})}.s${i}{stop-color:var(--w${i})}`).join('')}${css}</style>` +
  `<rect class="ground" x="-400" y="-400" width="${W + 800}" height="${H + 800}"/>` +
  `<rect x="-400" y="${Math.round(H * 0.4)}" width="${W + 800}" height="${Math.round(H * 0.6) + 400}" fill="url(#glow)" opacity=".6"/>` +
  body +
  `</svg>`

/** Squares in the theme's four colours that fade in, drift upward and dissolve: thick at the foot of the window, thinning toward the top. */
const pixels = (theme: Theme): string => {
  const rand = seeded(7)
  const cell = 50
  const cols = Math.ceil(W / cell)
  const rows = Math.ceil(H / cell)
  let body = ''
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const depth = (r + 1) / rows
      if (rand() > 0.2 + 0.56 * depth ** 1.5) continue
      const dur = (5 + rand() * 8).toFixed(1)
      const delay = (rand() * 13).toFixed(1)
      const size = rand() < 0.2 ? cell / 2 - 3 : cell - 6
      const off = (cell - size) / 2
      body += `<rect class="p c${Math.floor(rand() * 4)}" style="animation-duration:${dur}s;animation-delay:-${delay}s" x="${c * cell + off}" y="${r * cell + off}" width="${size}" height="${size}" rx="5"/>`
    }
  }
  const css =
    // At rest a square is visible, so the scene still reads when the app holds backgrounds still.
    `.p{opacity:calc(var(--wax)*.6);transform-box:fill-box;transform-origin:50% 50%;animation:dissolve 8s ease-in-out infinite}` +
    `@keyframes dissolve{0%{opacity:0;transform:translateY(14px) scale(.55)}15%{opacity:var(--wax);transform:translateY(0) scale(1)}60%{opacity:var(--wax);transform:translateY(-8px) scale(1)}80%{opacity:calc(var(--wax)*.5);transform:translateY(-20px) scale(.8)}100%{opacity:0;transform:translateY(-34px) scale(.45)}}` +
    `@media (prefers-reduced-motion:reduce){.p{animation:none}}`
  return frame(theme, [1, 0.8], css, '', body)
}

// Symbols for the rain: digits, operators and Greek letters, in a face already on the Mac.
const GLYPHS = '0123456789+-=*/<>{}[]()#$%&?!:;^~|\\ΣΔΩλπφψβμθ'

/** Columns of symbols falling at their own speeds: a bright head, a tail that fades out behind it. */
const rain = (theme: Theme): string => {
  const rand = seeded(11)
  const colW = 34
  const line = 27
  const cols = Math.ceil(W / colW)
  const glyphs = [...GLYPHS]
  const esc = (g: string) => (g === '<' ? '&lt;' : g === '>' ? '&gt;' : g === '&' ? '&amp;' : g)
  let body = ''
  for (let c = 0; c < cols; c++) {
    // most columns carry one stream, some two, a few none
    const streams = rand() < 0.12 ? 0 : rand() < 0.3 ? 2 : 1
    for (let k = 0; k < streams; k++) {
      const n = 7 + Math.floor(rand() * 13)
      const x = c * colW + colW / 2
      // where the stream rests when nothing moves: spread down the window, not stacked at the top
      const rest = Math.round((rand() * 1.1 - 0.25) * H)
      const dur = (7 + rand() * 12).toFixed(1)
      const delay = (rand() * 19).toFixed(1)
      const colour = rand() < 0.72 ? 0 : 1 + Math.floor(rand() * 3)
      let spans = ''
      for (let i = 0; i < n; i++) {
        const g = esc(glyphs[Math.floor(rand() * glyphs.length)] ?? '0')
        // the tail fades in five steps toward the head, which is the last glyph
        const cls = i === n - 1 ? 'h' : `o${Math.min(5, 1 + Math.floor((i / n) * 5))}`
        spans += `<tspan class="${cls}" x="${x}" dy="${line}">${g}</tspan>`
      }
      body += `<g class="f" style="--from:${-(rest + n * line + 60)}px;--to:${H - rest + 60}px;animation-duration:${dur}s;animation-delay:-${delay}s"><text class="c${colour}" y="${rest}">${spans}</text></g>`
    }
  }
  const css =
    `text{font:22px ui-monospace,Menlo,Monaco,monospace;text-anchor:middle}` +
    `.o1{fill-opacity:.1}.o2{fill-opacity:.22}.o3{fill-opacity:.38}.o4{fill-opacity:.56}.o5{fill-opacity:.78}.h{fill:var(--text)}` +
    `.rain{opacity:var(--wax)}` +
    `.f{animation:fall 12s linear infinite}@keyframes fall{from{transform:translateY(var(--from))}to{transform:translateY(var(--to))}}` +
    `@media (prefers-reduced-motion:reduce){.f{animation:none}}`
  return frame(theme, [0.85, 0.6], css, '', `<g class="rain">${body}</g>`)
}
