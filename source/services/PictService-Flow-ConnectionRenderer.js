const libFableServiceProviderBase = require('fable-serviceproviderbase');
const libPerimeterMath = require('../providers/edges/Edge-PerimeterMath.js');

// Chip (port-label badge) geometry — must mirror PortRenderer's badge
// dimensions exactly so hint paths land on the chip's actual outer
// edge instead of where we *guess* it might be.
const _CHIP_HEIGHT       = 12;
const _CHIP_PAD_H        = 5;
const _CHIP_EDGE_PAD     = 1;
const _CHIP_PORT_RADIUS  = 5;
const _CHIP_BORDER_WIDTH = 2;
const _CHIP_PER_CHAR_PX  = 5;

// Port-type → stroke color map. Mirrors the table PortRenderer uses for
// badge borders so the hint bezier matches its port's affinity color.
const PORT_TYPE_COLORS =
{
	'event-in':  'var(--theme-color-status-info, #3498db)',
	'event-out': 'var(--theme-color-status-success, #2ecc71)',
	'setting':   'var(--theme-color-status-warning, #e67e22)',
	'value':     'var(--theme-color-status-warning, #f1c40f)',
	'error':     'var(--theme-color-status-error, #e74c3c)'
};
const PORT_TYPE_DEFAULT_COLOR = 'var(--theme-color-border-default, #95a5a6)';

