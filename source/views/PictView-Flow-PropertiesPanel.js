const libPictView = require('pict-view');

const _DefaultConfiguration =
{
	ViewIdentifier: 'Flow-PropertiesPanel',

	AutoRender: false,

	Templates:
	[
		{
			Hash: 'Flow-InfoPanel-Wrapper',
			Template: '<div class="pict-flow-info-panel">{~D:Record.PanelContent~}</div>'
		},
		{
			Hash: 'Flow-InfoPanel-Header-Icon',
			Template: '<div class="pict-flow-info-panel-header with-icon">{~D:Record.Icon~} {~D:Record.Label~}</div>'
		},
		{
			Hash: 'Flow-InfoPanel-Header',
			Template: '<div class="pict-flow-info-panel-header">{~D:Record.Label~}</div>'
		},
		{
			Hash: 'Flow-InfoPanel-Description',
			Template: '<div class="pict-flow-info-panel-description">{~D:Record.Description~}</div>'
		},
		{
			Hash: 'Flow-InfoPanel-Badges',
			Template: '<div class="pict-flow-info-panel-badges">{~D:Record.BadgesContent~}</div>'
		},
		{
			Hash: 'Flow-InfoPanel-Badge-Category',
			Template: '<span class="pict-flow-info-panel-badge category">{~D:Record.Category~}</span>'
		},
		{
			Hash: 'Flow-InfoPanel-Badge-Code',
			Template: '<span class="pict-flow-info-panel-badge code">{~D:Record.Code~}</span>'
		},
		{
			Hash: 'Flow-InfoPanel-Section-Inputs',
			Template: '<div class="pict-flow-info-panel-section"><div class="pict-flow-info-panel-section-title">Inputs</div>{~D:Record.PortsContent~}</div>'
		},
		{
			Hash: 'Flow-InfoPanel-Section-Outputs',
			Template: '<div class="pict-flow-info-panel-section"><div class="pict-flow-info-panel-section-title">Outputs</div>{~D:Record.PortsContent~}</div>'
		},
		{
			Hash: 'Flow-InfoPanel-Port-Input',
			Template: '<div class="pict-flow-info-panel-port input">{~D:Record.Label~}{~D:Record.Constraint~}</div>'
		},
		{
			Hash: 'Flow-InfoPanel-Port-Output',
			Template: '<div class="pict-flow-info-panel-port output">{~D:Record.Label~}</div>'
		},
		{
			Hash: 'Flow-InfoPanel-Port-Constraint',
			Template: ' <span class="pict-flow-info-panel-port-constraint">{~D:Record.ConstraintText~}</span>'
		},
		{
			Hash: 'Flow-InfoPanel-Section-Generic',
			Template: '<div class="pict-flow-info-panel-section"><div class="pict-flow-info-panel-section-title">{~D:Record.SectionTitle~}</div>{~D:Record.PortsContent~}</div>'
		},
		{
			Hash: 'Flow-InfoPanel-Port-Event',
			Template: '<div class="pict-flow-info-panel-port event">{~D:Record.Label~}</div>'
		},
		{
			Hash: 'Flow-InfoPanel-Port-Value',
			Template: '<div class="pict-flow-info-panel-port value">{~D:Record.Label~}{~D:Record.DataType~}</div>'
		},
		{
			Hash: 'Flow-InfoPanel-Port-DataType',
			Template: ' <span class="pict-flow-info-panel-port-constraint">{~D:Record.DataTypeText~}</span>'
		},
		{
			Hash: 'Flow-NodeProps-Editor',
			// Inline oninput/onpointerdown wired to the FlowView's helper —
			// see PictViewFlow._applyNodePropChange / _stopEvent.
			Template: '<div class="pict-flow-node-props-fields" data-flow-view="{~D:Record.FlowViewIdentifier~}" data-node-hash="{~D:Record.NodeHash~}">'
				+ '<div class="pict-flow-node-props-field"><label class="pict-flow-node-props-label">Title</label><input type="text" class="pict-flow-node-props-input" data-prop="Title" value="{~D:Record.Title~}" oninput="_Pict.views[\'{~D:Record.FlowViewIdentifier~}\']._applyNodePropChange(\'{~D:Record.NodeHash~}\', this.getAttribute(\'data-prop\'), this.value, this.type, event)" onpointerdown="event.stopPropagation()" /></div>'
				+ '<div class="pict-flow-node-props-field"><label class="pict-flow-node-props-label">Width</label><input type="number" class="pict-flow-node-props-input" data-prop="Width" value="{~D:Record.Width~}" min="60" step="10" oninput="_Pict.views[\'{~D:Record.FlowViewIdentifier~}\']._applyNodePropChange(\'{~D:Record.NodeHash~}\', this.getAttribute(\'data-prop\'), this.value, this.type, event)" onpointerdown="event.stopPropagation()" /></div>'
				+ '<div class="pict-flow-node-props-field"><label class="pict-flow-node-props-label">Height</label><input type="number" class="pict-flow-node-props-input" data-prop="Height" value="{~D:Record.Height~}" min="40" step="10" oninput="_Pict.views[\'{~D:Record.FlowViewIdentifier~}\']._applyNodePropChange(\'{~D:Record.NodeHash~}\', this.getAttribute(\'data-prop\'), this.value, this.type, event)" onpointerdown="event.stopPropagation()" /></div>'
				+ '<div class="pict-flow-node-props-field"><label class="pict-flow-node-props-label">Body Fill</label><input type="color" class="pict-flow-node-props-input pict-flow-node-props-color" data-prop="Style.BodyFill" value="{~D:Record.BodyFillValue~}" oninput="_Pict.views[\'{~D:Record.FlowViewIdentifier~}\']._applyNodePropChange(\'{~D:Record.NodeHash~}\', this.getAttribute(\'data-prop\'), this.value, this.type, event)" onpointerdown="event.stopPropagation()" /></div>'
				+ '<div class="pict-flow-node-props-field"><label class="pict-flow-node-props-label">Body Stroke</label><input type="color" class="pict-flow-node-props-input pict-flow-node-props-color" data-prop="Style.BodyStroke" value="{~D:Record.BodyStrokeValue~}" oninput="_Pict.views[\'{~D:Record.FlowViewIdentifier~}\']._applyNodePropChange(\'{~D:Record.NodeHash~}\', this.getAttribute(\'data-prop\'), this.value, this.type, event)" onpointerdown="event.stopPropagation()" /></div>'
				+ '<div class="pict-flow-node-props-field"><label class="pict-flow-node-props-label">Stroke Width</label><input type="number" class="pict-flow-node-props-input" data-prop="Style.BodyStrokeWidth" value="{~D:Record.BodyStrokeWidthValue~}" min="0" max="10" step="0.5" oninput="_Pict.views[\'{~D:Record.FlowViewIdentifier~}\']._applyNodePropChange(\'{~D:Record.NodeHash~}\', this.getAttribute(\'data-prop\'), this.value, this.type, event)" onpointerdown="event.stopPropagation()" /></div>'
				+ '<div class="pict-flow-node-props-field"><label class="pict-flow-node-props-label">Title Bar</label><input type="color" class="pict-flow-node-props-input pict-flow-node-props-color" data-prop="Style.TitleBarColor" value="{~D:Record.TitleBarColorValue~}" oninput="_Pict.views[\'{~D:Record.FlowViewIdentifier~}\']._applyNodePropChange(\'{~D:Record.NodeHash~}\', this.getAttribute(\'data-prop\'), this.value, this.type, event)" onpointerdown="event.stopPropagation()" /></div>'
				+ '</div>'
		}
	]
};

