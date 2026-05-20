const libFableServiceProviderBase = require('fable-serviceproviderbase');

const _ProviderConfiguration =
{
	ProviderIdentifier: 'PictProviderFlowStylePresets'
};

/**
 * PictProvider-Flow-StylePresets
 *
 * The preset registry that the flow editor's primary "Style" picker
 * surfaces. Each preset is a curated triple `(ColorTheme, Renderer,
 * EdgeTheme)` that reproduces one of the legacy monolithic themes —
 * but as a composition of the three new axes.
 *
 * A consumer app can:
 *   - Pick a preset by hash → `flowView.setStylePreset('sketch')`
 *   - Override any axis afterward → `flowView.setColorTheme('flow-cyberpunk')`
 *     leaves the renderer + edge theme alone.
 *   - Register their own preset → `pict.providers['PictProviderFlowStylePresets'].register({...})`
 *
 * ## Preset shape
 *
 * ```javascript
 * {
 *     Hash: 'sketch',
 *     Label: 'Sketch',
 *     ColorTheme: 'flow-sketch',     // a pict-section-theme catalog hash
 *     Renderer:   'sketch',          // a PictProviderFlowRenderer key
 *     EdgeTheme:  'bezier',          // a PictService-Flow-Layout edge theme name
 *     NoiseLevel: 0.4,               // optional — overrides renderer default
 *     Description: 'Hand-drawn paper with jittery brackets'
 * }
 * ```
 *
 * ## API
 *
 * ```javascript
 * pict.providers['PictProviderFlowStylePresets'].register(preset);
 * pict.providers['PictProviderFlowStylePresets'].getPreset(hash);
 * pict.providers['PictProviderFlowStylePresets'].getPresetHashes();
 * pict.providers['PictProviderFlowStylePresets'].applyPreset(hash);
 * pict.providers['PictProviderFlowStylePresets'].getActivePresetHash();
 * ```
 *
 * Apply order on `applyPreset()`:
 *   1. ColorTheme  → delegated to pict.providers.Theme.applyTheme()
 *      (skipped if Theme provider isn't installed in the host)
 *   2. Renderer    → delegated to Flow-Renderer.setRenderer()
 *   3. EdgeTheme   → delegated to FlowView.setEdgeTheme()
 *   4. NoiseLevel  → Flow-Renderer.setNoiseLevel() if provided
 *
 * After any *individual* axis change via `flowView.setColorTheme()`,
 * `setRenderer()`, or `setEdgeTheme()`, the active preset becomes `null`
 * (we're in customized state — no single preset describes the combo).
 */
