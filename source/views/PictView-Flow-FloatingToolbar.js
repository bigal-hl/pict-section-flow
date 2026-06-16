const libPictView = require('pict-view');

const _DefaultConfiguration =
{
	ViewIdentifier: 'Flow-FloatingToolbar',

	DefaultRenderable: 'Flow-FloatingToolbar-Content',
	DefaultDestinationAddress: '#Flow-FloatingToolbar-Container',

	AutoRender: false,

	FlowViewIdentifier: 'Pict-Flow',

	// Host-supplied buttons (mirrors the docked toolbar's ToolbarExtraButtons), so floating mode keeps
	// the same custom buttons. Each entry is { Hash, Icon, Label?, Tooltip?, Active? }.
	ToolbarExtraButtons: [],

	CSS: false,

	Templates:
	[
		{
			Hash: 'Flow-FloatingToolbar-Template',
			// Inline handlers route to the floating toolbar view via _Pict.views
			// (see _handleButtonClick / _startDrag / _toggleCollapse).
			Template: /*html*/`
<div class="pict-flow-floating-toolbar" id="Flow-FloatingToolbar-{~D:Record.FlowViewIdentifier~}">
	<div class="pict-flow-floating-grip" id="Flow-FloatingGrip-{~D:Record.FlowViewIdentifier~}" title="Drag to move · Double-click to collapse"
		onmousedown="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._FloatingToolbarView._startDrag(event)"
		ondblclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._FloatingToolbarView._handleGripDoubleClick(event)">
		<span id="Flow-FloatingIcon-grip-{~D:Record.FlowViewIdentifier~}"></span>
	</div>
	<button class="pict-flow-floating-btn" data-flow-action="add-node" title="Add Node"
		onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._FloatingToolbarView._handleButtonClick('add-node')">
		<span id="Flow-FloatingIcon-plus-{~D:Record.FlowViewIdentifier~}"></span>
	</button>
	<button class="pict-flow-floating-btn" data-flow-action="cards-popup" title="Cards"
		onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._FloatingToolbarView._handleButtonClick('cards-popup')">
		<span id="Flow-FloatingIcon-cards-{~D:Record.FlowViewIdentifier~}"></span>
	</button>
	<button class="pict-flow-floating-btn" data-flow-action="delete-selected" title="Delete Selected"
		onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._FloatingToolbarView._handleButtonClick('delete-selected')">
		<span id="Flow-FloatingIcon-trash-{~D:Record.FlowViewIdentifier~}"></span>
	</button>
	<div class="pict-flow-floating-separator"></div>
	<button class="pict-flow-floating-btn" data-flow-action="zoom-in" title="Zoom In"
		onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._FloatingToolbarView._handleButtonClick('zoom-in')">
		<span id="Flow-FloatingIcon-zoom-in-{~D:Record.FlowViewIdentifier~}"></span>
	</button>
	<button class="pict-flow-floating-btn" data-flow-action="zoom-out" title="Zoom Out"
		onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._FloatingToolbarView._handleButtonClick('zoom-out')">
		<span id="Flow-FloatingIcon-zoom-out-{~D:Record.FlowViewIdentifier~}"></span>
	</button>
	<button class="pict-flow-floating-btn" data-flow-action="zoom-fit" title="Fit to View"
		onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._FloatingToolbarView._handleButtonClick('zoom-fit')">
		<span id="Flow-FloatingIcon-zoom-fit-{~D:Record.FlowViewIdentifier~}"></span>
	</button>
	<div class="pict-flow-floating-separator"></div>
	<button class="pict-flow-floating-btn" data-flow-action="auto-layout" title="Auto Layout"
		onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._FloatingToolbarView._handleButtonClick('auto-layout')">
		<span id="Flow-FloatingIcon-auto-layout-{~D:Record.FlowViewIdentifier~}"></span>
	</button>
	<button class="pict-flow-floating-btn" data-flow-action="layout-popup" title="Layout"
		onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._FloatingToolbarView._handleButtonClick('layout-popup')">
		<span id="Flow-FloatingIcon-layout-{~D:Record.FlowViewIdentifier~}"></span>
	</button>
	<button class="pict-flow-floating-btn" data-flow-action="fullscreen" title="Toggle Fullscreen"
		onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._FloatingToolbarView._handleButtonClick('fullscreen')">
		<span id="Flow-FloatingIcon-fullscreen-{~D:Record.FlowViewIdentifier~}"></span>
	</button>
	{~TS:Flow-FloatingToolbar-Extra-Button:Record.ToolbarExtraButtons~}
	<div class="pict-flow-floating-separator"></div>
	<button class="pict-flow-floating-btn" data-flow-action="dock-toolbar" title="Dock Toolbar"
		onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._FloatingToolbarView._handleButtonClick('dock-toolbar')">
		<span id="Flow-FloatingIcon-dock-{~D:Record.FlowViewIdentifier~}"></span>
	</button>
</div>
`
		},
		{
			Hash: 'Flow-FloatingToolbar-Extra-Button',
			// Icon-only host button (the floating toolbar is compact). Icon span
			// is filled post-render by _populateIcons (keyed by Hash).
			Template: /*html*/`<button class="pict-flow-floating-btn{~D:Record.ToggleClass~}{~D:Record.ActiveClass~}" title="{~D:Record.Tooltip~}" data-flow-action="extra" data-extra-hash="{~D:Record.Hash~}"
	onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._FloatingToolbarView._handleExtraClick('{~D:Record.Hash~}', this)">
	<span id="Flow-FloatingExtraIcon-{~D:Record.Hash~}-{~D:Record.FlowViewIdentifier~}"></span>
	<span class="pict-flow-toolbar-btn-led" aria-hidden="true"></span>
</button>`
		}
	],

	Renderables:
	[
		{
			RenderableHash: 'Flow-FloatingToolbar-Content',
			TemplateHash: 'Flow-FloatingToolbar-Template',
			DestinationAddress: '#Flow-FloatingToolbar-Container',
			RenderMethod: 'replace'
		}
	]
};

