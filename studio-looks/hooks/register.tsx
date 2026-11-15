import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import type { Background, BarStyle, Choice, Motion, Plan } from '../types'
import { preview, themedBar } from './bar.ts'
import { colorsFor } from './look.ts'
import { KINDS, backdrop } from './scene.ts'
import { THEMES } from './themes.ts'
import type { Theme } from './themes.ts'

const ME = 'studio-looks'
const PANE = 'studio-looks'
const TITLE = 'Looks'
const BACKGROUNDS: readonly { value: Background; label: string }[] = [
  { value: 'lamp', label: 'Lava lamp' },
  { value: 'soft', label: 'Soft glows' },
  { value: 'pixels', label: 'Dissolving pixels' },
  { value: 'rain', label: 'Falling symbols' },
  { value: 'plain', label: 'Colours only' },
]
const BARS: readonly { value: BarStyle; label: string }[] = [
  { value: 'lava', label: 'Matches the background' },
  { value: 'native', label: "The app's own" },
  { value: 'off', label: 'Off' },
]
const MOTIONS: readonly { value: Motion; label: string }[] = [
  { value: 'on', label: 'On' },
  { value: 'off', label: 'Off (a still picture)' },
]
const FIRST: Choice = { theme: 'neon-arcade', background: 'lamp', bar: 'lava', motion: 'on' }

const choice = atom({ plugin: 'studio-looks', key: 'choice' } as const, FIRST, { shape: 'choice-4' })
const browse = atom({ plugin: 'studio-looks', key: 'browse' } as const, FIRST.theme)
const plan = atom({ plugin: 'studio-looks', key: 'plan' } as const, null as Plan | null, { shape: 'plan-1' })

const themeOf = (id: string): Theme => THEMES.find(t => t.id === id) ?? THEMES[0]!

/** Whatever was stored, made into a choice this version understands. */
const mend = (raw: unknown): Choice => {
  const r = (raw ?? {}) as Partial<Record<keyof Choice, unknown>>
  // an earlier version kept "Lamp, still" as a background of its own: it is the lamp with motion off
  const wasStill = r.background === 'still'
  return {
    theme: themeOf(String(r.theme ?? FIRST.theme)).id,
    background: wasStill ? 'lamp' : (BACKGROUNDS.find(b => b.value === r.background)?.value ?? FIRST.background),
    bar: BARS.find(b => b.value === r.bar)?.value ?? FIRST.bar,
    motion: wasStill ? 'off' : (MOTIONS.find(b => b.value === r.motion)?.value ?? FIRST.motion),
  }
}

// The scene's name carries the background, the motion and the theme ("lamp_on_neon-arcade"), so the drawing hook needs no stored value.
const look = (c: Choice): ThemeSetArgs => {
  const colors = colorsFor(themeOf(c.theme)).theme
  // tint left out: the panels keep the look's own surface colour in each mode.
  // The lamp is big soft shapes and takes heavy frosting; squares and symbols are fine detail that
  // frosting wipes out (seen in the app: the pixels were very faint), so their panels are clearer and barely blurred.
  // The blur is never 0: read in the app's own styles, panels with no blur are tinted at 70% or more whatever
  // opacity is asked for, and seen in the app that left only a faint glow of the background.
  const glass = c.background === 'pixels' ? { blur: 3, opacity: 0.32 } : c.background === 'rain' ? { blur: 6, opacity: 0.45 } : { blur: 18, opacity: 0.55 }
  return c.background === 'plain' ? { colors } : { colors, backdrop: { scene: `${c.background}_${c.motion}_${c.theme}`, glass } }
}

type Steps = Plan['steps']
const STATUSES = ['pending', 'in_progress', 'completed'] as const

/** A task list from a tool call's `items` or `todos`, or null when it is not one. */
const stepsOf = (raw: unknown): Steps | null => {
  if (!Array.isArray(raw) || raw.length === 0) return null
  return raw.map(one => {
    const o = (one ?? {}) as { content?: unknown; status?: unknown }
    return { content: String(o.content ?? ''), status: STATUSES.find(s => s === o.status) ?? 'pending' }
  })
}

/** The task list after one task-list tool call. */
const heard = (tool: string, args: Record<string, unknown>, now: Plan | null): Plan | null => {
  if (tool === 'TodoWrite') {
    const steps = stepsOf(args.todos)
    return steps ? { steps } : now
  }
  if (tool.endsWith('__wrap_up')) {
    return now ? { steps: now.steps.map(s => ({ ...s, status: 'completed' as const })) } : now
  }
  if (!tool.endsWith('__update_plan')) return now
  const fresh = stepsOf(args.items)
  if (fresh) return { steps: fresh }
  if (!now) return now
  let steps = now.steps
  if (args.advance === true) {
    const at = steps.findIndex(s => s.status === 'in_progress')
    const next = steps.findIndex((s, i) => i > at && s.status === 'pending')
    steps = steps.map((s, i) => (i === at ? { ...s, status: 'completed' as const } : i === next ? { ...s, status: 'in_progress' as const } : s))
  }
  if (Array.isArray(args.done)) {
    const done = args.done.map(Number)
    steps = steps.map((s, i) => (done.includes(i + 1) ? { ...s, status: 'completed' as const } : s))
  }
  if (typeof args.start === 'number') {
    const start = args.start
    steps = steps.map((s, i) => (i + 1 === start ? { ...s, status: 'in_progress' as const } : s))
  }
  return { steps }
}

