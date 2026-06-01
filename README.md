# Pict-Section-Flow

> **[Read the Pict-Section-Flow Documentation](https://fable-retold.github.io/pict-section-flow/)**

[pict-section-flow on npm](https://www.npmjs.com/package/pict-section-flow) | [MIT License](LICENSE)

An interactive flow diagram section view for the Pict application framework. Build node-based visual editors, workflow designers, and data pipeline tools with a declarative, configuration-driven API.

Pict-Section-Flow provides a complete graph editing experience -- nodes, ports, connections, properties panels, theming, and layout persistence -- all composable through the Fable service provider pattern.

## Features

- **Node-Based Graph Editor** -- Drag-and-drop nodes with typed input/output ports and bezier or orthogonal connections
- **Custom Card Types** -- Define reusable node types with the `PictFlowCard` base class; register categories, icons, port constraints, and body content
- **Properties Panels** -- On-graph panels with four built-in types: Template, Markdown, Form, and View
- **Theming** -- Six built-in themes plus a CSS custom properties API with 70+ design tokens
- **Layout Persistence** -- Save and restore spatial arrangements to localStorage or any backend
- **Event System** -- Hook into 20+ lifecycle events for custom behavior without modifying core code
- **Viewport Controls** -- Pan, zoom, fullscreen, grid snap, zoom-to-fit, and auto-layout

## Installation

```bash
npm install pict-section-flow
```

## Quick Start

```javascript
const libPictSectionFlow = require('pict-section-flow');
const libPict = require('pict');

let _Pict = new libPict({ Product: 'MyFlowApp' });

// Register the flow view
_Pict.addView('MyFlow', {}, libPictSectionFlow);

// Add a node programmatically
let tmpFlowView = _Pict.views.MyFlow;
tmpFlowView.addNode('start', 50, 100, 'Begin');
tmpFlowView.addNode('end', 400, 100, 'Finish');
```

## Custom Card Types

Define reusable node types by extending `PictFlowCard`:

```javascript
const libPictFlowCard = require('pict-section-flow').PictFlowCard;

class IfThenElseCard extends libPictFlowCard
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, Object.assign({},
			{
				Title: 'If-Then-Else',
				Code: 'ITE',
				Category: 'Control Flow',
				TitleBarColor: '#e67e22',
				Inputs: [{ Name: 'Condition', Side: 'left' }],
				Outputs:
				[
					{ Name: 'Then', Side: 'right', PortType: 'event' },
					{ Name: 'Else', Side: 'bottom', PortType: 'error' }
				],
				PropertiesPanel:
				{
					PanelType: 'Markdown',
					Title: 'If-Then-Else',
					Configuration:
					{
						Markdown: '## Conditional Branch\nRoutes flow based on a boolean condition.'
					}
				}
			}, pOptions), pServiceHash);
	}
}
```

### Card Help from Markdown

Store help documentation as markdown files in `docs/card-help/` named by card code (e.g. `ITE.md`, `SET.md`). The build script converts them to HTML and generates a JavaScript module:

```bash
npm run generate-help
```

Reference the generated content in your card constructor:

```javascript
const libCardHelp = require('./card-help-content');

// In the constructor options object:
Help: libCardHelp['ITE'] || false,
```

The `|| false` fallback ensures the build never fails if a markdown file is missing.

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ViewIdentifier` | string | `'Pict-Flow'` | Unique view identifier |
| `FlowDataAddress` | string/false | `false` | AppData path for two-way binding |
| `EnableToolbar` | boolean | `true` | Show the toolbar UI |
| `EnablePanning` | boolean | `true` | Allow canvas panning |
| `EnableZooming` | boolean | `true` | Allow canvas zooming |
| `EnableNodeDragging` | boolean | `true` | Allow node repositioning |
| `EnableConnectionCreation` | boolean | `true` | Allow port-to-port connections |
| `EnableGridSnap` | boolean | `false` | Snap nodes to grid |
| `GridSnapSize` | number | `20` | Grid cell size in pixels |
| `MinZoom` | number | `0.1` | Minimum zoom level |
| `MaxZoom` | number | `5.0` | Maximum zoom level |
| `Theme` | string | `'default'` | Active theme key |

## Built-in Themes

| Theme | Style |
|-------|-------|
| `default` | Clean, modern, professional |
| `sketch` | Hand-drawn, informal |
| `blueprint` | Technical blueprint |
| `mono` | Monochrome |
| `retro-80s` | Neon retro |
| `retro-90s` | Vaporwave |

## Documentation

Full documentation is available at [https://fable-retold.github.io/pict-section-flow/](https://fable-retold.github.io/pict-section-flow/)

- [Getting Started](https://fable-retold.github.io/pict-section-flow/#/Getting_Started) -- First flow diagram in five minutes
- [Architecture](https://fable-retold.github.io/pict-section-flow/#/Architecture) -- Service/provider design and data flow
- [Implementation Reference](https://fable-retold.github.io/pict-section-flow/#/Implementation_Reference) -- Complete API surface
- [Custom Styling](https://fable-retold.github.io/pict-section-flow/#/Custom-Styling) -- CSS custom properties and theme API
- [Layout Persistence](https://fable-retold.github.io/pict-section-flow/#/Layout_Persistence) -- Save/restore with localStorage or REST

## API Reference (Function Docs)

Detailed per-function documentation with code snippets:

| Function | Description |
|----------|-------------|
| [addNode](docs/api/addNode.md) | Create a node on the canvas |
| [removeNode](docs/api/removeNode.md) | Delete a node and its connections |
| [addConnection](docs/api/addConnection.md) | Connect two ports |
| [removeConnection](docs/api/removeConnection.md) | Delete a connection |
| [getFlowData / setFlowData](docs/api/getFlowData.md) | Get or load entire flow state |
| [selectNode / deselectAll](docs/api/selectNode.md) | Manage selection state |
| [openPanel / closePanel / togglePanel](docs/api/openPanel.md) | Properties panel lifecycle |
| [setZoom / zoomToFit](docs/api/setZoom.md) | Viewport zoom controls |
| [autoLayout](docs/api/autoLayout.md) | Automatic topological layout |
| [setTheme / registerTheme](docs/api/setTheme.md) | Theme management |
| [registerHandler / fireEvent](docs/api/registerHandler.md) | Event system |
| [saveLayout / restoreLayout](docs/api/saveLayout.md) | Layout persistence |
| [marshalToView / marshalFromView](docs/api/marshalToView.md) | AppData two-way binding |
| [PictFlowCard](docs/api/PictFlowCard.md) | Custom node type base class |
| [PictFlowCardPropertiesPanel](docs/api/PictFlowCardPropertiesPanel.md) | Custom panel base class |
| [registerNodeType](docs/api/registerNodeType.md) | Node type registry |
| [screenToSVGCoords](docs/api/screenToSVGCoords.md) | Coordinate conversion |
| [toggleFullscreen](docs/api/toggleFullscreen.md) | Fullscreen mode |

## Related Packages

- [pict](https://github.com/fable-retold/pict) -- MVC application framework
- [pict-view](https://github.com/fable-retold/pict-view) -- View base class
- [pict-provider](https://github.com/fable-retold/pict-provider) -- Provider base class
- [pict-section-form](https://github.com/fable-retold/pict-section-form) -- Form sections (used for Form panels)
- [fable](https://github.com/fable-retold/fable) -- Service infrastructure

## License

MIT

## Contributing

Pull requests are welcome. For details on our code of conduct, contribution process, and testing requirements, see the [Retold Contributing Guide](https://github.com/stevenvelozo/retold/blob/main/docs/contributing.md).
