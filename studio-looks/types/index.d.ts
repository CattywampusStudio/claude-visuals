/** 'lamp': merging wax. 'soft': soft glows, no filter. 'pixels': squares that fade and dissolve. 'rain': falling symbols. 'plain': the theme's colours with no drawn background. */
export type Background = 'lamp' | 'soft' | 'pixels' | 'rain' | 'plain'
/** 'lava': a drawn bar in the style of the background (wax tube, pixel cells or symbols). 'native': the app's own progress element in the theme's accent. 'off': no bar. */
export type BarStyle = 'lava' | 'native' | 'off'
/** Whether the background moves. 'off' draws the same scene at rest. */
export type Motion = 'on' | 'off'
/** What the person picked. `theme` is a theme's id from the collection. */
export type Choice = { theme: string; background: Background; bar: BarStyle; motion: Motion }
// `browse` is the id of the theme shown in the picker's preview, which may differ from the one in use until it is applied.
/** The task list as last heard from a task-list tool call. */
export type Plan = { steps: { content: string; status: 'pending' | 'in_progress' | 'completed' }[] }

declare module 'claude-code' {
  interface PluginState {
    'studio-looks': { choice: Shaped<Choice>; plan: Shaped<Plan | null>; browse: string }
  }
}
