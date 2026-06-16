const libPictProvider = require('pict-provider');

const _ProviderConfiguration =
{
	ProviderIdentifier: 'PictProviderFlowLayouts'
};

/**
 * Provider for managing saved flow diagram layouts.
 *
 * Layouts capture the spatial arrangement of nodes and panels on the canvas
 * without storing any card content. When a layout is restored, nodes that
 * still exist are placed at their saved positions and any new nodes are
 * auto-laid-out to the right.
 *
 * ## Persistence
 *
 * By default, layouts are persisted to the browser's `localStorage` using a
 * key derived from the flow view identifier. This means layouts survive page
 * refreshes out of the box.
 *
 * Developers can override the storage backend (e.g., to use a REST API or
 * IndexedDB) by replacing the three storage hook methods on the instance or
 * in a subclass:
 *
 *   - `storageWrite(pLayouts, fCallback)` — persist the full layout array
 *   - `storageRead(fCallback)` — load the persisted layout array
 *   - `storageDelete(fCallback)` — remove all persisted layouts
 *
 * Each callback follows the Node convention: `fCallback(pError, pResult)`.
 *
 * Saved layout data structure:
 * {
 *     Hash: "layout-<UUID>",
 *     Name: "My Layout",
 *     CreatedAt: "2026-02-26T12:00:00.000Z",
 *     NodePositions: { "node-hash": { X, Y, Width, Height } },
 *     PanelPositions: { "node-hash": { X, Y, Width, Height } },
 *     ViewState: { PanX, PanY, Zoom }
 * }
 */
