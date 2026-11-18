import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, RenderChildren, ThemeSetArgs } from 'claude-code'

import type { Background, BarStyle, Card, Choice, Decisions, Job, Motion, Plan, Replies, StepsView, Veil } from '../types'
import { jobMark, preview, themedBar } from './bar.ts'
import { colorsFor } from './look.ts'
import { SPEEDS, paced, speedFor, speedName, stepSpeed, toSpeed } from './pace.ts'
import { KINDS, backdrop } from './scene.ts'
import { THEMES } from './themes.ts'
import type { Theme } from './themes.ts'

const ME = 'studio-looks'
const PANE = 'studio-looks'
const TITLE = 'Looks'
// Both lists are shown in alphabetical order, so a new theme or background finds its own place; "Colours only" stays last.
const byLabel = (a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label)
const ORDERED: readonly Theme[] = [...THEMES].sort(byLabel)
const BACKGROUNDS: readonly { value: Background; label: string }[] = ([
  { value: 'lamp', label: 'Lava lamp' },
  { value: 'soft', label: 'Soft glows' },
  { value: 'pixels', label: 'Dissolving pixels' },
  { value: 'rain', label: 'Falling symbols' },
  { value: 'grid', label: 'Grid horizon' },
  { value: 'sunset', label: 'Banded sunset' },
  { value: 'city', label: 'Night city' },
  { value: 'plotter', label: 'Plotter proof' },
  { value: 'weave', label: 'Loom' },
  { value: 'flock', label: 'Murmuration' },
  { value: 'nebula', label: 'Nebula' },
  { value: 'ridges', label: 'Signal ridges' },
  { value: 'circuit', label: 'Circuit traces' },
  { value: 'tunnel', label: 'Vector tunnel' },
  { value: 'borealis', label: 'Northern lights' },
  { value: 'kaleidoscope', label: 'Kaleidoscope' },
  { value: 'aquarium', label: 'Pixel aquarium' },
  { value: 'valley', label: 'Dream valley' },
] as { value: Background; label: string }[]).sort(byLabel).concat({ value: 'plain', label: 'Colours only' })
// What each drawn background shows, for the picture's description.
const SHOWS: Record<Exclude<Background, 'plain'>, string> = {
  lamp: "lava lamp wax in the theme's colours",
  soft: "soft glows in the theme's colours",
  pixels: "squares in the theme's colours",
  rain: "columns of symbols in the theme's colours",
  grid: 'a floor grid running to a slotted sun on the horizon',
  sunset: 'a banded sun setting into water between islands with palms',
  city: 'a city of towers at night with lit windows, neon signs and rain',
  plotter: 'blocks being hatched line by line, as a pen plotter draws',
  weave: 'a dotted cloth being woven row by row',
  flock: 'flocks of square pixels streaming and turning together over a treeline',
  nebula: 'clouds of colour along a band of stars',
  ridges: 'stacked rows of a trace with peaks that swell and sink',
  circuit: 'a circuit board of chips with pulses running along its traces',
  tunnel: 'frames of light coming toward you down a square tunnel',
  borealis: 'curtains of northern lights over a frozen lake between snowy mountains',
  kaleidoscope: 'shapes drifting through a kaleidoscope, mirrored twelve times into a slowly turning mandala',
  aquarium: 'a vivid pixel reef: striped fish and glowing jellyfish over coral, sea fans, anemones and kelp',
  valley: 'a vivid pixel valley: a ringed sun setting behind glowing hills, a winding river and mushrooms',
}
// Backgrounds of fine lines or small squares, and backgrounds that are pictures: each kind gets its own lightest veil.
const FINE: readonly Background[] = ['pixels', 'plotter', 'weave', 'flock', 'ridges', 'circuit']
const DRAWN: readonly Background[] = ['rain', 'grid', 'sunset', 'city', 'nebula', 'tunnel', 'borealis', 'kaleidoscope', 'aquarium', 'valley']
const BARS: readonly { value: BarStyle; label: string }[] = [
  { value: 'lava', label: 'Matches the background' },
  { value: 'native', label: "The app's own" },
  { value: 'off', label: 'Off' },
]
const MOTIONS: readonly { value: Motion; label: string }[] = [
  { value: 'on', label: 'On' },
  { value: 'off', label: 'Off (a still picture)' },
]
const REPLIES: readonly { value: Replies; label: string }[] = [
  { value: 'bubble', label: 'In a bubble' },
  { value: 'plain', label: 'On the background' },
]
const VEILS: readonly { value: Veil; label: string }[] = [
  { value: 'light', label: 'Light: the background shows through' },
  { value: 'medium', label: 'Medium' },
  { value: 'strong', label: 'Strong' },
  { value: 'solid', label: 'Solid: no background behind the conversation' },
]
const DECISIONS: readonly { value: Decisions; label: string }[] = [
  { value: 'mod', label: 'Solid, above the message box' },
  { value: 'app', label: "The app's own only" },
]
const STEPS: readonly { value: StepsView; label: string }[] = [
  { value: 'list', label: 'Every step, listed under the bar' },
  { value: 'line', label: 'Only the step under way' },
]
const FIRST: Choice = { theme: 'neon-arcade', background: 'lamp', bar: 'lava', motion: 'on', replies: 'bubble', veil: 'medium', decisions: 'mod', steps: 'list', speed: 1 }

