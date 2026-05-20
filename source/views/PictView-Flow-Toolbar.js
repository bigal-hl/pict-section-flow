const libPictView = require('pict-view');

const _DefaultConfiguration =
{
	ViewIdentifier: 'Flow-Toolbar',

	DefaultRenderable: 'Flow-Toolbar-Content',
	DefaultDestinationAddress: '#Flow-Toolbar-Container',

	AutoRender: false,

	FlowViewIdentifier: 'Pict-Flow',

	EnablePalette: true,
	EnableAddNode: true,
	EnableCardPalette: true,

	CSS: false,

	Templates:
	[
		{
			Hash: 'Flow-Toolbar-Template',
			// Inline onclick handlers route to the toolbar via the FlowView
			// (the flow toolbar is reachable as ._ToolbarView from the
			// registered FlowView). Each button is responsible for its own
			// action — no event delegation.
			Template: /*html*/`
<div class="pict-flow-toolbar" id="Flow-Toolbar-Bar-{~D:Record.FlowViewIdentifier~}">
	<div class="pict-flow-toolbar-group">
		<button class="pict-flow-toolbar-btn" data-flow-action="add-node" id="Flow-Toolbar-AddNode-{~D:Record.FlowViewIdentifier~}" title="Add Node"
			onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._handleToolbarAction('add-node')">
			<span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Icon-plus-{~D:Record.FlowViewIdentifier~}"></span>
			<span class="pict-flow-toolbar-btn-text">Node</span>
		</button>
		<button class="pict-flow-toolbar-btn" data-flow-action="cards-popup" id="Flow-Toolbar-Cards-{~D:Record.FlowViewIdentifier~}" title="Card Palette"
			onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._handleToolbarAction('cards-popup')">
			<span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Icon-cards-{~D:Record.FlowViewIdentifier~}"></span>
			<span class="pict-flow-toolbar-btn-text">Cards</span>
			<span class="pict-flow-toolbar-btn-chevron" id="Flow-Toolbar-CardsChevron-{~D:Record.FlowViewIdentifier~}"></span>
		</button>
		<button class="pict-flow-toolbar-btn" data-flow-action="delete-selected" title="Delete Node"
			onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._handleToolbarAction('delete-selected')">
			<span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Icon-trash-{~D:Record.FlowViewIdentifier~}"></span>
		</button>
	</div>
	<div class="pict-flow-toolbar-group">
		<button class="pict-flow-toolbar-btn" data-flow-action="layout-popup" id="Flow-Toolbar-Layout-{~D:Record.FlowViewIdentifier~}" title="Manage saved layouts"
			onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._handleToolbarAction('layout-popup')">
			<span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Icon-layout-{~D:Record.FlowViewIdentifier~}"></span>
			<span class="pict-flow-toolbar-btn-text">Layouts</span>
			<span class="pict-flow-toolbar-btn-chevron" id="Flow-Toolbar-LayoutChevron-{~D:Record.FlowViewIdentifier~}"></span>
		</button>
		<div class="pict-flow-toolbar-btn-split" id="Flow-Toolbar-Auto-{~D:Record.FlowViewIdentifier~}">
			<button class="pict-flow-toolbar-btn pict-flow-toolbar-btn-split-main" data-flow-action="apply-current-layout" title="Apply current layout algorithm"
				onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._handleToolbarAction('apply-current-layout')">
				<span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Icon-auto-{~D:Record.FlowViewIdentifier~}"></span>
				<span class="pict-flow-toolbar-btn-text">Auto</span>
			</button>
			<button class="pict-flow-toolbar-btn pict-flow-toolbar-btn-split-chevron" data-flow-action="layout-algorithm-popup" title="Choose layout algorithm"
				onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._handleToolbarAction('layout-algorithm-popup')">
				<span class="pict-flow-toolbar-btn-chevron" id="Flow-Toolbar-AutoChevron-{~D:Record.FlowViewIdentifier~}"></span>
			</button>
		</div>
	</div>
	<div class="pict-flow-toolbar-group">
		<button class="pict-flow-toolbar-btn" data-flow-action="zoom-in" title="Zoom In"
			onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._handleToolbarAction('zoom-in')">
			<span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Icon-zoom-in-{~D:Record.FlowViewIdentifier~}"></span>
		</button>
		<button class="pict-flow-toolbar-btn" data-flow-action="zoom-out" title="Zoom Out"
			onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._handleToolbarAction('zoom-out')">
			<span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Icon-zoom-out-{~D:Record.FlowViewIdentifier~}"></span>
		</button>
		<button class="pict-flow-toolbar-btn" data-flow-action="zoom-fit" title="Fit to View"
			onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._handleToolbarAction('zoom-fit')">
			<span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Icon-zoom-fit-{~D:Record.FlowViewIdentifier~}"></span>
		</button>
	</div>
	<div class="pict-flow-toolbar-group pict-flow-toolbar-right">
		<button class="pict-flow-toolbar-btn" data-flow-action="settings-popup" id="Flow-Toolbar-Settings-{~D:Record.FlowViewIdentifier~}" title="Theme Settings"
			onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._handleToolbarAction('settings-popup')">
			<span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Icon-settings-{~D:Record.FlowViewIdentifier~}"></span>
		</button>
		<button class="pict-flow-toolbar-btn" data-flow-action="fullscreen" id="Flow-Toolbar-Fullscreen-{~D:Record.FlowViewIdentifier~}" title="Toggle Fullscreen"
			onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._handleToolbarAction('fullscreen')">
			<span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Fullscreen-Icon-{~D:Record.FlowViewIdentifier~}"></span>
		</button>
		<button class="pict-flow-toolbar-btn" data-flow-action="toggle-floating" title="Float"
			onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._handleToolbarAction('toggle-floating')">
			<span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Icon-grip-{~D:Record.FlowViewIdentifier~}"></span>
		</button>
		<button class="pict-flow-toolbar-btn" data-flow-action="collapse-toolbar" title="Collapse Toolbar"
			onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._handleToolbarAction('collapse-toolbar')">
			<span class="pict-flow-toolbar-btn-icon" id="Flow-Toolbar-Icon-collapse-{~D:Record.FlowViewIdentifier~}"></span>
		</button>
	</div>
</div>
<div class="pict-flow-toolbar-collapsed" id="Flow-Toolbar-Collapsed-{~D:Record.FlowViewIdentifier~}">
	<button class="pict-flow-toolbar-expand-btn" data-flow-action="expand-toolbar" title="Expand Toolbar" id="Flow-Toolbar-ExpandBtn-{~D:Record.FlowViewIdentifier~}"
		onclick="_Pict.views['{~D:Record.FlowViewIdentifier~}']._ToolbarView._handleToolbarAction('expand-toolbar')">
		<span id="Flow-Toolbar-Icon-expand-{~D:Record.FlowViewIdentifier~}"></span>
	</button>
</div>
<div class="pict-flow-toolbar-popup-anchor" id="Flow-Toolbar-PopupAnchor-{~D:Record.FlowViewIdentifier~}">
</div>
`
		},
		{
			Hash: 'Flow-AddNode-List',
			// Iteration source is `Record.Rows` — the outer call sets the
			// FlowViewIdentifier on each row so inline handlers resolve their
			// owning view independently. Nested {~D:~} inside {~TS:~}
			// addresses isn't supported by the template engine, so we keep
			// addresses static.
			Template: '{~TS:Flow-AddNode-Row:Record.Rows~}'
		},
		{
			Hash: 'Flow-AddNode-Row',
			Template: '<div class="pict-flow-popup-list-item" data-node-type="{~D:Record.NodeType~}"'
				+ ' onclick="_Pict.views[\'{~D:Record.FlowViewIdentifier~}\']._ToolbarView._addNodeFromPopup(this.getAttribute(\'data-node-type\'))">'
				+ '<span class="pict-flow-popup-list-item-icon">{~D:Record.IconHTML~}</span>'
				+ '<span class="pict-flow-popup-list-item-label">{~D:Record.Label~}</span>'
				+ '{~NE:Record.Code^<span class="pict-flow-popup-list-item-code">{~D:Record.Code~}</span>~}'
				+ '</div>'
		},
		{
			Hash: 'Flow-Cards-List',
			Template: '{~TS:Flow-Cards-Category:Record.Categories~}'
		},
		{
			Hash: 'Flow-Cards-Category',
			Template: '<div class="pict-flow-palette-category" style="padding:0.35em 0.5em;">'
				+ '<div class="pict-flow-palette-category-label">{~D:Record.Name~}</div>'
				+ '<div class="pict-flow-palette-cards">{~TS:Flow-Cards-Card:Record.Cards~}</div>'
				+ '</div>'
		},
		{
			Hash: 'Flow-Cards-Card',
			Template: '<div class="pict-flow-palette-card{~D:Record.DisabledClass~}" data-card-type="{~D:Record.CardType~}" title="{~D:Record.Tooltip~}"'
				+ ' onclick="_Pict.views[\'{~D:Record.FlowViewIdentifier~}\']._ToolbarView._addCardFromPopup(this.getAttribute(\'data-card-type\'))">'
				+ '{~NE:Record.IconHTML^<span class="pict-flow-palette-card-icon">{~D:Record.IconHTML~}</span>~}'
				+ '{~NE:Record.IconEmoji^<span class="pict-flow-palette-card-icon">{~D:Record.IconEmoji~}</span>~}'
				+ '{~NE:Record.SwatchColor^<span class="pict-flow-palette-card-swatch" style="background-color: {~D:Record.SwatchColor~};"></span>~}'
				+ '<span class="pict-flow-palette-card-title">{~D:Record.Label~}</span>'
				+ '{~NE:Record.Code^<span class="pict-flow-palette-card-code">{~D:Record.Code~}</span>~}'
				+ '</div>'
		},
		{
			Hash: 'Flow-Layout-List',
			Template: '{~TS:Flow-Layout-Row:Record.Rows~}'
		},
		{
			Hash: 'Flow-Layout-Row',
			Template: '<div class="pict-flow-popup-layout-row" data-layout-hash="{~D:Record.LayoutHash~}"'
				+ ' onclick="_Pict.views[\'{~D:Record.FlowViewIdentifier~}\']._ToolbarView._restoreLayoutFromPopup(\'{~D:Record.LayoutHash~}\', event)">'
				+ '<span class="pict-flow-popup-layout-name">{~D:Record.Name~}</span>'
				+ '<button class="pict-flow-popup-layout-delete" title="Delete layout"'
				+ ' onclick="_Pict.views[\'{~D:Record.FlowViewIdentifier~}\']._ToolbarView._deleteLayoutFromPopup(\'{~D:Record.LayoutHash~}\', event)">'
				+ '{~D:Record.DeleteIconHTML~}</button>'
				+ '</div>'
		},
		{
			Hash: 'Flow-Layout-OptionList',
			Template: '{~TS:Flow-Layout-Option:Record.Options~}'
		},
		{
			Hash: 'Flow-Layout-Option',
			Template: '<option value="{~D:Record.Value~}"{~D:Record.SelectedAttr~}>{~D:Record.Label~}</option>'
		}
	],

	Renderables:
	[
		{
			RenderableHash: 'Flow-Toolbar-Content',
			TemplateHash: 'Flow-Toolbar-Template',
			DestinationAddress: '#Flow-Toolbar-Container',
			RenderMethod: 'replace'
		}
	]
};

