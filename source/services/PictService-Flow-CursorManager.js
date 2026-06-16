const libFableServiceProviderBase = require('fable-serviceproviderbase');

/**
 * PictService-Flow-CursorManager
 *
 * Owns the canvas pointer cursor as a single, intentional concern. The cursor is
 * a pure function of the interaction state machine (InteractionManager._State)
 * plus the view mode (read-only, read-only navigation, whether panning is
 * enabled). It is applied through ONE chokepoint: a `data-flow-cursor` token
 * attribute on the SVG element, which the CSS maps to a real cursor.
 *
 * This replaces the previous approach (a base `cursor: grab` on the SVG plus
 * `panning` / `connecting` class toggles scattered across the InteractionManager)
 * so cursor behavior is derived from state rather than maintained by hand at
 * every interaction site. Element-scoped hover cursors (ports, handles, panel
 * chrome, toolbar buttons) stay on those elements -- they are correctly scoped
 * and win for their own element regardless of the canvas cursor.
 *
 * To extend: add a state-to-token case in resolveCursor and a CSS rule for the
 * token. The InteractionManager calls update() on every state transition (via
 * its _setState), and the view calls it when the mode changes.
 */
class PictServiceFlowCursorManager extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictServiceFlowCursorManager';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;
	}

	/**
	 * Map an interaction state + mode to a cursor token. Pure: no DOM, no side
	 * effects, so it is unit testable.
	 *
	 * @param {Object} pContext - { state, readOnly, navigating, panningEnabled }
	 * @returns {string} a cursor token: 'default' | 'grab' | 'grabbing' | 'crosshair' | 'resize'
	 */
	resolveCursor(pContext)
	{
		let tmpContext = pContext || {};

		switch (tmpContext.state)
		{
			case 'panning':
			case 'dragging-node':
			case 'dragging-panel':
			case 'dragging-handle':
			case 'rotating-node':
				return 'grabbing';

			case 'resizing-node':
			case 'resizing-panel':
				return 'resize';

			case 'connecting':
			case 'marquee':
				return 'crosshair';

			default:
				// Idle: the canvas cursor signals whether the background can be grabbed.
				// Read-only is static unless navigation (the hand toggle) is on; in edit
				// mode the background is grabbable when panning is enabled.
				if (tmpContext.readOnly)
				{
					return tmpContext.navigating ? 'grab' : 'default';
				}
				return tmpContext.panningEnabled ? 'grab' : 'default';
		}
	}

	/**
	 * Gather the current state + mode and apply the resolved cursor token. Called
	 * by the InteractionManager on every state transition and by the view on mode
	 * changes. Safe to call before the SVG exists (no-op).
	 */
	update()
	{
		if (!this._FlowView)
		{
			return;
		}

		let tmpInteractionManager = this._FlowView._InteractionManager;
		let tmpToken = this.resolveCursor(
			{
				state: (tmpInteractionManager && tmpInteractionManager._State) ? tmpInteractionManager._State : 'idle',
				readOnly: (typeof this._FlowView.isReadOnly === 'function') ? this._FlowView.isReadOnly() : false,
				navigating: (typeof this._FlowView.isReadOnlyNavigation === 'function') ? this._FlowView.isReadOnlyNavigation() : false,
				panningEnabled: this._FlowView.options ? (this._FlowView.options.EnablePanning !== false) : true
			});

		this.apply(tmpToken);
	}

	/**
	 * Write the cursor token to the SVG element. The CSS maps
	 * `.pict-flow-svg[data-flow-cursor="<token>"]` to a real cursor.
	 * @param {string} pToken
	 */
	apply(pToken)
	{
		let tmpElement = this._FlowView ? this._FlowView._SVGElement : null;
		if (tmpElement && typeof tmpElement.setAttribute === 'function')
		{
			tmpElement.setAttribute('data-flow-cursor', pToken);
		}
	}
}

module.exports = PictServiceFlowCursorManager;
