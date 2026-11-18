// Eleven drawn scenes. The first six: a synthwave grid, a retro sunset, a night city, and three mechanical ones
// (a plotter, a loom, a field of small machines). The second five: a flock of pixels, a nebula, stacked signal
// ridges, a circuit board and a tunnel. Then the northern lights over a frozen lake, and three in square pixels or plain shapes:
// a kaleidoscope, an aquarium and a dithered sky. Each is one SVG that moves by CSS alone, kept to what the desktop app will animate:
// its listed SVG elements, CSS whose every function is a colour, maths, transform, easing or filter function
// (so no path() and no CSS gradients), `@media (` with the space, nothing fetched.
import type { Mode, Theme } from './themes.ts'

export type Scenery = 'grid' | 'sunset' | 'city' | 'plotter' | 'weave' | 'flock' | 'nebula' | 'ridges' | 'circuit' | 'tunnel' | 'borealis' | 'kaleidoscope' | 'aquarium' | 'valley'

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

type Parts = { tune?: string; defs?: string; css: string; body: string }

// The frame every scene here shares: the theme's colours as variables, each scene's own tuning of them, the ground,
// and the switch that holds everything still. An element's inline style is where it rests; its animation moves it from there.
const shell = (theme: Theme, moving: boolean, o: Parts): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">` +
  `<defs>${o.defs ?? ''}</defs>` +
  `<style>svg{${vars(theme.colors)};${o.tune ?? ''}}` +
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
    tune: '--stars:1',
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
    tune: '--sil:color-mix(in srgb,var(--ground) 78%,#000);--sil2:color-mix(in srgb,var(--ground) 64%,var(--w3))',
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
    tune: '--b1:color-mix(in srgb,var(--ground) 70%,var(--w3));--b2:color-mix(in srgb,var(--ground) 86%,var(--w3));--b3:color-mix(in srgb,var(--ground) 92%,#000);--lit:1',
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
    tune: '--cloth:.85',
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

type Flock = Record<'at' | 'cx' | 'cy' | 'ax' | 'bx' | 'ay' | 'by' | 'cz' | 'p1' | 'p2' | 'p3' | 'p4' | 'ranks' | 'tail' | 'long' | 'fat', number>

/** Murmuration: a flock of square pixels that streams, bunches and turns as one, over a pixel treeline at dusk. */
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
    tune: '--bird:.95;--dusk:.5',
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
    tune: '--neb:1;--star:1;--hot:var(--text)',
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
    tune: '--ink:.95',
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
    tune: '--trace:.6;--board:.16',
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
    // slower, every other one is left out, and the streaks are faint. On a dark ground the app's closer look at single
    // spots counts the frames too (held 4 runs in 10 in Aurora), so there every other frame is faint and they come a little slower.
    tune: '--line:.9;--rail:.34;--hot:var(--text);--slow:1.2;--odd:.3;--streak:1',
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

