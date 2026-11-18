// Drawn pieces that are not the backdrop: the progress bars, one for each family of background,
// and the picker's preview. Like the scenes, each has the theme's one set of colours.
import { SCENERY } from './scenery.ts'
import type { Scenery } from './scenery.ts'
import type { Mode, Theme } from './themes.ts'

const W = 640
const H = 22
const R = H / 2

const vars = (m: Mode) => `--text:${m.text};--ground:${m.ground};${m.washes.map((c, i) => `--w${i}:${c}`).join(';')}`

/**
 * A glass tube filling with wax in the theme's four wax colours. `fraction` is
 * 0 to 1; `null` means work is running with no known end, drawn as wax sliding
 * along the tube.
 */
export const lavaBar = (theme: Theme, fraction: number | null): string => {
  const known = fraction !== null
  const fill = known ? Math.max(0, Math.min(1, fraction)) * W : W
  const style =
    `<style>` +
    `svg{${vars(theme.colors)}}` +
    `.track{fill:var(--text);fill-opacity:.1;stroke:var(--text);stroke-opacity:.22}` +
    [0, 1, 2, 3].map(i => `.c${i}{fill:var(--w${i})}.s${i}{stop-color:var(--w${i})}`).join('') +
    `.shine{fill:#fff;fill-opacity:.22}` +
    `.d{animation:drift 7s ease-in-out infinite alternate}` +
    `@keyframes drift{from{transform:translate(0,0)}to{transform:translate(var(--dx),var(--dy))}}` +
    (known ? '' : `.run{animation:run 2.6s ease-in-out infinite alternate}@keyframes run{from{transform:translateX(-${W * 0.36}px)}to{transform:translateX(${W * 0.36}px)}}`) +
    `@media(prefers-reduced-motion:reduce){.d,.run{animation:none}}` +
    `</style>`
  // wax inside the tube: a wash-colour base with slow blobs drifting over it, merged by the goo filter
  const spots: [number, number, number, number, number, number, number][] = [
    [0.1, 0.2, 16, 1, 30, 6, 0],
    [0.28, 0.9, 14, 2, -24, -8, 2],
    [0.46, 0.3, 18, 3, 28, 7, 4],
    [0.64, 0.8, 15, 1, -30, -6, 1],
    [0.8, 0.25, 17, 2, 22, 8, 3],
    [0.95, 0.85, 14, 3, -26, -7, 5],
  ]
  const blobs = spots
    .map(([x, y, r, c, dx, dy, delay]) => `<ellipse class="d c${c}" style="--dx:${dx}px;--dy:${dy}px;animation-delay:-${delay}s" cx="${Math.round(W * x)}" cy="${Math.round(H * y)}" rx="${r * 1.6}" ry="${r}"/>`)
    .join('')
  const wax = `<g clip-path="url(#fill)"><rect class="c0" x="0" y="0" width="${W}" height="${H}"/><g filter="url(#goo)" opacity=".9">${blobs}</g><rect class="shine" x="${R}" y="3" width="${Math.max(0, W - H)}" height="3" rx="1.5"/></g>`
  const clip = known
    ? `<clipPath id="fill"><rect x="0" y="0" width="${fill.toFixed(1)}" height="${H}" rx="${R}"/></clipPath>`
    : `<clipPath id="fill"><rect class="run" x="${W * 0.36}" y="0" width="${W * 0.28}" height="${H}" rx="${R}"/></clipPath>`

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + 2}" viewBox="0 -1 ${W} ${H + 2}">` +
    `<defs>${clip}<clipPath id="tube"><rect x="0" y="0" width="${W}" height="${H}" rx="${R}"/></clipPath>` +
    `<filter id="goo" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/><feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"/></filter></defs>` +
    style +
    `<rect class="track" x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="${R - 0.5}"/>` +
    `<g clip-path="url(#tube)">${wax}</g>` +
    `</svg>`
  )
}

/** Shared head of the two bars below: the theme's colours in both modes. */
const barStyle = (theme: Theme, css: string) =>
  `<style>svg{${vars(theme.colors)}}` +
  `${[0, 1, 2, 3].map(i => `.c${i}{fill:var(--w${i})}`).join('')}.e{fill:var(--text);fill-opacity:.13}.hd{fill:var(--text)}${css}</style>`