class PictProviderFlowLayouts extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _ProviderConfiguration, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'PictProviderFlowLayouts';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;

		// Storage key for localStorage persistence.
		// Defaults to a key derived from the FlowView identifier, or can be
		// set via options.StorageKey.  Pass `false` to disable localStorage.
		if (pOptions && pOptions.StorageKey !== undefined)
		{
			this._StorageKey = pOptions.StorageKey;
		}
		else if (this._FlowView && this._FlowView.options && this._FlowView.options.ViewIdentifier)
		{
			this._StorageKey = `pict-flow-layouts-${this._FlowView.options.ViewIdentifier}`;
		}
		else
		{
			this._StorageKey = 'pict-flow-layouts';
		}
	}

	/**
	 * Resolve a host-supplied storage backend, if one was passed as the flow's
	 * `LayoutStorage` option: `{ read(cb), write(layouts, cb), delete(cb) }` with
	 * Node-style callbacks. Lets a host wire a REST API / IndexedDB by config
	 * instead of overriding the three storage hooks. Returns null to fall back to
	 * localStorage.
	 * @returns {Object|null}
	 */
	_resolveLayoutStorage()
	{
		let tmpStorage = (this._FlowView && this._FlowView.options) ? this._FlowView.options.LayoutStorage : null;
		return (tmpStorage && typeof tmpStorage === 'object') ? tmpStorage : null;
	}

	// ── Storage Hooks ─────────────────────────────────────────────────────
	// These three methods form the persistence contract.  The default
	// implementation uses localStorage.  Override them on the instance or
	// subclass to use a REST API, IndexedDB, or any other backend.
	//
	// All callbacks follow `fCallback(pError, pResult)`.

	/**
	 * Persist the full array of layout objects.
	 *
	 * Default implementation writes JSON to `localStorage`.
	 *
	 * @param {Array} pLayouts - The array of layout objects to persist
	 * @param {Function} fCallback - `function(pError)` called when done
	 */
	storageWrite(pLayouts, fCallback)
	{
		let tmpStorage = this._resolveLayoutStorage();
		if (tmpStorage && typeof tmpStorage.write === 'function')
		{
			return tmpStorage.write(pLayouts, fCallback);
		}
		if (this._StorageKey === false)
		{
			return fCallback(null);
		}
		try
		{
			if (typeof localStorage !== 'undefined')
			{
				localStorage.setItem(this._StorageKey, JSON.stringify(pLayouts));
			}
			return fCallback(null);
		}
		catch (pError)
		{
			this.log.warn(`PictProviderFlowLayouts storageWrite error: ${pError.message}`);
			return fCallback(pError);
		}
	}

	/**
	 * Load the persisted array of layout objects.
	 *
	 * Default implementation reads JSON from `localStorage`.
	 *
	 * @param {Function} fCallback - `function(pError, pLayouts)` where
	 *        pLayouts is an Array (or null/empty if nothing stored)
	 */
	storageRead(fCallback)
	{
		let tmpStorage = this._resolveLayoutStorage();
		if (tmpStorage && typeof tmpStorage.read === 'function')
		{
			return tmpStorage.read(fCallback);
		}
		if (this._StorageKey === false)
		{
			return fCallback(null, []);
		}
		try
		{
			if (typeof localStorage !== 'undefined')
			{
				let tmpRaw = localStorage.getItem(this._StorageKey);
				if (tmpRaw)
				{
					let tmpParsed = JSON.parse(tmpRaw);
					if (Array.isArray(tmpParsed))
					{
						return fCallback(null, tmpParsed);
					}
				}
			}
			return fCallback(null, []);
		}
		catch (pError)
		{
			this.log.warn(`PictProviderFlowLayouts storageRead error: ${pError.message}`);
			return fCallback(pError, []);
		}
	}

	/**
	 * Remove all persisted layout data.
	 *
	 * Default implementation removes the key from `localStorage`.
	 *
	 * @param {Function} fCallback - `function(pError)` called when done
	 */
	storageDelete(fCallback)
	{
		let tmpStorage = this._resolveLayoutStorage();
		if (tmpStorage && typeof tmpStorage.delete === 'function')
		{
			return tmpStorage.delete(fCallback);
		}
		if (this._StorageKey === false)
		{
			return fCallback(null);
		}
		try
		{
			if (typeof localStorage !== 'undefined')
			{
				localStorage.removeItem(this._StorageKey);
			}
			return fCallback(null);
		}
		catch (pError)
		{
			this.log.warn(`PictProviderFlowLayouts storageDelete error: ${pError.message}`);
			return fCallback(pError);
		}
	}

	// ── Initialization ────────────────────────────────────────────────────

	/**
	 * Load persisted layouts and merge them into _FlowData.SavedLayouts.
	 * Layouts already present in _FlowData (e.g., from setFlowData) are
	 * kept; persisted layouts with new hashes are appended.
	 *
	 * Call this after _FlowData is populated.
	 */
	loadPersistedLayouts()
	{
		this.storageRead((pError, pLayouts) =>
		{
			if (pError || !Array.isArray(pLayouts) || pLayouts.length === 0)
			{
				return;
			}

			if (!this._FlowView || !this._FlowView._FlowData)
			{
				return;
			}

			let tmpExisting = this._FlowView._FlowData.SavedLayouts;
			let tmpExistingHashes = {};
			for (let i = 0; i < tmpExisting.length; i++)
			{
				tmpExistingHashes[tmpExisting[i].Hash] = true;
			}

			let tmpAdded = 0;
			for (let i = 0; i < pLayouts.length; i++)
			{
				if (!tmpExistingHashes[pLayouts[i].Hash])
				{
					tmpExisting.push(pLayouts[i]);
					tmpAdded++;
				}
			}

			if (tmpAdded > 0)
			{
				this.log.trace(`PictProviderFlowLayouts loaded ${tmpAdded} persisted layout(s)`);
			}
		});
	}

	// ── Public API ────────────────────────────────────────────────────────

	/**
	 * Save the current node and panel positions as a named layout.
	 * @param {string} pName - The display name for this layout
	 * @returns {Object} The saved layout entry
	 */
	saveLayout(pName)
	{
		if (!this._FlowView)
		{
			this.log.warn('PictProviderFlowLayouts saveLayout: no FlowView reference');
			return null;
		}

		let tmpFlowData = this._FlowView._FlowData;
		let tmpLayoutHash = `layout-${this.fable.getUUID()}`;
		let tmpNodePositions = {};
		let tmpPanelPositions = {};

		// Capture node positions and per-instance overrides (Title, Style)
		for (let i = 0; i < tmpFlowData.Nodes.length; i++)
		{
			let tmpNode = tmpFlowData.Nodes[i];
			tmpNodePositions[tmpNode.Hash] =
			{
				X: tmpNode.X,
				Y: tmpNode.Y,
				Width: tmpNode.Width,
				Height: tmpNode.Height,
				Title: tmpNode.Title
			};

			// Only include Style if it has been customized
			if (tmpNode.Style && Object.keys(tmpNode.Style).length > 0)
			{
				tmpNodePositions[tmpNode.Hash].Style = JSON.parse(JSON.stringify(tmpNode.Style));
			}
		}

		// Capture panel positions keyed by NodeHash (panels get new hashes on each open)
		for (let i = 0; i < tmpFlowData.OpenPanels.length; i++)
		{
			let tmpPanel = tmpFlowData.OpenPanels[i];
			tmpPanelPositions[tmpPanel.NodeHash] =
			{
				X: tmpPanel.X,
				Y: tmpPanel.Y,
				Width: tmpPanel.Width,
				Height: tmpPanel.Height
			};
		}

		let tmpLayout =
		{
			Hash: tmpLayoutHash,
			Name: pName || 'Untitled Layout',
			CreatedAt: new Date().toISOString(),
			NodePositions: tmpNodePositions,
			PanelPositions: tmpPanelPositions,
			ViewState:
			{
				PanX: tmpFlowData.ViewState.PanX,
				PanY: tmpFlowData.ViewState.PanY,
				Zoom: tmpFlowData.ViewState.Zoom
			}
		};

		tmpFlowData.SavedLayouts.push(tmpLayout);
		this._FlowView.marshalFromView();

		// Persist to storage
		this.storageWrite(tmpFlowData.SavedLayouts, (pError) =>
		{
			if (pError)
			{
				this.log.warn(`PictProviderFlowLayouts: failed to persist after save: ${pError.message}`);
			}
		});

		if (this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onLayoutSaved', tmpLayout);
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', tmpFlowData);
		}

		this.log.trace(`PictProviderFlowLayouts saved layout '${tmpLayout.Name}' (${tmpLayout.Hash})`);

		return tmpLayout;
	}

	/**
	 * Restore a saved layout by hash.
	 * Nodes present in the saved layout are placed at their saved positions.
	 * Nodes not in the saved layout are auto-laid-out to the right of the
	 * positioned nodes.
	 * @param {string} pLayoutHash - The hash of the layout to restore
	 * @returns {boolean} Whether the layout was restored
	 */
	restoreLayout(pLayoutHash)
	{
		if (!this._FlowView)
		{
			this.log.warn('PictProviderFlowLayouts restoreLayout: no FlowView reference');
			return false;
		}

		let tmpFlowData = this._FlowView._FlowData;
		let tmpLayout = tmpFlowData.SavedLayouts.find(
			(pLayout) => pLayout.Hash === pLayoutHash
		);

		if (!tmpLayout)
		{
			this.log.warn(`PictProviderFlowLayouts restoreLayout: layout '${pLayoutHash}' not found`);
			return false;
		}

		let tmpMatchedNodes = [];
		let tmpUnmatchedNodes = [];

		// Apply saved positions to matched nodes; collect unmatched ones
		for (let i = 0; i < tmpFlowData.Nodes.length; i++)
		{
			let tmpNode = tmpFlowData.Nodes[i];
			let tmpSaved = tmpLayout.NodePositions[tmpNode.Hash];

			if (tmpSaved)
			{
				tmpNode.X = tmpSaved.X;
				tmpNode.Y = tmpSaved.Y;
				if (typeof tmpSaved.Width === 'number') tmpNode.Width = tmpSaved.Width;
				if (typeof tmpSaved.Height === 'number') tmpNode.Height = tmpSaved.Height;
				if (typeof tmpSaved.Title === 'string') tmpNode.Title = tmpSaved.Title;
				if (tmpSaved.Style && typeof tmpSaved.Style === 'object')
				{
					tmpNode.Style = JSON.parse(JSON.stringify(tmpSaved.Style));
				}
				tmpMatchedNodes.push(tmpNode);
			}
			else
			{
				tmpUnmatchedNodes.push(tmpNode);
			}
		}

		// Apply saved panel positions (keyed by NodeHash)
		if (tmpLayout.PanelPositions)
		{
			for (let i = 0; i < tmpFlowData.OpenPanels.length; i++)
			{
				let tmpPanel = tmpFlowData.OpenPanels[i];
				let tmpSavedPanel = tmpLayout.PanelPositions[tmpPanel.NodeHash];

				if (tmpSavedPanel)
				{
					tmpPanel.X = tmpSavedPanel.X;
					tmpPanel.Y = tmpSavedPanel.Y;
					if (typeof tmpSavedPanel.Width === 'number') tmpPanel.Width = tmpSavedPanel.Width;
					if (typeof tmpSavedPanel.Height === 'number') tmpPanel.Height = tmpSavedPanel.Height;
				}
			}
		}

		// Auto-layout unmatched nodes to the right of positioned nodes
		if (tmpUnmatchedNodes.length > 0 && this._FlowView._LayoutService)
		{
			this._FlowView._LayoutService.autoLayoutSubset(
				tmpUnmatchedNodes,
				tmpMatchedNodes,
				tmpFlowData.Connections
			);
		}

		// Restore view state (camera position)
		if (tmpLayout.ViewState)
		{
			if (typeof tmpLayout.ViewState.PanX === 'number')
			{
				tmpFlowData.ViewState.PanX = tmpLayout.ViewState.PanX;
			}
			if (typeof tmpLayout.ViewState.PanY === 'number')
			{
				tmpFlowData.ViewState.PanY = tmpLayout.ViewState.PanY;
			}
			if (typeof tmpLayout.ViewState.Zoom === 'number')
			{
				tmpFlowData.ViewState.Zoom = tmpLayout.ViewState.Zoom;
			}
		}

		this._FlowView.renderFlow();
		this._FlowView.marshalFromView();

		if (this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onLayoutRestored', tmpLayout);
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', tmpFlowData);
		}

		this.log.trace(`PictProviderFlowLayouts restored layout '${tmpLayout.Name}' (${tmpLayout.Hash})`);

		return true;
	}

	/**
	 * Delete a saved layout by hash.
	 * @param {string} pLayoutHash - The hash of the layout to delete
	 * @returns {boolean} Whether the layout was deleted
	 */
	deleteLayout(pLayoutHash)
	{
		if (!this._FlowView)
		{
			this.log.warn('PictProviderFlowLayouts deleteLayout: no FlowView reference');
			return false;
		}

		let tmpFlowData = this._FlowView._FlowData;
		let tmpIndex = tmpFlowData.SavedLayouts.findIndex(
			(pLayout) => pLayout.Hash === pLayoutHash
		);

		if (tmpIndex < 0)
		{
			this.log.warn(`PictProviderFlowLayouts deleteLayout: layout '${pLayoutHash}' not found`);
			return false;
		}

		let tmpRemovedLayout = tmpFlowData.SavedLayouts.splice(tmpIndex, 1)[0];
		this._FlowView.marshalFromView();

		// Persist to storage (with the layout removed)
		this.storageWrite(tmpFlowData.SavedLayouts, (pError) =>
		{
			if (pError)
			{
				this.log.warn(`PictProviderFlowLayouts: failed to persist after delete: ${pError.message}`);
			}
		});

		if (this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onLayoutDeleted', tmpRemovedLayout);
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', tmpFlowData);
		}

		this.log.trace(`PictProviderFlowLayouts deleted layout '${tmpRemovedLayout.Name}' (${tmpRemovedLayout.Hash})`);

		return true;
	}

	/**
	 * Get the list of saved layouts.
	 * @returns {Array} Array of saved layout objects
	 */
	getLayouts()
	{
		if (!this._FlowView) return [];
		return this._FlowView._FlowData.SavedLayouts;
	}

	/**
	 * Get a specific saved layout by hash.
	 * @param {string} pLayoutHash
	 * @returns {Object|null}
	 */
	getLayout(pLayoutHash)
	{
		if (!this._FlowView) return null;
		return this._FlowView._FlowData.SavedLayouts.find(
			(pLayout) => pLayout.Hash === pLayoutHash
		) || null;
	}

	// ── Default layout ─────────────────────────────────────────────────────
	// One saved layout can be marked the default arrangement for a graph. The
	// mark is an IsDefault flag on the layout object, so it rides inside
	// SavedLayouts and persists through both the storage hooks and
	// getFlowData/setFlowData with no storage-shape change.

	/**
	 * Mark a saved layout as the default (clearing any previous default). Pass a
	 * falsy hash to clear the default entirely. Persists the change.
	 * @param {string} pLayoutHash
	 * @returns {boolean} true on success; false if a given hash was not found
	 */
	setDefaultLayout(pLayoutHash)
	{
		if (!this._FlowView)
		{
			this.log.warn('PictProviderFlowLayouts setDefaultLayout: no FlowView reference');
			return false;
		}

		let tmpFlowData = this._FlowView._FlowData;
		let tmpFound = false;
		for (let i = 0; i < tmpFlowData.SavedLayouts.length; i++)
		{
			let tmpIsMatch = (!!pLayoutHash && tmpFlowData.SavedLayouts[i].Hash === pLayoutHash);
			tmpFlowData.SavedLayouts[i].IsDefault = tmpIsMatch;
			if (tmpIsMatch) { tmpFound = true; }
		}

		// A falsy hash clears the default (every IsDefault now false); a non-matching hash is an error.
		if (pLayoutHash && !tmpFound)
		{
			this.log.warn(`PictProviderFlowLayouts setDefaultLayout: layout '${pLayoutHash}' not found`);
			return false;
		}

		this._FlowView.marshalFromView();
		this.storageWrite(tmpFlowData.SavedLayouts, (pError) =>
		{
			if (pError)
			{
				this.log.warn(`PictProviderFlowLayouts: failed to persist default: ${pError.message}`);
			}
		});

		if (this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onLayoutDefaultChanged', this.getDefaultLayout());
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', tmpFlowData);
		}

		return true;
	}

	/**
	 * The layout currently marked default, or null if none.
	 * @returns {Object|null}
	 */
	getDefaultLayout()
	{
		if (!this._FlowView) return null;
		return this._FlowView._FlowData.SavedLayouts.find((pLayout) => pLayout.IsDefault === true) || null;
	}

	/**
	 * Restore the default layout if one is set.
	 * @returns {boolean} true if a default existed and was restored
	 */
	applyDefaultLayout()
	{
		let tmpDefault = this.getDefaultLayout();
		if (!tmpDefault)
		{
			return false;
		}
		return this.restoreLayout(tmpDefault.Hash);
	}
}

module.exports = PictProviderFlowLayouts;

module.exports.default_configuration = _ProviderConfiguration;