const choice = atom({ plugin: 'studio-looks', key: 'choice' } as const, FIRST, { shape: 'choice-9' })
const card = atom({ plugin: 'studio-looks', key: 'card' } as const, null as Card | null, { shape: 'card-1' })
// true after "/looks off", until the next pick: the app is back to its own look, so nothing of this mod's is drawn on it
const cleared = atom({ plugin: 'studio-looks', key: 'isCleared' } as const, false)
const browse = atom({ plugin: 'studio-looks', key: 'browse' } as const, FIRST.theme)
const plan = atom({ plugin: 'studio-looks', key: 'plan' } as const, null as Plan | null, { shape: 'plan-1' })
// work running apart from the conversation: commands in the background, subagents, sessions this one started
const jobs = atom({ plugin: 'studio-looks', key: 'jobs' } as const, [] as Job[], { shape: 'jobs-1' })

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
    replies: REPLIES.find(b => b.value === r.replies)?.value ?? FIRST.replies,
    veil: VEILS.find(b => b.value === r.veil)?.value ?? FIRST.veil,
    decisions: DECISIONS.find(b => b.value === r.decisions)?.value ?? FIRST.decisions,
    steps: STEPS.find(b => b.value === r.steps)?.value ?? FIRST.steps,
    speed: toSpeed(r.speed),
  }
}

