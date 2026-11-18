import { expect, test } from 'claude-code/testing'

import { jobMark, preview, themedBar } from './bar.ts'
import { paced, speedFor } from './pace.ts'
import { KINDS, backdrop } from './scene.ts'
import { colorsFor } from './look.ts'
import { THEMES } from './themes.ts'

const BAND = {
  plugin: 'studio-looks',
  component: 'AbovePrompt',
  requestId: 'above-prompt',
  props: { hasSurvey: false, isCollapsed: false, isWorking: true, maxRows: 10, bodyColumns: 80, scroll: { offset: 0, bodyRows: 10 }, view: {} },
} as const

const PANE = {
  plugin: 'studio-looks',
  component: 'Pane',
  requestId: 'studio-looks',
  props: { title: 'Looks', isFocused: false, bodyColumns: 40, placement: 'dock', scroll: { offset: 0, bodyRows: 20 }, view: {} },
} as const

// `scenes` collects the scene of every look the mod sets, in order ("pixels_on_dusk"), or "none" for colours only.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const engine = (on: Parameters<Extract<Parameters<typeof test>[1], (...args: any) => any>>[1], scenes: string[] = [], veils: number[] = [], answers: (tool: string) => object = () => ({}), schemes: string[] = []) => {
  on('command.register', () => ({ value: { command: 'looks' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('theme.set', (_, e) => {
    schemes.push((e as { overrideColorScheme?: string }).overrideColorScheme ?? 'none')
    scenes.push((e as { backdrop?: { scene?: string } }).backdrop?.scene ?? 'none')
    veils.push((e as { backdrop?: { glass?: { opacity?: number } } }).backdrop?.glass?.opacity ?? -1)
    return { value: { isDrawn: true, requestId: 'backdrop' } }
  })
  on('store.get', () => ({ value: undefined }))
  on('store.set', () => ({ value: undefined }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('tool.call', (_, e) => ({ result: answers(e.tool) }))
  on('turn.complete', (_, e) => ({ text: e.answer }))
}

// The desktop app only animates a background whose SVG its player accepts; anything else it draws still, with
// no error. These lists are the player's own, read from the app's interface code on 2026-11-17: the SVG elements
// it takes, the CSS functions and at-rules it knows, and what it refuses outright (a backslash, data:, url() to
// anything but #id, prefers-color-scheme outside a plain "(prefers-color-scheme: dark)" or ": light" test).
const ELEMENTS = new Set(
  'animate animateMotion animateTransform set circle clipPath defs desc ellipse feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDisplacementMap feDropShadow feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feMerge feMergeNode feMorphology feOffset feTurbulence filter g line linearGradient marker mask mpath path pattern polygon polyline radialGradient rect stop style svg symbol text textPath title tspan use'.split(' '),
)
const FUNCTIONS = new Set(
  'alpha color color-mix contrast-color dynamic-range-limit-mix hsl hsla hwb lab lch light-dark oklab oklch palette-mix rgb rgba -webkit-calc abs acos add anchor anchor-size asin atan atan2 calc calc-size clamp cos exp fit-content hypot log max min minmax mod pow progress rem repeat round sibling-count sibling-index sign sin sqrt superellipse tan env if var anchored at-rule font-format font-tech media named-feature scroll-state selector style supports circle ellipse inset path polygon ray rect shape xywh -webkit-gradient -webkit-linear-gradient -webkit-radial-gradient -webkit-repeating-linear-gradient -webkit-repeating-radial-gradient color-stop conic-gradient from linear-gradient radial-gradient repeating-conic-gradient repeating-linear-gradient repeating-radial-gradient to matrix matrix3d perspective rotate rotate3d rotatex rotatey rotatez scale scale3d scalex scaley scalez skew skewx skewy translate translate3d translatex translatey translatez accesskey cubic-bezier linear scroll steps view wallclock blur brightness contrast drop-shadow grayscale hue-rotate invert opacity saturate sepia annotation character-variant counter counters ornaments styleset stylistic swash -webkit-any active-view-transition-type cue dir has highlight host host-context is lang not nth-child nth-last-child nth-last-of-type nth-of-type part picker scroll-button slotted state view-transition-group view-transition-group-children view-transition-image-pair view-transition-new view-transition-old where'.split(' '),
)
const AT_RULES = new Set('-webkit-keyframes charset container counter-style keyframes layer media page position-try property scope starting-style supports view-transition'.split(' '))
/** What in a scene the player would refuse: elements off its list, functions or at-rules it does not know, things it bans outright. */
const refused = (svg: string): string[] => {
  // what is drawn as words (the symbols of the rain, a label) is not CSS and is not checked
  const code = svg.replace(/>[^<]*</g, (text, at: number) => (svg.slice(0, at).endsWith('<style') || /<style[^>]*$/.test(svg.slice(0, at + 1)) ? text : '><'))
  const elements = [...svg.matchAll(/<([A-Za-z][\w-]*)/g)].map(m => m[1] ?? '').filter(name => !ELEMENTS.has(name))
  const functions = [...code.matchAll(/([^\s()[\]{}<>;:,.'"`=+*/!@#$%^&|~?]{0,64})\(/g)].map(m => (m[1] ?? '').toLowerCase()).filter(name => name !== '' && name !== 'url' && !FUNCTIONS.has(name))
  const atRules = [...code.matchAll(/@([^\s{};("'/]*)/g)].map(m => (m[1] ?? '').toLowerCase()).filter(name => !AT_RULES.has(name))
  const flat = code.replace(/\s/g, '').toLowerCase()
  const banned = [
    ...(code.includes('\\') ? ['\\'] : []),
    ...(flat.includes('data:') ? ['data:'] : []),
    ...(/url\(/.test(code.replace(/url\(\s*(["']?)#[A-Za-z_][\w.:-]*\1\s*\)/gi, '').replace(/\s/g, '').toLowerCase()) ? ['url() to more than #id'] : []),
    ...(/prefers-color-scheme/i.test(code.replace(/\(\s*prefers-color-scheme(?:\s*:\s*(?:dark|light))?\s*\)/gi, '')) ? ['prefers-color-scheme in another form'] : []),
  ]
  return [...new Set([...elements, ...functions.map(name => `${name}()`), ...atRules.map(name => `@${name}`), ...banned])]
}

test('every scene keeps to what the app will animate', async () => {
  for (const theme of THEMES) {
    for (const kind of KINDS) {
      for (const moving of [true, false]) {
        const svg = backdrop(theme, kind, moving)
        expect(refused(svg)).toEqual([])
      }
    }
  }
  // the check does catch what the app refuses
  expect(refused('<svg><foreignObject/><style>@import "a.css";a{fill:url(b.svg#c);background:element(#d)}@media (prefers-color-scheme: dim){}</style></svg>')).toEqual(['foreignObject', 'element()', '@import', 'url() to more than #id', 'prefers-color-scheme in another form'])
})

// Every theme is dark only: the app is held in dark mode whatever its own setting, so no picture carries light colours.
test('every look is dark only, and the app paints it', async ($, on) => {
  for (const theme of THEMES) {
    const made = colorsFor(theme)
    expect(made.problems.filter(line => line.startsWith("Desktop won't paint"))).toEqual([])
    expect(Object.keys(made.theme.inputs)).toEqual(['dark'])
    for (const kind of KINDS) {
      for (const svg of [backdrop(theme, kind, true), preview(theme, kind), themedBar(theme, kind, 0.5)]) expect(svg).not.toMatch(/prefers-color-scheme/)
    }
  }
  const schemes: string[] = []
  engine(on, [], [], () => ({}), schemes)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.ui.mount({ ...PANE, surface: 'desktop' })
  await $.ui.select({ plugin: 'studio-looks', key: 'background', value: 'plain' })
  await $.ui.select({ plugin: 'studio-looks', key: 'background', value: 'borealis' })
  expect(schemes.length).toBeGreaterThan(0)
  expect(schemes.every(s => s === 'dark')).toBe(true)
})

// The app takes an Svg of at most 131072 characters and draws nothing at all for a longer one: no background, and
// no Looks pane, since the pane's preview picture holds the whole scene.
test('every picture the mod draws is short enough for the app to take', async () => {
  const MOST = 131072
  for (const theme of THEMES) {
    for (const kind of KINDS) {
      for (const moving of [true, false]) expect(backdrop(theme, kind, moving).length).toBeLessThanOrEqual(MOST)
      expect(preview(theme, kind).length).toBeLessThanOrEqual(MOST)
      expect(themedBar(theme, kind, 0.5).length).toBeLessThanOrEqual(MOST)
    }
  }
})

test('a drawn scene is picked in the pane or by its name, and keeps its lines clear', async ($, on) => {
  const scenes: string[] = []
  const veils: number[] = []
  engine(on, scenes, veils)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })

  await $.ui.select({ plugin: 'studio-looks', key: 'background', value: 'grid' })
  expect(scenes.at(-1)).toBe('grid_on_100_neon-arcade')
  await $.ui.select({ plugin: 'studio-looks', key: 'veil', value: 'light' })
  expect(veils.at(-1)).toBe(0.45)
  await $.ui.select({ plugin: 'studio-looks', key: 'background', value: 'plotter' })
  expect(veils.at(-1)).toBe(0.4)

  // "sunset" is the background of that name, not the theme whose name starts with it
  await $.command.run({ command: 'looks', args: 'sunset' })
  expect(scenes.at(-1)).toBe('sunset_on_100_neon-arcade')
  await $.command.run({ command: 'looks', args: 'retro-sunset city' })
  expect(scenes.at(-1)).toBe('city_on_100_retro-sunset')

  // the second set is picked the same way: a picture by name, and a fine-lined one keeps the lightest veil
  await $.command.run({ command: 'looks', args: 'nebula' })
  expect(scenes.at(-1)).toBe('nebula_on_100_retro-sunset')
  expect(veils.at(-1)).toBe(0.45)
  await $.ui.select({ plugin: 'studio-looks', key: 'background', value: 'circuit' })
  expect(scenes.at(-1)).toBe('circuit_on_100_retro-sunset')
  expect(veils.at(-1)).toBe(0.4)

  await ui.unmount()
})

test('the theme and background lists are in alphabetical order, colours only last', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  const labels = async (key: string) => ((await ui.find({ key }))?.props.options as { label: string }[]).map(o => o.label)
  const sorted = (list: string[]) => [...list].sort((a, b) => a.localeCompare(b))
  const themes = await labels('theme')
  expect(themes).toEqual(sorted(themes))
  expect(themes.length).toBe(THEMES.length)
  const backgrounds = await labels('background')
  expect(backgrounds.at(-1)).toBe('Colours only')
  expect(backgrounds.slice(0, -1)).toEqual(sorted(backgrounds.slice(0, -1)))
  await ui.unmount()
})

test('changing the theme keeps the background in use', async ($, on) => {
  const scenes: string[] = []
  engine(on, scenes)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })

  await $.ui.select({ plugin: 'studio-looks', key: 'background', value: 'pixels' })
  expect(scenes.at(-1)).toBe('pixels_on_100_neon-arcade')

  // from the Theme dropdown
  await $.ui.select({ plugin: 'studio-looks', key: 'theme', value: 'dusk' })
  expect(scenes.at(-1)).toBe('pixels_on_100_dusk')

  // from the arrows and "Use this theme", which step through the themes in alphabetical order
  await $.ui.press({ plugin: 'studio-looks', key: 'next' })
  await $.ui.press({ plugin: 'studio-looks', key: 'use' })
  expect(scenes.at(-1)).toBe('pixels_on_100_ember')

  await ui.unmount()
})

test('the veil behind the conversation is as strong as asked', async ($, on) => {
  const veils: number[] = []
  engine(on, [], veils)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  expect(veils.at(-1)).toBe(0.72)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })

  await $.ui.select({ plugin: 'studio-looks', key: 'background', value: 'pixels' })
  await $.ui.select({ plugin: 'studio-looks', key: 'veil', value: 'strong' })
  expect(veils.at(-1)).toBe(0.88)

  await $.ui.select({ plugin: 'studio-looks', key: 'veil', value: 'solid' })
  expect(veils.at(-1)).toBe(1)

  // light keeps each background's own tuning: squares need a clearer panel than wax
  await $.ui.select({ plugin: 'studio-looks', key: 'veil', value: 'light' })
  expect(veils.at(-1)).toBe(0.32)

  await ui.unmount()
})

const REPLY = {
  plugin: 'studio-looks',
  component: 'AssistantMessage',
  requestId: 'reply-1',
  props: { text: 'Hello there', isFirstOfReply: true },
} as const

test('a reply sits in a bubble over a background, and plain when asked', async ($, on) => {
  engine(on)
  // stands for the app's own drawing of the reply
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)

    return <Text>the reply</Text>
  })
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  let ui = await $.ui.mount({ ...REPLY, surface: 'desktop' })
  const bubble = await ui.find({ type: 'Box' })
  expect(bubble?.props.backgroundColor).toBe('userMessageBackground')
  expect(bubble?.text).toBe('the reply')
  await ui.unmount()

  const pane = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await $.ui.select({ plugin: 'studio-looks', key: 'replies', value: 'plain' })
  await pane.unmount()
  ui = await $.ui.mount({ ...REPLY, surface: 'desktop' })
  expect(await ui.find({ type: 'Box' })).toBeFalsy()
  expect((await ui.find({ type: 'Text' }))?.text).toBe('the reply')
  await ui.unmount()
})

const IDLE_BAND = { ...BAND, props: { ...BAND.props, isWorking: false } } as const

test('a turn that ends on a question gets a solid card whose buttons answer it', async ($, on) => {
  const sent: string[] = []
  engine(on)
  on('prompt.submit', (_, e) => {
    sent.push(e.text)
    return { text: e.text }
  })
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.tool.call({
    tool: 'mcp__ccd_turn__wrap_up',
    recap: 'The mod is published.',
    ask: 'Install it on this Mac?',
    actions: [{ label: 'Yes, install it' }, { label: 'Not now' }],
  })

  let ui = await $.ui.mount({ ...IDLE_BAND, surface: 'desktop' })
  expect((await ui.find({ type: 'Box' }))?.props.backgroundColor).toBe('userMessageBackground')
  expect((await ui.find({ type: 'Text', text: /Install/ }))?.text).toBe('Install it on this Mac?')
  expect((await ui.find({ type: 'Text', text: /published/ }))?.text).toBe('The mod is published.')
  expect((await ui.find({ type: 'Button', key: 'answer-0' }))?.props.label).toBe('Yes, install it')
  expect((await ui.find({ type: 'Button', key: 'answer-1' }))?.props.label).toBe('Not now')

  await $.ui.press({ plugin: 'studio-looks', key: 'answer-0' })
  expect(sent).toEqual(['Yes, install it'])
  await ui.unmount()

  // answered, so the card is gone
  ui = await $.ui.mount({ ...IDLE_BAND, surface: 'desktop' })
  expect(await ui.find({ type: 'Button', key: 'answer-0' })).toBeFalsy()
  await ui.unmount()
})

test('the card stays away while Claude works, when nothing is asked, and when the app keeps its own', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  // a wrap-up with no question draws no card
  await $.tool.call({ tool: 'mcp__ccd_turn__wrap_up', recap: 'All done.' })
  let ui = await $.ui.mount({ ...IDLE_BAND, surface: 'desktop' })
  expect(await ui.find({ type: 'Button', key: 'answer-0' })).toBeFalsy()
  await ui.unmount()

  await $.tool.call({ tool: 'mcp__ccd_turn__wrap_up', recap: 'Fixed.', ask: 'Publish it?', actions: [{ action: 'commit' }, { label: 'Not yet' }] })
  // still working: the turn has not ended
  ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect(await ui.find({ type: 'Button', key: 'answer-0' })).toBeFalsy()
  await ui.unmount()
  // an app action becomes words to send
  ui = await $.ui.mount({ ...IDLE_BAND, surface: 'desktop' })
  expect((await ui.find({ type: 'Button', key: 'answer-0' }))?.props.label).toBe('Commit this')
  await ui.unmount()

  const pane = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await $.ui.select({ plugin: 'studio-looks', key: 'decisions', value: 'app' })
  await pane.unmount()
  ui = await $.ui.mount({ ...IDLE_BAND, surface: 'desktop' })
  expect(await ui.find({ type: 'Button', key: 'answer-0' })).toBeFalsy()
  await ui.unmount()
})

test('the bar follows the task list', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.tool.call({ tool: 'mcp__ccd_turn__update_plan', items: [
    { content: 'Mix the wax', status: 'in_progress' },
    { content: 'Light the lamp', status: 'pending' },
  ] })

  let ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /Step/ }))?.text).toBe('Step 1 of 2: Mix the wax')
  await ui.unmount()

  await $.tool.call({ tool: 'mcp__ccd_turn__update_plan', advance: true })
  ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /Step/ }))?.text).toBe('Step 2 of 2: Light the lamp')
  await ui.unmount()

  await $.tool.call({ tool: 'mcp__ccd_turn__wrap_up', recap: 'done' })
  ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /done/ }))?.text).toBe('All 2 steps done')
  await ui.unmount()
})

