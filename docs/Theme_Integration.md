# Theme integration

`pict-section-flow` participates in the host application's theme system in two layers:

1. **Host theme (light/dark/palette)** — provided by `pict-provider-theme` via `--theme-color-*` CSS custom properties on `:root` and a `theme-light` / `theme-dark` class on `<html>`.
2. **Flow visual theme (sketch, blueprint, mono, retro-80s, retro-90s, whiteboard, default)** — provided by the editor's own `PictProvider-Flow-Theme` and applied as scope-local overrides on `.pict-flow-container`.

Both layers cooperate. The flow editor's `--pf-*` tokens default to the matching `--theme-color-*` token, so when the host swaps light/dark or palette, all neutral flow chrome (panels, toolbars, text, connections, grid) updates with no JS work. Visual themes that intentionally diverge from the host palette (e.g. blueprint's deep blue canvas, retro-80s neon) override the relevant `--pf-*` tokens explicitly.

## Host wiring

When a host application registers `pict-provider-theme`:

```javascript
const libPictProviderTheme = require('pict-provider-theme');
pict.addProvider('Theme', libPictProviderTheme.default_configuration, libPictProviderTheme);
pict.providers.Theme.registerTheme(require('pict-provider-theme/source/themes/pict-default.json'));
pict.providers.Theme.applyTheme('pict-default', 'system');
```

…the flow editor automatically detects it during `onBeforeInitialize` (duck-typed via `applyTheme`/`onApply`/`listThemes`) and subscribes to its `onApply` hook. On every host theme change the editor:

- Re-runs `_CSSProvider.registerCSS()` so CSS layered on top by the active flow visual theme stays in the cascade.
- Calls `_reinjectMarkerDefs()` so SVG `<marker>` arrowhead polygons rebuild with the new fills.
- Calls `renderFlow()` to repaint nodes/connections (so any inline-rendered colors refresh).

No code changes are required in host apps beyond installing and applying `pict-provider-theme` as you would for any other consumer.

## Token mapping

| Flow token (`--pf-…`) | Host token (`--theme-color-…`) | Hardcoded fallback |
|---|---|---|
| `--pf-text-primary` | `text-primary` | `#2c3e50` |
| `--pf-text-secondary` | `text-secondary` | `#7f8c8d` |
| `--pf-text-tertiary` | `text-muted` | `#8e99a4` |
| `--pf-node-body-fill` | `background-panel` | `#ffffff` |
| `--pf-node-body-stroke` | `border-default` | `#d0d4d8` |
| `--pf-node-body-stroke-hover` | `border-strong` | `#b0b8c0` |
| `--pf-node-selected-stroke` | `brand-primary` | `#3498db` |
| `--pf-node-shadow` (and hover/dragging) | `shadow-color` | `rgba(0,0,0,0.10)` |
| `--pf-port-input-fill` | `status-info` | `#3498db` |
| `--pf-port-output-fill` | `status-success` | `#2ecc71` |
| `--pf-port-error-fill` | `status-error` | `#e74c3c` |
| `--pf-connection-stroke` | `border-strong` | `#95a5a6` |
| `--pf-connection-selected-stroke` | `brand-primary` | `#3498db` |
| `--pf-panel-bg` | `background-panel` | `#ffffff` |
| `--pf-panel-titlebar-bg` | `background-secondary` | `#f7f8fa` |
| `--pf-toolbar-bg` | `background-panel` | `#ffffff` |
| `--pf-toolbar-border` | `border-default` | `#e0e0e0` |
| `--pf-canvas-bg` | `background-secondary` | `#fafafa` |
| `--pf-grid-stroke` | `border-light` | `#e8e8e8` |
| `--pf-input-border` | `border-default` | `#d5d8dc` |
| `--pf-input-border-focus` | `focus-outline` | `#3498db` |

Tokens not in this list (e.g. node-variant fills, Chart.js-style category colors) keep hardcoded values because they aren't conventionally part of host palettes.

## Card color roles

Card types and individual nodes can opt into a **color role** that tracks the host theme automatically. Roles are class-driven, so changing the host theme repaints every card using that role with no JS work.

### Available roles

