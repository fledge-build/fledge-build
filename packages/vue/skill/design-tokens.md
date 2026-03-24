# Design tokens

Design tokens are the named values that encode the visual language of a project — colors, spacing, typography, border radii, shadows, and more. Before applying any styling, explore what tokens the project already defines.

## Explore before assuming

**Do not invent token values. Do not reach for Tailwind defaults when custom tokens may already exist.**

Every project has a different level of token maturity. Some have none and rely on raw Tailwind utilities. Others have a fully evolved design system with semantic tokens. Explore first, then apply.

## How to explore

Work through these in order, stopping once you have enough context:

**1. Tailwind config** — check for theme extensions:

```text
tailwind.config.{ts,js,mjs,cjs}
```

Look for `theme.extend` entries: custom colors, spacing scales, font families, border radii, box shadows, etc. These are the primary token vocabulary for Tailwind-based projects.

**2. CSS custom properties** — check for CSS variable definitions:

```text
src/**/*.css
src/**/*.scss
assets/**/*.css
```

Look for `:root { --color-*: ...; --spacing-*: ...; }` blocks. A Tailwind v4 project may define its entire design system as CSS variables in `@theme {}` blocks rather than a JS config — read these carefully.

**3. Shared constants** — check for token constants used in CVA variant definitions:

```text
src/**/variants.{ts,js}
src/**/tokens.{ts,js}
src/**/theme.{ts,js}
```

These files often centralise the values used in component variant definitions.

**4. Existing components** — read existing components for the Tailwind classes they use. Work from most deliberate to least:

First, locate UI primitives — they apply tokens most intentionally and consistently:

```text
src/**/ui/**/*.vue
src/**/components/ui/**/*.vue
src/**/primitives/**/*.vue
```

If no dedicated UI primitive directory exists, fall back to any components directory:

```text
src/**/components/**/*.vue
```

If the project has no components yet, fall back to all Vue files:

```text
src/**/*.vue
```

Scan a few files at each level and stop once you have a clear picture. Repeated class patterns reveal the implicit token vocabulary even when no explicit config exists. Prefer patterns from UI primitives over patterns from feature or domain components, which may contain ad-hoc one-off values.

## What to look for

| Token dimension | Signals to look for |
|---|---|
| **Color** | Named palette entries (e.g. `primary`, `surface`, `destructive`) vs. raw Tailwind colors (e.g. `blue-500`) |
| **Spacing** | Custom scale steps vs. Tailwind default steps |
| **Typography** | Custom font families, sizes, weights |
| **Border radius** | Custom radius names (e.g. `card`, `pill`) vs. Tailwind defaults |
| **Shadow** | Custom shadow definitions beyond Tailwind's `sm`/`md`/`lg` |

## Greenfield projects

If the project has no custom tokens yet, establish them before writing components:

- Define color, spacing, and typography extensions in `tailwind.config.ts` under `theme.extend`
- Name tokens semantically (e.g. `primary`, `surface`, `on-surface`) rather than by raw value (e.g. `blue-600`)
- Add corresponding constants to `shared/variants.ts` so CVA variant definitions reference named constants, not string literals

Do not scatter one-off color or spacing values across individual components — every value that appears more than once belongs in the token layer.

## Evolved projects

If custom tokens already exist, use them exclusively:

- Apply only the token names defined in the Tailwind config or CSS custom properties
- Do not introduce new raw Tailwind utilities (e.g. `text-blue-600`) if a semantic equivalent exists (e.g. `text-primary`)
- If a token genuinely doesn't exist for a need, raise it explicitly rather than silently working around it with a one-off value — missing tokens are design system gaps worth surfacing

## Relationship to variant constants

Shared variant constants (see `shared/variants.ts`) map variant names to token names. When tokens change, the constants update — component code stays stable. Always reference constants rather than inlining token strings in CVA definitions.