class PictViewFlowFloatingToolbar extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultConfiguration)), pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'PictViewFlowFloatingToolbar';

		this._ToolbarView = null;
		this._FlowView = null;

		this._IsCollapsed = false;

		this._IsDragging = false;
		this._DragStartX = 0;
		this._DragStartY = 0;
		this._DragStartLeft = 0;
		this._DragStartTop = 0;

		this._BoundMouseMove = null;
		this._BoundMouseUp = null;
	}

	render(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress)
	{
		// Stamp the owning view onto each host button so its row resolves.
		let tmpExtraButtons = this.options.ToolbarExtraButtons;
		if (Array.isArray(tmpExtraButtons))
		{
			for (let i = 0; i < tmpExtraButtons.length; i++)
			{
				tmpExtraButtons[i].FlowViewIdentifier = this.options.FlowViewIdentifier;
				// Mirror the docked toolbar so toggle buttons show the same status LED here.
				tmpExtraButtons[i].ToggleClass = tmpExtraButtons[i].Toggle ? ' pict-flow-toolbar-btn-toggle' : '';
				tmpExtraButtons[i].ActiveClass = tmpExtraButtons[i].Active ? ' pict-flow-toolbar-btn-active' : '';
			}
		}
		return super.render(pRenderableHash, pRenderDestinationAddress, this.options);
	}

	/**
	 * Handle a click on a host-supplied (ToolbarExtraButtons) floating button.
	 * Routes to the docked toolbar's _handleExtraAction (the single dispatch
	 * point that fires the FlowView's onToolbarButton hook).
	 *
	 * @param {string} pHash - The button's Hash
	 * @param {HTMLElement} pElement - The clicked button element
	 */
	_handleExtraClick(pHash, pElement)
	{
		if (this._ToolbarView)
		{
			this._ToolbarView._handleExtraAction(pHash, pElement);
		}
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;

		// Button clicks and grip drag/dblclick are wired inline in
		// Flow-FloatingToolbar-Template — see _handleButtonClick / _startDrag /
		// _handleGripDoubleClick. Only icon population and option-based
		// pruning happen here.
		this._populateIcons();

		let tmpFloatingToolbar = this.pict.ContentAssignment.getElement(`#Flow-FloatingToolbar-${tmpFlowViewIdentifier}`);
		if (tmpFloatingToolbar.length > 0)
		{
			if (this.options.EnableAddNode === false)
			{
				let tmpAddNodeBtn = tmpFloatingToolbar[0].querySelector('[data-flow-action="add-node"]');
				if (tmpAddNodeBtn)
				{
					tmpAddNodeBtn.remove();
				}
			}
			if (this.options.EnableCardPalette === false)
			{
				let tmpCardsBtn = tmpFloatingToolbar[0].querySelector('[data-flow-action="cards-popup"]');
				if (tmpCardsBtn)
				{
					tmpCardsBtn.remove();
				}
			}
		}

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	/**
	 * Handle a click on a floating toolbar action button. Called from the
	 * inline `onclick` handler on each button.
	 *
	 * @param {string} pAction - Value of the button's data-flow-action attr
	 */
	_handleButtonClick(pAction)
	{
		if (pAction === 'dock-toolbar')
		{
			if (this._ToolbarView)
			{
				this._ToolbarView._setToolbarMode('docked');
			}
			return;
		}
		if (this._ToolbarView)
		{
			this._ToolbarView._handleToolbarAction(pAction);
		}
	}

	/**
	 * Handle a double-click on the grip. Toggles collapsed state and
	 * prevents the event from reaching the surrounding canvas. Called
	 * from the inline `ondblclick` handler.
	 *
	 * @param {Event} pEvent
	 */
	_handleGripDoubleClick(pEvent)
	{
		if (pEvent && typeof pEvent.preventDefault === 'function')
		{
			pEvent.preventDefault();
			pEvent.stopPropagation();
		}
		this._toggleCollapse();
	}

	/**
	 * Populate SVG icons into all floating toolbar button spans.
	 */
	_populateIcons()
	{
		let tmpIconProvider = this._FlowView ? this._FlowView._IconProvider : null;
		if (!tmpIconProvider) return;

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;

		let tmpIconMap =
		{
			'grip': 'grip',
			'plus': 'plus',
			'trash': 'trash',
			'zoom-in': 'zoom-in',
			'zoom-out': 'zoom-out',
			'zoom-fit': 'zoom-fit',
			'auto-layout': 'auto-layout',
			'cards': 'cards',
			'layout': 'layout',
			'fullscreen': 'fullscreen',
			'dock': 'dock'
		};

		let tmpKeys = Object.keys(tmpIconMap);
		for (let i = 0; i < tmpKeys.length; i++)
		{
			let tmpElementId = `Flow-FloatingIcon-${tmpKeys[i]}-${tmpFlowViewIdentifier}`;
			let tmpElements = this.pict.ContentAssignment.getElement(`#${tmpElementId}`);
			if (tmpElements.length > 0)
			{
				tmpElements[0].innerHTML = tmpIconProvider.getIconSVGMarkup(tmpIconMap[tmpKeys[i]], 16);
			}
		}

		// Host-supplied extra buttons (keyed by Hash, icon from the button's Icon key).
		let tmpExtraButtons = this.options.ToolbarExtraButtons;
		if (Array.isArray(tmpExtraButtons))
		{
			for (let i = 0; i < tmpExtraButtons.length; i++)
			{
				let tmpExtraIcon = this.pict.ContentAssignment.getElement(`#Flow-FloatingExtraIcon-${tmpExtraButtons[i].Hash}-${tmpFlowViewIdentifier}`);
				if (tmpExtraIcon.length > 0)
				{
					tmpExtraIcon[0].innerHTML = tmpIconProvider.getIconSVGMarkup(tmpExtraButtons[i].Icon, 16);
				}
			}
		}
	}

	/**
	 * Toggle the floating toolbar between expanded and collapsed (grip-only square) states.
	 */
	_toggleCollapse()
	{
		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpToolbar = this.pict.ContentAssignment.getElement(`#Flow-FloatingToolbar-${tmpFlowViewIdentifier}`);
		if (tmpToolbar.length < 1) return;

		this._IsCollapsed = !this._IsCollapsed;

		if (this._IsCollapsed)
		{
			tmpToolbar[0].classList.add('collapsed');
		}
		else
		{
			tmpToolbar[0].classList.remove('collapsed');
		}
	}

	/**
	 * Start dragging the floating toolbar.
	 * @param {MouseEvent} pEvent
	 */
	_startDrag(pEvent)
	{
		pEvent.preventDefault();

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpToolbar = this.pict.ContentAssignment.getElement(`#Flow-FloatingToolbar-${tmpFlowViewIdentifier}`);
		if (tmpToolbar.length < 1) return;

		let tmpEl = tmpToolbar[0];
		this._IsDragging = true;
		this._DragStartX = pEvent.clientX;
		this._DragStartY = pEvent.clientY;
		this._DragStartLeft = tmpEl.offsetLeft;
		this._DragStartTop = tmpEl.offsetTop;

		this._BoundMouseMove = (pMoveEvent) => { this._onDragMove(pMoveEvent); };
		this._BoundMouseUp = () => { this._onDragEnd(); };

		document.addEventListener('mousemove', this._BoundMouseMove);
		document.addEventListener('mouseup', this._BoundMouseUp);
	}

	/**
	 * Handle drag movement.
	 * @param {MouseEvent} pEvent
	 */
	_onDragMove(pEvent)
	{
		if (!this._IsDragging) return;

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpToolbar = this.pict.ContentAssignment.getElement(`#Flow-FloatingToolbar-${tmpFlowViewIdentifier}`);
		if (tmpToolbar.length < 1) return;

		let tmpEl = tmpToolbar[0];
		let tmpDeltaX = pEvent.clientX - this._DragStartX;
		let tmpDeltaY = pEvent.clientY - this._DragStartY;

		let tmpNewLeft = this._DragStartLeft + tmpDeltaX;
		let tmpNewTop = this._DragStartTop + tmpDeltaY;

		// Clamp to parent bounds
		let tmpParent = tmpEl.parentElement;
		if (tmpParent)
		{
			let tmpMaxLeft = tmpParent.clientWidth - tmpEl.offsetWidth;
			let tmpMaxTop = tmpParent.clientHeight - tmpEl.offsetHeight;
			tmpNewLeft = Math.max(0, Math.min(tmpNewLeft, tmpMaxLeft));
			tmpNewTop = Math.max(0, Math.min(tmpNewTop, tmpMaxTop));
		}

		tmpEl.style.left = tmpNewLeft + 'px';
		tmpEl.style.top = tmpNewTop + 'px';
	}

	/**
	 * End dragging.
	 */
	_onDragEnd()
	{
		this._IsDragging = false;

		if (this._BoundMouseMove)
		{
			document.removeEventListener('mousemove', this._BoundMouseMove);
			this._BoundMouseMove = null;
		}
		if (this._BoundMouseUp)
		{
			document.removeEventListener('mouseup', this._BoundMouseUp);
			this._BoundMouseUp = null;
		}

		// Save position
		if (this._ToolbarView)
		{
			let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
			let tmpToolbar = this.pict.ContentAssignment.getElement(`#Flow-FloatingToolbar-${tmpFlowViewIdentifier}`);
			if (tmpToolbar.length > 0)
			{
				this._ToolbarView._FloatingPosition.X = tmpToolbar[0].offsetLeft;
				this._ToolbarView._FloatingPosition.Y = tmpToolbar[0].offsetTop;
			}
		}
	}

	/**
	 * Show the floating toolbar at the saved position.
	 */
	show()
	{
		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpContainer = this.pict.ContentAssignment.getElement(`#Flow-FloatingToolbar-Container-${tmpFlowViewIdentifier}`);
		if (tmpContainer.length > 0)
		{
			tmpContainer[0].style.display = 'block';
		}

		let tmpToolbar = this.pict.ContentAssignment.getElement(`#Flow-FloatingToolbar-${tmpFlowViewIdentifier}`);
		if (tmpToolbar.length > 0 && this._ToolbarView)
		{
			tmpToolbar[0].style.left = this._ToolbarView._FloatingPosition.X + 'px';
			tmpToolbar[0].style.top = this._ToolbarView._FloatingPosition.Y + 'px';
		}

		// Restore expanded state when showing
		if (this._IsCollapsed && tmpToolbar.length > 0)
		{
			this._IsCollapsed = false;
			tmpToolbar[0].classList.remove('collapsed');
		}
	}

	/**
	 * Hide the floating toolbar.
	 */
	hide()
	{
		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpContainer = this.pict.ContentAssignment.getElement(`#Flow-FloatingToolbar-Container-${tmpFlowViewIdentifier}`);
		if (tmpContainer.length > 0)
		{
			tmpContainer[0].style.display = 'none';
		}
	}
}

module.exports = PictViewFlowFloatingToolbar;

module.exports.default_configuration = _DefaultConfiguration;
