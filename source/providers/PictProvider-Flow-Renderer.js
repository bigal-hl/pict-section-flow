const libFableServiceProviderBase = require('fable-serviceproviderbase');

const _ProviderConfiguration =
{
	ProviderIdentifier: 'PictProviderFlowRenderer'
};

/**
 * PictProvider-Flow-Renderer
 *
 * Registry + active-state holder for the FLOW RENDERER axis.
 *
 * A "renderer" answers: *how do we draw a flow* — node body shape, border
 * jitter, connection stroke style, arrowhead style, supplementary CSS for
 * text treatment. It is **independent of color**. Color comes from the
 * active pict-section-theme theme; the renderer only describes the visual
 * vocabulary applied on top of those colors.
 *
 * This is the analogue of `EdgeTheme` for node + arrow + filter treatment.
 * See PictService-Flow-Layout.js for the EdgeTheme pattern this mirrors.
 *
 * ## Renderer shape
 *
 * ```javascript
 * {
 *     Key: 'sketch',
 *     Label: 'Sketch (jittery)',
 *
 *     NodeBodyMode: 'bracket',                       // 'rect' | 'bracket'
 *     BracketConfig: { SerifLength: 20, TitleSeparator: true },
 *
 *     NoiseConfig: {                                 // hand-drawn jitter
 *         Enabled: true,
 *         DefaultLevel: 0.4,
 *         MaxJitterPx: 4,
 *         AffectsNodes: true,
 *         AffectsConnections: true
 *     },
 *
 *     ConnectionConfig: {                            // edge stroke style
 *         StrokeDashArray: null,
 *         StrokeWidth: 1.5,
 *         ArrowheadStyle: 'triangle'
 *     },
 *
 *     ShapeOverrides: {                              // per-shape SVG attrs
 *         'arrowhead-connection':          { Fill: 'var(--theme-color-text-secondary, #555)' },
 *         'arrowhead-connection-selected': { Fill: 'var(--theme-color-brand-primary,  #2255aa)' }
 *     },
 *
 *     GeometryCSS: '',                               // optional :root :root rules for
 *                                                    //   --pf-node-body-stroke-width,
 *                                                    //   --pf-node-body-radius,
 *                                                    //   --pf-node-shadow*,
 *                                                    //   --pf-panel-shadow, --pf-panel-radius,
 *                                                    //   --pf-node-title-size/weight, etc.
 *
 *     AdditionalCSS: ''                              // optional per-renderer extras
 *                                                    //   (font-family swaps, filters, scanlines)
 * }
 * ```
 *
 * ## API
 *
 * ```javascript
 * pict.providers['PictProviderFlowRenderer'].register(key, definition);
 * pict.providers['PictProviderFlowRenderer'].setRenderer('sketch');
 * pict.providers['PictProviderFlowRenderer'].getActiveRenderer();
 * pict.providers['PictProviderFlowRenderer'].getActiveRendererKey();
 * pict.providers['PictProviderFlowRenderer'].getRendererKeys();
 * pict.providers['PictProviderFlowRenderer'].getNoiseLevel();
 * pict.providers['PictProviderFlowRenderer'].setNoiseLevel(0.5);
 * pict.providers['PictProviderFlowRenderer'].getNodeNoiseAmplitude();
 * pict.providers['PictProviderFlowRenderer'].processPathString(d, seed);
 * ```
 *
 * The FlowView wires this provider's GeometryCSS + AdditionalCSS into the
 * CSS cascade on each `setRenderer()` call, plus applies ShapeOverrides
 * through ConnectorShapesProvider (same flow the old monolithic theme used).
 */