class PictServiceFlowConnectionRenderer extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictServiceFlowConnectionRenderer';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;
	}

	/**
	 * Render a connection as an SVG path with hit area and optional handles.
	 * @param {Object} pConnection - The connection data
	 * @param {SVGGElement} pConnectionsLayer - The SVG group to append to
	 * @param {boolean} pIsSelected - Whether this connection is selected
	 */
	renderConnection(pConnection, pConnectionsLayer, pIsSelected)
	{
		if (!this._FlowView) return;

		let tmpSourcePos = this._FlowView.getPortPosition(pConnection.SourceNodeHash, pConnection.SourcePortHash);
		let tmpTargetPos = this._FlowView.getPortPosition(pConnection.TargetNodeHash, pConnection.TargetPortHash);

		// Let the active edge theme reshape the attachment points (e.g. a
		// "perimeter" theme that exits whichever side of the node faces the
		// other end). The static port positions are still computed above so
		// themes that don't override fall through unchanged.
		let tmpStaticSourcePos = tmpSourcePos;
		let tmpStaticTargetPos = tmpTargetPos;
		let tmpAttachOverride = this._resolveAttachmentsViaEdgeTheme(pConnection, tmpSourcePos, tmpTargetPos);
		if (tmpAttachOverride.source) tmpSourcePos = tmpAttachOverride.source;
		if (tmpAttachOverride.target) tmpTargetPos = tmpAttachOverride.target;

		// Look up the source port's PortType for connection coloring
		let tmpSourcePortType = null;
		let tmpSourceNode = this._FlowView.getNode(pConnection.SourceNodeHash);
		if (tmpSourceNode && tmpSourceNode.Ports)
		{
			for (let i = 0; i < tmpSourceNode.Ports.length; i++)
			{
				if (tmpSourceNode.Ports[i].Hash === pConnection.SourcePortHash)
				{
					tmpSourcePortType = tmpSourceNode.Ports[i].PortType || null;
					break;
				}
			}
		}

		if (!tmpSourcePos || !tmpTargetPos) return;

		let tmpData = pConnection.Data || {};
		let tmpPath = this._generatePathViaEdgeTheme(pConnection, tmpSourcePos, tmpTargetPos, tmpData);

		// Apply theme noise post-processing to the path
		if (this._FlowView._ThemeProvider)
		{
			tmpPath = this._FlowView._ThemeProvider.processPathString(tmpPath, pConnection.Hash);
		}

		// Apply stroke-dasharray from theme's ConnectionConfig
		let tmpStrokeDashArray = null;
		if (this._FlowView._ThemeProvider)
		{
			let tmpActiveTheme = this._FlowView._ThemeProvider.getActiveTheme();
			if (tmpActiveTheme && tmpActiveTheme.ConnectionConfig && tmpActiveTheme.ConnectionConfig.StrokeDashArray)
			{
				tmpStrokeDashArray = tmpActiveTheme.ConnectionConfig.StrokeDashArray;
			}
		}

		let tmpViewIdentifier = this._FlowView.options.ViewIdentifier;

		// Build the port-type CSS class suffix for connection coloring
		let tmpConnTypeClass = tmpSourcePortType ? (' conn-type-' + tmpSourcePortType) : '';

		// Determine the arrowhead marker based on port type
		let tmpArrowMarkerId;
		if (pIsSelected)
		{
			tmpArrowMarkerId = 'flow-arrowhead-selected-' + tmpViewIdentifier;
		}
		else if (tmpSourcePortType)
		{
			tmpArrowMarkerId = 'flow-arrowhead-' + tmpSourcePortType + '-' + tmpViewIdentifier;
		}
		else
		{
			tmpArrowMarkerId = 'flow-arrowhead-' + tmpViewIdentifier;
		}

		// Hit area (wider invisible path for easier selection)
		let tmpShapeProvider = this._FlowView._ConnectorShapesProvider;
		if (tmpShapeProvider)
		{
			let tmpHitArea = tmpShapeProvider.createConnectionHitAreaElement(tmpPath, pConnection.Hash);
			pConnectionsLayer.appendChild(tmpHitArea);

			let tmpPathElement = tmpShapeProvider.createConnectionPathElement(
				tmpPath, pConnection.Hash, pIsSelected, tmpViewIdentifier);
			if (tmpConnTypeClass)
			{
				tmpPathElement.setAttribute('class',
					(tmpPathElement.getAttribute('class') || '') + tmpConnTypeClass);
			}
			// Override the default arrowhead with the typed one
			tmpPathElement.setAttribute('marker-end', 'url(#' + tmpArrowMarkerId + ')');
			if (tmpStrokeDashArray)
			{
				tmpPathElement.setAttribute('stroke-dasharray', tmpStrokeDashArray);
			}
			pConnectionsLayer.appendChild(tmpPathElement);
		}
		else
		{
			let tmpHitArea = this._FlowView._SVGHelperProvider.createSVGElement('path');
			tmpHitArea.setAttribute('class', 'pict-flow-connection-hitarea');
			tmpHitArea.setAttribute('d', tmpPath);
			tmpHitArea.setAttribute('data-connection-hash', pConnection.Hash);
			tmpHitArea.setAttribute('data-element-type', 'connection-hitarea');
			pConnectionsLayer.appendChild(tmpHitArea);

			let tmpPathElement = this._FlowView._SVGHelperProvider.createSVGElement('path');
			tmpPathElement.setAttribute('class', `pict-flow-connection${tmpConnTypeClass} ${pIsSelected ? 'selected' : ''}`);
			tmpPathElement.setAttribute('d', tmpPath);
			tmpPathElement.setAttribute('data-connection-hash', pConnection.Hash);
			tmpPathElement.setAttribute('data-element-type', 'connection');
			tmpPathElement.setAttribute('marker-end', 'url(#' + tmpArrowMarkerId + ')');

			if (tmpStrokeDashArray)
			{
				tmpPathElement.setAttribute('stroke-dasharray', tmpStrokeDashArray);
			}

			pConnectionsLayer.appendChild(tmpPathElement);
		}

		// Render the colored endpoint dot at each end of the connection
		// into the dedicated endpoints layer (sits *above* the nodes
		// layer so the dot doesn't get hidden under the card chrome
		// when an edge theme places it on the node's perimeter).
		// PortRenderer suppresses its own circle for any port that
		// participates in a connection — we own the dot here.
		let tmpEndpointsLayer = this._FlowView._EndpointsLayer || pConnectionsLayer;
		this._renderEndpointDots(pConnection, tmpEndpointsLayer, tmpSourcePos, tmpTargetPos);

		// When the resolved attachment differs from the card-defined port
		// position (e.g. a Perimeter theme moved the dot to the edge of the
		// card), paint a hidden hint bezier connecting the badge to the
		// dot. CSS reveals it on hover so users can see "this 'In' chip
		// corresponds to that dot up at the top".
		if (this._FlowView._PortHintsLayer)
		{
			this._renderPortHints(pConnection, this._FlowView._PortHintsLayer,
				tmpStaticSourcePos, tmpSourcePos, tmpStaticTargetPos, tmpTargetPos);
		}

		// Render drag handles when selected
		if (pIsSelected)
		{
			this._renderHandles(pConnection, pConnectionsLayer, tmpSourcePos, tmpTargetPos);
		}
	}

	/**
	 * Append the colored endpoint dots for both ends of a connection
	 * onto the destination layer (absolute coords). Reuses
	 * `ConnectorShapesProvider.createPortElement` so the styling
	 * matches the static port circle exactly.
	 *
	 * @param {Object} pConnection
	 * @param {SVGGElement} pLayer - the endpoints layer (or fallback)
	 * @param {{x: number, y: number}} pSourcePos
	 * @param {{x: number, y: number}} pTargetPos
	 */
	_renderEndpointDots(pConnection, pLayer, pSourcePos, pTargetPos)
	{
		let tmpShapeProvider = this._FlowView._ConnectorShapesProvider;
		if (!tmpShapeProvider) return;

		let tmpSourceNode = this._FlowView.getNode(pConnection.SourceNodeHash);
		let tmpTargetNode = this._FlowView.getNode(pConnection.TargetNodeHash);
		let tmpSourcePort = this._findPort(tmpSourceNode, pConnection.SourcePortHash);
		let tmpTargetPort = this._findPort(tmpTargetNode, pConnection.TargetPortHash);

		if (tmpSourcePort && pSourcePos)
		{
			let tmpDot = tmpShapeProvider.createPortElement(tmpSourcePort, pSourcePos, pConnection.SourceNodeHash);
			tmpDot.setAttribute('data-connection-hash', pConnection.Hash);
			tmpDot.setAttribute('data-connection-end', 'source');
			pLayer.appendChild(tmpDot);
		}
		if (tmpTargetPort && pTargetPos)
		{
			let tmpDot = tmpShapeProvider.createPortElement(tmpTargetPort, pTargetPos, pConnection.TargetNodeHash);
			tmpDot.setAttribute('data-connection-hash', pConnection.Hash);
			tmpDot.setAttribute('data-connection-end', 'target');
			pLayer.appendChild(tmpDot);
		}
	}

	/**
	 * Render the per-end "where did the dot go" hint paths. Drawn into
	 * the port-hints layer (above nodes) but kept opacity:0 by CSS;
	 * PortRenderer/NodeView toggle a `data-active` attribute on hover.
	 *
	 * Skipped when the resolved attachment matches the static port
	 * position (no theme rerouting → no need for a hint).
	 *
	 * @param {Object} pConnection
	 * @param {SVGGElement} pLayer
	 * @param {{x: number, y: number, side?: string}} pStaticSrc - card-defined port position
	 * @param {{x: number, y: number, side?: string}} pSrc - resolved attachment
	 * @param {{x: number, y: number, side?: string}} pStaticTgt
	 * @param {{x: number, y: number, side?: string}} pTgt
	 */
	_renderPortHints(pConnection, pLayer, pStaticSrc, pSrc, pStaticTgt, pTgt)
	{
		let tmpPositionsDiffer = function (pA, pB)
		{
			if (!pA || !pB) return false;
			return (Math.abs(pA.x - pB.x) > 0.5) || (Math.abs(pA.y - pB.y) > 0.5);
		};

		let tmpSourceNode = this._FlowView.getNode(pConnection.SourceNodeHash);
		let tmpTargetNode = this._FlowView.getNode(pConnection.TargetNodeHash);
		let tmpSourcePort = this._findPort(tmpSourceNode, pConnection.SourcePortHash);
		let tmpTargetPort = this._findPort(tmpTargetNode, pConnection.TargetPortHash);

		// Hints are colored by the *other* end's node identity — looking
		// at a hub with 8 hints fanning out, each hint is the color of
		// the spoke that connection terminates at, so you can tell at a
		// glance which line goes where without tracing it. (Mirrors the
		// Ultravisor card-category color model: gray=flow-control,
		// purple=core, orange=data, teal=llm, etc.)
		// Anchor each hint at the chip's outer edge facing the dot
		// (not the port's static position, which sits on the node's
		// edge — visually inside the chip's stripe). The hint ends at
		// the dot but its tail "points at" the chip's center.
		if (pStaticSrc && tmpPositionsDiffer(pStaticSrc, pSrc))
		{
			let tmpChipExit = this._chipEdgeAimingAt(tmpSourcePort, pStaticSrc, pSrc);
			pLayer.appendChild(this._buildPortHintPath(
				tmpChipExit, pSrc,
				pConnection.SourceNodeHash, pConnection.SourcePortHash, pConnection.Hash, 'source',
				this._hintColor(tmpSourcePort, tmpTargetNode)));
		}
		if (pStaticTgt && tmpPositionsDiffer(pStaticTgt, pTgt))
		{
			let tmpChipExit = this._chipEdgeAimingAt(tmpTargetPort, pStaticTgt, pTgt);
			pLayer.appendChild(this._buildPortHintPath(
				tmpChipExit, pTgt,
				pConnection.TargetNodeHash, pConnection.TargetPortHash, pConnection.Hash, 'target',
				this._hintColor(tmpTargetPort, tmpSourceNode)));
		}
	}

	/**
	 * Compute the chip (port-label badge) bounding box for a given
	 * port. The chip is a small rectangle that lives just inside the
	 * node's outer edge, anchored to the port's static position. We
	 * mirror PortRenderer's badge geometry exactly so the hint path
	 * lands on real chip-edge pixels.
	 *
	 * Returns null when we don't have enough info (no label or
	 * unknown side) — caller should fall back to the static position.
	 *
	 * @param {Object|null} pPort
	 * @param {{x: number, y: number, side?: string}} pStaticPos - the
	 *        port's nominal position (returned by getPortPosition); the
	 *        chip extends *inward* from here.
	 * @returns {{X: number, Y: number, Width: number, Height: number}|null}
	 */
	_chipBoundsFor(pPort, pStaticPos)
	{
		if (!pPort || !pStaticPos) return null;
		let tmpSide = pStaticPos.side || pPort.Side || (pPort.Direction === 'input' ? 'left' : 'right');
		let tmpLabel = pPort.Label || '';
		// PortRenderer skips badge rendering entirely when there is no
		// label, so there's nothing for the hint to anchor against.
		if (tmpLabel === '') return null;

		let tmpTextPx = tmpLabel.length * _CHIP_PER_CHAR_PX;
		let tmpWidth = _CHIP_PORT_RADIUS + _CHIP_PAD_H + tmpTextPx + _CHIP_PAD_H + _CHIP_BORDER_WIDTH;
		let tmpHeight = _CHIP_HEIGHT;

		// Chip center sits halfway along the line from the port's static
		// position toward the inside of the node, offset by half the
		// chip's extent in that direction (plus the 1px edge padding
		// PortRenderer leaves between the chip and the node edge).
		let tmpCx, tmpCy;
		if (tmpSide.indexOf('left') === 0)
		{
			tmpCx = pStaticPos.x + tmpWidth / 2 + _CHIP_EDGE_PAD;
			tmpCy = pStaticPos.y;
		}
		else if (tmpSide.indexOf('right') === 0)
		{
			tmpCx = pStaticPos.x - tmpWidth / 2 - _CHIP_EDGE_PAD;
			tmpCy = pStaticPos.y;
		}
		else if (tmpSide.indexOf('top') === 0)
		{
			tmpCx = pStaticPos.x;
			tmpCy = pStaticPos.y + tmpHeight / 2 + _CHIP_EDGE_PAD;
		}
		else if (tmpSide.indexOf('bottom') === 0)
		{
			tmpCx = pStaticPos.x;
			tmpCy = pStaticPos.y - tmpHeight / 2 - _CHIP_EDGE_PAD;
		}
		else
		{
			return null;
		}

		return { X: tmpCx - tmpWidth / 2, Y: tmpCy - tmpHeight / 2, Width: tmpWidth, Height: tmpHeight };
	}

	/**
	 * Resolve the point on the chip's outer perimeter where a line
	 * from the chip's center toward the dot would exit the chip. Used
	 * as the hint's start point so the line visually emerges from the
	 * chip's edge facing the dot, aimed at the chip's center.
	 *
	 * Falls back to the static port position when chip geometry can't
	 * be computed (no label, unknown side).
	 *
	 * @param {Object|null} pPort
	 * @param {{x: number, y: number, side?: string}} pStaticPos
	 * @param {{x: number, y: number}} pDotPos
	 * @returns {{x: number, y: number}}
	 */
	_chipEdgeAimingAt(pPort, pStaticPos, pDotPos)
	{
		let tmpBounds = this._chipBoundsFor(pPort, pStaticPos);
		if (!tmpBounds) return pStaticPos;
		let tmpExit = libPerimeterMath.resolvePerimeterAttachment({
			Node: tmpBounds,
			OtherDefaultPosition: pDotPos
		});
		if (!tmpExit) return pStaticPos;
		return tmpExit;
	}

	/**
	 * Resolve a node's identity color. Looks at the inline node fields
	 * first (per-node overrides win), then the registered node-type
	 * config from the NodeTypeProvider. Returns null when the node has
	 * no opinion — caller should fall back to port-type color.
	 *
	 * @param {Object|null} pNode
	 * @returns {string|null}
	 */
	_resolveNodeIdentityColor(pNode)
	{
		if (!pNode) return null;
		if (pNode.TitleBarColor) return pNode.TitleBarColor;
		if (pNode.BodyStyle && pNode.BodyStyle.stroke) return pNode.BodyStyle.stroke;
		let tmpProvider = this._FlowView ? this._FlowView._NodeTypeProvider : null;
		if (tmpProvider && typeof tmpProvider.getNodeType === 'function' && pNode.Type)
		{
			let tmpType = tmpProvider.getNodeType(pNode.Type);
			if (tmpType)
			{
				if (tmpType.TitleBarColor) return tmpType.TitleBarColor;
				if (tmpType.BodyStyle && tmpType.BodyStyle.stroke) return tmpType.BodyStyle.stroke;
			}
		}
		return null;
	}

	/**
	 * Resolve the hint stroke color. Priority chain:
	 *   1. The OTHER end's node identity color (TitleBarColor /
	 *      BodyStyle.stroke / NodeTypeConfig color) — the strongest
	 *      signal: "this hint terminates at *that* card".
	 *   2. This end's PortType color — semantic-role fallback.
	 *   3. Direction-based default that matches the visible dot color.
	 *   4. Neutral gray.
	 *
	 * @param {Object|null} pPort - this end's port
	 * @param {Object|null} pOtherNode - the node at the other end
	 * @returns {string}
	 */
	_hintColor(pPort, pOtherNode)
	{
		let tmpOtherColor = this._resolveNodeIdentityColor(pOtherNode);
		if (tmpOtherColor) return tmpOtherColor;
		if (pPort && pPort.PortType && PORT_TYPE_COLORS[pPort.PortType])
		{
			return PORT_TYPE_COLORS[pPort.PortType];
		}
		if (pPort && pPort.Direction === 'input')  return PORT_TYPE_COLORS['event-in'];
		if (pPort && pPort.Direction === 'output') return PORT_TYPE_COLORS['event-out'];
		return PORT_TYPE_DEFAULT_COLOR;
	}

	/**
	 * Build a single hint-path SVG element: a soft S-curve from the
	 * card-defined port position to the resolved attachment position.
	 * Tagged with port + node + connection hashes so hover handlers can
	 * find the right hint by attribute.
	 *
	 * @param {{x: number, y: number}} pStart - badge / chip position
	 * @param {{x: number, y: number}} pEnd - actual dot position
	 * @returns {SVGPathElement}
	 */
	_buildPortHintPath(pStart, pEnd, pNodeHash, pPortHash, pConnectionHash, pEndLabel, pStrokeColor)
	{
		let tmpEl = this._FlowView._SVGHelperProvider.createSVGElement('path');

		// Soft S-curve: control points pulled along the perpendicular bisector
		let tmpDX = pEnd.x - pStart.x;
		let tmpDY = pEnd.y - pStart.y;
		let tmpDist = Math.sqrt(tmpDX * tmpDX + tmpDY * tmpDY);
		let tmpBend = Math.min(60, tmpDist * 0.35);
		// Perpendicular unit vector
		let tmpPX = (tmpDist > 0) ? -tmpDY / tmpDist : 0;
		let tmpPY = (tmpDist > 0) ?  tmpDX / tmpDist : 0;
		let tmpCp1X = pStart.x + tmpDX * 0.35 + tmpPX * tmpBend * 0.3;
		let tmpCp1Y = pStart.y + tmpDY * 0.35 + tmpPY * tmpBend * 0.3;
		let tmpCp2X = pStart.x + tmpDX * 0.65 + tmpPX * tmpBend * 0.3;
		let tmpCp2Y = pStart.y + tmpDY * 0.65 + tmpPY * tmpBend * 0.3;
		let tmpD = `M ${pStart.x} ${pStart.y} C ${tmpCp1X} ${tmpCp1Y} ${tmpCp2X} ${tmpCp2Y} ${pEnd.x} ${pEnd.y}`;

		tmpEl.setAttribute('class', 'pict-flow-port-hint');
		tmpEl.setAttribute('d', tmpD);
		tmpEl.setAttribute('data-node-hash', pNodeHash);
		tmpEl.setAttribute('data-port-hash', pPortHash);
		tmpEl.setAttribute('data-connection-hash', pConnectionHash);
		tmpEl.setAttribute('data-connection-end', pEndLabel);
		// Affinity color from port type (matches the badge border color).
		// Inline so PortRenderer's color map stays the single source of
		// truth without dragging CSS variables around per port type.
		if (pStrokeColor)
		{
			tmpEl.setAttribute('stroke', pStrokeColor);
		}
		return tmpEl;
	}

	/**
	 * Compute the departure and approach points plus control points
	 * for a direction-aware bezier between two ports.
	 *
	 * This extracts the intermediate geometry from _generateDirectionalPath
	 * so it can be reused by _getAutoMidpoint and _generateBezierPathWithHandle.
	 *
	 * @param {{x: number, y: number, side: string}} pStart
	 * @param {{x: number, y: number, side: string}} pEnd
	 * @returns {{departX, departY, approachX, approachY, cp1X, cp1Y, cp2X, cp2Y, startDir, endDir}}
	 */
	_computeDirectionalGeometry(pStart, pEnd)
	{
		return this._FlowView._PathGenerator.computeDirectionalGeometry(pStart, pEnd);
	}

	/**
	 * Generate a direction-aware path between two ports.
	 *
	 * The path is composed of three segments:
	 *   1. A short straight "departure" segment leaving the source port
	 *      in its outward direction.
	 *   2. A cubic bezier curve connecting the departure point to an
	 *      "approach" point near the target port.
	 *   3. A short straight "approach" segment arriving at the target
	 *      port aligned with its inward direction.
	 *
	 * @param {{x: number, y: number, side: string}} pStart - Start port position + side
	 * @param {{x: number, y: number, side: string}} pEnd   - End port position + side
	 * @returns {string} SVG path d attribute
	 */
	_generateDirectionalPath(pStart, pEnd)
	{
		let tmpGeo = this._computeDirectionalGeometry(pStart, pEnd);

		return this._FlowView._PathGenerator.buildBezierPathString(
			{ x: pStart.x, y: pStart.y },
			{ x: tmpGeo.departX, y: tmpGeo.departY },
			{ x: tmpGeo.cp1X, y: tmpGeo.cp1Y },
			{ x: tmpGeo.cp2X, y: tmpGeo.cp2Y },
			{ x: tmpGeo.approachX, y: tmpGeo.approachY },
			{ x: pEnd.x, y: pEnd.y }
		);
	}

	/**
	 * Dispatch to an edge theme to generate the path string. Falls back
	 * to the renderer's built-in bezier / orthogonal helpers when no
	 * edge-theme registry is available (older host integrations) or
	 * the resolved theme errors out.
	 *
	 * @param {Object} pConnection
	 * @param {{x: number, y: number, side?: string}} pSourcePos
	 * @param {{x: number, y: number, side?: string}} pTargetPos
	 * @param {Object} pData - connection data (LineMode, custom handles, etc.)
	 * @returns {string} SVG path 'd' attribute
	 */
	_generatePathViaEdgeTheme(pConnection, pSourcePos, pTargetPos, pData)
	{
		let tmpLayoutService = this._FlowView ? this._FlowView._LayoutService : null;
		let tmpTheme = (tmpLayoutService && typeof tmpLayoutService.resolveActiveEdgeTheme === 'function')
			? tmpLayoutService.resolveActiveEdgeTheme(pConnection)
			: null;

		if (!tmpTheme || typeof tmpTheme.GeneratePath !== 'function')
		{
			return this._builtInPathFallback(pSourcePos, pTargetPos, pData);
		}

		let tmpContext =
		{
			Source: pSourcePos,
			Target: pTargetPos,
			Connection: pConnection,
			AllNodes: this._FlowView._FlowData ? this._FlowView._FlowData.Nodes : [],
			AllConnections: this._FlowView._FlowData ? this._FlowView._FlowData.Connections : [],
			FlowView: this._FlowView,
			Helpers: this._buildEdgeThemeHelpers(),
			Parameters: tmpLayoutService.getMergedEdgeThemeParameters(
				tmpTheme.Name,
				(this._FlowView._FlowData && this._FlowView._FlowData.EdgeThemeParameters) || {}
			)
		};

		try
		{
			let tmpPath = tmpTheme.GeneratePath(tmpContext);
			if (typeof tmpPath !== 'string' || tmpPath === '')
			{
				return this._builtInPathFallback(pSourcePos, pTargetPos, pData);
			}
			return tmpPath;
		}
		catch (pError)
		{
			this._FlowView.log.warn(`PictServiceFlowConnectionRenderer edge theme '${tmpTheme.Name}' threw: ${pError.message}`);
			return this._builtInPathFallback(pSourcePos, pTargetPos, pData);
		}
	}

	/**
	 * Resolve per-end attachment overrides via the active edge theme's
	 * optional `ResolveAttachment(context)` hook. The theme can return
	 * `{ x, y, side }` for either end (or null to fall through). Used by
	 * themes like Perimeter that route through the node's bounding box
	 * rather than the static port position.
	 *
	 * @param {Object} pConnection
	 * @param {{x: number, y: number, side?: string}} pSourcePos - default port position
	 * @param {{x: number, y: number, side?: string}} pTargetPos - default port position
	 * @returns {{source: ?Object, target: ?Object}}
	 */
	_resolveAttachmentsViaEdgeTheme(pConnection, pSourcePos, pTargetPos)
	{
		let tmpEmpty = { source: null, target: null };
		let tmpLayoutService = this._FlowView ? this._FlowView._LayoutService : null;
		let tmpTheme = (tmpLayoutService && typeof tmpLayoutService.resolveActiveEdgeTheme === 'function')
			? tmpLayoutService.resolveActiveEdgeTheme(pConnection)
			: null;
		if (!tmpTheme || typeof tmpTheme.ResolveAttachment !== 'function') return tmpEmpty;

		let tmpSourceNode = this._FlowView.getNode(pConnection.SourceNodeHash);
		let tmpTargetNode = this._FlowView.getNode(pConnection.TargetNodeHash);
		let tmpSourcePort = this._findPort(tmpSourceNode, pConnection.SourcePortHash);
		let tmpTargetPort = this._findPort(tmpTargetNode, pConnection.TargetPortHash);

		let tmpParams = tmpLayoutService.getMergedEdgeThemeParameters(
			tmpTheme.Name,
			(this._FlowView._FlowData && this._FlowView._FlowData.EdgeThemeParameters) || {}
		);

		let tmpSrc = null, tmpTgt = null;
		try
		{
			tmpSrc = tmpTheme.ResolveAttachment({
				Node: tmpSourceNode, Port: tmpSourcePort,
				DefaultPosition: pSourcePos,
				Connection: pConnection, IsSource: true,
				OtherNode: tmpTargetNode, OtherPort: tmpTargetPort,
				OtherDefaultPosition: pTargetPos,
				AllNodes: this._FlowView._FlowData ? this._FlowView._FlowData.Nodes : [],
				FlowView: this._FlowView,
				Parameters: tmpParams
			});
			tmpTgt = tmpTheme.ResolveAttachment({
				Node: tmpTargetNode, Port: tmpTargetPort,
				DefaultPosition: pTargetPos,
				Connection: pConnection, IsSource: false,
				OtherNode: tmpSourceNode, OtherPort: tmpSourcePort,
				OtherDefaultPosition: pSourcePos,
				AllNodes: this._FlowView._FlowData ? this._FlowView._FlowData.Nodes : [],
				FlowView: this._FlowView,
				Parameters: tmpParams
			});
		}
		catch (pError)
		{
			this._FlowView.log.warn(`PictServiceFlowConnectionRenderer edge theme '${tmpTheme.Name}' ResolveAttachment threw: ${pError.message}`);
			return tmpEmpty;
		}

		return { source: tmpSrc || null, target: tmpTgt || null };
	}

	/**
	 * Find a port by hash on a node. Returns null if missing.
	 * @param {Object} pNode
	 * @param {string} pPortHash
	 * @returns {Object|null}
	 */
	_findPort(pNode, pPortHash)
	{
		if (!pNode || !Array.isArray(pNode.Ports)) return null;
		for (let i = 0; i < pNode.Ports.length; i++)
		{
			if (pNode.Ports[i].Hash === pPortHash) return pNode.Ports[i];
		}
		return null;
	}

	/**
	 * Path-generation helpers exposed to edge themes via the GeneratePath
	 * context object. Themes can compose these to derive their own routing.
	 *
	 * @returns {Object}
	 */
	_buildEdgeThemeHelpers()
	{
		let tmpRenderer = this;
		return {
			generateBezier: function (pStart, pEnd)
			{
				return tmpRenderer._generateDirectionalPath(pStart, pEnd);
			},
			generateMultiBezier: function (pStart, pEnd, pHandles)
			{
				return tmpRenderer._generateMultiHandleBezierPath(pStart, pEnd, pHandles);
			},
			generateOrthogonal: function (pStart, pEnd, pCorners, pMidOffset)
			{
				return tmpRenderer._generateOrthogonalPath(pStart, pEnd, pCorners || null, pMidOffset || 0);
			},
			getBezierHandles: function (pData)
			{
				return tmpRenderer._getBezierHandles(pData);
			}
		};
	}

	/**
	 * Built-in fallback when no edge theme is registered. Mirrors the
	 * pre-edge-theme dispatch (LineMode → bezier or orthogonal).
	 *
	 * @param {{x: number, y: number, side?: string}} pSourcePos
	 * @param {{x: number, y: number, side?: string}} pTargetPos
	 * @param {Object} pData
	 * @returns {string}
	 */
	_builtInPathFallback(pSourcePos, pTargetPos, pData)
	{
		let tmpData = pData || {};
		let tmpLineMode = tmpData.LineMode || 'bezier';

		if (tmpLineMode === 'orthogonal')
		{
			let tmpCorners = null;
			if (tmpData.HandleCustomized && tmpData.OrthoCorner1X != null)
			{
				tmpCorners =
				{
					corner1: { x: tmpData.OrthoCorner1X, y: tmpData.OrthoCorner1Y },
					corner2: { x: tmpData.OrthoCorner2X, y: tmpData.OrthoCorner2Y }
				};
			}
			return this._generateOrthogonalPath(pSourcePos, pTargetPos, tmpCorners, tmpData.OrthoMidOffset || 0);
		}

		let tmpHandles = this._getBezierHandles(tmpData);
		if (tmpHandles.length > 0)
		{
			return this._generateMultiHandleBezierPath(pSourcePos, pTargetPos, tmpHandles);
		}
		return this._generateDirectionalPath(pSourcePos, pTargetPos);
	}

	/**
	 * Get the bezier handles array from connection data, with backward
	 * compatibility for the legacy BezierHandleX/Y single-handle format.
	 *
	 * @param {Object} pData - Connection.Data
	 * @returns {Array<{x: number, y: number}>} Ordered handle waypoints (may be empty)
	 */
	_getBezierHandles(pData)
	{
		if (!pData || !pData.HandleCustomized)
		{
			return [];
		}

		// New multi-handle format
		if (Array.isArray(pData.BezierHandles) && pData.BezierHandles.length > 0)
		{
			return pData.BezierHandles;
		}

		// Legacy single-handle format
		if (pData.BezierHandleX != null && pData.BezierHandleY != null)
		{
			return [{ x: pData.BezierHandleX, y: pData.BezierHandleY }];
		}

		return [];
	}

	/**
	 * Generate a multi-handle bezier path between two ports.
	 * Delegates to PathGenerator.buildMultiBezierPathString for the
	 * actual SVG path assembly with Catmull-Rom tangent continuity.
	 *
	 * @param {{x: number, y: number, side: string}} pStart
	 * @param {{x: number, y: number, side: string}} pEnd
	 * @param {Array<{x: number, y: number}>} pHandles - Ordered waypoints
	 * @returns {string} SVG path d attribute
	 */
	_generateMultiHandleBezierPath(pStart, pEnd, pHandles)
	{
		let tmpGeo = this._computeDirectionalGeometry(pStart, pEnd);

		return this._FlowView._PathGenerator.buildMultiBezierPathString(
			{ x: pStart.x, y: pStart.y },
			{ x: tmpGeo.departX, y: tmpGeo.departY },
			pHandles,
			{ x: tmpGeo.approachX, y: tmpGeo.approachY },
			{ x: pEnd.x, y: pEnd.y },
			tmpGeo.startDir,
			tmpGeo.endDir
		);
	}

	/**
	 * Find which segment of the multi-handle bezier the given click point
	 * is closest to, returning the index at which a new handle should be
	 * inserted into the BezierHandles array.
	 *
	 * Segments are: depart→handle[0], handle[0]→handle[1], ..., handle[N-1]→approach.
	 * Returns 0 for before handle[0], 1 for between handle[0] and handle[1], etc.
	 *
	 * @param {Array<{x: number, y: number}>} pHandles - Current handles
	 * @param {{x: number, y: number}} pClickPoint - Where the user right-clicked
	 * @param {{x: number, y: number, side: string}} pStart - Source port position
	 * @param {{x: number, y: number, side: string}} pEnd - Target port position
	 * @returns {number} Insertion index
	 */
	computeInsertionIndex(pHandles, pClickPoint, pStart, pEnd)
	{
		let tmpGeo = this._computeDirectionalGeometry(pStart, pEnd);

		// Build the waypoint chain: depart, handle[0..N-1], approach
		let tmpWaypoints = [{ x: tmpGeo.departX, y: tmpGeo.departY }];
		for (let i = 0; i < pHandles.length; i++)
		{
			tmpWaypoints.push(pHandles[i]);
		}
		tmpWaypoints.push({ x: tmpGeo.approachX, y: tmpGeo.approachY });

		let tmpBestDist = Infinity;
		let tmpBestIndex = 0;

		for (let i = 0; i < tmpWaypoints.length - 1; i++)
		{
			let tmpDist = this._distanceToSegment(
				pClickPoint.x, pClickPoint.y,
				tmpWaypoints[i].x, tmpWaypoints[i].y,
				tmpWaypoints[i + 1].x, tmpWaypoints[i + 1].y
			);

			if (tmpDist < tmpBestDist)
			{
				tmpBestDist = tmpDist;
				tmpBestIndex = i;
			}
		}

		return tmpBestIndex;
	}

	/**
	 * Distance from point (px,py) to line segment (ax,ay)-(bx,by).
	 */
	_distanceToSegment(pPX, pPY, pAX, pAY, pBX, pBY)
	{
		return this._FlowView._PathGenerator.distanceToSegment(pPX, pPY, pAX, pAY, pBX, pBY);
	}

	/**
	 * Get the auto-calculated midpoint of the default bezier curve between two ports.
	 * Evaluates the cubic bezier at t=0.5.
	 *
	 * @param {{x: number, y: number, side: string}} pStart
	 * @param {{x: number, y: number, side: string}} pEnd
	 * @returns {{x: number, y: number}}
	 */
	getAutoMidpoint(pStart, pEnd)
	{
		return this._FlowView._PathGenerator.getAutoMidpoint(pStart, pEnd);
	}

	/**
	 * Generate an orthogonal (90-degree angles only) path between two ports.
	 *
	 * Path format: M start L depart L corner1 L corner2 L approach L end
	 *
	 * @param {{x: number, y: number, side: string}} pStart
	 * @param {{x: number, y: number, side: string}} pEnd
	 * @param {Object|null} pCorners - { corner1: {x,y}, corner2: {x,y} } or null for auto
	 * @param {number} pMidOffset - Offset for the auto-calculated corridor position
	 * @returns {string} SVG path d attribute
	 */
	_generateOrthogonalPath(pStart, pEnd, pCorners, pMidOffset)
	{
		let tmpDA = this._FlowView._PathGenerator.computeDepartApproach(pStart, pEnd, 20);

		let tmpCorner1, tmpCorner2;

		if (pCorners && pCorners.corner1 && pCorners.corner2)
		{
			tmpCorner1 = pCorners.corner1;
			tmpCorner2 = pCorners.corner2;
		}
		else
		{
			let tmpAutoCorners = this._FlowView._PathGenerator.computeAutoOrthogonalCorners(
				tmpDA.departX, tmpDA.departY,
				tmpDA.approachX, tmpDA.approachY,
				tmpDA.fromDir, tmpDA.toDir,
				pMidOffset || 0
			);
			tmpCorner1 = tmpAutoCorners.corner1;
			tmpCorner2 = tmpAutoCorners.corner2;
		}

		return this._FlowView._PathGenerator.buildOrthogonalPathString(
			{ x: pStart.x, y: pStart.y },
			{ x: tmpDA.departX, y: tmpDA.departY },
			tmpCorner1,
			tmpCorner2,
			{ x: tmpDA.approachX, y: tmpDA.approachY },
			{ x: pEnd.x, y: pEnd.y }
		);
	}

	/**
	 * Get the full orthogonal geometry for a connection (for handle positioning).
	 *
	 * @param {{x: number, y: number, side: string}} pStart
	 * @param {{x: number, y: number, side: string}} pEnd
	 * @param {Object} pData - Connection.Data
	 * @returns {{corner1: {x,y}, corner2: {x,y}, midpoint: {x,y}}}
	 */
	getOrthogonalGeometry(pStart, pEnd, pData)
	{
		let tmpDA = this._FlowView._PathGenerator.computeDepartApproach(pStart, pEnd, 20);

		if (pData && pData.HandleCustomized && pData.OrthoCorner1X != null)
		{
			let tmpCorner1 = { x: pData.OrthoCorner1X, y: pData.OrthoCorner1Y };
			let tmpCorner2 = { x: pData.OrthoCorner2X, y: pData.OrthoCorner2Y };
			let tmpMidpoint =
			{
				x: (tmpCorner1.x + tmpCorner2.x) / 2,
				y: (tmpCorner1.y + tmpCorner2.y) / 2
			};
			return { corner1: tmpCorner1, corner2: tmpCorner2, midpoint: tmpMidpoint };
		}

		return this._FlowView._PathGenerator.computeAutoOrthogonalCorners(
			tmpDA.departX, tmpDA.departY,
			tmpDA.approachX, tmpDA.approachY,
			tmpDA.fromDir, tmpDA.toDir,
			(pData && pData.OrthoMidOffset) || 0
		);
	}

	/**
	 * Render drag handles for the selected connection.
	 *
	 * @param {Object} pConnection
	 * @param {SVGGElement} pLayer
	 * @param {{x, y, side}} pStart - Source port position
	 * @param {{x, y, side}} pEnd   - Target port position
	 */
	_renderHandles(pConnection, pLayer, pStart, pEnd)
	{
		let tmpData = pConnection.Data || {};
		let tmpLineMode = tmpData.LineMode || 'bezier';

		if (tmpLineMode === 'orthogonal')
		{
			let tmpGeometry = this.getOrthogonalGeometry(pStart, pEnd, tmpData);

			// Corner 1 handle
			this._createHandle(pLayer, pConnection.Hash, 'ortho-corner1',
				tmpGeometry.corner1.x, tmpGeometry.corner1.y, 'pict-flow-connection-handle');

			// Midpoint handle (between corners)
			this._createHandle(pLayer, pConnection.Hash, 'ortho-midpoint',
				tmpGeometry.midpoint.x, tmpGeometry.midpoint.y, 'pict-flow-connection-handle-midpoint');

			// Corner 2 handle
			this._createHandle(pLayer, pConnection.Hash, 'ortho-corner2',
				tmpGeometry.corner2.x, tmpGeometry.corner2.y, 'pict-flow-connection-handle');
		}
		else
		{
			// Bezier handles — show one handle per waypoint, or a
			// single auto-midpoint when no custom handles exist.
			let tmpHandles = this._getBezierHandles(tmpData);

			if (tmpHandles.length > 0)
			{
				for (let i = 0; i < tmpHandles.length; i++)
				{
					this._createHandle(pLayer, pConnection.Hash,
						'bezier-handle-' + i,
						tmpHandles[i].x, tmpHandles[i].y,
						'pict-flow-connection-handle');
				}
			}
			else
			{
				let tmpMidpoint = this.getAutoMidpoint(pStart, pEnd);
				this._createHandle(pLayer, pConnection.Hash, 'bezier-midpoint',
					tmpMidpoint.x, tmpMidpoint.y, 'pict-flow-connection-handle');
			}
		}
	}

	/**
	 * Create a single SVG circle handle element.
	 *
	 * @param {SVGGElement} pLayer
	 * @param {string} pConnectionHash
	 * @param {string} pHandleType
	 * @param {number} pX
	 * @param {number} pY
	 * @param {string} pClassName
	 */
	_createHandle(pLayer, pConnectionHash, pHandleType, pX, pY, pClassName)
	{
		if (!this._FlowView._ConnectorShapesProvider) return;

		let tmpShapeKey = (pClassName === 'pict-flow-connection-handle-midpoint')
			? 'connection-handle-midpoint' : 'connection-handle';

		this._FlowView._ConnectorShapesProvider.createFullHandle(
			pLayer, pConnectionHash, pHandleType, pX, pY,
			tmpShapeKey, 'connection-handle', 'data-connection-hash');
	}

	/**
	 * Legacy bezier path for drag connections where we don't have side info.
	 * @param {{x: number, y: number}} pStart
	 * @param {{x: number, y: number}} pEnd
	 * @returns {string}
	 */
	_generateBezierPath(pStart, pEnd)
	{
		// During drag operations we may not have side info; default to right->left
		let tmpStart = { x: pStart.x, y: pStart.y, side: pStart.side || 'right' };
		let tmpEnd   = { x: pEnd.x,   y: pEnd.y,   side: pEnd.side   || 'left' };
		return this._generateDirectionalPath(tmpStart, tmpEnd);
	}

	/**
	 * Render a temporary drag connection line (used during connection creation)
	 * @param {number} pStartX
	 * @param {number} pStartY
	 * @param {number} pEndX
	 * @param {number} pEndY
	 * @param {SVGGElement} pLayer - The layer to render into
	 * @param {string} [pStartSide] - The side the source port is on
	 * @returns {SVGPathElement} The created path element
	 */
	renderDragConnection(pStartX, pStartY, pEndX, pEndY, pLayer, pStartSide)
	{
		let tmpPath = this._generateDirectionalPath(
			{ x: pStartX, y: pStartY, side: pStartSide || 'right' },
			{ x: pEndX,   y: pEndY,   side: 'left' }
		);

		let tmpShapeProvider = this._FlowView._ConnectorShapesProvider;
		let tmpPathElement;

		if (tmpShapeProvider)
		{
			tmpPathElement = tmpShapeProvider.createDragConnectionElement(tmpPath);
		}
		else
		{
			tmpPathElement = this._FlowView._SVGHelperProvider.createSVGElement('path');
			tmpPathElement.setAttribute('class', 'pict-flow-drag-connection');
			tmpPathElement.setAttribute('d', tmpPath);
		}

		pLayer.appendChild(tmpPathElement);

		return tmpPathElement;
	}

	/**
	 * Update a drag connection path
	 * @param {SVGPathElement} pPathElement
	 * @param {number} pStartX
	 * @param {number} pStartY
	 * @param {number} pEndX
	 * @param {number} pEndY
	 * @param {string} [pStartSide] - The side the source port is on
	 */
	updateDragConnection(pPathElement, pStartX, pStartY, pEndX, pEndY, pStartSide)
	{
		if (!pPathElement) return;

		let tmpPath = this._generateDirectionalPath(
			{ x: pStartX, y: pStartY, side: pStartSide || 'right' },
			{ x: pEndX,   y: pEndY,   side: 'left' }
		);

		pPathElement.setAttribute('d', tmpPath);
	}
}

module.exports = PictServiceFlowConnectionRenderer;
