// Eleven drawn scenes. The first six: a synthwave grid, a retro sunset, a night city, and three mechanical ones
// (a plotter, a loom, a field of small machines). The second five: a flock of pixels, a nebula, stacked signal
// ridges, a circuit board and a tunnel. Each is one SVG that moves by CSS alone, kept to what the desktop app will animate:
// its listed SVG elements, CSS whose every function is a colour, maths, transform, easing or filter function
// (so no path() and no CSS gradients), `@media (` with the space, nothing fetched.
import type { Mode, Theme } from './themes.ts'

export type Scenery = 'grid' | 'sunset' | 'city' | 'plotter' | 'weave' | 'glyphs' | 'flock' | 'nebula' | 'ridges' | 'circuit' | 'tunnel'

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

type Flock = Record<'at' | 'cx' | 'cy' | 'ax' | 'bx' | 'ay' | 'by' | 'cz' | 'p1' | 'p2' | 'p3' | 'p4' | 'ranks' | 'tail' | 'long' | 'fat', number>

/** Murmuration: two flocks of square pixels that stream, bunch and turn as one, over a pixel treeline at dusk. */
const flock = (theme: Theme, moving: boolean): string => {
  const rand = seeded(91)
  const T = 40, STOPS = 96, GAP = 14
  // Where a flock's leader is at t (0 to 1 round the loop): a few sines, so the course closes on itself.
  const course = (a: Flock) => (t: number): [number, number] => {
    const th = 2 * Math.PI * (t + a.at)
    return [a.cx + a.ax * Math.sin(th + a.p1) + a.bx * Math.sin(3 * th + a.p2), a.cy + a.ay * Math.sin(2 * th + a.p3) + a.by * Math.cos(3 * th + a.p4) + a.cz * Math.sin(5 * th)]
  }
  // one flock sweeps the whole window, passing behind the chat and out the other side; a second one crossing it made
  // the app's flash check run close to its limit
  const FLOCKS: Flock[] = [
    { at: 0, cx: 800, cy: 400, ax: 560, bx: 170, ay: 210, by: 110, cz: 46, p1: 0.3, p2: 1.1, p3: 0, p4: 0.5, ranks: 44, tail: 3.4, long: 230, fat: 116 },
  ]
  let css = '', birds = ''
  FLOCKS.forEach((f, fi) => {
    const pos = course(f)
    // At each stop: where the leader is, how fast it goes (pixels a second, across and down), and its heading.
    const stops: [number, number, number, number][] = []
    for (let k = 0; k <= STOPS; k++) {
      const t = k / STOPS, [x, y] = pos(t), [xa, ya] = pos(t - 0.002), [xb, yb] = pos(t + 0.002)
      stops.push([x, y, (xb - xa) / (0.004 * T), (yb - ya) / (0.004 * T)])
    }
    const top = Math.max(...stops.map(([, , vx, vy]) => Math.hypot(vx, vy)))
    // The flock keeps its ranks across the way it is heading: longer the faster it goes, wider the slower, and it
    // breathes. As a turn, a stretch along the heading and one across it; the heading is kept unbroken from stop to
    // stop so the flock never spins the long way round.
    let was = 0
    const lie = stops.map(([, , vx, vy], k) => {
      let head = (Math.atan2(vy, vx) * 180) / Math.PI
      if (k > 0) head += 360 * Math.round((was - head) / 360)
      was = head
      const pace = Math.hypot(vx, vy) / top, breathe = 0.86 + 0.26 * Math.sin(2 * Math.PI * 3 * (k / STOPS) + fi * 2)
      return [head, breathe * (0.8 + 0.7 * pace), breathe * (1.25 - 0.5 * pace)] as const
    })
    // Each group of birds flies the leader's course a moment behind the group ahead, turned and stretched as the
    // flock is. Each bird stands at its own place in its rank, and its square undoes the turn and the
    // stretch, so it stays an upright pixel of its own size: its place is its `translate`, which the browser applies
    // before the animated `transform`, so one element does both. Plain-number animations cost far less to play than
    // a formula worked out for every bird on every frame.
    const fly = (k: number, x: number, y: number) => { const [h, a, c] = lie[k]!; return `translate(${n1(x)}px,${n1(y)}px) rotate(${n2(h)}deg) scale(${n2(a)},${n2(c)})` }
    const undo = (k: number) => { const [h, a, c] = lie[k]!; return `scale(${n2(1 / a)},${n2(1 / c)}) rotate(${n2(-h)}deg)` }
    let rank = '', square = ''
    stops.forEach(([x, y], k) => { const at = n2((k / STOPS) * 100); rank += `${at}%{transform:${fly(k, x, y)}}`; square += `${at}%{transform:${undo(k)}}` })
    // Held still, each group is set straight back along the leader's heading by its own delay.
    const [x0 = 0, y0 = 0, vx0 = 0, vy0 = 0] = stops[0] ?? []
    css += `.f${fi}>g{animation:fly${fi} ${T}s linear infinite;animation-delay:var(--d)}@keyframes fly${fi}{${rank}}` +
      `.f${fi} path{transform:${undo(0)};animation:undo${fi} ${T}s linear infinite;animation-delay:var(--d)}@keyframes undo${fi}{${square}}`
    // The birds stand in ranks a steady gap apart, each nudged off its spot. Evenly spread, the flock passes over
    // any one place as a steady shade and not as a flicker, which the app would stop.
    // Birds that set off at nearly the same moment share a group: each bird's moment is rounded to a quarter of the
    // gap between ranks, close enough to keep the scatter each bird's own moment gives the flock as it bends.
    const groups = new Map<number, string>()
    for (let i = 0; i < f.ranks; i++) {
      const half = 10 + f.fat * Math.sin(Math.PI * (0.08 + 0.84 * (i / (f.ranks - 1)))) ** 0.8, rows = Math.max(1, Math.round((2 * half) / GAP))
      for (let j = 0; j < rows; j++) {
        const u = Math.max(0, Math.min(1, (i + (rand() - 0.5) * 0.8) / (f.ranks - 1)))
        const oy = Math.round((j - (rows - 1) / 2 + (i % 2 ? 0.25 : -0.25) + (rand() - 0.5) * 0.6) * GAP)
        const size = rand() < 0.2 ? 8 : 6, pick = rand(), thin = rand()
        // the edges of the flock are thinner than its middle
        if (thin < 0.6 * Math.max(0, (Math.abs(oy) / half - 0.55) / 0.45)) continue
        const cls = pick < 0.52 ? '' : pick < 0.8 ? ' class="c0"' : pick < 0.93 ? ' class="c1"' : ' class="c3"'
        const step = Math.round(u * (f.ranks - 1) * 4)
        groups.set(step, (groups.get(step) ?? '') + `<path${cls} style="translate:${Math.round((0.5 - u) * f.long)}px ${oy}px" d="M${-size / 2} ${-size / 2}h${size}v${size}h${-size}z"/>`)
      }
    }
    let all = ''
    for (const [step, inGroup] of [...groups].sort((a, b) => a[0] - b[0])) {
      const back = (step / ((f.ranks - 1) * 4)) * f.tail
      all += `<g style="--d:-${n2(T - back)}s;transform:${fly(0, x0 - back * vx0, y0 - back * vy0)}">${inGroup}</g>`
    }
    birds += `<g class="f${fi}">${all}</g>`
  })
  // A treeline in steps: two rows of square-topped trees, the nearer one darker.
  const trees = (base: number, low: number, high: number, step: number, seed: number): string => {
    const r = seeded(seed)
    let d = `M-400 ${H + 40}V${base}`, h = low
    for (let x = -400; x < W + 400; x += step) { h = Math.max(low, Math.min(high, h + (r() - 0.5) * step * 2.6)); d += `V${base - Math.round(h / 8) * 8}h${step}` }
    return `${d}V${H + 40}Z`
  }
  return shell(theme, moving, {
    // On a pale sky a dark bird swings the brightness of its spot far more than a bright bird does on a dark one,
    // so the flock is drawn faint there: any stronger and the app reads it as flicker and holds the scene still.
    dark: '--bird:.95;--dusk:.5',
    light: '--bird:.25;--dusk:.32',
    defs:
      `<linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop class="s2" offset="0" stop-opacity="0"/><stop class="s2" offset=".7" stop-opacity=".55"/><stop class="s3" offset="1" stop-opacity=".8"/></linearGradient>` +
      `<radialGradient id="low"><stop class="s3" offset="0" stop-opacity=".7"/><stop class="s3" offset=".4" stop-opacity=".25"/><stop class="s3" offset="1" stop-opacity="0"/></radialGradient>`,
    css:
      `.dusk{opacity:var(--dusk)}.birds{opacity:var(--bird);fill:var(--text)}` +
      `.far{fill:color-mix(in srgb,var(--ground) 62%,var(--w2))}.near{fill:color-mix(in srgb,var(--ground) 86%,var(--w2))}` +
      `.low{animation:lowsun 16s ease-in-out infinite alternate}@keyframes lowsun{from{opacity:.6}to{opacity:1}}` +
      css,
    body:
      `<rect class="dusk" x="-400" y="300" width="${W + 800}" height="${H - 300 + 400}" fill="url(#dusk)"/>` +
      `<circle class="low" cx="1140" cy="880" r="330" fill="url(#low)"/>` +
      `<path class="far" d="${trees(900, 20, 96, 24, 7)}"/><path class="near" d="${trees(948, 12, 70, 16, 19)}"/>` +
      `<g class="birds">${birds}</g>`,
  })
}

