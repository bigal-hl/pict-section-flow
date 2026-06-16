const libPictView = require('pict-view');

const libPictServiceFlowInteractionManager = require('../services/PictService-Flow-InteractionManager.js');
const libPictServiceFlowConnectionRenderer = require('../services/PictService-Flow-ConnectionRenderer.js');
const libPictServiceFlowTether = require('../services/PictService-Flow-Tether.js');
const libPictServiceFlowLayout = require('../services/PictService-Flow-Layout.js');
const libPictServiceFlowPathGenerator = require('../services/PictService-Flow-PathGenerator.js');
const libPictServiceFlowViewportManager = require('../services/PictService-Flow-ViewportManager.js');
const libPictServiceFlowSelectionManager = require('../services/PictService-Flow-SelectionManager.js');
const libPictServiceFlowPanelManager = require('../services/PictService-Flow-PanelManager.js');
const libPictServiceFlowDataManager = require('../services/PictService-Flow-DataManager.js');
const libPictServiceFlowConnectionHandleManager = require('../services/PictService-Flow-ConnectionHandleManager.js');
const libPictServiceFlowRenderManager = require('../services/PictService-Flow-RenderManager.js');
const libPictServiceFlowPortRenderer = require('../services/PictService-Flow-PortRenderer.js');
const libPictServiceFlowCursorManager = require('../services/PictService-Flow-CursorManager.js');

const libPictProviderFlowNodeTypes = require('../providers/PictProvider-Flow-NodeTypes.js');
const libPictProviderFlowEventHandler = require('../providers/PictProvider-Flow-EventHandler.js');
const libPictProviderFlowLayouts = require('../providers/PictProvider-Flow-Layouts.js');
const libPictProviderFlowSVGHelpers = require('../providers/PictProvider-Flow-SVGHelpers.js');
const libPictProviderFlowGeometry = require('../providers/PictProvider-Flow-Geometry.js');
const libPictProviderFlowPanelChrome = require('../providers/PictProvider-Flow-PanelChrome.js');
const libPictProviderFlowCSS = require('../providers/PictProvider-Flow-CSS.js');
const libPictProviderFlowIcons = require('../providers/PictProvider-Flow-Icons.js');
const libPictProviderFlowConnectorShapes = require('../providers/PictProvider-Flow-ConnectorShapes.js');
const libPictProviderFlowTheme = require('../providers/PictProvider-Flow-Theme.js');
const libPictProviderFlowRenderer = require('../providers/PictProvider-Flow-Renderer.js');
const libPictProviderFlowStylePresets = require('../providers/PictProvider-Flow-StylePresets.js');
const libPictProviderFlowNoise = require('../providers/PictProvider-Flow-Noise.js');
const libPictProviderFlowBackground = require('../providers/PictProvider-Flow-Background.js');

const libPictViewFlowNode = require('./PictView-Flow-Node.js');
const libPictViewFlowToolbar = require('./PictView-Flow-Toolbar.js');
const libPictViewFlowFloatingToolbar = require('./PictView-Flow-FloatingToolbar.js');
const libPictViewFlowPropertiesPanel = require('./PictView-Flow-PropertiesPanel.js');

const libPictFlowCardPropertiesPanel = require('../PictFlowCardPropertiesPanel.js');
const libPanelTemplate = require('../panels/FlowCardPropertiesPanel-Template.js');
const libPanelMarkdown = require('../panels/FlowCardPropertiesPanel-Markdown.js');
const libPanelForm = require('../panels/FlowCardPropertiesPanel-Form.js');
const libPanelView = require('../panels/FlowCardPropertiesPanel-View.js');