/**
 * The dissolving-pixels bar: a row of square cells that light up in the theme's
 * colours. The newest few shimmer, and a couple of loose squares drift off the
 * leading edge. With no known end, a wave of light runs along the row.
 */
export const pixelBar = (theme: Theme, fraction: number | null): string => {
  const n = 32
  const step = W / n
  const size = step - 4
  const lit = fraction === null ? 0 : Math.round(Math.max(0, Math.min(1, fraction)) * n)
  let cells = ''
  for (let i = 0; i < n; i++) {
    const x = (i * step + 2).toFixed(1)
    const colour = (i * 7 + ((i * i) % 5)) % 4
    if (fraction === null) {
      cells += `<rect class="e" x="${x}" y="3" width="${size}" height="${size}" rx="3"/><rect class="wv c${colour}" style="animation-delay:${(i * 0.06).toFixed(2)}s" x="${x}" y="3" width="${size}" height="${size}" rx="3"/>`
    } else if (i < lit) {
      cells += `<rect class="c${colour}${i >= lit - 3 ? ' sh' : ''}" style="animation-delay:-${(i % 3) * 0.4}s" x="${x}" y="3" width="${size}" height="${size}" rx="3"/>`
    } else {
      cells += `<rect class="e" x="${x}" y="3" width="${size}" height="${size}" rx="3"/>`
    }
  }
  // loose squares coming off the leading edge, as the background's squares do
  const edge = lit * step
  const loose =
    fraction !== null && lit > 0 && lit < n
      ? [0, 1, 2].map(i => `<rect class="lo c${(lit + i) % 4}" style="animation-delay:-${i * 0.7}s" x="${(edge + 6 + i * 14).toFixed(1)}" y="${7 + (i % 2) * 4}" width="7" height="7" rx="2"/>`).join('')
      : ''
  const css =
    `.sh{animation:sh 1.3s ease-in-out infinite alternate}@keyframes sh{from{opacity:1}to{opacity:.45}}` +
    `.lo{animation:lo 2.1s ease-out infinite;transform-box:fill-box}@keyframes lo{0%{opacity:.9;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(16px,-7px) scale(.3)}}` +
    `.wv{opacity:0;animation:wv 1.9s linear infinite}@keyframes wv{0%,100%{opacity:0}12%{opacity:1}30%{opacity:0}}` +
    `@media(prefers-reduced-motion:reduce){.sh,.lo,.wv{animation:none}.wv{opacity:.35}}`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + 2}" viewBox="0 -1 ${W} ${H + 2}">${barStyle(theme, css)}${cells}${loose}</svg>`
}

/**
 * The falling-symbols bar: a line of symbols. Those behind the head are lit in
 * the theme's colour and brighten toward it, the head is the text colour, and
 * the rest wait dim. With no known end, a wave of light runs along the line.
 */
export const symbolBar = (theme: Theme, fraction: number | null): string => {
  const marks = ['7', '+', 'Σ', '0', '#', 'λ', '=', '4', 'π', '*', '1', 'Δ', '/', '9', 'φ', ':', '3', 'Ω', '-', '6', 'μ', '%', '2', 'θ']
  const n = 40
  const step = W / n
  const lit = fraction === null ? 0 : Math.round(Math.max(0, Math.min(1, fraction)) * n)
  let row = ''
  for (let i = 0; i < n; i++) {
    const x = (i * step + step / 2).toFixed(1)
    const mark = marks[(i * 5 + 3) % marks.length]
    if (fraction === null) {
      row += `<text class="e" x="${x}" y="17">${mark}</text><text class="wv c0" style="animation-delay:${(i * 0.05).toFixed(2)}s" x="${x}" y="17">${mark}</text>`
    } else if (i === lit - 1) {
      row += `<text class="hd fl" x="${x}" y="17">${mark}</text>`
    } else if (i < lit) {
      row += `<text class="c${i % 9 === 4 ? 1 : 0}" fill-opacity="${(0.35 + (0.65 * (i + 1)) / lit).toFixed(2)}" x="${x}" y="17">${mark}</text>`
    } else {
      row += `<text class="e" x="${x}" y="17">${mark}</text>`
    }
  }
  const css =
    `text{font:600 15px ui-monospace,Menlo,Monaco,monospace;text-anchor:middle}` +
    `.fl{animation:fl .9s steps(2,jump-none) infinite alternate}@keyframes fl{from{opacity:1}to{opacity:.55}}` +
    `.wv{opacity:0;animation:wv 2.2s linear infinite}@keyframes wv{0%,100%{opacity:0}10%{opacity:1}28%{opacity:0}}` +
    `.ln{fill:var(--w0)}` +
    `@media(prefers-reduced-motion:reduce){.fl,.wv{animation:none}.wv{opacity:.35}}`
  const line = `<rect class="e" x="0" y="20.5" width="${W}" height="1.5" rx=".75"/>` + (fraction === null ? '' : `<rect class="ln" x="0" y="20.5" width="${(lit * step).toFixed(1)}" height="1.5" rx=".75"/>`)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + 2}" viewBox="0 -1 ${W} ${H + 2}">${barStyle(theme, css)}${row}${line}</svg>`
}