/** Nebula: clouds of the theme's colours along a band of sky, dark lanes through them, a bright core, drifting stars. */
const nebula = (theme: Theme, moving: boolean): string => {
  const rand = seeded(113)
  const TILT = -24, cos = Math.cos((TILT * Math.PI) / 180), sin = Math.sin((TILT * Math.PI) / 180)
  // a point on the band: u along it (-1 to 1), v across it
  const band = (u: number, v: number): [number, number] => [Math.round(800 + u * 760 * cos - v * sin), Math.round(500 + u * 760 * sin + v * cos)]
  const gauss = () => (rand() + rand() + rand() - 1.5) / 1.5
  // along the band but out toward either end, past the chat in the middle
  const out = (end: number) => (rand() < 0.5 ? -1 : 1) * (0.42 + rand() * (end - 0.42))

  let stars = ''
  ;([[170, 0.5, 1.1, 0.5], [90, 0.8, 1.5, 0.7], [36, 1.2, 2.1, 0.95]] as [number, number, number, number][]).forEach(([count, small, big, bright], layer) => {
    let dots = ''
    for (let i = 0; i < count; i++) {
      const tw = i % 5 === 0
      dots += `<circle${tw ? ' class="tw"' : ''} cx="${Math.round(rand() * (W + 200) - 100)}" cy="${Math.round(rand() * (H + 120) - 60)}" r="${n1(small + rand() * (big - small))}" style="opacity:${n2(bright * (0.45 + rand() * 0.55))}${tw ? `;animation-duration:${n1(3 + rand() * 6)}s;animation-delay:-${n1(rand() * 9)}s` : ''}"/>`
    }
    stars += `<g class="t dr${layer}">${dots}</g>`
  })

  let clouds = ''
  for (let i = 0; i < 30; i++) {
    const u = out(1.12), [x, y] = band(u, gauss() * 200)
    const wide = 1 - Math.max(0, Math.abs(u) - 0.5) * 0.5
    const rx = Math.round((170 + rand() * 300) * wide), ry = Math.round((80 + rand() * 150) * wide)
    clouds += `<g transform="translate(${x} ${y}) rotate(${Math.round(TILT + (rand() - 0.5) * 70)})"><ellipse class="cl" rx="${rx}" ry="${ry}" fill="url(#n${i % 4})" style="--dx:${Math.round((rand() - 0.5) * 70)}px;--dy:${Math.round((rand() - 0.5) * 44)}px;--lo:${n2(0.45 + rand() * 0.25)};opacity:${n2(0.75)};animation-duration:${Math.round(26 + rand() * 40)}s;animation-delay:-${Math.round(rand() * 60)}s"/></g>`
  }
  // thin streaks that lie along the band give the clouds a grain
  const sheet = (count: number, seedCls: string): string => {
    let s = ''
    for (let i = 0; i < count; i++) {
      const u = out(1.05), [x, y] = band(u, gauss() * 150)
      s += `<ellipse transform="translate(${x} ${y}) rotate(${Math.round(TILT + (rand() - 0.5) * 50)})" rx="${Math.round(140 + rand() * 260)}" ry="${Math.round(8 + rand() * 20)}" fill="url(#n${Math.floor(rand() * 4)})" opacity="${n2(0.3 + rand() * 0.3)}"/>`
    }
    return `<g class="${seedCls}">${s}</g>`
  }
  let lanes = ''
  for (let i = 0; i < 9; i++) {
    const u = out(0.95), [x, y] = band(u, (rand() - 0.5) * 170)
    lanes += `<g transform="translate(${x} ${y}) rotate(${Math.round(TILT + (rand() - 0.5) * 36)})"><ellipse class="ln" rx="${Math.round(200 + rand() * 240)}" ry="${Math.round(26 + rand() * 44)}" fill="url(#dk)" style="--dx:${Math.round((rand() - 0.5) * 80)}px;animation-duration:${Math.round(40 + rand() * 40)}s;animation-delay:-${Math.round(rand() * 60)}s"/></g>`
  }
  let flares = ''
  for (let i = 0; i < 9; i++) {
    const x = Math.round(80 + rand() * (W - 160)), y = Math.round(60 + rand() * (H - 120)), len = Math.round(14 + rand() * 22)
    flares += `<g transform="translate(${x} ${y})"><g class="fl" style="animation-duration:${n1(4 + rand() * 5)}s;animation-delay:-${n1(rand() * 8)}s"><path d="M${-len} 0H${len}M0 ${-len}V${len}"/><circle r="${n1(1.8 + rand() * 1.4)}"/></g></g>`
  }
  const cores = [band(-0.7, 0), band(0.72, 0)]
  return shell(theme, moving, {
    dark: '--neb:1;--star:1;--hot:var(--text)',
    light: '--neb:.62;--star:.55;--hot:var(--w3)',
    defs:
      [0, 1, 2, 3].map(i => `<radialGradient id="n${i}"><stop class="s${i}" offset="0" stop-opacity=".56"/><stop class="s${i}" offset=".45" stop-opacity=".24"/><stop class="s${i}" offset="1" stop-opacity="0"/></radialGradient>`).join('') +
      `<radialGradient id="dk"><stop class="sg" offset="0" stop-opacity=".85"/><stop class="sg" offset=".6" stop-opacity=".4"/><stop class="sg" offset="1" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="core"><stop offset="0" stop-color="var(--hot)" stop-opacity=".75"/><stop class="s3" offset=".3" stop-opacity=".4"/><stop class="s3" offset="1" stop-opacity="0"/></radialGradient>` +
      `<linearGradient id="trail" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--text)" stop-opacity="1"/><stop offset="1" stop-color="var(--text)" stop-opacity="0"/></linearGradient>`,
    css:
      `.sky{opacity:var(--star)}.neb{opacity:var(--neb);transform-origin:800px 500px;animation:wheel 200s ease-in-out infinite alternate}@keyframes wheel{from{transform:rotate(-3deg) scale(1)}to{transform:rotate(4deg) scale(1.06)}}` +
      `.tw{animation:glint 6s ease-in-out infinite alternate}@keyframes glint{from{opacity:.1}to{opacity:1}}` +
      `.dr0{animation:drift0 150s linear infinite alternate}@keyframes drift0{from{transform:translate(-18px,6px)}to{transform:translate(18px,-6px)}}` +
      `.dr1{animation:drift1 120s linear infinite alternate}@keyframes drift1{from{transform:translate(-34px,12px)}to{transform:translate(34px,-12px)}}` +
      `.dr2{animation:drift2 90s linear infinite alternate}@keyframes drift2{from{transform:translate(-56px,20px)}to{transform:translate(56px,-20px)}}` +
      `.cl{animation:billow 40s ease-in-out infinite alternate}@keyframes billow{from{transform:translate(calc(var(--dx)*-1),calc(var(--dy)*-1)) scale(.92);opacity:var(--lo)}to{transform:translate(var(--dx),var(--dy)) scale(1.1);opacity:.95}}` +
      `.ln{animation:lane 60s ease-in-out infinite alternate}@keyframes lane{from{transform:translate(calc(var(--dx)*-1),0)}to{transform:translate(var(--dx),0)}}` +
      `.sh0{animation:shear0 70s ease-in-out infinite alternate}@keyframes shear0{from{transform:translate(-30px,10px)}to{transform:translate(30px,-10px)}}` +
      `.sh1{animation:shear1 95s ease-in-out infinite alternate}@keyframes shear1{from{transform:translate(26px,-12px)}to{transform:translate(-26px,12px)}}` +
      `.core{animation:pulse 11s ease-in-out infinite alternate}@keyframes pulse{from{opacity:.6}to{opacity:1}}` +
      `.fl{fill:var(--text);stroke:var(--text);stroke-width:1;stroke-linecap:round;animation:flare 6s ease-in-out infinite alternate}@keyframes flare{from{transform:scale(.45);opacity:.35}to{transform:scale(1);opacity:1}}` +
      `.shoot{animation:shoot 19s linear infinite}@keyframes shoot{0%{transform:translate(1380px,-40px);opacity:0}1%{opacity:1}5%{transform:translate(620px,250px);opacity:0}100%{transform:translate(620px,250px);opacity:0}}`,
    body:
      `<g class="sky">${stars}</g>` +
      `<g class="neb">${clouds}${sheet(16, 'sh0')}${sheet(14, 'sh1')}${lanes}` +
      cores.map(([cx, cy], i) => `<ellipse class="core" transform="translate(${cx} ${cy}) rotate(${TILT})" rx="${i ? 150 : 180}" ry="${i ? 90 : 105}" fill="url(#core)"${i ? ' style="animation-delay:-5s"' : ''}/>`).join('') + `</g>` +
      `<g class="sky">${flares}</g>` +
      `<g class="shoot" style="transform:translate(620px,250px);opacity:0"><line x1="150" y1="-64" x2="0" y2="0" stroke="url(#trail)" stroke-width="2.4" stroke-linecap="round"/></g>`,
  })
}