/** Northern lights: curtains of aurora over a frozen lake, snow-capped ranges at either side, spruce, a lit cabin. */
const borealis = (theme: Theme, moving: boolean): string => {
  const rand = seeded(181)
  const SHORE = 690
  // the ranges rise at either side of the window, where the conversation leaves the view clear
  const side = (x: number) => Math.max(Math.exp(-(((x - 230) / 340) ** 2)), Math.exp(-(((x - 1370) / 340) ** 2)))
  const lerp = (a: readonly number[], b: readonly number[], t: number): [number, number] => [n1((a[0] ?? 0) + ((b[0] ?? 0) - (a[0] ?? 0)) * t), n1((a[1] ?? 0) + ((b[1] ?? 0) - (a[1] ?? 0)) * t)]

  let stars = ''
  for (let i = 0; i < 90; i++) {
    const y = rand() * (SHORE - 140), tw = i % 6 === 0
    stars += `<circle${tw ? ' class="tw"' : ''} cx="${Math.round(rand() * (W + 200) - 100)}" cy="${Math.round(y - 60)}" r="${n1(0.6 + rand() * 1.3)}" style="opacity:${n2((0.3 + rand() * 0.6) * (1 - (y / SHORE) * 0.6))}${tw ? `;animation-duration:${n1(4 + rand() * 5)}s;animation-delay:-${n1(rand() * 8)}s` : ''}"/>`
  }

  // a curtain: thin rays standing on a wavering lower edge, in bands that brighten one after another along it
  const BANDS = 12
  const curtain = (k: number, grad: string, base: number, amp: number, ph: number, tall: number, step: number, secs: number) => {
    const bands = Array.from({ length: BANDS }, () => '')
    let edge = ''
    for (let x = -200; x <= W + 200; x += step) {
      const b = base + amp * Math.sin(x / 300 + ph) + amp * 0.35 * Math.sin(x / 97 + ph * 1.7)
      const env = 0.4 + 0.6 * side(x)
      const h = tall * env * (0.7 + 0.3 * Math.sin(x / 140 + ph * 2.3)) * (0.85 + rand() * 0.3)
      const at = Math.min(BANDS - 1, Math.floor(((x + 200) / (W + 400)) * BANDS))
      bands[at] += `<rect x="${Math.round(x)}" y="${Math.round(b - h)}" width="${Math.round(step * (0.5 + rand() * 0.9))}" height="${Math.round(h + 8)}" opacity="${n2(0.3 + 0.7 * rand() * env)}"/>`
    }
    for (let x = -200; x <= W + 200; x += 30) edge += `${edge ? ' ' : ''}${x},${Math.round(base + amp * Math.sin(x / 300 + ph) + amp * 0.35 * Math.sin(x / 97 + ph * 1.7))}`
    return `<g class="sw sw${k}"><polyline class="edge k${grad === 'rb' ? 1 : 0}" points="${edge}" stroke-width="64" opacity=".07"/><polyline class="edge k${grad === 'rb' ? 1 : 0}" points="${edge}" stroke-width="22" opacity=".1"/>` + bands.map((rays, i) => `<g class="br" fill="url(#${grad})" style="animation-duration:${secs}s;animation-delay:-${n2((i / BANDS) * secs * 1.6)}s">${rays}</g>`).join('') + `</g>`
  }

  // a range of peaks and saddles, tallest at the sides, with snow on every high peak
  const range = (base: number, low: number, high: number, min: number, max: number) => {
    const pts: [number, number][] = []
    let up = true
    for (let x = -220; x <= W + 220; x += min + rand() * (max - min)) {
      const e = low + (high - low) * side(x)
      pts.push([Math.round(x), Math.round(base - (up ? e * (0.75 + rand() * 0.25) : e * (0.38 + rand() * 0.3)))])
      up = !up
    }
    let caps = ''
    for (let i = 1; i < pts.length - 1; i += 2) {
      const P = pts[i], L = pts[i - 1], R = pts[i + 1]
      if (!P || !L || !R) continue
      if (base - P[1] < 70) continue
      const A = lerp(P, L, 0.26 + rand() * 0.1), B = lerp(P, R, 0.3 + rand() * 0.12)
      const dip = (t: number) => { const q = lerp(A, B, t); return `${q[0]},${n1(q[1] + (rand() - 0.3) * 18)}` }
      caps += `<polygon points="${P.join(',')} ${A.join(',')} ${dip(0.3)} ${dip(0.55)} ${dip(0.78)} ${B.join(',')}"/>`
    }
    const outline = `-220,${base + 4} ${pts.map(p => p.join(',')).join(' ')} ${W + 220},${base + 4}`
    const at = (x: number) => { for (let i = 1; i < pts.length; i++) { const p = pts[i - 1], q = pts[i]; if (p && q && q[0] >= x) return p[1] + ((q[1] - p[1]) * (x - p[0])) / (q[0] - p[0]) } return base }
    return { outline, caps, at }
  }
  const far = range(SHORE + 2, 60, 300, 50, 110)
  const near = range(SHORE + 14, 6, 150, 46, 96)

  // spruce: one path of stacked tiers
  const spruce = (x: number, yb: number, h: number) => {
    const w = h * 0.34, p = (dx: number, dy: number) => `${Math.round(x + dx * w)} ${Math.round(yb - dy * h)}`
    return `M${p(0, 1)}L${p(0.38, 0.62)}L${p(0.2, 0.62)}L${p(0.7, 0.28)}L${p(0.42, 0.28)}L${p(1, 0)}L${p(-1, 0)}L${p(-0.42, 0.28)}L${p(-0.7, 0.28)}L${p(-0.2, 0.62)}L${p(-0.38, 0.62)}Z`
  }
  let trees = ''
  for (let x = -80; x < W + 80; x += 10 + rand() * 18) {
    const s = side(x)
    if (s < 0.08 && rand() < 0.6) continue
    trees += spruce(x, Math.min(SHORE + 16, near.at(x) + 10 + rand() * 26 * s), (8 + rand() * 12) * (0.4 + 1.4 * s) + 4)
  }
  let fore = ''
  for (const [x, h] of [[-30, 420], [40, 330], [100, 250], [1500, 300], [1560, 400], [1640, 350]] as const) fore += spruce(x, H + 30, h + rand() * 40)

  let ice = ''
  for (let i = 0; i < 26; i++) {
    const d = rand(), y = SHORE + 14 + d * d * (H - SHORE)
    ice += `<ellipse cx="${Math.round(rand() * W)}" cy="${Math.round(y)}" rx="${Math.round((50 + rand() * 120) * (1 + d * 2))}" ry="${n1((1.2 + rand() * 2) * (1 + d * 1.5))}" opacity="${n2(0.05 + rand() * 0.16)}"/>`
  }
  let cracks = ''
  for (let i = 0; i < 9; i++) {
    let x = rand() * W, y = SHORE + 40 + rand() * (H - SHORE - 40), d = `M${Math.round(x)} ${Math.round(y)}`
    for (let k = 0; k < 6; k++) { x += (rand() - 0.5) * 120; y += (rand() - 0.5) * 16; d += `L${Math.round(x)} ${Math.round(y)}` }
    cracks += `<path d="${d}"/>`
  }
  let glints = ''
  for (let i = 0; i < 14; i++) glints += `<circle class="tw" cx="${Math.round(rand() * W)}" cy="${Math.round(SHORE + 20 + rand() * (H - SHORE - 20))}" r="${n1(0.8 + rand() * 1.2)}" style="animation-duration:${n1(5 + rand() * 5)}s;animation-delay:-${n1(rand() * 9)}s"/>`

  // a cabin on the left shore, its window lit, smoke rising
  const cx = 330, cy = SHORE + 18
  const cabin =
    `<circle cx="${cx - 7}" cy="${cy - 14}" r="80" fill="url(#lamp)"/>` +
    `<g class="sil"><rect x="${cx - 28}" y="${cy - 24}" width="56" height="24"/><rect x="${cx + 14}" y="${cy - 50}" width="7" height="16"/><polygon points="${cx - 36},${cy - 23} ${cx},${cy - 46} ${cx + 36},${cy - 23}"/></g>` +
    `<polygon class="snow" points="${cx - 38},${cy - 22} ${cx},${cy - 48} ${cx + 38},${cy - 22} ${cx + 31},${cy - 26} ${cx},${cy - 43} ${cx - 31},${cy - 26}"/>` +
    `<rect class="c3" x="${cx - 14}" y="${cy - 18}" width="12" height="10"/>` +
    [0, 1, 2, 3].map(i => `<circle class="smk" cx="${cx + 17}" cy="${cy - 54}" r="7" style="animation-delay:-${i * 3}s"/>`).join('')

  const aurora =
    `<g id="au">` +
    `<ellipse cx="260" cy="${SHORE - 260}" rx="520" ry="260" fill="url(#halo)"/><ellipse class="hl" cx="1340" cy="${SHORE - 280}" rx="520" ry="260" fill="url(#halo)"/>` +
    `<g opacity=".45">${curtain(2, 'ra', 470, 40, 4, 150, 24, 9)}</g>` +
    `<g opacity=".7">${curtain(1, 'rb', 300, 55, 2.1, 230, 20, 11)}</g>` +
    curtain(0, 'ra', 400, 70, 0.3, 300, 14, 7) +
    `</g>`

  return shell(theme, moving, {
    tune: '--star:1;--far:color-mix(in srgb,var(--ground) 66%,color-mix(in srgb,var(--text) 45%,var(--w1)));--near:color-mix(in srgb,var(--ground) 86%,var(--w1));--sil:color-mix(in srgb,var(--ground) 55%,#000);--snow:color-mix(in srgb,#fff 85%,var(--w0));--ice:color-mix(in srgb,var(--ground) 84%,var(--w1))',
    defs:
      `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop class="sg" offset="0"/><stop class="s1" offset=".55" stop-opacity=".05"/><stop class="s0" offset="1" stop-opacity=".07"/></linearGradient>` +
      `<linearGradient id="ra" x1="0" y1="1" x2="0" y2="0"><stop class="s0" offset="0" stop-opacity="0"/><stop class="s0" offset=".05" stop-opacity=".95"/><stop class="s0" offset=".3" stop-opacity=".4"/><stop class="s2" offset=".7" stop-opacity=".12"/><stop class="s2" offset="1" stop-opacity="0"/></linearGradient>` +
      `<linearGradient id="rb" x1="0" y1="1" x2="0" y2="0"><stop class="s1" offset="0" stop-opacity="0"/><stop class="s1" offset=".06" stop-opacity=".8"/><stop class="s1" offset=".35" stop-opacity=".3"/><stop class="s2" offset=".75" stop-opacity=".12"/><stop class="s2" offset="1" stop-opacity="0"/></linearGradient>` +
      `<radialGradient id="halo"><stop class="s0" offset="0" stop-opacity=".12"/><stop class="s0" offset="1" stop-opacity="0"/></radialGradient>` +
      `<linearGradient id="rim" x1="0" y1="0" x2="0" y2="1"><stop class="s0" offset="0" stop-opacity=".22"/><stop class="s0" offset=".6" stop-opacity="0"/></linearGradient>` +
      `<linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop class="s0" offset="0" stop-opacity=".16"/><stop class="s0" offset=".5" stop-opacity="0"/></linearGradient>` +
      `<radialGradient id="lamp"><stop class="s3" offset="0" stop-opacity=".4"/><stop class="s3" offset="1" stop-opacity="0"/></radialGradient>` +
      `<clipPath id="lake"><rect x="-400" y="${SHORE}" width="${W + 800}" height="${H - SHORE + 400}"/></clipPath>` +
      `<linearGradient id="trail" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--text)"/><stop offset="1" stop-color="var(--text)" stop-opacity="0"/></linearGradient>`,
    css:
      `.sky{opacity:var(--star)}.tw{animation:glint 6s ease-in-out infinite alternate}@keyframes glint{from{opacity:.08}to{opacity:.9}}` +
      `.br{animation:wave 7s ease-in-out infinite alternate}@keyframes wave{from{opacity:.42}to{opacity:1}}` +
      `.sw{transform-origin:800px 420px}.edge{fill:none;stroke-linejoin:round}` +
      `.sw0{animation:sway0 30s ease-in-out infinite alternate}@keyframes sway0{from{transform:translateX(-46px) skewX(-6deg) scaleY(.94)}to{transform:translateX(46px) skewX(5deg) scaleY(1.05)}}` +
      `.sw1{animation:sway1 38s ease-in-out infinite alternate}@keyframes sway1{from{transform:translateX(40px) skewX(5deg) scaleY(1.04)}to{transform:translateX(-40px) skewX(-4deg) scaleY(.95)}}` +
      `.sw2{animation:sway2 46s ease-in-out infinite alternate}@keyframes sway2{from{transform:translateX(-30px) skewX(-3deg)}to{transform:translateX(30px) skewX(4deg)}}` +
      `.hl{animation:wave 13s ease-in-out infinite alternate}` +
      `.far{fill:var(--far)}.near{fill:var(--near)}.sil{fill:var(--sil)}.snow{fill:var(--snow)}.cap{fill:var(--snow);opacity:.8}` +
      `.ice{fill:var(--ice)}.drift{fill:var(--snow)}.crack{fill:none;stroke:var(--text);stroke-width:1;opacity:.1}.gl{fill:var(--snow)}` +
      `.smk{fill:var(--text);opacity:0;transform-box:fill-box;transform-origin:50% 50%;animation:smoke 12s linear infinite}@keyframes smoke{0%{transform:translate(0,0) scale(.4);opacity:0}15%{opacity:.28}100%{transform:translate(30px,-96px) scale(1.8);opacity:0}}` +
      `.shoot{animation:shoot 31s linear infinite}@keyframes shoot{0%{transform:translate(1300px,-30px);opacity:0}1%{opacity:.9}4%{transform:translate(900px,170px);opacity:0}100%{transform:translate(900px,170px);opacity:0}}`,
    body:
      `<rect x="-400" y="-400" width="${W + 800}" height="${SHORE + 400}" fill="url(#sky)"/>` +
      `<g class="sky t">${stars}</g>` +
      `<g class="shoot" style="transform:translate(900px,170px);opacity:0"><line x1="130" y1="-65" x2="0" y2="0" stroke="url(#trail)" stroke-width="2" stroke-linecap="round"/></g>` +
      aurora +
      `<g id="mt"><polygon class="far" points="${far.outline}"/><polygon points="${far.outline}" fill="url(#rim)"/><g class="cap">${far.caps}</g></g>` +
      `<rect class="ice" x="-400" y="${SHORE}" width="${W + 800}" height="${H - SHORE + 400}"/>` +
      `<g clip-path="url(#lake)"><use href="#au" transform="translate(0 ${SHORE * 1.5}) scale(1 -0.5)" opacity=".35"/><use href="#mt" transform="translate(0 ${SHORE * 1.5}) scale(1 -0.5)" opacity=".3"/></g>` +
      `<rect x="-400" y="${SHORE}" width="${W + 800}" height="${H - SHORE}" fill="url(#sheen)"/>` +
      `<g class="drift">${ice}</g><g class="crack">${cracks}</g><g class="gl">${glints}</g>` +
      `<rect class="snow" x="-400" y="${SHORE}" width="${W + 800}" height="2" opacity=".35"/>` +
      `<polygon class="near" points="${near.outline}"/><g class="cap">${near.caps}</g>` +
      `<path class="sil" d="${trees}"/>` +
      `<ellipse cx="${cx}" cy="${cy + 26}" rx="90" ry="10" class="c3" opacity=".12"/>` +
      cabin +
      `<path class="sil" d="${fore}"/>`,
  })
}