test('the last step is checked off when the turn ends, as the app does', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.tool.call({ tool: 'mcp__ccd_turn__update_plan', items: [
    { content: 'Mix the wax', status: 'in_progress' },
    { content: 'Light the lamp', status: 'pending' },
  ] })
  // a turn that ends with steps still to come leaves them as they are
  await $.turn.complete({ answer: '', durationMs: 1, isAborted: false, turnId: 't1', reason: 'completed' } as never)
  let ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /Step/ }))?.text).toBe('Step 1 of 2: Mix the wax')
  await ui.unmount()

  await $.tool.call({ tool: 'mcp__ccd_turn__update_plan', advance: true })
  await $.turn.complete({ answer: '', durationMs: 1, isAborted: false, turnId: 't2', reason: 'completed' } as never)
  ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /done/ }))?.text).toBe('All 2 steps done')
  await ui.unmount()
})

test('the bar lists every step, or only the one under way when asked', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.tool.call({ tool: 'mcp__ccd_turn__update_plan', items: [
    { content: 'Mix the wax', status: 'completed' },
    { content: 'Light the lamp', status: 'in_progress' },
    { content: 'Watch it rise', status: 'pending' },
  ] })

  let ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /^✓/ }))?.text).toBe('✓ Mix the wax')
  expect((await ui.find({ type: 'Text', text: /^▸/ }))?.text).toBe('▸ Light the lamp')
  expect((await ui.find({ type: 'Text', text: /^·/ }))?.text).toBe('· Watch it rise')
  // the picker's button is in the band's first row, after the label
  expect((await ui.find({ type: 'Button', key: 'looks' }))?.props.label).toBe('Looks')
  await ui.unmount()

  // a band with few rows shows the stretch around the step under way
  ui = await $.ui.mount({ ...BAND, props: { ...BAND.props, maxRows: 5 }, surface: 'desktop' })
  expect(await ui.find({ type: 'Text', text: /^✓/ })).toBeTruthy()
  expect(await ui.find({ type: 'Text', text: /^·/ })).toBeFalsy()
  expect((await ui.find({ type: 'Text', text: /more$/ }))?.text).toBe('and 2 more')
  await ui.unmount()

  const pane = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await $.ui.select({ plugin: 'studio-looks', key: 'steps', value: 'line' })
  await pane.unmount()
  ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect(await ui.find({ type: 'Text', text: /^▸/ })).toBeFalsy()
  expect((await ui.find({ type: 'Text', text: /Step/ }))?.text).toBe('Step 2 of 3: Light the lamp')
  await ui.unmount()
})

