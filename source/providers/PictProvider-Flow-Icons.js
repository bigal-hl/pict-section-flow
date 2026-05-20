const libFableServiceProviderBase = require('fable-serviceproviderbase');

/**
 * PictProvider-Flow-Icons
 *
 * Centralized SVG icon provider for the flow diagram.
 * All icons use a duotone style: 2px outline (var(--theme-color-text-primary, #2c3e50)) with
 * subtle filled accent shapes (var(--theme-color-background-secondary, #d5e8f7)).
 *
 * Each icon is registered as a pict template with hash `Flow-Icon-{key}`,
 * making them individually overridable by consumers.
 */

const _ProviderConfiguration =
{
	ProviderIdentifier: 'PictProviderFlowIcons'
};

// ── Default Icon SVG Markup ────────────────────────────────────────────────
// All icons: viewBox="0 0 24 24", duotone style
// Accent fill: var(--theme-color-background-secondary, #d5e8f7), Stroke: var(--theme-color-text-primary, #2c3e50), Stroke-width: 2
//
// The {FlowIconSize} placeholder is replaced at render time with the
// requested pixel size. Each template is a self-contained <svg> element.

const _DefaultIcons =
{
	// ── FlowCard Icons ─────────────────────────────────────────────────────

	'ITE': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="3" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><circle cx="6" cy="18" r="2.5" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><circle cx="18" cy="18" r="2.5" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M12 9v2M9.5 12.5L6 15.5M14.5 12.5L18 15.5" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/></svg>',

	'SW': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M3 12h5M16 12h5M14.8 9.2l3.7-5.2M14.8 14.8l3.7 5.2" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/></svg>',

	'EACH': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/></svg>',

	'FREAD': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7z" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M13 2v7h7" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M9 13h6M9 17h4" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/></svg>',

	'FWRITE': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7z" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M13 2v7h7" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M12 13v5M9.5 15.5L12 13l2.5 2.5" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/></svg>',

	'LOG': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><circle cx="7.5" cy="8" r="1" fill="var(--theme-color-text-primary, #2c3e50)"/><circle cx="7.5" cy="12" r="1" fill="var(--theme-color-text-primary, #2c3e50)"/><circle cx="7.5" cy="16" r="1" fill="var(--theme-color-text-primary, #2c3e50)"/><path d="M11 8h5.5M11 12h5.5M11 16h3.5" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/></svg>',

	'GET': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M21 21l-5.15-5.15" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/></svg>',

	'SET': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4.5 1.5L4 16Z" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M14 6l3 3" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/></svg>',

	// ── UI Icons ───────────────────────────────────────────────────────────

	'fullscreen': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>',

	'exit-fullscreen': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6"/><path d="M20 10h-6V4"/><path d="M14 10l7-7"/><path d="M3 21l7-7"/></svg>',

	'close': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',

	'chevron-down': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',

	// ── Toolbar & Popup Icons ─────────────────────────────────────────────

	'search': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/></svg>',

	'cards': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="16" height="12" rx="2" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M6 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/></svg>',

	'layout': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="10" rx="1.5" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><rect x="13" y="3" width="8" height="6" rx="1.5" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><rect x="3" y="15" width="8" height="6" rx="1.5" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><rect x="13" y="11" width="8" height="10" rx="1.5" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/></svg>',

	'collapse': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M8 12h8" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/></svg>',

	'expand': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M12 8v8M8 12h8" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/></svg>',

	'grip': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="var(--theme-color-text-primary, #2c3e50)"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>',

	'settings': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3" fill="var(--theme-color-background-secondary, #d5e8f7)"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',

	'plus': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M12 8v8M8 12h8" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/></svg>',

	'trash': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><rect x="5" y="6" width="14" height="14" rx="2" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M10 11v6M14 11v6" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/></svg>',

	'save': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M17 21v-8H7v8" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M7 3v5h8" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/></svg>',

	'auto-layout': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="6" rx="1.5" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><rect x="2" y="16" width="8" height="6" rx="1.5" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><rect x="14" y="16" width="8" height="6" rx="1.5" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M12 8v4M6 16v-4h12v4" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/></svg>',

	'zoom-in': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M11 8v6M8 11h6" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/></svg>',

	'zoom-out': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M8 11h6" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/></svg>',

	'zoom-fit': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V3h4"/><path d="M17 3h4v4"/><path d="M21 17v4h-4"/><path d="M7 21H3v-4"/><rect x="7" y="7" width="10" height="10" rx="1.5" fill="var(--theme-color-background-secondary, #d5e8f7)"/></svg>',

	'dock': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="4" rx="1.5" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M12 20V11M8 14l4-4 4 4" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/></svg>',

	'restore': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',

	'delete-node': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><rect x="5" y="6" width="14" height="14" rx="2" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><path d="M10 11v6M14 11v6" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/></svg>',

	// ── Fallback ───────────────────────────────────────────────────────────

	'default': '<svg xmlns="http://www.w3.org/2000/svg" width="{FlowIconSize}" height="{FlowIconSize}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4" fill="var(--theme-color-background-secondary, #d5e8f7)" stroke="var(--theme-color-text-primary, #2c3e50)" stroke-width="2"/><circle cx="12" cy="12" r="2.5" fill="var(--theme-color-text-primary, #2c3e50)"/></svg>'
};

class PictProviderFlowIcons extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _ProviderConfiguration, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'PictProviderFlowIcons';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;

		// Deep copy the default icons
		this._Icons = JSON.parse(JSON.stringify(_DefaultIcons));

		// Merge any additional icons passed via options
		if (pOptions && pOptions.AdditionalIcons && typeof pOptions.AdditionalIcons === 'object')
		{
			let tmpKeys = Object.keys(pOptions.AdditionalIcons);
			for (let i = 0; i < tmpKeys.length; i++)
			{
				this._Icons[tmpKeys[i]] = pOptions.AdditionalIcons[tmpKeys[i]];
			}
		}
	}

	/**
	 * Register all icons as pict templates with hash Flow-Icon-{key}.
	 * Consumers can override any icon by registering a template with
	 * the same hash before the flow view renders.
	 */
	registerIconTemplates()
	{
		if (!this.fable || !this.fable.TemplateProvider)
		{
			this.log.warn('PictProviderFlowIcons: TemplateProvider not available; icon templates not registered.');
			return;
		}

		let tmpKeys = Object.keys(this._Icons);
		for (let i = 0; i < tmpKeys.length; i++)
		{
			let tmpHash = 'Flow-Icon-' + tmpKeys[i];

			// Only register if not already present (allow consumer overrides)
			if (!this.fable.TemplateProvider.getTemplate(tmpHash))
			{
				this.fable.TemplateProvider.addTemplate(tmpHash, this._Icons[tmpKeys[i]]);
			}
		}
	}

	/**
	 * Determine if the given icon string is an emoji (legacy) or an icon key.
	 * Returns true if the string contains characters with code points above U+00FF,
	 * indicating emoji or Unicode symbol characters.
	 *
	 * @param {string} pIconValue - The icon value to check
	 * @returns {boolean}
	 */
	isEmojiIcon(pIconValue)
	{
		if (!pIconValue || typeof pIconValue !== 'string')
		{
			return false;
		}

		for (let i = 0; i < pIconValue.length; i++)
		{
			if (pIconValue.charCodeAt(i) > 255)
			{
				return true;
			}
		}

		return false;
	}

	/**
	 * Resolve the icon key to use for a given CardMetadata object.
	 * Tries Icon field first, then Code field, then falls back to 'default'.
	 *
	 * @param {Object} pCardMetadata - The CardMetadata object
	 * @returns {string} The icon key
	 */
	resolveIconKey(pCardMetadata)
	{
		if (!pCardMetadata)
		{
			return 'default';
		}

		// If Icon is a known key, use it
		if (pCardMetadata.Icon && this._Icons.hasOwnProperty(pCardMetadata.Icon))
		{
			return pCardMetadata.Icon;
		}

		// If Icon is a non-emoji string, check if it matches a registered template
		if (pCardMetadata.Icon && !this.isEmojiIcon(pCardMetadata.Icon))
		{
			return pCardMetadata.Icon;
		}

		// Fall back to Code field
		if (pCardMetadata.Code && this._Icons.hasOwnProperty(pCardMetadata.Code))
		{
			return pCardMetadata.Code;
		}

		return 'default';
	}

	/**
	 * Get the raw SVG markup string for a given icon key, with size applied.
	 *
	 * @param {string} pIconKey - The icon key
	 * @param {number} pSize - Pixel size (default 16)
	 * @returns {string} The SVG markup string
	 */
	getIconSVGMarkup(pIconKey, pSize)
	{
		let tmpSize = pSize || 16;
		let tmpKey = pIconKey || 'default';
		let tmpMarkup = this._Icons[tmpKey] || this._Icons['default'];

		// Replace the size placeholder
		return tmpMarkup.replace(/\{FlowIconSize\}/g, String(tmpSize));
	}

	/**
	 * Render an icon into an SVG canvas context using createElementNS.
	 * Creates a <g> element containing the icon paths, positioned at (pX, pY)
	 * with the given size via a scale transform.
	 *
	 * @param {string} pIconKey - The icon key
	 * @param {SVGElement} pParentGroup - The parent SVG group to append to
	 * @param {number} pX - X position (top-left of icon bounding box)
	 * @param {number} pY - Y position (top-left of icon bounding box)
	 * @param {number} pSize - Pixel size (default 16)
	 * @returns {SVGGElement|null} The created group element, or null on failure
	 */
	renderIconIntoSVGGroup(pIconKey, pParentGroup, pX, pY, pSize)
	{
		if (!pParentGroup)
		{
			return null;
		}

		let tmpSize = pSize || 16;
		let tmpScale = tmpSize / 24;
		let tmpKey = pIconKey || 'default';
		let tmpMarkup = this._Icons[tmpKey] || this._Icons['default'];

		// Replace size placeholder (for consistency, though we scale via transform)
		tmpMarkup = tmpMarkup.replace(/\{FlowIconSize\}/g, '24');

		try
		{
			// Create a temporary SVG element to parse the icon markup
			let tmpTempSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			tmpTempSVG.innerHTML = tmpMarkup;

			// Find the inner SVG (the icon's root <svg> element)
			let tmpInnerSVG = tmpTempSVG.querySelector('svg');
			if (!tmpInnerSVG)
			{
				return null;
			}

			// Create a group to hold the icon content
			let tmpGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			tmpGroup.setAttribute('transform', 'translate(' + pX + ',' + pY + ') scale(' + tmpScale + ')');
			tmpGroup.setAttribute('pointer-events', 'none');
			tmpGroup.setAttribute('class', 'pict-flow-icon-svg');

			// Move all children from the parsed SVG into the group
			while (tmpInnerSVG.childNodes.length > 0)
			{
				tmpGroup.appendChild(tmpInnerSVG.childNodes[0]);
			}

			pParentGroup.appendChild(tmpGroup);
			return tmpGroup;
		}
		catch (pError)
		{
			this.log.warn('PictProviderFlowIcons renderIconIntoSVGGroup error: ' + pError.message);
			return null;
		}
	}

	/**
	 * Get all registered icon keys.
	 * @returns {Array<string>}
	 */
	getIconKeys()
	{
		return Object.keys(this._Icons);
	}

	/**
	 * Check if a given key has a registered icon.
	 * @param {string} pIconKey
	 * @returns {boolean}
	 */
	hasIcon(pIconKey)
	{
		return this._Icons.hasOwnProperty(pIconKey);
	}

	/**
	 * Register a new icon or override an existing one.
	 * @param {string} pIconKey - The icon key
	 * @param {string} pSVGMarkup - The SVG markup string (must contain {FlowIconSize} placeholders)
	 * @returns {boolean}
	 */
	registerIcon(pIconKey, pSVGMarkup)
	{
		if (!pIconKey || !pSVGMarkup)
		{
			return false;
		}

		this._Icons[pIconKey] = pSVGMarkup;

		// Also update the pict template if TemplateProvider is available
		if (this.fable && this.fable.TemplateProvider)
		{
			this.fable.TemplateProvider.addTemplate('Flow-Icon-' + pIconKey, pSVGMarkup);
		}

		return true;
	}
}

module.exports = PictProviderFlowIcons;

module.exports.default_configuration = _ProviderConfiguration;
module.exports.DefaultIcons = _DefaultIcons;
