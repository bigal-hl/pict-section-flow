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

	EnableToolbar: true,
	EnableAddNode: true,
	EnableCardPalette: true,
	IncludeDefaultNodeTypes: true,
	EnablePanning: true,
	EnableZooming: true,
	EnableNodeDragging: true,
	EnableConnectionCreation: true,
	EnableGridSnap: false,
	GridSnapSize: 20,
	EnableLayoutMenu: true,

	MinZoom: 0.1,
	MaxZoom: 5.0,
	ZoomStep: 0.1,

	DefaultNodeType: 'default',
	DefaultNodeWidth: 180,
	DefaultNodeHeight: 80,

	// Layout-algorithm subsystem defaults
	DefaultLayoutAlgorithm: 'Custom',
	DefaultLayoutParameters: {},
	DefaultLayoutAutoApply: false,

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

class PictViewFlow extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultConfiguration)), pOptions);
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

			// Services
			{ ServiceType: 'PictServiceFlowPathGenerator',           Library: libPictServiceFlowPathGenerator,           Property: '_PathGenerator' },
			{ ServiceType: 'PictServiceFlowDataManager',             Library: libPictServiceFlowDataManager,             Property: '_DataManager' },
			{ ServiceType: 'PictServiceFlowConnectionHandleManager', Library: libPictServiceFlowConnectionHandleManager, Property: '_ConnectionHandleManager' },
			{ ServiceType: 'PictServiceFlowRenderManager',           Library: libPictServiceFlowRenderManager,           Property: '_RenderManager' },
			{ ServiceType: 'PictServiceFlowPortRenderer',            Library: libPictServiceFlowPortRenderer,            Property: '_PortRenderer' },
			{ ServiceType: 'PictServiceFlowInteractionManager',      Library: libPictServiceFlowInteractionManager,      Property: '_InteractionManager' },
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
		this._EventHandlerProvider = null;
		this._NodeView = null;
		this._ToolbarView = null;
		this._PropertiesPanelView = null;

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

		let tmpViewportElements = this.pict.ContentAssignment.getElement(`#Flow-Viewport-${tmpViewIdentifier}`);
		if (tmpViewportElements.length > 0)
		{
			this._ViewportElement = tmpViewportElements[0];
		}

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
						EnableCardPalette: this.options.EnableCardPalette
					}
				));
			// Use the toolbar's render method after it's set up
			if (this._ToolbarView && typeof this._ToolbarView.render === 'function')
			{
				this._ToolbarView._FlowView = this;
				this._ToolbarView.render();
			}
		}

		// Setup the node renderer
		this._NodeView = this.fable.instantiateServiceProviderWithoutRegistration('PictViewFlowNode',
			Object.assign({},
				libPictViewFlowNode.default_configuration,
				{
					ViewIdentifier: `Flow-NodeRenderer-${tmpViewIdentifier}`,
					AutoRender: false
				}
			));
		this._NodeView._FlowView = this;

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
	}

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

module.exports.default_configuration = _DefaultConfiguration;
