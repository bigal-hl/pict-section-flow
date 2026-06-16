# pict-section-flow 2.0 Architecture Plan

Status: in progress, local only. Tracked as Plansheet Feature 89 under Vision 24
(Moodboards) and Vision 12 (Configurable Workflows).

This document is the reference for a major version of pict-section-flow that
extends the engine past its current "every node is a titled rectangular card
with edge ports" assumption, so it can drive a whiteboard, richer moodboards, a
read-only presentation surface, workflow connectors that do not look like cards,
and ERD diagrams, without breaking ultravisor.

## Goals

1. Place and move things on the canvas that do not look like cards (shapes,
   sticky notes, category boxes, text, images, connectors) and have them
   participate in saved layouts.
2. Do not break ultravisor. Its code should not change. Output of the default
   card renderer must stay identical.
3. Multiple named layouts of the same graph, with a default layout, persisted
   through a server backend. This is also an ultravisor capability.
4. A first-class read-only / presentation mode with controllable wheel behavior
   (the moodboard "scrolls and zooms too fast" problem).
5. A content frame: an origin, width, and preferred content end drawn as a
   dashed rectangle that read-only content fits into, optionally resizable.
6. A configurable canvas background (solid, image, grid, dots, none) set
   directly through pict-section-flow.
7. Connections that are first-class edges (labels, governance) and a lightweight
   connector/junction renderable, so workflow connectors stop being costume
   cards.
8. ERD diagrams: connections that anchor to a specific field row inside a card
   and route to a destination card or a field inside it, with cardinality
   markers.

## Locked decisions

1. Full renderable registry. Generalize the render dispatch, add a pluggable
   geometry and anchor seam, and add additive connection anchor descriptors.
   The card renderer stays the default so ultravisor output is identical.
2. Two pure-math modules: pict-provider-graphgeometry (shapes and anchors) under
   pict-provider-graphlayout (placement and routing).
3. New pict-section-whiteboard section. Moodboard becomes a sibling profile
   consumer.
4. pict-section-flow 2.0. The current 1.4 call-surface is the frozen backwards
   compatibility contract. Ultravisor gets a tested pin bump to 2.0 without any
   ultravisor code change.

## What already exists and is reused, not rebuilt

The engine is already decomposed the pict way behind a declarative service
registry in `source/views/PictView-Flow.js` (`_ServiceRegistry`, lines 193-241).
Adding a provider or service is one array entry. That registry is the backbone
of this plan: nearly everything below is additive.

- Multi-layout persistence with a pluggable storage backend. `SavedLayouts` is a
  real slot, `saveLayout` / `restoreLayout` work, and the storage seam is three
  Node-callback hooks (`storageWrite` / `storageRead` / `storageDelete`) in
  `source/providers/PictProvider-Flow-Layouts.js` (lines 70-169).
- Pluggable layout algorithms and edge routing, exported and registerable
  (`source/Pict-Section-Flow.js`, lines 40-62) via `registerAlgorithm` and
  `registerEdgeTheme`.
- An event system built to avoid monkey-patching, plus about 40 `Enable*` config
  flags including `EnableUndirectedConnections`, `EnableNodeResizing`,
  `EnableMultiSelect`, `EnableAlignmentGuides`.
- A custom-content hatch on node bodies (`BodyContent` with SVG/HTML/canvas and a
  `RenderCallback` that survives the JSON clone, in
  `source/providers/PictProvider-Flow-NodeTypes.js`, lines 139-147).

## The four real gaps

1. Rendering hardwires the card shape. `renderFlow()` is a flat bipartite loop
   (connections, then nodes, then panels) with no renderer dispatch
   (`source/services/PictService-Flow-RenderManager.js`, lines 50-100). The node
   view only knows `rect` vs `bracket` bodies. The node-type registry carries
   metadata but no renderer. Geometry is rectangle-only.
2. No read-only mode. Every mutating path is ungated. Moodboard fakes it with an
   `mb-readonly` CSS class that hides the flow's own ports and delete affordance.
