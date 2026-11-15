// Six drawn scenes: a synthwave grid, a retro sunset, a night city, and three mechanical ones (a plotter, a loom,
// a field of small machines). Each is one SVG that moves by CSS alone, kept to what the desktop app will animate:
// its listed SVG elements, CSS whose every function is a colour, maths, transform, easing or filter function
// (so no path() and no CSS gradients), `@media (` with the space, nothing fetched.
import type { Mode, Theme } from './themes.ts'

export type Scenery = 'grid' | 'sunset' | 'city' | 'plotter' | 'weave' | 'glyphs'

const W = 1600
const H = 1000

/** A small fixed-seed random source, so a scene is the same drawing every time it is asked for. */
export const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const n1 = (v: number) => +v.toFixed(1)
const n2 = (v: number) => +v.toFixed(2)
const vars = (m: Mode) => `--ground:${m.ground};--text:${m.text};${m.washes.map((c, i) => `--w${i}:${c}`).join(';')}`

type Parts = { dark?: string; light?: string; defs?: string; css: string; body: string }

// The frame every scene here shares: the theme's colours as variables that swap with the colour scheme, the ground,
// and the switch that holds everything still. An element's inline style is where it rests; its animation moves it from there.
const shell = (theme: Theme, moving: boolean, o: Parts): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">` +
  `<defs>${o.defs ?? ''}</defs>` +
  `<style>svg{${vars(theme.dark)};${o.dark ?? ''}}@media (prefers-color-scheme:light){svg{${vars(theme.light)};${o.light ?? ''}}}` +
  `.ground{fill:var(--ground)}.sg{stop-color:var(--ground)}.t{fill:var(--text)}.kt{stroke:var(--text)}` +
  [0, 1, 2, 3].map(i => `.c${i}{fill:var(--w${i})}.s${i}{stop-color:var(--w${i})}.k${i}{stroke:var(--w${i})}`).join('') +
  o.css +
  (moving ? `@media (prefers-reduced-motion:reduce){*{animation:none!important}}` : `*{animation:none!important}`) +
  `</style>` +
  `<rect class="ground" x="-400" y="-400" width="${W + 800}" height="${H + 800}"/>` +
  o.body +
  `</svg>`

/** Synthwave: a floor grid rolling toward you, a slotted sun on the horizon, wire mountains, slow stars. */
const grid = (theme: Theme, moving: boolean): string => {
  const rand = seeded(23)
  const HZ = 600
  const VP = 800
  const K = 520
  const FAR = 13
  const LINES = 24
  const T = 16
  // A floor line's drop below the horizon at p of its way from far to near, and how far it has faded in.
  const at = (p: number): [number, number] => [n1(K / (FAR - (FAR - 1) * p)), n2(Math.min(1, p * 5))]
  const roll = [0, 0.2, 0.4, 0.55, 0.67, 0.76, 0.83, 0.88, 0.92, 0.95, 0.97, 0.985, 1]
    .map(p => {
      const [y, o] = at(p)
      return `${n1(p * 100)}%{transform:translateY(${y}px);opacity:${o}}`
    })
    .join('')

  let stars = ''
  for (let i = 0; i < 80; i++) {
    stars += `<circle class="st t" cx="${Math.round(rand() * W)}" cy="${Math.round(rand() * (HZ - 90))}" r="${n1(0.9 + rand() * 1.5)}" style="opacity:${n2(0.3 + rand() * 0.5)};animation-duration:${n1(4 + rand() * 6)}s;animation-delay:-${n1(rand() * 9)}s"/>`
  }

  let slits = ''
  for (let i = 0; i < 6; i++) {
    const p = i / 6
    slits += `<rect class="sl" x="540" y="0" width="520" height="30" style="transform:translateY(${n1(430 + 176 * p)}px) scaleY(${n2(0.05 + 0.95 * p)});animation-delay:-${n2(p * 10)}s"/>`
  }

  const range = (side: number): string => {
    const pts: [number, number][] = []
    for (let x = side < 0 ? -120 : 1040; x <= (side < 0 ? 560 : 1720); x += 60 + rand() * 60) {
      const edge = Math.min(1, Math.abs(x - VP) / 800)
      pts.push([Math.round(x), Math.round(HZ - (20 + rand() * 110) * (0.35 + 0.65 * edge))])
    }
    const line = pts.map(p => p.join(',')).join(' ')
    const ribs = pts.map(([x, y]) => `<line x1="${x}" y1="${y}" x2="${Math.round(x + (rand() - 0.5) * 90)}" y2="${HZ}"/>`).join('')
    return `<polygon class="ground" points="${pts[0]?.[0] ?? 0},${HZ} ${line} ${pts[pts.length - 1]?.[0] ?? 0},${HZ}"/><polyline points="${line}"/>${ribs}`
  }

  let across = ''
  for (let i = 0; i < LINES; i++) {
    const [y, o] = at(i / LINES)
    across += `<line class="h" x1="-600" x2="2200" y1="${HZ}" y2="${HZ}" style="transform:translateY(${y}px);opacity:${o};animation-delay:-${n2((i / LINES) * T)}s"/>`
  }
  let away = ''
  for (let k = -40; k <= 40; k++) away += `<line x1="${VP}" y1="${HZ}" x2="${VP + k * 300}" y2="${HZ + K}"/>`

  return shell(theme, moving, {
    dark: '--stars:1',
    light: '--stars:.4',
    defs:
      `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop class="s2" offset=".2" stop-opacity="0"/><stop class="s2" offset="1" stop-opacity=".5"/></linearGradient>` +
      `<linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop class="s3" offset="0"/><stop class="s0" offset=".78"/></linearGradient>` +
      `<radialGradient id="halo"><stop class="s0" offset="0" stop-opacity=".45"/><stop class="s0" offset="1" stop-opacity="0"/></radialGradient>` +
      `<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop class="s2" offset="0" stop-opacity=".34"/><stop class="s2" offset="1" stop-opacity=".04"/></linearGradient>` +
      `<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop class="sg" offset="0" stop-opacity="1"/><stop class="sg" offset="1" stop-opacity="0"/></linearGradient>` +
      `<linearGradient id="glow" x1="0" y1="0" x2="0" y2="1"><stop class="s1" offset="0" stop-opacity="0"/><stop class="s1" offset="1" stop-opacity=".4"/></linearGradient>` +
      `<mask id="slot" maskUnits="userSpaceOnUse" x="520" y="200" width="560" height="520"><rect x="520" y="200" width="560" height="520" fill="#fff"/>${slits}</mask>`,
    css:
      `.sky{opacity:var(--stars)}.st{animation:twinkle 6s ease-in-out infinite alternate}@keyframes twinkle{from{opacity:.12}to{opacity:.95}}` +
      `.sl{fill:#000;animation:slot 10s linear infinite}@keyframes slot{from{transform:translateY(430px) scaleY(.05)}to{transform:translateY(606px) scaleY(1)}}` +
      `.halo{animation:breathe 9s ease-in-out infinite alternate}@keyframes breathe{from{opacity:.55}to{opacity:1}}` +
      `.wire{fill:none;stroke:var(--w2);stroke-width:1.6;stroke-linejoin:round}` +
      `.floor{fill:none;stroke:var(--w1);stroke-width:2;opacity:.8}` +
      `.h{animation:roll ${T}s linear infinite}@keyframes roll{${roll}}`,
    body:
      `<rect x="-400" y="-400" width="${W + 800}" height="${HZ + 400}" fill="url(#sky)"/>` +
      `<g class="sky">${stars}</g>` +
      `<circle class="halo" cx="${VP}" cy="470" r="430" fill="url(#halo)"/>` +
      `<circle cx="${VP}" cy="470" r="230" fill="url(#sun)" mask="url(#slot)"/>` +
      `<g class="wire">${range(-1)}${range(1)}</g>` +
      `<rect class="ground" x="-400" y="${HZ}" width="${W + 800}" height="${H - HZ + 400}"/>` +
      `<rect x="-400" y="${HZ}" width="${W + 800}" height="${H - HZ + 400}" fill="url(#floor)"/>` +
      `<g class="floor">${away}${across}</g>` +
      `<rect x="-400" y="${HZ}" width="${W + 800}" height="52" fill="url(#haze)"/>` +
      `<rect x="-400" y="${HZ - 70}" width="${W + 800}" height="70" fill="url(#glow)"/>` +
      `<rect class="c1" x="-400" y="${HZ - 1.5}" width="${W + 800}" height="3"/>`,
  })
}