/** Signal ridges: rows of a trace stacked up the window, each row's peaks swelling and sinking as a wave passes along it. */
const ridges = (theme: Theme, moving: boolean): string => {
  const rand = seeded(131)
  const ROWS = 25, TOP = 300, GAP = 26
  // the peaks rise either side of the window, where the conversation column leaves the background in view
  const SIDES = [270, 1330]
  const env = (x: number) => Math.max(...SIDES.map(c => Math.exp(-(((x - c) / 210) ** 2))))
  let rows = ''
  for (let r = 0; r < ROWS; r++) {
    const y = TOP + r * GAP
    // the flat of the row, with the small shake of a pen
    let base = `M-200 ${y}`
    for (let x = -188; x <= W + 200; x += 12) { const shake = (rand() - 0.5) * 3; if ((x + 188) % 24) base += `L${x} ${n1(y + shake)}` }
    let bumps = ''
    const count = 7 + Math.floor(rand() * 3)
    const xs = Array.from({ length: count }, (_, i) => (SIDES[i % 2] ?? 800) + (rand() + rand() + rand() - 1.5) * 300).sort((a, b) => a - b)
    for (const x of xs) {
      const half = 34 + rand() * 78, tall = (16 + 150 * env(x)) * (0.45 + rand() * 0.75)
      let d = `M${n1(-half)} 0`
      for (let k = -9; k <= 9; k++) { const u = k / 10; d += `L${n1(u * half)} ${n1(-tall * Math.exp(-((u * 2.4) ** 2)) * (1 + (rand() - 0.5) * 0.14))}` }
      d += `L${n1(half)} 0`
      const secs = n1(3 + rand() * 4.5)
      bumps += `<g transform="translate(${Math.round(x)} ${y})"><path class="rg" d="${d}" style="--dx:${Math.round((rand() - 0.5) * 36)}px;--lo:${n2(0.15 + rand() * 0.3)};transform:scaleY(.72);animation-duration:${secs}s;animation-delay:-${n2((x / W) * 5 + r * 0.42 + rand())}s"/></g>`
    }
    const mix = Math.round((1 - r / (ROWS - 1)) * 100)
    rows += `<g style="stroke:color-mix(in srgb,var(--w0) ${mix}%,var(--w1));opacity:${n2(0.5 + 0.5 * (r / (ROWS - 1)))}"><path d="${base}"/>${bumps}</g>`
  }
  let ticks = ''
  for (let x = 100; x < W; x += 100) ticks += `<path d="M${x} 956v${x % 500 === 0 ? 16 : 8}"/>`
  return shell(theme, moving, {
    dark: '--ink:.95',
    light: '--ink:.8',
    defs: `<radialGradient id="rise"><stop class="s2" offset="0" stop-opacity=".38"/><stop class="s2" offset="1" stop-opacity="0"/></radialGradient>`,
    css:
      `.rows{opacity:var(--ink);fill:none;stroke-width:1.8;stroke-linejoin:round;stroke-linecap:round}` +
      `.rg{fill:var(--ground);transform-box:fill-box;transform-origin:50% 100%;animation:swell 5s ease-in-out infinite alternate}` +
      `@keyframes swell{from{transform:translate(calc(var(--dx)*-1),0) scaleY(var(--lo))}to{transform:translate(var(--dx),0) scaleY(1)}}` +
      `.scan{animation:scan 18s linear infinite}@keyframes scan{from{transform:translateX(-80px)}to{transform:translateX(1680px)}}` +
      `.tk{stroke:var(--text);stroke-width:1.5;opacity:.3}`,
    body:
      SIDES.map(c => `<ellipse cx="${c}" cy="560" rx="420" ry="430" fill="url(#rise)"/>`).join('') +
      `<g class="rows">${rows}</g>` +
      `<g class="tk">${ticks}<path d="M60 956H1540"/></g>` +
      `<g class="scan" style="transform:translateX(520px)"><rect class="t" x="0" y="250" width="1.5" height="706" opacity=".22"/><rect class="c3" x="-4" y="951" width="9.5" height="9.5"/></g>`,
  })
}

