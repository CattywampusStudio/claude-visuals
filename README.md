# claude-visuals

Mods that change how the Claude desktop app looks. There is one so far, **studio-looks**: pick a theme and a moving background for the whole app from a pane beside the conversation.

> [!NOTE]
> This is an unofficial project, made for fun by Cattywampus Studio. It is not affiliated with, endorsed by or supported by Anthropic. Claude and Claude Code are Anthropic's products.

<img src="images/grid.svg" width="100%" alt="The Grid horizon background in the Synthwave theme: a floor grid rolling toward the viewer under a slotted sun, with wire mountains and stars">

## Install

You need the Claude desktop app with Claude Code 2.1.324 or later. In a terminal, run:

```
claude plugin install studio-looks --marketplace CattywampusStudio/claude-visuals
```

Then start a new session in the desktop app's Code tab. A **Looks** pane opens beside the conversation.

Mods run with your own access to files and the network, so it is worth reading a mod's code before you install it. This one reads and writes only its own saved pick.

## Use

- **The Looks pane** is where you choose. Pick a theme, then a background, and adjust the rest below them. Your pick is kept for your next session.
- **The Looks button**, at the right end of the band above the message box, reopens the pane if you close it.
- **The `/looks` command** does the same by name: `/looks synthwave grid` applies a theme and a background, and `/looks off` puts the app back to its own colours.

The look is drawn in the desktop app. A terminal session runs the mod but draws no look.

## What you can pick

**A theme** sets the colours for the whole app, in light and dark. There are eighteen:

Neon Arcade, Midnight Pop, Workshop, Playground, Dusk, Backstage, Ember, Deep Sea, Orchard, Ink, Green Rain, Cipher, Pixel Dust, Static, Sunset Blocks, Synthwave, Night City, Retro Sunset.

**A background** sits behind the conversation, moving or still. Changing the theme recolours whichever one is in use, so every background works with every theme. **Animation speed**, under the background, plays it slower or faster, from a quarter to one and a half times (Vector tunnel and Murmuration stop at one and a quarter): press − or + beside the bar.

| | | |
| :---: | :---: | :---: |
| <img src="images/sunset.svg" width="260" alt="A banded sun setting into water between islands with palms"><br>**Banded sunset** | <img src="images/city.svg" width="260" alt="A city of towers at night with lit windows, neon signs, searchlights and rain"><br>**Night city** | <img src="images/lamp.svg" width="260" alt="Blobs of coloured wax rising, sinking and merging"><br>**Lava lamp** |
| <img src="images/plotter.svg" width="260" alt="Blocks being hatched line by line, as a pen plotter draws"><br>**Plotter proof** | <img src="images/weave.svg" width="260" alt="A dotted cloth with chevrons being woven row by row"><br>**Loom** | <img src="images/pixels.svg" width="260" alt="Coloured squares fading in, drifting up and dissolving"><br>**Dissolving pixels** |
| <img src="images/rain.svg" width="260" alt="Columns of symbols falling at their own speeds"><br>**Falling symbols** | <img src="images/soft.svg" width="260" alt="Soft glows of colour drifting slowly"><br>**Soft glows** | <img src="images/flock.svg" width="260" alt="A flock of square pixels streaming and turning together across a treeline at dusk"><br>**Murmuration** |
| <img src="images/nebula.svg" width="260" alt="Clouds of colour at either end of a band of stars, with dark lanes and a bright core in each"><br>**Nebula** | <img src="images/ridges.svg" width="260" alt="Stacked rows of a trace whose peaks swell and sink"><br>**Signal ridges** | <img src="images/circuit.svg" width="260" alt="A circuit board with a main chip on each side and pulses of colour running along its traces"><br>**Circuit traces** |
| <img src="images/tunnel.svg" width="260" alt="Frames of light coming toward you down a square tunnel"><br>**Vector tunnel** |  |  |

The picture at the top of the page is **Grid horizon**. The last choice is **Colours only**: the theme with no background.

**A progress bar** above the message box follows Claude's task list while it works, drawn to match the background. You can swap it for the app's own bar or turn it off. Around the bar:

