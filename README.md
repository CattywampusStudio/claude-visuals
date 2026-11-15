# claude-visuals

Mods that change how the Claude desktop app looks.

## studio-looks

Pick the app's look from a collection of eighteen themes. A look is a few things you can mix:

- **Colours** for the whole app, in light and dark.
- **A background behind the conversation**, which can move or sit still:
  - a lava lamp, soft glows, dissolving pixels or falling symbols;
  - three pictures: a synthwave grid rolling under a slotted sun, a banded sun setting into water, and a city at night with neon and rain;
  - three mechanical ones: a pen plotter hatching blocks line by line, a loom weaving a dotted twill, and a field of small machines;
  - or colours only.
- **A progress bar above the message box** that follows Claude's task list, drawn to match the background.
- **Readable replies.** Over a background, each of Claude's replies sits on a panel in the theme's own surface colour, the way your messages do. It can be turned off.
- **A solid decision card.** When Claude ends a turn with a question, the mod shows it on a solid panel above the message box, with its answers as buttons that send your reply. The app's own card in the conversation gets no panel over a background; turn it off under Settings, "Summary and next steps", to see one only.
- **How much of the background shows behind the conversation**: light, medium, strong or solid. The app's own cards, such as the summary and next steps, have no panel of their own over a background, so this is what keeps them readable.

Themes: Neon Arcade, Midnight Pop, Workshop, Playground, Dusk, Backstage, Ember, Deep Sea, Orchard, Ink, Green Rain, Cipher, Pixel Dust, Static, Sunset Blocks, Synthwave, Night City, Retro Sunset.

### Install

At the prompt of a Claude Code terminal session:

```
/plugin install studio-looks --marketplace CattywampusStudio/claude-visuals
```

From a shell:

```
claude plugin install studio-looks --marketplace CattywampusStudio/claude-visuals
```

In the desktop app, where `/plugin` does not run: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `CattywampusStudio/claude-visuals`, then **Add plugin**.

You are asked to add the marketplace (answer `y`) and to pick a scope. Installed at the user scope, the mod loads in every session, including the ones the desktop app starts for its Code tab.

### Use

The look is drawn by the Claude desktop app's Code tab. A terminal session runs the mod but draws no look.

- A **Looks** pane opens beside the conversation: browse themes with Previous and Next, apply one with **Use this theme**, then choose the background, whether it moves, and the progress bar.
- A small **Looks** button above the message box reopens the pane.
- `/looks` opens the pane. `/looks <theme>` applies a theme by name, `/looks <theme> pixels` picks a background with it (`lamp`, `soft`, `pixels`, `rain`, `grid`, `sunset`, `city`, `plotter`, `weave`, `glyphs` or `plain`), and `/looks off` puts the app back to its own colours.

Your pick is kept for your next session.

### Needs

Claude Code 2.1.324 or later in the desktop app. Mods run with your own access to files and the network, so read a mod's code before you install it; this one reads and writes only its own saved pick.

### If the background does not move

The app plays a moving background only while it judges it safe and cheap to draw, and it follows its own Motion setting and the system's Reduce Motion. When it holds a background still, the scene is drawn at rest. Turning **Motion in the background** off in the Looks pane does the same on purpose.

### Develop

```
claude --plugin-dir ./studio-looks
claude plugin validate ./studio-looks
cd studio-looks && claude plugin test .
```

`hooks/themes.ts` is the theme collection. `hooks/scene.ts` and `hooks/scenery.ts` draw the backgrounds as SVG. The app animates only SVG it accepts, and draws anything else still with no error; the first test in `hooks/looks.test.tsx` holds every background to the app's lists of SVG elements and CSS functions as they were read on 2026-11-15.

## Credits and licence

MIT, see [LICENSE](LICENSE).

The plotter, loom and glyph backgrounds took their idea, mechanical motion in steps, from the industrial side-project style of @tol__is. The drawings and marks here are our own.

`studio-looks/hooks/make-colors.js` and `make-colors.d.ts` are Claude Code's own theme helper, copied unchanged from its plugin-authoring skill as that skill instructs. They are Anthropic's and are not covered by this repository's licence.