test('work in the background gets a row that says how each piece stands', async ($, on) => {
  engine(on, [], [], tool => (tool === 'Bash' ? { stdout: '', stderr: '', interrupted: false, backgroundTaskId: 'task-7' } : {}))
  on('prompt.submit', (_, e) => ({ text: e.text }))
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  // nothing in the background: no row
  let ui = await $.ui.mount({ ...IDLE_BAND, surface: 'desktop' })
  expect(await ui.find({ type: 'Text', text: /Background/ })).toBeFalsy()
  await ui.unmount()

  await $.tool.call({ tool: 'Bash', command: 'node audit.mjs', description: 'Run the audit', run_in_background: true })
  ui = await $.ui.mount({ ...IDLE_BAND, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /audit/ }))?.text).toBe('Run the audit · running')
  expect((await ui.find({ type: 'Svg' }))?.props.alt).toBe('running')
  await ui.unmount()

  // the app's notice that it ended
  await $.prompt.submit({ text: '<task-notification><task-id>task-7</task-id><status>failed</status></task-notification>', wait: false, origin: { kind: 'task-notification' } })
  ui = await $.ui.mount({ ...IDLE_BAND, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /audit/ }))?.text).toBe('Run the audit · failed')
  await ui.unmount()

  // the person's next message clears what has ended
  await $.prompt.submit({ text: 'thanks', wait: false, origin: { kind: 'composer' } })
  ui = await $.ui.mount({ ...IDLE_BAND, surface: 'desktop' })
  expect(await ui.find({ type: 'Text', text: /audit/ })).toBeFalsy()
  await ui.unmount()
})