/**
 * The neon bar, for the grid, the sunset and the city: a thin lit line in the theme's first two colours with a
 * bright head that pulses. With no known end, a lit stretch slides along the line.
 */
export const neonBar = (theme: Theme, fraction: number | null): string => {
  const known = fraction !== null
  const fill = known ? Math.max(0, Math.min(1, fraction)) * W : W * 0.28
  const css =
    `.s0{stop-color:var(--w0)}.s1{stop-color:var(--w1)}.gl{opacity:.3}` +
    `.pu{transform-box:fill-box;transform-origin:50% 50%;animation:pu 1.4s ease-in-out infinite alternate}@keyframes pu{from{transform:scale(.7)}to{transform:scale(1.15)}}` +
    (known ? '' : `.run{animation:run 2.6s ease-in-out infinite alternate}@keyframes run{from{transform:translateX(0)}to{transform:translateX(${(W * 0.72).toFixed(1)}px)}}`) +
    `@media(prefers-reduced-motion:reduce){.pu,.run{animation:none}}`
  const lit =
    `<rect class="gl" x="0" y="6" width="${fill.toFixed(1)}" height="10" rx="5" fill="url(#neon)"/>` +
    `<rect x="0" y="9.5" width="${fill.toFixed(1)}" height="3" rx="1.5" fill="url(#neon)"/>` +
    (fill > 0 ? `<circle class="pu hd" cx="${Math.max(5, fill - 5).toFixed(1)}" cy="11" r="5"/>` : '')
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + 2}" viewBox="0 -1 ${W} ${H + 2}">` +
    `<defs><linearGradient id="neon" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="0"><stop class="s0" offset="0"/><stop class="s1" offset="1"/></linearGradient></defs>` +
    barStyle(theme, css) +
    `<rect class="e" x="0" y="9.5" width="${W}" height="3" rx="1.5"/>` +
    `<g${known ? '' : ' class="run"'}>${lit}</g>` +
    `</svg>`
  )
}

/**
 * The small mark beside a piece of background work, in the theme's colours: an arc going round while it runs, a
 * filled disc with a tick when it is done, a ring with a cross when it failed, a hollow square when it was stopped.
 */
export const jobMark = (theme: Theme, status: 'running' | 'done' | 'failed' | 'stopped'): string => {
  const style =
    `<style>svg{${vars(theme.colors)}}` +
    `.t{fill:none;stroke:var(--text);stroke-opacity:.22;stroke-width:2}.a{fill:none;stroke:var(--w1);stroke-width:2;stroke-linecap:round}` +
    `.f{fill:var(--w2)}.k{fill:none;stroke:var(--ground);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.x{fill:none;stroke:var(--text);stroke-width:1.6;stroke-linecap:round}` +
    (status === 'running' ? `.go{transform-origin:7px 7px;animation:go 1.6s linear infinite}@keyframes go{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.go{animation:none}}` : '') +
    `</style>`
  const body =
    status === 'running'
      ? `<circle class="t" cx="7" cy="7" r="5"/><path class="a go" d="M7 2a5 5 0 0 1 5 5"/>`
      : status === 'done'
        ? `<circle class="f" cx="7" cy="7" r="6"/><path class="k" d="M4.2 7.2l2 2 3.6-4"/>`
        : status === 'failed'
          ? `<circle class="x" cx="7" cy="7" r="5.2"/><path class="x" d="M5 5l4 4M9 5l-4 4"/>`
          : `<rect class="x" x="3" y="3" width="8" height="8" rx="1.5"/>`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14">${style}${body}</svg>`
}

