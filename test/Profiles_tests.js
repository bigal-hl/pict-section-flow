const libChai = require('chai');
const libExpect = libChai.expect;

const libFlowView = require('../source/views/PictView-Flow.js');

suite
(
	'PictView-Flow config profiles',
	function ()
	{
		test
		(
			'no profile yields the historical graph defaults',
			function ()
			{
				let tmpOptions = libFlowView.mergeProfileOptions({});
				libExpect(tmpOptions.WheelMode).to.equal('zoom');
				libExpect(tmpOptions.ReadOnly).to.equal(false);
				libExpect(tmpOptions.EnableToolbar).to.equal(true);
				libExpect(tmpOptions.EnableUndirectedConnections).to.equal(false);
			}
		);

		test
		(
			'whiteboard profile sets the free-form bundle',
			function ()
			{
				let tmpOptions = libFlowView.mergeProfileOptions({ Profile: 'whiteboard' });
				libExpect(tmpOptions.WheelMode).to.equal('pan');
				libExpect(tmpOptions.WheelZoomRequiresModifier).to.equal(true);
				libExpect(tmpOptions.EnableUndirectedConnections).to.equal(true);
				libExpect(tmpOptions.EnableMultiSelect).to.equal(true);
				libExpect(tmpOptions.Background).to.deep.equal({ Style: 'dots' });
			}
		);

		test
		(
			'moodboard profile sets content-card defaults',
			function ()
			{
				let tmpOptions = libFlowView.mergeProfileOptions({ Profile: 'moodboard' });
				libExpect(tmpOptions.EnableUndirectedConnections).to.equal(true);
				libExpect(tmpOptions.IncludeDefaultNodeTypes).to.equal(false);
				libExpect(tmpOptions.NodeTitleBarHeight).to.equal(0);
				libExpect(tmpOptions.EnableAddNode).to.equal(false);
			}
		);

		test
		(
			'presentation profile is read-only with no toolbar',
			function ()
			{
				let tmpOptions = libFlowView.mergeProfileOptions({ Profile: 'presentation' });
				libExpect(tmpOptions.ReadOnly).to.equal(true);
				libExpect(tmpOptions.EnableToolbar).to.equal(false);
			}
		);

		test
		(
			'explicit options override the profile',
			function ()
			{
				let tmpOptions = libFlowView.mergeProfileOptions({ Profile: 'presentation', ReadOnly: false });
				libExpect(tmpOptions.ReadOnly).to.equal(false);
			}
		);

		test
		(
			'an unknown profile falls back to defaults without throwing',
			function ()
			{
				let tmpOptions = libFlowView.mergeProfileOptions({ Profile: 'does-not-exist' });
				libExpect(tmpOptions.WheelMode).to.equal('zoom');
			}
		);

		test
		(
			'the profile map is exported',
			function ()
			{
				libExpect(libFlowView.Profiles).to.be.an('object');
				libExpect(Object.keys(libFlowView.Profiles)).to.include.members(['graph', 'whiteboard', 'moodboard', 'presentation', 'erd']);
			}
		);
	}
);