/**
 * PictView-Flow-PropertiesPanel
 *
 * Renders and manages all open properties panels on the flow graph.
 * Panels are SVG foreignObject elements containing HTML, placed inside
 * the viewport group so they zoom/pan with the graph.
 *
 * Responsibilities:
 *   - Reconcile DOM (add new panels, remove closed ones, update positions)
 *   - Render tether lines from each panel to its node
 *   - Manage panel instance cache (PictFlowCardPropertiesPanel subclasses)
 *   - Isolate HTML events from SVG interactions
 */
class PictViewFlowPropertiesPanel extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultConfiguration)), pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'PictViewFlowPropertiesPanel';

		this._FlowView = null;

		// Cache of active panel instances: Map<panelHash, PictFlowCardPropertiesPanel>
		this._PanelInstances = {};
	}

	/**
	 * Render all open panels and their tethers.
	 *
	 * Uses DOM reconciliation for panels (to preserve live HTML state)
	 * and clear-and-rebuild for tethers (trivial SVG lines).
	 *
	 * @param {Array} pOpenPanels - Array of panel data objects from _FlowData.OpenPanels
	 * @param {SVGGElement} pPanelsLayer - The SVG <g> for panel foreignObjects
	 * @param {SVGGElement} pTethersLayer - The SVG <g> for tether lines
	 * @param {string|null} pSelectedTetherHash - Hash of the selected tether's panel, or null
	 */
	renderPanels(pOpenPanels, pPanelsLayer, pTethersLayer, pSelectedTetherHash)
	{
		if (!pPanelsLayer || !pTethersLayer) return;
		if (!this._FlowView) return;

		let tmpOpenPanels = Array.isArray(pOpenPanels) ? pOpenPanels : [];

		// --- Reconcile panels layer (add new, remove closed, update positions) ---
		let tmpExistingPanelHashes = new Set();
		let tmpExistingForeignObjects = pPanelsLayer.querySelectorAll('.pict-flow-panel-foreign-object');
		for (let i = 0; i < tmpExistingForeignObjects.length; i++)
		{
			tmpExistingPanelHashes.add(tmpExistingForeignObjects[i].getAttribute('data-panel-hash'));
		}

		let tmpDesiredPanelHashes = new Set();
		for (let i = 0; i < tmpOpenPanels.length; i++)
		{
			tmpDesiredPanelHashes.add(tmpOpenPanels[i].Hash);
		}

		// Remove panels that are no longer open
		for (let i = 0; i < tmpExistingForeignObjects.length; i++)
		{
			let tmpHash = tmpExistingForeignObjects[i].getAttribute('data-panel-hash');
			if (!tmpDesiredPanelHashes.has(tmpHash))
			{
				tmpExistingForeignObjects[i].remove();
				// Destroy cached instance
				if (this._PanelInstances[tmpHash])
				{
					this._PanelInstances[tmpHash].destroy();
					delete this._PanelInstances[tmpHash];
				}
			}
		}

		// Add or update panels
		for (let i = 0; i < tmpOpenPanels.length; i++)
		{
			let tmpPanelData = tmpOpenPanels[i];

			if (tmpExistingPanelHashes.has(tmpPanelData.Hash))
			{
				// Update position of existing panel
				let tmpFO = pPanelsLayer.querySelector(`[data-panel-hash="${tmpPanelData.Hash}"]`);
				if (tmpFO)
				{
					tmpFO.setAttribute('x', String(tmpPanelData.X));
					tmpFO.setAttribute('y', String(tmpPanelData.Y));
					tmpFO.setAttribute('width', String(tmpPanelData.Width));
					tmpFO.setAttribute('height', String(tmpPanelData.Height));
				}
			}
			else
			{
				// Create new panel
				this._createPanelForeignObject(tmpPanelData, pPanelsLayer);
			}
		}

		// --- Clear and rebuild tethers ---
		while (pTethersLayer.firstChild)
		{
			pTethersLayer.removeChild(pTethersLayer.firstChild);
		}

		for (let i = 0; i < tmpOpenPanels.length; i++)
		{
			let tmpIsSelected = (pSelectedTetherHash === tmpOpenPanels[i].Hash);
			this._renderTether(tmpOpenPanels[i], pTethersLayer, tmpIsSelected);
		}
	}

	/**
	 * Create a foreignObject containing the panel chrome and content.
	 * Delegates to the PanelChrome provider for template-based chrome creation,
	 * then renders panel content into the body container.
	 *
	 * @param {Object} pPanelData - Panel data from OpenPanels
	 * @param {SVGGElement} pPanelsLayer
	 */
	_createPanelForeignObject(pPanelData, pPanelsLayer)
	{
		let tmpPanelChromeProvider = this._FlowView._PanelChromeProvider;
		if (!tmpPanelChromeProvider) return;

		let tmpBody = tmpPanelChromeProvider.createPanelForeignObject(pPanelData, pPanelsLayer);

		// Render the panel content into the Properties tab pane
		if (tmpBody)
		{
			this._renderPanelContent(pPanelData, tmpBody);
		}

		let tmpFO = pPanelsLayer.querySelector(`[data-panel-hash="${pPanelData.Hash}"]`);
		if (tmpFO)
		{
			// Render appearance and help tabs. Tab-switching click handlers
			// are inline `onclick=` attributes in Flow-PanelChrome-Template
			// that call FlowView._handlePanelTabClick → switchPanelTab.
			this._renderAppearanceTab(pPanelData, tmpFO);
			this._renderHelpTab(pPanelData, tmpFO);
		}
	}

	/**
	 * Instantiate (or reuse) the panel type implementation and render into the body container.
	 *
	 * @param {Object} pPanelData
	 * @param {HTMLDivElement} pBodyContainer
	 */
	_renderPanelContent(pPanelData, pBodyContainer)
	{
		let tmpNodeData = this._FlowView.getNode(pPanelData.NodeHash);
		if (!tmpNodeData) return;

		let tmpNodeTypeConfig = this._FlowView._NodeTypeProvider.getNodeType(tmpNodeData.Type);
		if (!tmpNodeTypeConfig) return;

		// If no PropertiesPanel is configured, render the auto-generated info panel
		if (!tmpNodeTypeConfig.PropertiesPanel)
		{
			this._renderInfoPanelContent(pBodyContainer, tmpNodeData, tmpNodeTypeConfig);
			return;
		}

		let tmpPanelConfig = tmpNodeTypeConfig.PropertiesPanel;
		let tmpPanelType = tmpPanelConfig.PanelType || 'Base';

		// Try to get a registered panel type service
		let tmpServiceName = `PictFlowCardPropertiesPanel-${tmpPanelType}`;
		let tmpInstance = null;

		if (this._PanelInstances[pPanelData.Hash])
		{
			// Reuse existing instance
			tmpInstance = this._PanelInstances[pPanelData.Hash];
		}
		else
		{
			// Create a new instance
			if (this.fable.servicesMap.hasOwnProperty(tmpServiceName))
			{
				tmpInstance = this.fable.instantiateServiceProviderWithoutRegistration(tmpServiceName, tmpPanelConfig);
			}
			else if (this.fable.servicesMap.hasOwnProperty('PictFlowCardPropertiesPanel'))
			{
				// Fall back to base class
				tmpInstance = this.fable.instantiateServiceProviderWithoutRegistration('PictFlowCardPropertiesPanel', tmpPanelConfig);
			}

			if (tmpInstance)
			{
				tmpInstance._FlowView = this._FlowView;
				this._PanelInstances[pPanelData.Hash] = tmpInstance;
			}
		}

		if (tmpInstance)
		{
			tmpInstance.render(pBodyContainer, tmpNodeData);
		}

		// After the form renders, append port summary sections showing
		// event inputs, event outputs, and state outputs.
		// SettingsInputs are already visible as form fields above.
		this._renderPortSummary(pBodyContainer, tmpNodeTypeConfig);
	}

	/**
	 * Render an auto-generated info panel for nodes without a configured PropertiesPanel.
	 * Shows the node type, description, and a summary of input/output ports with
	 * their connection constraints.
	 *
	 * Uses configuration-based templates from _DefaultConfiguration.Templates
	 * rendered via pict.parseTemplateByHash().
	 *
	 * @param {HTMLDivElement} pContainer
	 * @param {Object} pNodeData
	 * @param {Object} pNodeTypeConfig
	 */
	_renderInfoPanelContent(pContainer, pNodeData, pNodeTypeConfig)
	{
		let tmpMeta = pNodeTypeConfig.CardMetadata || {};
		let tmpPorts = pNodeTypeConfig.DefaultPorts || [];

		let tmpInputs = tmpPorts.filter((pPort) => pPort.Direction === 'input');
		let tmpOutputs = tmpPorts.filter((pPort) => pPort.Direction === 'output');

		let tmpLabel = pNodeTypeConfig.Label || pNodeData.Type;

		// Build content by rendering configuration-based templates
		let tmpContentParts = [];

		// Header
		let tmpIconProvider = this._FlowView._IconProvider;
		if (tmpMeta.Icon && tmpIconProvider && !tmpIconProvider.isEmojiIcon(tmpMeta.Icon))
		{
			// SVG icon markup for the header
			let tmpResolvedKey = tmpIconProvider.resolveIconKey(tmpMeta);
			let tmpIconMarkup = tmpIconProvider.getIconSVGMarkup(tmpResolvedKey, 18);
			tmpContentParts.push(this.pict.parseTemplateByHash('Flow-InfoPanel-Header-Icon', { Icon: tmpIconMarkup, Label: tmpLabel }));
		}
		else if (tmpMeta.Icon)
		{
			tmpContentParts.push(this.pict.parseTemplateByHash('Flow-InfoPanel-Header-Icon', { Icon: tmpMeta.Icon, Label: tmpLabel }));
		}
		else if (tmpIconProvider)
		{
			// No icon specified — render default fallback
			let tmpDefaultMarkup = tmpIconProvider.getIconSVGMarkup('default', 18);
			tmpContentParts.push(this.pict.parseTemplateByHash('Flow-InfoPanel-Header-Icon', { Icon: tmpDefaultMarkup, Label: tmpLabel }));
		}
		else
		{
			tmpContentParts.push(this.pict.parseTemplateByHash('Flow-InfoPanel-Header', { Label: tmpLabel }));
		}

		// Description
		if (tmpMeta.Description)
		{
			tmpContentParts.push(this.pict.parseTemplateByHash('Flow-InfoPanel-Description', { Description: tmpMeta.Description }));
		}

		// Category + Code badges
		if (tmpMeta.Category || tmpMeta.Code)
		{
			let tmpBadgesContent = '';
			if (tmpMeta.Category)
			{
				tmpBadgesContent += this.pict.parseTemplateByHash('Flow-InfoPanel-Badge-Category', { Category: tmpMeta.Category });
			}
			if (tmpMeta.Code)
			{
				tmpBadgesContent += this.pict.parseTemplateByHash('Flow-InfoPanel-Badge-Code', { Code: tmpMeta.Code });
			}
			tmpContentParts.push(this.pict.parseTemplateByHash('Flow-InfoPanel-Badges', { BadgesContent: tmpBadgesContent }));
		}

		// Inputs
		if (tmpInputs.length > 0)
		{
			let tmpPortsContent = '';
			for (let i = 0; i < tmpInputs.length; i++)
			{
				let tmpPort = tmpInputs[i];
				let tmpConstraint = this._getPortConstraintHTML(tmpPort);
				tmpPortsContent += this.pict.parseTemplateByHash('Flow-InfoPanel-Port-Input', { Label: tmpPort.Label || 'In', Constraint: tmpConstraint });
			}
			tmpContentParts.push(this.pict.parseTemplateByHash('Flow-InfoPanel-Section-Inputs', { PortsContent: tmpPortsContent }));
		}

		// Outputs
		if (tmpOutputs.length > 0)
		{
			let tmpPortsContent = '';
			for (let i = 0; i < tmpOutputs.length; i++)
			{
				let tmpPort = tmpOutputs[i];
				tmpPortsContent += this.pict.parseTemplateByHash('Flow-InfoPanel-Port-Output', { Label: tmpPort.Label || 'Out' });
			}
			tmpContentParts.push(this.pict.parseTemplateByHash('Flow-InfoPanel-Section-Outputs', { PortsContent: tmpPortsContent }));
		}

		pContainer.innerHTML = this.pict.parseTemplateByHash('Flow-InfoPanel-Wrapper', { PanelContent: tmpContentParts.join('') });
	}

	/**
	 * Render port summary sections below the form panel content.
	 * Shows event inputs, event outputs, and state outputs — the ports
	 * that the form does not cover (since the form only shows SettingsInputs).
	 *
	 * @param {HTMLDivElement} pContainer
	 * @param {Object} pNodeTypeConfig
	 */
	_renderPortSummary(pContainer, pNodeTypeConfig)
	{
		let tmpPorts = pNodeTypeConfig.DefaultPorts || [];
		if (tmpPorts.length === 0) return;

		// Categorize ports by type (settings are already shown as form fields)
		let tmpEventInputs = [];
		let tmpEventOutputs = [];
		let tmpStateOutputs = [];

		for (let i = 0; i < tmpPorts.length; i++)
		{
			let tmpPort = tmpPorts[i];
			let tmpPortType = tmpPort.PortType || '';

			if (tmpPortType === 'event-in')
			{
				tmpEventInputs.push(tmpPort);
			}
			else if (tmpPortType === 'event-out' || tmpPortType === 'error')
			{
				tmpEventOutputs.push(tmpPort);
			}
			else if (tmpPortType === 'value')
			{
				tmpStateOutputs.push(tmpPort);
			}
		}

		// Only render if there are non-settings ports to show
		if (tmpEventInputs.length === 0 && tmpEventOutputs.length === 0 && tmpStateOutputs.length === 0)
		{
			return;
		}

		let tmpSummaryParts = [];

		// Event Inputs
		if (tmpEventInputs.length > 0)
		{
			let tmpPortsContent = '';
			for (let i = 0; i < tmpEventInputs.length; i++)
			{
				tmpPortsContent += this.pict.parseTemplateByHash('Flow-InfoPanel-Port-Event', { Label: tmpEventInputs[i].Label || tmpEventInputs[i].Name || 'Event In' });
			}
			tmpSummaryParts.push(this.pict.parseTemplateByHash('Flow-InfoPanel-Section-Generic', { SectionTitle: 'Event Inputs', PortsContent: tmpPortsContent }));
		}

		// Event Outputs
		if (tmpEventOutputs.length > 0)
		{
			let tmpPortsContent = '';
			for (let i = 0; i < tmpEventOutputs.length; i++)
			{
				let tmpPort = tmpEventOutputs[i];
				let tmpLabel = tmpPort.Label || tmpPort.Name || 'Event Out';
				if (tmpPort.PortType === 'error')
				{
					tmpLabel += ' ⚠';
				}
				tmpPortsContent += this.pict.parseTemplateByHash('Flow-InfoPanel-Port-Event', { Label: tmpLabel });
			}
			tmpSummaryParts.push(this.pict.parseTemplateByHash('Flow-InfoPanel-Section-Generic', { SectionTitle: 'Event Outputs', PortsContent: tmpPortsContent }));
		}

		// State Outputs
		if (tmpStateOutputs.length > 0)
		{
			let tmpPortsContent = '';
			for (let i = 0; i < tmpStateOutputs.length; i++)
			{
				let tmpPort = tmpStateOutputs[i];
				let tmpLabel = tmpPort.Label || tmpPort.Name || 'Output';
				let tmpDataType = '';
				if (tmpPort.DataType)
				{
					tmpDataType = this.pict.parseTemplateByHash('Flow-InfoPanel-Port-DataType', { DataTypeText: tmpPort.DataType });
				}
				tmpPortsContent += this.pict.parseTemplateByHash('Flow-InfoPanel-Port-Value', { Label: tmpLabel, DataType: tmpDataType });
			}
			tmpSummaryParts.push(this.pict.parseTemplateByHash('Flow-InfoPanel-Section-Generic', { SectionTitle: 'State Outputs', PortsContent: tmpPortsContent }));
		}

		if (tmpSummaryParts.length > 0)
		{
			// Create a wrapper div for the port summary and append it to the container
			let tmpSummaryDiv = document.createElement('div');
			tmpSummaryDiv.className = 'pict-flow-info-panel pict-flow-port-summary';
			tmpSummaryDiv.innerHTML = tmpSummaryParts.join('');
			pContainer.appendChild(tmpSummaryDiv);
		}
	}

	/**
	 * Build the constraint markup for a port using configuration templates.
	 *
	 * @param {Object} pPort
	 * @returns {string} Rendered constraint HTML or empty string
	 */
	_getPortConstraintHTML(pPort)
	{
		let tmpMin = (typeof pPort.MinimumInputCount === 'number') ? pPort.MinimumInputCount : 0;
		let tmpMax = (typeof pPort.MaximumInputCount === 'number') ? pPort.MaximumInputCount : -1;

		if (tmpMin > 0 || tmpMax > 0)
		{
			let tmpConstraintText = '';
			if (tmpMax < 0)
			{
				tmpConstraintText = `(min ${tmpMin})`;
			}
			else if (tmpMin === tmpMax)
			{
				tmpConstraintText = `(exactly ${tmpMin})`;
			}
			else
			{
				tmpConstraintText = `(${tmpMin}\u2013${tmpMax})`;
			}
			return this.pict.parseTemplateByHash('Flow-InfoPanel-Port-Constraint', { ConstraintText: tmpConstraintText });
		}
		return '';
	}

	/**
	 * Render the Appearance tab content with node property editor fields.
	 *
	 * @param {Object} pPanelData - Panel data from OpenPanels
	 * @param {Element} pForeignObject - The panel's SVG foreignObject element
	 */
	_renderAppearanceTab(pPanelData, pForeignObject)
	{
		let tmpNodeData = this._FlowView.getNode(pPanelData.NodeHash);
		if (!tmpNodeData) return;

		let tmpAppearancePane = pForeignObject.querySelector('.pict-flow-panel-tab-pane[data-tab="appearance"]');
		if (!tmpAppearancePane) return;

		// Build the template record with safe defaults for Style values
		let tmpStyle = tmpNodeData.Style || {};

		// Resolve default colors from the node type config or CSS token defaults
		let tmpNodeTypeConfig = this._FlowView._NodeTypeProvider.getNodeType(tmpNodeData.Type);
		let tmpDefaultTitleBarColor = 'var(--theme-color-text-primary, #2c3e50)';
		let tmpDefaultBodyFill = '#ffffff';
		let tmpDefaultBodyStroke = '#d0d4d8';
		if (tmpNodeTypeConfig)
		{
			if (tmpNodeTypeConfig.TitleBarColor) tmpDefaultTitleBarColor = tmpNodeTypeConfig.TitleBarColor;
			if (tmpNodeTypeConfig.BodyStyle)
			{
				if (tmpNodeTypeConfig.BodyStyle.fill) tmpDefaultBodyFill = tmpNodeTypeConfig.BodyStyle.fill;
				if (tmpNodeTypeConfig.BodyStyle.stroke) tmpDefaultBodyStroke = tmpNodeTypeConfig.BodyStyle.stroke;
			}
		}

		let tmpRecord =
		{
			Title: tmpNodeData.Title || '',
			Width: tmpNodeData.Width || 180,
			Height: tmpNodeData.Height || 80,
			BodyFillValue: tmpStyle.BodyFill || tmpDefaultBodyFill,
			BodyStrokeValue: tmpStyle.BodyStroke || tmpDefaultBodyStroke,
			BodyStrokeWidthValue: tmpStyle.BodyStrokeWidth || 1,
			TitleBarColorValue: tmpStyle.TitleBarColor || tmpDefaultTitleBarColor,
			NodeHash: pPanelData.NodeHash,
			FlowViewIdentifier: this._FlowView.options.ViewIdentifier
		};

		// Inputs in the rendered template carry inline oninput/onpointerdown
		// handlers that call the FlowView's _applyNodePropChange — no
		// addEventListener wiring needed here.
		this.pict.ContentAssignment.assignContent(tmpAppearancePane,
			this.pict.parseTemplateByHash('Flow-NodeProps-Editor', tmpRecord));
	}

	/**
	 * Render the Help tab content if help text is defined on the node type.
	 * Shows the Help tab button only when help content is available.
	 *
	 * @param {Object} pPanelData - Panel data from OpenPanels
	 * @param {Element} pForeignObject - The panel's SVG foreignObject element
	 */
	_renderHelpTab(pPanelData, pForeignObject)
	{
		let tmpNodeData = this._FlowView.getNode(pPanelData.NodeHash);
		if (!tmpNodeData) return;

		let tmpNodeTypeConfig = this._FlowView._NodeTypeProvider.getNodeType(tmpNodeData.Type);
		if (!tmpNodeTypeConfig) return;

		let tmpHelpText = (tmpNodeTypeConfig.CardMetadata && tmpNodeTypeConfig.CardMetadata.Help)
			? tmpNodeTypeConfig.CardMetadata.Help
			: null;

		if (!tmpHelpText) return;

		// Show the Help tab button
		let tmpHelpTabButton = pForeignObject.querySelector('.pict-flow-panel-tab[data-tab-target="help"]');
		if (tmpHelpTabButton)
		{
			tmpHelpTabButton.style.display = '';
		}

		// Render help content into the help pane
		let tmpHelpPane = pForeignObject.querySelector('.pict-flow-panel-tab-pane[data-tab="help"]');
		if (tmpHelpPane)
		{
			tmpHelpPane.innerHTML = '<div class="pict-flow-panel-help-content">' + tmpHelpText + '</div>';
		}
	}

	/**
	 * Switch the visible tab pane within a panel foreignObject. Invoked
	 * from the inline `onclick` handler on tab buttons in
	 * Flow-PanelChrome-Template via FlowView._handlePanelTabClick.
	 *
	 * @param {Element} pTabElement - The clicked tab button
	 */
	switchPanelTab(pTabElement)
	{
		let tmpForeignObject = pTabElement.closest('foreignObject');
		if (!tmpForeignObject) return;

		let tmpTarget = pTabElement.getAttribute('data-tab-target');
		let tmpTabs = tmpForeignObject.querySelectorAll('.pict-flow-panel-tab');
		let tmpPanes = tmpForeignObject.querySelectorAll('.pict-flow-panel-tab-pane');

		for (let i = 0; i < tmpTabs.length; i++)
		{
			tmpTabs[i].classList.remove('active');
		}
		for (let i = 0; i < tmpPanes.length; i++)
		{
			tmpPanes[i].classList.remove('active');
			tmpPanes[i].style.display = 'none';
		}

		pTabElement.classList.add('active');
		let tmpTargetPane = tmpForeignObject.querySelector('.pict-flow-panel-tab-pane[data-tab="' + tmpTarget + '"]');
		if (tmpTargetPane)
		{
			tmpTargetPane.classList.add('active');
			tmpTargetPane.style.display = 'block';
		}
	}

	/**
	 * Apply a node property change from the properties editor and re-render.
	 *
	 * @param {string} pNodeHash - Hash of the node to update
	 * @param {string} pPropPath - Property path (e.g. 'Title', 'Width', 'Style.BodyFill')
	 * @param {string} pValue - The new value from the input
	 * @param {string} pInputType - The input element type ('text', 'number', 'color')
	 */
	_applyNodePropChange(pNodeHash, pPropPath, pValue, pInputType)
	{
		let tmpNodeData = this._FlowView.getNode(pNodeHash);
		if (!tmpNodeData) return;

		// Parse numeric values
		let tmpValue = pValue;
		if (pInputType === 'number')
		{
			tmpValue = parseFloat(pValue);
			if (isNaN(tmpValue)) return;
		}

		// Apply the value based on the property path
		if (pPropPath === 'Title')
		{
			tmpNodeData.Title = tmpValue;
		}
		else if (pPropPath === 'Width')
		{
			tmpNodeData.Width = tmpValue;
		}
		else if (pPropPath === 'Height')
		{
			tmpNodeData.Height = tmpValue;
		}
		else if (pPropPath.startsWith('Style.'))
		{
			if (!tmpNodeData.Style) tmpNodeData.Style = {};
			let tmpStyleKey = pPropPath.substring(6); // Remove 'Style.' prefix
			tmpNodeData.Style[tmpStyleKey] = tmpValue;
		}

		// Re-render the flow to reflect changes
		this._FlowView.renderFlow();
		this._FlowView.marshalFromView();

		// Fire change event
		if (this._FlowView._EventHandlerProvider)
		{
			this._FlowView._EventHandlerProvider.fireEvent('onFlowChanged', this._FlowView._FlowData);
		}
	}

	/**
	 * Render a tether from a panel to its node.
	 * Delegates to the TetherService for geometry, path generation, and SVG element creation.
	 *
	 * @param {Object} pPanelData
	 * @param {SVGGElement} pTethersLayer
	 * @param {boolean} pIsSelected
	 */
	_renderTether(pPanelData, pTethersLayer, pIsSelected)
	{
		let tmpTetherService = this._FlowView._TetherService;
		if (!tmpTetherService) return;

		let tmpNodeData = this._FlowView.getNode(pPanelData.NodeHash);
		if (!tmpNodeData) return;

		let tmpViewIdentifier = this._FlowView.options.ViewIdentifier;
		tmpTetherService.renderTether(pPanelData, tmpNodeData, pTethersLayer, pIsSelected, tmpViewIdentifier);
	}

	/**
	 * Marshal data from all open panels back into their node Data objects.
	 */
	marshalAllFromPanels()
	{
		for (let tmpPanelHash in this._PanelInstances)
		{
			let tmpInstance = this._PanelInstances[tmpPanelHash];
			if (tmpInstance && tmpInstance._NodeData)
			{
				tmpInstance.marshalFromPanel(tmpInstance._NodeData);
			}
		}
	}

	/**
	 * Destroy a specific panel instance and clean up.
	 *
	 * @param {string} pPanelHash
	 */
	destroyPanel(pPanelHash)
	{
		if (this._PanelInstances[pPanelHash])
		{
			this._PanelInstances[pPanelHash].destroy();
			delete this._PanelInstances[pPanelHash];
		}
	}

	/**
	 * Destroy all panel instances.
	 */
	destroyAllPanels()
	{
		for (let tmpPanelHash in this._PanelInstances)
		{
			this._PanelInstances[tmpPanelHash].destroy();
		}
		this._PanelInstances = {};
	}
}

module.exports = PictViewFlowPropertiesPanel;

module.exports.default_configuration = _DefaultConfiguration;