class PictViewFlowToolbar extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultConfiguration)), pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'PictViewFlowToolbar';

		this._FlowView = null;

		// Toolbar mode state
		this._ToolbarMode = 'docked'; // 'docked' | 'floating' | 'collapsed'
		this._ActivePopup = null;     // 'add-node' | 'cards' | 'layout' | null
		this._FloatingPosition = { X: 80, Y: 80 };
		this._DocumentClickHandler = null;
		this._FloatingToolbarView = null;

		// Layout-algorithm parameter form (pict-section-form metacontroller).
		// Lazily created on first popup open; null until then. Falls back to
		// hand-rolled inputs when PictFormMetacontroller is not registered.
		this._LayoutFormMetacontroller = null;
		this._LayoutFormHostID = null;
		// Whether the parameter form is expanded inside the popup. Persists
		// across popup opens so a user who collapsed it doesn't have to
		// re-collapse on every reopen. Defaults to expanded.
		this._LayoutFormExpanded = true;
	}

	render(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress)
	{
		// Pass this.options as the template record so {~D:Record.FlowViewIdentifier~}
		// resolves correctly in the toolbar template.
		return super.render(pRenderableHash, pRenderDestinationAddress, this.options);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;

		// Click handlers live on each button as inline `onclick` attributes
		// in Flow-Toolbar-Template — they call _handleToolbarAction directly.

		// Populate SVG icons for toolbar buttons
		this._populateToolbarIcons();

		// Remove buttons from DOM based on options
		if (this.options.EnableAddNode === false)
		{
			let tmpAddNodeBtn = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-AddNode-${tmpFlowViewIdentifier}`);
			if (tmpAddNodeBtn.length > 0)
			{
				tmpAddNodeBtn[0].remove();
			}
		}
		if (this.options.EnableCardPalette === false)
		{
			let tmpCardsBtn = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-Cards-${tmpFlowViewIdentifier}`);
			if (tmpCardsBtn.length > 0)
			{
				tmpCardsBtn[0].remove();
			}
		}
		if (this.options.EnableLayoutMenu === false)
		{
			let tmpAutoBtn = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-Auto-${tmpFlowViewIdentifier}`);
			if (tmpAutoBtn.length > 0)
			{
				tmpAutoBtn[0].remove();
			}
		}

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	// ── Icon Population ───────────────────────────────────────────────────

	/**
	 * Populate SVG icons for all toolbar buttons.
	 */
	_populateToolbarIcons()
	{
		let tmpIconProvider = this._FlowView ? this._FlowView._IconProvider : null;
		if (!tmpIconProvider) return;

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;

		// Map of element ID suffix → icon key
		let tmpIconMap =
		{
			'plus': 'plus',
			'trash': 'trash',
			'zoom-in': 'zoom-in',
			'zoom-out': 'zoom-out',
			'zoom-fit': 'zoom-fit',
			'auto': 'auto-layout',
			'cards': 'cards',
			'layout': 'layout',
			'settings': 'settings',
			'grip': 'grip',
			'collapse': 'collapse',
			'expand': 'expand'
		};

		let tmpKeys = Object.keys(tmpIconMap);
		for (let i = 0; i < tmpKeys.length; i++)
		{
			let tmpElementId = `Flow-Toolbar-Icon-${tmpKeys[i]}-${tmpFlowViewIdentifier}`;
			let tmpElements = this.pict.ContentAssignment.getElement(`#${tmpElementId}`);
			if (tmpElements.length > 0)
			{
				tmpElements[0].innerHTML = tmpIconProvider.getIconSVGMarkup(tmpIconMap[tmpKeys[i]], 14);
			}
		}

		// Fullscreen icon
		let tmpFullscreenIcon = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-Fullscreen-Icon-${tmpFlowViewIdentifier}`);
		if (tmpFullscreenIcon.length > 0)
		{
			tmpFullscreenIcon[0].innerHTML = tmpIconProvider.getIconSVGMarkup('fullscreen', 14);
		}

		// Chevrons (smaller)
		let tmpCardsChevron = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-CardsChevron-${tmpFlowViewIdentifier}`);
		if (tmpCardsChevron.length > 0)
		{
			tmpCardsChevron[0].innerHTML = tmpIconProvider.getIconSVGMarkup('chevron-down', 8);
		}

		let tmpLayoutChevron = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-LayoutChevron-${tmpFlowViewIdentifier}`);
		if (tmpLayoutChevron.length > 0)
		{
			tmpLayoutChevron[0].innerHTML = tmpIconProvider.getIconSVGMarkup('chevron-down', 8);
		}

		let tmpAutoChevron = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-AutoChevron-${tmpFlowViewIdentifier}`);
		if (tmpAutoChevron.length > 0)
		{
			tmpAutoChevron[0].innerHTML = tmpIconProvider.getIconSVGMarkup('chevron-down', 8);
		}
	}

	// ── Popup Management ──────────────────────────────────────────────────

	/**
	 * Open a popup below a trigger button.
	 * @param {string} pType - 'add-node' | 'cards' | 'layout'
	 */
	_openPopup(pType)
	{
		// Toggle off if already open
		if (this._ActivePopup === pType)
		{
			this._closePopup();
			return;
		}

		// Close any existing popup first
		this._closePopup();

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpAnchor = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-PopupAnchor-${tmpFlowViewIdentifier}`);
		if (tmpAnchor.length < 1) return;

		// Create popup div
		let tmpPopup = document.createElement('div');
		tmpPopup.className = 'pict-flow-toolbar-popup';
		tmpPopup.setAttribute('id', `Flow-Toolbar-Popup-${tmpFlowViewIdentifier}`);

		// Build popup content
		switch (pType)
		{
			case 'add-node':
				this._buildAddNodePopup(tmpPopup);
				break;
			case 'cards':
				this._buildCardsPopup(tmpPopup);
				break;
			case 'layout':
				this._buildLayoutPopup(tmpPopup);
				break;
			case 'layout-algorithm':
				this._buildLayoutAlgorithmPopup(tmpPopup);
				break;
			case 'settings':
				this._buildSettingsPopup(tmpPopup);
				break;
		}

		tmpAnchor[0].appendChild(tmpPopup);
		this._ActivePopup = pType;

		// Position the popup below the trigger button
		this._positionPopup(tmpPopup, pType);

		// Click-outside-to-close handler (delayed to avoid catching the opening click)
		setTimeout(() =>
		{
			this._DocumentClickHandler = (pEvent) =>
			{
				if (!tmpPopup.contains(pEvent.target))
				{
					// Check if click was on the trigger button itself (toggle behavior)
					let tmpButton = pEvent.target.closest('[data-flow-action]');
					if (tmpButton)
					{
						let tmpAction = tmpButton.getAttribute('data-flow-action');
						if (tmpAction === pType || tmpAction === pType.replace('-popup', '') + '-popup')
						{
							return; // Let the toggle handle it
						}
					}
					this._closePopup();
				}
			};
			document.addEventListener('click', this._DocumentClickHandler, true);
		}, 0);

		// Focus search input if Add Node popup
		if (pType === 'add-node')
		{
			let tmpSearch = tmpPopup.querySelector('.pict-flow-popup-search');
			if (tmpSearch)
			{
				setTimeout(() => { tmpSearch.focus(); }, 50);
			}
		}
	}

	/**
	 * Close the active popup and clean up.
	 */
	_closePopup()
	{
		if (this._DocumentClickHandler)
		{
			document.removeEventListener('click', this._DocumentClickHandler, true);
			this._DocumentClickHandler = null;
		}

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpPopup = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-Popup-${tmpFlowViewIdentifier}`);
		if (tmpPopup.length > 0)
		{
			tmpPopup[0].parentNode.removeChild(tmpPopup[0]);
		}

		this._ActivePopup = null;
	}

	/**
	 * Position a popup below its trigger button.
	 * @param {HTMLElement} pPopupDiv
	 * @param {string} pType
	 */
	_positionPopup(pPopupDiv, pType)
	{
		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;

		// Determine which button triggered the popup
		let tmpTriggerSelector;
		switch (pType)
		{
			case 'add-node':
				tmpTriggerSelector = `#Flow-Toolbar-AddNode-${tmpFlowViewIdentifier}`;
				break;
			case 'cards':
				tmpTriggerSelector = `#Flow-Toolbar-Cards-${tmpFlowViewIdentifier}`;
				break;
			case 'layout':
				tmpTriggerSelector = `#Flow-Toolbar-Layout-${tmpFlowViewIdentifier}`;
				break;
			case 'layout-algorithm':
				tmpTriggerSelector = `#Flow-Toolbar-Auto-${tmpFlowViewIdentifier}`;
				break;
			case 'settings':
				tmpTriggerSelector = `#Flow-Toolbar-Settings-${tmpFlowViewIdentifier}`;
				break;
			default:
				return;
		}

		let tmpTriggerElements = this.pict.ContentAssignment.getElement(tmpTriggerSelector);
		if (tmpTriggerElements.length < 1) return;

		let tmpAnchor = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-PopupAnchor-${tmpFlowViewIdentifier}`);
		if (tmpAnchor.length < 1) return;

		let tmpTriggerRect = tmpTriggerElements[0].getBoundingClientRect();
		let tmpAnchorRect = tmpAnchor[0].getBoundingClientRect();

		let tmpLeft = tmpTriggerRect.left - tmpAnchorRect.left;
		pPopupDiv.style.left = tmpLeft + 'px';
		pPopupDiv.style.top = '0px';
	}

	// ── Add Node Popup ────────────────────────────────────────────────────

	/**
	 * Build the searchable Add Node popup content via templates with inline
	 * handlers. Search input fires `_filterNodeList` which re-renders the
	 * list section in place.
	 *
	 * @param {HTMLElement} pContainer
	 */
	_buildAddNodePopup(pContainer)
	{
		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpIconProvider = this._FlowView ? this._FlowView._IconProvider : null;
		let tmpSearchIconHTML = tmpIconProvider ? tmpIconProvider.getIconSVGMarkup('search', 12) : '';

		let tmpListID = `Flow-Toolbar-AddNodeList-${tmpFlowViewIdentifier}`;
		let tmpSearchID = `Flow-Toolbar-AddNodeSearch-${tmpFlowViewIdentifier}`;

		// Stage AppData and render the initial list HTML inline — the popup
		// element isn't in the DOM yet, so we can't look it up via
		// getElementById here. _filterNodeList handles updates after open.
		let tmpInitialListHTML = this._renderNodeListHTML('');

		this.pict.ContentAssignment.assignContent(pContainer,
			'<div class="pict-flow-popup-search-wrapper">'
			+ '<span class="pict-flow-popup-search-icon">' + tmpSearchIconHTML + '</span>'
			+ '<input id="' + tmpSearchID + '" class="pict-flow-popup-search" type="text" placeholder="Search node types..." '
			+ 'oninput="_Pict.views[\'' + tmpFlowViewIdentifier + '\']._ToolbarView._filterNodeList(\'' + tmpListID + '\', this.value)" />'
			+ '</div>'
			+ '<div id="' + tmpListID + '" class="pict-flow-popup-node-list">' + tmpInitialListHTML + '</div>');
	}

	/**
	 * Build the HTML string for the Add Node list filtered by the given
	 * text. Stages AppData and renders the {~TS:~} template into a string;
	 * returns "no matches" markup when nothing matches.
	 *
	 * @param {string} pFilter
	 * @returns {string}
	 */
	_renderNodeListHTML(pFilter)
	{
		if (!this._FlowView || !this._FlowView._NodeTypeProvider) return '';

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpTypes = this._FlowView._NodeTypeProvider.getNodeTypes();
		let tmpTypeKeys = Object.keys(tmpTypes);
		let tmpFilter = (pFilter || '').toLowerCase().trim();
		let tmpIconProvider = this._FlowView._IconProvider;

		let tmpRows = [];
		for (let i = 0; i < tmpTypeKeys.length; i++)
		{
			let tmpTypeConfig = tmpTypes[tmpTypeKeys[i]];
			let tmpMeta = tmpTypeConfig.CardMetadata || {};
			if (tmpMeta.Enabled === false) continue;

			if (tmpFilter)
			{
				let tmpLabel = (tmpTypeConfig.Label || '').toLowerCase();
				let tmpCode = (tmpMeta.Code || '').toLowerCase();
				let tmpCategory = (tmpMeta.Category || '').toLowerCase();
				if (tmpLabel.indexOf(tmpFilter) < 0 && tmpCode.indexOf(tmpFilter) < 0 && tmpCategory.indexOf(tmpFilter) < 0) continue;
			}

			let tmpIconHTML = '';
			if (tmpIconProvider)
			{
				let tmpResolvedKey = tmpIconProvider.resolveIconKey(tmpMeta);
				tmpIconHTML = tmpIconProvider.getIconSVGMarkup(tmpResolvedKey, 16);
			}
			tmpRows.push(
			{
				NodeType: tmpTypeKeys[i],
				Label: tmpTypeConfig.Label || '',
				IconHTML: tmpIconHTML,
				Code: tmpMeta.Code || '',
				FlowViewIdentifier: tmpFlowViewIdentifier
			});
		}

		if (tmpRows.length === 0)
		{
			return '<div class="pict-flow-popup-list-empty">No matching node types</div>';
		}
		return this.pict.parseTemplateByHash('Flow-AddNode-List', { Rows: tmpRows });
	}

	/**
	 * Update the Add Node list contents in response to a search input
	 * change. Called from the inline `oninput` handler. The list element
	 * is already in the DOM by the time this fires.
	 *
	 * @param {string} pListID
	 * @param {string} pFilter
	 */
	_filterNodeList(pListID, pFilter)
	{
		let tmpListEl = document.getElementById(pListID);
		if (!tmpListEl) return;
		this.pict.ContentAssignment.assignContent(tmpListEl, this._renderNodeListHTML(pFilter));
	}

	/**
	 * Inline handler for an Add Node row click. Adds the node at viewport
	 * center and closes the popup.
	 *
	 * @param {string} pNodeType
	 */
	_addNodeFromPopup(pNodeType)
	{
		this._addNodeAtCenter(pNodeType);
		this._closePopup();
	}

	// ── Cards Popup ───────────────────────────────────────────────────────

	/**
	 * Build the Cards popup using templates with inline handlers. Search
	 * input fires `_filterCardsList` which re-renders the categorized list.
	 *
	 * @param {HTMLElement} pContainer
	 */
	_buildCardsPopup(pContainer)
	{
		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpIconProvider = this._FlowView ? this._FlowView._IconProvider : null;
		let tmpSearchIconHTML = tmpIconProvider ? tmpIconProvider.getIconSVGMarkup('search', 12) : '';

		let tmpListID = `Flow-Toolbar-CardsList-${tmpFlowViewIdentifier}`;
		let tmpSearchID = `Flow-Toolbar-CardsSearch-${tmpFlowViewIdentifier}`;

		// Initial render inline — popup not yet in DOM.
		let tmpInitialListHTML = this._renderCardsListHTML('');

		this.pict.ContentAssignment.assignContent(pContainer,
			'<div class="pict-flow-popup-search-wrapper">'
			+ '<span class="pict-flow-popup-search-icon">' + tmpSearchIconHTML + '</span>'
			+ '<input id="' + tmpSearchID + '" class="pict-flow-popup-search" type="text" placeholder="Search cards..." '
			+ 'oninput="_Pict.views[\'' + tmpFlowViewIdentifier + '\']._ToolbarView._filterCardsList(\'' + tmpListID + '\', this.value)" />'
			+ '</div>'
			+ '<div id="' + tmpListID + '" class="pict-flow-popup-node-list">' + tmpInitialListHTML + '</div>');

		// Focus search input — defer past the popup append.
		setTimeout(() =>
		{
			let tmpSearch = document.getElementById(tmpSearchID);
			if (tmpSearch) tmpSearch.focus();
		}, 50);
	}

	/**
	 * Build the cards-list HTML string for the given filter. Stages
	 * AppData and renders via the {~TS:~} templates; returns "no matches"
	 * markup when nothing matches.
	 *
	 * @param {string} pFilter
	 * @returns {string}
	 */
	_renderCardsListHTML(pFilter)
	{
		if (!this._FlowView || !this._FlowView._NodeTypeProvider) return '';

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpCategories = this._FlowView._NodeTypeProvider.getCardsByCategory();
		let tmpCategoryKeys = Object.keys(tmpCategories);
		let tmpFilter = (pFilter || '').toLowerCase().trim();
		let tmpIconProvider = this._FlowView._IconProvider;
		let tmpTotalMatchCount = 0;

		let tmpCategoryRecords = [];
		for (let i = 0; i < tmpCategoryKeys.length; i++)
		{
			let tmpCategoryName = tmpCategoryKeys[i];
			let tmpCards = tmpCategories[tmpCategoryName];
			let tmpMatching = [];

			for (let j = 0; j < tmpCards.length; j++)
			{
				let tmpCardConfig = tmpCards[j];
				let tmpMeta = tmpCardConfig.CardMetadata || {};

				if (tmpFilter)
				{
					let tmpLabel = (tmpCardConfig.Label || '').toLowerCase();
					let tmpCode = (tmpMeta.Code || '').toLowerCase();
					let tmpCategory = tmpCategoryName.toLowerCase();
					if (tmpLabel.indexOf(tmpFilter) < 0 && tmpCode.indexOf(tmpFilter) < 0 && tmpCategory.indexOf(tmpFilter) < 0) continue;
				}

				let tmpIconHTML = '';
				let tmpIsEmoji = false;
				if (tmpMeta.Icon && tmpIconProvider && !tmpIconProvider.isEmojiIcon(tmpMeta.Icon))
				{
					tmpIconHTML = tmpIconProvider.getIconSVGMarkup(tmpIconProvider.resolveIconKey(tmpMeta), 14);
				}
				else if (tmpMeta.Icon)
				{
					tmpIsEmoji = true;
				}
				else if (tmpIconProvider)
				{
					tmpIconHTML = tmpIconProvider.getIconSVGMarkup('default', 14);
				}

				tmpMatching.push(
				{
					CardType: tmpCardConfig.Hash,
					Label: tmpCardConfig.Label || '',
					Code: tmpMeta.Code || '',
					IconHTML: tmpIconHTML,
					IconEmoji: tmpIsEmoji ? tmpMeta.Icon : '',
					DisabledClass: (tmpMeta.Enabled === false) ? ' disabled' : '',
					Tooltip: tmpMeta.Tooltip || tmpMeta.Description || '',
					SwatchColor: (!tmpIconHTML && !tmpIsEmoji && tmpCardConfig.TitleBarColor) ? tmpCardConfig.TitleBarColor : '',
					FlowViewIdentifier: tmpFlowViewIdentifier
				});
			}

			if (tmpMatching.length === 0) continue;
			tmpTotalMatchCount += tmpMatching.length;
			tmpCategoryRecords.push(
			{
				Name: tmpCategoryName,
				Cards: tmpMatching,
				FlowViewIdentifier: tmpFlowViewIdentifier
			});
		}

		if (tmpTotalMatchCount === 0)
		{
			return '<div class="pict-flow-popup-list-empty">' + (tmpFilter ? 'No matching cards' : 'No card types available') + '</div>';
		}
		return this.pict.parseTemplateByHash('Flow-Cards-List', { Categories: tmpCategoryRecords });
	}

	/**
	 * Inline `oninput` handler — refresh card list with the new filter.
	 */
	_filterCardsList(pListID, pFilter)
	{
		let tmpListEl = document.getElementById(pListID);
		if (!tmpListEl) return;
		this.pict.ContentAssignment.assignContent(tmpListEl, this._renderCardsListHTML(pFilter));
	}

	/**
	 * Inline handler for a card click. Adds the node and closes the popup.
	 *
	 * @param {string} pCardType
	 */
	_addCardFromPopup(pCardType)
	{
		this._addCardFromPalette(pCardType);
		this._closePopup();
	}

	// ── Layout Popup ──────────────────────────────────────────────────────

	/**
	 * Build the Layout popup using templates with inline handlers.
	 *
	 * Layout records (name + hash) are pushed into AppData and iterated via
	 * a {~TS:~} template. The save section is a static fragment with inline
	 * handlers that call the toolbar's helper methods.
	 *
	 * @param {HTMLElement} pContainer
	 */
	_buildLayoutPopup(pContainer)
	{
		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpIconProvider = this._FlowView ? this._FlowView._IconProvider : null;
		let tmpSaveIconHTML = tmpIconProvider ? tmpIconProvider.getIconSVGMarkup('save', 14) : '✓';
		let tmpDeleteIconHTML = tmpIconProvider ? tmpIconProvider.getIconSVGMarkup('trash', 12) : '×';

		let tmpSaveRowID = `Flow-Toolbar-LayoutSaveRow-${tmpFlowViewIdentifier}`;
		let tmpSaveInputRowID = `Flow-Toolbar-LayoutSaveInputRow-${tmpFlowViewIdentifier}`;
		let tmpSaveInputID = `Flow-Toolbar-LayoutSaveInput-${tmpFlowViewIdentifier}`;
		let tmpListID = `Flow-Toolbar-LayoutList-${tmpFlowViewIdentifier}`;

		// Build layout records for the {~TS:~} iteration
		let tmpLayouts = (this._FlowView && this._FlowView._LayoutProvider)
			? this._FlowView._LayoutProvider.getLayouts() : [];
		let tmpLayoutRecords = [];
		for (let i = 0; i < tmpLayouts.length; i++)
		{
			tmpLayoutRecords.push(
			{
				LayoutHash: tmpLayouts[i].Hash,
				Name: tmpLayouts[i].Name || '',
				DeleteIconHTML: tmpDeleteIconHTML,
				FlowViewIdentifier: tmpFlowViewIdentifier
			});
		}

		let tmpListHTML = (tmpLayoutRecords.length === 0)
			? '<div class="pict-flow-popup-list-empty">No saved layouts</div>'
			: this.pict.parseTemplateByHash('Flow-Layout-List', { Rows: tmpLayoutRecords });

		this.pict.ContentAssignment.assignContent(pContainer,
			'<div class="pict-flow-popup-layout-save-section">'
			+ '<div id="' + tmpSaveRowID + '" class="pict-flow-popup-layout-save"'
			+ ' onclick="_Pict.views[\'' + tmpFlowViewIdentifier + '\']._ToolbarView._showLayoutSaveInput(\'' + tmpSaveRowID + '\', \'' + tmpSaveInputRowID + '\', \'' + tmpSaveInputID + '\')">'
			+ '<span class="pict-flow-popup-layout-save-icon">' + tmpSaveIconHTML + '</span>'
			+ '<span>Save Current Layout</span>'
			+ '</div>'
			+ '<div id="' + tmpSaveInputRowID + '" class="pict-flow-popup-layout-save-input-row" style="display:none;">'
			+ '<input id="' + tmpSaveInputID + '" class="pict-flow-popup-layout-save-input" type="text" placeholder="Layout name..."'
			+ ' onclick="event.stopPropagation()"'
			+ ' onkeydown="_Pict.views[\'' + tmpFlowViewIdentifier + '\']._ToolbarView._handleLayoutSaveKey(event, \'' + tmpSaveInputID + '\', \'' + tmpSaveRowID + '\', \'' + tmpSaveInputRowID + '\')" />'
			+ '<button class="pict-flow-popup-layout-save-confirm" title="Save"'
			+ ' onclick="_Pict.views[\'' + tmpFlowViewIdentifier + '\']._ToolbarView._confirmLayoutSave(\'' + tmpSaveInputID + '\')">'
			+ tmpSaveIconHTML + '</button>'
			+ '</div>'
			+ '</div>'
			+ '<div class="pict-flow-popup-divider"></div>'
			+ '<div id="' + tmpListID + '">' + tmpListHTML + '</div>');
	}

	/**
	 * Inline handler — reveal the layout-name input and focus it.
	 */
	_showLayoutSaveInput(pSaveRowID, pInputRowID, pInputID)
	{
		let tmpRow = document.getElementById(pSaveRowID);
		let tmpInputRow = document.getElementById(pInputRowID);
		let tmpInput = document.getElementById(pInputID);
		if (tmpRow) tmpRow.style.display = 'none';
		if (tmpInputRow) tmpInputRow.style.display = '';
		if (tmpInput)
		{
			tmpInput.value = '';
			setTimeout(() => { tmpInput.focus(); }, 50);
		}
	}

	/**
	 * Inline handler — Enter saves, Escape cancels.
	 */
	_handleLayoutSaveKey(pEvent, pInputID, pSaveRowID, pInputRowID)
	{
		if (pEvent.key === 'Enter')
		{
			pEvent.preventDefault();
			this._confirmLayoutSave(pInputID);
		}
		else if (pEvent.key === 'Escape')
		{
			let tmpRow = document.getElementById(pSaveRowID);
			let tmpInputRow = document.getElementById(pInputRowID);
			if (tmpInputRow) tmpInputRow.style.display = 'none';
			if (tmpRow) tmpRow.style.display = '';
		}
	}

	/**
	 * Inline handler — save the layout under the entered name and rebuild
	 * the popup so the new entry appears.
	 */
	_confirmLayoutSave(pInputID)
	{
		let tmpInput = document.getElementById(pInputID);
		if (!tmpInput) return;
		let tmpName = (tmpInput.value || '').trim();
		if (tmpName === '') return;
		this._FlowView._LayoutProvider.saveLayout(tmpName);

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpPopupEl = document.getElementById(`Flow-Toolbar-Popup-${tmpFlowViewIdentifier}`);
		if (tmpPopupEl) this._buildLayoutPopup(tmpPopupEl);
	}

	/**
	 * Inline handler — restore layout when the row (not its delete button)
	 * is clicked.
	 */
	_restoreLayoutFromPopup(pLayoutHash, pEvent)
	{
		if (pEvent && pEvent.target && pEvent.target.closest('.pict-flow-popup-layout-delete')) return;
		this._FlowView._LayoutProvider.restoreLayout(pLayoutHash);
		this._closePopup();
	}

	/**
	 * Inline handler — delete a saved layout and refresh the popup.
	 */
	_deleteLayoutFromPopup(pLayoutHash, pEvent)
	{
		if (pEvent && typeof pEvent.stopPropagation === 'function') pEvent.stopPropagation();
		this._FlowView._LayoutProvider.deleteLayout(pLayoutHash);

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpPopupEl = document.getElementById(`Flow-Toolbar-Popup-${tmpFlowViewIdentifier}`);
		if (tmpPopupEl) this._buildLayoutPopup(tmpPopupEl);
	}

	// ── Layout Algorithm Popup ────────────────────────────────────────────

	/**
	 * Build the Layout Algorithm popup using templates with inline handlers.
	 * The popup has three logical sections (algorithm chooser, edge-theme
	 * chooser, auto-apply toggle + apply button). Each control's behavior
	 * lives on the toolbar as a helper method called from inline handlers.
	 *
	 * Iterations (algorithm options, edge themes) are template-driven via
	 * AppData arrays.
	 *
	 * @param {HTMLElement} pContainer
	 */
	_buildLayoutAlgorithmPopup(pContainer)
	{
		if (!this._FlowView || !this._FlowView._LayoutService) return;

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpLayoutService = this._FlowView._LayoutService;
		let tmpCurrentSettings = this._FlowView.getLayoutAlgorithm();
		let tmpAlgoDescriptor = tmpLayoutService.getAlgorithm(tmpCurrentSettings.Algorithm);
		let tmpEdgeSettings = this._FlowView.getEdgeTheme();
		let tmpResolvedEdge = tmpEdgeSettings.Theme;
		let tmpExplicitEdgeOverride = tmpEdgeSettings.Override;
		let tmpDefaultThemeName = (tmpAlgoDescriptor && tmpAlgoDescriptor.DefaultEdgeTheme) || 'Bezier';
		let tmpIconProvider = this._FlowView ? this._FlowView._IconProvider : null;
		let tmpSettingsIconHTML = tmpIconProvider ? tmpIconProvider.getIconSVGMarkup('settings', 13) : '⚙';

		// Build option records for the dropdowns
		let tmpAlgoOptions = tmpLayoutService.listAlgorithms().map((pAlgo) => (
		{
			Value: pAlgo.Name,
			Label: pAlgo.Label || pAlgo.Name,
			SelectedAttr: (pAlgo.Name === tmpCurrentSettings.Algorithm) ? ' selected="selected"' : ''
		}));

		let tmpEdgeOptionRecords = [];
		tmpEdgeOptionRecords.push(
		{
			Value: '__inherit__',
			Label: `Inherit from layout (${tmpDefaultThemeName})`,
			SelectedAttr: !tmpExplicitEdgeOverride ? ' selected="selected"' : ''
		});
		let tmpEdgeThemes = tmpLayoutService.listEdgeThemes();
		for (let i = 0; i < tmpEdgeThemes.length; i++)
		{
			tmpEdgeOptionRecords.push(
			{
				Value: tmpEdgeThemes[i].Name,
				Label: tmpEdgeThemes[i].Label || tmpEdgeThemes[i].Name,
				SelectedAttr: (tmpEdgeThemes[i].Name === tmpExplicitEdgeOverride) ? ' selected="selected"' : ''
			});
		}

		let tmpAlgoOptionsHTML = this.pict.parseTemplateByHash('Flow-Layout-OptionList', { Options: tmpAlgoOptions });
		let tmpEdgeOptionsHTML = this.pict.parseTemplateByHash('Flow-Layout-OptionList', { Options: tmpEdgeOptionRecords });

		let tmpHasParameters = !!(tmpAlgoDescriptor && (
			(tmpAlgoDescriptor.ParameterManifest && tmpAlgoDescriptor.ParameterManifest.Descriptors) ||
			(tmpAlgoDescriptor.ParameterSchema && Object.keys(tmpAlgoDescriptor.ParameterSchema).length > 0)
		));

		let tmpAlgoDescription = (tmpAlgoDescriptor && tmpAlgoDescriptor.Description)
			? '<div class="pict-flow-popup-control-description">' + tmpAlgoDescriptor.Description + '</div>'
			: '';

		let tmpFormToggleHTML = '';
		if (tmpHasParameters)
		{
			tmpFormToggleHTML = '<button type="button" class="pict-flow-popup-collapse-toggle"'
				+ ' aria-expanded="' + (this._LayoutFormExpanded ? 'true' : 'false') + '"'
				+ ' title="' + (this._LayoutFormExpanded ? 'Hide parameters' : 'Show parameters') + '"'
				+ ' onclick="_Pict.views[\'' + tmpFlowViewIdentifier + '\']._ToolbarView._toggleLayoutFormCollapsed(this)">'
				+ tmpSettingsIconHTML
				+ '</button>';
		}

		let tmpAutoApplyID = `Flow-Toolbar-AutoApply-${tmpFlowViewIdentifier}`;
		let tmpApplyDisabled = (tmpCurrentSettings.Algorithm === 'Custom') ? ' disabled' : '';
		let tmpApplyTitle = (tmpCurrentSettings.Algorithm === 'Custom') ? ' title="Custom does not auto-position nodes"' : '';

		let tmpEdgeDescriptionHTML = '';
		if (tmpResolvedEdge)
		{
			let tmpResolvedDescriptor = tmpLayoutService.getEdgeTheme(tmpResolvedEdge);
			if (tmpResolvedDescriptor && tmpResolvedDescriptor.Description)
			{
				tmpEdgeDescriptionHTML = '<div class="pict-flow-popup-control-description">' + tmpResolvedDescriptor.Description + '</div>';
			}
		}

		// Place a host div for the parameter form; mount the form into it
		// after the popup is in the DOM (the metacontroller resolves
		// destinations via document.querySelector).
		let tmpParamFormHostID = `Flow-Toolbar-LayoutParamFormHost-${tmpFlowViewIdentifier}`;

		this.pict.ContentAssignment.assignContent(pContainer,
			'<div class="pict-flow-popup-settings-section pict-flow-popup-layout-algorithm-row">'
			+ '<label class="pict-flow-popup-settings-label">Algorithm</label>'
			+ '<div class="pict-flow-popup-layout-algorithm-controls">'
			+ '<select class="pict-flow-popup-settings-select pict-flow-popup-layout-algorithm-select" data-layout-control="algorithm"'
			+ ' onclick="event.stopPropagation()"'
			+ ' onchange="_Pict.views[\'' + tmpFlowViewIdentifier + '\']._ToolbarView._handleLayoutAlgoChange(this.value)">'
			+ tmpAlgoOptionsHTML
			+ '</select>'
			+ tmpFormToggleHTML
			+ '</div>'
			+ '</div>'
			+ tmpAlgoDescription
			+ '<div id="' + tmpParamFormHostID + '"></div>'
			+ '<div class="pict-flow-popup-divider"></div>'
			+ '<div class="pict-flow-popup-settings-section">'
			+ '<label class="pict-flow-popup-settings-label">Edge theme</label>'
			+ '<select class="pict-flow-popup-settings-select" data-layout-control="edge-theme"'
			+ ' onclick="event.stopPropagation()"'
			+ ' onchange="_Pict.views[\'' + tmpFlowViewIdentifier + '\']._ToolbarView._handleEdgeThemeChange(this.value)">'
			+ tmpEdgeOptionsHTML
			+ '</select>'
			+ '</div>'
			+ tmpEdgeDescriptionHTML
			+ '<div class="pict-flow-popup-divider"></div>'
			+ '<div class="pict-flow-popup-settings-section" style="display:flex;align-items:center;gap:8px;">'
			+ '<input type="checkbox" id="' + tmpAutoApplyID + '"' + (tmpCurrentSettings.AutoApply ? ' checked="checked"' : '') + ''
			+ ' onclick="event.stopPropagation()"'
			+ ' onchange="_Pict.views[\'' + tmpFlowViewIdentifier + '\']._ToolbarView._handleAutoApplyChange(this.checked)" />'
			+ '<label class="pict-flow-popup-settings-label" for="' + tmpAutoApplyID + '" style="cursor:pointer;">Auto-apply on changes</label>'
			+ '</div>'
			+ '<div class="pict-flow-popup-divider"></div>'
			+ '<div class="pict-flow-popup-settings-section" style="padding:4px 8px;">'
			+ '<button class="pict-flow-popup-layout-save-confirm" style="width:100%;padding:6px;"' + tmpApplyDisabled + tmpApplyTitle
			+ ' onclick="_Pict.views[\'' + tmpFlowViewIdentifier + '\']._ToolbarView._handleApplyLayoutNow()">Apply Now</button>'
			+ '</div>');

		// Mount the parameter form (handles its own DOM building /
		// metacontroller). Use pContainer.querySelector — the popup may
		// not be in the document yet, so document.getElementById would miss.
		let tmpFormHostEl = pContainer.querySelector('#' + tmpParamFormHostID);
		if (tmpFormHostEl)
		{
			this._buildLayoutParameterFormSection(tmpFormHostEl, tmpAlgoDescriptor, tmpCurrentSettings);
		}
	}

	/**
	 * Inline handler — switch layout algorithm, refresh popup.
	 */
	_handleLayoutAlgoChange(pName)
	{
		if (!this._FlowView || !this._FlowView._LayoutService) return;
		let tmpAlgo = this._FlowView._LayoutService.getAlgorithm(pName);
		let tmpDefaults = (tmpAlgo && tmpAlgo.DefaultParameters)
			? JSON.parse(JSON.stringify(tmpAlgo.DefaultParameters)) : {};
		this._FlowView.setLayoutAlgorithm(pName, tmpDefaults);

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpPopupEl = document.getElementById(`Flow-Toolbar-Popup-${tmpFlowViewIdentifier}`);
		if (tmpPopupEl) this._buildLayoutAlgorithmPopup(tmpPopupEl);
	}

	/**
	 * Inline handler — switch edge theme, refresh popup so descriptions
	 * track the new theme.
	 */
	_handleEdgeThemeChange(pValue)
	{
		if (!this._FlowView) return;
		if (pValue === '__inherit__')
		{
			this._FlowView.setEdgeTheme(null);
		}
		else
		{
			this._FlowView.setEdgeTheme(pValue);
		}

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpPopupEl = document.getElementById(`Flow-Toolbar-Popup-${tmpFlowViewIdentifier}`);
		if (tmpPopupEl) this._buildLayoutAlgorithmPopup(tmpPopupEl);
	}

	/**
	 * Inline handler — toggle auto-apply.
	 */
	_handleAutoApplyChange(pChecked)
	{
		if (!this._FlowView) return;
		this._FlowView.setLayoutAutoApply(pChecked);
	}

	/**
	 * Inline handler — fire the layout (when not Custom).
	 */
	_handleApplyLayoutNow()
	{
		if (!this._FlowView) return;
		let tmpSettings = this._FlowView.getLayoutAlgorithm();
		if (tmpSettings.Algorithm === 'Custom') return;
		this._FlowView.applyCurrentLayout();
	}

	/**
	 * Inline handler — toggle the parameter-form collapse state.
	 */
	_toggleLayoutFormCollapsed(pToggleButton)
	{
		this._LayoutFormExpanded = !this._LayoutFormExpanded;
		pToggleButton.setAttribute('aria-expanded', this._LayoutFormExpanded ? 'true' : 'false');
		pToggleButton.title = this._LayoutFormExpanded ? 'Hide parameters' : 'Show parameters';
		let tmpHost = this._LayoutFormHostID ? document.getElementById(this._LayoutFormHostID) : null;
		if (tmpHost)
		{
			tmpHost.setAttribute('data-collapsed', this._LayoutFormExpanded ? 'false' : 'true');
		}
	}

	/**
	 * Render the parameter form section. When the host app has registered
	 * `PictFormMetacontroller` and the algorithm provides a
	 * `ParameterManifest`, we inject that manifest into a section-form so
	 * the user gets the same Manyfest-driven UX as the rest of the Pict
	 * ecosystem. Otherwise we fall back to schema-driven hand-rolled inputs.
	 *
	 * Data binding: `pict.AppData.PictFlowLayoutEditor.Parameters` is a
	 * mirror of `_FlowData.LayoutParameters`. The form's Informary writes
	 * directly into AppData; a `change`/`input` listener on the popup
	 * pushes those edits back into `_FlowData.LayoutParameters` and (when
	 * the active algorithm is non-Custom) re-applies the layout.
	 *
	 * @param {HTMLElement} pContainer
	 * @param {Object} pAlgoDescriptor - the descriptor for the active algorithm
	 * @param {{ Algorithm: string, Parameters: Object }} pCurrentSettings
	 */
	_buildLayoutParameterFormSection(pContainer, pAlgoDescriptor, pCurrentSettings)
	{
		if (!pAlgoDescriptor) return;

		let tmpHasManifest = !!(pAlgoDescriptor.ParameterManifest && pAlgoDescriptor.ParameterManifest.Descriptors);
		let tmpMetacontrollerType = this._resolveMetacontrollerServiceType();

		if (tmpHasManifest && tmpMetacontrollerType)
		{
			this._mountLayoutParameterMetacontroller(pContainer, pAlgoDescriptor, pCurrentSettings, tmpMetacontrollerType);
			return;
		}

		// Fallback path — schema-driven hand-rolled inputs.
		let tmpSchema = (pAlgoDescriptor.ParameterSchema) ? pAlgoDescriptor.ParameterSchema : {};
		let tmpParamKeys = Object.keys(tmpSchema);
		if (tmpParamKeys.length === 0) return;

		let tmpParamDivider = document.createElement('div');
		tmpParamDivider.className = 'pict-flow-popup-divider';
		pContainer.appendChild(tmpParamDivider);

		let tmpParamHeader = document.createElement('div');
		tmpParamHeader.className = 'pict-flow-popup-settings-label';
		tmpParamHeader.style.fontWeight = 'bold';
		tmpParamHeader.style.padding = '4px 8px';
		tmpParamHeader.textContent = 'Parameters';
		pContainer.appendChild(tmpParamHeader);

		for (let i = 0; i < tmpParamKeys.length; i++)
		{
			let tmpKey = tmpParamKeys[i];
			let tmpFieldSchema = tmpSchema[tmpKey];
			let tmpCurrentValue = (pCurrentSettings.Parameters && pCurrentSettings.Parameters.hasOwnProperty(tmpKey))
				? pCurrentSettings.Parameters[tmpKey]
				: tmpFieldSchema.Default;

			let tmpRow = document.createElement('div');
			tmpRow.className = 'pict-flow-popup-settings-section';
			tmpRow.style.display = 'flex';
			tmpRow.style.alignItems = 'center';
			tmpRow.style.gap = '8px';

			let tmpRowLabel = document.createElement('label');
			tmpRowLabel.className = 'pict-flow-popup-settings-label';
			tmpRowLabel.textContent = tmpFieldSchema.Label || tmpKey;
			tmpRowLabel.style.flex = '1';
			tmpRow.appendChild(tmpRowLabel);

			let tmpInput = this._buildLayoutParamInput(tmpKey, tmpFieldSchema, tmpCurrentValue);
			tmpRow.appendChild(tmpInput);
			pContainer.appendChild(tmpRow);
		}
	}

	/**
	 * Remove `PictSectionForm-*` views the layout-algorithm popup has
	 * previously registered on the host Pict. Without this, switching
	 * algorithms accumulates dead section views — the metatemplate
	 * generated by the next inject would still reference the old ones.
	 * Idempotent.
	 */
	_evictLayoutFormViews()
	{
		if (!this.pict || !this.pict.views) return;
		let tmpKeys = Object.keys(this.pict.views);
		for (let i = 0; i < tmpKeys.length; i++)
		{
			let tmpKey = tmpKeys[i];
			if (tmpKey.indexOf('PictSectionForm-') === 0 && tmpKey.indexOf('PictFlowLayout') > 0)
			{
				delete this.pict.views[tmpKey];
				continue;
			}
			// Match any previously-injected layout-algorithm section by hash
			// suffix (manifests use unique algorithm-suffixed section names).
			if (tmpKey.indexOf('PictSectionForm-PFL') === 0)
			{
				delete this.pict.views[tmpKey];
			}
		}
		this._LayoutFormMetacontroller = null;
	}

	/**
	 * Look up which form-metacontroller service is registered on the host
	 * Pict instance. pict-section-form has been published under both
	 * 'PictFormMetacontroller' and (older) 'PictViewFormMetacontroller'
	 * names; check both, in that order.
	 * @returns {string|null}
	 */
	_resolveMetacontrollerServiceType()
	{
		if (!this.fable || !this.fable.servicesMap) return null;
		if (this.fable.servicesMap.hasOwnProperty('PictFormMetacontroller'))     return 'PictFormMetacontroller';
		if (this.fable.servicesMap.hasOwnProperty('PictViewFormMetacontroller')) return 'PictViewFormMetacontroller';
		return null;
	}

	/**
	 * Build the parameter form section using a pict-section-form
	 * metacontroller. Creates a host div, binds the active layout
	 * parameters to `pict.AppData.PictFlowLayoutEditor.Parameters`, and
	 * injects the algorithm's `ParameterManifest`. Form-input changes
	 * propagate back to `_FlowData.LayoutParameters` via a single
	 * `change`/`input` listener on the popup container.
	 *
	 * @param {HTMLElement} pContainer
	 * @param {Object} pAlgoDescriptor
	 * @param {{ Algorithm: string, Parameters: Object }} pCurrentSettings
	 * @param {string} pMetacontrollerType - 'PictFormMetacontroller' or 'PictViewFormMetacontroller'
	 */
	_mountLayoutParameterMetacontroller(pContainer, pAlgoDescriptor, pCurrentSettings, pMetacontrollerType)
	{
		let tmpManifest = JSON.parse(JSON.stringify(pAlgoDescriptor.ParameterManifest));
		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;

		// Section header + divider
		let tmpDivider = document.createElement('div');
		tmpDivider.className = 'pict-flow-popup-divider';
		pContainer.appendChild(tmpDivider);

		// Form host div — the metacontroller renders into here. Inline
		// onclick stops popup-close propagation; onchange/oninput drive the
		// _FlowData.LayoutParameters writeback (see _pushFormBack).
		let tmpHostID = `Flow-Toolbar-LayoutForm-${tmpFlowViewIdentifier}`;
		this._LayoutFormHostID = tmpHostID;

		let tmpHostDiv = document.createElement('div');
		tmpHostDiv.id = tmpHostID;
		tmpHostDiv.className = 'pict-flow-popup-layout-form-host';
		tmpHostDiv.setAttribute('data-collapsed', this._LayoutFormExpanded ? 'false' : 'true');
		tmpHostDiv.setAttribute('onclick', 'event.stopPropagation()');
		tmpHostDiv.setAttribute('onchange',
			"_Pict.views['" + tmpFlowViewIdentifier + "']._ToolbarView._pushLayoutFormBack('" + pCurrentSettings.Algorithm + "')");
		tmpHostDiv.setAttribute('oninput',
			"_Pict.views['" + tmpFlowViewIdentifier + "']._ToolbarView._pushLayoutFormBack('" + pCurrentSettings.Algorithm + "')");
		pContainer.appendChild(tmpHostDiv);

		// Bind the layout parameters as the data source for the form.
		// `injectManifestAndRender(manifest, _, UUID)` calls
		// `createDistinctManifest` which prepends the UUID to every descriptor
		// address (so re-injecting the same manifest doesn't collide). We use
		// the algorithm name as the UUID, so the form's expected address is
		// `AppData.<Algorithm>.PictFlowLayoutEditor.Parameters.<Key>` —
		// bind there, not at the unprefixed root.
		let tmpScope = pCurrentSettings.Algorithm;
		this.pict.AppData[tmpScope] = this.pict.AppData[tmpScope] || {};
		this.pict.AppData[tmpScope].PictFlowLayoutEditor = this.pict.AppData[tmpScope].PictFlowLayoutEditor || {};
		this.pict.AppData[tmpScope].PictFlowLayoutEditor.Parameters = JSON.parse(JSON.stringify(pCurrentSettings.Parameters || {}));

		// Always recreate the metacontroller per mount. Reusing the same
		// metacontroller across algorithm switches accumulates section views
		// (each switch's manifest gets injected onto the existing roster) and
		// the metatemplate ends up wedging multiple sections into a single
		// shared destination — only the last one survives. Fresh instance per
		// mount keeps the DOM consistent; we also evict the prior
		// `PictSectionForm-*` views from `pict.views` so they GC cleanly.
		this._evictLayoutFormViews();
		try
		{
			this._LayoutFormMetacontroller = this.fable.instantiateServiceProviderWithoutRegistration(
				pMetacontrollerType,
				{
					ViewIdentifier: `Flow-Toolbar-LayoutForm-MC-${tmpFlowViewIdentifier}-${this.fable.getUUID()}`,
					DefaultDestinationAddress: `#${tmpHostID}`,
					AutoRender: false,
					AutoPopulateAfterRender: true,
					AutoSolveBeforeRender: false
				});
		}
		catch (pError)
		{
			this.log.warn(`Failed to instantiate ${pMetacontrollerType}: ${pError.message}`);
			this._LayoutFormMetacontroller = null;
		}

		if (!this._LayoutFormMetacontroller)
		{
			tmpHostDiv.innerHTML = '<em style="padding:8px;display:block;opacity:0.7;">pict-section-form not available; parameter form skipped.</em>';
			return;
		}

		// Establish the form-container div the metacontroller expects.
		let tmpFormContainerID = `Pict-${this._LayoutFormMetacontroller.UUID}-FormContainer`;
		tmpHostDiv.innerHTML = `<div id="${tmpFormContainerID}" class="pict-form pict-flow-popup-layout-form"></div>`;

		try
		{
			// Use `injectManifest` + explicit per-section destination divs +
			// per-section render. Don't use `injectManifestAndRender` —
			// its metatemplate flow ends up wedging multi-section manifests
			// into a single shared destination (each section's render call
			// uses RenderMethod=replace, blowing the others away). The
			// explicit path gives each section its own destination div and
			// renders them independently.
			let tmpInjectFn = (typeof this._LayoutFormMetacontroller.injectManifest === 'function')
				? this._LayoutFormMetacontroller.injectManifest.bind(this._LayoutFormMetacontroller)
				: null;
			if (!tmpInjectFn) throw new Error('Metacontroller exposes neither injectManifest nor injectManifestAndRender');

			// Pass the algorithm name as the section-hash discriminator so
			// re-injecting the same algorithm gets unique view registrations.
			// (createDistinctManifest does the address-prefixing too — see
			// the per-algorithm AppData binding above.)
			let tmpDistinct = (typeof this._LayoutFormMetacontroller.createDistinctManifest === 'function')
				? this._LayoutFormMetacontroller.createDistinctManifest(tmpManifest, pCurrentSettings.Algorithm)
				: tmpManifest;

			let tmpViews = tmpInjectFn(tmpDistinct);

			// Build a destination div per section view, in order, and render each.
			let tmpFormContainerEl = tmpHostDiv.querySelector(`#${tmpFormContainerID}`);
			if (tmpFormContainerEl)
			{
				let tmpInner = '';
				for (let i = 0; i < tmpViews.length; i++)
				{
					let tmpDest = tmpViews[i].options.DefaultDestinationAddress;
					if (tmpDest && tmpDest.charAt(0) === '#') tmpDest = tmpDest.substring(1);
					tmpInner += `<div id="${tmpDest}" class="pict-form-view"></div>`;
				}
				tmpFormContainerEl.innerHTML = tmpInner;
			}
			// Defer render() to the next microtask so the popup has been
			// appended to the DOM by `_openPopup` — pict-section-form
			// resolves destinations via `document.querySelector`, which
			// can't see detached subtrees. (Same workaround the
			// metacontroller's own `injectManifestAndRender` uses.)
			setTimeout(() =>
			{
				for (let i = 0; i < tmpViews.length; i++)
				{
					tmpViews[i].render();
					if (typeof tmpViews[i].marshalToView === 'function')
					{
						tmpViews[i].marshalToView();
					}
				}
			}, 0);
		}
		catch (pError)
		{
			this.log.warn(`PictViewFlowToolbar: layout-form injection failed: ${pError.message}`);
			tmpHostDiv.innerHTML = `<em style="padding:8px;display:block;opacity:0.7;">Form render error: ${pError.message}</em>`;
			return;
		}

		// Form-change writeback runs through the host div's inline
		// onchange/oninput attributes (set above), which call
		// `_pushLayoutFormBack(algorithm)`.
	}

	/**
	 * Inline handler for layout-parameter form changes. Pushes Informary's
	 * write into AppData back into `_FlowData.LayoutParameters` and
	 * re-applies the layout (when non-Custom). De-bounces via microtask so
	 * multi-key edits collapse to a single layout pass.
	 *
	 * @param {string} pAlgorithm
	 */
	_pushLayoutFormBack(pAlgorithm)
	{
		if (this._LayoutFormPushScheduled) return;
		this._LayoutFormPushScheduled = true;
		Promise.resolve().then(() =>
		{
			this._LayoutFormPushScheduled = false;
			if (!this._FlowView) return;
			let tmpScopedRoot = this.pict.AppData[pAlgorithm] || {};
			let tmpEditorParams = (tmpScopedRoot.PictFlowLayoutEditor || {}).Parameters || {};
			let tmpMerged = Object.assign({}, this._FlowView.getLayoutAlgorithm().Parameters || {}, tmpEditorParams);
			this._FlowView.setLayoutAlgorithm(pAlgorithm, tmpMerged);
		});
	}

	/**
	 * Build a single parameter input row for the layout-algorithm popup.
	 * Wires the input's change handler to update the flow's
	 * `LayoutParameters` and re-apply the layout if non-Custom.
	 *
	 * @param {string} pKey
	 * @param {Object} pSchema - { Type: 'number' | 'string' | 'boolean' | 'enum', Default, Options? }
	 * @param {*} pCurrentValue
	 * @returns {HTMLElement}
	 */
	_buildLayoutParamInput(pKey, pSchema, pCurrentValue)
	{
		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpViewPath = "_Pict.views['" + tmpFlowViewIdentifier + "']._ToolbarView";
		let tmpKeyEsc = pKey.replace(/'/g, "\\'");
		let tmpInput;

		if (pSchema.Type === 'boolean')
		{
			tmpInput = document.createElement('input');
			tmpInput.type = 'checkbox';
			tmpInput.checked = !!pCurrentValue;
			tmpInput.setAttribute('onchange',
				tmpViewPath + "._updateLayoutParameter('" + tmpKeyEsc + "', this.checked)");
		}
		else if (pSchema.Type === 'enum' && Array.isArray(pSchema.Options))
		{
			tmpInput = document.createElement('select');
			tmpInput.className = 'pict-flow-popup-settings-select';
			for (let i = 0; i < pSchema.Options.length; i++)
			{
				let tmpOpt = document.createElement('option');
				tmpOpt.value = pSchema.Options[i];
				tmpOpt.textContent = pSchema.Options[i];
				if (pSchema.Options[i] === pCurrentValue) tmpOpt.selected = true;
				tmpInput.appendChild(tmpOpt);
			}
			tmpInput.setAttribute('onchange',
				tmpViewPath + "._updateLayoutParameter('" + tmpKeyEsc + "', this.value)");
		}
		else if (pSchema.Type === 'number' || pSchema.Type === 'Number' || pSchema.Type === 'PreciseNumber')
		{
			tmpInput = document.createElement('input');
			tmpInput.type = 'number';
			tmpInput.className = 'pict-flow-popup-settings-input';
			let tmpIsPrecise = (pSchema.Type === 'PreciseNumber');
			if (typeof pSchema.Min === 'number') tmpInput.min = String(pSchema.Min);
			if (typeof pSchema.Max === 'number') tmpInput.max = String(pSchema.Max);
			tmpInput.step = tmpIsPrecise ? 'any' : '1';
			tmpInput.value = (pCurrentValue == null) ? '' : String(pCurrentValue);
			tmpInput.style.width = '90px';
			let tmpPreciseFlag = tmpIsPrecise ? 'true' : 'false';
			tmpInput.setAttribute('onchange',
				tmpViewPath + "._updateLayoutNumberParameter('" + tmpKeyEsc + "', this.value, " + tmpPreciseFlag + ")");
		}
		else
		{
			tmpInput = document.createElement('input');
			tmpInput.type = 'text';
			tmpInput.className = 'pict-flow-popup-settings-input';
			tmpInput.value = (pCurrentValue == null) ? '' : String(pCurrentValue);
			tmpInput.style.width = '90px';
			tmpInput.setAttribute('onchange',
				tmpViewPath + "._updateLayoutParameter('" + tmpKeyEsc + "', this.value)");
		}

		tmpInput.setAttribute('onclick', 'event.stopPropagation()');
		return tmpInput;
	}

	/**
	 * Update a single layout parameter on the flow and re-apply the layout
	 * if the configured algorithm is not 'Custom'.
	 * @param {string} pKey
	 * @param {*} pValue
	 */
	_updateLayoutParameter(pKey, pValue)
	{
		if (!this._FlowView) return;
		let tmpSettings = this._FlowView.getLayoutAlgorithm();
		let tmpParams = Object.assign({}, tmpSettings.Parameters || {});
		tmpParams[pKey] = pValue;
		this._FlowView.setLayoutAlgorithm(tmpSettings.Algorithm, tmpParams);
	}

	/**
	 * Inline-handler helper for numeric parameter inputs. Preserves the
	 * raw string when PreciseNumber so big.js / ExpressionParser can use
	 * it without float round-trip drift.
	 *
	 * @param {string} pKey
	 * @param {string} pRawValue
	 * @param {boolean} pIsPrecise
	 */
	_updateLayoutNumberParameter(pKey, pRawValue, pIsPrecise)
	{
		if (pRawValue === '') return;
		if (pIsPrecise)
		{
			this._updateLayoutParameter(pKey, pRawValue);
			return;
		}
		let tmpNum = parseFloat(pRawValue);
		if (isNaN(tmpNum)) return;
		this._updateLayoutParameter(pKey, tmpNum);
	}

	// ── Settings Popup ───────────────────────────────────────────────────

	/**
	 * Build the Settings popup using a template with inline handlers.
	 *
	 * Theme options are iterated via `{~TS:~}` from AppData. Sliders and
	 * selects fire inline handlers that update the FlowView's theme state.
	 *
	 * @param {HTMLElement} pContainer
	 */
	_buildSettingsPopup(pContainer)
	{
		if (!this._FlowView) return;

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpPresetsProvider = this._FlowView._StylePresetsProvider;
		let tmpRendererProvider = this._FlowView._RendererProvider;
		if (!tmpPresetsProvider || !tmpRendererProvider) return;

		// The single "Style" picker surfaces curated presets — each one bundles
		// a ColorTheme + Renderer + EdgeTheme. Per-axis overrides live behind
		// future "Customize" UI; the toolbar shows the preset list only.
		let tmpPresets = tmpPresetsProvider.listPresets();
		let tmpActivePreset = tmpPresetsProvider.getActivePresetHash();

		let tmpThemeOptions = [];
		for (let i = 0; i < tmpPresets.length; i++)
		{
			let tmpPreset = tmpPresets[i];
			tmpThemeOptions.push(
			{
				Value: tmpPreset.Hash,
				Label: tmpPreset.Label || tmpPreset.Hash,
				SelectedAttr: (tmpPreset.Hash === tmpActivePreset) ? ' selected="selected"' : ''
			});
		}

		let tmpThemeOptionsHTML = this.pict.parseTemplateByHash('Flow-Layout-OptionList', { Options: tmpThemeOptions });

		let tmpNoiseLevel = Math.round(tmpRendererProvider.getNoiseLevel() * 100);
		let tmpActiveRenderer = tmpRendererProvider.getActiveRenderer();
		let tmpNoiseEnabled = !!(tmpActiveRenderer && tmpActiveRenderer.NoiseConfig && tmpActiveRenderer.NoiseConfig.Enabled);
		let tmpNoiseDisplay = tmpNoiseEnabled ? '' : 'display:none;';

		this.pict.ContentAssignment.assignContent(pContainer,
			'<div class="pict-flow-popup-settings-section">'
			+ '<label class="pict-flow-popup-settings-label">Theme</label>'
			+ '<select class="pict-flow-popup-settings-select"'
			+ ' onclick="event.stopPropagation()"'
			+ ' onchange="_Pict.views[\'' + tmpFlowViewIdentifier + '\']._ToolbarView._handleThemeSelectChange(this.value)">'
			+ tmpThemeOptionsHTML
			+ '</select>'
			+ '</div>'
			+ '<div class="pict-flow-popup-divider"></div>'
			+ '<div class="pict-flow-popup-settings-section pict-flow-popup-settings-noise" data-settings-type="noise" style="' + tmpNoiseDisplay + '">'
			+ '<label class="pict-flow-popup-settings-label">Noise</label>'
			+ '<div class="pict-flow-popup-settings-slider-row">'
			+ '<input type="range" class="pict-flow-popup-settings-slider" min="0" max="100" value="' + tmpNoiseLevel + '"'
			+ ' onclick="event.stopPropagation()"'
			+ ' onpointerdown="event.stopPropagation()"'
			+ ' oninput="_Pict.views[\'' + tmpFlowViewIdentifier + '\']._ToolbarView._handleNoiseSliderInput(this)" />'
			+ '<span class="pict-flow-popup-settings-slider-value">' + tmpNoiseLevel + '%</span>'
			+ '</div>'
			+ '</div>');
	}

	/**
	 * Inline handler — apply selected flow theme and refresh the noise
	 * slider visibility (some themes don't expose noise).
	 */
	_handleThemeSelectChange(pThemeKey)
	{
		if (!this._FlowView) return;
		this._FlowView.setTheme(pThemeKey);

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpPopupEl = document.getElementById(`Flow-Toolbar-Popup-${tmpFlowViewIdentifier}`);
		if (tmpPopupEl) this._refreshNoiseSlider(tmpPopupEl);
	}

	/**
	 * Inline handler — push slider position into the noise level and
	 * update the percentage label adjacent to it.
	 */
	_handleNoiseSliderInput(pSlider)
	{
		let tmpRaw = parseInt(pSlider.value, 10);
		if (isNaN(tmpRaw)) return;
		let tmpLevel = tmpRaw / 100;
		let tmpValueLabel = pSlider.parentNode ? pSlider.parentNode.querySelector('.pict-flow-popup-settings-slider-value') : null;
		if (tmpValueLabel) tmpValueLabel.textContent = tmpRaw + '%';
		if (this._FlowView) this._FlowView.setNoiseLevel(tmpLevel);
	}

	/**
	 * Show or hide the noise slider based on whether the active theme supports noise.
	 * @param {HTMLElement} pContainer - The settings popup container
	 */
	_refreshNoiseSlider(pContainer)
	{
		let tmpNoiseSection = pContainer.querySelector('[data-settings-type="noise"]');
		if (!tmpNoiseSection) return;

		let tmpRendererProvider = this._FlowView._RendererProvider;
		if (!tmpRendererProvider) { tmpNoiseSection.style.display = 'none'; return; }
		let tmpRenderer = tmpRendererProvider.getActiveRenderer();
		if (tmpRenderer && tmpRenderer.NoiseConfig && tmpRenderer.NoiseConfig.Enabled)
		{
			tmpNoiseSection.style.display = '';
			// Update slider value to reflect renderer default
			let tmpSlider = tmpNoiseSection.querySelector('.pict-flow-popup-settings-slider');
			let tmpValueLabel = tmpNoiseSection.querySelector('.pict-flow-popup-settings-slider-value');
			if (tmpSlider)
			{
				let tmpLevel = Math.round(tmpRendererProvider.getNoiseLevel() * 100);
				tmpSlider.value = String(tmpLevel);
				if (tmpValueLabel) tmpValueLabel.textContent = tmpLevel + '%';
			}
		}
		else
		{
			tmpNoiseSection.style.display = 'none';
		}
	}

	// ── Toolbar Mode Switching ────────────────────────────────────────────

	/**
	 * Switch between docked, floating, and collapsed modes.
	 * @param {string} pMode - 'docked' | 'floating' | 'collapsed'
	 */
	_setToolbarMode(pMode)
	{
		// Close any active popup first
		this._closePopup();

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
		let tmpBar = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-Bar-${tmpFlowViewIdentifier}`);
		let tmpCollapsed = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-Collapsed-${tmpFlowViewIdentifier}`);

		switch (pMode)
		{
			case 'docked':
				// Show toolbar bar
				if (tmpBar.length > 0) tmpBar[0].style.display = '';
				// Hide collapsed button
				if (tmpCollapsed.length > 0) tmpCollapsed[0].classList.remove('visible');
				// Hide floating toolbar
				if (this._FloatingToolbarView) this._FloatingToolbarView.hide();
				break;

			case 'floating':
				// Hide toolbar bar
				if (tmpBar.length > 0) tmpBar[0].style.display = 'none';
				// Hide collapsed button
				if (tmpCollapsed.length > 0) tmpCollapsed[0].classList.remove('visible');
				// Show floating toolbar
				this._showFloatingToolbar();
				break;

			case 'collapsed':
				// Hide toolbar bar
				if (tmpBar.length > 0) tmpBar[0].style.display = 'none';
				// Show collapsed button
				if (tmpCollapsed.length > 0) tmpCollapsed[0].classList.add('visible');
				// Hide floating toolbar
				if (this._FloatingToolbarView) this._FloatingToolbarView.hide();
				break;
		}

		this._ToolbarMode = pMode;
	}

	/**
	 * Lazily create and show the floating toolbar.
	 */
	_showFloatingToolbar()
	{
		if (!this._FlowView) return;

		if (!this._FloatingToolbarView)
		{
			let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;
			this._FloatingToolbarView = this.fable.instantiateServiceProviderWithoutRegistration(
				'PictViewFlowFloatingToolbar',
				{
					FlowViewIdentifier: tmpFlowViewIdentifier,
					DefaultDestinationAddress: `#Flow-FloatingToolbar-Container-${tmpFlowViewIdentifier}`,
					EnableAddNode: this.options.EnableAddNode,
					EnableCardPalette: this.options.EnableCardPalette
				}
			);
			this._FloatingToolbarView._ToolbarView = this;
			this._FloatingToolbarView._FlowView = this._FlowView;
			this._FloatingToolbarView.render();
		}

		this._FloatingToolbarView.show();
	}

	// ── Node Placement Helpers ────────────────────────────────────────────

	/**
	 * Add a node at the center of the visible viewport.
	 * @param {string} pNodeType - The node type hash
	 */
	_addNodeAtCenter(pNodeType)
	{
		if (!this._FlowView) return;

		let tmpVS = this._FlowView.viewState;

		// Calculate the center of the visible SVG area
		let tmpSVGContainer = this._FlowView._SVGElement;
		let tmpWidth = tmpSVGContainer ? tmpSVGContainer.clientWidth : 600;
		let tmpHeight = tmpSVGContainer ? tmpSVGContainer.clientHeight : 400;

		let tmpCenterX = (-tmpVS.PanX + tmpWidth / 2) / tmpVS.Zoom;
		let tmpCenterY = (-tmpVS.PanY + tmpHeight / 2) / tmpVS.Zoom;

		// Slight offset to avoid stacking
		let tmpNodeCount = this._FlowView.flowData.Nodes.length;
		tmpCenterX += (tmpNodeCount % 5) * 30;
		tmpCenterY += (tmpNodeCount % 5) * 30;

		this._FlowView.addNode(pNodeType, tmpCenterX, tmpCenterY);
	}

	/**
	 * Add a node from a palette card click.
	 * @param {string} pCardType - The card type hash
	 */
	_addCardFromPalette(pCardType)
	{
		if (!this._FlowView) return;

		let tmpVS = this._FlowView.viewState;
		let tmpX = (-tmpVS.PanX + 200) / tmpVS.Zoom;
		let tmpY = (-tmpVS.PanY + 200) / tmpVS.Zoom;

		// Offset to avoid overlap
		let tmpNodeCount = this._FlowView.flowData.Nodes.length;
		tmpX += (tmpNodeCount % 5) * 40;
		tmpY += (tmpNodeCount % 5) * 40;

		this._FlowView.addNode(pCardType, tmpX, tmpY);
	}

	// ── Action Handler ────────────────────────────────────────────────────

	/**
	 * Handle a toolbar action
	 * @param {string} pAction
	 */
	_handleToolbarAction(pAction)
	{
		if (!this._FlowView) return;

		let tmpFlowViewIdentifier = this.options.FlowViewIdentifier;

		switch (pAction)
		{
			case 'add-node':
				this._openPopup('add-node');
				break;

			case 'delete-selected':
				this._FlowView.deleteSelected();
				break;

			case 'zoom-in':
				this._FlowView.setZoom(this._FlowView.viewState.Zoom + this._FlowView.options.ZoomStep);
				break;

			case 'zoom-out':
				this._FlowView.setZoom(this._FlowView.viewState.Zoom - this._FlowView.options.ZoomStep);
				break;

			case 'zoom-fit':
				this._FlowView.zoomToFit();
				break;

			case 'auto-layout':
				// Legacy alias kept for backward compatibility with any
				// caller still firing 'auto-layout'. The toolbar's "Auto"
				// button now uses 'apply-current-layout' (below).
				this._FlowView.autoLayout();
				break;

			case 'apply-current-layout':
				// Respects whichever algorithm is configured in the
				// Algorithm popup. Falls back to Layered when the
				// configured value is 'Custom' or unset (autoLayout's
				// existing behavior — "do something useful").
				this._FlowView.autoLayout();
				break;

			case 'cards-popup':
				this._openPopup('cards');
				break;

			case 'layout-popup':
				this._openPopup('layout');
				break;

			case 'layout-algorithm-popup':
				this._openPopup('layout-algorithm');
				break;

			case 'apply-layout':
				this._FlowView.applyCurrentLayout();
				break;

			case 'settings-popup':
				this._openPopup('settings');
				break;

			case 'toggle-floating':
				if (this._ToolbarMode === 'floating')
				{
					this._setToolbarMode('docked');
				}
				else
				{
					this._setToolbarMode('floating');
				}
				break;

			case 'collapse-toolbar':
				this._setToolbarMode('collapsed');
				break;

			case 'expand-toolbar':
				this._setToolbarMode('docked');
				break;

			case 'fullscreen':
				{
					let tmpIsFullscreen = this._FlowView.toggleFullscreen();
					let tmpIconProvider = this._FlowView._IconProvider;
					let tmpIconElements = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-Fullscreen-Icon-${tmpFlowViewIdentifier}`);
					if (tmpIconElements.length > 0 && tmpIconProvider)
					{
						tmpIconElements[0].innerHTML = tmpIconProvider.getIconSVGMarkup(
							tmpIsFullscreen ? 'exit-fullscreen' : 'fullscreen', 14);
					}
					let tmpFullscreenBtn = this.pict.ContentAssignment.getElement(`#Flow-Toolbar-Fullscreen-${tmpFlowViewIdentifier}`);
					if (tmpFullscreenBtn.length > 0)
					{
						tmpFullscreenBtn[0].setAttribute('title', tmpIsFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen');
					}
				}
				break;

			default:
				this.log.warn(`PictViewFlowToolbar: unknown action '${pAction}'`);
				break;
		}
	}
}

module.exports = PictViewFlowToolbar;

module.exports.default_configuration = _DefaultConfiguration;