/** Each scene by name: (theme, moving) to one SVG. */
// a picture in square pixels: rows of characters, one pixel each, as one path for every pixel that is `ch`
const pixelPath = (rows: readonly string[], ch: string, P: number, x0 = 0, y0 = 0): string => {
  let d = ''
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] !== ch) continue
      let n = 1
      while (row[x + n] === ch) n++
      d += `M${x0 + x * P} ${y0 + y * P}h${n * P}v${P}h${-n * P}z`
      x += n - 1
    }
  })
  return d
}
// a disc of square pixels, radius r pixels, centred on (cx, cy)
const pixelDisc = (cx: number, cy: number, r: number, P: number): string => {
  let d = ''
  for (let j = -r; j < r; j++) {
    const half = Math.round(Math.sqrt(Math.max(0, r * r - (j + 0.5) ** 2)))
    if (half > 0) d += `M${cx - half * P} ${cy + j * P}h${2 * half * P}v${P}h${-2 * half * P}z`
  }
  return d
}
// ordered dither in 2x2 pixel tiles: a quarter, half or three quarters of the pixels in a colour class
const ditherTiles = (id: string, cls: string, P: number): string =>
  `<pattern id="${id}25" width="${2 * P}" height="${2 * P}" patternUnits="userSpaceOnUse"><rect class="${cls}" width="${P}" height="${P}"/></pattern>` +
  `<pattern id="${id}50" width="${2 * P}" height="${2 * P}" patternUnits="userSpaceOnUse"><path class="${cls}" d="M0 0h${P}v${P}h-${P}zM${P} ${P}h${P}v${P}h-${P}z"/></pattern>` +
  `<pattern id="${id}75" width="${2 * P}" height="${2 * P}" patternUnits="userSpaceOnUse"><path class="${cls}" d="M0 0h${2 * P}v${P}h-${2 * P}zM${P} ${P}h${P}v${P}h-${P}z"/></pattern>`

/** Kaleidoscope: flat shapes drift slowly through one wedge of a mirror tube, seen twelve times over as a mandala that turns and breathes. */
const kaleidoscope = (theme: Theme, moving: boolean): string => {
  const rand = seeded(233)
  const R = 1150, A = Math.PI / 6
  const shape = (kind: number, s: number) =>
    kind === 0 ? `M0 ${-s}L${n1(s * 0.87)} ${n1(s / 2)}L${n1(-s * 0.87)} ${n1(s / 2)}Z`
    : kind === 1 ? `M0 ${-s}L${n1(s * 0.55)} 0L0 ${s}L${n1(-s * 0.55)} 0Z`
    : kind === 2 ? `M${-s} ${n1(-s * 0.16)}h${2 * s}v${n1(s * 0.32)}h${-2 * s}Z`
    : kind === 3 ? `M${-s} 0a${s} ${s} 0 1 0 ${2 * s} 0a${s} ${s} 0 1 0 ${-2 * s} 0Z`
    : `M${n1(-s * 0.7)} ${n1(-s * 0.7)}h${n1(s * 1.4)}v${n1(s * 1.4)}h${n1(-s * 1.4)}Z`
  // shapes spread from the middle to beyond the corners, many lying across the wedge's mirrored edges so they
  // meet their own reflections as they drift
  let shapes = ''
  const N = 36
  for (let i = 0; i < N; i++) {
    const r = 50 + 920 * Math.sqrt((i + rand() * 0.8) / N), th = -0.12 + rand() * (A + 0.24)
    const s = Math.round(10 + r * 0.05 + rand() * 30), kind = Math.floor(rand() * 5)
    const ring = rand() < 0.22
    shapes += `<path class="${ring ? `ring k${i % 4}` : `c${i % 4}`} m${i % 6}" d="${shape(kind, s)}" style="translate:${Math.round(r * Math.cos(th))}px ${Math.round(r * Math.sin(th))}px;opacity:${n2(ring ? 0.4 + rand() * 0.3 : 0.16 + rand() * 0.32)};animation-duration:${Math.round(36 + rand() * 50)}s;animation-delay:-${Math.round(rand() * 80)}s"/>`
  }
  let mirrors = ''
  for (let k = 0; k < 6; k++) mirrors += `<use href="#kw" transform="rotate(${60 * k})"/><use href="#kw" transform="rotate(${60 * k + 60}) scale(1 -1)"/>`
  const MOVES = [
    'translate(150px,50px) rotate(120deg) scale(1.3)',
    'translate(-100px,120px) rotate(-90deg) scale(.7)',
    'translate(70px,-130px) rotate(180deg)',
    'translate(-170px,-40px) rotate(60deg) scale(1.4)',
    'translate(40px,160px) rotate(-150deg) scale(.8)',
    'translate(130px,-90px) rotate(-60deg) scale(1.2)',
  ]
  return shell(theme, moving, {
    tune: '--glow:.22',
    defs:
      `<clipPath id="wedge"><polygon points="0,0 ${R},0 ${n1(R * Math.cos(A))},${n1(R * Math.sin(A))}"/></clipPath>` +
      `<g id="kw" clip-path="url(#wedge)">${shapes}</g>` +
      `<radialGradient id="kglow"><stop class="s2" offset="0" stop-opacity="1"/><stop class="s2" offset="1" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="tube"><stop class="sg" offset=".55" stop-opacity="0"/><stop class="sg" offset="1" stop-opacity=".7"/></radialGradient>`,
    css:
      `.ring{fill:none;stroke-width:3}` +
      `.kal path{animation-timing-function:ease-in-out;animation-iteration-count:infinite;animation-direction:alternate}` +
      MOVES.map((m, i) => `.m${i}{animation-name:m${i}}@keyframes m${i}{to{transform:${m}}}`).join('') +
      `.turn{animation:turn 300s linear infinite}@keyframes turn{0%{transform:rotate(0) scale(1)}50%{transform:rotate(180deg) scale(1.12)}100%{transform:rotate(360deg) scale(1)}}` +
      `.lens{fill:none;opacity:.14;stroke-width:2}`,
    body:
      `<circle cx="800" cy="500" r="560" fill="url(#kglow)" style="opacity:var(--glow)"/>` +
      `<g transform="translate(800 500)"><g class="turn kal">${mirrors}` +
      `<circle class="lens k1" r="230"/><circle class="lens k3" r="520" stroke-dasharray="4 14"/><circle class="lens k0" r="840"/></g></g>` +
      `<circle cx="800" cy="500" r="1000" fill="url(#tube)"/>`,
  })
}

