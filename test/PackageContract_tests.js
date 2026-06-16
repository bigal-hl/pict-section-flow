const libChai = require('chai');
const libExpect = libChai.expect;
const libFable = require('fable');

/**
 * Package contract tests.
 *
 * These lock the public pict-section-flow export surface that downstream
 * consumers (notably ultravisor) depend on. The flow 2.0 extraction moved the
 * geometry, layout, and routing math into sibling modules and re-exports the
 * layout/edge descriptors from pict-provider-graphlayout; these assertions make
 * sure that wiring keeps the historical surface intact, and that the deep import
 * path ultravisor uses still resolves.
 */
suite
(
	'pict-section-flow package contract',
	function ()
	{
		let libFlow = require('../source/Pict-Section-Flow.js');

		suite
		(
			'top-level exports',
			function ()
			{
				test
				(
					'main export is the flow view class',
					function ()
					{
						libExpect(libFlow).to.be.a('function');
					}
				);

				test
				(
					'exposes PictFlowCard and the panel base + types',
					function ()
					{
						libExpect(libFlow.PictFlowCard, 'PictFlowCard').to.be.a('function');
						libExpect(libFlow.PictFlowCardPropertiesPanel, 'PictFlowCardPropertiesPanel').to.be.a('function');
						libExpect(libFlow.FlowCardPropertiesPanelTemplate, 'Template panel').to.be.a('function');
						libExpect(libFlow.FlowCardPropertiesPanelMarkdown, 'Markdown panel').to.be.a('function');
						libExpect(libFlow.FlowCardPropertiesPanelForm, 'Form panel').to.be.a('function');
						libExpect(libFlow.FlowCardPropertiesPanelView, 'View panel').to.be.a('function');
					}
				);

				test
				(
					'the deep panel import path ultravisor uses still resolves to the same class',
					function ()
					{
						let libDeepPanel = require('../source/PictFlowCardPropertiesPanel.js');
						libExpect(libDeepPanel).to.be.a('function');
						libExpect(libDeepPanel).to.equal(libFlow.PictFlowCardPropertiesPanel);
					}
				);
			}
		);

		suite
		(
			'LayoutAlgorithms re-export',
			function ()
			{
				test
				(
					'exposes the historical algorithm set, each a valid descriptor',
					function ()
					{
						let tmpExpected = ['Custom', 'Layered', 'ForcedFromCenter', 'Grid', 'Circular', 'Tabular', 'Columnar'];
						libExpect(libFlow.LayoutAlgorithms).to.be.an('object');
						for (let i = 0; i < tmpExpected.length; i++)
						{
							let tmpDescriptor = libFlow.LayoutAlgorithms[tmpExpected[i]];
							libExpect(tmpDescriptor, tmpExpected[i]).to.be.an('object');
							libExpect(tmpDescriptor.Name, tmpExpected[i] + '.Name').to.be.a('string');
							libExpect(tmpDescriptor.Apply, tmpExpected[i] + '.Apply').to.be.a('function');
						}
					}
				);
			}
		);

		suite
		(
			'EdgeThemes re-export',
			function ()
			{
				test
				(
					'exposes the historical edge-theme set, each with a Name',
					function ()
					{
						let tmpExpected = ['Bezier', 'Orthogonal', 'Straight', 'OrthogonalSnap', 'Perimeter', 'PerimeterLinear', 'PerimeterOrthogonal'];
						libExpect(libFlow.EdgeThemes).to.be.an('object');
						for (let i = 0; i < tmpExpected.length; i++)
						{
							let tmpDescriptor = libFlow.EdgeThemes[tmpExpected[i]];
							libExpect(tmpDescriptor, tmpExpected[i]).to.be.an('object');
							libExpect(tmpDescriptor.Name, tmpExpected[i] + '.Name').to.be.a('string');
						}
					}
				);
			}
		);

		suite
		(
			'PictFlowCard API',
			function ()
			{
				test
				(
					'builds a node-type configuration consumers can extend (e.g. PortLabelsOutside)',
					function ()
					{
						let tmpFable = new libFable({});
						let tmpCard = new libFlow.PictFlowCard(
							tmpFable,
							{
								Title: 'Contract Test Card',
								Code: 'CTC',
								Inputs: [{ Name: 'In', Side: 'left' }],
								Outputs: [{ Name: 'Out', Side: 'right' }]
							},
							'contract-test-card');

						libExpect(tmpCard.getNodeTypeConfiguration).to.be.a('function');
						let tmpConfig = tmpCard.getNodeTypeConfiguration();
						libExpect(tmpConfig).to.be.an('object');

						// ultravisor mutates the returned config (sets PortLabelsOutside).
						tmpConfig.PortLabelsOutside = true;
						libExpect(tmpConfig.PortLabelsOutside).to.equal(true);
					}
				);
			}
		);
	}
);
