const libFableServiceProviderBase = require('fable-serviceproviderbase');

/**
 * PictService-Flow-DataManager
 *
 * Manages flow data lifecycle: serialization, deserialization, and CRUD
 * operations for nodes and connections.
 *
 * Extracted from PictView-Flow.js to keep the view focused on
 * coordination and lifecycle rather than data manipulation.
 */
class PictServiceFlowDataManager extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictServiceFlowDataManager';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;
	}

	// ---- Marshaling ----

	/**
	 * Marshal data from AppData into the flow view
	 */
	marshalToView()
	{
		if (!this._FlowView) return;

		if (this._FlowView.options.FlowDataAddress)
		{
			const tmpAddressSpace =
			{
				Fable: this._FlowView.fable,
				Pict: this._FlowView.pict || this._FlowView.fable,
				AppData: this._FlowView.pict ? this._FlowView.pict.AppData : this._FlowView.fable.AppData,
				Bundle: this._FlowView.Bundle,
				Options: this._FlowView.options
			};
			let tmpData = this._FlowView.fable.manifest.getValueByHash(tmpAddressSpace, this._FlowView.options.FlowDataAddress);
			if (typeof tmpData === 'object' && tmpData !== null)
			{
				this.setFlowData(tmpData);
			}
		}
	}

	/**
	 * Marshal data from the flow view back to AppData
	 */
	marshalFromView()
	{
		if (!this._FlowView) return;

		if (this._FlowView.options.FlowDataAddress)
		{
			const tmpAddressSpace =
			{
				Fable: this._FlowView.fable,
				Pict: this._FlowView.pict || this._FlowView.fable,
				AppData: this._FlowView.pict ? this._FlowView.pict.AppData : this._FlowView.fable.AppData,
				Bundle: this._FlowView.Bundle,
				Options: this._FlowView.options
			};
			this._FlowView.fable.manifest.setValueByHash(tmpAddressSpace, this._FlowView.options.FlowDataAddress, JSON.parse(JSON.stringify(this._FlowView._FlowData)));
		}
	}

	// ---- Flow Data Get/Set ----

	/**
	 * Get the complete flow data object
	 * @returns {Object} The flow data including nodes, connections, and view state
	 */
	getFlowData()
	{
		if (!this._FlowView) return {};
		return JSON.parse(JSON.stringify(this._FlowView._FlowData));
	}

	/**
	 * Set the complete flow data object and re-render
	 * @param {Object} pFlowData - The flow data to set
	 */
	setFlowData(pFlowData)
	{
		if (!this._FlowView) return;

		if (typeof pFlowData !== 'object' || pFlowData === null)
		{
			this._FlowView.log.warn('PictSectionFlow setFlowData received invalid data');
			return;
		}

		let tmpDefaultAlgorithm = (this._FlowView.options && this._FlowView.options.DefaultLayoutAlgorithm) || 'Custom';
		let tmpDefaultParameters = (this._FlowView.options && this._FlowView.options.DefaultLayoutParameters) || {};
		let tmpDefaultAutoApply = !!(this._FlowView.options && this._FlowView.options.DefaultLayoutAutoApply);
		let tmpDefaultEdgeTheme = (this._FlowView.options && this._FlowView.options.DefaultEdgeTheme) || null;
		let tmpDefaultEdgeThemeParameters = (this._FlowView.options && this._FlowView.options.DefaultEdgeThemeParameters) || {};

		this._FlowView._FlowData = {
			Nodes: Array.isArray(pFlowData.Nodes) ? pFlowData.Nodes : [],
			Connections: Array.isArray(pFlowData.Connections) ? pFlowData.Connections : [],
			OpenPanels: Array.isArray(pFlowData.OpenPanels) ? pFlowData.OpenPanels : [],
			SavedLayouts: Array.isArray(pFlowData.SavedLayouts) ? pFlowData.SavedLayouts : [],
			ViewState: Object.assign(
				{ PanX: 0, PanY: 0, Zoom: 1, SelectedNodeHash: null, SelectedNodeHashes: [], SelectedConnectionHash: null, SelectedTetherHash: null },
				pFlowData.ViewState || {}
			),
			LayoutAlgorithm: (typeof pFlowData.LayoutAlgorithm === 'string' && pFlowData.LayoutAlgorithm !== '') ? pFlowData.LayoutAlgorithm : tmpDefaultAlgorithm,
			LayoutParameters: (pFlowData.LayoutParameters && typeof pFlowData.LayoutParameters === 'object') ? JSON.parse(JSON.stringify(pFlowData.LayoutParameters)) : JSON.parse(JSON.stringify(tmpDefaultParameters)),
			LayoutAutoApply: (typeof pFlowData.LayoutAutoApply === 'boolean') ? pFlowData.LayoutAutoApply : tmpDefaultAutoApply,
			EdgeTheme: (typeof pFlowData.EdgeTheme === 'string' && pFlowData.EdgeTheme !== '') ? pFlowData.EdgeTheme : tmpDefaultEdgeTheme,
			EdgeThemeParameters: (pFlowData.EdgeThemeParameters && typeof pFlowData.EdgeThemeParameters === 'object') ? JSON.parse(JSON.stringify(pFlowData.EdgeThemeParameters)) : JSON.parse(JSON.stringify(tmpDefaultEdgeThemeParameters))
		};

		// Merge any browser-persisted layouts into the newly loaded data
		if (this._FlowView._LayoutProvider)
		{
			this._FlowView._LayoutProvider.loadPersistedLayouts();
		}

		if (this._FlowView.initialRenderComplete)
		{
			this._FlowView.renderFlow();
		}
	}

	// ---- Node CRUD ----

	/**
	 * Add a new node to the flow
	 * @param {string} pType - The node type hash
	 * @param {number} pX - X position
	 * @param {number} pY - Y position
	 * @param {string} [pTitle] - Optional title
	 * @param {Object} [pData] - Optional additional data
	 * @returns {Object} The created node
	 */
	addNode(pType, pX, pY, pTitle, pData)
	{
		if (!this._FlowView) return null;

		let tmpType = pType || this._FlowView.options.DefaultNodeType;
		let tmpNodeTypeConfig = this._FlowView._NodeTypeProvider.getNodeType(tmpType);

		let tmpNodeHash = `node-${this._FlowView.fable.getUUID()}`;
		let tmpNode =
		{
			Hash: tmpNodeHash,
			Type: tmpType,
			X: pX || 100,
			Y: pY || 100,
			Width: (tmpNodeTypeConfig && tmpNodeTypeConfig.DefaultWidth) || this._FlowView.options.DefaultNodeWidth,
			Height: (tmpNodeTypeConfig && tmpNodeTypeConfig.DefaultHeight) || this._FlowView.options.DefaultNodeHeight,
			Title: pTitle || (tmpNodeTypeConfig && tmpNodeTypeConfig.Label) || 'New Node',
			Ports: (tmpNodeTypeConfig && tmpNodeTypeConfig.DefaultPorts)
				? JSON.parse(JSON.stringify(tmpNodeTypeConfig.DefaultPorts))
				: [
					{ Hash: `port-in-${this._FlowView.fable.getUUID()}`, Direction: 'input', Side: 'left', Label: 'In' },
					{ Hash: `port-out-${this._FlowView.fable.getUUID()}`, Direction: 'output', Side: 'right', Label: 'Out' }
				],
			Data: pData || {}
		};

		// Ensure each port has a unique hash
		for (let i = 0; i < tmpNode.Ports.length; i++)
		{
			if (!tmpNode.Ports[i].Hash)
			{
				tmpNode.Ports[i].Hash = `port-${tmpNode.Ports[i].Direction}-${this._FlowView.fable.getUUID()}`;
			}
		}

		this._FlowView._FlowData.Nodes.push(tmpNode);
		this._FlowView.renderFlow();
		this.marshalFromView();

		if (this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onNodeAdded', tmpNode);
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowView._FlowData);
		}

		return tmpNode;
	}

	/**
	 * Remove a node and all its connections
	 * @param {string} pNodeHash - The hash of the node to remove
	 * @returns {boolean} Whether the node was removed
	 */
	removeNode(pNodeHash)
	{
		if (!this._FlowView) return false;

		let tmpNodeIndex = this._FlowView._FlowData.Nodes.findIndex((pNode) => pNode.Hash === pNodeHash);
		if (tmpNodeIndex < 0)
		{
			this._FlowView.log.warn(`PictSectionFlow removeNode: node ${pNodeHash} not found`);
			return false;
		}

		let tmpRemovedNode = this._FlowView._FlowData.Nodes.splice(tmpNodeIndex, 1)[0];

		// Remove all connections involving this node
		this._FlowView._FlowData.Connections = this._FlowView._FlowData.Connections.filter((pConnection) =>
		{
			return pConnection.SourceNodeHash !== pNodeHash && pConnection.TargetNodeHash !== pNodeHash;
		});

		// Close any open panels for this node
		this._FlowView.closePanelForNode(pNodeHash);

		// Clear selection if this node was selected
		if (this._FlowView._FlowData.ViewState.SelectedNodeHash === pNodeHash)
		{
			this._FlowView._FlowData.ViewState.SelectedNodeHash = null;
		}

		this._FlowView.renderFlow();
		this.marshalFromView();

		if (this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onNodeRemoved', tmpRemovedNode);
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowView._FlowData);
		}

		return true;
	}

	// ---- Connection CRUD ----

	/**
	 * Add a connection between two ports
	 * @param {string} pSourceNodeHash
	 * @param {string} pSourcePortHash
	 * @param {string} pTargetNodeHash
	 * @param {string} pTargetPortHash
	 * @param {Object} [pData] - Optional additional data
	 * @returns {Object|false} The created connection, or false if invalid
	 */
	addConnection(pSourceNodeHash, pSourcePortHash, pTargetNodeHash, pTargetPortHash, pData)
	{
		if (!this._FlowView) return false;

		// Validate that both nodes and ports exist
		let tmpSourceNode = this._FlowView._FlowData.Nodes.find((pNode) => pNode.Hash === pSourceNodeHash);
		let tmpTargetNode = this._FlowView._FlowData.Nodes.find((pNode) => pNode.Hash === pTargetNodeHash);

		if (!tmpSourceNode || !tmpTargetNode)
		{
			this._FlowView.log.warn('PictSectionFlow addConnection: source or target node not found');
			return false;
		}

		let tmpSourcePort = tmpSourceNode.Ports.find((pPort) => pPort.Hash === pSourcePortHash);
		let tmpTargetPort = tmpTargetNode.Ports.find((pPort) => pPort.Hash === pTargetPortHash);

		if (!tmpSourcePort || !tmpTargetPort)
		{
			this._FlowView.log.warn('PictSectionFlow addConnection: source or target port not found');
			return false;
		}

		// Prevent self-connections
		if (pSourceNodeHash === pTargetNodeHash)
		{
			this._FlowView.log.warn('PictSectionFlow addConnection: cannot connect a node to itself');
			return false;
		}

		// Check for duplicate connections
		let tmpDuplicate = this._FlowView._FlowData.Connections.find((pConn) =>
		{
			return pConn.SourceNodeHash === pSourceNodeHash
				&& pConn.SourcePortHash === pSourcePortHash
				&& pConn.TargetNodeHash === pTargetNodeHash
				&& pConn.TargetPortHash === pTargetPortHash;
		});
		if (tmpDuplicate)
		{
			this._FlowView.log.warn('PictSectionFlow addConnection: duplicate connection');
			return false;
		}

		let tmpConnection =
		{
			Hash: `conn-${this._FlowView.fable.getUUID()}`,
			SourceNodeHash: pSourceNodeHash,
			SourcePortHash: pSourcePortHash,
			TargetNodeHash: pTargetNodeHash,
			TargetPortHash: pTargetPortHash,
			Data: pData || {}
		};

		this._FlowView._FlowData.Connections.push(tmpConnection);
		this._FlowView.renderFlow();
		this.marshalFromView();

		if (this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onConnectionCreated', tmpConnection);
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowView._FlowData);
		}

		return tmpConnection;
	}

	/**
	 * Remove a connection
	 * @param {string} pConnectionHash - The hash of the connection to remove
	 * @returns {boolean} Whether the connection was removed
	 */
	removeConnection(pConnectionHash)
	{
		if (!this._FlowView) return false;

		let tmpConnectionIndex = this._FlowView._FlowData.Connections.findIndex((pConn) => pConn.Hash === pConnectionHash);
		if (tmpConnectionIndex < 0)
		{
			this._FlowView.log.warn(`PictSectionFlow removeConnection: connection ${pConnectionHash} not found`);
			return false;
		}

		let tmpRemovedConnection = this._FlowView._FlowData.Connections.splice(tmpConnectionIndex, 1)[0];

		// Close any properties panel open for this connection.
		if (typeof this._FlowView.closePanelForConnection === 'function')
		{
			this._FlowView.closePanelForConnection(pConnectionHash);
		}

		if (this._FlowView._FlowData.ViewState.SelectedConnectionHash === pConnectionHash)
		{
			this._FlowView._FlowData.ViewState.SelectedConnectionHash = null;
		}

		this._FlowView.renderFlow();
		this.marshalFromView();

		if (this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onConnectionRemoved', tmpRemovedConnection);
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowView._FlowData);
		}

		return true;
	}
}

module.exports = PictServiceFlowDataManager;