/** Retro sunset: a banded sun setting into water, rings behind it, its reflection shimmering, islands with palms, birds. */
const sunset = (theme: Theme, moving: boolean): string => {
  const rand = seeded(41)
  const HZ = 640
  const CX = 800
  const CY = 500
  const R = 240

  const fills = ['var(--w0)', 'color-mix(in srgb,var(--w0),var(--w1))', 'var(--w1)', 'var(--w2)', 'var(--w3)', 'var(--w3)']
  const bands = fills.map((fill, i) => `<rect x="${CX - R}" y="${CY - R + i * 76 + i * 3}" width="${R * 2}" height="${76 - i * 4}" style="fill:${fill}"/>`).join('')
  const rings = ([[300, 1, 0.3], [372, 2, 0.24], [444, 3, 0.18]] as const)
    .map(([r, c, o], i) => `<circle class="ring k${c}" cx="${CX}" cy="${CY}" r="${r}" style="opacity:${o};animation-delay:-${i * 4}s"/>`)
    .join('')

  let glints = ''
  for (let j = 0; j < 13; j++) {
    const half = 46 + j * 17 + rand() * 30
    const tall = n1(5 + j * 0.5)
    glints += `<rect class="rf c${Math.min(3, Math.floor(j / 3.3))}" x="${Math.round(CX - half)}" y="${Math.round(HZ + 14 + j * 24 + j * j * 0.9)}" width="${Math.round(half * 2)}" height="${tall}" rx="${tall / 2}" style="opacity:${n2(0.85 - j * 0.045)};animation-duration:${n1(3.4 + rand() * 2.6)}s;animation-delay:-${n1(rand() * 5)}s"/>`
  }
  for (let i = 0; i < 40; i++) {
    glints += `<rect class="sp c${Math.floor(rand() * 2)}" x="${Math.round(rand() * W)}" y="${Math.round(HZ + 16 + rand() * (H - HZ))}" width="${Math.round(14 + rand() * 28)}" height="3" rx="1.5" style="opacity:${n2(0.1 + rand() * 0.3)};animation-duration:${n1(3 + rand() * 4)}s;animation-delay:-${n1(rand() * 6)}s"/>`
  }

  // A soft ridge from x0 to x1, low at both ends.
  const ridge = (x0: number, x1: number, low: number, high: number): string => {
    const xs: number[] = []
    const ys: number[] = []
    for (let x = x0; x <= x1; x += 80) {
      const fromEdge = Math.min(Math.abs(x - x0), Math.abs(x - x1)) / ((x1 - x0) / 2)
      xs.push(x)
      ys.push(HZ - (low + rand() * (high - low)) * Math.min(1, fromEdge * 1.6))
    }
    let d = `M${x0} ${HZ + 2}L${xs[0] ?? x0} ${n1(ys[0] ?? HZ)}`
    for (let i = 1; i < xs.length - 1; i++) {
      const x = xs[i] ?? x0
      const y = ys[i] ?? HZ
      d += `Q${x} ${n1(y)} ${(x + (xs[i + 1] ?? x)) / 2} ${n1((y + (ys[i + 1] ?? y)) / 2)}`
    }
    return `<path d="${d}L${x1} ${HZ + 2}Z"/>`
  }

  const palm = (x: number, base: number, tall: number, lean: number): string => {
    const tx = x + lean
    const ty = base - tall
    let fronds = ''
    for (const a of [-200, -170, -140, -105, -75, -40, -10, 20]) {
      const len = tall * 0.44 * (0.85 + rand() * 0.3)
      const cos = Math.cos((a * Math.PI) / 180)
      const sin = Math.sin((a * Math.PI) / 180)
      const ex = tx + len * cos
      const ey = ty + len * sin + len * 0.38
      const mx = tx + len * 0.55 * cos
      const my = ty + len * 0.55 * sin - len * 0.24
      fronds += `<path d="M${tx} ${ty}Q${n1(mx)} ${n1(my)} ${n1(ex)} ${n1(ey)}Q${n1(mx)} ${n1(my + len * 0.2)} ${tx} ${ty}Z"/>`
    }
    return (
      `<path class="trunk" d="M${x} ${base}Q${n1(x + lean * 0.15)} ${n1(base - tall * 0.55)} ${tx} ${ty}" style="stroke-width:${n1(tall * 0.045)}"/>` +
      `<g class="fr" style="transform-origin:${tx}px ${ty}px;animation-duration:${n1(6 + rand() * 4)}s;animation-delay:-${n1(rand() * 6)}s">${fronds}</g>`
    )
  }

  const bird = (x: number, y: number, s: number) => `<path d="M${x} ${y}q${9 * s} ${-9 * s} ${18 * s} 0q${9 * s} ${-9 * s} ${18 * s} 0"/>`

  return shell(theme, moving, {
    dark: '--sil:color-mix(in srgb,var(--ground) 78%,#000);--sil2:color-mix(in srgb,var(--ground) 64%,var(--w3))',
    light: '--sil:color-mix(in srgb,var(--text) 82%,var(--w3));--sil2:color-mix(in srgb,var(--text) 42%,var(--w3))',
    defs:
      `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop class="s3" offset=".4" stop-opacity="0"/><stop class="s3" offset=".74" stop-opacity=".38"/><stop class="s2" offset=".9" stop-opacity=".5"/><stop class="s1" offset="1" stop-opacity=".62"/></linearGradient>` +
      `<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop class="s3" offset="0" stop-opacity=".34"/><stop class="s3" offset=".6" stop-opacity="0"/></linearGradient>` +
      `<clipPath id="disc"><circle cx="${CX}" cy="${CY}" r="${R}"/></clipPath>`,
    css:
      `.ring{fill:none;stroke-width:30;animation:ring 12s ease-in-out infinite alternate}@keyframes ring{from{stroke-width:22}to{stroke-width:36}}` +
      `.sun{animation:bob 16s ease-in-out infinite alternate}@keyframes bob{from{transform:translateY(8px)}to{transform:translateY(-12px)}}` +
      `.rf,.sp{transform-box:fill-box;transform-origin:50% 50%}` +
      `.rf{animation:shimmer 4s ease-in-out infinite alternate}@keyframes shimmer{from{transform:translateX(-9px) scaleX(1.06)}to{transform:translateX(11px) scaleX(.7)}}` +
      `.sp{animation:glint 5s ease-in-out infinite alternate}@keyframes glint{from{transform:scaleX(.3)}to{transform:scaleX(1.2)}}` +
      `.far{fill:var(--sil2);animation:drift 70s ease-in-out infinite alternate}.near{fill:var(--sil);animation:drift 50s ease-in-out infinite alternate-reverse}@keyframes drift{from{transform:translateX(-22px)}to{transform:translateX(22px)}}` +
      `.trunk{fill:none;stroke:var(--sil);stroke-linecap:round}.fr{animation:sway 8s ease-in-out infinite alternate}@keyframes sway{from{transform:rotate(-2.5deg)}to{transform:rotate(2.5deg)}}` +
      `.birds{fill:none;stroke:var(--text);stroke-width:2.4;stroke-linecap:round;opacity:.5;animation:cross 90s linear infinite}@keyframes cross{from{transform:translateX(-500px)}to{transform:translateX(1900px)}}`,
    body:
      `<rect x="-400" y="-400" width="${W + 800}" height="${HZ + 400}" fill="url(#sky)"/>` +
      rings +
      `<g class="sun"><g clip-path="url(#disc)">${bands}</g></g>` +
      `<g class="birds" style="transform:translateX(420px);animation-delay:-36s">${bird(0, 210, 1)}${bird(58, 236, 0.8)}${bird(-40, 250, 0.7)}</g>` +
      `<rect class="ground" x="-400" y="${HZ}" width="${W + 800}" height="${H - HZ + 400}"/>` +
      `<rect x="-400" y="${HZ}" width="${W + 800}" height="${H - HZ + 400}" fill="url(#sea)"/>` +
      glints +
      `<g class="far">${ridge(-300, 520, 30, 120)}${ridge(1090, 1900, 30, 130)}</g>` +
      `<g class="near">${ridge(-300, 380, 18, 66)}${ridge(1250, 1900, 18, 70)}${palm(170, HZ - 34, 260, 46)}${palm(280, HZ - 22, 180, -26)}${palm(1440, HZ - 36, 280, -52)}${palm(1350, HZ - 20, 170, 24)}</g>`,
  })
}