/** Pixel aquarium: a vivid reef in small square pixels. Striped fish swim both ways through banded, dithered water, jellyfish
 * drift up glowing, coral, sea fans, anemones and kelp crowd the sides, light falls in from the surface onto rippled sand. */
const aquarium = (theme: Theme, moving: boolean): string => {
  const rand = seeded(311)
  const P = 4, FLOOR = 870, TOP = 36
  const snap = (v: number) => Math.round(v / P) * P
  const run = (x: number, y: number, w: number, h = P) => `M${x} ${y}h${w}v${h}h${-w}z`
  const side = (x: number) => Math.max(Math.exp(-(((x - 170) / 330) ** 2)), Math.exp(-(((x - 1430) / 330) ** 2)))

  // the water: bands from a bright surface to a deep floor, each dithered into the next in three steps
  const WATER = [
    'color-mix(in srgb,var(--ground) 40%,var(--w1))',
    'color-mix(in srgb,var(--ground) 52%,var(--w1))',
    'color-mix(in srgb,var(--ground) 62%,color-mix(in srgb,var(--w1) 70%,var(--w2)))',
    'color-mix(in srgb,var(--ground) 70%,color-mix(in srgb,var(--w1) 45%,var(--w2)))',
    'color-mix(in srgb,var(--ground) 77%,color-mix(in srgb,var(--w1) 25%,var(--w2)))',
    'color-mix(in srgb,var(--ground) 83%,var(--w2))',
    'color-mix(in srgb,var(--ground) 88%,var(--w2))',
  ]
  const band = (FLOOR - TOP) / WATER.length
  let water = '', tiles = ''
  WATER.forEach((_, i) => {
    const y = i === 0 ? -400 : Math.round(TOP + i * band)
    water += `<rect class="b${i}" x="-400" y="${y}" width="${W + 800}" height="${(i === 0 ? 400 + TOP + Math.ceil(band) : Math.ceil(band)) + 1}"/>`
    if (i > 0) water += [75, 50, 25].map((p, k) => `<rect x="-400" y="${y + k * 3 * P}" width="${W + 800}" height="${3 * P}" fill="url(#t${i - 1}${p})"/>`).join('')
    tiles += ditherTiles(`t${i}`, `b${i}`, P)
  })
  for (const t of ['ray', 'sd', 'c0', 'c1', 'c2', 'c3', 'lt']) tiles += ditherTiles(t, t, P)
  tiles += `<pattern id="scale" width="${8 * P}" height="${6 * P}" patternUnits="userSpaceOnUse"><path d="M0 ${2 * P}h${P}v-${P}h${P}v-${P}h${2 * P}v${P}h${P}v${P}h${P}v${P}h-${6 * P}zM${4 * P} ${5 * P}h${P}v-${P}h${P}v-${P}h${2 * P}v${P}h${P}v${P}h${-5 * P}z" fill="#fff"/></pattern>`

  // the surface: a bright line of little crests
  let surf = ''
  for (let x = -80; x < W + 80; x += 6 * P) surf += run(x, TOP - P, 3 * P) + run(x + 3 * P, TOP, 3 * P)

  // light from the surface: stepped beams, dithered at their edges, slowly brightening and fading
  let rays = ''
  for (const [x, w, slant] of [[150, 90, 0.3], [330, 50, 0.28], [520, 30, 0.33], [1060, 40, 0.3], [1250, 80, 0.35], [1450, 110, 0.31]] as const) {
    let core = '', edge = ''
    for (let y = TOP; y < FLOOR - 60; y += 6 * P) { const x0 = snap(x + (y - TOP) * slant); core += run(x0, y, w, 6 * P); edge += run(x0 - 3 * P, y, 3 * P, 6 * P) + run(x0 + w, y, 3 * P, 6 * P) }
    rays += `<g style="animation-delay:-${Math.round(rand() * 20)}s"><path class="ray" d="${core}"/><path fill="url(#ray50)" d="${edge}"/></g>`
  }

  // sand with dithered ripple bands that follow its top, pools of light on it, shells and starfish
  let sand = `M-400 ${H + 40}V${FLOOR}`, edge = '', h = 0
  for (let x = -400; x < W + 400; x += 6 * P) { h = Math.max(-3, Math.min(5, h + Math.round((rand() - 0.5) * 2.4))); sand += `V${FLOOR - h * P}h${6 * P}`; edge += run(x, FLOOR - h * P, 6 * P) }
  sand += `V${H + 40}Z`
  let pools = ''
  for (let i = 0; i < 16; i++) {
    const x = snap(rand() * W), y = snap(FLOOR + 16 + rand() * 90), w = snap(30 + rand() * 70)
    pools += `<path d="${run(x, y, w)}${run(x + 2 * P, y - P, w - 4 * P)}${run(x + 2 * P, y + P, w - 4 * P)}" style="animation-delay:-${n1(rand() * 12)}s"/>`
  }
  const STAR = ['...#...', '...#...', '#######', '.#####.', '..###..', '.##.##.', '##...##']
  const SHELL = ['..###..', '.#####.', '#.#.#.#', '#.#.#.#', '.#####.', '...#...']
  let shells = ''
  for (const [x, star, c] of [[420, 1, 3], [560, 0, 0], [980, 1, 2], [1120, 0, 1], [720, 0, 3], [860, 1, 0]] as const) shells += `<path class="c${c}" d="${pixelPath(star ? STAR : SHELL, '#', P, x, FLOOR + 30 + snap(rand() * 60))}"/>`

  // coral: branching stems that fork as they climb, tipped in a bright colour
  const coral = (x: number, base: number, tall: number, c: number) => {
    let stems = '', tips = ''
    // each straight stretch of a stem is one block, from where it last stepped sideways
    const grow = (gx: number, gy: number, left: number, dir: number): void => {
      let cx = gx, cy = gy, from = gy
      for (let k = 0; k < left; k++) {
        cy -= P
        if (rand() < 0.35) { stems += run(cx, cy + P, 2 * P, from - cy - P); from = cy + P; cx += dir * P }
        if (k > 3 && rand() < 0.12 && left - k > 4) grow(cx, cy, Math.round((left - k) * 0.8), -dir)
      }
      stems += run(cx, cy, 2 * P, from - cy)
      tips += run(cx - P, cy - 2 * P, 4 * P, 2 * P)
    }
    grow(x, base, tall, 1); grow(x, base, Math.round(tall * 0.8), -1); grow(x + 2 * P, base, Math.round(tall * 0.6), 1)
    return `<path class="c${c}" d="${stems}"/><path class="tip" d="${tips}"/>`
  }
  // a dome of brain coral: scalloped, rimmed, banded
  const dome = (x: number, base: number, r: number, c: number) => {
    let d = '', rim = ''
    for (let j = 0; j < r; j++) { const half = Math.round(r * Math.sqrt(1 - ((r - j - 0.5) / r) ** 2) * 1.4); d += run(x - half * P, base - (r - j) * P, 2 * half * P); if (j < 2) rim += run(x - half * P, base - (r - j) * P, 2 * half * P) }
    return `<path class="c${c}" d="${d}"/><path fill="url(#scale)" class="scl" d="${d}"/><path fill="url(#lt50)" d="${rim}"/>`
  }
  // a sea fan: lines spreading up from one root, dithered between them
  const fan = (x: number, base: number, r: number, c: number) => {
    let d = ''
    for (let a = -1.1; a <= 1.1; a += 0.28) for (let s = 2; s < r; s += 2) d += run(snap(x + Math.sin(a) * s * P), snap(base - Math.cos(a) * s * P), P, 2 * P)
    let back = ''
    for (let j = 1; j < r; j++) { const half = Math.round(Math.sqrt(r * r - j * j) * Math.sin(1.2)); back += run(x - half * P, base - j * P, 2 * half * P) }
    return `<path fill="url(#c${c}50)" d="${back}"/><path class="c${c}" d="${d}"/>`
  }
  // swaying stalks: anemone tentacles and kelp, each piece swaying on the one below it
  const stalk = (x: number, base: number, pieces: number, len: number, cls: string, leafy: number) => {
    let s = ''
    for (let k = pieces - 1; k >= 0; k--) {
      const y = base - (k + 1) * len * P, leaf = leafy ? (k % 2 ? run(x + 3 * P, y + 2 * P, 3 * P, 3 * P) : run(x - 3 * P, y + 4 * P, 3 * P, 3 * P)) : ''
      const tip = k === pieces - 1 ? `<path class="tip" d="${run(x - P, y - 2 * P, 4 * P, 2 * P)}"/>` : ''
      const piece = `<path d="${run(x, y, 3 * P, len * P)}${leaf}"/>${tip}`
      s = k === 0 ? piece + s : `<g class="sway" style="animation-duration:${n1(5 + rand() * 3)}s;animation-delay:-${n1(rand() * 8)}s">${piece}${s}</g>`
    }
    return `<g class="${cls}">${s}</g>`
  }
  // rock mounds at either side, scalloped, rimmed and banded down their slopes; the reef grows on them
  let mound = `M-400 ${H + 40}V${FLOOR + 60}`, ridge = '', wob = 0
  const tops: [number, number][] = []
  for (let x = -400; x < W + 400; x += 6 * P) {
    wob = Math.max(-1, Math.min(1, wob + (rand() - 0.5) * 0.9))
    const top = FLOOR + 60 - snap(Math.max(0, side(x + 3 * P) * 290 + wob * 30 - 20))
    tops.push([x, top]); mound += `V${top}h${6 * P}`; ridge += run(x, top, 6 * P)
  }
  mound += `V${H + 40}Z`
  const at = (x: number): number => Math.min(FLOOR, (tops.find(([tx]) => tx + 6 * P > x) ?? tops[tops.length - 1]!)[1])
  const rocks = `<path id="rk" class="rock" d="${mound}"/><use href="#rk" fill="url(#scale)" class="scl"/>` +
    ([[1, 75], [2, 50], [3, 25], [10, 50], [11, 25], [22, 25]] as const).map(([dy, p]) => `<use href="#rr" y="${dy * P}" fill="url(#c3${p})" opacity="${dy > 3 ? 0.5 : 1}"/>`).join('') + `<use href="#rr" class="c3"/>`
  let reef = ''
  // kelp at the back of each side
  for (const x of [20, 76, 128, 1452, 1508, 1564]) reef += stalk(x, at(x) + 8, 10 + Math.round(rand() * 6), 10, 'kelp', 1)
  for (const [x, r, c] of [[236, 22, 2], [1330, 26, 2], [430, 14, 0]] as const) reef += fan(x, at(x) + 4, r, c)
  for (const [x, tall, c] of [[48, 60, 0], [176, 44, 1], [320, 34, 3], [1250, 40, 1], [1400, 56, 0], [1540, 48, 3]] as const) reef += coral(x, at(x) + 4, tall, c)
  for (const [x, r, c] of [[110, 10, 1], [380, 8, 2], [520, 6, 0], [1170, 7, 2], [1300, 10, 1], [1480, 12, 2]] as const) reef += dome(x, at(x) + 6, r, c)
  // anemones: a crown of tentacles of different heights, tipped bright, swaying together
  for (const [x, c] of [[260, 3], [470, 1], [1130, 3], [1360, 0]] as const) {
    const base = at(x) + 4
    let arms = '', tips = ''
    for (let k = -4; k <= 4; k++) { const tall = (9 - Math.abs(k) * 1.6 + rand() * 2) * P; arms += run(x + k * 2 * P, snap(base - tall), P, snap(tall)); tips += run(x + k * 2 * P, snap(base - tall) - P, P, 2 * P) }
    reef += `<g class="sway" style="animation-duration:${n1(5 + rand() * 3)}s;animation-delay:-${n1(rand() * 8)}s"><path class="c${c}" d="${arms}"/><path class="tip" d="${tips}"/></g><path class="c${c}" d="${run(x - 10 * P, base - 2 * P, 20 * P, 3 * P)}"/>`
  }

  // fish, striped: 1 body, 2 belly, 3 eye, 4 fins, 5 stripe; each faces right
  const FISH: readonly (readonly string[])[] = [
    ['......1111........', '....1115511.......', '4..111555111......', '44111115551111111.', '441111155511113111', '44122225552222221.', '4..222255522......', '....22255.........', '......4...........'],
    ['......4......', '.....44......', '....444......', '...4444......', '..111511111..', '.11115111311.', '4111151111111', '4412252222211', '4.12252222221', '..122522222..', '...4444......', '....444......', '.....44......', '......4......'],
    ['....111111....', '..1115111511..', '.111111111111.', '41151111113111', '44111151111111', '44122222222211', '4.12252222521.', '..122222222...', '...2222222....'],
    ['........11111.........', '44....111111111111....', '4441111111111111111...', '44455555555555555311..', '4442222222222222222221', '44....222222222222....', '........22222.........'],
  ]
  const sprites = FISH.map((rows, i) => `<g id="fish${i}">${([['1', 'fb'], ['2', 'fl'], ['4', 'fd'], ['5', 'fs'], ['3', 'fe']] as const).map(([ch, cls]) => `<path class="${cls}" d="${pixelPath(rows, ch, P)}"/>`).join('')}</g>`).join('') +
    `<g id="jelly"><path class="jb" d="${pixelPath(['....1111....', '..11111111..', '.1111111111.', '111111111111', '111111111111'], '1', P)}"/><path class="jl" d="${pixelPath(['............', '...22..2....', '..2.....2...', '............', '222222222222'], '2', P)}"/>` +
    `<path class="jt" d="${pixelPath(['5.5.5..5.5.5', '5.5..5.5..5.', '.5.5.5..5.5.', '5..5..5.5..5', '.5..5..5..5.', '5..5.....5..', '...5..5.....'], '5', P, 0, 5 * P)}"/></g>`
  let fish = ''
  const LANES: readonly (readonly [number, number, number])[] = [[110, 2, 3], [190, 1, 0], [250, 2, 1], [330, 1, 2], [400, 2, 0], [470, 1, 3], [530, 2, 2], [600, 1, 1], [660, 2, 3], [730, 1, 0], [790, 1, 2]]
  LANES.forEach(([y, s, kind], i) => {
    const left = i % 2 === 1, secs = Math.round((s === 2 ? 70 : 110) + rand() * 40), at = rand()
    fish += `<g style="translate:0 ${y}px;opacity:${s === 2 ? 1 : 0.7}"><g class="swim" style="transform:translateX(${snap(-300 + 2200 * (left ? 1 - at : at))}px);animation-duration:${secs}s;animation-delay:-${n1(at * secs)}s${left ? ';animation-direction:reverse' : ''}">` +
      `<g class="bob" style="animation-delay:-${n1(rand() * 8)}s"><use href="#fish${kind}" style="--f:var(--w${i % 4});--g:var(--w${(i + 2) % 4})" transform="scale(${left ? -s : s} ${s})"/></g></g></g>`
  })
  // jellyfish drifting up the sides
  let jellies = ''
  for (const [x, c, s] of [[380, 2, 2], [470, 3, 1], [1160, 2, 1], [1240, 3, 2]] as const) {
    const secs = Math.round(80 + rand() * 40), at = rand()
    jellies += `<g style="translate:${x}px 0;opacity:.85"><g class="drift" style="transform:translateY(${snap(FLOOR - 1100 * at)}px);animation-duration:${secs}s;animation-delay:-${n1(at * secs)}s"><g class="pulse" style="animation-delay:-${n1(rand() * 6)}s"><use href="#jelly" style="--j:var(--w${c})" transform="scale(${s})"/></g></g></g>`
  }

  // bubbles rising from the reef, and motes of plankton
  let bubbles = '', motes = ''
  const RING = ['.##.', '#..#', '#..#', '.##.']
  for (const x of [96, 232, 312, 1264, 1368, 1504]) {
    for (let k = 0; k < 3; k++) {
      const secs = Math.round(18 + rand() * 8), big = rand() < 0.4
      bubbles += `<g class="rise" style="translate:${x}px 0;transform:translateY(${snap(FLOOR - 40 - rand() * 600)}px);animation-duration:${secs}s;animation-delay:-${n1((k / 3 + rand() * 0.1) * secs)}s"><path class="wob" d="${pixelPath(RING, '#', big ? 3 : 2)}" style="animation-delay:-${n1(rand() * 6)}s"/></g>`
    }
  }
  for (let i = 0; i < 60; i++) motes += run(snap(rand() * W), snap(TOP + 20 + rand() * (FLOOR - TOP - 60)), P)

  return shell(theme, moving, {
    tune: '--fish:1',
    defs: tiles + sprites + `<path id="se" d="${edge}"/><path id="rr" d="${ridge}"/>`,
    css:
      WATER.map((c, i) => `.b${i}{fill:${c}}`).join('') +
      `.surf{fill:color-mix(in srgb,var(--w1) 50%,var(--text));opacity:.7}` +
      `.rays g{opacity:.1;animation:ray 16s ease-in-out infinite alternate}@keyframes ray{to{opacity:.2}}.ray{fill:var(--text)}` +
      `.motes{fill:var(--text);opacity:.25}` +
      `.c0{fill:var(--w0)}.c1{fill:var(--w1)}.c2{fill:var(--w2)}.c3{fill:var(--w3)}.lt{fill:var(--text)}.tip{fill:color-mix(in srgb,var(--text) 55%,var(--w0))}.scl{opacity:.18}` +
      `.kelp{fill:color-mix(in srgb,var(--w1) 65%,var(--w0))}.rock{fill:color-mix(in srgb,var(--ground) 55%,var(--w2))}` +
      `.sand{fill:color-mix(in srgb,var(--ground) 45%,var(--w3))}.sd{fill:color-mix(in srgb,var(--ground) 25%,var(--w3))}` +
      `.pools path{fill:var(--text);opacity:.06;animation:pool 12s ease-in-out infinite alternate}@keyframes pool{to{opacity:.16}}` +
      `.fb{fill:var(--f)}.fl{fill:color-mix(in srgb,var(--f) 50%,var(--text))}.fd{fill:var(--g)}.fs{fill:color-mix(in srgb,var(--text) 85%,var(--f))}.fe{fill:var(--ground)}` +
      `.jb{fill:var(--j);opacity:.75}.jl{fill:var(--text);opacity:.6}.jt{fill:color-mix(in srgb,var(--j) 60%,var(--text));opacity:.7}` +
      `.sway{animation:sway 6s steps(2,jump-none) infinite alternate}@keyframes sway{from{transform:translateX(-2px)}to{transform:translateX(2px)}}` +
      `.swim{animation:swim 90s steps(550) infinite}@keyframes swim{from{transform:translateX(-300px)}to{transform:translateX(1900px)}}` +
      `.bob{animation:bob 4s steps(2,jump-none) infinite alternate}@keyframes bob{from{transform:translateY(0)}to{transform:translateY(${P}px)}}` +
      `.drift{animation:drift 100s steps(275) infinite}@keyframes drift{from{transform:translateY(${FLOOR}px)}to{transform:translateY(-200px)}}` +
      `.pulse{animation:pulse 5s steps(2,jump-none) infinite alternate}@keyframes pulse{from{transform:translateY(0)}to{transform:translateY(-${P}px)}}` +
      `.rise{animation:rise 20s steps(${Math.round((FLOOR - 60) / P)}) infinite}@keyframes rise{from{transform:translateY(${FLOOR - 40}px)}to{transform:translateY(20px)}}` +
      `.wob{fill:var(--text);opacity:.5;animation:wob 3s steps(2,jump-none) infinite alternate}@keyframes wob{from{transform:translateX(0)}to{transform:translateX(${P}px)}}`,
    body:
      water +
      `<path class="surf" d="${surf}"/>` +
      `<g class="rays">${rays}</g><path class="motes" d="${motes}"/>` +
      `<g>${jellies}</g><g>${bubbles}</g><g>${fish}</g>` + rocks +
      `<path class="sand" d="${sand}"/>` +
      ([[1, 75], [4, 50], [5, 25], [12, 50], [13, 25], [24, 25]] as const).map(([dy, p]) => `<use href="#se" y="${dy * P}" fill="url(#sd${p})"/>`).join('') +
      `<g class="pools">${pools}</g>${shells}` +
      reef,
  })
}