class PictProviderFlowRenderer extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _ProviderConfiguration, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'PictProviderFlowRenderer';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;

		this._ActiveRendererKey = 'clean';
		this._NoiseLevel = 0;
		this._Renderers = {};

		this._registerBuiltInRenderers();
	}

	// ── Registry ──────────────────────────────────────────────────────────

	_registerBuiltInRenderers()
	{
		// 1. Clean — rectangle bodies, soft shadows, no jitter. Modern default.
		this._Renderers['clean'] =
		{
			Key: 'clean',
			Label: 'Clean',
			NodeBodyMode: 'rect',
			BracketConfig: null,
			NoiseConfig:
			{
				Enabled: false,
				DefaultLevel: 0,
				MaxJitterPx: 0,
				AffectsNodes: false,
				AffectsConnections: false
			},
			ConnectionConfig:
			{
				StrokeDashArray: null,
				StrokeWidth: 2,
				ArrowheadStyle: 'triangle'
			},
			ShapeOverrides: {},
			GeometryCSS: `
				.pict-flow-container {
					--pf-node-body-stroke-width: 1.5;
					--pf-node-body-radius:       6px;
					--pf-node-shadow:            drop-shadow(0 1px 3px rgba(0,0,0,0.10));
					--pf-node-shadow-hover:      drop-shadow(0 2px 6px rgba(0,0,0,0.15));
					--pf-node-shadow-selected:   drop-shadow(0 0 6px var(--theme-color-brand-primary, #2255aa));
					--pf-node-shadow-dragging:   drop-shadow(0 4px 10px rgba(0,0,0,0.20));
					--pf-node-title-size:        12px;
					--pf-node-title-weight:      600;
					--pf-panel-radius:           8px;
					--pf-panel-shadow:           0 2px 8px rgba(0,0,0,0.12);
				}
			`,
			AdditionalCSS: ''
		};

		// 2. Bracket — `[ ]` body, no jitter. Sketch-like but precise.
		this._Renderers['bracket'] =
		{
			Key: 'bracket',
			Label: 'Bracket',
			NodeBodyMode: 'bracket',
			BracketConfig:
			{
				SerifLength: 20,
				TitleSeparator: true
			},
			NoiseConfig:
			{
				Enabled: false,
				DefaultLevel: 0,
				MaxJitterPx: 0,
				AffectsNodes: false,
				AffectsConnections: false
			},
			ConnectionConfig:
			{
				StrokeDashArray: null,
				StrokeWidth: 1.5,
				ArrowheadStyle: 'triangle'
			},
			ShapeOverrides:
			{
				'arrowhead-connection':          { Fill: 'var(--theme-color-text-secondary, #555555)' },
				'arrowhead-connection-selected': { Fill: 'var(--theme-color-brand-primary,  #2255aa)' }
			},
			GeometryCSS: `
				.pict-flow-container {
					--pf-node-body-stroke-width: 1.5;
					--pf-node-body-radius:       0px;
					--pf-node-shadow:            none;
					--pf-node-shadow-hover:      none;
					--pf-node-shadow-selected:   none;
					--pf-node-shadow-dragging:   none;
					--pf-node-title-size:        12px;
					--pf-node-title-weight:      500;
					--pf-panel-radius:           0px;
					--pf-panel-shadow:           2px 2px 0px rgba(0,0,0,0.08);
				}
			`,
			AdditionalCSS: ''
		};

		// 3. Sketch — bracket + jitter on nodes and connections. Hand-drawn.
		this._Renderers['sketch'] =
		{
			Key: 'sketch',
			Label: 'Sketch',
			NodeBodyMode: 'bracket',
			BracketConfig:
			{
				SerifLength: 20,
				TitleSeparator: true
			},
			NoiseConfig:
			{
				Enabled: true,
				DefaultLevel: 0.4,
				MaxJitterPx: 4,
				AffectsNodes: true,
				AffectsConnections: true
			},
			ConnectionConfig:
			{
				StrokeDashArray: null,
				StrokeWidth: 1.5,
				ArrowheadStyle: 'triangle'
			},
			ShapeOverrides:
			{
				'arrowhead-connection':          { Fill: 'var(--theme-color-text-secondary, #555555)' },
				'arrowhead-connection-selected': { Fill: 'var(--theme-color-brand-primary,  #2255aa)' }
			},
			GeometryCSS: `
				.pict-flow-container {
					--pf-node-body-stroke-width: 1.5;
					--pf-node-body-radius:       0px;
					--pf-node-shadow:            none;
					--pf-node-shadow-hover:      none;
					--pf-node-shadow-selected:   none;
					--pf-node-shadow-dragging:   none;
					--pf-node-title-size:        12px;
					--pf-node-title-weight:      400;
					--pf-panel-radius:           0px;
					--pf-panel-shadow:           2px 2px 0px rgba(0,0,0,0.08);
				}
			`,
			AdditionalCSS: `
				.pict-flow-node-title,
				.pict-flow-node-type-label,
				.pict-flow-port-label,
				.pict-flow-node-card-code {
					font-family: "Courier New", "Courier", monospace !important;
				}
				.pict-flow-panel-title-text,
				.pict-flow-panel-node-props-title,
				.pict-flow-info-panel {
					font-family: "Courier New", "Courier", monospace !important;
				}
				.pict-flow-node-title-icon {
					filter: brightness(0) !important;
				}
			`
		};

		// 4. CRT — rectangular body + neon drop-shadow glow. No jitter, but a
		//    scanline / monospace text treatment for retro vibes.
		this._Renderers['crt'] =
		{
			Key: 'crt',
			Label: 'CRT',
			NodeBodyMode: 'rect',
			BracketConfig: null,
			NoiseConfig:
			{
				Enabled: false,
				DefaultLevel: 0,
				MaxJitterPx: 0,
				AffectsNodes: false,
				AffectsConnections: false
			},
			ConnectionConfig:
			{
				StrokeDashArray: null,
				StrokeWidth: 2,
				ArrowheadStyle: 'triangle'
			},
			ShapeOverrides:
			{
				'arrowhead-connection':          { Fill: 'var(--theme-color-brand-primary, #ff00ff)' },
				'arrowhead-connection-selected': { Fill: 'var(--theme-color-brand-accent,  #00ffff)' }
			},
			GeometryCSS: `
				.pict-flow-container {
					--pf-node-body-stroke-width: 2;
					--pf-node-body-radius:       0px;
					--pf-node-shadow:            drop-shadow(0 0 8px color-mix(in srgb, var(--theme-color-brand-primary, #ff00ff) 40%, transparent));
					--pf-node-shadow-hover:      drop-shadow(0 0 12px color-mix(in srgb, var(--theme-color-brand-primary, #ff00ff) 60%, transparent));
					--pf-node-shadow-selected:   drop-shadow(0 0 16px color-mix(in srgb, var(--theme-color-brand-accent,  #00ffff) 50%, transparent));
					--pf-node-shadow-dragging:   drop-shadow(0 0 20px color-mix(in srgb, var(--theme-color-brand-primary, #ff00ff) 70%, transparent));
					--pf-node-title-size:        11px;
					--pf-node-title-weight:      700;
					--pf-panel-radius:           0px;
					--pf-panel-shadow:           0 0 20px color-mix(in srgb, var(--theme-color-brand-primary, #ff00ff) 30%, transparent);
				}
			`,
			AdditionalCSS: `
				.pict-flow-node-title,
				.pict-flow-node-type-label,
				.pict-flow-port-label,
				.pict-flow-node-card-code {
					font-family: "Courier New", monospace !important;
					text-transform: uppercase;
					letter-spacing: 0.5px;
				}
				.pict-flow-connection {
					filter: drop-shadow(0 0 3px color-mix(in srgb, var(--theme-color-brand-primary, #ff00ff) 40%, transparent));
				}
			`
		};

		// 5. Workstation — chunky 90s OS aesthetic. Rectangle with hard offset
		//    drop-shadow, no jitter, weighty title bar.
		this._Renderers['workstation'] =
		{
			Key: 'workstation',
			Label: 'Workstation',
			NodeBodyMode: 'rect',
			BracketConfig: null,
			NoiseConfig:
			{
				Enabled: false,
				DefaultLevel: 0,
				MaxJitterPx: 0,
				AffectsNodes: false,
				AffectsConnections: false
			},
			ConnectionConfig:
			{
				StrokeDashArray: null,
				StrokeWidth: 2,
				ArrowheadStyle: 'triangle'
			},
			ShapeOverrides:
			{
				'arrowhead-connection':          { Fill: 'var(--theme-color-border-default, #808080)' },
				'arrowhead-connection-selected': { Fill: 'var(--theme-color-focus-outline,  #008080)' }
			},
			GeometryCSS: `
				.pict-flow-container {
					--pf-node-body-stroke-width: 1;
					--pf-node-body-radius:       0px;
					--pf-node-shadow:            drop-shadow(2px 2px 0px var(--theme-color-border-strong, #404040));
					--pf-node-shadow-hover:      drop-shadow(3px 3px 0px var(--theme-color-border-strong, #404040));
					--pf-node-shadow-selected:   drop-shadow(2px 2px 0px var(--theme-color-focus-outline,  #008080));
					--pf-node-shadow-dragging:   drop-shadow(4px 4px 0px var(--theme-color-border-strong, #404040));
					--pf-node-title-size:        11px;
					--pf-node-title-weight:      700;
					--pf-panel-radius:           0px;
					--pf-panel-shadow:           2px 2px 0px var(--theme-color-border-strong, #404040);
				}
			`,
			AdditionalCSS: `
				.pict-flow-node-title,
				.pict-flow-node-type-label,
				.pict-flow-port-label,
				.pict-flow-node-card-code {
					font-family: "MS Sans Serif", "Arial", sans-serif !important;
				}
			`
		};
	}

	// ── Public API ────────────────────────────────────────────────────────

	/**
	 * Get the active renderer definition.
	 * @returns {Object}
	 */
	getActiveRenderer()
	{
		return this._Renderers[this._ActiveRendererKey] || this._Renderers['clean'];
	}

	/**
	 * Get the active renderer key.
	 * @returns {string}
	 */
	getActiveRendererKey()
	{
		return this._ActiveRendererKey;
	}

	/**
	 * Switch the active renderer. Updates the noise default, applies shape
	 * overrides, and (if available) hands the GeometryCSS + AdditionalCSS
	 * to the FlowView's CSS provider for re-injection.
	 *
	 * @param {string} pRendererKey
	 * @returns {boolean}
	 */
	setRenderer(pRendererKey)
	{
		if (!this._Renderers[pRendererKey])
		{
			this.log.warn(`PictProviderFlowRenderer: renderer '${pRendererKey}' not found`);
			return false;
		}

		this._ActiveRendererKey = pRendererKey;
		let tmpRenderer = this._Renderers[pRendererKey];

		// Apply noise defaults from the renderer
		if (tmpRenderer.NoiseConfig && typeof tmpRenderer.NoiseConfig.DefaultLevel === 'number')
		{
			this._NoiseLevel = tmpRenderer.NoiseConfig.DefaultLevel;
		}
		else
		{
			this._NoiseLevel = 0;
		}

		// Apply shape overrides through the connector-shapes provider
		if (this._FlowView && this._FlowView._ConnectorShapesProvider)
		{
			this._FlowView._ConnectorShapesProvider.resetToDefaults();
			if (tmpRenderer.ShapeOverrides && Object.keys(tmpRenderer.ShapeOverrides).length > 0)
			{
				this._FlowView._ConnectorShapesProvider.applyThemeOverrides(tmpRenderer.ShapeOverrides);
			}
		}

		this.log.trace(`PictProviderFlowRenderer: switched to '${pRendererKey}'`);
		return true;
	}

	/**
	 * Register a custom renderer.
	 * @param {string} pKey
	 * @param {Object} pDefinition
	 */
	register(pKey, pDefinition)
	{
		if (!pKey || !pDefinition)
		{
			this.log.warn('PictProviderFlowRenderer: register requires key and definition');
			return;
		}
		pDefinition.Key = pKey;
		this._Renderers[pKey] = pDefinition;
	}

	/**
	 * Get all registered renderer keys.
	 * @returns {Array<string>}
	 */
	getRendererKeys()
	{
		return Object.keys(this._Renderers);
	}

	// ── Noise APIs (kept on this provider so consumers don't depend on the
	//    legacy Flow-Theme shim) ──────────────────────────────────────────

	/**
	 * Get the current noise level (0 to 1).
	 * @returns {number}
	 */
	getNoiseLevel()
	{
		return this._NoiseLevel;
	}

	/**
	 * Set the noise level (0 to 1).
	 * @param {number} pLevel
	 */
	setNoiseLevel(pLevel)
	{
		this._NoiseLevel = Math.max(0, Math.min(1, pLevel || 0));
	}

	/**
	 * Get the noise amplitude for node bracket rendering.
	 * Returns 0 if the active renderer disables noise for nodes.
	 * @returns {number}
	 */
	getNodeNoiseAmplitude()
	{
		let tmpRenderer = this.getActiveRenderer();
		if (!tmpRenderer || !tmpRenderer.NoiseConfig || !tmpRenderer.NoiseConfig.Enabled || !tmpRenderer.NoiseConfig.AffectsNodes)
		{
			return 0;
		}
		return this._NoiseLevel * (tmpRenderer.NoiseConfig.MaxJitterPx || 3);
	}

	/**
	 * Post-process an SVG path string to apply jitter when the active
	 * renderer enables noise for connections.
	 *
	 * @param {string} pPathString
	 * @param {string} pSeedString
	 * @returns {string}
	 */
	processPathString(pPathString, pSeedString)
	{
		let tmpRenderer = this.getActiveRenderer();
		if (!tmpRenderer || !tmpRenderer.NoiseConfig || !tmpRenderer.NoiseConfig.Enabled || !tmpRenderer.NoiseConfig.AffectsConnections)
		{
			return pPathString;
		}

		let tmpAmplitude = this._NoiseLevel * (tmpRenderer.NoiseConfig.MaxJitterPx || 3);
		if (tmpAmplitude <= 0)
		{
			return pPathString;
		}

		if (this._FlowView && this._FlowView._NoiseProvider)
		{
			return this._FlowView._NoiseProvider.jitterPath(pPathString, tmpAmplitude, pSeedString);
		}

		return pPathString;
	}
}

module.exports = PictProviderFlowRenderer;

module.exports.default_configuration = _ProviderConfiguration;
