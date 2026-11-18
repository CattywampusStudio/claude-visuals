// The app's colours for one theme (themes.ts).
import type { ThemeColors } from 'claude-code'

import type { Theme } from './themes.ts'
import { makeColors } from './make-colors.js'

const made = new Map<string, { theme: ThemeColors; problems: string[] }>()

export const colorsFor = (theme: Theme): { theme: ThemeColors; problems: string[] } => {
  const have = made.get(theme.id)
  if (have) return have
  const dark = theme.colors
  const out = makeColors({
    label: theme.label,
    roles: { accent: dark.accent, danger: dark.bad, success: dark.good, warning: dark.warning, pro: dark.washes[1] ?? dark.accent },
    dark: {
      gray: { anchors: { 'surface-0': dark.ground, 'surface-2': dark.card, 'text-primary': dark.text, 'text-muted': dark.muted } },
    },
    // dark alone: the app shows it in dark mode whatever its own setting
    only: 'dark',
  })
  made.set(theme.id, out)
  return out
}
