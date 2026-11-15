# Security

studio-looks is a small, unofficial mod made for fun. It is not an Anthropic product, and Anthropic does not support it. This page says what the mod can see and do, and how to tell us about a problem.

## What the mod sees and does

A mod runs inside Claude Code with your own access, so here is exactly what this one uses:

- **It saves one thing: your pick** (theme, background and settings), through the app's own storage for mods. The README's "Remove it" section says where that file is and how to delete it.
- **It reads two things from the session while it runs:** Claude's task list, to draw the progress bar, and the question a turn ends on, to draw the decision card. It uses them only to draw on your screen.
- **It does not** open files of its own, reach the network, or run other programs.
- **It changes none of the app's settings.** `/looks off` puts the app back to its own colours.

Everything above can be checked in `studio-looks/hooks/`. The two files we did not write, `make-colors.js` and `make-colors.d.ts`, are Anthropic's colour helper, copied unchanged.

## Reporting a problem

If you find a way this mod could expose your data, reach beyond what is listed above, or harm your setup, please report it privately:

1. Open this repository's **Security** tab.
2. Choose **Report a vulnerability**.

Please don't open a public issue for a security problem. For anything else, such as a background that looks wrong or a theme that's hard to read, a normal issue is fine.

We'll reply as soon as we can. This is a side project, so it may take a few days.

## Versions

Only the latest release is looked after. To update, follow "You want the newest version" in the README.
