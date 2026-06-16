const libPictProvider = require('pict-provider');

/**
 * PictProvider-Flow-Background
 *
 * Native canvas background for the flow diagram. The container template ships a
 * default grid; this provider lets a host pick a background through config or
 * ViewState instead of hand-painting the SVG from outside (which moodboard used
 * to do). When no background is configured the provider is a no-op and the
 * template grid stands, so existing diagrams are unchanged.
 *
 * Background shape:
 *   { Style: 'grid' | 'dots' | 'graph' | 'solid' | 'image' | 'none',
 *     Color?: string,        // line / dot color (minor lines for 'graph')
 *     MajorColor?: string,   // 'graph' only: the heavier every-Nth line color
 *     Paper?: string,        // grid/dots/graph: solid fill painted behind the pattern
 *     Image?: string,
 *     GridSize?: number,     // cell spacing (minor cell for 'graph')
 *     MajorEvery?: number,   // 'graph' only: heavier line every N cells (default 10)
 *     DotSize?: number,
 *     LineWidth?: number,    // grid/graph minor line width
 *     MajorLineWidth?: number } // 'graph' major line width
 *
 * Named presets (smaller / lighter / darker dots, grids, blue graph paper,
 * blueprint, ...) live in PRESETS and are fetched with preset(name).
 *
 * The markup generators are pure (string in, string out) and unit tested; only
 * apply() touches the DOM.
 */
const _ProviderConfiguration =
{
	ProviderIdentifier: 'PictProviderFlowBackground'
};

const _DEFAULT_GRID_SIZE = 20;
const _DEFAULT_DOT_SIZE = 2;
const _DEFAULT_DOT_FILL = 'var(--theme-color-text-secondary, #b0b0b0)';
const _DEFAULT_MAJOR_EVERY = 10;
// Concrete fallback line color for 'graph' (var() does not resolve in an SVG
// presentation attribute, and graph lines are drawn with stroke="...").
const _DEFAULT_GRID_LINE = '#cbd5e1';

// Named, ready-to-use backgrounds. preset(name) returns a fresh clone so callers
// can tweak one without mutating the catalog.
const _PRESETS =
{
	'dots':       { Style: 'dots', GridSize: 20, DotSize: 2 },
	'dots-small': { Style: 'dots', GridSize: 14, DotSize: 1 },
	'dots-light': { Style: 'dots', GridSize: 20, DotSize: 2, Color: '#dcdcdc' },
	'dots-dark':  { Style: 'dots', GridSize: 22, DotSize: 2.4, Color: '#64748b' },
	'grid':       { Style: 'grid', GridSize: 20 },
	'grid-fine':  { Style: 'grid', GridSize: 12, Color: '#e2e8f0' },
	// "10-square grid with light and more-light-blue lines": minor light-blue lines
	// every 16px, a heavier sky-blue line every 10 cells, on white paper.
	'graph-blue': { Style: 'graph', GridSize: 16, MajorEvery: 10, Color: '#dbeafe', MajorColor: '#93c5fd', LineWidth: 1, MajorLineWidth: 1.5, Paper: '#ffffff' },
	// Classic dark blueprint: light-blue lines on deep navy paper.
	'blueprint':  { Style: 'graph', GridSize: 16, MajorEvery: 10, Color: '#3b6ea5', MajorColor: '#6fa8dc', LineWidth: 1, MajorLineWidth: 1.5, Paper: '#0f2a4a' },
	'solid':      { Style: 'solid', Color: '#faf7f2' },
	'none':       { Style: 'none' }
};

