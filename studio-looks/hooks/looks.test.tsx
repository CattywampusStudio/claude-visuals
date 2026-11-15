import { expect, test } from 'claude-code/testing'

import { KINDS, backdrop } from './scene.ts'
import { THEMES } from './themes.ts'

const BAND = {
  plugin: 'studio-looks',
  component: 'AbovePrompt',
  requestId: 'above-prompt',
  props: { hasSurvey: false, isCollapsed: false, isWorking: true, maxRows: 10, bodyColumns: 80, scroll: { offset: 0, bodyRows: 10 }, view: {} },
} as const

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const engine = (on: Parameters<Extract<Parameters<typeof test>[1], (...args: any) => any>>[1]) => {
  on('command.register', () => ({ value: { command: 'looks' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('theme.set', () => ({ value: { isDrawn: true, requestId: 'backdrop' } }))
  on('store.get', () => ({ value: undefined }))
  on('store.set', () => ({ value: undefined }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('tool.call', () => ({ result: {} }))
}

// The desktop app only animates a background whose SVG its player accepts. Two things it refuses and
// then draws still, with no error: an element off its list (feColorMatrix is one), and `@media(` written
// without a space, which its checker reads as a CSS function it does not know.
test('every scene keeps to what the app will animate', async () => {
  for (const theme of THEMES) {
    for (const kind of KINDS) {
      const svg = backdrop(theme, kind, true)
      expect(svg.includes('feColorMatrix')).toBe(false)
      expect(/@media\(/.test(svg)).toBe(false)
    }
  }
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
