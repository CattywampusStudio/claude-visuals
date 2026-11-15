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

Mods run with your own access to files and the network, so it is worth reading a mod's code before you install it. This one reads and writes only its own saved pick. [SECURITY.md](SECURITY.md) says what else it sees and how to report a problem.

## Use

- **The Looks pane** is where you choose. Pick a theme, then a background, and adjust the rest below them. Your pick is kept for your next session.
- **The Looks button** above the message box reopens the pane if you close it.
- **The `/looks` command** does the same by name: `/looks synthwave grid` applies a theme and a background, and `/looks off` puts the app back to its own colours.

The look is drawn in the desktop app. A terminal session runs the mod but draws no look.

## What you can pick

**A theme** sets the colours for the whole app, in light and dark. There are eighteen:

Neon Arcade, Midnight Pop, Workshop, Playground, Dusk, Backstage, Ember, Deep Sea, Orchard, Ink, Green Rain, Cipher, Pixel Dust, Static, Sunset Blocks, Synthwave, Night City, Retro Sunset.

**A background** sits behind the conversation, moving or still. Changing the theme recolours whichever one is in use, so every background works with every theme.

| | | |
| :---: | :---: | :---: |
| <img src="images/sunset.svg" width="260" alt="A banded sun setting into water between islands with palms"><br>**Banded sunset** | <img src="images/city.svg" width="260" alt="A city of towers at night with lit windows, neon signs, searchlights and rain"><br>**Night city** | <img src="images/lamp.svg" width="260" alt="Blobs of coloured wax rising, sinking and merging"><br>**Lava lamp** |
| <img src="images/plotter.svg" width="260" alt="Blocks being hatched line by line, as a pen plotter draws"><br>**Plotter proof** | <img src="images/weave.svg" width="260" alt="A dotted cloth with chevrons being woven row by row"><br>**Loom** | <img src="images/glyphs.svg" width="260" alt="A field of small mechanical marks that orbit, sweep and step"><br>**Glyph field** |
| <img src="images/pixels.svg" width="260" alt="Coloured squares fading in, drifting up and dissolving"><br>**Dissolving pixels** | <img src="images/rain.svg" width="260" alt="Columns of symbols falling at their own speeds"><br>**Falling symbols** | <img src="images/soft.svg" width="260" alt="Soft glows of colour drifting slowly"><br>**Soft glows** |

The picture at the top of the page is **Grid horizon**. The last choice is **Colours only**: the theme with no background.

**A progress bar** above the message box follows Claude's task list while it works, drawn to match the background. You can swap it for the app's own bar or turn it off.

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

The mod's code is in the `studio-looks` folder of this repository. With a copy of the repository, run these from its top folder:

```
claude --plugin-dir ./studio-looks
claude plugin validate ./studio-looks
claude plugin test ./studio-looks
```

The first starts a session with your copy loaded, the second checks its setup, and the third runs its tests. Run them with the Claude Code version named under Install, or later. The official guide to writing mods is at [code.claude.com/docs/en/plugins/mods](https://code.claude.com/docs/en/plugins/mods).

One thing worth knowing before drawing a background of your own: the app animates only SVG it accepts, and draws anything else as a still picture with no error. The mod's tests check every background against the rules the app was using when they were written.

## Credits and licence

Made by Cattywampus Studio as a fun side project. We have no connection to Anthropic, and Anthropic does not support this mod: if something breaks, open an issue in this repository.

**Our own work is under the MIT licence**, see [LICENSE](LICENSE). That is everything in this repository except the two files named below.

**Two files are Anthropic's, not ours, and the MIT licence does not cover them:**

- `studio-looks/hooks/make-colors.js`
- `studio-looks/hooks/make-colors.d.ts`

They are the colour helper that comes with Claude Code's plugin-authoring skill. That skill tells a mod's author to copy the two files into the mod and leave them as they are, and that is what we did: they are here unchanged. They remain Anthropic's, under Anthropic's own terms. We claim no rights in them and give none. The [notice](studio-looks/NOTICE.md) kept beside the mod says the same.

The plotter, loom and glyph backgrounds were inspired by the industrial, step-by-step motion in the visuals of [@tol__is on X](https://x.com/tol__is). Nothing of theirs is used here: every drawing and mark in this mod is our own.