const DEMO = ['Read the brief', 'Mix the wax', 'Light the lamp', 'Watch it rise']
/** The picker's try-out button: a made-up list that moves one step per press, then clears. */
const demoNext = (now: Plan | null): Plan | null => {
  const done = now ? now.steps.filter(s => s.status === 'completed').length : -1
  if (!now || now.steps.length !== DEMO.length || now.steps.some((s, i) => s.content !== DEMO[i])) {
    return { steps: DEMO.map((content, i) => ({ content, status: i === 0 ? ('in_progress' as const) : ('pending' as const) })) }
  }
  if (done >= DEMO.length) return null
  return { steps: DEMO.map((content, i) => ({ content, status: i <= done ? ('completed' as const) : i === done + 1 ? ('in_progress' as const) : ('pending' as const) })) }
}

// One place changes the look: the pickers and the command both come here.
const pick = async ($: EngineInterface, asked: Partial<Choice>) => {
  // a theme opens with its own background, unless the same pick names one
  const patch: Partial<Choice> = asked.theme !== undefined && asked.background === undefined ? { ...asked, background: mend({ background: themeOf(asked.theme).background }).background } : asked
  await update($, choice, c => ({ ...c, ...patch }))
  if (patch.theme !== undefined) {
    const picked = patch.theme
    await update($, browse, () => picked)
  }
  const now = await read($, choice)
  await $.store.set('choice', now)
  if (patch.theme !== undefined || patch.background !== undefined || patch.motion !== undefined) {
    const unpainted = colorsFor(themeOf(now.theme)).problems.find(line => line.startsWith("Desktop won't paint"))
    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    // One set names the whole look, so it replaces the one before with no clear in between.
    await $.theme.set(look(now))
  }
  return now
}

/** The picker's arrows: the preview moves to the theme before or after, wrapping round. */
const stepBrowse = ($: EngineInterface, by: number) =>
  update($, browse, id => {
    const at = Math.max(0, THEMES.findIndex(t => t.id === id))
    return THEMES[(at + by + THEMES.length) % THEMES.length]!.id
  })