const _DefaultConfiguration =
{
	ViewIdentifier: 'Pict-Flow',

	DefaultRenderable: 'Flow-Container',
	DefaultDestinationAddress: '#Flow-Container',

	AutoRender: false,

	FlowDataAddress: false,

	TargetElementAddress: '#Flow-SVG-Container',

	// Config profile: expands into a coherent bundle of the options below before
	// your explicit options apply. null/'graph' = the historical behavior; also
	// 'whiteboard', 'moodboard', 'presentation', 'erd'.
	Profile: null,

	EnableToolbar: true,
	EnableAddNode: true,
	EnableCardPalette: true,
	IncludeDefaultNodeTypes: true,
	EnablePanning: true,
	EnableZooming: true,
	EnableNodeDragging: true,
	EnableConnectionCreation: true,
	// When on, a connection can be drawn between ANY two ports (any port can start a drag, any port can
	// receive it), rather than only output -> input. Off by default so directed graphs (workflows) keep
	// their source/target semantics; free-form canvases (a moodboard, whose links are undirected) turn it
	// on so a card's ports connect in any direction.
	EnableUndirectedConnections: false,
	// When on, the selected node shows a bottom-right grip that resizes it by drag. Off by default
	// so existing diagrams are unaffected; free-form canvases (moodboards) turn it on.
	EnableNodeResizing: false,
	// When on, the selected node shows a rotate grip on an arm above it; drag it to set the node's
	// Rotation (degrees), Shift to snap to 15. Off by default; free-form canvases turn it on. The
	// properties panel can still set Rotation directly, so both ways work.
	EnableNodeRotation: false,
	EnableGridSnap: false,
	GridSnapSize: 20,
	// When on, several nodes can be selected at once: shift-click a node to toggle it, drag on the
	// empty canvas to marquee-select (shift+drag pans), and dragging any selected node moves them all.
	// Off by default so single-selection diagrams are unaffected; free-form canvases turn it on.
	EnableMultiSelect: false,
	// When on, dragging a single node shows alignment guide lines (and snaps) as its edges or centers
	// line up with other nodes. Off by default; free-form canvases turn it on.
	EnableAlignmentGuides: false,
	EnableLayoutMenu: true,

	// Read-only / presentation mode. When true, editing interactions are inert
	// (no drag, resize, connect, delete, panel edit); panning, zoom, selection,
	// and node activation still work, and an onNodeActivate event fires on a node
	// click so a host can show a read-only inspector. Toggle at runtime with
	// setReadOnly(). The container also gets a 'pict-flow-readonly' class so chrome
	// (ports, delete affordance, resize grips) can be hidden via CSS.
	ReadOnly: false,

	// Host-supplied toolbar buttons. Each entry is { Hash, Icon, Label?, Tooltip?, Active? } where Icon
	// is a flow icon-provider key (edit, check, background, ...). They render in BOTH the docked and the
	// floating toolbar (so they survive every toolbar mode) and, on click, fire onToolbarButton below.
	// Empty by default, so existing consumers are unaffected.
	ToolbarExtraButtons: [],
	// Fired when a ToolbarExtraButtons button is clicked: onToolbarButton(pHash, pElement). The element
	// lets the host anchor a popover next to the button. Off (false) by default.
	onToolbarButton: false,

	MinZoom: 0.1,
	MaxZoom: 5.0,
	ZoomStep: 0.1,

	// Mouse-wheel behavior. 'zoom' (default) keeps the historical wheel-zoom; set
	// 'pan' so the wheel scrolls the canvas (ctrl/cmd+wheel still zooms), or
	// 'none' to ignore the wheel. WheelZoomRequiresModifier makes a plain wheel
	// pan and only ctrl/cmd+wheel zoom while in 'zoom' mode (tames the
	// "scrolling zooms too fast" feel). Sensitivities scale the per-tick amount.
	WheelMode: 'zoom',
	WheelZoomRequiresModifier: false,
	WheelZoomSensitivity: 1,
	WheelPanSensitivity: 1,

	// Canvas background. false (default) keeps the built-in grid from the
	// container template. Set an object to control it natively:
	//   { Style: 'grid'|'dots'|'solid'|'image'|'none', Color?, Image?, GridSize?, DotSize? }
	// This replaces hand-painting the SVG from a consumer.
	Background: false,

	// Content frame: a dashed "page" rectangle in content space marking the
	// intended bounds (origin + width + preferred end). false (default) draws
	// nothing. Set { Enabled?, X, Y, Width, Height, FitOnLoad? }; fitToFrame()
	// fits it to the viewport (handy for read-only / presentation). Drag-to-resize
	// handles are a later addition.
	Frame: false,

	// Presentation fit. 'contain' (default) keeps the legacy fitToFrame/FitOnLoad
	// behavior. 'width' fits the frame's WIDTH to the container (anchored top-left
	// + FitTopMargin) and keeps it fit as the container resizes — the jumbotron /
	// background / fullscreen presentation. Content outside the frame bleeds.
	FitMode: 'contain',
	FitTopMargin: 0,

	// When true (and not read-only), the content frame gets drag handles: four edge
	// handles to set top/width/height and a move handle to reposition the view-area box.
	EnableFrameEditing: false,
	MinimumFrameSize: 40,

	DefaultNodeType: 'default',
	DefaultNodeWidth: 180,
	DefaultNodeHeight: 80,
	MinimumNodeWidth: 48,
	MinimumNodeHeight: 32,

	// Properties panel for connections (edges). Connections are not typed, so one config serves
	// them all: { PanelType, DefaultWidth, DefaultHeight, Title, Configuration }. When set, a
	// double-click on a connection opens this panel; when false, double-click adds a bezier handle.
	ConnectionPropertiesPanel: false,

	// Layout-algorithm subsystem defaults
	DefaultLayoutAlgorithm: 'Custom',
	DefaultLayoutParameters: {},
	DefaultLayoutAutoApply: false,

	// Saved layouts (named position snapshots). LayoutStorage lets a host wire a
	// server / IndexedDB backend by config instead of overriding the layout
	// provider's methods: { read(cb), write(layouts, cb), delete(cb) } with
	// Node-style cb(err, result). false (default) uses localStorage. When
	// ApplyDefaultLayoutOnLoad is on, the layout marked default is applied once
	// the graph first renders.
	LayoutStorage: false,
	ApplyDefaultLayoutOnLoad: false,

	// Edge-theme subsystem defaults — null = inherit from active layout's
	// `DefaultEdgeTheme` field, with hard fallback to 'Bezier'.
	DefaultEdgeTheme: null,
	DefaultEdgeThemeParameters: {},

	CSS: false,

	Templates:
	[
		{
			Hash: 'Flow-PanelChrome-Template',
			Template: /*html*/`<div class="pict-flow-panel" xmlns="http://www.w3.org/1999/xhtml"><div class="pict-flow-panel-titlebar" data-element-type="panel-titlebar" data-panel-hash="{~D:Record.Hash~}"><span class="pict-flow-panel-title-text">{~D:Record.Title~}</span><span class="pict-flow-panel-close-btn" data-element-type="panel-close" data-panel-hash="{~D:Record.Hash~}"><span class="pict-flow-panel-close-icon"></span></span></div><div class="pict-flow-panel-content" data-panel-hash="{~D:Record.Hash~}" onpointerdown="event.stopPropagation()" onwheel="event.stopPropagation()"><div class="pict-flow-panel-tab-pane active" data-tab="properties" data-panel-hash="{~D:Record.Hash~}"></div><div class="pict-flow-panel-tab-pane" data-tab="help" data-panel-hash="{~D:Record.Hash~}" style="display:none;"></div><div class="pict-flow-panel-tab-pane" data-tab="appearance" data-panel-hash="{~D:Record.Hash~}" style="display:none;"></div></div><div class="pict-flow-panel-resize-handle" data-element-type="panel-resize" data-panel-hash="{~D:Record.Hash~}"></div><div class="pict-flow-panel-tabbar" data-panel-hash="{~D:Record.Hash~}" onpointerdown="event.stopPropagation()" onwheel="event.stopPropagation()"><div class="pict-flow-panel-tab active" data-tab-target="properties" data-panel-hash="{~D:Record.Hash~}" onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._handlePanelTabClick(this, event)">Properties</div><div class="pict-flow-panel-tab" data-tab-target="help" data-panel-hash="{~D:Record.Hash~}" style="display:none;" onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._handlePanelTabClick(this, event)">Help</div><div class="pict-flow-panel-tab" data-tab-target="appearance" data-panel-hash="{~D:Record.Hash~}" onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._handlePanelTabClick(this, event)">Appearance</div></div></div>`
		},
		{
			Hash: 'Flow-Container-Template',
			// Inline pointer/wheel/contextmenu handlers route to the
			// InteractionManager via the FlowView. Keyboard events stay
			// document-level (no element-level inline equivalent).
			Template: /*html*/`
<div class="pict-flow-container" id="Flow-Wrapper-{~D:Record.ViewIdentifier~}">
	<div id="Flow-Toolbar-{~D:Record.ViewIdentifier~}"></div>
	<div id="Flow-FloatingToolbar-Container-{~D:Record.ViewIdentifier~}" style="display:none;position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:100;"></div>
	<div class="pict-flow-svg-container" id="Flow-SVG-Container-{~D:Record.ViewIdentifier~}">
		<svg class="pict-flow-svg"
			id="Flow-SVG-{~D:Record.ViewIdentifier~}"
			xmlns="http://www.w3.org/2000/svg"
			onpointerdown="_Pict.views['{~D:Record.ViewIdentifier~}']._handleSVGPointerDown(event)"
			onpointermove="_Pict.views['{~D:Record.ViewIdentifier~}']._handleSVGPointerMove(event)"
			onpointerup="_Pict.views['{~D:Record.ViewIdentifier~}']._handleSVGPointerUp(event)"
			onpointerleave="_Pict.views['{~D:Record.ViewIdentifier~}']._handleSVGPointerUp(event)"
			onwheel="_Pict.views['{~D:Record.ViewIdentifier~}']._handleSVGWheel(event)"
			oncontextmenu="_Pict.views['{~D:Record.ViewIdentifier~}']._handleSVGContextMenu(event)">
			<defs>
				<pattern id="flow-grid-{~D:Record.ViewIdentifier~}"
					width="20" height="20" patternUnits="userSpaceOnUse">
					<line x1="20" y1="0" x2="20" y2="20" class="pict-flow-grid-pattern" />
					<line x1="0" y1="20" x2="20" y2="20" class="pict-flow-grid-pattern" />
				</pattern>
			</defs>
			<rect width="10000" height="10000" x="-5000" y="-5000"
				fill="url(#flow-grid-{~D:Record.ViewIdentifier~})"
				class="pict-flow-grid-background" />
			<g class="pict-flow-viewport" id="Flow-Viewport-{~D:Record.ViewIdentifier~}">
				<g class="pict-flow-connections-layer" id="Flow-Connections-{~D:Record.ViewIdentifier~}"></g>
				<g class="pict-flow-nodes-layer" id="Flow-Nodes-{~D:Record.ViewIdentifier~}"></g>
				<g class="pict-flow-endpoints-layer" id="Flow-Endpoints-{~D:Record.ViewIdentifier~}"></g>
				<g class="pict-flow-port-hints-layer" id="Flow-PortHints-{~D:Record.ViewIdentifier~}"></g>
				<g class="pict-flow-tethers-layer" id="Flow-Tethers-{~D:Record.ViewIdentifier~}"></g>
				<g class="pict-flow-panels-layer" id="Flow-Panels-{~D:Record.ViewIdentifier~}"></g>
			</g>
		</svg>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: 'Flow-Container',
			TemplateHash: 'Flow-Container-Template',
			DestinationAddress: '#Flow-Container',
			RenderMethod: 'replace'
		}
	]
};

// Config profiles. Each is a partial option bundle that expands under the
// defaults and beneath the host's explicit options, so a single Profile knob
// gives a coherent setup that the host can still override field by field.
const _PROFILES =
{
	// Directed graph editor (the historical default). Empty so the defaults stand.
	graph: {},

	// Free-form whiteboard: undirected links, resize, multi-select + alignment
	// guides, wheel pans (ctrl/cmd zooms), dotted background, no layout menu.
	whiteboard:
	{
		EnableUndirectedConnections: true,
		EnableNodeResizing: true,
		EnableNodeRotation: true,
		EnableMultiSelect: true,
		EnableAlignmentGuides: true,
		EnableLayoutMenu: false,
		WheelMode: 'pan',
		WheelZoomRequiresModifier: true,
		Background: { Style: 'dots' }
	},

	// Moodboard: free-form content cards, undirected links, no default node types
	// or add-node button, edge-to-edge cards (no title bar), wheel pans.
	moodboard:
	{
		EnableUndirectedConnections: true,
		EnableNodeResizing: true,
		EnableNodeRotation: true,
		EnableAlignmentGuides: true,
		EnableAddNode: false,
		EnableLayoutMenu: false,
		IncludeDefaultNodeTypes: false,
		NodeTitleBarHeight: 0,
		WheelMode: 'pan',
		WheelZoomRequiresModifier: true,
		// Flat, light canvas (no grid) by default; a host can recolor it via setBackground.
		Background: { Style: 'solid', Color: '#f4f6f9' }
	},

	// Read-only presentation surface: no editing, no toolbar; plain wheel pans,
	// ctrl/cmd wheel zooms.
	presentation:
	{
		ReadOnly: true,
		EnableToolbar: false,
		WheelMode: 'pan',
		WheelZoomRequiresModifier: true
	},

	// Entity-relationship diagrams (fleshed out in a later phase). Orthogonal
	// edges read best for ERDs.
	erd:
	{
		DefaultEdgeTheme: 'Orthogonal'
	}
};

class PictViewFlow extends libPictView
{
	/**
	 * Merge a Profile's option bundle between the defaults and the host's
	 * explicit options: defaults < profile < pOptions. Pure (no side effects),
	 * so it is unit testable without constructing the view.
	 * @param {Object} pOptions - the host-supplied options (may name a Profile)
	 * @returns {Object} the fully merged option set
	 */
	static mergeProfileOptions(pOptions)
	{
		let tmpProfileName = (pOptions && pOptions.Profile) ? pOptions.Profile : (_DefaultConfiguration.Profile || 'graph');
		let tmpProfile = _PROFILES[tmpProfileName] || {};
		return Object.assign(
			{},
			JSON.parse(JSON.stringify(_DefaultConfiguration)),
			JSON.parse(JSON.stringify(tmpProfile)),
			pOptions || {});
	}

	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = PictViewFlow.mergeProfileOptions(pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'PictSectionFlow';

		// ---- Declarative service registry ----
		// Each entry defines a service to register, instantiate, and guard.
		// Optional flags:
		//   NoFlowView  — instantiate without { FlowView: this }
		//   PostInit    — method name to call on the instance after creation
		//   RegisterOnly — only register the type; do not bulk-instantiate
		this._ServiceRegistry =
		[
			// Providers (stateless or config-only — no FlowView needed)
			{ ServiceType: 'PictProviderFlowSVGHelpers',   Library: libPictProviderFlowSVGHelpers,   Property: '_SVGHelperProvider',    NoFlowView: true },
			{ ServiceType: 'PictProviderFlowGeometry',      Library: libPictProviderFlowGeometry,      Property: '_GeometryProvider',     NoFlowView: true },
			{ ServiceType: 'PictProviderFlowNoise',         Library: libPictProviderFlowNoise,         Property: '_NoiseProvider',        NoFlowView: true },

			// Providers (need FlowView)
			//   Renderer + StylePresets must be created before the legacy Theme
			//   shim (which delegates to them) and before CSS PostInit so that
			//   registerCSS() sees an initialized renderer.
			{ ServiceType: 'PictProviderFlowRenderer',      Library: libPictProviderFlowRenderer,      Property: '_RendererProvider' },
			{ ServiceType: 'PictProviderFlowStylePresets',  Library: libPictProviderFlowStylePresets,  Property: '_StylePresetsProvider' },
			{ ServiceType: 'PictProviderFlowTheme',         Library: libPictProviderFlowTheme,         Property: '_ThemeProvider' },
			{ ServiceType: 'PictProviderFlowCSS',           Library: libPictProviderFlowCSS,           Property: '_CSSProvider',          PostInit: 'registerCSS' },
			{ ServiceType: 'PictProviderFlowIcons',         Library: libPictProviderFlowIcons,         Property: '_IconProvider',         PostInit: 'registerIconTemplates' },
			{ ServiceType: 'PictProviderFlowConnectorShapes', Library: libPictProviderFlowConnectorShapes, Property: '_ConnectorShapesProvider' },
			{ ServiceType: 'PictProviderFlowPanelChrome',   Library: libPictProviderFlowPanelChrome,   Property: '_PanelChromeProvider' },
			{ ServiceType: 'PictProviderFlowNodeTypes',     Library: libPictProviderFlowNodeTypes,     Property: '_NodeTypeProvider',   ExtraOptions: () => ({ AdditionalNodeTypes: this.options.NodeTypes, IncludeDefaultNodeTypes: this.options.IncludeDefaultNodeTypes }) },
			{ ServiceType: 'PictProviderFlowEventHandler',  Library: libPictProviderFlowEventHandler,  Property: '_EventHandlerProvider' },
			{ ServiceType: 'PictProviderFlowLayouts',       Library: libPictProviderFlowLayouts,       Property: '_LayoutProvider',       PostInit: 'loadPersistedLayouts' },
			{ ServiceType: 'PictProviderFlowBackground',    Library: libPictProviderFlowBackground,    Property: '_BackgroundProvider' },

			// Services
			{ ServiceType: 'PictServiceFlowPathGenerator',           Library: libPictServiceFlowPathGenerator,           Property: '_PathGenerator' },
			{ ServiceType: 'PictServiceFlowDataManager',             Library: libPictServiceFlowDataManager,             Property: '_DataManager' },
			{ ServiceType: 'PictServiceFlowConnectionHandleManager', Library: libPictServiceFlowConnectionHandleManager, Property: '_ConnectionHandleManager' },
			{ ServiceType: 'PictServiceFlowRenderManager',           Library: libPictServiceFlowRenderManager,           Property: '_RenderManager' },
			{ ServiceType: 'PictServiceFlowPortRenderer',            Library: libPictServiceFlowPortRenderer,            Property: '_PortRenderer' },
			{ ServiceType: 'PictServiceFlowInteractionManager',      Library: libPictServiceFlowInteractionManager,      Property: '_InteractionManager' },
			{ ServiceType: 'PictServiceFlowCursorManager',           Library: libPictServiceFlowCursorManager,           Property: '_CursorManager' },
			{ ServiceType: 'PictServiceFlowConnectionRenderer',      Library: libPictServiceFlowConnectionRenderer,      Property: '_ConnectionRenderer' },
			{ ServiceType: 'PictServiceFlowTether',                  Library: libPictServiceFlowTether,                  Property: '_TetherService' },
			{ ServiceType: 'PictServiceFlowLayout',                  Library: libPictServiceFlowLayout,                  Property: '_LayoutService' },
			{ ServiceType: 'PictServiceFlowViewportManager',         Library: libPictServiceFlowViewportManager,         Property: '_ViewportManager' },
			{ ServiceType: 'PictServiceFlowSelectionManager',        Library: libPictServiceFlowSelectionManager,        Property: '_SelectionManager' },
			{ ServiceType: 'PictServiceFlowPanelManager',            Library: libPictServiceFlowPanelManager,            Property: '_PanelManager' },

			// View types (register only — instantiated with custom config in onAfterInitialRender)
			{ ServiceType: 'PictViewFlowNode',             Library: libPictViewFlowNode,             RegisterOnly: true },
			{ ServiceType: 'PictViewFlowToolbar',          Library: libPictViewFlowToolbar,          RegisterOnly: true },
			{ ServiceType: 'PictViewFlowFloatingToolbar',  Library: libPictViewFlowFloatingToolbar,  RegisterOnly: true },
			{ ServiceType: 'PictViewFlowPropertiesPanel',  Library: libPictViewFlowPropertiesPanel,  RegisterOnly: true },

			// Panel types (register only)
			{ ServiceType: 'PictFlowCardPropertiesPanel',           Library: libPictFlowCardPropertiesPanel,  RegisterOnly: true },
			{ ServiceType: 'PictFlowCardPropertiesPanel-Template',  Library: libPanelTemplate,               RegisterOnly: true },
			{ ServiceType: 'PictFlowCardPropertiesPanel-Markdown',  Library: libPanelMarkdown,               RegisterOnly: true },
			{ ServiceType: 'PictFlowCardPropertiesPanel-Form',      Library: libPanelForm,                   RegisterOnly: true },
			{ ServiceType: 'PictFlowCardPropertiesPanel-View',      Library: libPanelView,                   RegisterOnly: true }
		];

		this._registerServiceTypes();

		// Internal state
		this._FlowData = {
			Nodes: [],
			Connections: [],
			OpenPanels: [],
			SavedLayouts: [],
			ViewState: {
				PanX: 0,
				PanY: 0,
				Zoom: 1,
				SelectedNodeHash: null,
				// The full selection set (multi-select). SelectedNodeHash stays the primary / most
				// recently touched member for backward compatibility; single-select keeps it == [hash].
				SelectedNodeHashes: [],
				SelectedConnectionHash: null,
				SelectedTetherHash: null
			},
			LayoutAlgorithm: this.options.DefaultLayoutAlgorithm || 'Custom',
			LayoutParameters: JSON.parse(JSON.stringify(this.options.DefaultLayoutParameters || {})),
			LayoutAutoApply: !!this.options.DefaultLayoutAutoApply,
			EdgeTheme: this.options.DefaultEdgeTheme || null,
			EdgeThemeParameters: JSON.parse(JSON.stringify(this.options.DefaultEdgeThemeParameters || {}))
		};

		// Re-entrancy guard for the auto-apply event handler
		this._AutoApplyInProgress = false;
		this._AutoApplyHandlerHashes = [];

		this._SVGElement = null;
		this._ViewportElement = null;
		this._NodesLayer = null;
		this._ConnectionsLayer = null;
		this._EndpointsLayer = null;
		this._PortHintsLayer = null;
		this._TethersLayer = null;
		this._PanelsLayer = null;

		this._DataManager = null;
		this._ConnectionHandleManager = null;
		this._RenderManager = null;
		this._PortRenderer = null;

		this._InteractionManager = null;
		this._CursorManager = null;
		this._ConnectionRenderer = null;
		this._TetherService = null;
		this._LayoutService = null;
		this._PathGenerator = null;
		this._ViewportManager = null;
		this._SelectionManager = null;
		this._PanelManager = null;
		this._CSSProvider = null;
		this._IconProvider = null;
		this._ConnectorShapesProvider = null;
		this._ThemeProvider = null;
		this._RendererProvider = null;
		this._StylePresetsProvider = null;
		this._NoiseProvider = null;
		this._SVGHelperProvider = null;
		this._GeometryProvider = null;
		this._PanelChromeProvider = null;
		this._NodeTypeProvider = null;
		this._LayoutProvider = null;
		this._BackgroundProvider = null;
		this._EventHandlerProvider = null;
		this._NodeView = null;
		this._ToolbarView = null;
		this._PropertiesPanelView = null;

		// Registry of renderable renderers keyed by RenderableType. The default
		// 'card' renderer (the node view) is registered once it exists; consumers
		// register additional renderers (shape, sticky, text, image, category,
		// connector) to draw renderables that are not cards.
		this._RenderableRenderers = {};

		// Read-only / presentation flag (runtime; defaults to the option).
		this._ReadOnly = !!this.options.ReadOnly;

		// In read-only, canvas pan + wheel-zoom are OFF by default (the wheel scrolls the page and the
		// canvas reads as static content). A host flips it on with a "hand" toggle via
		// setReadOnlyNavigation. No effect in edit mode.
		this._ReadOnlyNavigation = false;

		this.initialRenderComplete = false;
	}

	_registerServiceTypes()
	{
		for (let i = 0; i < this._ServiceRegistry.length; i++)
		{
			let tmpEntry = this._ServiceRegistry[i];
			if (!this.fable.servicesMap.hasOwnProperty(tmpEntry.ServiceType))
			{
				this.fable.addServiceType(tmpEntry.ServiceType, tmpEntry.Library);
			}
		}
	}

	/**
	 * Register a renderable renderer under a key. The default 'card' renderer is
	 * the node view; consumers register additional renderers (shape, sticky,
	 * text, image, category, connector) to draw non-card renderables. A renderer
	 * must expose renderNode(node, layerElement, isSelected, typeConfig).
	 * @param {string} pKey
	 * @param {Object} pRenderer
	 * @returns {boolean}
	 */
	registerRenderableRenderer(pKey, pRenderer)
	{
		if (!pKey || !pRenderer)
		{
			return false;
		}
		this._RenderableRenderers[pKey] = pRenderer;
		return true;
	}

	/**
	 * Resolve the renderable renderer for a node. A node type may name its
	 * renderer via the RenderableType field (default 'card'); unknown keys fall
	 * back to the card renderer so existing diagrams are unaffected.
	 * @param {Object} pNode
	 * @param {Object} pNodeTypeConfig
	 * @returns {Object} a renderer exposing renderNode(...)
	 */
	resolveRenderableRenderer(pNode, pNodeTypeConfig)
	{
		// A node may name its renderer directly via pNode.RenderableType (wins), else
		// the node type config's RenderableType, else the default 'card'. The node-level
		// override lets a free-form canvas mint shape/sticky/text renderables without
		// registering a node type for each. Unknown keys fall back to card so existing
		// diagrams are unaffected.
		let tmpKey = 'card';
		if (pNode && typeof pNode.RenderableType === 'string' && pNode.RenderableType)
		{
			tmpKey = pNode.RenderableType;
		}
		else if (pNodeTypeConfig && pNodeTypeConfig.RenderableType)
		{
			tmpKey = pNodeTypeConfig.RenderableType;
		}
		return this._RenderableRenderers[tmpKey] || this._RenderableRenderers['card'] || this._NodeView;
	}

	/**
	 * Apply the configured canvas background to the live SVG. No-op when no
	 * Background is configured (the template grid stands). Safe to call on every
	 * render; idempotent.
	 */
	_applyBackground()
	{
		if (this._BackgroundProvider)
		{
			return this._BackgroundProvider.apply(this);
		}
		return false;
	}

	/**
	 * Set the canvas background and repaint it. Pass an object
	 * { Style, Color?, Image?, GridSize?, DotSize? } or false to clear it back to
	 * the template grid. Stored on ViewState so it travels with the flow data.
	 * @param {Object|false} pBackground
	 */
	setBackground(pBackground)
	{
		this._FlowData.ViewState.Background = pBackground || null;
		return this._applyBackground();
	}

	/**
	 * Whether the flow is in read-only / presentation mode.
	 * @returns {boolean}
	 */
	isReadOnly()
	{
		return !!this._ReadOnly;
	}

	/**
	 * Toggle read-only / presentation mode at runtime. Editing interactions go
	 * inert; the container gets the 'pict-flow-readonly' class so chrome can be
	 * hidden via CSS. Repaints so port/grip visibility updates.
	 * @param {boolean} pReadOnly
	 * @returns {boolean} the new read-only state
	 */
	setReadOnly(pReadOnly)
	{
		this._ReadOnly = !!pReadOnly;
		// Navigation is a read-only concept; leaving read-only clears it.
		if (!this._ReadOnly) { this._ReadOnlyNavigation = false; }
		this._applyReadOnlyClass();
		if (this._CursorManager) { this._CursorManager.update(); }
		if (this.initialRenderComplete)
		{
			this.renderFlow();
		}
		return this._ReadOnly;
	}

	/**
	 * Whether read-only canvas navigation (pan + wheel-zoom) is enabled. When off
	 * (the default in read-only), the wheel scrolls the page and the canvas does
	 * not pan, so it reads as static content.
	 * @returns {boolean}
	 */
	isReadOnlyNavigation()
	{
		return !!this._ReadOnlyNavigation;
	}

	/**
	 * Turn read-only canvas navigation (pan + wheel-zoom) on or off. This is the
	 * "hand" toggle for a presentation surface; it has no effect in edit mode.
	 * @param {boolean} pOn
	 * @returns {boolean} the new navigation state
	 */
	setReadOnlyNavigation(pOn)
	{
		this._ReadOnlyNavigation = !!pOn;
		this._applyReadOnlyClass();
		if (this._CursorManager) { this._CursorManager.update(); }
		if (this._EventHandlerProvider)
		{
			this._EventHandlerProvider.fireEvent('onReadOnlyNavigationChanged', this._ReadOnlyNavigation);
		}
		return this._ReadOnlyNavigation;
	}

	/**
	 * Reflect the read-only flag as a class on the flow container so CSS can hide
	 * editing chrome (ports, delete affordance, resize grips). Internal.
	 */
	_applyReadOnlyClass()
	{
		let tmpWrapper = this.pict.ContentAssignment.getElement(`#Flow-Wrapper-${this.options.ViewIdentifier}`);
		if (tmpWrapper && tmpWrapper.length > 0 && tmpWrapper[0].classList)
		{
			if (this._ReadOnly)
			{
				tmpWrapper[0].classList.add('pict-flow-readonly');
			}
			else
			{
				tmpWrapper[0].classList.remove('pict-flow-readonly');
			}
			// 'navigating' = read-only with pan/zoom enabled; drives the grab cursor.
			if (this._ReadOnly && this._ReadOnlyNavigation)
			{
				tmpWrapper[0].classList.add('pict-flow-navigating');
			}
			else
			{
				tmpWrapper[0].classList.remove('pict-flow-navigating');
			}
		}
	}

	/**
	 * Resolve the effective content frame: ViewState wins, then the option.
	 * @returns {Object|null}
	 */
	_resolveFrame()
	{
		let tmpFrame = (this._FlowData && this._FlowData.ViewState && this._FlowData.ViewState.Frame)
			? this._FlowData.ViewState.Frame
			: this.options.Frame;
		return (tmpFrame && typeof tmpFrame === 'object') ? tmpFrame : null;
	}

	/**
	 * Set (or clear, with false) the content frame and repaint it. Stored on
	 * ViewState so it travels with the flow data.
	 * @param {Object|false} pFrame
	 */
	setFrame(pFrame)
	{
		this._FlowData.ViewState.Frame = (pFrame && typeof pFrame === 'object') ? pFrame : null;
		this._applyFrame();
		return this._FlowData.ViewState.Frame;
	}

	/**
	 * Read the effective content frame (ViewState wins, then the option), or null
	 * when none is set. The public read counterpart to setFrame.
	 * @returns {Object|null}
	 */
	getFrame()
	{
		return this._resolveFrame();
	}

	/**
	 * Toggle the content frame's drag handles at runtime (e.g. an editor turning on
	 * "set the view area"). Repaints the frame so the handles appear / disappear.
	 * @param {boolean} pEnabled
	 * @returns {boolean}
	 */
	setFrameEditing(pEnabled)
	{
		this.options.EnableFrameEditing = !!pEnabled;
		this._applyFrame();
		return this.options.EnableFrameEditing;
	}

	/**
	 * Draw, update, or remove the content-frame rectangle inside the viewport
	 * group (behind the content layers). No-op until the viewport exists.
	 */
	_applyFrame()
	{
		if (!this._ViewportElement) return;

		let tmpId = `Flow-Frame-${this.options.ViewIdentifier}`;
		let tmpExisting = this._ViewportElement.querySelector(`#${tmpId}`);
		let tmpFrame = this._resolveFrame();

		if (!tmpFrame || tmpFrame.Enabled === false || !tmpFrame.Width || !tmpFrame.Height)
		{
			if (tmpExisting) tmpExisting.remove();
			return;
		}

		let tmpRect = tmpExisting;
		if (!tmpRect)
		{
			tmpRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			tmpRect.setAttribute('id', tmpId);
			tmpRect.setAttribute('class', 'pict-flow-frame');
			// First child of the viewport group: behind connections and nodes.
			this._ViewportElement.insertBefore(tmpRect, this._ViewportElement.firstChild);
		}
		tmpRect.setAttribute('x', tmpFrame.X || 0);
		tmpRect.setAttribute('y', tmpFrame.Y || 0);
		tmpRect.setAttribute('width', tmpFrame.Width);
		tmpRect.setAttribute('height', tmpFrame.Height);

		this._applyFrameHandles(tmpFrame);
	}

	/**
	 * Draw, refresh, or remove the content frame's drag handles. Shown only when
	 * EnableFrameEditing is on and the view is editable: four edge handles (set top /
	 * width / height) and a move handle at the top-left. Rendered on top of the content
	 * (appended last in the viewport) so they are grabbable; their data-element-type routes
	 * pointer-down to the InteractionManager's frame edit paths.
	 * @param {Object} pFrame - the resolved frame ({X,Y,Width,Height})
	 */
	_applyFrameHandles(pFrame)
	{
		if (!this._ViewportElement) return;

		let tmpId = `Flow-FrameHandles-${this.options.ViewIdentifier}`;
		let tmpExisting = this._ViewportElement.querySelector(`#${tmpId}`);
		if (tmpExisting) tmpExisting.remove();

		let tmpEditable = this.options.EnableFrameEditing
			&& !(typeof this.isReadOnly === 'function' && this.isReadOnly())
			&& pFrame && pFrame.Width && pFrame.Height;
		if (!tmpEditable) return;

		let tmpX = pFrame.X || 0;
		let tmpY = pFrame.Y || 0;
		let tmpW = pFrame.Width;
		let tmpH = pFrame.Height;
		let tmpSize = 12;

		let tmpGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		tmpGroup.setAttribute('id', tmpId);
		tmpGroup.setAttribute('class', 'pict-flow-frame-handles');

		let tmpHandles =
		[
			{ Edge: 'n', Type: 'frame-resize', CX: tmpX + tmpW / 2, CY: tmpY },
			{ Edge: 's', Type: 'frame-resize', CX: tmpX + tmpW / 2, CY: tmpY + tmpH },
			{ Edge: 'e', Type: 'frame-resize', CX: tmpX + tmpW, CY: tmpY + tmpH / 2 },
			{ Edge: 'w', Type: 'frame-resize', CX: tmpX, CY: tmpY + tmpH / 2 },
			{ Edge: 'move', Type: 'frame-move', CX: tmpX, CY: tmpY }
		];
		for (let i = 0; i < tmpHandles.length; i++)
		{
			let tmpHandle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			tmpHandle.setAttribute('class', 'pict-flow-frame-handle pict-flow-frame-handle-' + tmpHandles[i].Edge);
			tmpHandle.setAttribute('x', String(tmpHandles[i].CX - tmpSize / 2));
			tmpHandle.setAttribute('y', String(tmpHandles[i].CY - tmpSize / 2));
			tmpHandle.setAttribute('width', String(tmpSize));
			tmpHandle.setAttribute('height', String(tmpSize));
			tmpHandle.setAttribute('rx', '2');
			tmpHandle.setAttribute('data-element-type', tmpHandles[i].Type);
			if (tmpHandles[i].Edge !== 'move')
			{
				tmpHandle.setAttribute('data-frame-edge', tmpHandles[i].Edge);
			}
			tmpGroup.appendChild(tmpHandle);
		}
		this._ViewportElement.appendChild(tmpGroup);
	}

	/**
	 * Fit the viewport to the content frame (zoom + pan so it fills the view).
	 * @returns {boolean}
	 */
	fitToFrame()
	{
		return this._ViewportManager ? this._ViewportManager.fitToFrame(this._resolveFrame()) : false;
	}

	/**
	 * Fit the viewport so the content frame's WIDTH fills the view (anchored top-left + an
	 * optional top margin), letting content bleed past and vertical overflow scroll. This is
	 * the presentation fit a jumbotron / background board uses; fitToFrame() contains instead.
	 * @param {Object} [pOptions] - { TopMargin }
	 * @returns {boolean}
	 */
	fitToWidth(pOptions)
	{
		if (!this._ViewportManager) return false;
		let tmpOptions = pOptions || {};
		if (typeof tmpOptions.TopMargin !== 'number')
		{
			tmpOptions = { TopMargin: this.options.FitTopMargin || 0 };
		}
		return this._ViewportManager.fitToFrameWidth(this._resolveFrame(), tmpOptions);
	}

	/**
	 * When FitMode is 'width', fit the frame to the container width now and keep it fit as the
	 * container resizes (a ResizeObserver, the documented exception to the no-listener rule).
	 * No-op without a frame or when FitMode is not 'width'.
	 */
	_setupFitObserver()
	{
		if (this.options.FitMode !== 'width' || !this._resolveFrame())
		{
			// Not width-fit (e.g. switched back to 'contain'): drop any observer we
			// installed so a stale ResizeObserver does not keep re-fitting the canvas.
			this._teardownFitObserver();
			return;
		}
		this.fitToWidth();
		if ((typeof ResizeObserver !== 'undefined') && this._SVGElement)
		{
			// (Re)observe the CURRENT SVG element. A re-render (e.g. a host toggling presentation mode)
			// can replace the SVG, which would leave a previously-installed observer watching a stale,
			// detached node — so re-point it whenever the observed element has changed.
			if (this._FitObserver && this._FitObservedElement === this._SVGElement) { return; }
			this._teardownFitObserver();
			let tmpSelf = this;
			this._FitObserver = new ResizeObserver(function () { tmpSelf.fitToWidth(); });
			this._FitObserver.observe(this._SVGElement);
			this._FitObservedElement = this._SVGElement;
		}
	}

	/**
	 * Disconnect the width-fit ResizeObserver, if one is installed. Called when a
	 * consumer leaves 'width' FitMode (e.g. a moodboard switching back to canvas)
	 * so the observer stops firing. Safe to call when no observer exists.
	 */
	_teardownFitObserver()
	{
		if (this._FitObserver)
		{
			this._FitObserver.disconnect();
			this._FitObserver = null;
		}
		this._FitObservedElement = null;
	}

	_instantiateServices()
	{
		for (let i = 0; i < this._ServiceRegistry.length; i++)
		{
			let tmpEntry = this._ServiceRegistry[i];
			if (tmpEntry.RegisterOnly) continue;
			if (this[tmpEntry.Property]) continue;

			let tmpOptions = tmpEntry.NoFlowView ? {} : { FlowView: this };
			if (typeof tmpEntry.ExtraOptions === 'function')
			{
				Object.assign(tmpOptions, tmpEntry.ExtraOptions());
			}

			this[tmpEntry.Property] = this.fable.instantiateServiceProviderWithoutRegistration(tmpEntry.ServiceType, tmpOptions);

			if (tmpEntry.PostInit && typeof this[tmpEntry.Property][tmpEntry.PostInit] === 'function')
			{
				this[tmpEntry.Property][tmpEntry.PostInit]();
			}
		}
	}

	get flowData()
	{
		return this._FlowData;
	}

	get viewState()
	{
		return this._FlowData.ViewState;
	}

	// Backward-compatible getter for InteractionManager direct access
	get _IsFullscreen()
	{
		return this._ViewportManager ? this._ViewportManager._IsFullscreen : false;
	}

	/**
	 * Override render to pass view options as the template record,
	 * so template expressions like {~D:Record.ViewIdentifier~} resolve correctly.
	 */
	render(pRenderableHash, pRenderDestinationAddress)
	{
		return super.render(pRenderableHash, pRenderDestinationAddress, this.options);
	}

	renderAsync(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, pRootRenderable, fCallback)
	{
		// If no record address is explicitly provided, use this.options as the record
		if (typeof pTemplateRecordAddress === 'function' || typeof pTemplateRecordAddress === 'undefined')
		{
			return super.renderAsync(pRenderableHash, pRenderDestinationAddress, this.options, pRootRenderable, pTemplateRecordAddress || fCallback);
		}
		return super.renderAsync(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, pRootRenderable, fCallback);
	}

	onBeforeInitialize()
	{
		super.onBeforeInitialize();

		// Noise + Renderer + StylePresets + Theme shim must be created before
		// CSS PostInit so registerCSS() sees an initialized renderer + presets.
		this._NoiseProvider          = this.fable.instantiateServiceProviderWithoutRegistration('PictProviderFlowNoise');
		this._RendererProvider       = this.fable.instantiateServiceProviderWithoutRegistration('PictProviderFlowRenderer', { FlowView: this });
		this._StylePresetsProvider   = this.fable.instantiateServiceProviderWithoutRegistration('PictProviderFlowStylePresets', { FlowView: this });
		this._ThemeProvider          = this.fable.instantiateServiceProviderWithoutRegistration('PictProviderFlowTheme',     { FlowView: this });

		// Apply initial style preset / per-axis overrides from options.
		// `Theme` and `StylePreset` are aliases for the same preset-by-hash apply.
		let tmpInitialPreset = this.options.StylePreset || this.options.Theme;
		if (tmpInitialPreset)
		{
			this._StylePresetsProvider.applyPreset(tmpInitialPreset);
		}
		if (this.options.Renderer)
		{
			this._RendererProvider.setRenderer(this.options.Renderer);
			this._StylePresetsProvider.markCustomized();
		}
		if (typeof this.options.NoiseLevel === 'number')
		{
			this._RendererProvider.setNoiseLevel(this.options.NoiseLevel);
		}

		// Instantiate all remaining services (skips Noise/Renderer/StylePresets/Theme
		// since already set above)
		this._instantiateServices();

		// Now that CSSProvider exists, inject the active renderer's GeometryCSS.
		if (this._CSSProvider && typeof this._CSSProvider.registerRendererCSS === 'function')
		{
			this._CSSProvider.registerRendererCSS(this._RendererProvider.getActiveRenderer());
		}

		// Subscribe to the host application's pict-provider-theme so the flow
		// editor's marker arrowhead colors and shape overrides update when the
		// host swaps light/dark or palette themes. CSS variables (--theme-*)
		// re-resolve automatically — only the SVG <marker> defs (which inline
		// fill colors at build time) and ConnectorShapesProvider state need a
		// manual refresh.
		this._subscribeToHostTheme();

		return super.onBeforeInitialize();
	}

	/**
	 * If the host application has registered pict-provider-theme, subscribe
	 * to its onApply hook so we can refresh anything that doesn't pick up
	 * the new --theme-* CSS variables automatically (SVG marker fills,
	 * connector shape overrides). No-op when no host theme provider is
	 * available — the flow editor still functions with its built-in themes.
	 */
	_subscribeToHostTheme()
	{
		let tmpHostTheme = this._resolveHostThemeProvider();
		if (!tmpHostTheme || typeof tmpHostTheme.onApply !== 'function') return;

		this._HostThemeUnsubscribe = tmpHostTheme.onApply(() =>
		{
			if (this._CSSProvider) this._CSSProvider.registerCSS();
			this._reinjectMarkerDefs();
			if (this.initialRenderComplete) this.renderFlow();
		});
	}

	/**
	 * Locate the host's pict-provider-theme instance. It is normally
	 * registered under a stable service hash by the host app; we check
	 * common locations so consumers don't have to wire it manually.
	 * @returns {Object|null}
	 */
	_resolveHostThemeProvider()
	{
		let tmpPict = this.pict;
		if (!tmpPict) return null;
		if (tmpPict.providers)
		{
			let tmpKeys = Object.keys(tmpPict.providers);
			for (let i = 0; i < tmpKeys.length; i++)
			{
				let tmpProvider = tmpPict.providers[tmpKeys[i]];
				if (tmpProvider
					&& typeof tmpProvider.onApply === 'function'
					&& typeof tmpProvider.applyTheme === 'function'
					&& typeof tmpProvider.listThemes === 'function')
				{
					return tmpProvider;
				}
			}
		}
		return null;
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		if (!this.initialRenderComplete)
		{
			this.onAfterInitialRender();
			this.initialRenderComplete = true;
		}
		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	onAfterInitialRender()
	{
		let tmpViewIdentifier = this.options.ViewIdentifier;

		// Grab SVG DOM elements
		let tmpSVGElements = this.pict.ContentAssignment.getElement(`#Flow-SVG-${tmpViewIdentifier}`);
		if (tmpSVGElements.length < 1)
		{
			this.log.error(`PictSectionFlow could not find SVG element #Flow-SVG-${tmpViewIdentifier}`);
			return false;
		}
		this._SVGElement = tmpSVGElements[0];

		// Paint a configured background (no-op when none is set; template grid stands).
		this._applyBackground();

		// Reflect read-only mode on the container (drives chrome-hiding CSS).
		this._applyReadOnlyClass();

		// Set the initial canvas cursor from the (idle) state + current mode.
		if (this._CursorManager) { this._CursorManager.update(); }

		let tmpViewportElements = this.pict.ContentAssignment.getElement(`#Flow-Viewport-${tmpViewIdentifier}`);
		if (tmpViewportElements.length > 0)
		{
			this._ViewportElement = tmpViewportElements[0];
		}

		// Draw the content frame, if configured (needs the viewport <g>).
		this._applyFrame();

		let tmpNodesElements = this.pict.ContentAssignment.getElement(`#Flow-Nodes-${tmpViewIdentifier}`);
		if (tmpNodesElements.length > 0)
		{
			this._NodesLayer = tmpNodesElements[0];
		}

		let tmpConnectionsElements = this.pict.ContentAssignment.getElement(`#Flow-Connections-${tmpViewIdentifier}`);
		if (tmpConnectionsElements.length > 0)
		{
			this._ConnectionsLayer = tmpConnectionsElements[0];
		}

		let tmpEndpointsElements = this.pict.ContentAssignment.getElement(`#Flow-Endpoints-${tmpViewIdentifier}`);
		if (tmpEndpointsElements.length > 0)
		{
			this._EndpointsLayer = tmpEndpointsElements[0];
		}

		let tmpPortHintsElements = this.pict.ContentAssignment.getElement(`#Flow-PortHints-${tmpViewIdentifier}`);
		if (tmpPortHintsElements.length > 0)
		{
			this._PortHintsLayer = tmpPortHintsElements[0];
		}

		let tmpTethersElements = this.pict.ContentAssignment.getElement(`#Flow-Tethers-${tmpViewIdentifier}`);
		if (tmpTethersElements.length > 0)
		{
			this._TethersLayer = tmpTethersElements[0];
		}

		let tmpPanelsElements = this.pict.ContentAssignment.getElement(`#Flow-Panels-${tmpViewIdentifier}`);
		if (tmpPanelsElements.length > 0)
		{
			this._PanelsLayer = tmpPanelsElements[0];
		}

		// Ensure all services are initialized (fallback if onBeforeInitialize was skipped)
		this._instantiateServices();

		// Inject marker defs via the connector shapes provider
		// Note: insertAdjacentHTML does not work on SVG elements (wrong namespace),
		// so we parse via a temporary <svg> element to ensure SVG namespace.
		if (this._ConnectorShapesProvider && this._SVGElement)
		{
			let tmpDefs = this._SVGElement.querySelector('defs');
			if (tmpDefs)
			{
				let tmpMarkerMarkup = this._ConnectorShapesProvider.generateMarkerDefs(tmpViewIdentifier);
				let tmpTempSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				tmpTempSVG.innerHTML = tmpMarkerMarkup;
				while (tmpTempSVG.firstChild)
				{
					tmpDefs.appendChild(tmpTempSVG.firstChild);
				}
			}
		}

		// Setup the toolbar if enabled
		if (this.options.EnableToolbar)
		{
			this._ToolbarView = this.fable.instantiateServiceProviderWithoutRegistration('PictViewFlowToolbar',
				Object.assign({},
					libPictViewFlowToolbar.default_configuration,
					{
						ViewIdentifier: `Flow-Toolbar-${tmpViewIdentifier}`,
						DefaultDestinationAddress: `#Flow-Toolbar-${tmpViewIdentifier}`,
						FlowViewIdentifier: tmpViewIdentifier,
						EnableAddNode: this.options.EnableAddNode,
						EnableCardPalette: this.options.EnableCardPalette,
						ToolbarExtraButtons: this.options.ToolbarExtraButtons
					}
				));
			// Use the toolbar's render method after it's set up
			if (this._ToolbarView && typeof this._ToolbarView.render === 'function')
			{
				this._ToolbarView._FlowView = this;
				this._ToolbarView.render();
			}
		}

		// Setup the node renderer. A consumer can override the node title-bar height (e.g. a moodboard
		// sets it to 0 for edge-to-edge image and note cards) via the flow-level NodeTitleBarHeight
		// option; otherwise the renderer keeps its own default.
		let tmpNodeViewOptions = { ViewIdentifier: `Flow-NodeRenderer-${tmpViewIdentifier}`, AutoRender: false };
		if (typeof this.options.NodeTitleBarHeight === 'number') { tmpNodeViewOptions.NodeTitleBarHeight = this.options.NodeTitleBarHeight; }
		this._NodeView = this.fable.instantiateServiceProviderWithoutRegistration('PictViewFlowNode',
			Object.assign({}, libPictViewFlowNode.default_configuration, tmpNodeViewOptions));
		this._NodeView._FlowView = this;
		// The default renderable renderer. Non-card renderers register alongside it.
		this._RenderableRenderers['card'] = this._NodeView;

		// Setup the properties panel renderer
		this._PropertiesPanelView = this.fable.instantiateServiceProviderWithoutRegistration('PictViewFlowPropertiesPanel',
			Object.assign({},
				libPictViewFlowPropertiesPanel.default_configuration,
				{
					ViewIdentifier: `Flow-PropertiesPanel-${tmpViewIdentifier}`,
					AutoRender: false
				}
			));
		this._PropertiesPanelView._FlowView = this;

		// Bind interaction events
		this._InteractionManager.initialize(this._SVGElement, this._ViewportElement);

		// Wire the auto-apply handler to structural-change events
		this._subscribeAutoApplyHandlers();

		// Load initial flow data if an address is configured
		if (this.options.FlowDataAddress)
		{
			this.marshalToView();
		}

		// Render the initial flow
		this.renderFlow();

		// Optionally snap to the default saved layout once the graph is drawn. A host with an async
		// LayoutStorage that resolves later should call applyDefaultLayout() from its load callback.
		if (this.options.ApplyDefaultLayoutOnLoad && this._LayoutProvider && this._LayoutProvider.getDefaultLayout())
		{
			this._LayoutProvider.applyDefaultLayout();
		}

		// Presentation fit. FitMode 'width' fits the frame to the container width now and on
		// resize; otherwise honor a frame's legacy FitOnLoad (contain). Both need the SVG sized,
		// so this runs after the initial render.
		if (this.options.FitMode === 'width')
		{
			this._setupFitObserver();
		}
		else
		{
			let tmpFrame = this._resolveFrame();
			if (tmpFrame && tmpFrame.FitOnLoad)
			{
				this.fitToFrame();
			}
		}
	}

	// ---- Saved-layout delegations ----
	// A clean view-level API over the layout provider for saving, restoring, and
	// choosing a default arrangement of the same graph. The toolbar uses the
	// provider directly; these are additive.

	saveLayout(pName) { return this._LayoutProvider ? this._LayoutProvider.saveLayout(pName) : null; }
	restoreLayout(pHash) { return this._LayoutProvider ? this._LayoutProvider.restoreLayout(pHash) : false; }
	applyLayout(pHash) { return this.restoreLayout(pHash); }
	deleteLayout(pHash) { return this._LayoutProvider ? this._LayoutProvider.deleteLayout(pHash) : false; }
	getLayouts() { return this._LayoutProvider ? this._LayoutProvider.getLayouts() : []; }
	setDefaultLayout(pHash) { return this._LayoutProvider ? this._LayoutProvider.setDefaultLayout(pHash) : false; }
	getDefaultLayout() { return this._LayoutProvider ? this._LayoutProvider.getDefaultLayout() : null; }
	applyDefaultLayout() { return this._LayoutProvider ? this._LayoutProvider.applyDefaultLayout() : false; }

	// ---- Data Manager Delegations ----

	marshalToView() { return this._DataManager.marshalToView(); }
	marshalFromView() { return this._DataManager.marshalFromView(); }
	getFlowData() { return this._DataManager.getFlowData(); }
	setFlowData(pFlowData) { return this._DataManager.setFlowData(pFlowData); }
	addNode(pType, pX, pY, pTitle, pData) { return this._DataManager.addNode(pType, pX, pY, pTitle, pData); }
	removeNode(pNodeHash) { return this._DataManager.removeNode(pNodeHash); }
	addConnection(pSourceNodeHash, pSourcePortHash, pTargetNodeHash, pTargetPortHash, pData) { return this._DataManager.addConnection(pSourceNodeHash, pSourcePortHash, pTargetNodeHash, pTargetPortHash, pData); }
	removeConnection(pConnectionHash) { return this._DataManager.removeConnection(pConnectionHash); }

	/**
	 * Select a node
	 * @param {string|null} pNodeHash - Hash of the node to select, or null to deselect
	 */
	selectNode(pNodeHash)
	{
		return this._SelectionManager.selectNode(pNodeHash);
	}

	/**
	 * Toggle a node's membership in the selection set (multi-select; shift-click).
	 * @param {string} pNodeHash
	 */
	toggleNodeSelection(pNodeHash)
	{
		return this._SelectionManager.toggleNodeSelection(pNodeHash);
	}

	/**
	 * Replace the selection set with the given node hashes (multi-select; marquee result).
	 * @param {Array<string>} pNodeHashes
	 */
	selectNodes(pNodeHashes)
	{
		return this._SelectionManager.selectNodes(pNodeHashes);
	}

	/**
	 * The current selection set as an array of node hashes.
	 * @returns {Array<string>}
	 */
	getSelectedNodeHashes()
	{
		return this._SelectionManager.getSelectedNodeHashes();
	}

	/**
	 * Select a connection
	 * @param {string|null} pConnectionHash - Hash of the connection to select, or null to deselect
	 */
	selectConnection(pConnectionHash)
	{
		return this._SelectionManager.selectConnection(pConnectionHash);
	}

	/**
	 * Deselect all nodes and connections
	 */
	deselectAll()
	{
		return this._SelectionManager.deselectAll();
	}

	/**
	 * Delete the currently selected node or connection
	 * @returns {boolean}
	 */
	deleteSelected()
	{
		return this._SelectionManager.deleteSelected();
	}

	/**
	 * Update the viewport transform (pan and zoom)
	 */
	updateViewportTransform()
	{
		return this._ViewportManager.updateViewportTransform();
	}

	/**
	 * Set zoom level
	 * @param {number} pZoom - The zoom level
	 * @param {number} [pFocusX] - X coordinate to zoom toward (SVG space)
	 * @param {number} [pFocusY] - Y coordinate to zoom toward (SVG space)
	 */
	setZoom(pZoom, pFocusX, pFocusY)
	{
		return this._ViewportManager.setZoom(pZoom, pFocusX, pFocusY);
	}

	/**
	 * Zoom to fit all nodes in the viewport
	 */
	zoomToFit()
	{
		return this._ViewportManager.zoomToFit();
	}

	/**
	 * Apply auto-layout to all nodes.
	 *
	 * Backwards-compatible signature: when called with no arguments,
	 * dispatches to the Layered algorithm with its default parameters
	 * (matching the pre-subsystem behavior).
	 *
	 * If `pAlgorithmName` is provided it is used directly; otherwise the
	 * configured `_FlowData.LayoutAlgorithm` is used (unless that value
	 * is 'Custom' or unset, in which case it falls back to 'Layered').
	 *
	 * @param {string} [pAlgorithmName]
	 * @param {Object} [pParameters]
	 */
	autoLayout(pAlgorithmName, pParameters)
	{
		if (!this._LayoutService) return;

		let tmpName;
		let tmpParams;
		if (typeof pAlgorithmName === 'string' && pAlgorithmName !== '')
		{
			tmpName = pAlgorithmName;
			tmpParams = pParameters || {};
		}
		else
		{
			let tmpConfigured = this._FlowData.LayoutAlgorithm;
			tmpName = (typeof tmpConfigured === 'string' && tmpConfigured !== '' && tmpConfigured !== 'Custom') ? tmpConfigured : 'Layered';
			tmpParams = (tmpName === this._FlowData.LayoutAlgorithm) ? (this._FlowData.LayoutParameters || {}) : {};
		}

		this._LayoutService.autoLayout(this._FlowData.Nodes, this._FlowData.Connections, tmpName, tmpParams);
		this.renderFlow();
		this.marshalFromView();

		if (this._EventHandlerProvider)
		{
			this._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowData);
		}
	}

	/**
	 * Apply the currently configured layout algorithm to the flow, then
	 * call the active edge theme's `AdjustLayout` callback (if any) to
	 * let the theme adjust node positions for cleaner edge rendering
	 * (e.g. snap to grid, optimize for crossing minimization).
	 *
	 * Reads `_FlowData.LayoutAlgorithm` / `LayoutParameters` /
	 * `EdgeTheme` / `EdgeThemeParameters`. No-op when algorithm is
	 * 'Custom' — but the edge theme's adjustment still runs (so themes
	 * like OrthogonalSnap can snap hand-placed nodes too).
	 */
	applyCurrentLayout()
	{
		if (!this._LayoutService) return;
		let tmpAlgorithm = this._FlowData.LayoutAlgorithm || 'Custom';

		this._AutoApplyInProgress = true;
		try
		{
			if (tmpAlgorithm !== 'Custom')
			{
				this._LayoutService.applyLayout(
					this._FlowData.Nodes,
					this._FlowData.Connections,
					tmpAlgorithm,
					this._FlowData.LayoutParameters || {}
				);
			}

			// Edge-theme post-processing (placement adjustment).
			let tmpEdgeTheme = this._LayoutService.resolveActiveEdgeTheme({});
			if (tmpEdgeTheme && typeof tmpEdgeTheme.AdjustLayout === 'function')
			{
				try
				{
					let tmpEdgeParams = this._LayoutService.getMergedEdgeThemeParameters(
						tmpEdgeTheme.Name,
						this._FlowData.EdgeThemeParameters || {}
					);
					tmpEdgeTheme.AdjustLayout(this._FlowData.Nodes, this._FlowData.Connections, tmpEdgeParams);
				}
				catch (pError)
				{
					this.log.warn(`PictSectionFlow edge theme '${tmpEdgeTheme.Name}' AdjustLayout threw: ${pError.message}`);
				}
			}

			let tmpHadAdjust = !!(tmpEdgeTheme && typeof tmpEdgeTheme.AdjustLayout === 'function');
			let tmpDidLayout = (tmpAlgorithm !== 'Custom');

			if (!tmpDidLayout && !tmpHadAdjust)
			{
				// Custom + theme-without-AdjustLayout → no positions changed.
				// Don't render or fire onFlowChanged.
				return;
			}

			this.renderFlow();
			this.marshalFromView();

			if (this._EventHandlerProvider)
			{
				this._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowData);
			}
		}
		finally
		{
			this._AutoApplyInProgress = false;
		}
	}

	/**
	 * Set the active edge theme (and optionally its parameters). Re-runs
	 * the current layout so any `AdjustLayout` callback takes effect.
	 *
	 * @param {string|null} pThemeName - null clears the override (theme
	 *   then resolves via the active layout's `DefaultEdgeTheme`).
	 * @param {Object} [pParameters]
	 */
	setEdgeTheme(pThemeName, pParameters)
	{
		if (!this._LayoutService) return;
		if (pThemeName != null && typeof pThemeName !== 'string') return;

		if (pThemeName)
		{
			let tmpTheme = this._LayoutService.getEdgeTheme(pThemeName);
			if (!tmpTheme)
			{
				this.log.warn(`PictSectionFlow setEdgeTheme: unknown theme '${pThemeName}'`);
				return;
			}
			this._FlowData.EdgeTheme = pThemeName;
			this._FlowData.EdgeThemeParameters = Object.assign({}, tmpTheme.DefaultParameters || {}, pParameters || {});
		}
		else
		{
			this._FlowData.EdgeTheme = null;
			this._FlowData.EdgeThemeParameters = pParameters ? Object.assign({}, pParameters) : {};
		}

		this.applyCurrentLayout();
	}

	/**
	 * Read the currently configured edge theme settings.
	 * Returns the *resolved* active theme (factoring in fallback to the
	 * active layout's `DefaultEdgeTheme`) plus the explicit override
	 * (if any) for round-tripping into UI.
	 *
	 * @returns {{ Theme: string, Override: string|null, Parameters: Object }}
	 */
	getEdgeTheme()
	{
		let tmpResolved = this._LayoutService ? this._LayoutService.resolveActiveEdgeTheme({}) : null;
		return {
			Theme: tmpResolved ? tmpResolved.Name : null,
			Override: this._FlowData.EdgeTheme || null,
			Parameters: JSON.parse(JSON.stringify(this._FlowData.EdgeThemeParameters || {}))
		};
	}

	/**
	 * Set the configured layout algorithm and (optionally) its parameters
	 * and auto-apply flag. Persists to `_FlowData` and applies the layout
	 * immediately when the algorithm is non-Custom.
	 *
	 * @param {string} pAlgorithmName
	 * @param {Object} [pParameters] - merged over the algorithm's defaults
	 * @param {boolean} [pAutoApply] - if provided, also sets `LayoutAutoApply`
	 */
	setLayoutAlgorithm(pAlgorithmName, pParameters, pAutoApply)
	{
		if (!this._LayoutService) return;
		if (typeof pAlgorithmName !== 'string' || pAlgorithmName === '') return;

		let tmpAlgo = this._LayoutService.getAlgorithm(pAlgorithmName);
		if (!tmpAlgo)
		{
			this.log.warn(`PictSectionFlow setLayoutAlgorithm: unknown algorithm '${pAlgorithmName}'`);
			return;
		}

		this._FlowData.LayoutAlgorithm = pAlgorithmName;
		this._FlowData.LayoutParameters = Object.assign({}, tmpAlgo.DefaultParameters || {}, pParameters || {});
		if (typeof pAutoApply === 'boolean')
		{
			this._FlowData.LayoutAutoApply = pAutoApply;
		}

		// Always run applyCurrentLayout so the new layout's `DefaultEdgeTheme`
		// takes effect on connection rendering — even when switching to
		// 'Custom' (which doesn't reposition nodes but does re-render edges).
		this.applyCurrentLayout();
		this.renderFlow();
	}

	/**
	 * Toggle whether the configured layout re-applies on structural changes.
	 * @param {boolean} pAutoApply
	 */
	setLayoutAutoApply(pAutoApply)
	{
		this._FlowData.LayoutAutoApply = !!pAutoApply;
		this.marshalFromView();
	}

	/**
	 * Read the currently configured layout algorithm settings.
	 * @returns {{ Algorithm: string, Parameters: Object, AutoApply: boolean }}
	 */
	getLayoutAlgorithm()
	{
		return {
			Algorithm: this._FlowData.LayoutAlgorithm || 'Custom',
			Parameters: JSON.parse(JSON.stringify(this._FlowData.LayoutParameters || {})),
			AutoApply: !!this._FlowData.LayoutAutoApply
		};
	}

	/**
	 * Subscribe the auto-apply handler to structural-change events. Idempotent.
	 * Only structural events trigger re-layout — `onNodeMoved` is intentionally
	 * NOT subscribed so user drags are never clobbered until the next add/remove.
	 */
	_subscribeAutoApplyHandlers()
	{
		if (!this._EventHandlerProvider) return;
		if (this._AutoApplyHandlerHashes.length > 0) return;

		let tmpEvents = ['onNodeAdded', 'onNodeRemoved', 'onConnectionCreated', 'onConnectionRemoved'];
		for (let i = 0; i < tmpEvents.length; i++)
		{
			let tmpHash = this._EventHandlerProvider.registerHandler(tmpEvents[i], () =>
			{
				if (this._AutoApplyInProgress) return;
				if (!this._FlowData.LayoutAutoApply) return;
				if (!this._FlowData.LayoutAlgorithm || this._FlowData.LayoutAlgorithm === 'Custom') return;
				this.applyCurrentLayout();
			});
			if (tmpHash) this._AutoApplyHandlerHashes.push({ Event: tmpEvents[i], Hash: tmpHash });
		}
	}

	/**
	 * Toggle fullscreen mode on the flow editor container.
	 * Uses a CSS fixed-position overlay instead of the Fullscreen API.
	 * @returns {boolean} The new fullscreen state
	 */
	toggleFullscreen()
	{
		return this._ViewportManager.toggleFullscreen();
	}

	/**
	 * Exit fullscreen mode if currently active.
	 */
	exitFullscreen()
	{
		return this._ViewportManager.exitFullscreen();
	}

	// ── Theme / Renderer / Style-Preset API ─────────────────────────────
	//
	// Three axes you can drive independently:
	//   - ColorTheme — delegates to pict-provider-theme (a pict-section-theme
	//                  catalog hash like 'flow-sketch' or 'pict-default')
	//   - Renderer   — delegates to PictProviderFlowRenderer (controls
	//                  bracket/rect node body, jitter, shadows, fonts)
	//   - EdgeTheme  — delegates to PictService-Flow-Layout (Bezier /
	//                  Straight / Orthogonal / Perimeter / …; see
	//                  PictView-Flow.setEdgeTheme below)
	//
	// Most users pick a curated combo via `setStylePreset()` — the preset
	// applies all three axes in order. Per-axis overrides mark the active
	// preset as 'customized' (getStylePreset returns null afterward).
	//
	// For backwards-compatibility, `setTheme()` / `getThemeKey()` continue
	// to work as aliases for `setStylePreset()` / `getStylePreset()`.

	/**
	 * Apply a named style preset — sets ColorTheme, Renderer, EdgeTheme
	 * (and optional NoiseLevel) in one call.
	 * @param {string} pPresetHash
	 */
	setStylePreset(pPresetHash)
	{
		if (!this._StylePresetsProvider)
		{
			this.log.warn('PictSectionFlow setStylePreset: StylePresets provider not available');
			return;
		}
		let tmpApplied = this._StylePresetsProvider.applyPreset(pPresetHash);
		if (!tmpApplied) { return; }
		this._refreshAfterStyleChange();
		if (this._EventHandlerProvider)
		{
			this._EventHandlerProvider.fireEvent('onStylePresetChanged', pPresetHash);
			// Back-compat — old code listens for 'onThemeChanged'
			this._EventHandlerProvider.fireEvent('onThemeChanged', pPresetHash);
		}
	}

	/**
	 * Hash of the active style preset, or null when in customized state.
	 * @returns {string|null}
	 */
	getStylePreset()
	{
		return this._StylePresetsProvider ? this._StylePresetsProvider.getActivePresetHash() : null;
	}

	/**
	 * Override just the color theme — delegates to pict-provider-theme.
	 * @param {string} pThemeHash - a pict-section-theme catalog hash
	 */
	setColorTheme(pThemeHash)
	{
		if (this.fable.providers && this.fable.providers.Theme)
		{
			try { this.fable.providers.Theme.applyTheme(pThemeHash); }
			catch (pErr) { this.log.warn(`PictSectionFlow setColorTheme: applyTheme failed — ${pErr.message}`); return; }
		}
		else
		{
			this.log.warn('PictSectionFlow setColorTheme: pict-provider-theme not available in host');
			return;
		}
		if (this._StylePresetsProvider) { this._StylePresetsProvider.markCustomized(); }
		this._refreshAfterStyleChange();
		if (this._EventHandlerProvider)
		{
			this._EventHandlerProvider.fireEvent('onColorThemeChanged', pThemeHash);
		}
	}

	/**
	 * The active color theme hash (from pict-provider-theme).
	 * @returns {string|null}
	 */
	getColorThemeKey()
	{
		if (this.fable.providers && this.fable.providers.Theme && typeof this.fable.providers.Theme.getActiveTheme === 'function')
		{
			let tmpActive = this.fable.providers.Theme.getActiveTheme();
			if (tmpActive && tmpActive.Hash) { return tmpActive.Hash; }
		}
		return null;
	}

	/**
	 * Override just the renderer — controls node body shape, jitter, shadows.
	 * @param {string} pRendererKey
	 */
	setRenderer(pRendererKey)
	{
		if (!this._RendererProvider)
		{
			this.log.warn('PictSectionFlow setRenderer: Renderer provider not available');
			return;
		}
		let tmpApplied = this._RendererProvider.setRenderer(pRendererKey);
		if (!tmpApplied) { return; }
		if (this._StylePresetsProvider) { this._StylePresetsProvider.markCustomized(); }
		this._refreshAfterStyleChange();
		if (this._EventHandlerProvider)
		{
			this._EventHandlerProvider.fireEvent('onRendererChanged', pRendererKey);
		}
	}

	/**
	 * The active renderer key.
	 * @returns {string}
	 */
	getRendererKey()
	{
		return this._RendererProvider ? this._RendererProvider.getActiveRendererKey() : 'clean';
	}

	/**
	 * Set the noise level (0 to 1) and re-render. Noise applies only when
	 * the active renderer enables it (see Renderer.NoiseConfig).
	 * @param {number} pLevel - 0 = precise, 1 = maximum wobble
	 */
	setNoiseLevel(pLevel)
	{
		if (this._RendererProvider)
		{
			this._RendererProvider.setNoiseLevel(pLevel);
		}
		else if (this._ThemeProvider)
		{
			this._ThemeProvider.setNoiseLevel(pLevel);
		}
		if (this.initialRenderComplete) { this.renderFlow(); }
	}

	/**
	 * Current noise level (0 to 1).
	 * @returns {number}
	 */
	getNoiseLevel()
	{
		if (this._RendererProvider) { return this._RendererProvider.getNoiseLevel(); }
		if (this._ThemeProvider)    { return this._ThemeProvider.getNoiseLevel(); }
		return 0;
	}

	/**
	 * @deprecated since the 3-axis refactor — use setStylePreset() instead.
	 * Kept as an alias for back-compat with existing host apps and views.
	 * @param {string} pPresetHash
	 */
	setTheme(pPresetHash)
	{
		this.setStylePreset(pPresetHash);
	}

	/**
	 * @deprecated since the 3-axis refactor — use getStylePreset() instead.
	 * Returns the active preset hash (or null if customized).
	 * @returns {string|null}
	 */
	getThemeKey()
	{
		return this.getStylePreset();
	}

	/**
	 * Common refresh path used by all axis-change methods.
	 * Re-registers the renderer CSS, re-injects marker defs (arrowhead colors
	 * may have shifted with the new theme), and full-renders the flow.
	 * @private
	 */
	_refreshAfterStyleChange()
	{
		if (this._CSSProvider && typeof this._CSSProvider.registerRendererCSS === 'function' && this._RendererProvider)
		{
			this._CSSProvider.registerRendererCSS(this._RendererProvider.getActiveRenderer());
		}
		if (this._CSSProvider) { this._CSSProvider.registerCSS(); }
		this._reinjectMarkerDefs();
		if (this.initialRenderComplete) { this.renderFlow(); }
	}

	_reinjectMarkerDefs() { return this._RenderManager.reinjectMarkerDefs(); }

	/**
	 * Get a node by hash
	 * @param {string} pNodeHash
	 * @returns {Object|null}
	 */
	getNode(pNodeHash)
	{
		return this._FlowData.Nodes.find((pNode) => pNode.Hash === pNodeHash) || null;
	}

	/**
	 * Get a connection by hash
	 * @param {string} pConnectionHash
	 * @returns {Object|null}
	 */
	getConnection(pConnectionHash)
	{
		return this._FlowData.Connections.find((pConn) => pConn.Hash === pConnectionHash) || null;
	}

	/**
	 * Select a tether by its panel hash.
	 * @param {string|null} pPanelHash - Hash of the panel whose tether to select, or null to deselect
	 */
	selectTether(pPanelHash)
	{
		return this._SelectionManager.selectTether(pPanelHash);
	}

	// ---- Connection Handle Manager Delegations ----

	updateConnectionHandle(pConnectionHash, pHandleType, pX, pY) { return this._ConnectionHandleManager.updateConnectionHandle(pConnectionHash, pHandleType, pX, pY); }
	addConnectionHandle(pConnectionHash, pX, pY) { return this._ConnectionHandleManager.addConnectionHandle(pConnectionHash, pX, pY); }
	removeConnectionHandle(pConnectionHash, pIndex) { return this._ConnectionHandleManager.removeConnectionHandle(pConnectionHash, pIndex); }
	_resetHandlesForNode(pNodeHash) { return this._ConnectionHandleManager.resetHandlesForNode(pNodeHash); }
	_resetHandlesForPanel(pPanelHash) { return this._ConnectionHandleManager.resetHandlesForPanel(pPanelHash); }

	/**
	 * Add a bezier handle to a tether at the specified SVG position.
	 * @param {string} pPanelHash
	 * @param {number} pX
	 * @param {number} pY
	 */
	addTetherHandle(pPanelHash, pX, pY)
	{
		let tmpPanel = this._FlowData.OpenPanels.find((pPanel) => pPanel.Hash === pPanelHash);
		if (!tmpPanel || !this._TetherService) return;

		let tmpNode = this.getNode(tmpPanel.NodeHash);
		if (!tmpNode) return;

		let tmpAnchors = this._TetherService.getSmartAnchors(tmpPanel, tmpNode);

		this._TetherService.addHandle(tmpPanel, pX, pY, tmpAnchors.panelAnchor, tmpAnchors.nodeAnchor);

		this.renderFlow();
		this.marshalFromView();

		if (this._EventHandlerProvider)
		{
			this._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowData);
		}
	}

	/**
	 * Remove a bezier handle from a tether by index.
	 * @param {string} pPanelHash
	 * @param {number} pIndex
	 */
	removeTetherHandle(pPanelHash, pIndex)
	{
		let tmpPanel = this._FlowData.OpenPanels.find((pPanel) => pPanel.Hash === pPanelHash);
		if (!tmpPanel || !this._TetherService) return;

		this._TetherService.removeHandle(tmpPanel, pIndex);

		this.renderFlow();
		this.marshalFromView();

		if (this._EventHandlerProvider)
		{
			this._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowData);
		}
	}

	/**
	 * Update a tether handle position during drag (for real-time feedback).
	 * Delegates state update to the TetherService.
	 * @param {string} pPanelHash
	 * @param {string} pHandleType
	 * @param {number} pX
	 * @param {number} pY
	 */
	updateTetherHandle(pPanelHash, pHandleType, pX, pY)
	{
		let tmpPanel = this._FlowData.OpenPanels.find((pPanel) => pPanel.Hash === pPanelHash);
		if (!tmpPanel) return;

		if (this._TetherService)
		{
			this._TetherService.updateHandlePosition(tmpPanel, pHandleType, pX, pY);
		}

		this._renderSingleTether(pPanelHash);
	}

	/**
	 * Get a port's absolute position in SVG coordinates.
	 *
	 * For left and right side ports, positioning is offset below the title bar
	 * so that connection endpoints match the rendered port circles.
	 *
	 * @param {string} pNodeHash
	 * @param {string} pPortHash
	 * @returns {{x: number, y: number, side: string}|null}
	 */
	getPortPosition(pNodeHash, pPortHash)
	{
		let tmpNode = this.getNode(pNodeHash);
		if (!tmpNode) return null;

		let tmpPort = tmpNode.Ports.find((p) => p.Hash === pPortHash);
		if (!tmpPort) return null;

		// Count ports on the same side (matching both direction and side)
		let tmpSameSidePorts = tmpNode.Ports.filter((p) => p.Side === tmpPort.Side);
		let tmpPortIndex = tmpSameSidePorts.indexOf(tmpPort);
		let tmpPortCount = tmpSameSidePorts.length;

		let tmpTitleBarHeight = (this._NodeView && this._NodeView.options.NodeTitleBarHeight) || 28;

		// Use the adjusted node height that accounts for minimum port
		// spacing.  Connections render before nodes, so the node renderer
		// may not have written back its adjusted height yet.
		let tmpHeight = tmpNode.Height || 80;
		if (this._GeometryProvider && tmpNode.Ports && tmpNode.Ports.length > 0)
		{
			let tmpMinHeight = this._GeometryProvider.computeMinimumNodeHeight(tmpNode.Ports, tmpTitleBarHeight);
			if (tmpMinHeight > tmpHeight)
			{
				tmpHeight = tmpMinHeight;
			}
		}

		// Build port counts map for adaptive zone sizing
		let tmpPortCountsBySide = this._GeometryProvider.buildPortCountsBySide(tmpNode.Ports);

		let tmpLocal = this._GeometryProvider.getPortLocalPosition(tmpPort.Side, tmpPortIndex, tmpPortCount, tmpNode.Width, tmpHeight, tmpTitleBarHeight, tmpPortCountsBySide);

		return { x: tmpNode.X + tmpLocal.x, y: tmpNode.Y + tmpLocal.y, side: tmpPort.Side || 'right' };
	}

	/**
	 * Convert screen coordinates to SVG viewport coordinates
	 * @param {number} pScreenX
	 * @param {number} pScreenY
	 * @returns {{x: number, y: number}}
	 */
	screenToSVGCoords(pScreenX, pScreenY)
	{
		return this._ViewportManager.screenToSVGCoords(pScreenX, pScreenY);
	}

	// ---- Render Manager Delegations ----

	renderFlow() { return this._RenderManager.renderFlow(); }
	_renderSingleConnection(pConnectionHash) { return this._RenderManager.renderSingleConnection(pConnectionHash); }
	_renderSingleTether(pPanelHash) { return this._RenderManager.renderSingleTether(pPanelHash); }
	updateNodePosition(pNodeHash, pX, pY) { return this._RenderManager.updateNodePosition(pNodeHash, pX, pY); }
	_renderConnectionsForNode(pNodeHash) { return this._RenderManager.renderConnectionsForNode(pNodeHash); }
	_renderTethersForNode(pNodeHash) { return this._RenderManager.renderTethersForNode(pNodeHash); }

	// ---- Properties Panel Management ----

	/**
	 * Open a properties panel for a node.
	 * @param {string} pNodeHash - The hash of the node to open a panel for
	 * @returns {Object|false} The panel data, or false if the node has no PropertiesPanel config
	 */
	openPanel(pNodeHash)
	{
		return this._PanelManager.openPanel(pNodeHash);
	}

	/**
	 * Close a properties panel by panel hash.
	 * @param {string} pPanelHash
	 * @returns {boolean}
	 */
	closePanel(pPanelHash)
	{
		return this._PanelManager.closePanel(pPanelHash);
	}

	/**
	 * Close all panels for a given node.
	 * @param {string} pNodeHash
	 * @returns {boolean}
	 */
	closePanelForNode(pNodeHash)
	{
		return this._PanelManager.closePanelForNode(pNodeHash);
	}

	/**
	 * Toggle a properties panel for a node (open if closed, close if open).
	 * @param {string} pNodeHash
	 * @returns {Object|false}
	 */
	togglePanel(pNodeHash)
	{
		return this._PanelManager.togglePanel(pNodeHash);
	}

	/**
	 * Open a properties panel for a connection (edge). Requires the ConnectionPropertiesPanel
	 * option; returns false otherwise.
	 * @param {string} pConnectionHash
	 * @returns {Object|false}
	 */
	openConnectionPanel(pConnectionHash)
	{
		return this._PanelManager.openConnectionPanel(pConnectionHash);
	}

	/**
	 * Toggle a properties panel for a connection.
	 * @param {string} pConnectionHash
	 * @returns {Object|false}
	 */
	toggleConnectionPanel(pConnectionHash)
	{
		return this._PanelManager.toggleConnectionPanel(pConnectionHash);
	}

	/**
	 * Close all panels for a given connection.
	 * @param {string} pConnectionHash
	 * @returns {boolean}
	 */
	closePanelForConnection(pConnectionHash)
	{
		return this._PanelManager.closePanelForConnection(pConnectionHash);
	}

	/**
	 * The midpoint of a connection in SVG coordinates, averaged from its two endpoint ports. Used
	 * to place and tether a connection's properties panel. Returns null if the connection or
	 * either port can not be resolved.
	 * @param {string} pConnectionHash
	 * @returns {{x: number, y: number}|null}
	 */
	getConnectionMidpoint(pConnectionHash)
	{
		let tmpConnection = this.getConnection(pConnectionHash);
		if (!tmpConnection) return null;
		let tmpSource = this.getPortPosition(tmpConnection.SourceNodeHash, tmpConnection.SourcePortHash);
		let tmpTarget = this.getPortPosition(tmpConnection.TargetNodeHash, tmpConnection.TargetPortHash);
		if (!tmpSource || !tmpTarget) return null;
		// A connection renders as a curve, so the straight-line average of its endpoints sits OFF the
		// line (the panel tether would point into empty space). Prefer the true midpoint of the rendered
		// path -- getPointAtLength at half its length, which is genuinely on the line. Fall back to the
		// endpoint average when the path element or SVG geometry is unavailable (e.g. server-side render).
		if (this._SVGElement && typeof this._SVGElement.querySelector === 'function')
		{
			let tmpPathElement = this._SVGElement.querySelector('.pict-flow-connection[data-connection-hash="' + pConnectionHash + '"]');
			if (tmpPathElement && typeof tmpPathElement.getTotalLength === 'function' && typeof tmpPathElement.getPointAtLength === 'function')
			{
				try
				{
					let tmpLength = tmpPathElement.getTotalLength();
					if (tmpLength > 0)
					{
						let tmpPoint = tmpPathElement.getPointAtLength(tmpLength / 2);
						return { x: tmpPoint.x, y: tmpPoint.y };
					}
				}
				catch (pError) { /* fall through to the straight-line midpoint */ }
			}
		}
		return { x: (tmpSource.x + tmpTarget.x) / 2, y: (tmpSource.y + tmpTarget.y) / 2 };
	}

	/**
	 * Update a panel's position (for drag).
	 * @param {string} pPanelHash
	 * @param {number} pX
	 * @param {number} pY
	 */
	updatePanelPosition(pPanelHash, pX, pY)
	{
		return this._PanelManager.updatePanelPosition(pPanelHash, pX, pY);
	}

	// ── Inline-handler bridges (called from template onclick/oninput attrs)

	/**
	 * Handle a click on a panel tab button. Stops propagation so the
	 * underlying SVG doesn't see it, then delegates to the properties
	 * panel view for the actual visibility toggle.
	 *
	 * @param {Element} pTabElement
	 * @param {Event} pEvent
	 */
	_handlePanelTabClick(pTabElement, pEvent)
	{
		if (pEvent && typeof pEvent.stopPropagation === 'function')
		{
			pEvent.stopPropagation();
		}
		if (this._PropertiesPanelView)
		{
			this._PropertiesPanelView.switchPanelTab(pTabElement);
		}
	}

	/**
	 * Apply a node property change driven from the appearance editor's
	 * inline `oninput` handler. Stops propagation, then delegates to the
	 * properties panel view.
	 *
	 * @param {string} pNodeHash
	 * @param {string} pPropPath
	 * @param {string} pValue
	 * @param {string} pInputType - 'text' | 'number' | 'color'
	 * @param {Event} [pEvent]
	 */
	_applyNodePropChange(pNodeHash, pPropPath, pValue, pInputType, pEvent)
	{
		if (pEvent && typeof pEvent.stopPropagation === 'function')
		{
			pEvent.stopPropagation();
		}
		if (this._PropertiesPanelView)
		{
			this._PropertiesPanelView._applyNodePropChange(pNodeHash, pPropPath, pValue, pInputType);
		}
	}

	/**
	 * Inline-handler bridge — light up port-hint paths matching the given
	 * port (and optionally node) hash. Called from inline `onmouseenter`
	 * on port badges; see PictService-Flow-PortRenderer._wirePortHintHover.
	 *
	 * @param {string|null} pPortHash
	 * @param {string|null} pNodeHash
	 */
	_activatePortHints(pPortHash, pNodeHash)
	{
		this._togglePortHints(pPortHash, pNodeHash, true);
	}

	/**
	 * Inline-handler bridge — clear port-hint highlights.
	 *
	 * @param {string|null} pPortHash
	 * @param {string|null} pNodeHash
	 */
	_deactivatePortHints(pPortHash, pNodeHash)
	{
		this._togglePortHints(pPortHash, pNodeHash, false);
	}

	_togglePortHints(pPortHash, pNodeHash, pActive)
	{
		let tmpScope = this._SVGElement || document;
		let tmpSelector = pPortHash
			? '.pict-flow-port-hint[data-port-hash="' + pPortHash + '"]'
			: '.pict-flow-port-hint[data-node-hash="' + pNodeHash + '"]';
		let tmpHints = tmpScope.querySelectorAll(tmpSelector);
		for (let i = 0; i < tmpHints.length; i++)
		{
			if (pActive)
			{
				tmpHints[i].setAttribute('data-active', 'true');
			}
			else
			{
				tmpHints[i].removeAttribute('data-active');
			}
		}
	}

	// ── SVG inline pointer/wheel bridges ─────────────────────────────────

	_handleSVGPointerDown(pEvent)
	{
		if (this._InteractionManager) this._InteractionManager._onPointerDown(pEvent);
	}

	_handleSVGPointerMove(pEvent)
	{
		if (this._InteractionManager) this._InteractionManager._onPointerMove(pEvent);
	}

	_handleSVGPointerUp(pEvent)
	{
		if (this._InteractionManager) this._InteractionManager._onPointerUp(pEvent);
	}

	_handleSVGWheel(pEvent)
	{
		if (this._InteractionManager) this._InteractionManager._onWheel(pEvent);
	}

	_handleSVGContextMenu(pEvent)
	{
		if (this._InteractionManager) this._InteractionManager.handleContextMenu(pEvent);
	}
}

module.exports = PictViewFlow;

// default_configuration is intentionally NOT exported. Pict's addView merges a
// view's default_configuration UNDER the host's options, which would make those
// now-explicit defaults override Profile values. Defaults are applied inside the
// constructor via mergeProfileOptions (defaults < profile < host) so Profile
// works as a real config knob. Inspect resolved defaults with
// PictViewFlow.mergeProfileOptions({}).

// Config profiles (graph/whiteboard/moodboard/presentation/erd), exposed so
// consumers can inspect or extend them.
module.exports.Profiles = _PROFILES;