// The scene's name carries the background, the motion, the speed in hundredths and the theme ("lamp_on_100_neon-arcade"),
// so the drawing hook needs no stored value.
const look = (c: Choice): ThemeSetArgs => {
  const colors = colorsFor(themeOf(c.theme)).theme
  // tint left out: the panels keep the look's own surface colour in each mode.
  // The lamp is big soft shapes and takes heavy frosting; squares and symbols are fine detail that
  // frosting wipes out (seen in the app: the pixels were very faint), so their panels are clearer and barely blurred.
  // The blur is never 0: read in the app's own styles, panels with no blur are tinted at 70% or more whatever
  // opacity is asked for, and seen in the app that left only a faint glow of the background.
  // The drawn scenes are line work too: the pictures keep a little blur, the fine-lined ones almost none.
  const fine = FINE.includes(c.background)
  const drawn = DRAWN.includes(c.background)
  const light = fine ? { blur: 3, opacity: c.background === 'pixels' ? 0.32 : 0.4 } : drawn ? { blur: 6, opacity: 0.45 } : { blur: 18, opacity: 0.55 }
  // Read in the app's styles: behind the conversation column the app lays a veil of the panel colour whose
  // strength is this opacity, and it draws its own cards there (the summary and next steps, tool cards) with no
  // ground of their own. So a card is only as readable as the veil is strong; a mod cannot draw on those cards.
  const strength = { medium: 0.72, strong: 0.88, solid: 1 } as const
  const glass = c.veil === 'light' ? light : { blur: Math.max(light.blur, c.veil === 'medium' ? 8 : 14), opacity: strength[c.veil] }
  return c.background === 'plain' ? { colors, overrideColorScheme: 'dark' } : { colors, overrideColorScheme: 'dark', backdrop: { scene: `${c.background}_${c.motion}_${Math.round(c.speed * 100)}_${c.theme}`, glass } }
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

/** Every step done but the last, which is under way. */
const lastOnly = (steps: Steps): boolean =>
  steps.length > 0 && steps.at(-1)?.status === 'in_progress' && steps.slice(0, -1).every(s => s.status === 'completed')

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

const short = (text: string, most: number) => {
  const one = text.replace(/\s+/g, ' ').trim()
  return one.length > most ? `${one.slice(0, most - 1)}…` : one
}

/**
 * The background work a tool call started, read from what the tool answered: a command the Bash tool moved to the
 * background, or another session the app started for this one. Null for every other call.
 */
const startedBy = (tool: string, args: Record<string, unknown>, result: unknown): Job | null => {
  const r = (result ?? {}) as Record<string, unknown>
  if (tool === 'Bash' && typeof r.backgroundTaskId === 'string') {
    return { id: r.backgroundTaskId, kind: 'command', label: short(String(args.description ?? args.command ?? 'Command'), 40), status: 'running' }
  }
  if (tool.endsWith('__start_session') && args.initiation !== 'own_initiative' && args.initiation !== 'offer') {
    const id = /local_[A-Za-z0-9-]+/.exec(JSON.stringify(result ?? ''))?.[0]
    return id === undefined ? null : { id, kind: 'session', label: short(String(args.title ?? 'Session'), 40), status: 'running' }
  }
  return null
}

const ENDINGS: Record<string, Job['status']> = { completed: 'done', failed: 'failed', killed: 'stopped', stopped: 'stopped' }

/** The list after a notice that names a job: the job it names has ended, the way the notice says. */
const ended = (now: Job[], notice: string): Job[] => {
  const word = /<status>\s*([a-z_]+)/i.exec(notice)?.[1]?.toLowerCase() ?? 'completed'
  return now.map(job => (job.status === 'running' && notice.includes(job.id) ? { ...job, status: ENDINGS[word] ?? 'done' } : job))
}

/** One more job, newest last; the list keeps the eight newest. */
const withJob = (now: Job[], job: Job): Job[] => [...now.filter(j => j.id !== job.id), job].slice(-8)

const JOB_WORDS: Record<Job['status'], string> = { running: 'running', done: 'done', failed: 'failed', stopped: 'stopped' }
const JOB_SIGNS: Record<Job['status'], string> = { running: '◐', done: '✓', failed: '✕', stopped: '■' }
const STEP_SIGNS: Record<Steps[number]['status'], string> = { completed: '✓', in_progress: '▸', pending: '·' }

// The app's own actions on its card (commit, open a pull request) are the app's to run. Here the ones that
// are also something to ask Claude for become a reply in words; the two that only the app can do are left out.
const ACTION_WORDS: Record<string, string> = {
  commit: 'Commit this',
  create_pr: 'Create a pull request',
  merge: 'Merge it',
  fix_ci: 'Fix CI',
  address_comments: 'Address the comments',
  resolve_conflicts: 'Resolve the conflicts',
  verify: 'Verify it',
}

/** The question a turn's wrap-up call ends on, or null when it asks nothing. */
const cardOf = (args: Record<string, unknown>): Card | null => {
  const ask = typeof args.ask === 'string' ? args.ask.trim() : ''
  if (ask === '') return null
  const answers = (Array.isArray(args.actions) ? args.actions : [])
    .map(one => {
      const o = (one ?? {}) as { label?: unknown; action?: unknown }
      return typeof o.action === 'string' ? (ACTION_WORDS[o.action] ?? '') : typeof o.label === 'string' ? o.label.trim() : ''
    })
    .filter(label => label !== '')
    .slice(0, 2)
  return { recap: typeof args.recap === 'string' ? args.recap.trim() : '', ask, answers }
}

/** A press on one of the card's answers: the card goes, and the answer is sent as the person's own words. */
const answer = async ($: EngineInterface, label: string) => {
  await update($, card, () => null)
  await $.prompt.submit({ text: label, asUser: true })
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
// A pick changes only what it names: a new theme recolours the background in use, it does not swap it.
const pick = async ($: EngineInterface, patch: Partial<Choice>) => {
  await update($, choice, c => ({ ...c, ...patch }))
  await update($, cleared, () => false)
  if (patch.theme !== undefined) {
    const picked = patch.theme
    await update($, browse, () => picked)
  }
  const now = await read($, choice)
  await $.store.set('choice', now)
  if (patch.theme !== undefined || patch.background !== undefined || patch.motion !== undefined || patch.veil !== undefined || patch.speed !== undefined) {
    const unpainted = colorsFor(themeOf(now.theme)).problems.find(line => line.startsWith("Desktop won't paint"))
    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    // One set names the whole look, so it replaces the one before with no clear in between.
    await $.theme.set(look(now))
  }
  return now
}

/** The speed bar's buttons: a step slower or faster, read at the press and not at the draw. */
const slower = async ($: EngineInterface) => pick($, { speed: stepSpeed((await read($, choice)).speed, -1) })
const faster = async ($: EngineInterface) => pick($, { speed: stepSpeed((await read($, choice)).speed, 1) })

/** The picker's arrows: the preview moves to the theme before or after, wrapping round. */
const stepBrowse = ($: EngineInterface, by: number) =>
  update($, browse, id => {
    const at = Math.max(0, ORDERED.findIndex(t => t.id === id))
    return ORDERED[(at + by + ORDERED.length) % ORDERED.length]!.id
  })

/** Applies the theme the preview shows, read at the press and not at the draw. */
const useBrowsed = async ($: EngineInterface) => {
  const id = await read($, browse)
  await pick($, { theme: themeOf(id).id })
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'looks', description: 'Pick the app look: theme, background and progress bar', argumentHint: '[theme] [lamp|soft|pixels|rain|grid|sunset|city|plotter|weave|flock|nebula|ridges|circuit|tunnel|borealis|kaleidoscope|aquarium|valley|plain] [off]' })
    const stored = mend(await $.store.get('choice'))
    await update($, choice, () => stored)
    await update($, cleared, () => false)
    await update($, browse, () => stored.theme)
    const made = colorsFor(themeOf(stored.theme))
    const unpainted = made.problems.find(line => line.startsWith("Desktop won't paint"))
    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    // In a terminal nothing draws the look; the theme still stands for a desktop surface that attaches later,
    // so there is nothing to tell the person.
    await $.theme.set(look(stored))
    void $.ui.open({ id: PANE, title: TITLE })

    return next(e)
  })

  on('command.run', { command: 'looks' }, async ($, e) => {
    const words = e.args.toLowerCase().split(/\s+/).filter(Boolean)
    if (words.includes('off')) {
      await update($, cleared, () => true)
      await $.theme.clear()
      return { text: 'Look cleared: the app is back to its own colours. Pick again in the Looks pane or with /looks.' }
    }
    const background = BACKGROUNDS.find(b => words.includes(b.value))
    // a word that names a background is that background, not the start of a theme's name ("sunset" is not Sunset Blocks)
    const named = THEMES.find(t => words.some(w => t.id === w || (!BACKGROUNDS.some(b => b.value === w) && (t.id.startsWith(w) || t.label.toLowerCase().startsWith(w)))))
    const patch: Partial<Choice> = { ...(named ? { theme: named.id } : {}), ...(background ? { background: background.value } : {}) }
    const now = Object.keys(patch).length > 0 ? await pick($, patch) : await read($, choice)
    await $.ui.open({ id: PANE, title: TITLE })

    return { text: `Look: ${themeOf(now.theme).label}, ${BACKGROUNDS.find(b => b.value === now.background)?.label ?? now.background}. Themes: ${ORDERED.map(t => t.id).join(', ')}.` }
  })

  // The task list, as the session's task-list tools report it.
  on('tool.call', async ($, e, next) => {
    const tool: string = e.tool
    if (tool === 'TodoWrite' || tool.endsWith('__update_plan') || tool.endsWith('__wrap_up')) {
      const args = e as unknown as Record<string, unknown>
      await update($, plan, now => heard(tool, args, now))
      if (tool.endsWith('__wrap_up')) {
        const asked = cardOf(args)
        await update($, card, () => asked)
      }

      return next(e)
    }
    if (tool !== 'Bash' && tool !== 'TaskStop' && !tool.endsWith('__start_session')) {
      return next(e)
    }
    // background work is known only by what the tool answers
    const args = e as unknown as Record<string, unknown>
    const out = await next(e)
    const answered = (out as { result?: unknown }).result
    const job = startedBy(tool, args, answered)
    if (job !== null) {
      await update($, jobs, now => withJob(now, job))
    }
    if (tool === 'TaskStop' && answered !== undefined) {
      const id = String(args.task_id ?? args.shell_id ?? '')
      await update($, jobs, now => now.map(j => (j.id === id && j.status === 'running' ? { ...j, status: 'stopped' as const } : j)))
    }

    return out
  })

  // A subagent is a job from its start to the end of its run.
  on('agent.spawn', async ($, e, next) => {
    const out = await next(e)
    const id = (out as { agentId?: unknown }).agentId
    if (typeof id === 'string') {
      const label = short(String((e as { description?: unknown }).description ?? 'Agent'), 40)
      await update($, jobs, now => withJob(now, { id, kind: 'agent', label, status: 'running' }))
    }

    return out
  })

  on('turn.complete', async ($, e, next) => {
    const id = e.agentId
    if (id !== undefined) {
      const how = e.isAborted ? 'stopped' : 'done'
      await update($, jobs, now => now.map(j => (j.id === id && j.status === 'running' ? { ...j, status: how as Job['status'] } : j)))
    }
    // The app checks off a list's last step itself when the turn ends normally, and no tool call says so.
    if (id === undefined && !e.isAborted) {
      await update($, plan, now => (now !== null && lastOnly(now.steps) ? { steps: now.steps.map(s => ({ ...s, status: 'completed' as const })) } : now))
    }

    return next(e)
  })

  // A finished list leaves with the next prompt; an unfinished one stays for the work to go on.
  on('prompt.submit', async ($, e, next) => {
    const from = (e.origin as { kind?: string } | undefined)?.kind
    if (from !== 'composer' && from !== 'bridge') {
      // a notice from the app: a background command or another session reporting back
      await update($, jobs, now => ended(now, e.text))
    }
    if (from === 'task-notification') {
      return next(e)
    }
    // the person has seen which jobs ended; only the running ones stay
    if (from === 'composer' || from === 'bridge') {
      await update($, jobs, now => now.filter(j => j.status === 'running'))
    }
    await update($, plan, now => (now && now.steps.every(s => s.status === 'completed') ? null : now))
    // a new message answers or passes over whatever was asked
    await update($, card, () => null)

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.props.plugin !== ME || (e.surface !== 'desktop' && e.surface !== 'mobile')) {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)
    const [head, motion, ...rest] = e.props.scene.split('_')
    const kind = KINDS.find(k => k === head) ?? 'lamp'
    // a name from before the speed was kept has none: as drawn
    const speed = rest.length > 1 && /^\d+$/.test(rest[0] ?? '') ? toSpeed(Number(rest.shift()) / 100) : 1
    const theme = themeOf(rest.join('_'))
    const isMoving = motion !== 'off'
    const pace = speedFor(kind, speed)
    const source = isMoving ? paced(backdrop(theme, kind, true, pace), pace) : backdrop(theme, kind, false)

    return <Svg source={source} alt={`${theme.label}: ${SHOWS[kind]}, ${isMoving ? 'slowly moving' : 'still'}`} isInteractive />
  })

  // Claude's replies over a drawn background. The app's veil behind the conversation is only a tint, so on a
  // busy scene a reply can still be hard to read. Here each reply goes on a panel in the theme's surface colour,
  // the one your own messages sit on. The app's own drawing of the reply is kept inside it.
  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    const row = await next(e)
    const c = await read($, choice)
    const isOff = await read($, cleared)
    if (e.surface !== 'desktop' || isOff || c.replies !== 'bubble' || c.background === 'plain') {
      return row
    }
    const { Box } = $.ui.resolve(e)

    return (
      <Box borderStyle="round" borderDimColor backgroundColor="userMessageBackground">
        {row}
      </Box>
    )
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const c = await read($, choice)
    const list = await read($, plan)
    const asked = await read($, card)
    const isOff = await read($, cleared)
    const running = await read($, jobs)
    const { Box, Text, Button, Progress } = $.ui.resolve(e)
    const theme = themeOf(c.theme)
    // the terminal draws no pictures: there a job's mark is a sign in text
    const Mark = e.surface === 'terminal' ? null : $.ui.resolve(e).Svg
    // the small button that opens the picker: always at the right end of the band's first row, working or not
    const looks = <Button key="looks" label="Looks" plain dimColor onPress={() => void $.ui.open({ id: PANE, title: TITLE })} />
    const topRow = (left: RenderChildren) => (
      <Box flexDirection="row" gap="sm" alignItems="center" justifyContent="space-between">
        {left}
        {looks}
      </Box>
    )
    // Work running apart from the conversation, three at most with the newest last: a mark in the theme's colours,
    // what it is, and how it stands. Ended ones stay until the person's next message.
    const shown = running.slice(-3)
    const jobsRow =
      shown.length === 0 || isOff ? null : (
        <Box key="jobs" flexDirection="row" gap="md" alignItems="center">
          <Text dimColor size="caption">
            {running.length > shown.length ? `Background (${running.length})` : 'Background'}
          </Text>
          {shown.map(job => (
            <Box key={`job-${job.id}`} flexDirection="row" gap="xs" alignItems="center">
              {Mark ? <Mark source={jobMark(theme, job.status)} alt={JOB_WORDS[job.status]} /> : <Text>{JOB_SIGNS[job.status]}</Text>}
              <Text size="caption" dimColor={job.status !== 'running'}>
                {job.label} · {JOB_WORDS[job.status]}
              </Text>
            </Box>
          ))}
        </Box>
      )
    // The question the turn ended on, on a solid panel. The app draws its own such card in the conversation with
    // no ground of its own over a background, and a mod cannot draw on that one, so this one stands above the prompt.
    if (asked !== null && !e.props.hasSurvey && !e.props.isWorking && !isOff && c.decisions === 'mod' && e.surface !== 'terminal') {
      // the summary goes in when the band has the rows for it; the question and its answers always do
      const columns = Math.max(20, e.props.bodyColumns)
      const rowsFor = (text: string) => Math.ceil(text.length / columns)
      const hasRecap = asked.recap !== '' && rowsFor(asked.recap) + rowsFor(asked.ask) + 4 + (jobsRow ? 1 : 0) <= e.props.maxRows

      const first = asked.answers[0] ?? 'OK'
      const second = asked.answers[1] ?? 'Not now'
      const question = <Text bold>{asked.ask}</Text>
      const answers = topRow(
        <Box flexDirection="row" gap="sm" alignItems="center">
          <Button key="answer-0" label={first} variant="primary" onPress={() => void answer($, first)} />
          <Button key="answer-1" label={second} variant="secondary" onPress={() => void answer($, second)} />
          <Button key="dismiss" label="Dismiss" plain dimColor onPress={() => void update($, card, () => null)} />
        </Box>,
      )

      return (
        <Box flexDirection="column" gap="sm" borderStyle="round" borderDimColor backgroundColor="userMessageBackground">
          {hasRecap ? <Text dimColor>{asked.recap}</Text> : null}
          {question}
          {answers}
          {jobsRow}
        </Box>
      )
    }
    if (e.props.hasSurvey || c.bar === 'off') {
      return next(e)
    }
    if (list === null && !e.props.isWorking) {
      return (
        <Box flexDirection="column" gap="xs">
          {topRow(
            <Text dimColor size="caption">
              {theme.label}
            </Text>,
          )}
          {jobsRow}
        </Box>
      )
    }
    const total = list ? list.steps.length : 0
    const done = list ? list.steps.filter(s => s.status === 'completed').length : 0
    const current = list?.steps.find(s => s.status === 'in_progress')
    const label = list === null ? 'Working' : done >= total ? `All ${total} steps done` : current ? `Step ${done + 1} of ${total}: ${current.content}` : `${done} of ${total} steps done`
    // Every step on a line of its own, when asked for and the band has the rows. A list too long for the band
    // shows the stretch around the step under way, and says how many it leaves out.
    const room = e.props.maxRows - 3 - (jobsRow ? 1 : 0)
    const steps = list === null || c.steps !== 'list' || room < 2 ? [] : list.steps
    const span = steps.length <= room ? steps.length : room - 1
    const at = Math.max(0, steps.findIndex(s => s.status !== 'completed'))
    const from = Math.max(0, Math.min(at - 1, steps.length - span))
    const stepsList =
      steps.length === 0 ? null : (
        <Box key="steps" flexDirection="column">
          {steps.slice(from, from + span).map((step, i) => (
            <Text key={`step-${from + i}`} size="caption" bold={step.status === 'in_progress'} dimColor={step.status !== 'in_progress'}>
              {STEP_SIGNS[step.status]} {step.content}
            </Text>
          ))}
          {span < steps.length ? (
            <Text key="step-more" size="caption" dimColor>
              and {steps.length - span} more
            </Text>
          ) : null}
        </Box>
      )

    if (c.bar === 'native' || e.surface === 'terminal') {
      return (
        <Box flexDirection="column" gap="xs">
          {list === null ? <Progress label={label} /> : <Progress label={label} value={done} max={total} valueText={`${done} of ${total}`} color={e.surface === 'terminal' ? undefined : theme.colors.accent} />}
          {stepsList}
          {jobsRow}
          {looks}
        </Box>
      )
    }
    const { Svg } = $.ui.resolve(e)
    // a step under way counts as half done, so the tube moves when work starts and again when it lands
    const fraction = list === null ? null : (done + (current ? 0.5 : 0)) / total

    return (
      <Box flexDirection="column" gap="xs">
        {topRow(
          <Text dimColor size="caption">
            {label}
          </Text>,
        )}
        <Svg source={themedBar(theme, c.background, fraction)} alt={list === null ? 'Working, no known end' : `${done} of ${total} steps done`} />
        {stepsList}
        {jobsRow}
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const c = await read($, choice)
    const theme = themeOf(c.theme)
    const shown = themeOf(await read($, browse))
    const at = ORDERED.findIndex(t => t.id === shown.id)
    if (e.surface === 'terminal') {
      const { Box, Text } = $.ui.resolve(e)

      return (
        <Box flexDirection="column">
          <Text>Look: {theme.label}. The terminal draws no look; open this session in the desktop app.</Text>
        </Box>
      )
    }
    const { Box, Text, Select, Button, Svg, Progress } = $.ui.resolve(e)

    return (
      <Box flexDirection="column" gap="md">
        <Text dimColor size="caption">
          Browse the themes with the arrows, then apply the one you like. A theme changes the colours; the background, motion and bar stay as you set them below. Your pick is kept for your next session.
        </Text>
        <Svg source={preview(shown, c.background)} alt={`Preview of ${shown.label}: the app's page, panels, text, accent and progress bar in this theme's colours, over the background in use`} />
        <Text>
          {shown.label} · {at + 1} of {ORDERED.length}
          {shown.id === theme.id ? ' · in use' : ''}
        </Text>
        <Box flexDirection="row" gap="sm">
          <Button key="prev" label="‹ Previous" onPress={() => void stepBrowse($, -1)} />
          <Button key="next" label="Next ›" onPress={() => void stepBrowse($, 1)} />
          <Button key="use" label={shown.id === theme.id ? 'In use' : 'Use this theme'} variant={shown.id === theme.id ? 'secondary' : 'primary'} onPress={() => void useBrowsed($)} />
        </Box>
        <Select key="theme" label="Theme" value={c.theme} options={ORDERED.map(t => ({ value: t.id, label: t.label }))} onSelect={value => void pick($, { theme: themeOf(value).id })} />
        <Select key="background" label="Background" value={c.background} options={BACKGROUNDS} onSelect={value => void pick($, { background: mend({ background: value }).background })} />
        <Select key="motion" label="Motion in the background" value={c.motion} options={MOTIONS} onSelect={value => void pick($, { motion: mend({ motion: value }).motion })} />
        <Box flexDirection="row" gap="sm">
          <Button key="slower" label="−" variant="secondary" onPress={() => void slower($)} />
          <Progress label="Animation speed" value={SPEEDS.indexOf(c.speed) + 1} max={SPEEDS.length} valueText={speedName(c.speed)} color={theme.colors.accent} />
          <Button key="faster" label="+" variant="secondary" onPress={() => void faster($)} />
        </Box>
        <Text dimColor size="caption">
          The app plays a moving background only while it is safe and cheap to draw, and follows its own Motion setting. Speed changes how fast it moves, from a quarter to one and a half times as drawn (Vector tunnel and Murmuration stop at one and a quarter).
        </Text>
        <Select key="replies" label="Claude's replies" value={c.replies} options={REPLIES} onSelect={value => void pick($, { replies: mend({ replies: value }).replies })} />
        <Text dimColor size="caption">
          Over a background, a reply sits on a panel in the theme's own surface colour, as your messages do, so the words stay readable. Colours only needs none.
        </Text>
        <Select key="veil" label="Behind the conversation" value={c.veil} options={VEILS} onSelect={value => void pick($, { veil: mend({ veil: value }).veil })} />
        <Text dimColor size="caption">
          How strongly the app tints the conversation column over the background. The app's own cards, such as the summary and next steps, get no panel of their own and a mod cannot give them one, so this is what makes them readable. Solid leaves the background at the sides only.
        </Text>
        <Select key="decisions" label="Decision card" value={c.decisions} options={DECISIONS} onSelect={value => void pick($, { decisions: mend({ decisions: value }).decisions })} />
        <Text dimColor size="caption">
          When Claude ends a turn with a question, this mod can show it on a solid panel above the message box, with its answers as buttons. The app also draws its own card in the conversation; turn that one off under Settings, "Summary and next steps", to see one only.
        </Text>
        <Select key="bar" label="Progress bar" value={c.bar} options={BARS} onSelect={value => void pick($, { bar: mend({ bar: value }).bar })} />
        <Text dimColor size="caption">
          The bar sits above the message box and follows the task list while Claude works. Press below to try it without waiting.
        </Text>
        <Button key="demo" label="Try the bar: next step" onPress={() => void update($, plan, demoNext)} />
        <Select key="steps" label="Steps in the bar" value={c.steps} options={STEPS} onSelect={value => void pick($, { steps: mend({ steps: value }).steps })} />
        <Text dimColor size="caption">
          The bar can list every step of the task list, ticking each off, or name only the one under way. Work running in the background (a long command, a subagent, another session) gets a row of its own with a mark for running, done, failed or stopped.
        </Text>
      </Box>
    )
  })
}