/** Applies the theme the preview shows, read at the press and not at the draw. */
const useBrowsed = async ($: EngineInterface) => {
  const id = await read($, browse)
  await pick($, { theme: themeOf(id).id })
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'looks', description: 'Pick the app look: theme, background and progress bar', argumentHint: '[theme] [lamp|soft|pixels|rain|plain] [off]' })
    const stored = mend(await $.store.get('choice'))
    await update($, choice, () => stored)
    await update($, browse, () => stored.theme)
    const made = colorsFor(themeOf(stored.theme))
    const unpainted = made.problems.find(line => line.startsWith("Desktop won't paint"))
    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    const set = await $.theme.set(look(stored))
    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }
    void $.ui.open({ id: PANE, title: TITLE })

    return next(e)
  })

  on('command.run', { command: 'looks' }, async ($, e) => {
    const words = e.args.toLowerCase().split(/\s+/).filter(Boolean)
    if (words.includes('off')) {
      await $.theme.clear()
      return { text: 'Look cleared: the app is back to its own colours. Pick again in the Looks pane or with /looks.' }
    }
    const named = THEMES.find(t => words.some(w => t.id === w || t.id.startsWith(w) || t.label.toLowerCase().startsWith(w)))
    const background = BACKGROUNDS.find(b => words.includes(b.value))
    const patch: Partial<Choice> = { ...(named ? { theme: named.id } : {}), ...(background ? { background: background.value } : {}) }
    const now = Object.keys(patch).length > 0 ? await pick($, patch) : await read($, choice)
    await $.ui.open({ id: PANE, title: TITLE })

    return { text: `Look: ${themeOf(now.theme).label}, ${BACKGROUNDS.find(b => b.value === now.background)?.label ?? now.background}. Themes: ${THEMES.map(t => t.id).join(', ')}.` }
  })

  // The task list, as the session's task-list tools report it.
  on('tool.call', async ($, e, next) => {
    const tool: string = e.tool
    if (tool === 'TodoWrite' || tool.endsWith('__update_plan') || tool.endsWith('__wrap_up')) {
      const args = e as unknown as Record<string, unknown>
      await update($, plan, now => heard(tool, args, now))
    }

    return next(e)
  })

  // A finished list leaves with the next prompt; an unfinished one stays for the work to go on.
  on('prompt.submit', async ($, e, next) => {
    await update($, plan, now => (now && now.steps.every(s => s.status === 'completed') ? null : now))

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.props.plugin !== ME || (e.surface !== 'desktop' && e.surface !== 'mobile')) {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)
    const [head, motion, ...rest] = e.props.scene.split('_')
    const kind = KINDS.find(k => k === head) ?? 'lamp'
    const theme = themeOf(rest.join('_'))
    const isMoving = motion !== 'off'
    const what = kind === 'pixels' ? "squares in the theme's colours" : kind === 'rain' ? "columns of symbols in the theme's colours" : "lava lamp wax in the theme's colours"

    return <Svg source={backdrop(theme, kind, isMoving)} alt={`${theme.label}: ${what}, ${isMoving ? 'slowly moving' : 'still'}`} isInteractive />
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const c = await read($, choice)
    const list = await read($, plan)
    if (e.props.hasSurvey || c.bar === 'off') {
      return next(e)
    }
    const { Box, Text, Button, Progress } = $.ui.resolve(e)
    const theme = themeOf(c.theme)
    // the small button that opens the picker; it stays when no work is running, so the picker is always one press away
    const looks = <Button key="looks" label="Looks" plain dimColor onPress={() => void $.ui.open({ id: PANE, title: TITLE })} />
    if (list === null && !e.props.isWorking) {
      return (
        <Box flexDirection="row" gap="sm" alignItems="center">
          <Text dimColor size="caption">
            {theme.label}
          </Text>
          {looks}
        </Box>
      )
    }
    const total = list ? list.steps.length : 0
    const done = list ? list.steps.filter(s => s.status === 'completed').length : 0
    const current = list?.steps.find(s => s.status === 'in_progress')
    const label = list === null ? 'Working' : done >= total ? `All ${total} steps done` : current ? `Step ${done + 1} of ${total}: ${current.content}` : `${done} of ${total} steps done`

    if (c.bar === 'native' || e.surface === 'terminal') {
      return (
        <Box flexDirection="column" gap="xs">
          {list === null ? <Progress label={label} /> : <Progress label={label} value={done} max={total} valueText={`${done} of ${total}`} color={e.surface === 'terminal' ? undefined : theme.dark.accent} />}
          {looks}
        </Box>
      )
    }
    const { Svg } = $.ui.resolve(e)
    // a step under way counts as half done, so the tube moves when work starts and again when it lands
    const fraction = list === null ? null : (done + (current ? 0.5 : 0)) / total

    return (
      <Box flexDirection="column" gap="xs">
        <Box flexDirection="row" gap="sm" alignItems="center">
          <Text dimColor size="caption">
            {label}
          </Text>
          {looks}
        </Box>
        <Svg source={themedBar(theme, c.background, fraction)} alt={list === null ? 'Working, no known end' : `${done} of ${total} steps done`} />
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const c = await read($, choice)
    const theme = themeOf(c.theme)
    const shown = themeOf(await read($, browse))
    const at = THEMES.findIndex(t => t.id === shown.id)
    if (e.surface === 'terminal') {
      const { Box, Text } = $.ui.resolve(e)

      return (
        <Box flexDirection="column">
          <Text>Look: {theme.label}. The terminal draws no look; open this session in the desktop app.</Text>
        </Box>
      )
    }
    const { Box, Text, Select, Button, Svg } = $.ui.resolve(e)

    return (
      <Box flexDirection="column" gap="md">
        <Text dimColor size="caption">
          Browse the themes with the arrows, then apply the one you like. A theme opens with its own background; change it below. Your pick is kept for your next session.
        </Text>
        <Svg source={preview(shown)} alt={`Preview of ${shown.label}: the app's page, panels, text, accent and progress bar in this theme's colours`} />
        <Text>
          {shown.label} · {at + 1} of {THEMES.length}
          {shown.id === theme.id ? ' · in use' : ''}
        </Text>
        <Box flexDirection="row" gap="sm">
          <Button key="prev" label="‹ Previous" onPress={() => void stepBrowse($, -1)} />
          <Button key="next" label="Next ›" onPress={() => void stepBrowse($, 1)} />
          <Button key="use" label={shown.id === theme.id ? 'In use' : 'Use this theme'} variant={shown.id === theme.id ? 'secondary' : 'primary'} onPress={() => void useBrowsed($)} />
        </Box>
        <Select key="theme" label="Theme" value={c.theme} options={THEMES.map(t => ({ value: t.id, label: t.label }))} onSelect={value => void pick($, { theme: themeOf(value).id })} />
        <Select key="background" label="Background" value={c.background} options={BACKGROUNDS} onSelect={value => void pick($, { background: mend({ background: value }).background })} />
        <Select key="motion" label="Motion in the background" value={c.motion} options={MOTIONS} onSelect={value => void pick($, { motion: mend({ motion: value }).motion })} />
        <Text dimColor size="caption">
          The app plays a moving background only while it is safe and cheap to draw, and follows its own Motion setting.
        </Text>
        <Select key="bar" label="Progress bar" value={c.bar} options={BARS} onSelect={value => void pick($, { bar: mend({ bar: value }).bar })} />
        <Text dimColor size="caption">
          The bar sits above the message box and follows the task list while Claude works. Press below to try it without waiting.
        </Text>
        <Button key="demo" label="Try the bar: next step" onPress={() => void update($, plan, demoNext)} />
      </Box>
    )
  })
}