test('a job mark is drawn for every state in every theme', () => {
  for (const theme of THEMES) {
    for (const status of ['running', 'done', 'failed', 'stopped'] as const) {
      const svg = jobMark(theme, status)
      expect(svg.startsWith('<svg')).toBe(true)
      expect(/@media\(/.test(svg)).toBe(false)
      expect(svg.includes('animation:go')).toBe(status === 'running')
    }
  }
})

test('the speed bar steps the background slower and faster, held at the ends', async ($, on) => {
  const scenes: string[] = []
  engine(on, scenes)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  // the bar's label and figure, whether the surface draws its own bar or text
  const shown = async () => (await ui.find({ text: /^Animation speed \S+$/ }))?.text.replace('Animation speed ', '')

  expect(await shown()).toBe('1×')
  await $.ui.press({ plugin: 'studio-looks', key: 'faster' })
  expect(scenes.at(-1)).toBe('lamp_on_125_neon-arcade')
  await $.ui.press({ plugin: 'studio-looks', key: 'faster' })
  await $.ui.press({ plugin: 'studio-looks', key: 'faster' })
  expect(scenes.at(-1)).toBe('lamp_on_150_neon-arcade')
  expect(await shown()).toBe('1½×')
  for (let i = 0; i < 8; i++) await $.ui.press({ plugin: 'studio-looks', key: 'slower' })
  expect(scenes.at(-1)).toBe('lamp_on_25_neon-arcade')
  expect(await shown()).toBe('¼×')
  // a new theme keeps the speed
  await $.ui.select({ plugin: 'studio-looks', key: 'theme', value: 'dusk' })
  expect(scenes.at(-1)).toBe('lamp_on_25_dusk')

  await ui.unmount()
})

test('a speed changes only the timings of a scene', () => {
  const secs = /(?<![\w.#-])(-?\d*\.?\d+)s(?![\w-])/g
  for (const kind of KINDS) {
    const svg = backdrop(THEMES[0]!, kind, true)
    const half = paced(svg, 0.5)
    // every time doubled at half speed, and nothing else touched
    expect(half.replace(secs, 'T')).toBe(svg.replace(secs, 'T'))
    const before = [...svg.matchAll(secs)].map(m => Number(m[1]))
    const after = [...half.matchAll(secs)].map(m => Number(m[1]))
    expect(before.length).toBeGreaterThan(0)
    after.forEach((t, i) => expect(Math.abs(t - 2 * before[i]!)).toBeLessThan(0.01))
    expect(paced(svg, 1)).toBe(svg)
  }
})

test('the tunnel and the flock play no faster than 1¼×, every other background up to 1½×', () => {
  for (const kind of ['tunnel', 'flock']) { expect(speedFor(kind, 1.5)).toBe(1.25); expect(speedFor(kind, 0.5)).toBe(0.5) }
  for (const kind of KINDS.filter(k => k !== 'tunnel' && k !== 'flock')) expect(speedFor(kind, 1.5)).toBe(1.5)
})