/** Cyberpunk: three rows of towers, lit windows and neon signs, searchlights, slanting rain, a passing scan. */
const city = (theme: Theme, moving: boolean): string => {
  const rand = seeded(57)
  type Tower = [x: number, width: number, height: number]
  // A row of towers across the window, taller toward its edges.
  const row = (wMin: number, wMax: number, hMin: number, hMax: number): Tower[] => {
    const out: Tower[] = []
    for (let x = -60; x < W + 60; ) {
      const w = wMin + rand() * (wMax - wMin)
      const edge = 0.72 + 0.5 * Math.min(1, Math.abs(x + w / 2 - 800) / 800)
      out.push([Math.round(x), Math.round(w), Math.round((hMin + rand() * (hMax - hMin)) * edge)])
      x += w + (rand() < 0.25 ? rand() * 26 : 0)
    }
    return out
  }
  const far = row(46, 110, 260, 520)
    .map(([x, w, h]) => `<rect x="${x}" y="${H - h}" width="${w}" height="${h + 40}"/>`)
    .join('')

  const towers = row(90, 170, 260, 600)
  // a searchlight stands on the tallest tower of each side, clear of the window's edge so a narrow window still shows it
  const roof = (side: number): [number, number] => {
    const best = towers.filter(([x, w]) => (side < 0 ? x > 220 && x + w < 640 : x > 960 && x + w < 1380)).sort((p, q) => q[2] - p[2])[0]
    return best ? [Math.round(best[0] + best[1] / 2), H - best[2] + 8] : [side < 0 ? 400 : 1200, H - 480]
  }
  let mid = ''
  let lights = ''
  let signs = ''
  towers.forEach(([x, w, h], b) => {
    const top = H - h
    mid += `<rect x="${x}" y="${top}" width="${w}" height="${h + 40}"/>`
    const cols = Math.floor((w - 14) / 22)
    const rows = Math.min(16, Math.floor((h - 30) / 30))
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (rand() > 0.24) continue
        const pick = rand()
        const blinks = rand() < 0.16
        lights += `<rect class="${blinks ? 'blink ' : ''}c${pick < 0.8 ? 0 : pick < 0.92 ? 1 : 2}" x="${x + 9 + c * 22}" y="${top + 18 + r * 30}" width="10" height="15" style="opacity:${n2(0.22 + rand() * 0.55)}${blinks ? `;animation-duration:${n1(9 + rand() * 14)}s;animation-delay:-${n1(rand() * 20)}s` : ''}"/>`
      }
    }
    if (h > 440) lights += `<line class="mast" x1="${x + w / 2}" y1="${top}" x2="${x + w / 2}" y2="${top - 54}"/><circle class="beacon c2" cx="${x + w / 2}" cy="${top - 56}" r="3.6" style="animation-delay:-${n1(rand() * 3)}s"/>`
    if (b % 2 === 0 && w > 100) {
      const k = [1, 2, 0][Math.floor(rand() * 3)] ?? 1
      const sx = x + 14 + rand() * (w - 60)
      const sy = top + 40 + rand() * 60
      const sw = 28
      const sh = 100 + rand() * 60
      // marks inside the sign: bars and squares, no letters of any script
      let strokes = ''
      for (let i = 0; i < 4; i++) {
        const y = sy + 16 + (i * (sh - 32)) / 3
        strokes += rand() < 0.5 ? `<line x1="${n1(sx + 7)}" y1="${n1(y)}" x2="${n1(sx + sw - 7)}" y2="${n1(y)}"/>` : `<rect x="${n1(sx + 9)}" y="${n1(y - 5)}" width="10" height="10"/>`
      }
      const frame = `<rect x="${n1(sx)}" y="${n1(sy)}" width="${sw}" height="${n1(sh)}" rx="3"/>${strokes}`
      signs += `<g class="neon k${k} ${rand() < 0.4 ? 'fl' : 'hum'}" style="animation-delay:-${n1(rand() * 9)}s"><g class="aura">${frame}</g>${frame}</g>`
    }
  })

  const near = row(120, 240, 60, 170)
    .map(([x, w, h]) => `<rect x="${x}" y="${H - h}" width="${w}" height="${h + 40}"/>` + (rand() < 0.5 ? `<rect x="${x + 18}" y="${H - h - 26}" width="34" height="26"/>` : `<rect x="${x + w - 30}" y="${H - h - 44}" width="5" height="44"/>`))
    .join('')

  let rain = ''
  for (let i = 0; i < 110; i++) {
    const x = Math.round(rand() * 2000 - 100)
    const len = 50 + rand() * 60
    const dur = 0.7 + rand() * 0.8
    const p = rand()
    rain += `<line class="drop" x1="${x}" y1="${-Math.round(len)}" x2="${Math.round(x - len * 0.22)}" y2="0" style="transform:translate(${Math.round(-242 * p)}px,${Math.round(1100 * p)}px);opacity:${n2(0.12 + rand() * 0.22)};animation-duration:${n2(dur)}s;animation-delay:-${n2(p * dur)}s"/>`
  }

  const beam = ([x, y]: [number, number], from: number, to: number, secs: number) =>
    `<polygon class="beam" points="${x},${y} ${x - 64},${y - 900} ${x + 64},${y - 900}" fill="url(#beam)" style="transform-origin:${x}px ${y}px;transform:rotate(${(from + to) / 2}deg);--a:${from}deg;--b:${to}deg;animation-duration:${secs}s"/>`
  const flyer = (y: number, secs: number, p: number) =>
    `<g class="fly" style="transform:translateX(${Math.round(-100 + 1900 * p)}px);animation-duration:${secs}s;animation-delay:-${n1(p * secs)}s"><rect x="0" y="${y}" width="52" height="2.4" fill="url(#trail)"/><circle class="c0" cx="52" cy="${y + 1.2}" r="2.6"/></g>`

  return shell(theme, moving, {
    dark: '--b1:color-mix(in srgb,var(--ground) 70%,var(--w3));--b2:color-mix(in srgb,var(--ground) 86%,var(--w3));--b3:color-mix(in srgb,var(--ground) 92%,#000);--lit:1',
    light: '--b1:color-mix(in srgb,var(--ground) 80%,var(--w3));--b2:color-mix(in srgb,var(--ground) 56%,var(--w3));--b3:color-mix(in srgb,var(--text) 78%,var(--w3));--lit:.9',
    defs:
      `<linearGradient id="smog" x1="0" y1="0" x2="0" y2="1"><stop class="s3" offset="0" stop-opacity="0"/><stop class="s3" offset="1" stop-opacity=".45"/></linearGradient>` +
      `<radialGradient id="moon"><stop class="s1" offset="0" stop-opacity=".3"/><stop class="s1" offset="1" stop-opacity=".04"/></radialGradient>` +
      `<linearGradient id="beam" x1="0" y1="1" x2="0" y2="0"><stop class="s1" offset="0" stop-opacity=".3"/><stop class="s1" offset="1" stop-opacity="0"/></linearGradient>` +
      `<linearGradient id="trail" x1="0" y1="0" x2="1" y2="0"><stop class="s0" offset="0" stop-opacity="0"/><stop class="s0" offset="1" stop-opacity=".85"/></linearGradient>` +
      `<linearGradient id="scan" x1="0" y1="0" x2="0" y2="1"><stop class="s1" offset="0" stop-opacity="0"/><stop class="s1" offset=".85" stop-opacity=".1"/><stop class="s1" offset="1" stop-opacity="0"/></linearGradient>`,
    css:
      `.far{fill:var(--b1)}.mid{fill:var(--b2)}.near{fill:var(--b3)}.lit{opacity:var(--lit)}` +
      `.blink{animation:blink 14s linear infinite}@keyframes blink{0%,44%{opacity:.8}50%,94%{opacity:.08}100%{opacity:.8}}` +
      `.mast{stroke:var(--b2);stroke-width:3}.beacon{animation:beacon 2.6s ease-in-out infinite alternate}@keyframes beacon{from{opacity:.15}to{opacity:1}}` +
      `.neon{fill:none;stroke-width:2.4;stroke-linecap:round}.aura{stroke-width:9;opacity:.24}` +
      `.hum{animation:hum 5s ease-in-out infinite alternate}@keyframes hum{from{opacity:.72}to{opacity:1}}` +
      // a short stutter in a small sign: far too small an area to count as flashing
      `.fl{animation:flicker 9s linear infinite}@keyframes flicker{0%,86%{opacity:1}87%{opacity:.35}88.5%{opacity:1}91%{opacity:.5}92%,100%{opacity:1}}` +
      `.beam{animation:sweep 19s ease-in-out infinite alternate}@keyframes sweep{from{transform:rotate(var(--a))}to{transform:rotate(var(--b))}}` +
      `.fly{animation:fly 24s linear infinite}@keyframes fly{from{transform:translateX(-100px)}to{transform:translateX(1800px)}}` +
      `.drop{stroke:var(--text);stroke-width:1.6;animation:rain 1s linear infinite}@keyframes rain{from{transform:translate(0,0)}to{transform:translate(-242px,1100px)}}` +
      `.scan{animation:scan 12s linear infinite}@keyframes scan{from{transform:translateY(0)}to{transform:translateY(1400px)}}`,
    body:
      `<circle cx="1250" cy="230" r="130" fill="url(#moon)"/><circle class="k1" cx="1250" cy="230" r="130" fill="none" stroke-width="1.5" opacity=".4"/>` +
      `<rect x="-400" y="300" width="${W + 800}" height="${H - 300 + 400}" fill="url(#smog)"/>` +
      flyer(250, 26, 0.2) +
      flyer(330, 19, 0.65) +
      flyer(410, 32, 0.45) +
      `<g class="far">${far}</g>` +
      beam(roof(-1), -26, 24, 19) +
      beam(roof(1), 26, -22, 23) +
      `<g class="mid">${mid}</g>` +
      `<g class="lit">${lights}${signs}</g>` +
      `<g class="near">${near}</g>` +
      `<g>${rain}</g>` +
      `<rect class="scan" x="-400" y="-200" width="${W + 800}" height="180" fill="url(#scan)" style="transform:translateY(520px)"/>`,
  })
}