const isScenery = (background: string): background is Scenery => Object.hasOwn(SCENERY, background)
/** The scenes of squares and fine lines take the stepped cells; the pictures take the neon line. */
const isMechanical = (background: string) => ['pixels', 'plotter', 'weave', 'flock', 'ridges', 'circuit', 'aquarium', 'valley'].includes(background)

/** The progress bar in the style of the background in use: cells, symbols, a neon line, or the wax tube. */
export const themedBar = (theme: Theme, background: string, fraction: number | null): string =>
  isMechanical(background) ? pixelBar(theme, fraction) : background === 'rain' ? symbolBar(theme, fraction) : isScenery(background) ? neonBar(theme, fraction) : lavaBar(theme, fraction)

/**
 * A small picture of the app in a theme, for browsing before applying: the page
 * over the background in use (wax, squares, symbols, a drawn scene, or none), two frosted
 * panels, a few lines of text, an accent button and the progress bar.
 */
export const preview = (theme: Theme, background: string = theme.background): string => {
  const w = 320
  const h = 190
  const blobs: [number, number, number, number, number][] = [
    [40, 150, 46, 0, 9],
    [120, 40, 34, 1, 12],
    [200, 160, 50, 2, 10],
    [285, 60, 40, 3, 13],
    [250, 120, 26, 1, 8],
  ]
  // the page behind the panels, drawn as the background in use: wax, squares, symbols, or the colours alone
  let back = `<g class="wax" filter="url(#soft)">${blobs.map(([x, y, r, c, d], i) => `<ellipse class="f c${c}" style="--dy:${i % 2 ? d : -d}px;animation-delay:-${i * 2}s" cx="${x}" cy="${y}" rx="${r}" ry="${Math.round(r * 1.1)}"/>`).join('')}</g>`
  if (background === 'plain') back = ''
  if (background === 'pixels') {
    let squares = ''
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 16; c++) {
        const n = (r * 31 + c * 17 + r * c * 7) % 23
        if (n > 4 + r) continue
        squares += `<rect class="bl c${n % 4}" style="animation-delay:-${(n * 0.7).toFixed(1)}s" x="${c * 20 + 2}" y="${r * 19 + 2}" width="16" height="15" rx="3"/>`
      }
    }
    back = `<g class="wax">${squares}</g>`
  }
  if (background === 'rain') {
    const marks = ['7', '+', 'Σ', '0', '#', 'λ', '=', '4', 'π', '*', '1', 'Δ']
    let streams = ''
    for (let c = 0; c < 20; c++) {
      const n = 3 + ((c * 7) % 6)
      const top = ((c * 53) % 110) - 20
      let spans = ''
      for (let i = 0; i < n; i++) {
        spans += `<tspan x="${c * 16 + 8}" dy="13" ${i === n - 1 ? 'class="hd"' : `fill-opacity="${(0.15 + (0.7 * i) / n).toFixed(2)}"`}>${marks[(c * 3 + i * 5) % marks.length]}</tspan>`
      }
      streams += `<text class="rn c${c % 5 === 4 ? 1 : 0}" style="animation-delay:-${(c * 0.9) % 6}s" y="${top}">${spans}</text>`
    }
    back = `<g class="wax">${streams}</g>`
  }
  // a drawn scene is the scene itself, small: the same SVG set into the window
  if (isScenery(background)) back = SCENERY[background](theme, true).replace('<svg ', `<svg x="0" y="0" width="${w}" height="${h}" `)
  // the little progress bar in the panel, in the same style as the real one
  let mini = `<g clip-path="url(#tube)"><rect class="c0" x="104" y="150" width="130" height="10"/><ellipse class="c1" cx="130" cy="151" rx="12" ry="5"/><ellipse class="c2" cx="170" cy="160" rx="13" ry="5"/><ellipse class="c3" cx="214" cy="151" rx="11" ry="5"/></g>`
  if (isMechanical(background)) {
    mini = Array.from({ length: 16 }, (_, i) => `<rect class="${i < 10 ? `c${(i * 7) % 4}` : 'tr'}" x="${104 + i * 12.2}" y="150" width="9.5" height="9.5" rx="2"/>`).join('')
  }
  if (background === 'rain') {
    const row = ['7', '+', 'Σ', '0', '#', 'λ', '=', '4', 'π', '*', '1', 'Δ', '/', '9', 'φ', ':', '3', 'Ω']
    mini = row.map((g, i) => `<text class="${i === 10 ? 'hd' : i < 10 ? 'c0' : 'm'} sy" x="${109 + i * 10.8}" y="160">${g}</text>`).join('')
  }
  if (isScenery(background) && !isMechanical(background)) {
    mini = `<rect class="tr" x="104" y="153.5" width="194" height="3" rx="1.5"/><rect class="c0" x="104" y="153.5" width="120" height="3" rx="1.5"/><circle class="hd" cx="224" cy="155" r="4.5"/>`
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<style>.bl{animation:bl 5s ease-in-out infinite alternate}@keyframes bl{from{opacity:.15}to{opacity:1}}` +
    `.rn{font:11px ui-monospace,Menlo,monospace;text-anchor:middle;animation:rn 6s linear infinite}@keyframes rn{from{transform:translateY(-70px)}to{transform:translateY(150px)}}.hd{fill:var(--text)}` +
    `.sy{font:600 10px ui-monospace,Menlo,monospace;text-anchor:middle}@media(prefers-reduced-motion:reduce){.bl,.rn{animation:none}}</style>` +
    `<style>svg{${vars(theme.colors)};--card:${theme.colors.card};--accent:${theme.colors.accent};--wax:.75}` +
    `.g{fill:var(--ground)}.edge{fill:none;stroke:var(--text);stroke-opacity:.22}.k{fill:var(--card);fill-opacity:.72;stroke:var(--text);stroke-opacity:.1}` +
    `${[0, 1, 2, 3].map(i => `.c${i}{fill:var(--w${i})}`).join('')}.wax{opacity:var(--wax)}` +
    `.t{fill:var(--text)}.m{fill:var(--text);fill-opacity:.38}.a{fill:var(--accent)}.tr{fill:var(--text);fill-opacity:.14}` +
    `.aa{fill:var(--text);font:600 15px system-ui,sans-serif}` +
    `.f{animation:f 9s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 50%}@keyframes f{to{transform:translateY(var(--dy)) scale(1.08,.94)}}` +
    `@media(prefers-reduced-motion:reduce){.f{animation:none}}</style>` +
    `<defs><clipPath id="win"><rect x="0" y="0" width="${w}" height="${h}" rx="14"/></clipPath>` +
    `<filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>` +
    `<clipPath id="tube"><rect x="104" y="150" width="130" height="10" rx="5"/></clipPath></defs>` +
    `<g clip-path="url(#win)"><rect class="g" width="${w}" height="${h}"/>` +
    back +
    `<rect class="k" x="10" y="10" width="72" height="170" rx="9"/>` +
    [0, 1, 2, 3].map(i => `<rect class="m" x="20" y="${24 + i * 16}" width="${[44, 52, 36, 48][i]}" height="6" rx="3"/>`).join('') +
    `<rect class="k" x="92" y="10" width="218" height="170" rx="9"/>` +
    `<text class="aa" x="104" y="36">Aa 123</text>` +
    [0, 1, 2].map(i => `<rect class="${i === 0 ? 't' : 'm'}" x="104" y="${50 + i * 14}" width="${[150, 186, 120][i]}" height="6" rx="3"/>`).join('') +
    `<rect class="a" x="104" y="100" width="62" height="20" rx="10"/>` +
    (isMechanical(background) || background === 'rain' || isScenery(background) ? '' : `<rect class="tr" x="104" y="150" width="194" height="10" rx="5"/>`) +
    mini +
    `</g><rect class="edge" x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="13.5"/></svg>`
  )
}