class PictProviderFlowBackground extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _ProviderConfiguration, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'PictProviderFlowBackground';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;
	}

	/**
	 * The pattern element id for a view + style.
	 * @param {string} pViewIdentifier
	 * @param {string} pStyle
	 * @returns {string}
	 */
	patternId(pViewIdentifier, pStyle)
	{
		return `flow-bg-${pStyle}-${pViewIdentifier}`;
	}

	/**
	 * Generate the <pattern> markup for grid/dots backgrounds. Returns '' for
	 * styles that need no pattern (solid, image, none) or when nothing is set.
	 * Pure.
	 * @param {string} pViewIdentifier
	 * @param {Object} pBackground
	 * @returns {string}
	 */
	generatePatternMarkup(pViewIdentifier, pBackground)
	{
		if (!pBackground || !pBackground.Style)
		{
			return '';
		}

		// Optional solid fill painted behind the pattern (paper color). Empty unless set.
		let tmpPaper = function (pW, pH)
		{
			return pBackground.Paper ? `<rect width="${pW}" height="${pH}" fill="${pBackground.Paper}" />` : '';
		};

		if (pBackground.Style === 'grid')
		{
			let tmpSize = (typeof pBackground.GridSize === 'number') ? pBackground.GridSize : _DEFAULT_GRID_SIZE;
			// With no explicit Color the lines inherit the theme via the existing
			// CSS class, matching the template grid; a Color overrides inline.
			let tmpStroke = pBackground.Color ? ` style="stroke:${pBackground.Color}"` : '';
			let tmpWidth = (typeof pBackground.LineWidth === 'number') ? ` stroke-width="${pBackground.LineWidth}"` : '';
			let tmpId = this.patternId(pViewIdentifier, 'grid');
			return `<pattern id="${tmpId}" width="${tmpSize}" height="${tmpSize}" patternUnits="userSpaceOnUse">`
				+ tmpPaper(tmpSize, tmpSize)
				+ `<line x1="${tmpSize}" y1="0" x2="${tmpSize}" y2="${tmpSize}" class="pict-flow-grid-pattern"${tmpStroke}${tmpWidth} />`
				+ `<line x1="0" y1="${tmpSize}" x2="${tmpSize}" y2="${tmpSize}" class="pict-flow-grid-pattern"${tmpStroke}${tmpWidth} />`
				+ `</pattern>`;
		}

		if (pBackground.Style === 'dots')
		{
			let tmpSize = (typeof pBackground.GridSize === 'number') ? pBackground.GridSize : _DEFAULT_GRID_SIZE;
			let tmpDot = (typeof pBackground.DotSize === 'number') ? pBackground.DotSize : _DEFAULT_DOT_SIZE;
			let tmpFill = pBackground.Color ? pBackground.Color : _DEFAULT_DOT_FILL;
			let tmpId = this.patternId(pViewIdentifier, 'dots');
			return `<pattern id="${tmpId}" width="${tmpSize}" height="${tmpSize}" patternUnits="userSpaceOnUse">`
				+ tmpPaper(tmpSize, tmpSize)
				+ `<circle cx="${tmpSize / 2}" cy="${tmpSize / 2}" r="${tmpDot}" fill="${tmpFill}" />`
				+ `</pattern>`;
		}

		if (pBackground.Style === 'graph')
		{
			// Graph paper: a fine minor grid tiled inside a heavier major grid drawn
			// every MajorEvery cells. Two patterns — the major one fills itself with the
			// minor pattern, then strokes the heavier lines on top.
			let tmpMinor = (typeof pBackground.GridSize === 'number') ? pBackground.GridSize : _DEFAULT_GRID_SIZE;
			let tmpMajorEvery = (typeof pBackground.MajorEvery === 'number') ? pBackground.MajorEvery : _DEFAULT_MAJOR_EVERY;
			let tmpMajor = tmpMinor * tmpMajorEvery;
			let tmpMinorColor = pBackground.Color || _DEFAULT_GRID_LINE;
			let tmpMajorColor = pBackground.MajorColor || tmpMinorColor;
			let tmpMinorWidth = (typeof pBackground.LineWidth === 'number') ? pBackground.LineWidth : 1;
			let tmpMajorWidth = (typeof pBackground.MajorLineWidth === 'number') ? pBackground.MajorLineWidth : 1.5;
			let tmpMinorId = this.patternId(pViewIdentifier, 'graph-minor');
			let tmpId = this.patternId(pViewIdentifier, 'graph');

			let tmpMinorPattern = `<pattern id="${tmpMinorId}" width="${tmpMinor}" height="${tmpMinor}" patternUnits="userSpaceOnUse">`
				+ `<line x1="${tmpMinor}" y1="0" x2="${tmpMinor}" y2="${tmpMinor}" stroke="${tmpMinorColor}" stroke-width="${tmpMinorWidth}" />`
				+ `<line x1="0" y1="${tmpMinor}" x2="${tmpMinor}" y2="${tmpMinor}" stroke="${tmpMinorColor}" stroke-width="${tmpMinorWidth}" />`
				+ `</pattern>`;
			let tmpMajorPattern = `<pattern id="${tmpId}" width="${tmpMajor}" height="${tmpMajor}" patternUnits="userSpaceOnUse">`
				+ tmpPaper(tmpMajor, tmpMajor)
				+ `<rect width="${tmpMajor}" height="${tmpMajor}" fill="url(#${tmpMinorId})" />`
				+ `<line x1="${tmpMajor}" y1="0" x2="${tmpMajor}" y2="${tmpMajor}" stroke="${tmpMajorColor}" stroke-width="${tmpMajorWidth}" />`
				+ `<line x1="0" y1="${tmpMajor}" x2="${tmpMajor}" y2="${tmpMajor}" stroke="${tmpMajorColor}" stroke-width="${tmpMajorWidth}" />`
				+ `</pattern>`;
			return tmpMinorPattern + tmpMajorPattern;
		}

		return '';
	}

	/**
	 * Resolve the fill value for the background rect. Pure.
	 *   grid/dots -> url(#pattern); solid -> Color; image -> url(Image);
	 *   none -> 'none'. Returns null when nothing is configured.
	 * @param {string} pViewIdentifier
	 * @param {Object} pBackground
	 * @returns {string|null}
	 */
	resolveFill(pViewIdentifier, pBackground)
	{
		if (!pBackground || !pBackground.Style)
		{
			return null;
		}

		switch (pBackground.Style)
		{
			case 'grid':  return `url(#${this.patternId(pViewIdentifier, 'grid')})`;
			case 'dots':  return `url(#${this.patternId(pViewIdentifier, 'dots')})`;
			case 'graph': return `url(#${this.patternId(pViewIdentifier, 'graph')})`;
			case 'solid': return pBackground.Color || 'transparent';
			case 'image': return pBackground.Image ? `url(${pBackground.Image})` : 'none';
			case 'none':  return 'none';
			default:      return null;
		}
	}

	/**
	 * Resolve the effective background for a flow view: ViewState wins, then the
	 * static option. Returns null/false when none is configured.
	 * @param {Object} pFlowView
	 */
	resolveBackground(pFlowView)
	{
		if (!pFlowView)
		{
			return null;
		}
		let tmpViewStateBackground = (pFlowView._FlowData && pFlowView._FlowData.ViewState)
			? pFlowView._FlowData.ViewState.Background
			: null;
		if (tmpViewStateBackground)
		{
			return tmpViewStateBackground;
		}
		return (pFlowView.options && pFlowView.options.Background) ? pFlowView.options.Background : null;
	}

	/**
	 * Fetch a named background preset as a fresh object (safe to tweak / store on
	 * ViewState). Unknown names return null.
	 * @param {string} pName
	 * @returns {Object|null}
	 */
	preset(pName)
	{
		let tmpPreset = _PRESETS[pName];
		return tmpPreset ? JSON.parse(JSON.stringify(tmpPreset)) : null;
	}

	/**
	 * The available preset names, in catalog order.
	 * @returns {string[]}
	 */
	presetNames()
	{
		return Object.keys(_PRESETS);
	}

	/**
	 * Apply the configured background to the live SVG. No-op when nothing is
	 * configured (the template grid stands). DOM-touching; verified in browser.
	 * @param {Object} [pFlowView]
	 * @returns {boolean} true when a background was applied
	 */
	apply(pFlowView)
	{
		let tmpFlowView = pFlowView || this._FlowView;
		if (!tmpFlowView || !tmpFlowView._SVGElement)
		{
			return false;
		}

		let tmpBackground = this.resolveBackground(tmpFlowView);
		if (!tmpBackground || !tmpBackground.Style)
		{
			return false;
		}

		let tmpViewIdentifier = tmpFlowView.options.ViewIdentifier;
		let tmpSVG = tmpFlowView._SVGElement;

		// Replace any pattern we previously injected, then add the new one.
		let tmpDefs = tmpSVG.querySelector('defs');
		if (tmpDefs)
		{
			let tmpOld = tmpDefs.querySelectorAll('[data-flow-bg-pattern]');
			for (let i = 0; i < tmpOld.length; i++)
			{
				tmpOld[i].remove();
			}
			let tmpMarkup = this.generatePatternMarkup(tmpViewIdentifier, tmpBackground);
			if (tmpMarkup)
			{
				let tmpScratch = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				tmpScratch.innerHTML = tmpMarkup;
				while (tmpScratch.firstChild)
				{
					let tmpChild = tmpScratch.firstChild;
					if (tmpChild.setAttribute)
					{
						tmpChild.setAttribute('data-flow-bg-pattern', 'true');
					}
					tmpDefs.appendChild(tmpChild);
				}
			}
		}

		let tmpFill = this.resolveFill(tmpViewIdentifier, tmpBackground);
		let tmpRect = tmpSVG.querySelector('.pict-flow-grid-background');
		if (tmpRect && tmpFill !== null)
		{
			tmpRect.setAttribute('fill', tmpFill);
		}

		// A solid color also tints the container behind the (transparent) rect.
		let tmpContainer = (typeof tmpSVG.closest === 'function') ? tmpSVG.closest('.pict-flow-svg-container') : null;
		if (tmpContainer)
		{
			tmpContainer.style.backgroundColor = (tmpBackground.Style === 'solid' && tmpBackground.Color) ? tmpBackground.Color : '';
		}

		return true;
	}
}

module.exports = PictProviderFlowBackground;

module.exports.default_configuration = _ProviderConfiguration;
module.exports.PRESETS = _PRESETS;
