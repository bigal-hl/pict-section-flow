const libFableServiceProviderBase = require('fable-serviceproviderbase');

// Layout algorithm and edge-theme descriptors now live in the standalone
// pict-provider-graphlayout module (flow 2.0 Phase 1b). The variable names below
// are unchanged so the registration logic that follows is untouched.
const libGraphLayout = require('pict-provider-graphlayout');

const libLayoutCustom           = libGraphLayout.Layouts.Custom;
const libLayoutLayered          = libGraphLayout.Layouts.Layered;
const libLayoutStaggered        = libGraphLayout.Layouts.Staggered;
const libLayoutForcedFromCenter = libGraphLayout.Layouts.ForcedFromCenter;
const libLayoutGrid             = libGraphLayout.Layouts.Grid;
const libLayoutCircular         = libGraphLayout.Layouts.Circular;
const libLayoutTabular          = libGraphLayout.Layouts.Tabular;
const libLayoutColumnar         = libGraphLayout.Layouts.Columnar;

const libEdgeBezier              = libGraphLayout.Edges.Bezier;
const libEdgeOrthogonal          = libGraphLayout.Edges.Orthogonal;
const libEdgeStraight            = libGraphLayout.Edges.Straight;
const libEdgeOrthogonalSnap      = libGraphLayout.Edges.OrthogonalSnap;
const libEdgePerimeter           = libGraphLayout.Edges.Perimeter;
const libEdgePerimeterLinear     = libGraphLayout.Edges.PerimeterLinear;
const libEdgePerimeterOrthogonal = libGraphLayout.Edges.PerimeterOrthogonal;

const _BUILTIN_ALGORITHMS =
[
	libLayoutCustom,
	libLayoutLayered,
	libLayoutStaggered,
	libLayoutForcedFromCenter,
	libLayoutGrid,
	libLayoutCircular,
	libLayoutTabular,
	libLayoutColumnar
];

const _BUILTIN_EDGE_THEMES =
[
	libEdgeBezier,
	libEdgeOrthogonal,
	libEdgeStraight,
	libEdgeOrthogonalSnap,
	libEdgePerimeter,
	libEdgePerimeterLinear,
	libEdgePerimeterOrthogonal
];

const _LEGACY_ALGORITHM  = 'Layered';
const _DEFAULT_EDGE_THEME = 'Bezier';

/**
 * PictServiceFlowLayout
 *
 * Layout-algorithm registry and dispatcher. Holds plain descriptor
 * objects (`{ Name, Label, Apply, DefaultParameters, ParameterSchema }`)
 * for every registered layout algorithm, plus the small helpers
 * `snapToGrid` and `centerNodes` and the special-case `autoLayoutSubset`.
 *
 * Algorithms are pure functions over `(nodes, connections, parameters)`
 * that mutate node X/Y in place. Third parties extend the registry via
 * `registerAlgorithm(pDescriptor)`.
 *
 * Note: `_LayoutProvider` (PictProvider-Flow-Layouts.js) is a different
 * concept — it manages **saved layout snapshots** (named position
 * captures the user can restore later). Don't confuse "layouts" (saved
 * snapshots) with "layout algorithms" (procedural arrangement).
 */