/** A plotter at work: blocks hatched line by line in two passes, a carriage at the working edge, then lifted. */
const plotter = (theme: Theme, moving: boolean): string => {
  const T = 30
  const BLOCKS: readonly (readonly [number, number, number, number])[] = [
    [80, 96, 310, 190],
    [1190, 80, 330, 220],
    [60, 440, 230, 320],
    [1300, 430, 240, 290],
    [400, 750, 380, 180],
    [880, 760, 300, 170],
    [640, 120, 340, 150],
  ]
  let defs = ''
  let body = ''
  BLOCKS.forEach(([x, y, w, h], i) => {
    const reach = n1((w + h) / Math.SQRT2)
    const lines = Math.round(reach / 14)
    const delay = `animation-delay:-${n1((i * T) / BLOCKS.length)}s`
    // Each pass works in its own turned frame, so its edge runs along its hatch lines.
    const a = `translate(${x}px,${y}px) rotate(45deg)`
    const b = `translate(${x}px,${y + h}px) rotate(-45deg)`
    const step = `animation-timing-function:steps(${lines})`
    defs +=
      `<pattern id="ha${i}" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="translate(${x} ${y}) rotate(45)"><line class="kt" x1="7" y1="0" x2="7" y2="14" stroke-width="1.5"/></pattern>` +
      `<pattern id="hb${i}" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="translate(${x} ${y + h}) rotate(-45)"><line class="k0" x1="7" y1="0" x2="7" y2="14" stroke-width="1.5"/></pattern>` +
      `<clipPath id="bk${i}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>` +
      `<clipPath id="ca${i}"><rect class="da" x="0" y="${-w}" width="${reach}" height="${w + h}" style="--o:${a};transform:${a} scaleX(1);${step};${delay}"/></clipPath>` +
      `<clipPath id="cb${i}"><rect class="db" x="0" y="${-h}" width="${reach}" height="${w + h}" style="--o:${b};transform:${b} scaleX(1);${step};${delay}"/></clipPath>`
    body +=
      `<rect class="frame" x="${x}" y="${y}" width="${w}" height="${h}"/>` +
      `<path class="reg" d="M${x - 12} ${y - 2}v-10h10M${x + w + 2} ${y - 12}h10v10M${x + w + 12} ${y + h + 2}v10h-10M${x - 2} ${y + h + 12}h-10v-10"/>` +
      `<text class="t lb" x="${x}" y="${y - 20}">P-0${i + 1} / HATCH 45 + 135</text>` +
      `<text class="t lb" x="${x + w}" y="${y + h + 28}" text-anchor="end">${lines * 2} LINES</text>` +
      `<g class="ink" style="${delay}"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#ha${i})" clip-path="url(#ca${i})"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#hb${i})" clip-path="url(#cb${i})"/></g>` +
      `<g clip-path="url(#bk${i})"><rect class="ga t" x="-1.5" y="${-w}" width="3" height="${w + h}" style="--o:${a};--u:${reach}px;opacity:0;${step};${delay}"/><rect class="gb c0" x="-1.5" y="${-h}" width="3" height="${w + h}" style="--o:${b};--u:${reach}px;opacity:0;${step};${delay}"/></g>`
  })
  // the pen's travel between blocks, and the sheet's corner marks
  const travel = BLOCKS.map(([x, y, w, h]) => `${x + w / 2},${y + h / 2}`).join(' ')
  const corner = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="11"/><path d="M${x - 20} ${y}h40M${x} ${y - 20}v40"/>`
  return shell(theme, moving, {
    defs: defs + `<pattern id="paper" width="50" height="50" patternUnits="userSpaceOnUse"><path class="kt" d="M50 0H0V50" fill="none" stroke-width="1"/></pattern>`,
    css:
      `.frame,.reg,.mark,.path{fill:none;stroke:var(--text)}.frame{stroke-dasharray:2 5;opacity:.3}.reg{opacity:.55;stroke-width:1.4}.mark{opacity:.3}.path{stroke-dasharray:1 9;opacity:.28}` +
      `.lb{font:12px ui-monospace,Menlo,Monaco,monospace;letter-spacing:.08em;opacity:.5}` +
      `.da{animation:passA ${T}s infinite}@keyframes passA{0%{transform:var(--o) scaleX(0)}30%,100%{transform:var(--o) scaleX(1)}}` +
      `.db{animation:passB ${T}s infinite}@keyframes passB{0%,34%{transform:var(--o) scaleX(0)}64%,100%{transform:var(--o) scaleX(1)}}` +
      `.ga{animation:headA ${T}s infinite}@keyframes headA{0%{transform:var(--o) translateX(0);opacity:1}30%{transform:var(--o) translateX(var(--u));opacity:1}30.2%,100%{transform:var(--o) translateX(var(--u));opacity:0}}` +
      `.gb{animation:headB ${T}s infinite}@keyframes headB{0%,33.8%{transform:var(--o) translateX(0);opacity:0}34%{transform:var(--o) translateX(0);opacity:1}64%{transform:var(--o) translateX(var(--u));opacity:1}64.2%,100%{transform:var(--o) translateX(var(--u));opacity:0}}` +
      `.ink{animation:lift ${T}s linear infinite}@keyframes lift{0%,88%{opacity:1}90%{opacity:.6}92%{opacity:.25}94%,100%{opacity:0}}`,
    body:
      `<rect x="-400" y="-400" width="${W + 800}" height="${H + 800}" fill="url(#paper)" opacity=".07"/>` +
      `<polyline class="path" points="${travel}"/>` +
      `<g class="mark">${corner(40, 40)}${corner(W - 40, 40)}${corner(40, H - 40)}${corner(W - 40, H - 40)}</g>` +
      body,
  })
}

/** A loom: a dotted twill woven pick by pick, a shuttle crossing at the working row, one colourway over the other. */
const weave = (theme: Theme, moving: boolean): string => {
  const T = 96
  const tile = (id: string, cls: string, on: number, off: number): string => {
    let dots = ''
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) dots += `<circle class="${cls}" cx="${a * 8 + 4}" cy="${b * 8 + 4}" r="1.7" opacity="${(a + b) % 3 === 0 ? on : off}"/>`
    return `<pattern id="${id}" width="24" height="24" patternUnits="userSpaceOnUse">${dots}</pattern>`
  }
  // The woven figure: chevron bands with a row of diamonds between them. `shift` slides it half a repeat.
  const figure = (shift: number): string => {
    let d = ''
    for (let band = 0; band < 4; band++) {
      const y = 120 + band * 250
      let upper = ''
      let lower = ''
      for (let k = 0; k <= 12; k++) {
        const x = -400 + k * 200 + shift
        upper += `${k === 0 ? 'M' : 'L'}${x} ${y + (k % 2 ? -100 : 100)}`
        lower = `L${x} ${y + (k % 2 ? -100 : 100) + 64}` + lower
      }
      d += upper + lower + 'Z'
      for (let k = 0; k <= 6; k++) {
        const x = -200 + k * 400 + shift
        const cy = y + 150
        d += `M${x} ${cy - 34}L${x + 34} ${cy}L${x} ${cy + 34}L${x - 34} ${cy}Z`
      }
    }
    return d
  }
  const cloth = (id: string, tileId: string, shift: number) => `<g id="${id}"><rect x="-400" y="-400" width="${W + 800}" height="${H + 800}" fill="url(#base)"/><path d="${figure(shift)}" fill="url(#${tileId})"/></g>`
  const pick = (id: string, cls: string, rest: number) => `<clipPath id="${id}"><rect class="${cls}" x="-400" y="0" width="${W + 800}" height="${H}" style="transform:scaleY(${rest})"/></clipPath>`
  const shuttle = (cls: string, rest: string) => `<g class="${cls}" style="${rest}"><rect class="c3" x="-400" y="-1.5" width="${W + 800}" height="3"/><rect class="head c3" x="0" y="-7" width="64" height="14" rx="2"/></g>`
  const over = (clip: string, id: string) => `<g clip-path="url(#${clip})"><rect class="ground" x="-400" y="-400" width="${W + 800}" height="${H + 800}"/><use href="#${id}"/></g>`
  return shell(theme, moving, {
    dark: '--cloth:.85',
    light: '--cloth:.75',
    defs: tile('base', 't', 0.5, 0.16) + tile('ta', 'c0', 1, 0.6) + tile('tb', 'c1', 1, 0.6) + cloth('first', 'ta', 0) + cloth('second', 'tb', 200) + pick('p2', 'pk2', 0.6) + pick('p1', 'pk1', 0),
    css:
      `.cloth{opacity:var(--cloth)}` +
      // The second colourway weaves down over the first, then the first over the second; when the cycle wraps, what shows is unchanged.
      `.pk2{animation:pick2 ${T}s steps(125) infinite}@keyframes pick2{0%{transform:scaleY(0)}46%,100%{transform:scaleY(1)}}` +
      `.pk1{animation:pick1 ${T}s steps(125) infinite}@keyframes pick1{0%,50%{transform:scaleY(0)}96%,100%{transform:scaleY(1)}}` +
      `.sh2{animation:shut2 ${T}s steps(125) infinite}@keyframes shut2{0%{transform:translateY(0);opacity:1}46%{transform:translateY(${H}px);opacity:1}46.1%,100%{transform:translateY(${H}px);opacity:0}}` +
      `.sh1{animation:shut1 ${T}s steps(125) infinite}@keyframes shut1{0%,49.9%{transform:translateY(0);opacity:0}50%{transform:translateY(0);opacity:1}96%{transform:translateY(${H}px);opacity:1}96.1%,100%{transform:translateY(${H}px);opacity:0}}` +
      `.head{animation:throw 2.4s linear infinite alternate}@keyframes throw{from{transform:translateX(0)}to{transform:translateX(${W - 64}px)}}`,
    body: `<g class="cloth"><use href="#first"/>${over('p2', 'second')}${over('p1', 'first')}</g>` + shuttle('sh2', `transform:translateY(${H * 0.6}px)`) + shuttle('sh1', 'opacity:0'),
  })
}

/** A field of small machines that orbit, sweep, step, draw and travel, in mechanical timing. */
const glyphs = (theme: Theme, moving: boolean): string => {
  const rand = seeded(73)
  const at = (x: number, y: number) => `transform-origin:${x}px ${y}px`
  const kinds: readonly ((x: number, y: number, a: number) => string)[] = [
    // orbit
    (x, y, a) =>
      `<circle cx="${x}" cy="${y}" r="30" stroke-dasharray="2 6" opacity=".5"/><circle class="c${a}" cx="${x}" cy="${y}" r="5" stroke="none"/><g class="spin" style="${at(x, y)};animation-duration:${n1(9 + rand() * 8)}s"><circle class="t" cx="${x + 30}" cy="${y}" r="3.6" stroke="none"/><circle class="t" cx="${x - 30}" cy="${y}" r="2.2" stroke="none"/></g>`,
    // sweep
    (x, y, a) =>
      `<circle cx="${x}" cy="${y}" r="32"/><circle cx="${x}" cy="${y}" r="15" opacity=".4"/><line class="spin k${a}" x1="${x}" y1="${y}" x2="${x}" y2="${y - 32}" style="${at(x, y)};animation-duration:8s;animation-timing-function:steps(16)"/><circle class="pulse c${a}" cx="${x + 14}" cy="${y - 11}" r="3" stroke="none"/>`,
    // bars
    (x, y, a) =>
      [0, 1, 2, 3, 4].map(i => `<rect class="bar ${i === 2 ? `c${a}` : 't'}" x="${x - 29 + i * 12}" y="${y + 30 - (22 + ((i * 17) % 34))}" width="7" height="${22 + ((i * 17) % 34)}" stroke="none" style="animation-delay:-${n2(i * 0.37)}s"/>`).join('') +
      `<line x1="${x - 34}" y1="${y + 34}" x2="${x + 34}" y2="${y + 34}" opacity=".5"/>`,
    // ring that draws itself
    (x, y, a) => `<circle class="draw" cx="${x}" cy="${y}" r="28" pathLength="1" style="animation-delay:-${n1(rand() * 7)}s"/><polygon class="c${a}" points="${x + 34},${y} ${x + 22},${y - 6} ${x + 22},${y + 6}" stroke="none"/>`,
    // dot on a track
    (x, y, a) => `<line x1="${x - 34}" y1="${y}" x2="${x + 34}" y2="${y}"/><path d="M${x - 34} ${y - 8}v16M${x + 34} ${y - 8}v16"/><circle class="slide c${a}" cx="${x}" cy="${y}" r="4.5" stroke="none" style="animation-duration:${n1(2.6 + rand() * 2)}s"/>`,
    // crosshair
    (x, y, a) => `<path d="M${x - 34} ${y}h22M${x + 12} ${y}h22M${x} ${y - 34}v22M${x} ${y + 12}v22"/><rect class="beat k${a}" x="${x - 7}" y="${y - 7}" width="14" height="14"/>`,
    // signal
    (x, y) => `<path class="draw" d="M${x - 36} ${y}q9 -24 18 0t18 0t18 0t18 0" pathLength="1" style="animation-delay:-${n1(rand() * 7)}s"/><line x1="${x - 36}" y1="${y + 26}" x2="${x + 36}" y2="${y + 26}" stroke-dasharray="1 5" opacity=".5"/>`,
    // nested squares
    (x, y, a) => `<rect x="${x - 30}" y="${y - 30}" width="60" height="60" opacity=".4"/><rect class="turn" x="${x - 19}" y="${y - 19}" width="38" height="38" style="${at(x, y)}"/><rect class="c${a}" x="${x - 6}" y="${y - 6}" width="12" height="12" stroke="none"/>`,
    // linked nodes
    (x, y, a) =>
      `<path d="M${x} ${y - 26}L${x - 28} ${y + 22}L${x + 28} ${y + 22}Z" opacity=".55"/><circle class="ground" cx="${x - 28}" cy="${y + 22}" r="6"/><circle class="ground" cx="${x + 28}" cy="${y + 22}" r="6"/><circle class="pulse c${a}" cx="${x}" cy="${y - 26}" r="6" stroke="none"/>`,
  ]
  let body = ''
  for (let r = 0; r < 7; r++) {
    let last: number | null = null
    for (let c = 0; c < 10; c++) {
      if (rand() > 0.52) {
        last = null
        continue
      }
      const x = c * 160 + 80
      const y = r * 150 + 70
      const draw = kinds[Math.floor(rand() * kinds.length)]
      if (last !== null) body += `<line class="bus" x1="${last + 46}" y1="${y}" x2="${x - 46}" y2="${y}"/>`
      body += (draw ? draw(x, y, Math.floor(rand() * 3)) : '') + `<text class="t lb" x="${x}" y="${y + 60}">G-${String(r * 10 + c + 1).padStart(2, '0')}</text>`
      last = x
    }
  }
  return shell(theme, moving, {
    dark: '--marks:.62',
    light: '--marks:.7',
    defs: `<pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse"><circle class="t" cx="20" cy="20" r="1.2"/></pattern>`,
    css:
      `.marks{fill:none;stroke:var(--text);stroke-width:1.6;stroke-linecap:round;opacity:var(--marks)}` +
      `.bus{stroke-dasharray:1 7;opacity:.45}` +
      `.lb{font:10px ui-monospace,Menlo,Monaco,monospace;letter-spacing:.1em;text-anchor:middle;stroke:none;opacity:.5}` +
      `.spin{animation:spin 12s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}` +
      `.pulse{animation:pulse 2.8s ease-in-out infinite alternate}@keyframes pulse{from{opacity:.25}to{opacity:1}}` +
      `.bar,.beat,.slide{transform-box:fill-box}` +
      `.bar{transform-origin:50% 100%;animation:bar 1.9s steps(5) infinite alternate}@keyframes bar{from{transform:scaleY(.25)}to{transform:scaleY(1)}}` +
      `.beat{transform-origin:50% 50%;animation:beat 2.4s ease-in-out infinite alternate}@keyframes beat{from{transform:scale(1)}to{transform:scale(1.6)}}` +
      `.slide{animation:slide 3.4s linear infinite alternate}@keyframes slide{from{transform:translateX(-30px)}to{transform:translateX(30px)}}` +
      `.draw{stroke-dasharray:1;animation:draw 7s linear infinite}@keyframes draw{0%{stroke-dashoffset:1}45%,55%{stroke-dashoffset:0}100%{stroke-dashoffset:-1}}` +
      `.turn{animation:turn 8s linear infinite}@keyframes turn{0%,35%{transform:rotate(0deg)}50%,85%{transform:rotate(45deg)}100%{transform:rotate(90deg)}}`,
    body: `<rect x="-400" y="-400" width="${W + 800}" height="${H + 800}" fill="url(#dots)" opacity=".16"/><g class="marks">${body}</g>`,
  })
}

/** Each scene by name: (theme, moving) to one SVG. */
export const SCENERY: Readonly<Record<Scenery, (theme: Theme, moving: boolean) => string>> = { grid, sunset, city, plotter, weave, glyphs }
export const SCENERIES: readonly Scenery[] = ['grid', 'sunset', 'city', 'plotter', 'weave', 'glyphs']