class PictProviderFlowStylePresets extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _ProviderConfiguration, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'PictProviderFlowStylePresets';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;

		this._ActivePresetHash = null;
		this._Presets = {};

		this._registerBuiltInPresets();
	}

	_registerBuiltInPresets()
	{
		const _DEFAULTS =
		[
			{
				Hash: 'modern',
				Label: 'Modern',
				Description: 'Clean modern look — rounded rectangles, soft shadows, bezier connections.',
				ColorTheme: 'flow-modern',
				Renderer:   'clean',
				EdgeTheme:  'bezier'
			},
			{
				Hash: 'sketch',
				Label: 'Sketch',
				Description: 'Hand-drawn paper — bracket nodes with jitter and Courier text.',
				ColorTheme: 'flow-sketch',
				Renderer:   'sketch',
				EdgeTheme:  'bezier',
				NoiseLevel: 0.4
			},
			{
				Hash: 'blueprint',
				Label: 'Blueprint',
				Description: 'Technical drawing on navy — bracket nodes, dashed lines, orthogonal edges.',
				ColorTheme: 'flow-blueprint',
				Renderer:   'bracket',
				EdgeTheme:  'orthogonal'
			},
			{
				Hash: 'mono',
				Label: 'Monochrome',
				Description: 'Pure black on white — clean rectangles, straight lines, no noise.',
				ColorTheme: 'flow-mono',
				Renderer:   'clean',
				EdgeTheme:  'straight'
			},
			{
				Hash: 'retro-80s',
				Label: '80s Retro',
				Description: 'Neon synthwave glow — magenta + cyan with CRT shadow effects.',
				ColorTheme: 'flow-retro-80s',
				Renderer:   'crt',
				EdgeTheme:  'orthogonal'
			},
			{
				Hash: 'retro-90s',
				Label: '90s Retro',
				Description: 'Windows-95 chrome — gray panels with offset shadows on a teal desktop.',
				ColorTheme: 'flow-retro-90s',
				Renderer:   'workstation',
				EdgeTheme:  'orthogonal'
			},
			{
				Hash: 'whiteboard',
				Label: 'Whiteboard',
				Description: 'Minimal whiteboard — colored brackets per node type, gentle jitter.',
				ColorTheme: 'flow-whiteboard',
				Renderer:   'sketch',
				EdgeTheme:  'bezier',
				NoiseLevel: 0.3
			}
		];

		for (let i = 0; i < _DEFAULTS.length; i++)
		{
			this._Presets[_DEFAULTS[i].Hash] = _DEFAULTS[i];
		}
	}

	// ── Public API ────────────────────────────────────────────────────────

	/**
	 * Register a custom preset.
	 * @param {Object} pPreset - must include Hash, ColorTheme, Renderer, EdgeTheme
	 * @returns {boolean}
	 */
	register(pPreset)
	{
		if (!pPreset || typeof pPreset !== 'object' || !pPreset.Hash)
		{
			this.log.warn('PictProviderFlowStylePresets: register requires a preset object with a Hash');
			return false;
		}
		this._Presets[pPreset.Hash] = pPreset;
		return true;
	}

	/**
	 * Look up a preset by hash.
	 * @param {string} pHash
	 * @returns {Object|null}
	 */
	getPreset(pHash)
	{
		return this._Presets[pHash] || null;
	}

	/**
	 * All registered preset hashes (insertion order).
	 * @returns {Array<string>}
	 */
	getPresetHashes()
	{
		return Object.keys(this._Presets);
	}

	/**
	 * All registered presets as an ordered array (useful for picker UIs).
	 * @returns {Array<Object>}
	 */
	listPresets()
	{
		return Object.values(this._Presets);
	}

	/**
	 * Hash of the currently-active preset, or null when in customized state
	 * (any individual axis was changed since the last setStylePreset call).
	 * @returns {string|null}
	 */
	getActivePresetHash()
	{
		return this._ActivePresetHash;
	}

	/**
	 * Apply a preset by hash. Applies color theme, renderer, edge theme,
	 * and optional noise level in that order.
	 *
	 * @param {string} pHash
	 * @returns {boolean}
	 */
	applyPreset(pHash)
	{
		let tmpPreset = this._Presets[pHash];
		if (!tmpPreset)
		{
			this.log.warn(`PictProviderFlowStylePresets: preset '${pHash}' not found`);
			return false;
		}

		// 1. Color theme — go through the host's pict-provider-theme if installed.
		if (tmpPreset.ColorTheme && this.fable.providers && this.fable.providers.Theme)
		{
			try { this.fable.providers.Theme.applyTheme(tmpPreset.ColorTheme); }
			catch (pErr) { this.log.warn(`PictProviderFlowStylePresets: Theme.applyTheme failed for '${tmpPreset.ColorTheme}' — ${pErr.message}`); }
		}

		// 2. Renderer — go through Flow-Renderer (must be present).
		if (tmpPreset.Renderer && this._FlowView && this._FlowView._RendererProvider)
		{
			this._FlowView._RendererProvider.setRenderer(tmpPreset.Renderer);
		}

		// 3. Edge theme — go through FlowView's existing setEdgeTheme().
		if (tmpPreset.EdgeTheme && this._FlowView && typeof this._FlowView.setEdgeTheme === 'function')
		{
			try { this._FlowView.setEdgeTheme(tmpPreset.EdgeTheme); }
			catch (pErr) { this.log.warn(`PictProviderFlowStylePresets: setEdgeTheme failed for '${tmpPreset.EdgeTheme}' — ${pErr.message}`); }
		}

		// 4. Optional noise override.
		if (typeof tmpPreset.NoiseLevel === 'number' && this._FlowView && this._FlowView._RendererProvider)
		{
			this._FlowView._RendererProvider.setNoiseLevel(tmpPreset.NoiseLevel);
		}

		this._ActivePresetHash = pHash;
		this.log.trace(`PictProviderFlowStylePresets: applied preset '${pHash}'`);
		return true;
	}

	/**
	 * Called by FlowView when a single axis is overridden by the user — this
	 * clears the active-preset tracker so getActivePresetHash() returns null.
	 */
	markCustomized()
	{
		this._ActivePresetHash = null;
	}
}

module.exports = PictProviderFlowStylePresets;

module.exports.default_configuration = _ProviderConfiguration;
