/**
 * 'lamp': merging wax. 'soft': soft glows, no filter. 'pixels': squares that fade and dissolve. 'rain': falling symbols.
 * 'grid': a floor grid rolling under a slotted sun. 'sunset': a banded sun setting into water. 'city': towers, neon and rain.
 * 'plotter': blocks hatched line by line. 'weave': a twill woven row by row.
 * 'flock': flocks of square pixels that stream and turn together. 'nebula': clouds of colour along a band of stars.
 * 'ridges': stacked rows of a trace whose peaks swell and sink. 'circuit': a board of chips with pulses on its traces.
 * 'tunnel': frames of light coming down a square tunnel.
 * 'plain': the theme's colours with no drawn background.
 */
export type Background = 'lamp' | 'soft' | 'pixels' | 'rain' | 'grid' | 'sunset' | 'city' | 'plotter' | 'weave' | 'flock' | 'nebula' | 'ridges' | 'circuit' | 'tunnel' | 'plain'
/** 'lava': a drawn bar in the style of the background (wax tube, cells, symbols or a neon line). 'native': the app's own progress element in the theme's accent. 'off': no bar. */
export type BarStyle = 'lava' | 'native' | 'off'
/** Whether the background moves. 'off' draws the same scene at rest. */
export type Motion = 'on' | 'off'
/** How Claude's replies are drawn over a background. 'bubble': on a panel in the theme's surface colour, as your own messages are. 'plain': straight on the background. */
export type Replies = 'bubble' | 'plain'
/** How strongly the app tints the conversation column, and the cards in it, over a background. */
export type Veil = 'light' | 'medium' | 'strong' | 'solid'
/** Who draws the card that closes a turn with a question. 'mod': this mod, on a solid panel above the message box. 'app': only the app's own. */
export type Decisions = 'mod' | 'app'
/** How the bar shows the task list. 'list': every step on a line of its own under the bar. 'line': only the step under way, in the bar's label. */
export type StepsView = 'list' | 'line'
/** How fast a moving background plays: 1 is as drawn; ¼ to 1½ in quarter steps. */
export type Speed = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5
/** What the person picked. `theme` is a theme's id from the collection. */
export type Choice = { theme: string; background: Background; bar: BarStyle; motion: Motion; replies: Replies; veil: Veil; decisions: Decisions; steps: StepsView; speed: Speed }
/**
 * One piece of work running apart from the conversation, as the bar shows it: a command sent to the background, a
 * subagent, or another session this one started. `id` is the app's own id for it. 'done', 'failed' and 'stopped' are
 * how it ended.
 */
export type Job = { id: string; kind: 'command' | 'agent' | 'session'; label: string; status: 'running' | 'done' | 'failed' | 'stopped' }
/** The question a turn ended on, as the turn's wrap-up call gave it: what is now true, what is asked, and the answers offered. */
export type Card = { recap: string; ask: string; answers: string[] }
// `browse` is the id of the theme shown in the picker's preview, which may differ from the one in use until it is applied.
/** The task list as last heard from a task-list tool call. */
export type Plan = { steps: { content: string; status: 'pending' | 'in_progress' | 'completed' }[] }

declare module 'claude-code' {
  interface PluginState {
    'studio-looks': { choice: Shaped<Choice>; plan: Shaped<Plan | null>; browse: string; isCleared: boolean; card: Shaped<Card | null>; jobs: Shaped<Job[]> }
  }
}
