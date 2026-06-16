// The container for all the Pict-Section-Flow related code.

// The main flow diagram view class
module.exports = require('./views/PictView-Flow.js');

// Node rendering view
module.exports.PictViewFlowNode = require('./views/PictView-Flow-Node.js');

// Toolbar views
module.exports.PictViewFlowToolbar = require('./views/PictView-Flow-Toolbar.js');
module.exports.PictViewFlowFloatingToolbar = require('./views/PictView-Flow-FloatingToolbar.js');

// Services
module.exports.PictServiceFlowInteractionManager = require('./services/PictService-Flow-InteractionManager.js');
module.exports.PictServiceFlowConnectionRenderer = require('./services/PictService-Flow-ConnectionRenderer.js');
module.exports.PictServiceFlowTether = require('./services/PictService-Flow-Tether.js');
module.exports.PictServiceFlowLayout = require('./services/PictService-Flow-Layout.js');
module.exports.PictServiceFlowPathGenerator = require('./services/PictService-Flow-PathGenerator.js');
module.exports.PictServiceFlowViewportManager = require('./services/PictService-Flow-ViewportManager.js');
module.exports.PictServiceFlowSelectionManager = require('./services/PictService-Flow-SelectionManager.js');
module.exports.PictServiceFlowPanelManager = require('./services/PictService-Flow-PanelManager.js');
module.exports.PictServiceFlowDataManager = require('./services/PictService-Flow-DataManager.js');
module.exports.PictServiceFlowConnectionHandleManager = require('./services/PictService-Flow-ConnectionHandleManager.js');
module.exports.PictServiceFlowRenderManager = require('./services/PictService-Flow-RenderManager.js');
module.exports.PictServiceFlowPortRenderer = require('./services/PictService-Flow-PortRenderer.js');

// Providers
module.exports.PictProviderFlowNodeTypes = require('./providers/PictProvider-Flow-NodeTypes.js');
module.exports.PictProviderFlowEventHandler = require('./providers/PictProvider-Flow-EventHandler.js');
module.exports.PictProviderFlowLayouts = require('./providers/PictProvider-Flow-Layouts.js');
module.exports.PictProviderFlowSVGHelpers = require('./providers/PictProvider-Flow-SVGHelpers.js');
module.exports.PictProviderFlowGeometry = require('./providers/PictProvider-Flow-Geometry.js');
module.exports.PictProviderFlowPanelChrome = require('./providers/PictProvider-Flow-PanelChrome.js');
module.exports.PictProviderFlowCSS = require('./providers/PictProvider-Flow-CSS.js');
module.exports.PictProviderFlowIcons = require('./providers/PictProvider-Flow-Icons.js');
module.exports.PictProviderFlowConnectorShapes = require('./providers/PictProvider-Flow-ConnectorShapes.js');

// Layout algorithm and edge-theme descriptors now live in the standalone
// pict-provider-graphlayout module. They are re-exported here unchanged so the
// historical pict-section-flow export surface (LayoutAlgorithms / EdgeThemes) is
// preserved for consumers.
const libPictProviderGraphLayout = require('pict-provider-graphlayout');

// Layout algorithm descriptors (consumers can register custom algorithms via
// _LayoutService.registerAlgorithm({ Name, Apply, DefaultParameters, ParameterSchema }))
module.exports.LayoutAlgorithms =
{
	Custom:           libPictProviderGraphLayout.Layouts.Custom,
	Layered:          libPictProviderGraphLayout.Layouts.Layered,
	ForcedFromCenter: libPictProviderGraphLayout.Layouts.ForcedFromCenter,
	Grid:             libPictProviderGraphLayout.Layouts.Grid,
	Circular:         libPictProviderGraphLayout.Layouts.Circular,
	Tabular:          libPictProviderGraphLayout.Layouts.Tabular,
	Columnar:         libPictProviderGraphLayout.Layouts.Columnar
};

// Edge-theme descriptors (consumers can register custom edge themes via
// _LayoutService.registerEdgeTheme({ Name, GeneratePath, AdjustLayout?, ResolveAttachment?, ... }))
module.exports.EdgeThemes =
{
	Bezier:               libPictProviderGraphLayout.Edges.Bezier,
	Orthogonal:           libPictProviderGraphLayout.Edges.Orthogonal,
	Straight:             libPictProviderGraphLayout.Edges.Straight,
	OrthogonalSnap:       libPictProviderGraphLayout.Edges.OrthogonalSnap,
	Perimeter:            libPictProviderGraphLayout.Edges.Perimeter,
	PerimeterLinear:      libPictProviderGraphLayout.Edges.PerimeterLinear,
	PerimeterOrthogonal:  libPictProviderGraphLayout.Edges.PerimeterOrthogonal
};

// FlowCard base class
module.exports.PictFlowCard = require('./PictFlowCard.js');

// FlowCardPropertiesPanel base class and panel types
module.exports.PictFlowCardPropertiesPanel = require('./PictFlowCardPropertiesPanel.js');
module.exports.FlowCardPropertiesPanelTemplate = require('./panels/FlowCardPropertiesPanel-Template.js');
module.exports.FlowCardPropertiesPanelMarkdown = require('./panels/FlowCardPropertiesPanel-Markdown.js');
module.exports.FlowCardPropertiesPanelForm = require('./panels/FlowCardPropertiesPanel-Form.js');
module.exports.FlowCardPropertiesPanelView = require('./panels/FlowCardPropertiesPanel-View.js');

// Properties panel renderer view
module.exports.PictViewFlowPropertiesPanel = require('./views/PictView-Flow-PropertiesPanel.js');