3. No content bounds and a baked-in background. The canvas is an infinite
   10000x10000 grid rect hardcoded in the container template
   (`source/views/PictView-Flow.js`, lines 142-151). Moodboard paints
   `.pict-flow-container` directly and zeroes the grid fill to override it.
4. Connections anchor only to edge ports. No interior or field anchors, no
   first-class edge labels, no cardinality markers. Workflow transitions are a
   costume card (one node plus two edges). ERD field-to-field is impossible.

## Module topology and cut lines

```
pict-provider-graphgeometry   NEW, pure, DOM-free, lowest layer
   shape primitives:  rectangle, ellipse/circle, diamond, polygon, stacked-rows (ERD)
   anchor resolution: descriptor {Kind: port|field|edge|point|auto, ...} -> {x,y,dir} local coords
   port zone math:    today's PictProvider-Flow-Geometry, generalized past rectangles
   helpers:           edge-center, bounds, hit-test per shape
        ^ depended on by
pict-provider-graphlayout      NEW, pure, DOM-free
   placement:  Custom, Layered, ForcedFromCenter, Grid, Circular, Tabular, Columnar
   routing:    PathGenerator + edge themes Bezier/Orthogonal/Straight/OrthogonalSnap/Perimeter*
               plus a new obstacle-aware orthogonal for ERD
        ^ depended on by
pict-section-flow  2.0          the engine: rendering, interaction, viewport, panels, views
   NEW: renderable-renderer registry, anchor seam, read-only, frame, background provider, profiles
   keeps: _LayoutService / _PathGenerator / _GeometryProvider as thin adapters with identical
          method names, exports LayoutAlgorithms / EdgeThemes unchanged, deep export path shimmed
        ^ depended on by
pict-section-whiteboard NEW  |  pict-section-moodboard rewrite  |  ultravisor (unchanged)  |  plansheet pilots
```

Both new modules are plain Mocha-TDD pict-provider packages (the `modules/pict/`
convention). They stay local (file workspace link) until approved. Publishing,
the `Include-Retold-Module-List.sh` and `Retold-Modules.md` manifest entries, and
git init come last.

## The renderable architecture

