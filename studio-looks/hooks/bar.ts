// Drawn pieces that are not the backdrop: the lava progress bar and the picker's
// swatch strip. Both follow the light or dark setting the same way the scene does.
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
    `svg{${vars(theme.dark)}}` +
    `@media(prefers-color-scheme:light){svg{${vars(theme.light)}}}` +
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
  `<style>svg{${vars(theme.dark)}}@media(prefers-color-scheme:light){svg{${vars(theme.light)}}}` +
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

/** The progress bar in the style of the background in use: pixel cells, symbols, or the wax tube. */
export const themedBar = (theme: Theme, background: string, fraction: number | null): string =>
  background === 'pixels' ? pixelBar(theme, fraction) : background === 'rain' ? symbolBar(theme, fraction) : lavaBar(theme, fraction)

/** The look at a glance for the picker: the ground with the four wax colours on it. */
export const swatch = (theme: Theme): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="56" viewBox="0 0 320 56">` +
  `<style>svg{${vars(theme.dark)};--card:${theme.dark.card}}@media(prefers-color-scheme:light){svg{${vars(theme.light)};--card:${theme.light.card}}}` +
  `.g{fill:var(--ground);stroke:var(--text);stroke-opacity:.2}.k{fill:var(--card)}${[0, 1, 2, 3].map(i => `.c${i}{fill:var(--w${i})}`).join('')}.t{fill:var(--text);font:600 13px system-ui,sans-serif}</style>` +
  `<rect class="g" x=".5" y=".5" width="319" height="55" rx="12"/>` +
  `<rect class="k" x="10" y="10" width="124" height="36" rx="8"/><text class="t" x="22" y="33">Aa 123</text>` +
  [0, 1, 2, 3].map(i => `<circle class="c${i}" cx="${166 + i * 40}" cy="28" r="15"/>`).join('') +
  `</svg>`

/**
 * A small picture of the app in a theme, for browsing before applying: the page
 * with its wax, two frosted panels, a few lines of text, an accent button and
 * the progress tube.
 */
export const preview = (theme: Theme): string => {
  const w = 320
  const h = 190
  const blobs: [number, number, number, number, number][] = [
    [40, 150, 46, 0, 9],
    [120, 40, 34, 1, 12],
    [200, 160, 50, 2, 10],
    [285, 60, 40, 3, 13],
    [250, 120, 26, 1, 8],
  ]
  // the page behind the panels, drawn as the theme's own background: wax, squares or symbols
  let back = `<g class="wax" filter="url(#soft)">${blobs.map(([x, y, r, c, d], i) => `<ellipse class="f c${c}" style="--dy:${i % 2 ? d : -d}px;animation-delay:-${i * 2}s" cx="${x}" cy="${y}" rx="${r}" ry="${Math.round(r * 1.1)}"/>`).join('')}</g>`
  if (theme.background === 'pixels') {
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
  if (theme.background === 'rain') {
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
  // the little progress bar in the panel, in the same style as the real one
  let mini = `<g clip-path="url(#tube)"><rect class="c0" x="104" y="150" width="130" height="10"/><ellipse class="c1" cx="130" cy="151" rx="12" ry="5"/><ellipse class="c2" cx="170" cy="160" rx="13" ry="5"/><ellipse class="c3" cx="214" cy="151" rx="11" ry="5"/></g>`
  if (theme.background === 'pixels') {
    mini = Array.from({ length: 16 }, (_, i) => `<rect class="${i < 10 ? `c${(i * 7) % 4}` : 'tr'}" x="${104 + i * 12.2}" y="150" width="9.5" height="9.5" rx="2"/>`).join('')
  }
  if (theme.background === 'rain') {
    const row = ['7', '+', 'Σ', '0', '#', 'λ', '=', '4', 'π', '*', '1', 'Δ', '/', '9', 'φ', ':', '3', 'Ω']
    mini = row.map((g, i) => `<text class="${i === 10 ? 'hd' : i < 10 ? 'c0' : 'm'} sy" x="${109 + i * 10.8}" y="160">${g}</text>`).join('')
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<style>.bl{animation:bl 5s ease-in-out infinite alternate}@keyframes bl{from{opacity:.15}to{opacity:1}}` +
    `.rn{font:11px ui-monospace,Menlo,monospace;text-anchor:middle;animation:rn 6s linear infinite}@keyframes rn{from{transform:translateY(-70px)}to{transform:translateY(150px)}}.hd{fill:var(--text)}` +
    `.sy{font:600 10px ui-monospace,Menlo,monospace;text-anchor:middle}@media(prefers-reduced-motion:reduce){.bl,.rn{animation:none}}</style>` +
    `<style>svg{${vars(theme.dark)};--card:${theme.dark.card};--accent:${theme.dark.accent};--wax:.75}` +
    `@media(prefers-color-scheme:light){svg{${vars(theme.light)};--card:${theme.light.card};--accent:${theme.light.accent};--wax:.55}}` +
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
    (theme.background === 'pixels' || theme.background === 'rain' ? '' : `<rect class="tr" x="104" y="150" width="194" height="10" rx="5"/>`) +
    mini +
    `</g><rect class="edge" x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="13.5"/></svg>`
  )
}
