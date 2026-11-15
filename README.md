# claude-visuals

Mods that change how the Claude desktop app looks. There is one so far, **studio-looks**: pick a theme and a moving background for the whole app from a pane beside the conversation.

<img src="images/grid.svg" width="100%" alt="The Grid horizon background in the Synthwave theme: a floor grid rolling toward the viewer under a slotted sun, with wire mountains and stars">

The pictures on this page are the mod's own drawings, saved as they are: each background is a single SVG that moves by CSS alone.

## studio-looks

A look is a few things you can mix freely:

- **A theme**: colours for the whole app, in light and dark. There are eighteen.
- **A background** behind the conversation, moving or still. There are ten, or none.
- **A progress bar** above the message box that follows Claude's task list, drawn to match the background.
- **Readable words over the background**: reply panels, a solid decision card, and a setting for how much of the background shows through.

Changing the theme recolours whatever background is in use, so every background works with every theme.

### Backgrounds

| | | |
| :---: | :---: | :---: |
| <img src="images/sunset.svg" width="260" alt="A banded sun setting into water between islands with palms"><br>**Banded sunset** | <img src="images/city.svg" width="260" alt="A city of towers at night with lit windows, neon signs, searchlights and rain"><br>**Night city** | <img src="images/lamp.svg" width="260" alt="Blobs of coloured wax rising, sinking and merging"><br>**Lava lamp** |
| <img src="images/plotter.svg" width="260" alt="Blocks being hatched line by line, as a pen plotter draws"><br>**Plotter proof** | <img src="images/weave.svg" width="260" alt="A dotted cloth with chevrons being woven row by row"><br>**Loom** | <img src="images/glyphs.svg" width="260" alt="A field of small mechanical marks that orbit, sweep and step"><br>**Glyph field** |
| <img src="images/pixels.svg" width="260" alt="Coloured squares fading in, drifting up and dissolving"><br>**Dissolving pixels** | <img src="images/rain.svg" width="260" alt="Columns of symbols falling at their own speeds"><br>**Falling symbols** | <img src="images/soft.svg" width="260" alt="Soft glows of colour drifting slowly"><br>**Soft glows** |

Shown above, in order: Retro Sunset, Night City, Neon Arcade; Ink, Ember, Cipher; Pixel Dust, Green Rain, Dusk. The picture at the top of the page is **Grid horizon** in Synthwave. The last choice is **Colours only**: the theme with no drawn background.

### Themes

Neon Arcade, Midnight Pop, Workshop, Playground, Dusk, Backstage, Ember, Deep Sea, Orchard, Ink, Green Rain, Cipher, Pixel Dust, Static, Sunset Blocks, Synthwave, Night City, Retro Sunset.

### Keeping the conversation readable

A busy background is no use if you cannot read over it, so the mod adds three things:

- **Reply panels.** Each of Claude's replies sits on a panel in the theme's own surface colour, the way your messages do. It can be turned off.
- **A solid decision card.** When Claude ends a turn with a question, the mod shows it on a solid panel above the message box, with its answers as buttons that send your reply. The app draws its own card in the conversation too, with no panel behind it; turn that one off under Settings, "Summary and next steps", to see one only.
- **Behind the conversation**: light, medium, strong or solid. This sets how strongly the app tints the conversation column over the background. The app's own cards have no panel of their own, so this is what keeps them readable.

## Install

From a shell. This adds the marketplace and installs the mod for your user account:

```
claude plugin install studio-looks --marketplace CattywampusStudio/claude-visuals
```

Or at the prompt of a Claude Code terminal session, where you are asked to confirm the marketplace and pick a scope:

```
/plugin install studio-looks --marketplace CattywampusStudio/claude-visuals
```

Installed for your user account, the mod loads in every session, including the ones the desktop app starts for its Code tab. Start a new session to see it.

To update later:

```
claude plugin marketplace update claude-visuals
claude plugin update studio-looks@claude-visuals
```

## Use

The look is drawn by the Claude desktop app's Code tab. A terminal session runs the mod but draws no look.

- A **Looks** pane opens beside the conversation. Browse the themes with Previous and Next and apply one with **Use this theme**, or pick from the Theme list. Below that are the background, whether it moves, the reply panels, the tint behind the conversation, the decision card and the progress bar.
- A small **Looks** button above the message box reopens the pane.
- `/looks` opens the pane. `/looks <theme>` applies a theme by name and `/looks <theme> <background>` picks a background with it: `lamp`, `soft`, `pixels`, `rain`, `grid`, `sunset`, `city`, `plotter`, `weave`, `glyphs` or `plain`. `/looks off` puts the app back to its own colours.

Your pick is kept for your next session.

### Needs

Claude Code 2.1.324 or later in the desktop app. Mods run with your own access to files and the network, so read a mod's code before you install it; this one reads and writes only its own saved pick.

### If the background does not move

The app plays a moving background only while it judges it safe and cheap to draw, and it follows its own Motion setting and the system's Reduce Motion. When it holds a background still, the scene is drawn at rest. Turning **Motion in the background** off in the Looks pane does the same on purpose.

## Develop

```
claude --plugin-dir ./studio-looks
claude plugin validate ./studio-looks
cd studio-looks && claude plugin test .
node scripts/images.ts
```

What is where:

| Path | What it holds |
| --- | --- |
| `.claude-plugin/marketplace.json` | The list of mods this repository offers |
| `studio-looks/.claude-plugin/plugin.json` | The mod's name and version |
| `studio-looks/hooks/register.tsx` | The Looks pane, the `/looks` command, the reply panels, the decision card and the bar's place above the message box |
| `studio-looks/hooks/themes.ts` | The theme collection |
| `studio-looks/hooks/scene.ts`, `scenery.ts` | The backgrounds, each drawn as one SVG |
| `studio-looks/hooks/bar.ts` | The progress bars and the pane's preview |
| `studio-looks/hooks/look.ts` | A theme's colours worked out for the whole app |
| `studio-looks/hooks/looks.test.tsx` | The tests |
| `studio-looks/types/index.d.ts` | The shape of what the mod keeps between turns |
| `images/` | This page's pictures, written by `scripts/images.ts`; run it again after changing a scene or a theme |

The app animates only SVG it accepts, and draws anything else still with no error. The first test in `looks.test.tsx` holds every background to the app's lists of SVG elements and CSS functions as they were read on 2026-11-15. Those lists belong to the app and can change with it.

## Credits and licence

MIT, see [LICENSE](LICENSE).

The plotter, loom and glyph backgrounds took their idea, mechanical motion in steps, from the industrial side-project style of @tol__is. The drawings and marks here are our own.

`studio-looks/hooks/make-colors.js` and `make-colors.d.ts` are Claude Code's own theme helper, copied unchanged from its plugin-authoring skill as that skill instructs. They are Anthropic's and are not covered by this repository's licence.
