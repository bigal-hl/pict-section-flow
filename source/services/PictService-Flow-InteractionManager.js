const libFableServiceProviderBase = require('fable-serviceproviderbase');

/**
 * Interaction states for the flow diagram
 */
const INTERACTION_STATES =
{
	IDLE: 'idle',
	DRAGGING_NODE: 'dragging-node',
	DRAGGING_PANEL: 'dragging-panel',
	DRAGGING_HANDLE: 'dragging-handle',
	CONNECTING: 'connecting',
	PANNING: 'panning',
	RESIZING_PANEL: 'resizing-panel',
	RESIZING_NODE: 'resizing-node',
	ROTATING_NODE: 'rotating-node',
	RESIZING_FRAME: 'resizing-frame',
	MOVING_FRAME: 'moving-frame',
	MARQUEE: 'marquee'
};

class PictServiceFlowInteractionManager extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictServiceFlowInteractionManager';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;

		this._SVGElement = null;
		this._ViewportElement = null;

		// Interaction state
		this._setState(INTERACTION_STATES.IDLE);

		// Drag state
		this._DragNodeHash = null;
		this._DragStartX = 0;
		this._DragStartY = 0;
		this._DragNodeStartX = 0;
		this._DragNodeStartY = 0;

		// Panel drag state
		this._DragPanelHash = null;
		this._DragPanelStartX = 0;
		this._DragPanelStartY = 0;
		this._DragPanelDataStartX = 0;
		this._DragPanelDataStartY = 0;

		// Handle drag state
		this._DragHandleConnectionHash = null;
		this._DragHandlePanelHash = null;
		this._DragHandleType = null;
		this._DragHandleIsTether = false;

		// Pan state
		this._PanStartX = 0;
		this._PanStartY = 0;
		this._PanStartPanX = 0;
		this._PanStartPanY = 0;

		// Connection drag state
		this._ConnectSourceNodeHash = null;
		this._ConnectSourcePortHash = null;
		this._ConnectDragLine = null;

		// Double-click detection
		this._LastClickTime = 0;
		this._LastClickNodeHash = null;
		this._DoubleClickThreshold = 400;

		// Panel resize state
		this._ResizePanelHash = null;
		this._ResizeStartY = 0;
		this._ResizePanelStartHeight = 0;

		// Node resize state (drag a node's bottom-right handle to set Width/Height)
		this._ResizeNodeHash = null;
		this._ResizeNodeStartX = 0;
		this._ResizeNodeStartY = 0;
		this._ResizeNodeStartWidth = 0;
		this._ResizeNodeStartHeight = 0;

		// Content-frame edit state (drag the frame's edge handles to resize, or its move
		// handle to reposition the view-area box).
		this._FrameDragEdge = null;
		this._FrameStart = null;
		this._FrameStartPointerX = 0;
		this._FrameStartPointerY = 0;

		// Double-click detection for connections
		this._LastConnectionClickTime = 0;
		this._LastConnectionClickHash = null;

		// Double-click detection for tethers
		this._LastTetherClickTime = 0;
		this._LastTetherClickHash = null;

		// Double-click detection for handles
		this._LastHandleClickTime = 0;
		this._LastHandleClickHash = null;
		this._LastHandleClickType = null;

		// Bound event handlers (for removeEventListener)
		this._boundOnPointerDown = this._onPointerDown.bind(this);
		this._boundOnPointerMove = this._onPointerMove.bind(this);
		this._boundOnPointerUp = this._onPointerUp.bind(this);
		this._boundOnWheel = this._onWheel.bind(this);
		this._boundOnKeyDown = this._onKeyDown.bind(this);
	}

	/**
	 * Initialize event listeners on the SVG element
	 * @param {SVGSVGElement} pSVGElement
	 * @param {SVGGElement} pViewportElement
	 */
	initialize(pSVGElement, pViewportElement)
	{
		this._SVGElement = pSVGElement;
		this._ViewportElement = pViewportElement;

		if (!this._SVGElement) return;

		// Pointer/wheel/contextmenu live as inline attributes on the SVG
		// template (see Flow-Container-Template in PictView-Flow.js); they
		// route to InteractionManager via the FlowView's bridges. The
		// keydown listener stays document-level because keyboard input
		// has no element-level inline equivalent for the canvas-as-a-whole.
		document.addEventListener('keydown', this._boundOnKeyDown);
	}

	/**
	 * Inline-handler bridge — invoked from the SVG template's
	 * `oncontextmenu` attribute. Prevents the browser context menu and
	 * dispatches to the right bezier-handle action based on what was
	 * right-clicked.
	 *
	 * @param {Event} pEvent
	 */
	handleContextMenu(pEvent)
	{
		pEvent.preventDefault();

		// No edge/handle editing in read-only mode.
		if (this._isReadOnly()) return;

		let tmpTarget = pEvent.target;
		let tmpElementType = this._getElementType(tmpTarget);

		switch (tmpElementType)
		{
			case 'connection':
			case 'connection-hitarea':
				this._addBezierHandle(tmpTarget, pEvent);
				break;

			case 'connection-handle':
				this._removeBezierHandle(tmpTarget);
				break;

			case 'tether':
			case 'tether-hitarea':
				this._addTetherBezierHandle(tmpTarget, pEvent);
				break;

			case 'tether-handle':
				this._removeTetherBezierHandle(tmpTarget);
				break;
		}
	}

	/**
	 * Remove all event listeners. Pointer/wheel/contextmenu listeners live
	 * as inline template attributes and don't need explicit teardown — they
	 * disappear with the SVG element when the FlowView is destroyed.
	 */
	destroy()
	{
		document.removeEventListener('keydown', this._boundOnKeyDown);
	}

	/**
	 * Whether the flow is in read-only / presentation mode. Tolerant of minimal
	 * test harnesses: prefers the view's isReadOnly(), falls back to the option.
	 * @returns {boolean}
	 */
	_isReadOnly()
	{
		if (!this._FlowView) return false;
		if (typeof this._FlowView.isReadOnly === 'function') return !!this._FlowView.isReadOnly();
		return !!(this._FlowView.options && this._FlowView.options.ReadOnly);
	}

	/**
	 * Whether read-only canvas navigation (pan + wheel-zoom) is currently on (the
	 * "hand" toggle). When off, a read-only canvas is static and the wheel scrolls
	 * the page.
	 * @returns {boolean}
	 */
	_isReadOnlyNavigating()
	{
		return !!(this._FlowView && typeof this._FlowView.isReadOnlyNavigation === 'function' && this._FlowView.isReadOnlyNavigation());
	}

	/**
	 * The single interaction-state transition chokepoint. Setting state here keeps
	 * the canvas cursor (and any future state-derived concern) an intentional,
	 * derived property rather than something toggled by hand at each call site.
	 * @param {string} pState - an INTERACTION_STATES value
	 */
	_setState(pState)
	{
		this._State = pState;
		this._updateCursor();
	}

	/**
	 * Ask the CursorManager to re-derive the canvas cursor from the current state
	 * and mode. No-op until the CursorManager and SVG element exist.
	 */
	_updateCursor()
	{
		if (this._FlowView && this._FlowView._CursorManager)
		{
			this._FlowView._CursorManager.update();
		}
	}

	/**
	 * Handle pointer down event
	 * @param {PointerEvent} pEvent
	 */
	_onPointerDown(pEvent)
	{
		if (!this._FlowView) return;

		let tmpTarget = pEvent.target;
		let tmpElementType = this._getElementType(tmpTarget);

		// Check if click is inside a panel content area — let HTML handle its own events
		if (tmpTarget.closest && tmpTarget.closest('.pict-flow-panel-content'))
		{
			return;
		}

		// Capture pointer for smooth dragging (left-click only — right-click
		// needs the real target for contextmenu handle add/remove)
		if (pEvent.button === 0)
		{
			this._SVGElement.setPointerCapture(pEvent.pointerId);
		}

		// Read-only / presentation mode: a reduced dispatch. Selection, node
		// activation (so a host can open a read-only inspector), and panning are
		// allowed; every editing interaction (drag, resize, connect, handle add,
		// panel edit) is inert.
		if (this._isReadOnly())
		{
			// Hand tool on (navigation enabled): a drag anywhere grabs and pans the canvas, including
			// over a card — you are moving the viewport, like the Photoshop hand. No selection here.
			if (this._isReadOnlyNavigating())
			{
				if (pEvent.button === 0 && this._FlowView.options.EnablePanning)
				{
					this._startPanning(pEvent);
				}
				return;
			}

			// Hand off (static): selection + node activation for inspection; the canvas does not move.
			switch (tmpElementType)
			{
				case 'node':
				case 'node-body':
				case 'panel-indicator':
				{
					let tmpNodeHash = this._getNodeHash(tmpTarget);
					if (tmpNodeHash)
					{
						this._FlowView.selectNode(tmpNodeHash);
						let tmpNode = this._FlowView.getNode(tmpNodeHash);
						if (tmpNode && this._FlowView._EventHandlerProvider)
						{
							this._FlowView._EventHandlerProvider.fireEvent('onNodeActivate', tmpNode);
						}
					}
					break;
				}

				case 'connection':
				case 'connection-hitarea':
					this._selectConnection(tmpTarget);
					break;

				case 'tether':
				case 'tether-hitarea':
					this._selectTether(tmpTarget);
					break;

				default:
					break;
			}
			return;
		}

		switch (tmpElementType)
		{
			case 'port':
				this._startConnection(pEvent, tmpTarget);
				break;

			case 'node':
			case 'node-body':
			case 'panel-indicator':
			{
				let tmpNodeHash = this._getNodeHash(tmpTarget);
				let tmpNow = Date.now();

				// Shift-click toggles this node in the multi-selection (no drag, no panel).
				if (tmpNodeHash && this._FlowView.options.EnableMultiSelect && pEvent.shiftKey)
				{
					this._LastClickTime = 0;
					this._LastClickNodeHash = null;
					this._FlowView.toggleNodeSelection(tmpNodeHash);
					break;
				}

				// Check for double-click on same node
				if (tmpNodeHash && tmpNodeHash === this._LastClickNodeHash
					&& (tmpNow - this._LastClickTime) < this._DoubleClickThreshold)
				{
					// Double-click: toggle panel
					this._LastClickTime = 0;
					this._LastClickNodeHash = null;
					this._FlowView.togglePanel(tmpNodeHash);
				}
				else
				{
					// Single click: start node drag
					this._LastClickTime = tmpNow;
					this._LastClickNodeHash = tmpNodeHash;
					this._startNodeDrag(pEvent, tmpTarget);
				}
				break;
			}

			case 'panel-titlebar':
				this._startPanelDrag(pEvent, tmpTarget);
				break;

			case 'panel-resize':
				this._startPanelResize(pEvent, tmpTarget);
				break;

			case 'node-resize':
				this._startNodeResize(pEvent, tmpTarget);
				break;

			case 'node-rotate':
				this._startNodeRotate(pEvent, tmpTarget);
				break;

			case 'frame-resize':
				this._startFrameResize(pEvent, tmpTarget);
				break;

			case 'frame-move':
				this._startFrameMove(pEvent, tmpTarget);
				break;

			case 'panel-close':
			{
				let tmpPanelHash = this._getPanelHash(tmpTarget);
				if (tmpPanelHash)
				{
					this._FlowView.closePanel(tmpPanelHash);
				}
				break;
			}

			case 'connection-handle':
			{
				let tmpConnectionHash = this._getConnectionHash(tmpTarget);
				let tmpHandleType = tmpTarget.getAttribute('data-handle-type');
				let tmpNow = Date.now();

				// Check for double-click on handle to toggle mode
				if (tmpConnectionHash === this._LastHandleClickHash
					&& tmpHandleType === this._LastHandleClickType
					&& (tmpNow - this._LastHandleClickTime) < this._DoubleClickThreshold)
				{
					this._toggleConnectionLineMode(tmpConnectionHash);
					this._LastHandleClickTime = 0;
					this._LastHandleClickHash = null;
					this._LastHandleClickType = null;
				}
				else
				{
					this._LastHandleClickTime = tmpNow;
					this._LastHandleClickHash = tmpConnectionHash;
					this._LastHandleClickType = tmpHandleType;
					this._startHandleDrag(pEvent, tmpConnectionHash, null, tmpHandleType, false);
				}
				pEvent.stopPropagation();
				break;
			}

			case 'tether':
			case 'tether-hitarea':
			{
				let tmpPanelHash = this._getPanelHash(tmpTarget);
				let tmpNow = Date.now();

				// Check for double-click on same tether to add a handle
				if (tmpPanelHash && tmpPanelHash === this._LastTetherClickHash
					&& (tmpNow - this._LastTetherClickTime) < this._DoubleClickThreshold)
				{
					this._LastTetherClickTime = 0;
					this._LastTetherClickHash = null;
					this._addTetherBezierHandle(tmpTarget, pEvent);
				}
				else
				{
					this._LastTetherClickTime = tmpNow;
					this._LastTetherClickHash = tmpPanelHash;
					this._selectTether(tmpTarget);
				}
				break;
			}

			case 'tether-handle':
			{
				let tmpPanelHash = this._getPanelHash(tmpTarget);
				let tmpHandleType = tmpTarget.getAttribute('data-handle-type');
				let tmpNow = Date.now();

				// Check for double-click on tether handle to toggle mode
				if (tmpPanelHash === this._LastHandleClickHash
					&& tmpHandleType === this._LastHandleClickType
					&& (tmpNow - this._LastHandleClickTime) < this._DoubleClickThreshold)
				{
					this._toggleTetherLineMode(tmpPanelHash);
					this._LastHandleClickTime = 0;
					this._LastHandleClickHash = null;
					this._LastHandleClickType = null;
				}
				else
				{
					this._LastHandleClickTime = tmpNow;
					this._LastHandleClickHash = tmpPanelHash;
					this._LastHandleClickType = tmpHandleType;
					this._startHandleDrag(pEvent, null, tmpPanelHash, tmpHandleType, true);
				}
				pEvent.stopPropagation();
				break;
			}

			case 'connection':
			case 'connection-hitarea':
			{
				let tmpConnectionHash = this._getConnectionHash(tmpTarget);
				let tmpNow = Date.now();

				// Check for double-click on same connection to add a handle
				if (tmpConnectionHash && tmpConnectionHash === this._LastConnectionClickHash
					&& (tmpNow - this._LastConnectionClickTime) < this._DoubleClickThreshold)
				{
					this._LastConnectionClickTime = 0;
					this._LastConnectionClickHash = null;
					// When the host configured a connection properties panel, double-click opens it;
					// otherwise keep the default behavior of adding a bezier handle.
					if (this._FlowView.options.ConnectionPropertiesPanel && tmpConnectionHash)
					{
						this._FlowView.toggleConnectionPanel(tmpConnectionHash);
					}
					else
					{
						this._addBezierHandle(tmpTarget, pEvent);
					}
				}
				else
				{
					this._LastConnectionClickTime = tmpNow;
					this._LastConnectionClickHash = tmpConnectionHash;
					this._selectConnection(tmpTarget);
				}
				break;
			}

			default:
				// Click / drag on the empty background.
				if (pEvent.button === 0)
				{
					if (this._FlowView.options.EnableMultiSelect && !pEvent.shiftKey)
					{
						// Plain drag marquee-selects; a click (no drag) clears the selection on release.
						this._startMarquee(pEvent);
					}
					else if (this._FlowView.options.EnablePanning)
					{
						// With multi-select on, shift+drag pans; otherwise this is the normal pan.
						this._startPanning(pEvent);
					}
				}
				break;
		}
	}

	/**
	 * Handle pointer move event
	 * @param {PointerEvent} pEvent
	 */
	_onPointerMove(pEvent)
	{
		if (!this._FlowView) return;

		switch (this._State)
		{
			case INTERACTION_STATES.DRAGGING_NODE:
				this._onNodeDrag(pEvent);
				break;

			case INTERACTION_STATES.DRAGGING_PANEL:
				this._onPanelDrag(pEvent);
				break;

			case INTERACTION_STATES.DRAGGING_HANDLE:
				this._onHandleDrag(pEvent);
				break;

			case INTERACTION_STATES.CONNECTING:
				this._onConnectionDrag(pEvent);
				break;

			case INTERACTION_STATES.RESIZING_PANEL:
				this._onPanelResize(pEvent);
				break;

			case INTERACTION_STATES.RESIZING_NODE:
				this._onNodeResize(pEvent);
				break;

			case INTERACTION_STATES.RESIZING_FRAME:
				this._onFrameResize(pEvent);
				break;

			case INTERACTION_STATES.MOVING_FRAME:
				this._onFrameMove(pEvent);
				break;

			case INTERACTION_STATES.ROTATING_NODE:
				this._onNodeRotate(pEvent);
				break;

			case INTERACTION_STATES.PANNING:
				this._onPan(pEvent);
				break;

			case INTERACTION_STATES.MARQUEE:
				this._onMarquee(pEvent);
				break;
		}
	}

	/**
	 * Handle pointer up event
	 * @param {PointerEvent} pEvent
	 */
	_onPointerUp(pEvent)
	{
		if (!this._FlowView) return;

		// Release pointer capture
		if (this._SVGElement.hasPointerCapture && this._SVGElement.hasPointerCapture(pEvent.pointerId))
		{
			this._SVGElement.releasePointerCapture(pEvent.pointerId);
		}

		switch (this._State)
		{
			case INTERACTION_STATES.DRAGGING_NODE:
				this._endNodeDrag(pEvent);
				break;

			case INTERACTION_STATES.DRAGGING_PANEL:
				this._endPanelDrag(pEvent);
				break;

			case INTERACTION_STATES.DRAGGING_HANDLE:
				this._endHandleDrag(pEvent);
				break;

			case INTERACTION_STATES.RESIZING_PANEL:
				this._endPanelResize(pEvent);
				break;

			case INTERACTION_STATES.RESIZING_NODE:
				this._endNodeResize(pEvent);
				break;

			case INTERACTION_STATES.RESIZING_FRAME:
			case INTERACTION_STATES.MOVING_FRAME:
				this._endFrameEdit(pEvent);
				break;

			case INTERACTION_STATES.ROTATING_NODE:
				this._endNodeRotate(pEvent);
				break;

			case INTERACTION_STATES.CONNECTING:
				this._endConnection(pEvent);
				break;

			case INTERACTION_STATES.PANNING:
				this._endPanning(pEvent);
				break;

			case INTERACTION_STATES.MARQUEE:
				this._endMarquee(pEvent);
				break;
		}
	}

	/**
	 * Decide what a wheel event should do, from config and modifier keys. Pure
	 * (no DOM, no side effects) so it is unit testable.
	 *
	 * WheelMode 'zoom' (default): wheel zooms; if WheelZoomRequiresModifier is on,
	 *   a plain wheel pans and ctrl/cmd+wheel zooms.
	 * WheelMode 'pan': wheel pans; ctrl/cmd+wheel zooms.
	 * WheelMode 'none': flow ignores the wheel (page scrolls).
	 *
	 * Zoom is gated by EnableZooming and pan by EnablePanning; when the intended
	 * action is disabled the result is 'none' (matching the legacy early return
	 * when zooming was off).
	 *
	 * @param {WheelEvent} pEvent
	 * @returns {{action: string}} action is 'zoom' | 'pan' | 'none'
	 */
	_resolveWheelAction(pEvent)
	{
		let tmpOptions = (this._FlowView && this._FlowView.options) ? this._FlowView.options : {};

		// Read-only has its own wheel policy: by default the wheel scrolls the page
		// (the canvas is static content); only when navigation is toggled on (the
		// hand toggle) does the wheel zoom the canvas.
		if (this._isReadOnly())
		{
			return { action: this._isReadOnlyNavigating() ? 'zoom' : 'none' };
		}

		let tmpWheelMode = tmpOptions.WheelMode || 'zoom';

		if (tmpWheelMode === 'none')
		{
			return { action: 'none' };
		}

		let tmpModifier = !!(pEvent && (pEvent.ctrlKey || pEvent.metaKey));

		let tmpWantZoom;
		if (tmpWheelMode === 'pan')
		{
			tmpWantZoom = tmpModifier;
		}
		else
		{
			tmpWantZoom = tmpOptions.WheelZoomRequiresModifier ? tmpModifier : true;
		}

		if (tmpWantZoom)
		{
			return { action: tmpOptions.EnableZooming ? 'zoom' : 'none' };
		}

		return { action: (tmpOptions.EnablePanning === false) ? 'none' : 'pan' };
	}

	/**
	 * Handle mouse wheel: zoom toward the pointer, pan the canvas, or ignore,
	 * per _resolveWheelAction.
	 * @param {WheelEvent} pEvent
	 */
	_onWheel(pEvent)
	{
		if (!this._FlowView) return;

		let tmpResolved = this._resolveWheelAction(pEvent);
		if (tmpResolved.action === 'none') return;

		pEvent.preventDefault();

		let tmpOptions = this._FlowView.options;

		if (tmpResolved.action === 'zoom')
		{
			let tmpSensitivity = (typeof tmpOptions.WheelZoomSensitivity === 'number') ? tmpOptions.WheelZoomSensitivity : 1;
			let tmpStep = tmpOptions.ZoomStep * tmpSensitivity;
			let tmpDelta = pEvent.deltaY > 0 ? -tmpStep : tmpStep;
			let tmpNewZoom = this._FlowView.viewState.Zoom + tmpDelta;

			// Zoom toward mouse position
			let tmpRect = this._SVGElement.getBoundingClientRect();
			let tmpMouseX = pEvent.clientX - tmpRect.left;
			let tmpMouseY = pEvent.clientY - tmpRect.top;

			this._FlowView.setZoom(tmpNewZoom, tmpMouseX, tmpMouseY);
			return;
		}

		// Pan: wheel scrolls the canvas. Shift+wheel commonly arrives as deltaX.
		let tmpPanSensitivity = (typeof tmpOptions.WheelPanSensitivity === 'number') ? tmpOptions.WheelPanSensitivity : 1;
		if (this._FlowView._ViewportManager && typeof this._FlowView._ViewportManager.panBy === 'function')
		{
			this._FlowView._ViewportManager.panBy(-pEvent.deltaX * tmpPanSensitivity, -pEvent.deltaY * tmpPanSensitivity);
		}
	}

	/**
	 * Handle keyboard events
	 * @param {KeyboardEvent} pEvent
	 */
	_onKeyDown(pEvent)
	{
		if (!this._FlowView) return;

		// Only handle events when the flow is focused/visible
		if (pEvent.key === 'Delete' || pEvent.key === 'Backspace')
		{
			// No deletion in read-only mode.
			if (this._isReadOnly()) return;

			// Don't delete if user is typing in an input or inside a panel
			if (pEvent.target && (pEvent.target.tagName === 'INPUT' || pEvent.target.tagName === 'TEXTAREA' || pEvent.target.tagName === 'SELECT'))
			{
				return;
			}
			if (pEvent.target && pEvent.target.closest && pEvent.target.closest('.pict-flow-panel'))
			{
				return;
			}

			this._FlowView.deleteSelected();
			pEvent.preventDefault();
		}
		else if (pEvent.key === 'Escape')
		{
			if (this._State === INTERACTION_STATES.CONNECTING)
			{
				this._cancelConnection();
			}

			// Exit fullscreen if currently in fullscreen mode
			if (this._FlowView._IsFullscreen)
			{
				this._FlowView.exitFullscreen();
				// Update the toolbar button text
				if (this._FlowView._ToolbarView)
				{
					let tmpFlowViewIdentifier = this._FlowView.options.ViewIdentifier;
					let tmpBtnElements = this._FlowView.pict.ContentAssignment.getElement(`#Flow-Toolbar-Fullscreen-${tmpFlowViewIdentifier}`);
					if (tmpBtnElements.length > 0)
					{
						tmpBtnElements[0].innerHTML = '&#x26F6; Fullscreen';
					}
				}
				pEvent.preventDefault();
				return;
			}

			this._FlowView.deselectAll();
		}
	}

	// ---- Node Dragging ----

	_startNodeDrag(pEvent, pTarget)
	{
		if (!this._FlowView.options.EnableNodeDragging) return;

		let tmpNodeHash = this._getNodeHash(pTarget);
		if (!tmpNodeHash) return;

		// If the grabbed node is part of a multi-selection, drag the whole set; otherwise select just
		// it. (Grabbing a node outside the current selection collapses to that single node.)
		let tmpSelected = this._FlowView.getSelectedNodeHashes ? this._FlowView.getSelectedNodeHashes() : [];
		let tmpIsMulti = this._FlowView.options.EnableMultiSelect && tmpSelected.length > 1 && tmpSelected.indexOf(tmpNodeHash) >= 0;
		if (!tmpIsMulti)
		{
			this._FlowView.selectNode(tmpNodeHash);
			tmpSelected = [tmpNodeHash];
		}

		// Capture each dragged node's start position so one delta applies to all of them.
		this._DragNodes = [];
		for (let i = 0; i < tmpSelected.length; i++)
		{
			let tmpN = this._FlowView.getNode(tmpSelected[i]);
			if (tmpN) { this._DragNodes.push({ Hash: tmpN.Hash, StartX: tmpN.X, StartY: tmpN.Y }); }
		}
		if (this._DragNodes.length === 0) return;

		this._setState(INTERACTION_STATES.DRAGGING_NODE);
		this._DragNodeHash = tmpNodeHash;
		this._DragStartX = pEvent.clientX;
		this._DragStartY = pEvent.clientY;

		for (let i = 0; i < this._DragNodes.length; i++)
		{
			let tmpNodeGroup = this._FlowView._NodesLayer.querySelector(`[data-node-hash="${this._DragNodes[i].Hash}"]`);
			if (tmpNodeGroup) { tmpNodeGroup.classList.add('dragging'); }
		}
	}

	_onNodeDrag(pEvent)
	{
		if (!this._DragNodes || this._DragNodes.length === 0) return;

		let tmpVS = this._FlowView.viewState;
		let tmpDX = (pEvent.clientX - this._DragStartX) / tmpVS.Zoom;
		let tmpDY = (pEvent.clientY - this._DragStartY) / tmpVS.Zoom;

		// A single-node drag can show alignment guides and snap to other nodes' edges/centers.
		// Multi-drag keeps the rigid group offset (aligning a moving group is ambiguous).
		if (this._DragNodes.length === 1 && this._FlowView.options.EnableAlignmentGuides)
		{
			let tmpHash = this._DragNodes[0].Hash;
			let tmpNode = this._FlowView.getNode(tmpHash);
			let tmpX = this._snapToGrid(this._DragNodes[0].StartX + tmpDX);
			let tmpY = this._snapToGrid(this._DragNodes[0].StartY + tmpDY);
			if (tmpNode)
			{
				let tmpAlign = this._alignmentFor(tmpNode, tmpX, tmpY);
				this._drawGuides(tmpAlign.Guides);
				this._FlowView.updateNodePosition(tmpHash, tmpAlign.X, tmpAlign.Y);
				return;
			}
		}

		for (let i = 0; i < this._DragNodes.length; i++)
		{
			let tmpNewX = this._snapToGrid(this._DragNodes[i].StartX + tmpDX);
			let tmpNewY = this._snapToGrid(this._DragNodes[i].StartY + tmpDY);
			this._FlowView.updateNodePosition(this._DragNodes[i].Hash, tmpNewX, tmpNewY);
		}
	}

	// ---- Alignment guides (single-node drag) ----
	// Compare the dragged node's six reference lines (left / center-x / right and top / center-y /
	// bottom) against every other node's. Within a small threshold the dragged node snaps so the lines
	// coincide, and a guide line is reported spanning both nodes. Returns the (possibly snapped)
	// position plus the guides to draw; a pure computation so it can be unit-tested without a DOM.
	_alignmentFor(pDragNode, pX, pY)
	{
		let tmpZoom = (this._FlowView.viewState && this._FlowView.viewState.Zoom) ? this._FlowView.viewState.Zoom : 1;
		let tmpThreshold = 6 / tmpZoom;
		let tmpDefaultW = this._FlowView.options.DefaultNodeWidth || 180;
		let tmpDefaultH = this._FlowView.options.DefaultNodeHeight || 80;
		let tmpW = (typeof pDragNode.Width === 'number') ? pDragNode.Width : tmpDefaultW;
		let tmpH = (typeof pDragNode.Height === 'number') ? pDragNode.Height : tmpDefaultH;

		let tmpDragV = [ pX, pX + tmpW / 2, pX + tmpW ];   // left, center-x, right
		let tmpDragH = [ pY, pY + tmpH / 2, pY + tmpH ];   // top, center-y, bottom

		let tmpBestV = null;
		let tmpBestH = null;
		let tmpNodes = this._FlowView._FlowData.Nodes || [];

		for (let i = 0; i < tmpNodes.length; i++)
		{
			let tmpO = tmpNodes[i];
			if (tmpO.Hash === pDragNode.Hash) continue;
			let tmpOW = (typeof tmpO.Width === 'number') ? tmpO.Width : tmpDefaultW;
			let tmpOH = (typeof tmpO.Height === 'number') ? tmpO.Height : tmpDefaultH;
			let tmpOtherV = [ tmpO.X, tmpO.X + tmpOW / 2, tmpO.X + tmpOW ];
			let tmpOtherH = [ tmpO.Y, tmpO.Y + tmpOH / 2, tmpO.Y + tmpOH ];

			for (let a = 0; a < tmpDragV.length; a++)
			{
				for (let b = 0; b < tmpOtherV.length; b++)
				{
					let tmpD = Math.abs(tmpDragV[a] - tmpOtherV[b]);
					if (tmpD <= tmpThreshold && (!tmpBestV || tmpD < tmpBestV.Delta))
					{
						tmpBestV = { Delta: tmpD, Pos: tmpOtherV[b], SnapX: pX + (tmpOtherV[b] - tmpDragV[a]), OtherTop: tmpO.Y, OtherBottom: tmpO.Y + tmpOH };
					}
				}
			}
			for (let a = 0; a < tmpDragH.length; a++)
			{
				for (let b = 0; b < tmpOtherH.length; b++)
				{
					let tmpD = Math.abs(tmpDragH[a] - tmpOtherH[b]);
					if (tmpD <= tmpThreshold && (!tmpBestH || tmpD < tmpBestH.Delta))
					{
						tmpBestH = { Delta: tmpD, Pos: tmpOtherH[b], SnapY: pY + (tmpOtherH[b] - tmpDragH[a]), OtherLeft: tmpO.X, OtherRight: tmpO.X + tmpOW };
					}
				}
			}
		}

		let tmpResult = { X: pX, Y: pY, Guides: [] };
		if (tmpBestV)
		{
			tmpResult.X = tmpBestV.SnapX;
			tmpResult.Guides.push({ Type: 'v', Pos: tmpBestV.Pos, A: Math.min(tmpResult.Y, tmpBestV.OtherTop), B: Math.max(tmpResult.Y + tmpH, tmpBestV.OtherBottom) });
		}
		if (tmpBestH)
		{
			tmpResult.Y = tmpBestH.SnapY;
			tmpResult.Guides.push({ Type: 'h', Pos: tmpBestH.Pos, A: Math.min(tmpResult.X, tmpBestH.OtherLeft), B: Math.max(tmpResult.X + tmpW, tmpBestH.OtherRight) });
		}
		return tmpResult;
	}

	_drawGuides(pGuides)
	{
		this._clearGuides();
		if (!pGuides || pGuides.length === 0 || !this._FlowView._ViewportElement) return;
		this._GuideElements = [];
		for (let i = 0; i < pGuides.length; i++)
		{
			let tmpG = pGuides[i];
			let tmpLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			tmpLine.setAttribute('class', 'pict-flow-align-guide');
			if (tmpG.Type === 'v') { tmpLine.setAttribute('x1', tmpG.Pos); tmpLine.setAttribute('x2', tmpG.Pos); tmpLine.setAttribute('y1', tmpG.A); tmpLine.setAttribute('y2', tmpG.B); }
			else { tmpLine.setAttribute('y1', tmpG.Pos); tmpLine.setAttribute('y2', tmpG.Pos); tmpLine.setAttribute('x1', tmpG.A); tmpLine.setAttribute('x2', tmpG.B); }
			this._FlowView._ViewportElement.appendChild(tmpLine);
			this._GuideElements.push(tmpLine);
		}
	}

	_clearGuides()
	{
		if (this._GuideElements)
		{
			for (let i = 0; i < this._GuideElements.length; i++)
			{
				let tmpEl = this._GuideElements[i];
				if (tmpEl.parentNode) { tmpEl.parentNode.removeChild(tmpEl); }
			}
		}
		this._GuideElements = null;
	}

	// Snap a coordinate or size to the grid when the flow has EnableGridSnap on; otherwise pass through.
	_snapToGrid(pValue)
	{
		if (!this._FlowView.options.EnableGridSnap) { return pValue; }
		// A defined GridSnapSize of 0 means "no snap"; only an absent size falls back to the default.
		let tmpGrid = (typeof this._FlowView.options.GridSnapSize === 'number') ? this._FlowView.options.GridSnapSize : 20;
		if (tmpGrid <= 0) { return pValue; }
		return Math.round(pValue / tmpGrid) * tmpGrid;
	}

	_endNodeDrag(pEvent)
	{		this._clearGuides();

		let tmpDragged = this._DragNodes || [];
		for (let i = 0; i < tmpDragged.length; i++)
		{
			let tmpNodeGroup = this._FlowView._NodesLayer.querySelector(`[data-node-hash="${tmpDragged[i].Hash}"]`);
			if (tmpNodeGroup) { tmpNodeGroup.classList.remove('dragging'); }
		}

		this._FlowView.renderFlow();
		this._FlowView.marshalFromView();

		if (this._FlowView._EventHandlerProvider)
		{
			for (let i = 0; i < tmpDragged.length; i++)
			{
				let tmpNode = this._FlowView.getNode(tmpDragged[i].Hash);
				if (tmpNode) { this._FlowView._EventHandlerProvider.fireEvent('onNodeMoved', tmpNode); }
			}
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowView.flowData);
		}

		this._setState(INTERACTION_STATES.IDLE);
		this._DragNodeHash = null;
		this._DragNodes = null;
	}

	// ---- Panel Dragging ----

	_startPanelDrag(pEvent, pTarget)
	{
		let tmpPanelHash = this._getPanelHash(pTarget);
		if (!tmpPanelHash) return;

		let tmpPanel = this._FlowView._FlowData.OpenPanels.find((pPanel) => pPanel.Hash === tmpPanelHash);
		if (!tmpPanel) return;

		this._setState(INTERACTION_STATES.DRAGGING_PANEL);
		this._DragPanelHash = tmpPanelHash;
		this._DragPanelStartX = pEvent.clientX;
		this._DragPanelStartY = pEvent.clientY;
		this._DragPanelDataStartX = tmpPanel.X;
		this._DragPanelDataStartY = tmpPanel.Y;
	}

	_onPanelDrag(pEvent)
	{
		if (!this._DragPanelHash) return;

		let tmpVS = this._FlowView.viewState;
		let tmpDX = (pEvent.clientX - this._DragPanelStartX) / tmpVS.Zoom;
		let tmpDY = (pEvent.clientY - this._DragPanelStartY) / tmpVS.Zoom;

		let tmpNewX = this._DragPanelDataStartX + tmpDX;
		let tmpNewY = this._DragPanelDataStartY + tmpDY;

		this._FlowView.updatePanelPosition(this._DragPanelHash, tmpNewX, tmpNewY);
	}

	_endPanelDrag(pEvent)
	{
		this._FlowView.marshalFromView();

		let tmpPanel = this._FlowView._FlowData.OpenPanels.find((pPanel) => pPanel.Hash === this._DragPanelHash);
		if (tmpPanel && this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onPanelMoved', tmpPanel);
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowView.flowData);
		}

		this._setState(INTERACTION_STATES.IDLE);
		this._DragPanelHash = null;
	}

	// ---- Panel Resizing ----

	_startPanelResize(pEvent, pTarget)
	{
		let tmpPanelHash = this._getPanelHash(pTarget);
		if (!tmpPanelHash) return;

		let tmpPanel = this._FlowView._FlowData.OpenPanels.find((pPanel) => pPanel.Hash === tmpPanelHash);
		if (!tmpPanel) return;

		this._setState(INTERACTION_STATES.RESIZING_PANEL);
		this._ResizePanelHash = tmpPanelHash;
		this._ResizeStartY = pEvent.clientY;
		this._ResizePanelStartHeight = tmpPanel.Height;
	}

	_onPanelResize(pEvent)
	{
		if (!this._ResizePanelHash) return;

		let tmpVS = this._FlowView.viewState;
		let tmpDY = (pEvent.clientY - this._ResizeStartY) / tmpVS.Zoom;
		let tmpNewHeight = Math.max(120, this._ResizePanelStartHeight + tmpDY);

		// Update the panel data
		let tmpPanel = this._FlowView._FlowData.OpenPanels.find((pPanel) => pPanel.Hash === this._ResizePanelHash);
		if (tmpPanel)
		{
			tmpPanel.Height = tmpNewHeight;
		}

		// Update the foreignObject height directly for smooth resizing
		if (this._FlowView._PanelsLayer)
		{
			let tmpFO = this._FlowView._PanelsLayer.querySelector('[data-panel-hash="' + this._ResizePanelHash + '"]');
			if (tmpFO)
			{
				tmpFO.setAttribute('height', String(tmpNewHeight));
			}
		}
	}

	_endPanelResize(pEvent)
	{
		// Re-render to sync tethers
		this._FlowView.renderFlow();
		this._FlowView.marshalFromView();

		if (this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowView.flowData);
		}

		this._setState(INTERACTION_STATES.IDLE);
		this._ResizePanelHash = null;
	}

	// ---- Node Resizing ----
	// Drag the bottom-right handle (rendered on the selected node when the flow's
	// EnableNodeResizing option is on) to set Width/Height. Deltas are divided by the
	// zoom so the corner tracks the pointer at any zoom level.

	_startNodeResize(pEvent, pTarget)
	{
		if (!this._FlowView.options.EnableNodeResizing) return;

		let tmpNodeHash = this._getNodeHash(pTarget);
		if (!tmpNodeHash) return;

		let tmpNode = this._FlowView.getNode(tmpNodeHash);
		if (!tmpNode) return;

		this._setState(INTERACTION_STATES.RESIZING_NODE);
		this._ResizeNodeHash = tmpNodeHash;
		this._ResizeNodeStartX = pEvent.clientX;
		this._ResizeNodeStartY = pEvent.clientY;
		this._ResizeNodeStartWidth = tmpNode.Width || 180;
		this._ResizeNodeStartHeight = tmpNode.Height || 80;
		if (pEvent.stopPropagation) pEvent.stopPropagation();
	}

	_onNodeResize(pEvent)
	{
		if (!this._ResizeNodeHash) return;

		let tmpVS = this._FlowView.viewState;
		let tmpDX = (pEvent.clientX - this._ResizeNodeStartX) / tmpVS.Zoom;
		let tmpDY = (pEvent.clientY - this._ResizeNodeStartY) / tmpVS.Zoom;

		let tmpMinW = this._FlowView.options.MinimumNodeWidth || 48;
		let tmpMinH = this._FlowView.options.MinimumNodeHeight || 32;

		let tmpNode = this._FlowView.getNode(this._ResizeNodeHash);
		if (!tmpNode) return;

		tmpNode.Width = Math.max(tmpMinW, this._snapToGrid(Math.round(this._ResizeNodeStartWidth + tmpDX)));
		tmpNode.Height = Math.max(tmpMinH, this._snapToGrid(Math.round(this._ResizeNodeStartHeight + tmpDY)));

		// Re-render so the body (and any HTML/image content) reflows to the new size.
		this._FlowView.renderFlow();
	}

	_endNodeResize(pEvent)
	{
		this._FlowView.renderFlow();
		this._FlowView.marshalFromView();

		let tmpNode = this._FlowView.getNode(this._ResizeNodeHash);
		if (tmpNode && this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onNodeResized', tmpNode);
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowView.flowData);
		}

		this._setState(INTERACTION_STATES.IDLE);
		this._ResizeNodeHash = null;
	}

	// ---- Content-frame editing (drag the view-area box) ----

	_startFrameResize(pEvent, pTarget)
	{
		if (!this._FlowView.options.EnableFrameEditing) return;
		let tmpFrame = this._FlowView._resolveFrame();
		if (!tmpFrame) return;

		this._setState(INTERACTION_STATES.RESIZING_FRAME);
		this._FrameDragEdge = (pTarget && pTarget.getAttribute) ? pTarget.getAttribute('data-frame-edge') : null;
		this._FrameStart = { X: tmpFrame.X || 0, Y: tmpFrame.Y || 0, Width: tmpFrame.Width, Height: tmpFrame.Height };
		this._FrameStartPointerX = pEvent.clientX;
		this._FrameStartPointerY = pEvent.clientY;
		if (pEvent.stopPropagation) pEvent.stopPropagation();
	}

	_startFrameMove(pEvent, pTarget)
	{
		if (!this._FlowView.options.EnableFrameEditing) return;
		let tmpFrame = this._FlowView._resolveFrame();
		if (!tmpFrame) return;

		this._setState(INTERACTION_STATES.MOVING_FRAME);
		this._FrameStart = { X: tmpFrame.X || 0, Y: tmpFrame.Y || 0, Width: tmpFrame.Width, Height: tmpFrame.Height };
		this._FrameStartPointerX = pEvent.clientX;
		this._FrameStartPointerY = pEvent.clientY;
		if (pEvent.stopPropagation) pEvent.stopPropagation();
	}

	_onFrameResize(pEvent)
	{
		if (!this._FrameStart) return;
		let tmpVS = this._FlowView.viewState;
		let tmpDX = (pEvent.clientX - this._FrameStartPointerX) / tmpVS.Zoom;
		let tmpDY = (pEvent.clientY - this._FrameStartPointerY) / tmpVS.Zoom;
		let tmpMin = this._FlowView.options.MinimumFrameSize || 40;
		this._applyFrameEdit(PictServiceFlowInteractionManager.computeFrameResize(this._FrameStart, this._FrameDragEdge, tmpDX, tmpDY, tmpMin));
	}

	_onFrameMove(pEvent)
	{
		if (!this._FrameStart) return;
		let tmpVS = this._FlowView.viewState;
		let tmpDX = (pEvent.clientX - this._FrameStartPointerX) / tmpVS.Zoom;
		let tmpDY = (pEvent.clientY - this._FrameStartPointerY) / tmpVS.Zoom;
		this._applyFrameEdit(
			{
				X: Math.round(this._FrameStart.X + tmpDX),
				Y: Math.round(this._FrameStart.Y + tmpDY),
				Width: this._FrameStart.Width,
				Height: this._FrameStart.Height
			});
	}

	_applyFrameEdit(pBox)
	{
		let tmpFrame = this._FlowView._resolveFrame();
		if (!tmpFrame) return;
		tmpFrame.X = pBox.X;
		tmpFrame.Y = pBox.Y;
		tmpFrame.Width = pBox.Width;
		tmpFrame.Height = pBox.Height;
		this._FlowView._applyFrame();
	}

	_endFrameEdit(pEvent)
	{
		let tmpFrame = this._FlowView._resolveFrame();
		this._FlowView._applyFrame();
		if (typeof this._FlowView.marshalFromView === 'function') this._FlowView.marshalFromView();
		if (this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onFrameChanged', tmpFrame);
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowView.flowData);
		}
		this._setState(INTERACTION_STATES.IDLE);
		this._FrameDragEdge = null;
		this._FrameStart = null;
	}

	/**
	 * Pure box-resize math for the content frame: given the starting box, which edge is being
	 * dragged ('n'|'e'|'s'|'w'), and the pointer delta in content units, return the new box,
	 * clamped to a minimum size with the opposite edge held fixed. Unit tested without a DOM.
	 * @param {Object} pStart - { X, Y, Width, Height }
	 * @param {string} pEdge
	 * @param {number} pDX
	 * @param {number} pDY
	 * @param {number} [pMinSize]
	 * @returns {{X:number, Y:number, Width:number, Height:number}}
	 */
	static computeFrameResize(pStart, pEdge, pDX, pDY, pMinSize)
	{
		let tmpMin = (typeof pMinSize === 'number') ? pMinSize : 40;
		let tmpX = pStart.X;
		let tmpY = pStart.Y;
		let tmpW = pStart.Width;
		let tmpH = pStart.Height;
		switch (pEdge)
		{
			case 'n':
			{
				let tmpNewY = pStart.Y + pDY;
				let tmpNewH = pStart.Height - pDY;
				if (tmpNewH < tmpMin) { tmpNewY = pStart.Y + (pStart.Height - tmpMin); tmpNewH = tmpMin; }
				tmpY = Math.round(tmpNewY);
				tmpH = Math.round(tmpNewH);
				break;
			}
			case 's':
				tmpH = Math.round(Math.max(tmpMin, pStart.Height + pDY));
				break;
			case 'e':
				tmpW = Math.round(Math.max(tmpMin, pStart.Width + pDX));
				break;
			case 'w':
			{
				let tmpNewX = pStart.X + pDX;
				let tmpNewW = pStart.Width - pDX;
				if (tmpNewW < tmpMin) { tmpNewX = pStart.X + (pStart.Width - tmpMin); tmpNewW = tmpMin; }
				tmpX = Math.round(tmpNewX);
				tmpW = Math.round(tmpNewW);
				break;
			}
		}
		return { X: tmpX, Y: tmpY, Width: tmpW, Height: tmpH };
	}

	// ---- Node Rotation ----
	// Drag the grip on the arm above the selected node (rendered when EnableNodeRotation is on) to set
	// the node's Rotation in degrees: the card's top points toward the pointer. Hold Shift to snap to 15
	// degrees. The properties-panel rotation control still works; this is just a second, inline way.

	_startNodeRotate(pEvent, pTarget)
	{
		if (!this._FlowView.options.EnableNodeRotation) return;
		if (this._isReadOnly()) return;

		let tmpNodeHash = this._getNodeHash(pTarget);
		if (!tmpNodeHash) return;
		if (!this._FlowView.getNode(tmpNodeHash)) return;

		this._setState(INTERACTION_STATES.ROTATING_NODE);
		this._RotateNodeHash = tmpNodeHash;
		if (pEvent.stopPropagation) pEvent.stopPropagation();
	}

	_onNodeRotate(pEvent)
	{
		if (!this._RotateNodeHash) return;

		let tmpNode = this._FlowView.getNode(this._RotateNodeHash);
		if (!tmpNode) return;

		let tmpCenterX = (tmpNode.X || 0) + (tmpNode.Width || 0) / 2;
		let tmpCenterY = (tmpNode.Y || 0) + (tmpNode.Height || 0) / 2;

		// Pointer in content (SVG) space so pan/zoom do not skew the angle.
		let tmpPoint = this._FlowView.screenToSVGCoords(pEvent.clientX, pEvent.clientY);
		let tmpAngle = (Math.atan2(tmpPoint.y - tmpCenterY, tmpPoint.x - tmpCenterX) * 180 / Math.PI) + 90;

		// Shift snaps to 15-degree increments.
		if (pEvent.shiftKey) { tmpAngle = Math.round(tmpAngle / 15) * 15; }

		// Normalize to [0, 360).
		tmpAngle = ((Math.round(tmpAngle) % 360) + 360) % 360;
		tmpNode.Rotation = tmpAngle;

		this._FlowView.renderFlow();
	}

	_endNodeRotate(pEvent)
	{
		this._FlowView.renderFlow();
		this._FlowView.marshalFromView();

		let tmpNode = this._FlowView.getNode(this._RotateNodeHash);
		if (tmpNode && this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onNodeRotated', tmpNode);
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowView.flowData);
		}

		this._setState(INTERACTION_STATES.IDLE);
		this._RotateNodeHash = null;
	}

	// ---- Handle Dragging ----

	_startHandleDrag(pEvent, pConnectionHash, pPanelHash, pHandleType, pIsTether)
	{
		this._setState(INTERACTION_STATES.DRAGGING_HANDLE);
		this._DragHandleConnectionHash = pConnectionHash;
		this._DragHandlePanelHash = pPanelHash;
		this._DragHandleType = pHandleType;
		this._DragHandleIsTether = pIsTether;
		this._DragStartX = pEvent.clientX;
		this._DragStartY = pEvent.clientY;	}

	_onHandleDrag(pEvent)
	{
		let tmpCoords = this._FlowView.screenToSVGCoords(pEvent.clientX, pEvent.clientY);

		if (this._DragHandleIsTether)
		{
			this._FlowView.updateTetherHandle(
				this._DragHandlePanelHash,
				this._DragHandleType,
				tmpCoords.x,
				tmpCoords.y
			);
		}
		else
		{
			this._FlowView.updateConnectionHandle(
				this._DragHandleConnectionHash,
				this._DragHandleType,
				tmpCoords.x,
				tmpCoords.y
			);
		}
	}

	_endHandleDrag(pEvent)
	{
		this._FlowView.renderFlow();
		this._FlowView.marshalFromView();

		if (this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowView.flowData);

			if (this._DragHandleIsTether)
			{
				let tmpPanel = this._FlowView._FlowData.OpenPanels.find((pPanel) => pPanel.Hash === this._DragHandlePanelHash);
				if (tmpPanel)
				{
					this._FlowView._EventHandlerProvider.fireEvent('onTetherHandleMoved', tmpPanel);
				}
			}
			else
			{
				let tmpConnection = this._FlowView.getConnection(this._DragHandleConnectionHash);
				if (tmpConnection)
				{
					this._FlowView._EventHandlerProvider.fireEvent('onConnectionHandleMoved', tmpConnection);
				}
			}
		}

		this._setState(INTERACTION_STATES.IDLE);
		this._DragHandleConnectionHash = null;
		this._DragHandlePanelHash = null;
		this._DragHandleType = null;
		this._DragHandleIsTether = false;
	}

	// ---- Right-Click Handle Add/Remove ----

	/**
	 * Add a bezier handle to a connection at the right-click position.
	 * @param {Element} pTarget - The SVG element that was right-clicked
	 * @param {MouseEvent} pEvent - The contextmenu event
	 */
	_addBezierHandle(pTarget, pEvent)
	{
		let tmpConnectionHash = this._getConnectionHash(pTarget);
		if (!tmpConnectionHash) return;

		// Select the connection so handle circles are rendered after the re-render
		this._FlowView.selectConnection(tmpConnectionHash);

		let tmpCoords = this._FlowView.screenToSVGCoords(pEvent.clientX, pEvent.clientY);
		this._FlowView.addConnectionHandle(tmpConnectionHash, tmpCoords.x, tmpCoords.y);
	}

	/**
	 * Remove a bezier handle from a connection.
	 * @param {Element} pTarget - The handle SVG element that was right-clicked
	 */
	_removeBezierHandle(pTarget)
	{
		let tmpConnectionHash = this._getConnectionHash(pTarget);
		if (!tmpConnectionHash) return;

		let tmpHandleType = pTarget.getAttribute('data-handle-type');
		if (!tmpHandleType || !tmpHandleType.startsWith('bezier-handle-')) return;

		let tmpIndex = parseInt(tmpHandleType.replace('bezier-handle-', ''), 10);
		if (isNaN(tmpIndex)) return;

		this._FlowView.removeConnectionHandle(tmpConnectionHash, tmpIndex);
	}

	/**
	 * Add a bezier handle to a tether.
	 * @param {Element} pTarget - The tether SVG element that was right-clicked or double-clicked
	 * @param {Event} pEvent - The mouse event (for coordinate extraction)
	 */
	_addTetherBezierHandle(pTarget, pEvent)
	{
		let tmpPanelHash = this._getPanelHash(pTarget);
		if (!tmpPanelHash) return;

		// Select the tether so handles render after re-render
		this._FlowView.selectTether(tmpPanelHash);

		let tmpCoords = this._FlowView.screenToSVGCoords(pEvent.clientX, pEvent.clientY);
		this._FlowView.addTetherHandle(tmpPanelHash, tmpCoords.x, tmpCoords.y);
	}

	/**
	 * Remove a bezier handle from a tether.
	 * @param {Element} pTarget - The tether handle SVG element that was right-clicked
	 */
	_removeTetherBezierHandle(pTarget)
	{
		let tmpPanelHash = this._getPanelHash(pTarget);
		if (!tmpPanelHash) return;

		let tmpHandleType = pTarget.getAttribute('data-handle-type');
		if (!tmpHandleType || !tmpHandleType.startsWith('bezier-handle-')) return;

		let tmpIndex = parseInt(tmpHandleType.replace('bezier-handle-', ''), 10);
		if (isNaN(tmpIndex)) return;

		this._FlowView.removeTetherHandle(tmpPanelHash, tmpIndex);
	}

	// ---- Line Mode Toggling ----

	_toggleConnectionLineMode(pConnectionHash)
	{
		let tmpConnection = this._FlowView.getConnection(pConnectionHash);
		if (!tmpConnection) return;

		if (!tmpConnection.Data) tmpConnection.Data = {};

		let tmpCurrentMode = tmpConnection.Data.LineMode || 'bezier';
		tmpConnection.Data.LineMode = (tmpCurrentMode === 'bezier') ? 'orthogonal' : 'bezier';

		// Reset handle positions when switching modes
		tmpConnection.Data.HandleCustomized = false;
		tmpConnection.Data.BezierHandles = [];
		tmpConnection.Data.BezierHandleX = null;
		tmpConnection.Data.BezierHandleY = null;
		tmpConnection.Data.OrthoCorner1X = null;
		tmpConnection.Data.OrthoCorner1Y = null;
		tmpConnection.Data.OrthoCorner2X = null;
		tmpConnection.Data.OrthoCorner2Y = null;
		tmpConnection.Data.OrthoMidOffset = 0;

		this._FlowView.renderFlow();
		this._FlowView.marshalFromView();

		if (this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onConnectionModeChanged', tmpConnection);
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowView.flowData);
		}
	}

	_toggleTetherLineMode(pPanelHash)
	{
		let tmpPanel = this._FlowView._FlowData.OpenPanels.find((pPanel) => pPanel.Hash === pPanelHash);
		if (!tmpPanel) return;

		if (this._FlowView._TetherService)
		{
			this._FlowView._TetherService.toggleLineMode(tmpPanel);
		}

		this._FlowView.renderFlow();
		this._FlowView.marshalFromView();

		if (this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onTetherModeChanged', tmpPanel);
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowView.flowData);
		}
	}

	// ---- Tether Selection ----

	_selectTether(pTarget)
	{
		let tmpPanelHash = this._getPanelHash(pTarget);
		if (tmpPanelHash)
		{
			this._FlowView.selectTether(tmpPanelHash);
		}
	}

	// ---- Connection Creation ----

	_startConnection(pEvent, pTarget)
	{
		if (!this._FlowView.options.EnableConnectionCreation) return;

		let tmpNodeHash = pTarget.getAttribute('data-node-hash');
		let tmpPortHash = pTarget.getAttribute('data-port-hash');
		let tmpPortDirection = pTarget.getAttribute('data-port-direction');

		if (!tmpNodeHash || !tmpPortHash) return;

		// A connection normally starts from an output port; undirected mode lets any port start one.
		if (!this._FlowView.options.EnableUndirectedConnections && tmpPortDirection !== 'output')
		{
			return;
		}

		this._setState(INTERACTION_STATES.CONNECTING);
		this._ConnectSourceNodeHash = tmpNodeHash;
		this._ConnectSourcePortHash = tmpPortHash;

		let tmpPortPos = this._FlowView.getPortPosition(tmpNodeHash, tmpPortHash);
		if (tmpPortPos)
		{
			this._ConnectDragLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			this._ConnectDragLine.setAttribute('class', 'pict-flow-drag-connection');
			this._ConnectDragLine.setAttribute('d', `M ${tmpPortPos.x} ${tmpPortPos.y} L ${tmpPortPos.x} ${tmpPortPos.y}`);
			this._FlowView._ViewportElement.appendChild(this._ConnectDragLine);
		}

		pEvent.stopPropagation();
	}

	_onConnectionDrag(pEvent)
	{
		if (!this._ConnectDragLine) return;

		let tmpSourcePos = this._FlowView.getPortPosition(this._ConnectSourceNodeHash, this._ConnectSourcePortHash);
		if (!tmpSourcePos) return;

		let tmpEndCoords = this._FlowView.screenToSVGCoords(pEvent.clientX, pEvent.clientY);

		let tmpDX = Math.abs(tmpEndCoords.x - tmpSourcePos.x) * 0.5;
		let tmpPath = `M ${tmpSourcePos.x} ${tmpSourcePos.y} C ${tmpSourcePos.x + tmpDX} ${tmpSourcePos.y}, ${tmpEndCoords.x - tmpDX} ${tmpEndCoords.y}, ${tmpEndCoords.x} ${tmpEndCoords.y}`;
		this._ConnectDragLine.setAttribute('d', tmpPath);
	}

	_endConnection(pEvent)
	{
		if (this._ConnectDragLine && this._ConnectDragLine.parentNode)
		{
			this._ConnectDragLine.parentNode.removeChild(this._ConnectDragLine);
		}
		this._ConnectDragLine = null;

		let tmpTarget = document.elementFromPoint(pEvent.clientX, pEvent.clientY);
		if (tmpTarget)
		{
			let tmpTargetPortHash = tmpTarget.getAttribute('data-port-hash');
			let tmpTargetNodeHash = tmpTarget.getAttribute('data-node-hash');
			let tmpTargetPortDirection = tmpTarget.getAttribute('data-port-direction');

			// A connection normally completes on an input port; undirected mode lets any port receive it.
			if (tmpTargetPortHash && tmpTargetNodeHash && (this._FlowView.options.EnableUndirectedConnections || tmpTargetPortDirection === 'input'))
			{
				this._FlowView.addConnection(
					this._ConnectSourceNodeHash,
					this._ConnectSourcePortHash,
					tmpTargetNodeHash,
					tmpTargetPortHash
				);
			}
		}

		this._setState(INTERACTION_STATES.IDLE);
		this._ConnectSourceNodeHash = null;
		this._ConnectSourcePortHash = null;
	}

	_cancelConnection()
	{
		if (this._ConnectDragLine && this._ConnectDragLine.parentNode)
		{
			this._ConnectDragLine.parentNode.removeChild(this._ConnectDragLine);
		}
		this._ConnectDragLine = null;

		this._setState(INTERACTION_STATES.IDLE);
		this._ConnectSourceNodeHash = null;
		this._ConnectSourcePortHash = null;
	}

	// ---- Panning ----

	_startPanning(pEvent)
	{
		this._FlowView.deselectAll();

		this._setState(INTERACTION_STATES.PANNING);
		this._PanStartX = pEvent.clientX;
		this._PanStartY = pEvent.clientY;
		this._PanStartPanX = this._FlowView.viewState.PanX;
		this._PanStartPanY = this._FlowView.viewState.PanY;
	}

	_onPan(pEvent)
	{
		let tmpDX = pEvent.clientX - this._PanStartX;
		let tmpDY = pEvent.clientY - this._PanStartY;

		this._FlowView.viewState.PanX = this._PanStartPanX + tmpDX;
		this._FlowView.viewState.PanY = this._PanStartPanY + tmpDY;

		this._FlowView.updateViewportTransform();
	}

	_endPanning(pEvent)
	{		this._setState(INTERACTION_STATES.IDLE);
	}

	// ---- Marquee selection (multi-select) ----
	// A rubber-band rectangle drawn in world coordinates (inside the transformed viewport group), so it
	// tracks the nodes under it regardless of pan/zoom. On release every node whose box intersects the
	// rectangle is selected; a rectangle too small to be a deliberate drag is treated as a click that
	// clears the selection.

	_startMarquee(pEvent)
	{
		let tmpStart = this._FlowView.screenToSVGCoords(pEvent.clientX, pEvent.clientY);
		this._MarqueeStartX = tmpStart.x;
		this._MarqueeStartY = tmpStart.y;
		this._MarqueeCurrentX = tmpStart.x;
		this._MarqueeCurrentY = tmpStart.y;
		this._setState(INTERACTION_STATES.MARQUEE);

		let tmpRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		tmpRect.setAttribute('class', 'pict-flow-marquee');
		tmpRect.setAttribute('x', tmpStart.x);
		tmpRect.setAttribute('y', tmpStart.y);
		tmpRect.setAttribute('width', 0);
		tmpRect.setAttribute('height', 0);
		this._MarqueeElement = tmpRect;
		if (this._FlowView._ViewportElement) { this._FlowView._ViewportElement.appendChild(tmpRect); }
	}

	_onMarquee(pEvent)
	{
		if (!this._MarqueeElement) return;
		let tmpCur = this._FlowView.screenToSVGCoords(pEvent.clientX, pEvent.clientY);
		this._MarqueeCurrentX = tmpCur.x;
		this._MarqueeCurrentY = tmpCur.y;
		let tmpX = Math.min(this._MarqueeStartX, tmpCur.x);
		let tmpY = Math.min(this._MarqueeStartY, tmpCur.y);
		this._MarqueeElement.setAttribute('x', tmpX);
		this._MarqueeElement.setAttribute('y', tmpY);
		this._MarqueeElement.setAttribute('width', Math.abs(tmpCur.x - this._MarqueeStartX));
		this._MarqueeElement.setAttribute('height', Math.abs(tmpCur.y - this._MarqueeStartY));
	}

	_endMarquee(pEvent)
	{
		let tmpX = Math.min(this._MarqueeStartX, this._MarqueeCurrentX);
		let tmpY = Math.min(this._MarqueeStartY, this._MarqueeCurrentY);
		let tmpW = Math.abs(this._MarqueeCurrentX - this._MarqueeStartX);
		let tmpH = Math.abs(this._MarqueeCurrentY - this._MarqueeStartY);

		if (this._MarqueeElement && this._MarqueeElement.parentNode)
		{
			this._MarqueeElement.parentNode.removeChild(this._MarqueeElement);
		}
		this._MarqueeElement = null;
		this._setState(INTERACTION_STATES.IDLE);

		// Too small to be a deliberate drag: treat as a background click and clear the selection.
		if (tmpW < 4 && tmpH < 4)
		{
			this._FlowView.deselectAll();
			return;
		}

		let tmpHits = [];
		let tmpNodes = this._FlowView._FlowData.Nodes || [];
		let tmpDefaultW = this._FlowView.options.DefaultNodeWidth || 180;
		let tmpDefaultH = this._FlowView.options.DefaultNodeHeight || 80;
		for (let i = 0; i < tmpNodes.length; i++)
		{
			let tmpN = tmpNodes[i];
			let tmpNW = (typeof tmpN.Width === 'number') ? tmpN.Width : tmpDefaultW;
			let tmpNH = (typeof tmpN.Height === 'number') ? tmpN.Height : tmpDefaultH;
			let tmpIntersects = !(tmpN.X > tmpX + tmpW || (tmpN.X + tmpNW) < tmpX || tmpN.Y > tmpY + tmpH || (tmpN.Y + tmpNH) < tmpY);
			if (tmpIntersects) { tmpHits.push(tmpN.Hash); }
		}
		this._FlowView.selectNodes(tmpHits);
	}

	// ---- Connection Selection ----

	_selectConnection(pTarget)
	{
		let tmpConnectionHash = this._getConnectionHash(pTarget);
		if (tmpConnectionHash)
		{
			this._FlowView.selectConnection(tmpConnectionHash);
		}
	}

	// ---- Utilities ----

	_getElementType(pTarget)
	{
		if (!pTarget) return 'background';

		let tmpType = pTarget.getAttribute ? pTarget.getAttribute('data-element-type') : null;
		if (tmpType) return tmpType;

		let tmpParent = pTarget.parentElement;
		let tmpDepth = 0;
		while (tmpParent && tmpDepth < 5)
		{
			tmpType = tmpParent.getAttribute ? tmpParent.getAttribute('data-element-type') : null;
			if (tmpType) return tmpType;
			tmpParent = tmpParent.parentElement;
			tmpDepth++;
		}

		return 'background';
	}

	_getNodeHash(pTarget)
	{
		if (!pTarget) return null;

		let tmpHash = pTarget.getAttribute ? pTarget.getAttribute('data-node-hash') : null;
		if (tmpHash) return tmpHash;

		let tmpParent = pTarget.parentElement;
		let tmpDepth = 0;
		while (tmpParent && tmpDepth < 5)
		{
			tmpHash = tmpParent.getAttribute ? tmpParent.getAttribute('data-node-hash') : null;
			if (tmpHash) return tmpHash;
			tmpParent = tmpParent.parentElement;
			tmpDepth++;
		}

		return null;
	}

	_getPanelHash(pTarget)
	{
		if (!pTarget) return null;

		let tmpHash = pTarget.getAttribute ? pTarget.getAttribute('data-panel-hash') : null;
		if (tmpHash) return tmpHash;

		let tmpParent = pTarget.parentElement;
		let tmpDepth = 0;
		while (tmpParent && tmpDepth < 5)
		{
			tmpHash = tmpParent.getAttribute ? tmpParent.getAttribute('data-panel-hash') : null;
			if (tmpHash) return tmpHash;
			tmpParent = tmpParent.parentElement;
			tmpDepth++;
		}

		return null;
	}

	_getConnectionHash(pTarget)
	{
		if (!pTarget) return null;

		let tmpHash = pTarget.getAttribute ? pTarget.getAttribute('data-connection-hash') : null;
		if (tmpHash) return tmpHash;

		let tmpParent = pTarget.parentElement;
		let tmpDepth = 0;
		while (tmpParent && tmpDepth < 5)
		{
			tmpHash = tmpParent.getAttribute ? tmpParent.getAttribute('data-connection-hash') : null;
			if (tmpHash) return tmpHash;
			tmpParent = tmpParent.parentElement;
			tmpDepth++;
		}

		return null;
	}
}

module.exports = PictServiceFlowInteractionManager;
module.exports.INTERACTION_STATES = INTERACTION_STATES;
