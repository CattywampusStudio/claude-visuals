import { expect, test } from 'claude-code/testing'

import { KINDS, backdrop } from './scene.ts'
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
const engine = (on: Parameters<Extract<Parameters<typeof test>[1], (...args: any) => any>>[1], scenes: string[] = [], veils: number[] = []) => {
  on('command.register', () => ({ value: { command: 'looks' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('theme.set', (_, e) => {
    scenes.push((e as { backdrop?: { scene?: string } }).backdrop?.scene ?? 'none')
    veils.push((e as { backdrop?: { glass?: { opacity?: number } } }).backdrop?.glass?.opacity ?? -1)
    return { value: { isDrawn: true, requestId: 'backdrop' } }
  })
  on('store.get', () => ({ value: undefined }))
  on('store.set', () => ({ value: undefined }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('tool.call', () => ({ result: {} }))
}

// The desktop app only animates a background whose SVG its player accepts; anything else it draws still, with
// no error. These lists are the player's own, read from the app's interface code on 2026-11-15: the SVG elements
// it takes (feColorMatrix is not one), and the CSS functions it knows. `@media(` written without a space reads to
// it as a function called "media", and a path() or a CSS gradient is refused the same way.
const ELEMENTS = new Set(
  'animate animateMotion animateTransform set circle clipPath defs desc ellipse feBlend feComposite feDropShadow feFlood feGaussianBlur feMerge feMergeNode feOffset filter g line linearGradient marker mask mpath path pattern polygon polyline radialGradient rect stop style svg symbol text textPath title tspan use'.split(' '),
)
const FUNCTIONS = new Set(
  'url color color-mix hsl hsla hwb lab lch light-dark oklab oklch rgb rgba abs acos asin atan atan2 calc clamp cos exp hypot log max min mod pow rem round sign sin sqrt tan var matrix matrix3d perspective rotate rotate3d rotatex rotatey rotatez scale scale3d scalex scaley scalez skew skewx skewy translate translate3d translatex translatey translatez cubic-bezier linear steps blur drop-shadow grayscale hue-rotate invert opacity saturate sepia is not nth-child nth-last-child nth-last-of-type nth-of-type where'.split(' '),
)
/** What in a scene the player would refuse: elements off its list, functions it does not know, things it bans outright. */
const refused = (svg: string): string[] => {
  // what is drawn as words (the symbols of the rain, a label) is not CSS and is not checked
  const code = svg.replace(/>[^<]*</g, (text, at: number) => (svg.slice(0, at).endsWith('<style') || /<style[^>]*$/.test(svg.slice(0, at + 1)) ? text : '><'))
  const elements = [...svg.matchAll(/<([A-Za-z][\w-]*)/g)].map(m => m[1] ?? '').filter(name => !ELEMENTS.has(name))
  const functions = [...code.matchAll(/([^\s()[\]{}<>;:,'"`=+*/!@#$%^&|~?]{0,64})\(/g)].map(m => (m[1] ?? '').toLowerCase()).filter(name => name !== '' && !FUNCTIONS.has(name))
  const banned = ['shape-rendering', 'vector-effect', 'data:', '\\'].filter(word => code.includes(word))
  return [...new Set([...elements, ...functions.map(name => `${name}()`), ...banned])]
}

test('every scene keeps to what the app will animate', async () => {
  for (const theme of THEMES) {
    for (const kind of KINDS) {
      for (const moving of [true, false]) {
        const svg = backdrop(theme, kind, moving)
        expect(refused(svg)).toEqual([])
        expect(/@media\(/.test(svg)).toBe(false)
      }
    }
  }
  // the check does catch what the app was seen to refuse
  expect(refused('<svg><filter><feColorMatrix/></filter><style>@media(prefers-color-scheme:light){a{offset-path:path("M0 0")}}</style></svg>')).toEqual(['feColorMatrix', 'media()', 'path()'])
})

test('a drawn scene is picked in the pane or by its name, and keeps its lines clear', async ($, on) => {
  const scenes: string[] = []
  const veils: number[] = []
  engine(on, scenes, veils)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })

  await $.ui.select({ plugin: 'studio-looks', key: 'background', value: 'grid' })
  expect(scenes.at(-1)).toBe('grid_on_neon-arcade')
  await $.ui.select({ plugin: 'studio-looks', key: 'veil', value: 'light' })
  expect(veils.at(-1)).toBe(0.45)
  await $.ui.select({ plugin: 'studio-looks', key: 'background', value: 'plotter' })
  expect(veils.at(-1)).toBe(0.4)

  // "sunset" is the background of that name, not the theme whose name starts with it
  await $.command.run({ command: 'looks', args: 'sunset' })
  expect(scenes.at(-1)).toBe('sunset_on_neon-arcade')
  await $.command.run({ command: 'looks', args: 'retro-sunset city' })
  expect(scenes.at(-1)).toBe('city_on_retro-sunset')

  await ui.unmount()
})

test('changing the theme keeps the background in use', async ($, on) => {
  const scenes: string[] = []
  engine(on, scenes)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })

  await $.ui.select({ plugin: 'studio-looks', key: 'background', value: 'pixels' })
  expect(scenes.at(-1)).toBe('pixels_on_neon-arcade')

  // from the Theme dropdown
  await $.ui.select({ plugin: 'studio-looks', key: 'theme', value: 'dusk' })
  expect(scenes.at(-1)).toBe('pixels_on_dusk')

  // from the arrows and "Use this theme"
  await $.ui.press({ plugin: 'studio-looks', key: 'next' })
  await $.ui.press({ plugin: 'studio-looks', key: 'use' })
  expect(scenes.at(-1)).toBe('pixels_on_backstage')

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