| Role | Tracks | Typical use |
|---|---|---|
| `success` | `--theme-color-status-success` | Start, success, complete |
| `warning` | `--theme-color-status-warning` | Decision, caution, conditional |
| `error` | `--theme-color-status-error` | Halt, error, abort |
| `info` | `--theme-color-status-info` | Informational, log, debug |
| `accent` | `--theme-color-brand-accent` | End, brand-flavored highlights |
| `neutral` | `--theme-color-text-primary` + `--theme-color-background-panel` | Default, generic |

Each role exposes `--pf-color-<role>` (the strong/title-bar color) and `--pf-color-<role>-soft` (a tinted body fill computed via `color-mix(...)` against the strong color). Hosts can override either token at any scope to retint a role globally.

### Built-in node types

The five default node types ship with roles wired up:

| Type | Role |
|---|---|
| `default` | `neutral` |
| `start` | `success` |
| `end` | `accent` |
| `halt` | `error` |
| `decision` | `warning` |

Their hex `TitleBarColor` / `BodyStyle` fields remain as fallbacks for code paths that bypass CSS (legacy consumers, exports). When the role's CSS class is in effect, those hex presentation attributes are overridden by the role rules — host themes propagate, but the hex values keep the editor presentable in unstyled contexts.

### Custom card types

```javascript
flowView._NodeTypeProvider.registerNodeType('my-card-type', {
    Hash: 'my-card-type',
    Label: 'My Card',
    DefaultPorts: [ /* … */ ],
    ColorRole: 'info',                     // theme-aware
    TitleBarColor: '#3498db',              // optional fallback
    BodyStyle: { fill: '#ebf5fb' }         // optional fallback
});
```

The renderer adds `pict-flow-node-color-info` to the node group; CSS handles the rest.

### Per-node overrides

A specific card can override the role its type defines:

```javascript
flowData.Nodes.push({
    Hash: 'node-special',
    Type: 'my-card-type',
    ColorRole: 'warning',                  // override the type's role
    // …
});
```

Set `ColorRole: 'none'` on a specific node to opt out of role styling entirely (useful when keeping a custom hex via `Style.BodyFill` etc.).

### Custom roles

To define new roles, add `--pf-color-<role>` / `--pf-color-<role>-soft` tokens at `.pict-flow-container` scope and matching `.pict-flow-node-color-<role>` CSS rules in your host stylesheet:

```css
.pict-flow-container {
    --pf-color-experimental: var(--theme-color-brand-primary, #6b8eff);
    --pf-color-experimental-soft: color-mix(in srgb, var(--pf-color-experimental) 14%, transparent);
}
.pict-flow-node-color-experimental .pict-flow-node-body {
    fill: var(--pf-color-experimental-soft);
    stroke: var(--pf-color-experimental);
    stroke-width: 1.5;
}
.pict-flow-node-color-experimental .pict-flow-node-title-bar,
.pict-flow-node-color-experimental .pict-flow-node-title-bar-bottom {
    fill: var(--pf-color-experimental);
}
```

## Arrowhead markers

`<marker>` elements live inside `<defs>` and don't pick up the same CSS variable cascade as regular SVG content in every browser. To make them theme-tracking, each generated polygon now carries a class (`pict-flow-arrowhead-default`, `pict-flow-arrowhead-selected`, `pict-flow-arrowhead-event-in`, …) and the corresponding CSS rule sets `fill` to the matching `--pf-…` token. The `fill="…"` attribute remains on the polygon as a graceful fallback when CSS can't reach it.

## Flow visual themes

The seven flow themes (`default`, `sketch`, `blueprint`, `mono`, `retro-80s`, `retro-90s`, `whiteboard`) ship with explicit `CSSVariables` and `AdditionalCSS` blocks. They layer on top of the host theme by emitting their overrides into `.pict-flow-container { … }`. Because `:root`-scoped host tokens have lower specificity than `.pict-flow-container`-scoped flow tokens, the visual theme always wins where it sets a value, and the host theme controls everything it doesn't.

The `default` flow theme intentionally sets no overrides — it lets the host theme drive the look.

## Disabling host integration

If a host wants the flow editor to ignore the host theme (e.g. to keep a fixed Sketch-style appearance regardless of the surrounding page), don't apply a host theme provider — or unsubscribe after construction by calling the dispose function returned via `flowView._HostThemeUnsubscribe`. This is rarely needed; flow visual themes already win where they care.