/** Circuit traces: a board of chips joined by bundles of traces, with pulses of the theme's colours running along them. */
const circuit = (theme: Theme, moving: boolean): string => {
  const rand = seeded(157)
  const P = 16, C = 36
  // a main chip on each side of the window, where the chat does not cover it, with a bus between them under the chat
  const CHIPS: [number, number, number, number, string][] = [[70, 360, 280, 260, 'U1'], [1250, 380, 280, 260, 'U2'], [140, 90, 180, 120, 'U3'], [1290, 80, 200, 130, 'U4'], [120, 800, 200, 130, 'U5'], [1270, 790, 200, 130, 'U6']]
  const lanes: [number, number][][] = []
  // across then up or down, the corner cut at 45 degrees; lanes of a bundle keep their distance through the turn
  const hv = (x0: number, y0: number, x1: number, y2: number, sx: number, sy: number, n: number) => { for (let k = 0; k < n; k++) { const y = y0 + sy * k * P, x = x1 - sx * k * P; lanes.push([[x0, y], [x - sx * C, y], [x, y + sy * C], [x, y2]]) } }
  const straight = (x0: number, y0: number, x1: number, y1: number, dx: number, dy: number, n: number) => { for (let k = 0; k < n; k++) lanes.push([[x0 + dx * k, y0 + dy * k], [x1 + dx * k, y1 + dy * k]]) }
  straight(359, 440, 1241, 440, 0, P, 6)
  straight(172, 351, 172, 219, P, 0, 6)
  straight(156, 629, 156, 791, P, 0, 6)
  straight(1316, 371, 1316, 219, P, 0, 6)
  straight(1300, 649, 1300, 781, P, 0, 6)
  straight(196, 81, 196, -60, P, 0, 6)
  straight(152, 939, 152, 1060, P, 0, 6)
  straight(1324, 71, 1324, -60, P, 0, 7)
  straight(1300, 929, 1300, 1060, P, 0, 6)
  straight(1539, 560, 1660, 560, 0, P, 4)
  straight(61, 520, -60, 520, 0, P, 5)
  hv(329, 180, 640, -60, 1, -1, 4)
  hv(1281, 180, 960, -60, -1, -1, 4)
  hv(329, 850, 640, 1060, 1, 1, 4)
  hv(1261, 850, 960, 1060, -1, 1, 4)

  const len = (pts: [number, number][]) => pts.slice(1).reduce((s, p, i) => { const q = pts[i] ?? p; return s + Math.hypot(p[0] - q[0], p[1] - q[1]) }, 0)
  let traces = '', pulses = '', ends = ''
  lanes.forEach((pts, i) => {
    const points = pts.map(p => p.join(',')).join(' ')
    traces += `<polyline points="${points}"/>`
    if (rand() < 0.62) {
      const secs = n1(Math.max(2.4, len(pts) / (150 + rand() * 120)))
      pulses += `<polyline class="pu k${[0, 1, 3, 0][i % 4]}" pathLength="100" points="${points}" style="stroke-dashoffset:${Math.round(rand() * 100)};animation-duration:${secs}s;animation-delay:-${n1(rand() * secs)}s${rand() < 0.4 ? ';animation-direction:reverse' : ''}"/>`
    }
  })
  let chips = ''
  for (const [x, y, w, h, name] of CHIPS) {
    let pins = ''
    for (let px = x + 12; px < x + w - 8; px += P) pins += `<rect x="${px - 3}" y="${y - 9}" width="6" height="9"/><rect x="${px - 3}" y="${y + h}" width="6" height="9"/>`
    for (let py = y + 12; py < y + h - 8; py += P) pins += `<rect x="${x - 9}" y="${py - 3}" width="9" height="6"/><rect x="${x + w}" y="${py - 3}" width="9" height="6"/>`
    chips += `<g class="pin">${pins}</g><rect class="chip" x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/><circle class="dot" cx="${x + 18}" cy="${y + 18}" r="5"/><text class="lb" x="${x + w - 14}" y="${y + h - 14}" text-anchor="end">${name}</text>`
  }
  // small parts in the open board: a body between two pads, with a name beside it
  let parts = ''
  const SPOTS: [number, number][] = [[60, 280], [390, 300], [390, 700], [60, 720], [440, 580], [400, 960], [1540, 290], [1190, 300], [1170, 600], [1190, 720], [1560, 690], [1560, 960], [800, 300], [700, 650], [900, 760]]
  SPOTS.forEach(([x, y], i) => {
    const up = i % 3 === 0
    parts += `<g transform="translate(${x} ${y})${up ? ' rotate(90)' : ''}"><rect class="pad" x="-22" y="-7" width="10" height="14"/><rect class="pad" x="12" y="-7" width="10" height="14"/><rect class="body" x="-12" y="-6" width="24" height="12" rx="2"/></g><text class="lb sm" x="${x + (up ? 14 : -22)}" y="${y + (up ? 4 : -14)}">${i % 2 ? 'C' : 'R'}${i + 1}</text>`
  })
  for (let i = 0; i < 16; i++) ends += `<circle cx="${Math.round(60 + rand() * 1480)}" cy="${([48, 952, 320, 660][i % 4] ?? 48) + Math.round((rand() - 0.5) * 30)}" r="6"/>`
  return shell(theme, moving, {
    dark: '--trace:.6;--board:.16',
    light: '--trace:.7;--board:.2',
    defs:
      `<pattern id="holes" width="40" height="40" patternUnits="userSpaceOnUse"><circle class="t" cx="20" cy="20" r="1.4"/></pattern>` +
      `<radialGradient id="die"><stop class="s0" offset="0" stop-opacity=".8"/><stop class="s0" offset="1" stop-opacity="0"/></radialGradient>`,
    css:
      `.trc{fill:none;stroke:color-mix(in srgb,var(--w2) 62%,var(--ground));stroke-width:2.4;stroke-linejoin:round;opacity:var(--trace)}` +
      `.pu{fill:none;stroke-width:3.4;stroke-linecap:round;stroke-dasharray:5 95;animation:run 4s linear infinite}@keyframes run{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}` +
      `.chip{fill:color-mix(in srgb,var(--ground) 86%,var(--text));stroke:color-mix(in srgb,var(--w2) 70%,var(--ground));stroke-width:2}` +
      `.pin rect,.pad{fill:color-mix(in srgb,var(--w3) 55%,var(--ground))}.body{fill:color-mix(in srgb,var(--ground) 74%,var(--text))}` +
      `.dot{fill:none;stroke:color-mix(in srgb,var(--text) 40%,var(--ground));stroke-width:1.5}` +
      `.lb{font:600 13px ui-monospace,Menlo,Monaco,monospace;fill:color-mix(in srgb,var(--text) 46%,var(--ground))}.sm{font-size:10px}` +
      `.via{fill:var(--ground);stroke:color-mix(in srgb,var(--w2) 62%,var(--ground));stroke-width:2.4;opacity:var(--trace)}` +
      `.die{animation:think 5s ease-in-out infinite alternate}@keyframes think{from{opacity:.35}to{opacity:1}}` +
      `.led{animation:led 2.6s steps(1) infinite}@keyframes led{0%{opacity:1}50%{opacity:.25}}`,
    body:
      `<rect x="-400" y="-400" width="${W + 800}" height="${H + 800}" fill="url(#holes)" style="opacity:var(--board)"/>` +
      `<g class="trc">${traces}</g><g class="via">${ends}</g>${parts}${chips}` +
      ([[210, 490], [1390, 510]] as const).map(([x, y], i) => `<rect x="${x - 70}" y="${y - 62}" width="140" height="124" rx="6" style="fill:color-mix(in srgb,var(--ground) 70%,var(--text))"/><circle class="die" cx="${x}" cy="${y}" r="64" fill="url(#die)"${i ? ' style="animation-delay:-2.5s"' : ''}/>`).join('') +
      `<circle class="led c1" cx="380" cy="340" r="4"/><circle class="led c3" cx="1560" cy="350" r="4" style="animation-delay:-1.1s"/><circle class="led c0" cx="380" cy="640" r="4" style="animation-delay:-.6s"/><circle class="led c1" cx="1560" cy="660" r="4" style="animation-delay:-1.7s"/>` +
      `<g>${pulses}</g>`,
  })
}

