// The app's colours for one theme (themes.ts).
import type { ThemeColors } from 'claude-code'

import type { Theme } from './themes.ts'
import { makeColors } from './make-colors.js'

const made = new Map<string, { theme: ThemeColors; problems: string[] }>()

export const colorsFor = (theme: Theme): { theme: ThemeColors; problems: string[] } => {
  const have = made.get(theme.id)
  if (have) return have
  const { light, dark } = theme
  const out = makeColors({
    label: theme.label,
    roles: { accent: dark.accent, danger: dark.bad, success: dark.good, warning: dark.warning, pro: dark.washes[1] ?? dark.accent },
    light: {
      gray: { anchors: { 'surface-0': light.ground, 'surface-2': light.card, 'text-primary': light.text, 'text-muted': light.muted } },
      roles: { accent: light.accent, danger: light.bad, success: light.good, warning: light.warning, pro: light.washes[1] ?? light.accent },
    },
    dark: {
      gray: { anchors: { 'surface-0': dark.ground, 'surface-2': dark.card, 'text-primary': dark.text, 'text-muted': dark.muted } },
    },
  })
  made.set(theme.id, out)
  return out
}
