/**
 * 'lamp': merging wax. 'soft': soft glows, no filter. 'pixels': squares that fade and dissolve. 'rain': falling symbols.
 * 'grid': a floor grid rolling under a slotted sun. 'sunset': a banded sun setting into water. 'city': towers, neon and rain.
 * 'plotter': blocks hatched line by line. 'weave': a twill woven row by row. 'glyphs': a field of small machines.
 * 'plain': the theme's colours with no drawn background.
 */
export type Background = 'lamp' | 'soft' | 'pixels' | 'rain' | 'grid' | 'sunset' | 'city' | 'plotter' | 'weave' | 'glyphs' | 'plain'
/** 'lava': a drawn bar in the style of the background (wax tube, pixel cells or symbols). 'native': the app's own progress element in the theme's accent. 'off': no bar. */
export type BarStyle = 'lava' | 'native' | 'off'
/** Whether the background moves. 'off' draws the same scene at rest. */
export type Motion = 'on' | 'off'
/** How Claude's replies are drawn over a background. 'bubble': on a panel in the theme's surface colour, as your own messages are. 'plain': straight on the background. */
export type Replies = 'bubble' | 'plain'
/** How strongly the app tints the conversation column, and the cards in it, over a background. */
export type Veil = 'light' | 'medium' | 'strong' | 'solid'
/** Who draws the card that closes a turn with a question. 'mod': this mod, on a solid panel above the message box. 'app': only the app's own. */
export type Decisions = 'mod' | 'app'
/** What the person picked. `theme` is a theme's id from the collection. */
export type Choice = { theme: string; background: Background; bar: BarStyle; motion: Motion; replies: Replies; veil: Veil; decisions: Decisions }
/** The question a turn ended on, as the turn's wrap-up call gave it: what is now true, what is asked, and the answers offered. */
export type Card = { recap: string; ask: string; answers: string[] }
// `browse` is the id of the theme shown in the picker's preview, which may differ from the one in use until it is applied.
/** The task list as last heard from a task-list tool call. */
export type Plan = { steps: { content: string; status: 'pending' | 'in_progress' | 'completed' }[] }

declare module 'claude-code' {
  interface PluginState {
    'studio-looks': { choice: Shaped<Choice>; plan: Shaped<Plan | null>; browse: string; isCleared: boolean; card: Shaped<Card | null> }
  }
}