/** Vector tunnel: frames of light coming toward you down a square tunnel, rails along its corners and walls, a glow at the far end. */
const tunnel = (theme: Theme, moving: boolean): string => {
  const VX = 800, VY = 500, RINGS = 24, T = 10, FAR = 0.07, NEAR = 1.7
  // how far a frame has faded in at p of its way from the far end to past you, and how big it looks there
  const fade = (p: number) => n2(Math.min(1, p * 3.2))
  const size = (p: number) => 1 / (1 / FAR - (1 / FAR - 1 / NEAR) * p)
  const stops = [0, 0.2, 0.4, 0.55, 0.67, 0.76, 0.83, 0.88, 0.92, 0.95, 0.97, 0.985, 1]
  const come = stops.map(p => `${n1(p * 100)}%{transform:scale(${size(p).toFixed(4)});opacity:${fade(p)}}`).join('')
  let rings = ''
  for (let i = 0; i < RINGS; i++) {
    const p = i / RINGS, gate = i % 4 === 0
    rings += `<rect class="ring ${gate ? 'gate k0' : i % 2 ? 'k1' : 'k2'}" x="-800" y="-500" width="1600" height="1000" rx="70" style="transform:scale(${size(p).toFixed(4)});opacity:${fade(p)};animation-delay:calc(var(--slow)*-${n2(p * T)}s)"/>`
  }
  // rails from the far end out past the corners and along the walls
  let rails = ''
  const far = 1600 * FAR, reach = 1.9
  const edge: [number, number][] = [[-1, -1], [-0.5, -1], [0, -1], [0.5, -1], [1, -1], [1, -0.5], [1, 0], [1, 0.5], [1, 1], [0.5, 1], [0, 1], [-0.5, 1], [-1, 1], [-1, 0.5], [-1, 0], [-1, -0.5]]
  for (const [ex, ey] of edge) rails += `<line class="${Math.abs(ex) === 1 && Math.abs(ey) === 1 ? 'cn' : ''}" x1="${n1(ex * far / 2)}" y1="${n1(ey * far * 0.3125)}" x2="${ex * 800 * reach}" y2="${ey * 500 * reach}"/>`
  let stars = ''
  const rand = seeded(171)
  for (let i = 0; i < 26; i++) {
    const ang = rand() * 2 * Math.PI, secs = n1(3 + rand() * 4)
    stars += `<g transform="rotate(${Math.round((ang * 180) / Math.PI)})"><rect class="sp c${[0, 1, 3][i % 3]}" x="0" y="-1.5" width="26" height="3" style="transform:translateX(${Math.round(120 + rand() * 500)}px) scaleX(.6);animation-duration:${secs}s;animation-delay:-${n1(rand() * secs)}s"/></g>`
  }
  return shell(theme, moving, {
    // On a pale ground each frame or streak going by darkens its spot enough for the app to count it, and more than
    // three counts a second in one spot is flicker to it, which holds the scene still. So there the frames come
    // slower, every other one is left out, and the streaks are faint.
    dark: '--line:.9;--rail:.34;--hot:var(--text);--slow:1;--odd:1;--streak:1',
    light: '--line:.75;--rail:.4;--hot:var(--w3);--slow:1.6;--odd:0;--streak:.3',
    defs:
      `<radialGradient id="end"><stop offset="0" stop-color="var(--hot)" stop-opacity=".9"/><stop class="s0" offset=".25" stop-opacity=".6"/><stop class="s2" offset=".6" stop-opacity=".22"/><stop class="s2" offset="1" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="shade"><stop class="sg" offset=".55" stop-opacity="0"/><stop class="sg" offset="1" stop-opacity=".7"/></radialGradient>`,
    css:
      `.sway{animation:sway 26s ease-in-out infinite alternate}@keyframes sway{from{transform:translate(${VX - 46}px,${VY + 18}px)}to{transform:translate(${VX + 46}px,${VY - 18}px)}}` +
      `.ring{fill:none;stroke-width:5;animation:come calc(var(--slow)*${T}s) linear infinite}.ring:nth-child(2n){stroke-opacity:var(--odd)}@keyframes come{${come}}.gate{stroke-width:11}` +
      `.frames{opacity:var(--line)}.rails{stroke:var(--w2);stroke-width:1.6;opacity:var(--rail)}.cn{stroke-width:3}` +
      `.end{animation:far 7s ease-in-out infinite alternate}@keyframes far{from{transform:scale(.8);opacity:.7}to{transform:scale(1.15);opacity:1}}` +
      `.sp{fill-opacity:var(--streak);animation:streak 5s linear infinite}@keyframes streak{from{transform:translateX(40px) scaleX(.15);opacity:0}15%{opacity:.9}to{transform:translateX(1100px) scaleX(3.4);opacity:.9}}`,
    body:
      `<g class="sway" style="transform:translate(${VX}px,${VY}px)">` +
      `<circle class="end" r="260" fill="url(#end)"/>` +
      `<g class="rails">${rails}</g><g>${stars}</g><g class="frames">${rings}</g></g>` +
      `<rect x="-400" y="-400" width="${W + 800}" height="${H + 800}" fill="url(#shade)"/>`,
  })
}

/** Each scene by name: (theme, moving) to one SVG. */
export const SCENERY: Readonly<Record<Scenery, (theme: Theme, moving: boolean) => string>> = { grid, sunset, city, plotter, weave, glyphs, flock, nebula, ridges, circuit, tunnel }
export const SCENERIES: readonly Scenery[] = ['grid', 'sunset', 'city', 'plotter', 'weave', 'glyphs', 'flock', 'nebula', 'ridges', 'circuit', 'tunnel']