/** Dream valley: a valley in small square pixels. A ringed sun sets behind glowing, scalloped hills and rises again, a
 * ringed moon hangs opposite, rimmed clouds drift, a luminous river winds up the valley past stones and flowers, spruce stand
 * on the far ridges, mushrooms glow at the sides with motes rising round them, stars come out at night. */
const valley = (theme: Theme, moving: boolean): string => {
  const rand = seeded(377)
  const P = 4, HZ = 560, SECS = 150
  const side = (x: number) => Math.max(Math.exp(-(((x - 150) / 360) ** 2)), Math.exp(-(((x - 1450) / 360) ** 2)))
  const snap = (v: number) => Math.round(v / P) * P
  const run = (x: number, y: number, w: number, h = P) => `M${x} ${y}h${w}v${h}h${-w}z`

  // the sky: vivid bands from a deep top to a hot horizon, each dithered into the one below in three steps
  const SKY = [
    'color-mix(in srgb,var(--ground) 82%,var(--w2))',
    'color-mix(in srgb,var(--ground) 68%,var(--w2))',
    'color-mix(in srgb,var(--ground) 52%,var(--w2))',
    'color-mix(in srgb,var(--ground) 38%,color-mix(in srgb,var(--w2) 60%,var(--w3)))',
    'color-mix(in srgb,var(--ground) 26%,color-mix(in srgb,var(--w2) 30%,var(--w3)))',
    'color-mix(in srgb,var(--ground) 16%,var(--w3))',
    'color-mix(in srgb,var(--ground) 10%,color-mix(in srgb,var(--w3) 50%,var(--w0)))',
    'color-mix(in srgb,var(--ground) 4%,var(--w0))',
  ]
  const tall = (HZ - 80) / (SKY.length - 1)
  let sky = '', tiles = ''
  SKY.forEach((_, i) => {
    const y = i === 0 ? -400 : Math.round(80 + (i - 1) * tall)
    sky += `<rect class="k${i}" x="-400" y="${y}" width="${W + 800}" height="${(i === 0 ? 480 : Math.ceil(tall)) + 1}"/>`
    if (i > 0) sky += [75, 50, 25].map((p, k) => `<rect x="-400" y="${y + k * 3 * P}" width="${W + 800}" height="${3 * P}" fill="url(#d${i - 1}${p})"/>`).join('')
    tiles += ditherTiles(`d${i}`, `k${i}`, P)
  })
  for (const t of ['sun', 'ring', 'riv', 'rim1', 'rim2', 'rim3', 'cl']) tiles += ditherTiles(t, t === 'sun' ? 'sunc' : t, P)
  // scallops: rows of little domes, the texture of the hills
  tiles += `<pattern id="scale" width="${8 * P}" height="${6 * P}" patternUnits="userSpaceOnUse"><path d="M0 ${2 * P}h${P}v-${P}h${P}v-${P}h${2 * P}v${P}h${P}v${P}h${P}v${P}h-${6 * P}zM${4 * P} ${5 * P}h${P}v-${P}h${P}v-${P}h${2 * P}v${P}h${P}v${P}h${-5 * P}z" fill="#fff"/></pattern>`

  // small sprites, drawn once: a grass tuft, a flower, a spruce, a little mushroom
  const sprites =
    `<path id="tuft" d="${pixelPath(['#.#..#', '#.#.#.', '.###..', '..#...'], '#', P)}"/>` +
    `<g id="flower"><path class="fs" d="${pixelPath(['......', '..#...', '..#...', '.##...'], '#', P)}"/><path d="${pixelPath(['.#.', '#.#', '.#.'], '#', P, P, -2 * P)}"/></g>` +
    `<path id="spruce" d="${pixelPath(['...#...', '..###..', '...#...', '..###..', '.#####.', '..###..', '.#####.', '#######', '...#...'], '#', P)}"/>` +
    `<g id="tiny"><path class="st" d="${pixelPath(['.....', '..#..', '..#..', '..#..'], '#', P, 0, 2 * P)}"/><path d="${pixelPath(['.###.', '#####', '#.#.#'], '#', P)}"/></g>`

  // stars, some of them crosses that slowly brighten and fade
  let stars = '', sparks = ''
  for (let i = 0; i < 220; i++) { const big = rand() < 0.12 ? 2 : 1; stars += run(snap(rand() * (W + 200) - 100), snap(rand() * 400 - 40), P * big, P * big) }
  for (let i = 0; i < 14; i++) {
    const x = snap(rand() * W), y = snap(rand() * 330), a = rand() < 0.4 ? 2 : 1
    sparks += `<path d="${run(x, y - a * P, P, a * P)}${run(x - a * P, y, (2 * a + 1) * P)}${run(x, y + P, P, a * P)}" style="animation-duration:${n1(5 + rand() * 4)}s;animation-delay:-${n1(rand() * 9)}s"/>`
  }

  // the sun in rings of dither; a moon with craters and a band; a small planet low down
  const SX = 1264, SY = 250
  const sun =
    `<g class="sun"><path fill="url(#ring25)" d="${pixelDisc(SX, SY, 38, P)}"/><path fill="url(#ring50)" d="${pixelDisc(SX, SY, 32, P)}"/><path fill="url(#sun75)" d="${pixelDisc(SX, SY, 27, P)}"/>` +
    `<path class="sunc" d="${pixelDisc(SX, SY, 23, P)}"/><path class="sunr" d="${pixelDisc(SX, SY, 19, P)}"/><path class="sunc" d="${pixelDisc(SX, SY, 16, P)}"/><path class="sunh" d="${pixelDisc(SX - 6 * P, SY - 6 * P, 6, P)}${pixelDisc(SX - 10 * P, SY - 1 * P, 2, P)}"/></g>`
  const MX = 296, MY = 168
  let craters = ''
  for (const [dx, dy, r] of [[-4, -3, 3], [3, 2, 2], [-5, 4, 2], [5, -5, 1], [0, 7, 1]] as const) craters += pixelDisc(MX + dx * P, MY + dy * P, r, P)
  const moon =
    `<g class="moon"><path class="band" d="${run(MX - 26 * P, MY - P, 52 * P, 2 * P)}"/><path class="mo" d="${pixelDisc(MX, MY, 13, P)}"/><path class="mc" d="${craters}"/>` +
    `<path class="mh" d="${pixelDisc(MX - 4 * P, MY - 5 * P, 3, P)}"/><path class="band" d="${run(MX - 26 * P, MY + P, 18 * P, P)}${run(MX + 9 * P, MY + P, 17 * P, P)}"/></g>` +
    `<path class="orb" d="${pixelDisc(486, 486, 7, P)}"/><path class="mh" d="${pixelDisc(478, 478, 2, P)}"/>`

  // clouds: round bumps on a flat base, rimmed in a bright colour along the top with a dithered glow under it,
  // a second colour along the base
  const cloud = (cx: number, cy: number, w: number, rows: number) => {
    const bumps = [[-0.6 * w, 0.55 * rows], [-0.25 * w, 0.9 * rows], [0.12 * w, 0.7 * rows], [0.38 * w + rand() * 3, 0.85 * rows], [0.7 * w, 0.45 * rows]]
    let body = '', lit = '', glow = '', shade = ''
    for (let c = Math.round(-w * 1.3); c <= Math.round(w * 1.3); c++) {
      let top = rows
      for (const [bx, r] of bumps) { const dx = (c - bx) / 1.3; if (Math.abs(dx) < r) top = Math.min(top, Math.round(rows - Math.sqrt(r * r - dx * dx))) }
      if (top >= rows - 2) continue
      const x = cx + c * P
      body += run(x, cy + top * P, P, (rows - top) * P)
      lit += run(x, cy + top * P, P, 2 * P)
      glow += run(x, cy + (top + 2) * P, P, 3 * P)
      shade += run(x, cy + (rows - 2) * P, P, 2 * P)
    }
    return `<path class="cb" d="${body}"/><path fill="url(#cl50)" d="${glow}"/><path class="cl" d="${lit}"/><path class="cs" d="${shade}"/>`
  }
  let clouds = ''
  for (const [y, w, rows, far] of [[60, 20, 10, 1], [140, 32, 14, 0], [240, 16, 8, 1], [310, 36, 16, 0], [410, 18, 8, 1], [450, 26, 12, 0]] as const) {
    const secs = far ? 560 : 400, at = rand()
    clouds += `<g class="drift${far ? ' far' : ''}" style="transform:translateX(${snap(-500 + 2600 * at)}px);animation-duration:${secs}s;animation-delay:-${Math.round(at * secs)}s">${cloud(0, y, w, rows)}</g>`
  }

  // hills in steps: each has a glowing rim, contour bands down its slope that follow the rim, and scallops
  let hillDefs = ''
  const hills = (n: number, cls: string, rim: string, base: number, low: number, high: number, step: number, seed: number) => {
    const r = seeded(seed), tops: [number, number][] = []
    let d = `M-400 ${H + 40}V${base}`, edge = '', wob = 0
    for (let x = -400; x < W + 400; x += step) {
      wob = Math.max(-1, Math.min(1, wob + (r() - 0.5) * 0.9))
      const top = base - snap(low + (high - low) * side(x + step / 2) + wob * 28)
      tops.push([x, top])
      d += `V${top}h${step}`
      edge += run(x, top, step)
    }
    hillDefs += `<path id="hb${n}" d="${d}V${H + 40}Z"/><path id="he${n}" d="${edge}"/>`
    const at = (x: number): number => (tops.find(([tx]) => tx + step > x) ?? tops[tops.length - 1]!)[1]
    const drawn =
      `<use href="#hb${n}" class="${cls}"/><use href="#hb${n}" fill="url(#scale)" class="scl"/>` +
      `<use href="#he${n}" y="${P}" fill="url(#${rim}75)"/><use href="#he${n}" y="${2 * P}" fill="url(#${rim}50)"/><use href="#he${n}" y="${3 * P}" fill="url(#${rim}25)"/>` +
      ([[9, 50, 0.7], [10, 25, 0.7], [18, 50, 0.5], [19, 25, 0.5], [30, 25, 0.4], [46, 25, 0.3]] as const).map(([dy, p, o]) => `<use href="#he${n}" y="${dy * P}" fill="url(#${rim}${p})" opacity="${o}"/>`).join('') +
      `<use href="#he${n}" class="${rim}"/>`
    return { drawn, at }
  }

  const back = hills(0, 'h0', 'rim2', HZ + 8, 4, 250, 3 * P, 5)
  const mid = hills(1, 'h1', 'rim1', HZ + 130, 0, 230, 4 * P, 6)
  const near = hills(2, 'h2', 'rim3', H + 30, -200, 260, 5 * P, 7)

  // spruce along the far ridge, where it rises clear of the nearer range
  let trees = ''
  for (let x = -60; x < W + 60; x += snap(14 + rand() * 30)) {
    const top = back.at(x)
    if (top > HZ - 20 || mid.at(x) < top + 40) continue
    trees += `<use href="#spruce" x="${x}" y="${top - 8 * P + snap(rand() * 3 * P)}" class="tree"/>`
  }

  // the river winds up the valley to the horizon: glowing water, dithered banks, stones, glints that come and go
  let river = '', banks = '', glints = '', stones = '', flowers = ''
  for (let y = HZ + P, i = 0; y < H + 40; y += P, i++) {
    const t = (y - HZ) / (H - HZ), cx = 800 + 170 * Math.sin(t * 7.2 + 0.6) * t + 60 * Math.sin(t * 3.1)
    const half = snap(4 + 190 * t ** 1.6), x = snap(cx)
    river += run(x - half, y, 2 * half)
    banks += run(x - half - 3 * P, y, 3 * P) + run(x + half, y, 3 * P)
    if (rand() < 0.3) glints += `<path d="${run(snap(x - half + rand() * 2 * half), y, P * (1 + Math.round(rand() * 3)))}" style="animation-duration:${n1(6 + rand() * 5)}s;animation-delay:-${n1(rand() * 11)}s"/>`
    if (t > 0.3 && i % 9 === 0 && rand() < 0.6) stones += pixelDisc(snap(x - half * 0.7 + rand() * half * 1.4), y, Math.round(1 + t * 3), P)
    if (t > 0.15 && i % 3 === 0) {
      const bank = rand() < 0.5 ? x - half - snap(8 + rand() * 60 * t) - 6 * P : x + half + snap(8 + rand() * 60 * t)
      flowers += rand() < 0.45 ? `<use href="#flower" x="${bank}" y="${y - 2 * P}" class="c${Math.floor(rand() * 4)}"/>` : `<use href="#tuft" x="${bank}" y="${y - 2 * P}" class="tu"/>`
    }
  }

  // mushrooms at either side: domed caps with spots and a pale rim, glowing gills, stems; little ones around them;
  // motes of light drifting up past them
  let shrooms = '', motes = ''
  const cap = (x: number, top: number, r: number, c: number) => {
    let body = '', rim = '', spots = ''
    for (let j = 0; j < r; j++) {
      const half = Math.round(r * Math.sqrt(1 - ((r - j - 0.5) / r) ** 2) * 1.25)
      body += run(x - half * P, top - (r - j) * P, 2 * half * P)
      if (j >= r - 2) rim += run(x - half * P, top - (r - j) * P, 2 * half * P)
    }
    for (let k = 0; k < r / 1.6; k++) spots += pixelDisc(snap(x + (rand() - 0.5) * r * 1.6 * P), snap(top - (2 + rand() * (r - 4)) * P), 1 + Math.round(rand() * 2), P)
    return `<path class="cap c${c}" d="${body}"/><path fill="url(#rim150)" d="${rim}"/><path class="sp" d="${spots}"/>`
  }
  for (const [x, h, r, c] of [[64, 150, 22, 2], [196, 96, 14, 0], [292, 64, 10, 3], [352, 40, 6, 1], [1240, 36, 6, 1], [1300, 70, 10, 0], [1416, 122, 18, 3], [1544, 170, 24, 2]] as const) {
    const base = H - snap(20 + rand() * 30), top = base - h, stem = Math.max(2, Math.round(r / 4)), gills = snap(r * 1.25 * P)
    shrooms +=
      `<path class="st" d="${run(x - stem * P, top, 2 * stem * P, base - top)}"/><path class="sts" d="${run(x + (stem - 1) * P, top + 2 * P, P, base - top - 2 * P)}"/>` +
      `<path class="gl" d="${run(x - gills + P, top, 2 * gills - 2 * P, 2 * P)}"/><path fill="url(#riv50)" d="${run(x - gills + 3 * P, top + 2 * P, 2 * gills - 6 * P, 2 * P)}"/>` +
      cap(x, top, r, c)
    for (let k = 0; k < 3; k++) shrooms += `<use href="#tiny" x="${snap(x - 30 + rand() * 60 + (k - 1) * r * 3)}" y="${base - 5 * P + snap(rand() * 12)}" class="c${(c + k + 1) % 4}"/>`
    for (let k = 0; k < 3; k++) {
      const secs = Math.round(14 + rand() * 10)
      motes += `<path d="${run(snap(x - r * P + rand() * 2 * r * P), top, P, P)}" style="animation-duration:${secs}s;animation-delay:-${n1(rand() * secs)}s"/>`
    }
  }
  let tufts = ''
  for (let i = 0; i < 46; i++) tufts += `<use href="#tuft" x="${snap(rand() < 0.5 ? rand() * 420 : W - rand() * 420)}" y="${snap(H - 10 - rand() * 120)}" class="tu"/>`

  return shell(theme, moving, {
    tune: '--night:.4',
    defs: tiles + sprites + hillDefs,
    css:
      SKY.map((c, i) => `.k${i}{fill:${c}}`).join('') +
      `.sunc{fill:color-mix(in srgb,var(--w0) 70%,var(--text))}.sunr{fill:var(--w0)}.ring{fill:var(--w1)}.sunh{fill:var(--text);opacity:.5}` +
      `.sun{animation:sun ${SECS}s steps(80) infinite alternate}@keyframes sun{to{transform:translateY(${80 * P}px)}}` +
      `.mo{fill:color-mix(in srgb,var(--w1) 45%,var(--text))}.mc{fill:color-mix(in srgb,var(--w1) 70%,var(--ground))}.mh{fill:var(--text);opacity:.6}.band{fill:var(--w3);opacity:.8}` +
      `.orb{fill:color-mix(in srgb,var(--w2) 60%,var(--w0))}` +
      `.stars{fill:var(--text);opacity:.3;animation:stars ${SECS}s linear infinite alternate}@keyframes stars{50%{opacity:.3}to{opacity:.9}}` +
      `.sparks path{fill:var(--text);opacity:.3;animation:spark 6s ease-in-out infinite alternate}@keyframes spark{to{opacity:.9}}` +
      `.cb{fill:color-mix(in srgb,var(--ground) 35%,var(--w2))}.cl{fill:var(--w0)}.cs{fill:var(--w1)}.far{opacity:.6}` +
      `.drift{animation:drift 400s steps(650) infinite}@keyframes drift{from{transform:translateX(-500px)}to{transform:translateX(2100px)}}` +
      `.h0{fill:color-mix(in srgb,var(--ground) 45%,var(--w2))}.h1{fill:color-mix(in srgb,var(--ground) 55%,var(--w1))}.h2{fill:color-mix(in srgb,var(--ground) 55%,var(--w3))}.scl{opacity:.07}` +
      `.rim1{fill:var(--w0)}.rim2{fill:color-mix(in srgb,var(--w1) 70%,var(--text))}.rim3{fill:color-mix(in srgb,var(--w2) 60%,var(--text))}` +
      `.tree{fill:color-mix(in srgb,var(--ground) 70%,var(--w2))}` +
      `.riv{fill:var(--w1)}.river{fill:color-mix(in srgb,var(--w0) 65%,var(--text))}.stones{fill:color-mix(in srgb,var(--w1) 50%,var(--ground))}` +
      `.glints path{fill:var(--text);opacity:.15;animation:glint 8s ease-in-out infinite alternate}@keyframes glint{to{opacity:.7}}` +
      `.fs{fill:color-mix(in srgb,var(--ground) 40%,var(--w1))}.tu{fill:color-mix(in srgb,var(--w1) 60%,var(--text))}` +
      `.st{fill:color-mix(in srgb,var(--text) 75%,var(--w1))}.sts{fill:color-mix(in srgb,var(--text) 40%,var(--w1))}.gl{fill:var(--w1)}.sp{fill:var(--text);opacity:.85}` +
      `.motes path{fill:var(--text);opacity:0;animation:mote 18s linear infinite}@keyframes mote{0%{opacity:0;transform:translateY(0)}20%{opacity:.8}100%{opacity:0;transform:translateY(-160px)}}` +
      `.dark{fill:var(--ground);opacity:0;animation:dark ${SECS}s linear infinite alternate}@keyframes dark{45%{opacity:0}to{opacity:var(--night)}}`,
    body:
      // night darkens the sky behind the stars, then the land: the back range's outline covers it all
      sky + moon + sun + clouds +
      `<rect class="dark" x="-400" y="-400" width="${W + 800}" height="${H + 800}"/>` +
      `<path class="stars" d="${stars}"/><g class="sparks">${sparks}</g>` +
      back.drawn + trees + mid.drawn +
      `<path fill="url(#riv50)" d="${banks}"/><path class="river" d="${river}"/><path class="stones" d="${stones}"/><g class="glints">${glints}</g>${flowers}` +
      near.drawn + tufts + shrooms + `<g class="motes">${motes}</g>` +
      `<use href="#hb0" class="dark"/>`,
  })
}

export const SCENERY: Readonly<Record<Scenery, (theme: Theme, moving: boolean) => string>> = { grid, sunset, city, plotter, weave, flock, nebula, ridges, circuit, tunnel, borealis, kaleidoscope, aquarium, valley }
export const SCENERIES: readonly Scenery[] = ['grid', 'sunset', 'city', 'plotter', 'weave', 'flock', 'nebula', 'ridges', 'circuit', 'tunnel', 'borealis', 'kaleidoscope', 'aquarium', 'valley']
