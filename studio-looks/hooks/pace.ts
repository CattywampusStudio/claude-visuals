// How fast a background moves. Every scene times its motion in CSS seconds (durations and delays, in its <style> and
// in style="" attributes), so a speed is those seconds divided by it: the same picture, the whole of it faster or slower.

import type { Speed } from '../types'

/** The steps the speed bar moves through, slowest first. 1 is each scene as drawn. */
export const SPEEDS: readonly Speed[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5]

const NAMES: Record<Speed, string> = { 0.25: '¼×', 0.5: '½×', 0.75: '¾×', 1: '1×', 1.25: '1¼×', 1.5: '1½×' }
export const speedName = (s: Speed): string => NAMES[s]

/** Any stored number as the nearest step. */
export const toSpeed = (raw: unknown): Speed => {
  const n = typeof raw === 'number' && Number.isFinite(raw) ? raw : 1
  return SPEEDS.reduce<Speed>((best, s) => (Math.abs(s - n) < Math.abs(best - n) ? s : best), 1)
}

// Backgrounds that fail, or come close to failing, the app's flash check above some speed play no faster than this, in
// light mode the worst: tunnel's rings pass the same spot too often at 1½×, and the flock crossing the window nears the limit.
const FASTEST: Partial<Record<string, Speed>> = { tunnel: 1.25, flock: 1.25 }
/** The speed a background actually plays at. */
export const speedFor = (kind: string, s: Speed): Speed => Math.min(s, FASTEST[kind] ?? s) as Speed

/** The step before or after, held at the ends. */
export const stepSpeed = (s: Speed, by: number): Speed => SPEEDS[Math.max(0, Math.min(SPEEDS.length - 1, SPEEDS.indexOf(s) + by))]!

// a time in seconds: not part of a name (".s0", "shear0"), not followed by more of a word
const SECONDS = /(?<![\w.#-])(-?\d*\.?\d+)s(?![\w-])/g
const scale = (css: string, by: number) => css.replace(SECONDS, (_, n: string) => `${+(Number(n) / by).toFixed(3)}s`)

/** The scene with its motion played at this speed. */
export const paced = (svg: string, speed: Speed): string =>
  speed === 1
    ? svg
    : svg
        .replace(/<style>([\s\S]*?)<\/style>/g, (_, css: string) => `<style>${scale(css, speed)}</style>`)
        .replace(/ style="([^"]*)"/g, (_, css: string) => ` style="${scale(css, speed)}"`)