class PictServiceFlowLayout extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictServiceFlowLayout';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;

		// Legacy spacing fields kept for `autoLayoutSubset` and any
		// external consumer that read them. The Layered algorithm itself
		// pulls spacing from its DefaultParameters.
		this._HorizontalSpacing = 250;
		this._VerticalSpacing = 120;
		this._StartX = 100;
		this._StartY = 100;

		// Algorithm registry: Name → descriptor
		this._Algorithms = {};

		// Edge-theme registry: Name → descriptor
		this._EdgeThemes = {};

		for (let i = 0; i < _BUILTIN_ALGORITHMS.length; i++)
		{
			this.registerAlgorithm(_BUILTIN_ALGORITHMS[i]);
		}
		for (let i = 0; i < _BUILTIN_EDGE_THEMES.length; i++)
		{
			this.registerEdgeTheme(_BUILTIN_EDGE_THEMES[i]);
		}
	}

	// ── Algorithm Registry ────────────────────────────────────────────────

	/**
	 * Register a layout algorithm.
	 * @param {Object} pDescriptor - { Name, Label, Apply, DefaultParameters, ParameterSchema }
	 * @returns {boolean} true if registered, false if invalid
	 */
	registerAlgorithm(pDescriptor)
	{
		if (!pDescriptor || typeof pDescriptor !== 'object')
		{
			this.log.warn('PictServiceFlowLayout registerAlgorithm: descriptor must be an object');
			return false;
		}
		if (typeof pDescriptor.Name !== 'string' || pDescriptor.Name === '')
		{
			this.log.warn('PictServiceFlowLayout registerAlgorithm: descriptor.Name is required');
			return false;
		}
		if (typeof pDescriptor.Apply !== 'function')
		{
			this.log.warn(`PictServiceFlowLayout registerAlgorithm: descriptor.Apply for '${pDescriptor.Name}' must be a function`);
			return false;
		}

		this._Algorithms[pDescriptor.Name] = pDescriptor;
		return true;
	}

	/**
	 * Look up a registered algorithm by name.
	 * @param {string} pName
	 * @returns {Object|null}
	 */
	getAlgorithm(pName)
	{
		return this._Algorithms[pName] || null;
	}

	/**
	 * List all registered algorithm names in registration order.
	 * @returns {string[]}
	 */
	getAlgorithmNames()
	{
		return Object.keys(this._Algorithms);
	}

	/**
	 * List all registered algorithm descriptors.
	 * @returns {Object[]}
	 */
	listAlgorithms()
	{
		let tmpKeys = Object.keys(this._Algorithms);
		let tmpResult = [];
		for (let i = 0; i < tmpKeys.length; i++)
		{
			tmpResult.push(this._Algorithms[tmpKeys[i]]);
		}
		return tmpResult;
	}

	/**
	 * Build the merged parameter set for an algorithm: default values
	 * with caller-supplied overrides on top.
	 * @param {string} pName
	 * @param {Object} [pOverrides]
	 * @returns {Object}
	 */
	getMergedParameters(pName, pOverrides)
	{
		let tmpAlgo = this.getAlgorithm(pName);
		if (!tmpAlgo) return Object.assign({}, pOverrides || {});
		return Object.assign({}, tmpAlgo.DefaultParameters || {}, pOverrides || {});
	}

	// ── Edge-Theme Registry ──────────────────────────────────────────────

	/**
	 * Register an edge theme.
	 * @param {Object} pDescriptor - { Name, Label, Description, GeneratePath, AdjustLayout?, DefaultParameters?, ParameterSchema? }
	 * @returns {boolean} true if registered, false if invalid
	 */
	registerEdgeTheme(pDescriptor)
	{
		if (!pDescriptor || typeof pDescriptor !== 'object')
		{
			this.log.warn('PictServiceFlowLayout registerEdgeTheme: descriptor must be an object');
			return false;
		}
		if (typeof pDescriptor.Name !== 'string' || pDescriptor.Name === '')
		{
			this.log.warn('PictServiceFlowLayout registerEdgeTheme: descriptor.Name is required');
			return false;
		}
		if (typeof pDescriptor.GeneratePath !== 'function')
		{
			this.log.warn(`PictServiceFlowLayout registerEdgeTheme: descriptor.GeneratePath for '${pDescriptor.Name}' must be a function`);
			return false;
		}
		this._EdgeThemes[pDescriptor.Name] = pDescriptor;
		return true;
	}

	/**
	 * Look up a registered edge theme by name.
	 * @param {string} pName
	 * @returns {Object|null}
	 */
	getEdgeTheme(pName)
	{
		return this._EdgeThemes[pName] || null;
	}

	/**
	 * List all registered edge-theme names in registration order.
	 * @returns {string[]}
	 */
	getEdgeThemeNames()
	{
		return Object.keys(this._EdgeThemes);
	}

	/**
	 * List all registered edge-theme descriptors.
	 * @returns {Object[]}
	 */
	listEdgeThemes()
	{
		let tmpKeys = Object.keys(this._EdgeThemes);
		let tmpResult = [];
		for (let i = 0; i < tmpKeys.length; i++)
		{
			tmpResult.push(this._EdgeThemes[tmpKeys[i]]);
		}
		return tmpResult;
	}

	/**
	 * Resolve which edge theme should render a given connection. Order:
	 *   1. `Connection.Data.EdgeTheme` (per-connection override)
	 *   2. Per-connection `Connection.Data.LineMode === 'orthogonal'`
	 *      → 'Orthogonal' (back-compat for the existing line-mode flag)
	 *   3. `_FlowData.EdgeTheme` (flow-level)
	 *   4. Active layout's `DefaultEdgeTheme`
	 *   5. The hard fallback ('Bezier')
	 *
	 * Returns null only if even the fallback isn't registered, in which
	 * case the renderer should use its built-in path generators.
	 *
	 * @param {Object} pConnection
	 * @returns {Object|null}
	 */
	resolveActiveEdgeTheme(pConnection)
	{
		let tmpData = (pConnection && pConnection.Data) || {};
		let tmpFlowView = this._FlowView;
		let tmpFlowData = tmpFlowView ? tmpFlowView._FlowData : null;

		if (tmpData.EdgeTheme)
		{
			let tmpTheme = this.getEdgeTheme(tmpData.EdgeTheme);
			if (tmpTheme) return tmpTheme;
		}
		if (tmpData.LineMode === 'orthogonal' && !tmpData.EdgeTheme)
		{
			let tmpTheme = this.getEdgeTheme('Orthogonal');
			if (tmpTheme) return tmpTheme;
		}
		if (tmpFlowData && tmpFlowData.EdgeTheme)
		{
			let tmpTheme = this.getEdgeTheme(tmpFlowData.EdgeTheme);
			if (tmpTheme) return tmpTheme;
		}
		if (tmpFlowData && tmpFlowData.LayoutAlgorithm)
		{
			let tmpAlgo = this.getAlgorithm(tmpFlowData.LayoutAlgorithm);
			if (tmpAlgo && tmpAlgo.DefaultEdgeTheme)
			{
				let tmpTheme = this.getEdgeTheme(tmpAlgo.DefaultEdgeTheme);
				if (tmpTheme) return tmpTheme;
			}
		}
		return this.getEdgeTheme(_DEFAULT_EDGE_THEME);
	}

	/**
	 * Build the merged parameter set for an edge theme.
	 * @param {string} pName
	 * @param {Object} [pOverrides]
	 * @returns {Object}
	 */
	getMergedEdgeThemeParameters(pName, pOverrides)
	{
		let tmpTheme = this.getEdgeTheme(pName);
		if (!tmpTheme) return Object.assign({}, pOverrides || {});
		return Object.assign({}, tmpTheme.DefaultParameters || {}, pOverrides || {});
	}

	// ── Dispatch ──────────────────────────────────────────────────────────

	/**
	 * Apply a registered layout algorithm. Mutates node X/Y in place.
	 * @param {Array} pNodes
	 * @param {Array} pConnections
	 * @param {string} pAlgorithmName
	 * @param {Object} [pParameters]
	 */
	applyLayout(pNodes, pConnections, pAlgorithmName, pParameters)
	{
		let tmpAlgo = this.getAlgorithm(pAlgorithmName);
		if (!tmpAlgo)
		{
			this.log.warn(`PictServiceFlowLayout applyLayout: unknown algorithm '${pAlgorithmName}', falling back to '${_LEGACY_ALGORITHM}'`);
			tmpAlgo = this.getAlgorithm(_LEGACY_ALGORITHM);
			if (!tmpAlgo) return;
		}
		let tmpMerged = Object.assign({}, tmpAlgo.DefaultParameters || {}, pParameters || {});
		tmpAlgo.Apply(pNodes, pConnections, tmpMerged);
	}

	/**
	 * Auto-layout entry point.
	 *
	 * - Legacy 2-arg form `autoLayout(nodes, connections)` dispatches to
	 *   the Layered algorithm and is byte-for-byte identical to the
	 *   pre-subsystem behavior.
	 * - 3- or 4-arg form `autoLayout(nodes, connections, name, params)`
	 *   dispatches to the named algorithm.
	 *
	 * @param {Array} pNodes
	 * @param {Array} pConnections
	 * @param {string} [pAlgorithmName] - defaults to the Layered algorithm
	 * @param {Object} [pParameters]
	 */
	autoLayout(pNodes, pConnections, pAlgorithmName, pParameters)
	{
		if (!pNodes || pNodes.length === 0) return;
		let tmpName = (typeof pAlgorithmName === 'string' && pAlgorithmName !== '') ? pAlgorithmName : _LEGACY_ALGORITHM;
		this.applyLayout(pNodes, pConnections, tmpName, pParameters);
	}

	// ── Helpers ──────────────────────────────────────────────────────────

	/**
	 * Snap a coordinate to the nearest grid point.
	 * @param {number} pValue
	 * @param {number} pGridSize
	 * @returns {number}
	 */
	snapToGrid(pValue, pGridSize)
	{
		if (!pGridSize || pGridSize <= 0) return pValue;
		return Math.round(pValue / pGridSize) * pGridSize;
	}

	/**
	 * Auto-layout a subset of nodes, positioning them to the right of
	 * any fixed (already-positioned) nodes.
	 *
	 * Used by the saved-layout restore flow (`PictProvider-Flow-Layouts`)
	 * to position nodes that exist in the current flow but were absent
	 * from the saved snapshot.
	 *
	 * **Always runs the Layered algorithm**, regardless of the flow's
	 * configured `LayoutAlgorithm`. Running ForcedFromCenter or another
	 * algorithm on a partial node set would jitter the matched nodes
	 * (which are intentionally fixed). The contract here is "place the
	 * orphans in a sensible default arrangement," not "obey the user's
	 * full-graph algorithm."
	 *
	 * @param {Array} pNodesToLayout - Nodes that need new positions
	 * @param {Array} pFixedNodes - Nodes that already have positions (read-only)
	 * @param {Array} pConnections - All connections in the flow
	 */
	autoLayoutSubset(pNodesToLayout, pFixedNodes, pConnections)
	{
		if (!pNodesToLayout || pNodesToLayout.length === 0) return;

		// Compute the starting X position to the right of all fixed nodes
		let tmpStartX = this._StartX;
		let tmpStartY = this._StartY;

		if (pFixedNodes && pFixedNodes.length > 0)
		{
			let tmpMaxX = -Infinity;

			for (let i = 0; i < pFixedNodes.length; i++)
			{
				let tmpRight = pFixedNodes[i].X + (pFixedNodes[i].Width || 180);
				if (tmpRight > tmpMaxX)
				{
					tmpMaxX = tmpRight;
				}
			}

			tmpStartX = tmpMaxX + this._HorizontalSpacing;
		}

		// Build a set of nodes we are laying out for quick lookup
		let tmpNodeSet = {};
		for (let i = 0; i < pNodesToLayout.length; i++)
		{
			tmpNodeSet[pNodesToLayout[i].Hash] = true;
		}

		// Build adjacency information only for nodes in the subset
		let tmpNodeMap = {};
		let tmpInDegree = {};
		let tmpOutEdges = {};

		for (let i = 0; i < pNodesToLayout.length; i++)
		{
			let tmpNode = pNodesToLayout[i];
			tmpNodeMap[tmpNode.Hash] = tmpNode;
			tmpInDegree[tmpNode.Hash] = 0;
			tmpOutEdges[tmpNode.Hash] = [];
		}

		for (let i = 0; i < pConnections.length; i++)
		{
			let tmpConn = pConnections[i];
			let tmpSourceInSubset = tmpNodeSet[tmpConn.SourceNodeHash];
			let tmpTargetInSubset = tmpNodeSet[tmpConn.TargetNodeHash];

			if (tmpSourceInSubset && tmpTargetInSubset)
			{
				tmpInDegree[tmpConn.TargetNodeHash]++;
				tmpOutEdges[tmpConn.SourceNodeHash].push(tmpConn.TargetNodeHash);
			}
		}

		// Topological sort (Kahn's algorithm)
		let tmpLayers = [];
		let tmpQueue = [];
		let tmpAssigned = {};

		for (let tmpHash in tmpInDegree)
		{
			if (tmpInDegree[tmpHash] === 0)
			{
				tmpQueue.push(tmpHash);
			}
		}

		while (tmpQueue.length > 0)
		{
			let tmpCurrentLayer = [];
			let tmpNextQueue = [];

			for (let i = 0; i < tmpQueue.length; i++)
			{
				let tmpNodeHash = tmpQueue[i];
				if (tmpAssigned[tmpNodeHash]) continue;

				tmpAssigned[tmpNodeHash] = true;
				tmpCurrentLayer.push(tmpNodeHash);

				let tmpEdges = tmpOutEdges[tmpNodeHash] || [];
				for (let j = 0; j < tmpEdges.length; j++)
				{
					let tmpTargetHash = tmpEdges[j];
					tmpInDegree[tmpTargetHash]--;
					if (tmpInDegree[tmpTargetHash] <= 0 && !tmpAssigned[tmpTargetHash])
					{
						tmpNextQueue.push(tmpTargetHash);
					}
				}
			}

			if (tmpCurrentLayer.length > 0)
			{
				tmpLayers.push(tmpCurrentLayer);
			}

			tmpQueue = tmpNextQueue;
		}

		// Handle remaining unassigned nodes (cycles or disconnected)
		let tmpRemainingNodes = [];
		for (let i = 0; i < pNodesToLayout.length; i++)
		{
			if (!tmpAssigned[pNodesToLayout[i].Hash])
			{
				tmpRemainingNodes.push(pNodesToLayout[i].Hash);
			}
		}
		if (tmpRemainingNodes.length > 0)
		{
			tmpLayers.push(tmpRemainingNodes);
		}

		// Assign positions based on layers, starting from tmpStartX
		let tmpCurrentX = tmpStartX;

		for (let tmpLayerIndex = 0; tmpLayerIndex < tmpLayers.length; tmpLayerIndex++)
		{
			let tmpLayer = tmpLayers[tmpLayerIndex];
			let tmpMaxWidth = 0;
			let tmpCurrentY = tmpStartY;

			for (let i = 0; i < tmpLayer.length; i++)
			{
				let tmpNode = tmpNodeMap[tmpLayer[i]];
				if (!tmpNode) continue;

				tmpNode.X = tmpCurrentX;
				tmpNode.Y = tmpCurrentY;

				let tmpWidth = tmpNode.Width || 180;
				let tmpHeight = tmpNode.Height || 80;

				tmpMaxWidth = Math.max(tmpMaxWidth, tmpWidth);
				tmpCurrentY += tmpHeight + this._VerticalSpacing;
			}

			tmpCurrentX += tmpMaxWidth + this._HorizontalSpacing;
		}
	}

	/**
	 * Center all nodes around a given point.
	 * @param {Array} pNodes
	 * @param {number} pCenterX
	 * @param {number} pCenterY
	 */
	centerNodes(pNodes, pCenterX, pCenterY)
	{
		if (!pNodes || pNodes.length === 0) return;

		let tmpMinX = Infinity, tmpMinY = Infinity;
		let tmpMaxX = -Infinity, tmpMaxY = -Infinity;

		for (let i = 0; i < pNodes.length; i++)
		{
			tmpMinX = Math.min(tmpMinX, pNodes[i].X);
			tmpMinY = Math.min(tmpMinY, pNodes[i].Y);
			tmpMaxX = Math.max(tmpMaxX, pNodes[i].X + (pNodes[i].Width || 180));
			tmpMaxY = Math.max(tmpMaxY, pNodes[i].Y + (pNodes[i].Height || 80));
		}

		let tmpCurrentCenterX = (tmpMinX + tmpMaxX) / 2;
		let tmpCurrentCenterY = (tmpMinY + tmpMaxY) / 2;
		let tmpOffsetX = pCenterX - tmpCurrentCenterX;
		let tmpOffsetY = pCenterY - tmpCurrentCenterY;

		for (let i = 0; i < pNodes.length; i++)
		{
			pNodes[i].X += tmpOffsetX;
			pNodes[i].Y += tmpOffsetY;
		}
	}
}

module.exports = PictServiceFlowLayout;
