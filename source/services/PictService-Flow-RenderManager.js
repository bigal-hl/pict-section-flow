const libFableServiceProviderBase = require('fable-serviceproviderbase');

/**
 * PictService-Flow-RenderManager
 *
 * Orchestrates rendering of the flow diagram: nodes, connections,
 * tethers, panels, SVG marker definitions, and node position updates.
 *
 * Extracted from PictView-Flow.js to isolate rendering orchestration
 * from data management and interaction handling.
 */
class PictServiceFlowRenderManager extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictServiceFlowRenderManager';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;
	}

	/**
	 * Render the complete flow diagram
	 */
	renderFlow()
	{
		if (!this._FlowView) return;
		if (!this._FlowView._NodesLayer || !this._FlowView._ConnectionsLayer) return;

		// Clear existing SVG content
		while (this._FlowView._NodesLayer.firstChild)
		{
			this._FlowView._NodesLayer.removeChild(this._FlowView._NodesLayer.firstChild);
		}
		while (this._FlowView._ConnectionsLayer.firstChild)
		{
			this._FlowView._ConnectionsLayer.removeChild(this._FlowView._ConnectionsLayer.firstChild);
		}
		if (this._FlowView._EndpointsLayer)
		{
			while (this._FlowView._EndpointsLayer.firstChild) this._FlowView._EndpointsLayer.removeChild(this._FlowView._EndpointsLayer.firstChild);
		}
		if (this._FlowView._PortHintsLayer)
		{
			while (this._FlowView._PortHintsLayer.firstChild) this._FlowView._PortHintsLayer.removeChild(this._FlowView._PortHintsLayer.firstChild);
		}

		// Render connections first (behind nodes)
		for (let i = 0; i < this._FlowView._FlowData.Connections.length; i++)
		{
			let tmpConnection = this._FlowView._FlowData.Connections[i];
			let tmpIsSelected = (this._FlowView._FlowData.ViewState.SelectedConnectionHash === tmpConnection.Hash);

			this._FlowView._ConnectionRenderer.renderConnection(
				tmpConnection,
				this._FlowView._ConnectionsLayer,
				tmpIsSelected
			);
		}

		// Render nodes
		for (let i = 0; i < this._FlowView._FlowData.Nodes.length; i++)
		{
			let tmpNode = this._FlowView._FlowData.Nodes[i];
			let tmpSelectedSet = this._FlowView._FlowData.ViewState.SelectedNodeHashes;
			let tmpIsSelected = (this._FlowView._FlowData.ViewState.SelectedNodeHash === tmpNode.Hash)
				|| (Array.isArray(tmpSelectedSet) && tmpSelectedSet.indexOf(tmpNode.Hash) >= 0);
			let tmpNodeTypeConfig = this._FlowView._NodeTypeProvider.getNodeType(tmpNode.Type);

			// Enrich saved port data with metadata from the node type's DefaultPorts.
			// Saved flow data may not include PortType or may have stale Side values,
			// so we match each port to its DefaultPort counterpart by Label and Direction,
			// then copy over PortType and Side from the authoritative node type definition.
			if (tmpNodeTypeConfig && tmpNodeTypeConfig.DefaultPorts && tmpNode.Ports)
			{
				for (let p = 0; p < tmpNode.Ports.length; p++)
				{
					let tmpPort = tmpNode.Ports[p];
					for (let d = 0; d < tmpNodeTypeConfig.DefaultPorts.length; d++)
					{
						let tmpDefault = tmpNodeTypeConfig.DefaultPorts[d];
						if (tmpDefault.Label === tmpPort.Label && tmpDefault.Direction === tmpPort.Direction)
						{
							if (tmpDefault.PortType)
							{
								tmpPort.PortType = tmpDefault.PortType;
							}
							if (tmpDefault.Side)
							{
								tmpPort.Side = tmpDefault.Side;
							}
							break;
						}
					}
				}
			}

			// Dispatch through the renderable-renderer registry. The default
			// 'card' renderer is the node view, so existing diagrams (and
			// ultravisor) render identically; a node type can name a different
			// renderer via its RenderableType field. Fall back to the node view
			// directly when no registry is present (e.g. a minimal test harness).
			let tmpRenderer = (typeof this._FlowView.resolveRenderableRenderer === 'function')
				? this._FlowView.resolveRenderableRenderer(tmpNode, tmpNodeTypeConfig)
				: this._FlowView._NodeView;
			tmpRenderer.renderNode(tmpNode, this._FlowView._NodesLayer, tmpIsSelected, tmpNodeTypeConfig);
		}

		// Render properties panels and tethers
		if (this._FlowView._PropertiesPanelView && this._FlowView._PanelsLayer && this._FlowView._TethersLayer)
		{
			this._FlowView._PropertiesPanelView.renderPanels(
				this._FlowView._FlowData.OpenPanels,
				this._FlowView._PanelsLayer,
				this._FlowView._TethersLayer,
				this._FlowView._FlowData.ViewState.SelectedTetherHash
			);
		}

		// Update viewport transform
		this._FlowView.updateViewportTransform();
	}

	/**
	 * Re-render a single connection (remove and re-add) for smooth drag performance.
	 * @param {string} pConnectionHash
	 */
	renderSingleConnection(pConnectionHash)
	{
		if (!this._FlowView || !this._FlowView._ConnectionsLayer) return;

		// Remove existing elements for this connection across all layers
		// where it might live (path / hit-area in connections, dots in
		// endpoints, hint paths in port-hints).
		this._removeConnectionElements(pConnectionHash);

		let tmpConnection = this._FlowView.getConnection(pConnectionHash);
		if (!tmpConnection) return;

		let tmpIsSelected = (this._FlowView._FlowData.ViewState.SelectedConnectionHash === pConnectionHash);
		this._FlowView._ConnectionRenderer.renderConnection(tmpConnection, this._FlowView._ConnectionsLayer, tmpIsSelected);
	}

	/**
	 * Re-render a single tether (remove and re-add) for smooth drag performance.
	 * @param {string} pPanelHash
	 */
	renderSingleTether(pPanelHash)
	{
		if (!this._FlowView || !this._FlowView._TethersLayer || !this._FlowView._TetherService) return;

		// Remove existing tether elements for this panel
		let tmpExisting = this._FlowView._TethersLayer.querySelectorAll(`[data-panel-hash="${pPanelHash}"]`);
		for (let i = 0; i < tmpExisting.length; i++)
		{
			tmpExisting[i].remove();
		}

		let tmpPanel = this._FlowView._FlowData.OpenPanels.find((pPanel) => pPanel.Hash === pPanelHash);
		if (!tmpPanel) return;

		let tmpNodeData = this._FlowView.getNode(tmpPanel.NodeHash);
		if (!tmpNodeData) return;

		let tmpIsSelected = (this._FlowView._FlowData.ViewState.SelectedTetherHash === pPanelHash);
		this._FlowView._TetherService.renderTether(tmpPanel, tmpNodeData, this._FlowView._TethersLayer, tmpIsSelected, this._FlowView.options.ViewIdentifier);
	}

	/**
	 * Update a single node's position in the SVG without full re-render (for drag performance)
	 * @param {string} pNodeHash
	 * @param {number} pX
	 * @param {number} pY
	 */
	updateNodePosition(pNodeHash, pX, pY)
	{
		if (!this._FlowView) return;

		let tmpNode = this._FlowView.getNode(pNodeHash);
		if (!tmpNode) return;

		if (this._FlowView.options.EnableGridSnap)
		{
			pX = this._FlowView._LayoutService.snapToGrid(pX, this._FlowView.options.GridSnapSize);
			pY = this._FlowView._LayoutService.snapToGrid(pY, this._FlowView.options.GridSnapSize);
		}

		tmpNode.X = pX;
		tmpNode.Y = pY;

		// Reset customized handle positions for connections/tethers involving this node
		this._FlowView._resetHandlesForNode(pNodeHash);

		// Update the node's SVG group transform for smooth dragging
		let tmpNodeGroup = this._FlowView._NodesLayer.querySelector(`[data-node-hash="${pNodeHash}"]`);
		if (tmpNodeGroup)
		{
			tmpNodeGroup.setAttribute('transform', `translate(${pX}, ${pY})`);
		}

		// Re-render connections that involve this node
		this.renderConnectionsForNode(pNodeHash);

		// Update tethers for any panels attached to this node
		this.renderTethersForNode(pNodeHash);
	}

	/**
	 * Re-render only connections that involve a specific node (for drag performance)
	 * @param {string} pNodeHash
	 */
	renderConnectionsForNode(pNodeHash)
	{
		if (!this._FlowView || !this._FlowView._ConnectionsLayer) return;

		let tmpAffectedConnections = this._FlowView._FlowData.Connections.filter((pConn) =>
		{
			return pConn.SourceNodeHash === pNodeHash || pConn.TargetNodeHash === pNodeHash;
		});

		for (let i = 0; i < tmpAffectedConnections.length; i++)
		{
			let tmpConn = tmpAffectedConnections[i];
			let tmpIsSelected = (this._FlowView._FlowData.ViewState.SelectedConnectionHash === tmpConn.Hash);

			// Remove existing connection SVG elements across all layers
			this._removeConnectionElements(tmpConn.Hash);

			// Re-render this connection
			this._FlowView._ConnectionRenderer.renderConnection(tmpConn, this._FlowView._ConnectionsLayer, tmpIsSelected);
		}
	}

	/**
	 * Remove every SVG element tagged with `data-connection-hash="<hash>"`
	 * from any of the layers a connection might write into (connections,
	 * endpoints, port-hints). Centralised so per-connection re-render
	 * paths stay in sync with whatever layers ConnectionRenderer touches.
	 *
	 * @param {string} pConnectionHash
	 */
	_removeConnectionElements(pConnectionHash)
	{
		let tmpLayers =
		[
			this._FlowView._ConnectionsLayer,
			this._FlowView._EndpointsLayer,
			this._FlowView._PortHintsLayer
		];
		for (let i = 0; i < tmpLayers.length; i++)
		{
			let tmpLayer = tmpLayers[i];
			if (!tmpLayer) continue;
			let tmpExisting = tmpLayer.querySelectorAll(`[data-connection-hash="${pConnectionHash}"]`);
			for (let j = 0; j < tmpExisting.length; j++)
			{
				tmpExisting[j].remove();
			}
		}
	}

	/**
	 * Re-render tethers for panels attached to a specific node (for drag performance).
	 * @param {string} pNodeHash
	 */
	renderTethersForNode(pNodeHash)
	{
		if (!this._FlowView || !this._FlowView._TethersLayer || !this._FlowView._TetherService) return;

		let tmpAffectedPanels = this._FlowView._FlowData.OpenPanels.filter((pPanel) => pPanel.NodeHash === pNodeHash);
		if (tmpAffectedPanels.length === 0) return;

		// Remove existing tethers for these panels and re-render via TetherService
		for (let i = 0; i < tmpAffectedPanels.length; i++)
		{
			let tmpExisting = this._FlowView._TethersLayer.querySelectorAll(`[data-panel-hash="${tmpAffectedPanels[i].Hash}"]`);
			for (let j = 0; j < tmpExisting.length; j++)
			{
				tmpExisting[j].remove();
			}

			let tmpNodeData = this._FlowView.getNode(tmpAffectedPanels[i].NodeHash);
			if (!tmpNodeData) continue;

			let tmpIsSelected = (this._FlowView._FlowData.ViewState.SelectedTetherHash === tmpAffectedPanels[i].Hash);
			this._FlowView._TetherService.renderTether(tmpAffectedPanels[i], tmpNodeData, this._FlowView._TethersLayer, tmpIsSelected, this._FlowView.options.ViewIdentifier);
		}
	}

	/**
	 * Re-inject SVG marker definitions (arrowheads).
	 * Called after a theme switch to update arrowhead colors.
	 */
	reinjectMarkerDefs()
	{
		if (!this._FlowView || !this._FlowView._ConnectorShapesProvider || !this._FlowView._SVGElement) return;

		let tmpViewIdentifier = this._FlowView.options.ViewIdentifier;
		let tmpDefs = this._FlowView._SVGElement.querySelector('defs');
		if (!tmpDefs) return;

		// Remove existing marker elements
		let tmpExistingMarkers = tmpDefs.querySelectorAll('marker');
		for (let i = 0; i < tmpExistingMarkers.length; i++)
		{
			tmpExistingMarkers[i].remove();
		}

		// Re-generate and inject
		let tmpMarkerMarkup = this._FlowView._ConnectorShapesProvider.generateMarkerDefs(tmpViewIdentifier);
		let tmpTempSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		tmpTempSVG.innerHTML = tmpMarkerMarkup;
		while (tmpTempSVG.firstChild)
		{
			tmpDefs.appendChild(tmpTempSVG.firstChild);
		}
	}
}

module.exports = PictServiceFlowRenderManager;