Renderer contract, registered in flow and keyed like node types, with `card` as
the default branch (today's `PictView-Flow-Node`, unchanged):

```
render(node, layerElement, isSelected, typeConfig)    draws into the nodes layer, tags data-node-hash
resolveAnchor(node, anchorDescriptor, typeConfig)     optional; default delegates to graphgeometry by shape
getDefaultGeometry(typeConfig)                         optional shape descriptor
measure(node, typeConfig)                              optional; drives content sizing and size variants
```

Additive data, every field defaulting to today's behavior:

```
NodeType:    Renderer: 'card'   (default; or 'shape'|'sticky'|'text'|'image'|'category'|'connector')
Node:        SizeVariant: 'medium'   ('tiny'|'verbose'), stored so layouts preserve it
Connection:  Source/Target: { NodeHash, Anchor: {Kind, PortHash?, FieldKey?, Side?, X?, Y?} }
             Label, Data.Cardinality
             (legacy Source/TargetNodeHash + PortHash stay authoritative when present)
ViewState:   Background{Style,Color,Image,GridSize,DotSize}
             Frame{Enabled,X,Y,Width,Height,Resizable,FitOnLoad,ClampContent}
Config:      ReadOnly, WheelMode, WheelZoomRequiresModifier, WheelZoomSensitivity,
             DefaultLayoutHash, Profile, LayoutStorage{read,write,delete}
```

Free-floating items (sticky, category box, text) are nodes with a non-card
renderer and `Ports: []`. They ride the existing `Nodes[]` array, so they
participate in saved layouts with no new data structure. The ConnectionRenderer
resolves `Source.Anchor` through the node renderer when present and otherwise
falls back to the port-hash lookup, so directed port diagrams and ultravisor are
untouched.

Profiles expand into config bundles: `graph` (equals today, the implicit
default), `whiteboard`, `moodboard`, `presentation`, `erd`. Explicit options
override the profile. The host wires only a small documented set: data load and
save, layout storage, content renderers for custom card bodies, and event
callbacks (onCardActivate, onChanged).

## Backwards compatibility contract (ultravisor)

Preserve all of this; almost all of it is additive-only.

- Stable package exports including the deep path
  `pict-section-flow/source/PictFlowCardPropertiesPanel.js` that ultravisor
  imports directly. If a file moves, leave a re-export shim.
- The `NodeTypes` to `AdditionalNodeTypes` option alias
  (`source/views/PictView-Flow.js`, line 211).
- `_ThemeProvider.registerTheme(key, {CSSVariables})` with the `--pf-*` token
  meanings, `_ViewportManager.zoomToFit()`, `_NodesLayer` staying the live `<g>`,
  and every node group keeping its `data-node-hash` attribute (ultravisor's
  execution overlay queries it).
- `setFlowData` / `getFlowData` / `setTheme` / `render`, the
  `initialRenderComplete` reset, `PictFlowCard(fable, config, hash)
  .getNodeTypeConfiguration()` with `PortLabelsOutside`, custom panel-type
  registration, and `setFlowData` tolerating missing `OpenPanels` /
  `SavedLayouts`.
- All new behavior is off unless a profile or flag opts in.

Note: ultravisor currently pins `pict-section-flow: "^0.0.17"`, not 1.x. As part
of this work its pin is bumped to 2.0 and smoke-tested, with no ultravisor code
change, so backwards compatibility is verified for real.

## Phased build (all local until approved)

Phase 0, prep. Flow 2.0 working branch; skeletons for the two provider modules
with test harness and local workspace links so flow requires them without
publishing.

Phase 1, foundation, zero behavior change.
- 1a: extract pict-provider-graphgeometry. Pure shape and anchor math, own
  tests. Flow's `PictProvider-Flow-Geometry` becomes a thin delegate with
  identical method signatures. Gate: flow's full test suite green.
- 1b: extract pict-provider-graphlayout (PathGenerator + layouts/* + edges/*);
  introduce the renderable registry; convert `RenderManager.renderFlow` to
  dispatch by renderer with `card` as default, moving the port-enrichment block
  into the card renderer; add the connection anchor descriptor. Gate: flow tests
  green, ultravisor smoke render identical, ultravisor pinned to 2.0 locally and
  smoke-tested.

Phase 2, presentation and canvas. Background provider and layer, Frame service
and layer, read-only gating across InteractionManager and the toolbar, wheel
modes and sensitivity, and the profile system. Rewrite moodboard as a
moodboard-profile consumer and delete its monkey patches; migrate its data to
`ViewState.Background` / `Frame` and first-class connectors. Gate: moodboard
parity locally, flow tests and ultravisor smoke still green.

Phase 3, whiteboard. New pict-section-whiteboard with the whiteboard profile, the
shape/sticky/text/category renderers, and the tiny/medium/verbose size-variant
UI. Wire the plansheet whiteboard pilot. Gate: piles and arrangements save and
restore through the layout system locally.

Phase 4, connections. First-class edge labels and governed-edge data plus the
junction/connector renderable; rework retold-workflow transitions off the costume
card. Gate: workflow connectors no longer read as cards and round-trip.

Phase 5, ERD. Stacked-rows card renderer with per-field anchors, dynamic
per-field ports, crow's-foot markers in the connector-shapes provider,
obstacle-aware orthogonal routing, and the self-edge loop case. Wire a plansheet
ERD pilot. Gate: field-to-field connections route correctly.

Saved-layouts-with-a-default: DONE on the flow side. One saved layout is the
default, marked by an `IsDefault` flag on the layout object (it rides inside
`SavedLayouts`, no storage-shape change) rather than a separate
`DefaultLayoutHash` slot. The provider exposes
`setDefaultLayout`/`getDefaultLayout`/`applyDefaultLayout`; storage is config-driven
via `LayoutStorage { read, write, delete }`; `ApplyDefaultLayoutOnLoad` snaps to
the default on first render. A real server backend + a chosen default still get
wired into the ultravisor and plansheet consumers when they adopt flow 2.0.

Each phase ends green on flow tests plus an ultravisor smoke check plus the
relevant consumer working locally.