- **The steps** are listed under it: ✓ done, ▸ under way, · still to come. A long list shows the steps near the one under way and says how many more there are. The setting **Steps in the bar** can show only the step under way.
- **A Background row** appears while work runs out of sight: a command left running, a subagent, another session Claude started. Each has a small mark in the theme's colours that says whether it is running, done, failed or stopped. The app tells the mod only that the work runs and how it ended, so there is no percentage. Finished rows clear when you send your next message.

**Readable words over the background.** Three settings keep the conversation easy to read:

- **Claude's replies** can sit on a panel in the theme's own surface colour, the way your messages do.
- **Behind the conversation** sets how much of the background shows through the conversation column: light, medium, strong or solid.
- **Decision card.** When Claude ends a turn with a question, the mod shows it on a solid panel above the message box, with the answers as buttons. The app also draws its own card in the conversation; to see only one, turn the app's off under Settings, "Summary and next steps".

## If something is off

- **The background does not move.** The app plays a moving background only while it judges it safe and cheap to draw, and it follows its own Motion setting and your system's Reduce Motion setting. Check those first. A background that is held still is drawn as a still picture.
- **No look at all.** The look appears in sessions started after the mod was installed, in the desktop app only.
- **You want the newest version.** Run these two, then start a new session:

```
claude plugin marketplace update claude-visuals
claude plugin update studio-looks@claude-visuals
```

## Remove it

1. In a session, run `/looks off`, so the app is back in its own colours before the mod goes.
2. In a terminal, uninstall the mod:

```
claude plugin uninstall studio-looks@claude-visuals
```

3. To forget this repository as a source of mods as well:

```
claude plugin marketplace remove claude-visuals
```

Then start a new session. The mod changes none of the app's own settings, so there is nothing else to undo. One small file may stay behind: your saved pick, in `~/.claude/plugins/store/`, with a name that starts with `studio-looks`. Delete it if you want no trace.

To switch the mod off without removing it, run `claude plugin disable studio-looks@claude-visuals`; `enable` in place of `disable` brings it back.

## Change it or build your own

The mod's code is in the `studio-looks` folder of this repository. You only need this section to change the mod; installing it needs none of it.

The look is drawn only in the desktop app, so run your copy there. First switch the installed copy off, so the two don't both load:

```
claude plugin disable studio-looks@claude-visuals
```

Then name your copy's folder in `~/.claude/settings.json`, under `env`, with the full path:

```json
{ "env": { "CLAUDE_CODE_PLUGIN_DIRS": "/path/to/claude-visuals/studio-looks" } }
```

Every new desktop session now runs your copy, and saving a file reloads it. To go back, remove that line and run `claude plugin enable studio-looks@claude-visuals`.

In a terminal, `claude --plugin-dir ./studio-looks` loads your copy for one session. It runs the mod's hooks, commands and tests, but a terminal draws no look. To check your copy, run `claude plugin validate ./studio-looks` and `claude plugin test ./studio-looks`.

The official guide to writing mods is at [code.claude.com/docs/en/plugins/mods](https://code.claude.com/docs/en/plugins/mods).

One thing worth knowing before drawing a background of your own: the app animates only SVG it accepts, and draws anything else as a still picture with no error. The mod's tests check every background against the rules the app was using when they were written.

## Credits and licence

Made by Cattywampus Studio as a fun side project. We have no connection to Anthropic, and Anthropic does not support this mod: if something breaks, open an issue in this repository.

**Our own work is under the MIT licence**, see [LICENSE](LICENSE). That is everything in this repository except the two files named below.

**Two files are Anthropic's, not ours, and the MIT licence does not cover them:**

- `studio-looks/hooks/make-colors.js`
- `studio-looks/hooks/make-colors.d.ts`

They are the colour helper that comes with Claude Code's plugin-authoring skill. That skill tells a mod's author to copy the two files into the mod and leave them as they are, and that is what we did: they are here unchanged. They remain Anthropic's, under Anthropic's own terms. We claim no rights in them and give none. The [notice](studio-looks/NOTICE.md) kept beside the mod says the same.

