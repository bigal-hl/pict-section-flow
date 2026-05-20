const libFableServiceProviderBase = require('fable-serviceproviderbase');

const _ProviderConfiguration =
{
	ProviderIdentifier: 'PictProviderFlowTheme'
};

/**
 * PictProvider-Flow-Theme — back-compat shim.
 *
 * Flow's theming system was decomposed into three independent axes:
 *
 *   1. **ColorTheme** — managed by pict-section-theme (the 7 `flow-*`
 *      bundled themes plus any other catalog entries).
 *   2. **Renderer** — managed by PictProviderFlowRenderer (node body
 *      mode, bracket config, noise config, connection stroke,
 *      shape overrides, geometry CSS).
 *   3. **EdgeTheme** — managed by PictService-Flow-Layout's edge themes
 *      (Bezier, Straight, Orthogonal, Perimeter…).
 *
 * The user-facing concept of "Theme" maps to a **StylePreset** —
 * a curated triple `(ColorTheme, Renderer, EdgeTheme)` — registered
 * with PictProviderFlowStylePresets.
 *
 * This shim preserves the legacy API surface (`setTheme`, `getNoiseLevel`,
 * `setNoiseLevel`, `processPathString`, `getNodeNoiseAmplitude`,
 * `getActiveTheme`, `getActiveThemeKey`, `getThemeKeys`, `registerTheme`)
 * so consumer code calling the old methods keeps working unmodified.
 *
 * Every method here delegates to the appropriate new provider — most
 * commonly the Renderer provider (for noise + geometry) or the
 * StylePresets provider (for `setTheme`/`getActiveThemeKey`).
 *
 * New code should use the per-axis APIs directly:
 *
 *   ```javascript
 *   flowView.setStylePreset('sketch');      // primary
 *   flowView.setColorTheme('flow-blueprint');
 *   flowView.setRenderer('bracket');
 *   flowView.setEdgeTheme('orthogonal');
 *   ```
 */
class PictProviderFlowTheme extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _ProviderConfiguration, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'PictProviderFlowTheme';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;
	}

	// ── Helpers ───────────────────────────────────────────────────────────

	_renderer()
	{
		return (this._FlowView && this._FlowView._RendererProvider) || null;
	}

	_presets()
	{
		return (this._FlowView && this._FlowView._StylePresetsProvider) || null;
	}

	// ── Compat API ────────────────────────────────────────────────────────

	/**
	 * Compat: get the active style preset's "theme-shaped" view. Returns
	 * a synthetic object that exposes the legacy properties (NoiseConfig,
	 * NodeBodyMode, etc.) by pulling from the active renderer.
	 * @returns {Object}
	 */
	getActiveTheme()
	{
		let tmpRenderer = this._renderer();
		let tmpPresets = this._presets();
		let tmpPresetHash = tmpPresets ? tmpPresets.getActivePresetHash() : null;
		let tmpR = tmpRenderer ? tmpRenderer.getActiveRenderer() : {};
		return {
			Key:               tmpPresetHash || tmpR.Key || 'modern',
			Label:             tmpR.Label || 'Modern',
			NodeBodyMode:      tmpR.NodeBodyMode,
			BracketConfig:     tmpR.BracketConfig,
			NoiseConfig:       tmpR.NoiseConfig,
			ConnectionConfig:  tmpR.ConnectionConfig,
			ShapeOverrides:    tmpR.ShapeOverrides
		};
	}

	/**
	 * Compat: active style preset hash (or, if customized, the active renderer key).
	 * @returns {string}
	 */
	getActiveThemeKey()
	{
		let tmpPresets = this._presets();
		let tmpHash = tmpPresets ? tmpPresets.getActivePresetHash() : null;
		if (tmpHash) return tmpHash;
		let tmpRenderer = this._renderer();
		return tmpRenderer ? tmpRenderer.getActiveRendererKey() : 'modern';
	}

	/**
	 * Compat: pass through to StylePresets.applyPreset.
	 * @param {string} pThemeKey
	 * @returns {boolean}
	 */
	setTheme(pThemeKey)
	{
		let tmpPresets = this._presets();
		if (!tmpPresets)
		{
			this.log.warn('PictProviderFlowTheme: setTheme() called but StylePresets provider not available');
			return false;
		}
		return tmpPresets.applyPreset(pThemeKey);
	}

	/**
	 * Compat: register a "theme" — translates to a style preset registration.
	 * The legacy shape (CSSVariables / NodeBodyMode / NoiseConfig) is no
	 * longer supported wholesale; callers wanting full custom looks should
	 * register a Renderer and (optionally) a ColorTheme and StylePreset
	 * separately. This shim accepts a minimal preset-style payload:
	 *   { Hash, Label?, ColorTheme, Renderer, EdgeTheme, NoiseLevel? }
	 * @param {string} pKey
	 * @param {Object} pDef
	 */
	registerTheme(pKey, pDef)
	{
		let tmpPresets = this._presets();
		if (!tmpPresets || !pKey || !pDef)
		{
			this.log.warn('PictProviderFlowTheme: registerTheme requires StylePresets provider, a key, and a definition');
			return;
		}
		let tmpPreset = Object.assign({}, pDef, { Hash: pKey });
		tmpPresets.register(tmpPreset);
	}

	/**
	 * Compat: list registered preset hashes.
	 * @returns {Array<string>}
	 */
	getThemeKeys()
	{
		let tmpPresets = this._presets();
		return tmpPresets ? tmpPresets.getPresetHashes() : [];
	}

	// ── Noise + path delegations (preserved verbatim API) ─────────────────

	getNoiseLevel()
	{
		let tmpRenderer = this._renderer();
		return tmpRenderer ? tmpRenderer.getNoiseLevel() : 0;
	}

	setNoiseLevel(pLevel)
	{
		let tmpRenderer = this._renderer();
		if (tmpRenderer) tmpRenderer.setNoiseLevel(pLevel);
	}

	getNodeNoiseAmplitude()
	{
		let tmpRenderer = this._renderer();
		return tmpRenderer ? tmpRenderer.getNodeNoiseAmplitude() : 0;
	}

	processPathString(pPathString, pSeedString)
	{
		let tmpRenderer = this._renderer();
		if (!tmpRenderer) return pPathString;
		return tmpRenderer.processPathString(pPathString, pSeedString);
	}
}

module.exports = PictProviderFlowTheme;

module.exports.default_configuration = _ProviderConfiguration;
