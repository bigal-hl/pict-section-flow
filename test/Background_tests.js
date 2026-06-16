const libFable = require('fable');
const libChai = require('chai');
const libExpect = libChai.expect;

const libBackground = require('../source/providers/PictProvider-Flow-Background.js');

suite
(
	'PictProvider-Flow-Background',
	function ()
	{
		let _Background;

		setup
		(
			function ()
			{
				let tmpFable = new libFable({});
				_Background = new libBackground(tmpFable, {}, 'Background-Test');
			}
		);

		suite
		(
			'generatePatternMarkup',
			function ()
			{
				test
				(
					'grid: default size, themed via the grid CSS class',
					function ()
					{
						let tmpMarkup = _Background.generatePatternMarkup('V', { Style: 'grid' });
						libExpect(tmpMarkup).to.contain('id="flow-bg-grid-V"');
						libExpect(tmpMarkup).to.contain('width="20" height="20"');
						libExpect(tmpMarkup).to.contain('class="pict-flow-grid-pattern"');
						libExpect(tmpMarkup).to.not.contain('style="stroke');
					}
				);

				test
				(
					'grid: custom size and color render inline',
					function ()
					{
						let tmpMarkup = _Background.generatePatternMarkup('V', { Style: 'grid', GridSize: 30, Color: '#abcdef' });
						libExpect(tmpMarkup).to.contain('width="30" height="30"');
						libExpect(tmpMarkup).to.contain('style="stroke:#abcdef"');
					}
				);

				test
				(
					'dots: default fill and dot size',
					function ()
					{
						let tmpMarkup = _Background.generatePatternMarkup('V', { Style: 'dots' });
						libExpect(tmpMarkup).to.contain('id="flow-bg-dots-V"');
						libExpect(tmpMarkup).to.contain('<circle');
						libExpect(tmpMarkup).to.contain('r="2"');
						libExpect(tmpMarkup).to.contain('cx="10" cy="10"');
					}
				);

				test
				(
					'dots: custom color, dot size, spacing',
					function ()
					{
						let tmpMarkup = _Background.generatePatternMarkup('V', { Style: 'dots', Color: '#ff0000', DotSize: 3, GridSize: 24 });
						libExpect(tmpMarkup).to.contain('r="3"');
						libExpect(tmpMarkup).to.contain('fill="#ff0000"');
						libExpect(tmpMarkup).to.contain('cx="12" cy="12"');
					}
				);

				test
				(
					'solid / image / none / empty produce no pattern',
					function ()
					{
						libExpect(_Background.generatePatternMarkup('V', { Style: 'solid', Color: '#111' })).to.equal('');
						libExpect(_Background.generatePatternMarkup('V', { Style: 'image', Image: 'x.png' })).to.equal('');
						libExpect(_Background.generatePatternMarkup('V', { Style: 'none' })).to.equal('');
						libExpect(_Background.generatePatternMarkup('V', null)).to.equal('');
					}
				);

				test
				(
					'grid / dots: a Paper color paints a rect behind the pattern',
					function ()
					{
						let tmpGrid = _Background.generatePatternMarkup('V', { Style: 'grid', Paper: '#ffffff' });
						libExpect(tmpGrid).to.contain('<rect width="20" height="20" fill="#ffffff" />');
						let tmpDots = _Background.generatePatternMarkup('V', { Style: 'dots', Paper: '#eeeeee' });
						libExpect(tmpDots).to.contain('fill="#eeeeee"');
						// No Paper -> no backing rect (unchanged behavior).
						libExpect(_Background.generatePatternMarkup('V', { Style: 'grid' })).to.not.contain('<rect');
					}
				);

				test
				(
					'grid: LineWidth renders a stroke-width',
					function ()
					{
						libExpect(_Background.generatePatternMarkup('V', { Style: 'grid', LineWidth: 2 })).to.contain('stroke-width="2"');
					}
				);

				test
				(
					'graph: emits a minor + major pattern, major tiles the minor and strokes heavier lines',
					function ()
					{
						let tmpMarkup = _Background.generatePatternMarkup('V', { Style: 'graph', GridSize: 16, MajorEvery: 10, Color: '#dbeafe', MajorColor: '#93c5fd', MajorLineWidth: 2 });
						// Minor pattern at the cell size, major pattern at cell * every.
						libExpect(tmpMarkup).to.contain('id="flow-bg-graph-minor-V"');
						libExpect(tmpMarkup).to.contain('id="flow-bg-graph-V"');
						libExpect(tmpMarkup).to.contain('width="16" height="16"');
						libExpect(tmpMarkup).to.contain('width="160" height="160"');
						// Major fills itself with the minor pattern.
						libExpect(tmpMarkup).to.contain('fill="url(#flow-bg-graph-minor-V)"');
						// Minor + major line colors + heavier major width.
						libExpect(tmpMarkup).to.contain('stroke="#dbeafe"');
						libExpect(tmpMarkup).to.contain('stroke="#93c5fd"');
						libExpect(tmpMarkup).to.contain('stroke-width="2"');
					}
				);

				test
				(
					'graph: MajorColor defaults to the minor Color; MajorEvery defaults to 10',
					function ()
					{
						let tmpMarkup = _Background.generatePatternMarkup('V', { Style: 'graph', GridSize: 20, Color: '#cccccc' });
						libExpect(tmpMarkup).to.contain('width="200" height="200"'); // 20 * 10
						// Only the one color present (major == minor).
						libExpect(tmpMarkup).to.contain('stroke="#cccccc"');
					}
				);
			}
		);

		suite
		(
			'resolveFill',
			function ()
			{
				test
				(
					'maps each style to its fill',
					function ()
					{
						libExpect(_Background.resolveFill('V', { Style: 'grid' })).to.equal('url(#flow-bg-grid-V)');
						libExpect(_Background.resolveFill('V', { Style: 'dots' })).to.equal('url(#flow-bg-dots-V)');
						libExpect(_Background.resolveFill('V', { Style: 'graph' })).to.equal('url(#flow-bg-graph-V)');
						libExpect(_Background.resolveFill('V', { Style: 'solid', Color: '#123456' })).to.equal('#123456');
						libExpect(_Background.resolveFill('V', { Style: 'solid' })).to.equal('transparent');
						libExpect(_Background.resolveFill('V', { Style: 'image', Image: 'pic.png' })).to.equal('url(pic.png)');
						libExpect(_Background.resolveFill('V', { Style: 'image' })).to.equal('none');
						libExpect(_Background.resolveFill('V', { Style: 'none' })).to.equal('none');
						libExpect(_Background.resolveFill('V', null)).to.equal(null);
					}
				);
			}
		);

		suite
		(
			'resolveBackground precedence',
			function ()
			{
				test
				(
					'ViewState background wins over the static option',
					function ()
					{
						let tmpFlowView =
						{
							options: { Background: { Style: 'grid' } },
							_FlowData: { ViewState: { Background: { Style: 'solid', Color: '#000' } } }
						};
						libExpect(_Background.resolveBackground(tmpFlowView).Style).to.equal('solid');
					}
				);

				test
				(
					'falls back to the static option, then to null',
					function ()
					{
						let tmpWithOption =
						{
							options: { Background: { Style: 'dots' } },
							_FlowData: { ViewState: {} }
						};
						libExpect(_Background.resolveBackground(tmpWithOption).Style).to.equal('dots');

						let tmpWithNothing =
						{
							options: { Background: false },
							_FlowData: { ViewState: {} }
						};
						libExpect(_Background.resolveBackground(tmpWithNothing)).to.equal(null);
					}
				);
			}
		);

		suite
		(
			'presets',
			function ()
			{
				test
				(
					'preset(name) returns a fresh clone the caller can mutate',
					function ()
					{
						let tmpA = _Background.preset('graph-blue');
						libExpect(tmpA.Style).to.equal('graph');
						libExpect(tmpA.MajorColor).to.equal('#93c5fd');
						tmpA.Color = '#000';
						// Mutating the returned object does not corrupt the catalog.
						libExpect(_Background.preset('graph-blue').Color).to.equal('#dbeafe');
					}
				);

				test
				(
					'the catalog covers the dot, grid, graph, and blueprint variants',
					function ()
					{
						let tmpNames = _Background.presetNames();
						['dots-small', 'dots-light', 'dots-dark', 'grid', 'grid-fine', 'graph-blue', 'blueprint'].forEach(function (pName)
						{
							libExpect(tmpNames, pName).to.contain(pName);
						});
					}
				);

				test
				(
					'an unknown preset name returns null',
					function ()
					{
						libExpect(_Background.preset('nope')).to.equal(null);
					}
				);
			}
		);
	}
);
