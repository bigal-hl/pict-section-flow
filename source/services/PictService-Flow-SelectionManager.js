const libFableServiceProviderBase = require('fable-serviceproviderbase');

/**
 * PictService-Flow-SelectionManager
 *
 * Manages selection state for nodes, connections, and tethers in the flow diagram.
 * Handles selecting, deselecting, and deleting selected elements.
 */
class PictServiceFlowSelectionManager extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictServiceFlowSelectionManager';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;
	}

	/**
	 * Select a node
	 * @param {string|null} pNodeHash - Hash of the node to select, or null to deselect
	 */
	selectNode(pNodeHash)
	{
		let tmpPreviousSelection = this._FlowView._FlowData.ViewState.SelectedNodeHash;
		this._FlowView._FlowData.ViewState.SelectedNodeHash = pNodeHash;
		// Single selection keeps the set in lockstep, so the renderer (which highlights the set) and
		// any multi-select consumer see one consistent picture.
		this._FlowView._FlowData.ViewState.SelectedNodeHashes = pNodeHash ? [pNodeHash] : [];
		this._FlowView._FlowData.ViewState.SelectedConnectionHash = null;
		this._FlowView._FlowData.ViewState.SelectedTetherHash = null;

		this._FlowView.renderFlow();

		if (this._FlowView._EventHandlerProvider && pNodeHash !== tmpPreviousSelection)
		{
			let tmpNode = pNodeHash ? this._FlowView._FlowData.Nodes.find((pNode) => pNode.Hash === pNodeHash) : null;
			this._FlowView._EventHandlerProvider.fireEvent('onNodeSelected', tmpNode);
		}
	}

	/**
	 * The current selection set as an array of node hashes.
	 * @returns {Array<string>}
	 */
	getSelectedNodeHashes()
	{
		let tmpSet = this._FlowView._FlowData.ViewState.SelectedNodeHashes;
		return Array.isArray(tmpSet) ? tmpSet.slice() : [];
	}

	/**
	 * Toggle a node's membership in the selection set (shift-click). The primary SelectedNodeHash
	 * tracks the most recently affected member (or null when the set empties).
	 * @param {string} pNodeHash
	 */
	toggleNodeSelection(pNodeHash)
	{
		if (!pNodeHash) return;
		let tmpVS = this._FlowView._FlowData.ViewState;
		let tmpSet = Array.isArray(tmpVS.SelectedNodeHashes) ? tmpVS.SelectedNodeHashes.slice() : [];
		let tmpIndex = tmpSet.indexOf(pNodeHash);
		if (tmpIndex >= 0)
		{
			tmpSet.splice(tmpIndex, 1);
			tmpVS.SelectedNodeHash = tmpSet.length ? tmpSet[tmpSet.length - 1] : null;
		}
		else
		{
			tmpSet.push(pNodeHash);
			tmpVS.SelectedNodeHash = pNodeHash;
		}
		tmpVS.SelectedNodeHashes = tmpSet;
		tmpVS.SelectedConnectionHash = null;
		tmpVS.SelectedTetherHash = null;

		this._FlowView.renderFlow();

		if (this._FlowView._EventHandlerProvider)
		{
			let tmpNode = tmpVS.SelectedNodeHash ? this._FlowView._FlowData.Nodes.find((pNode) => pNode.Hash === tmpVS.SelectedNodeHash) : null;
			this._FlowView._EventHandlerProvider.fireEvent('onNodeSelected', tmpNode);
		}
	}

	/**
	 * Replace the selection set with the given node hashes (marquee result).
	 * @param {Array<string>} pNodeHashes
	 */
	selectNodes(pNodeHashes)
	{
		let tmpVS = this._FlowView._FlowData.ViewState;
		let tmpSet = Array.isArray(pNodeHashes) ? pNodeHashes.slice() : [];
		tmpVS.SelectedNodeHashes = tmpSet;
		tmpVS.SelectedNodeHash = tmpSet.length ? tmpSet[tmpSet.length - 1] : null;
		tmpVS.SelectedConnectionHash = null;
		tmpVS.SelectedTetherHash = null;

		this._FlowView.renderFlow();

		if (this._FlowView._EventHandlerProvider)
		{
			let tmpNode = tmpVS.SelectedNodeHash ? this._FlowView._FlowData.Nodes.find((pNode) => pNode.Hash === tmpVS.SelectedNodeHash) : null;
			this._FlowView._EventHandlerProvider.fireEvent('onNodeSelected', tmpNode);
		}
	}

	/**
	 * Select a connection
	 * @param {string|null} pConnectionHash - Hash of the connection to select, or null to deselect
	 */
	selectConnection(pConnectionHash)
	{
		let tmpPreviousSelection = this._FlowView._FlowData.ViewState.SelectedConnectionHash;
		this._FlowView._FlowData.ViewState.SelectedConnectionHash = pConnectionHash;
		this._FlowView._FlowData.ViewState.SelectedNodeHash = null;
		this._FlowView._FlowData.ViewState.SelectedTetherHash = null;

		this._FlowView.renderFlow();

		if (this._FlowView._EventHandlerProvider && pConnectionHash !== tmpPreviousSelection)
		{
			let tmpConnection = pConnectionHash ? this._FlowView._FlowData.Connections.find((pConn) => pConn.Hash === pConnectionHash) : null;
			this._FlowView._EventHandlerProvider.fireEvent('onConnectionSelected', tmpConnection);
		}
	}

	/**
	 * Select a tether by its panel hash.
	 * @param {string|null} pPanelHash - Hash of the panel whose tether to select, or null to deselect
	 */
	selectTether(pPanelHash)
	{
		let tmpPreviousSelection = this._FlowView._FlowData.ViewState.SelectedTetherHash;
		this._FlowView._FlowData.ViewState.SelectedTetherHash = pPanelHash;
		this._FlowView._FlowData.ViewState.SelectedNodeHash = null;
		this._FlowView._FlowData.ViewState.SelectedConnectionHash = null;

		this._FlowView.renderFlow();

		if (this._FlowView._EventHandlerProvider && pPanelHash !== tmpPreviousSelection)
		{
			let tmpPanel = pPanelHash ? this._FlowView._FlowData.OpenPanels.find((pPanel) => pPanel.Hash === pPanelHash) : null;
			this._FlowView._EventHandlerProvider.fireEvent('onTetherSelected', tmpPanel);
		}
	}

	/**
	 * Deselect all nodes and connections
	 */
	deselectAll()
	{
		this._FlowView._FlowData.ViewState.SelectedNodeHash = null;
		this._FlowView._FlowData.ViewState.SelectedNodeHashes = [];
		this._FlowView._FlowData.ViewState.SelectedConnectionHash = null;
		this._FlowView._FlowData.ViewState.SelectedTetherHash = null;
		this._FlowView.renderFlow();
	}

	/**
	 * Delete the current selection: every node in the multi-select set (falling back to the single
	 * SelectedNodeHash), or the selected connection.
	 * @returns {boolean}
	 */
	deleteSelected()
	{
		let tmpVS = this._FlowView._FlowData.ViewState;
		let tmpSet = Array.isArray(tmpVS.SelectedNodeHashes) ? tmpVS.SelectedNodeHashes.slice() : [];
		if (tmpSet.length === 0 && tmpVS.SelectedNodeHash) { tmpSet = [tmpVS.SelectedNodeHash]; }

		if (tmpSet.length > 0)
		{
			tmpVS.SelectedNodeHash = null;
			tmpVS.SelectedNodeHashes = [];
			let tmpRemovedAny = false;
			// removeNode marshals/renders/fires events per call; for a multi-delete that is acceptable
			// (selections are small) and keeps each removal's event semantics intact.
			tmpSet.forEach((pHash) => { if (this._FlowView.removeNode(pHash)) { tmpRemovedAny = true; } });
			return tmpRemovedAny;
		}
		if (tmpVS.SelectedConnectionHash)
		{
			return this._FlowView.removeConnection(tmpVS.SelectedConnectionHash);
		}
		return false;
	}
}

module.exports = PictServiceFlowSelectionManager;
