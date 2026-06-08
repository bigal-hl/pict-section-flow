const libChai = require('chai');
const libExpect = libChai.expect;

const libPictViewFlowNode = require('../source/views/PictView-Flow-Node.js');

suite('PictView-Flow-Node',
function ()
{
	// The title-bar bottom strip squares off the title bar's lower corners. The regression it guards
	// against: a corner radius larger than the title bar made the strip taller than the whole title
	// bar, so it painted over the rounded TOP corners and the card read as square on top (only the
	// bottom rounded). See titleBarBottomStripHeight.
	suite('titleBarBottomStripHeight',
	function ()
	{
		test('never exceeds half the title bar height, even for a capsule radius',
		function ()
		{
			// radius 24 on a 22px title bar must not produce a 24px strip (which would cover the top)
			libExpect(libPictViewFlowNode.titleBarBottomStripHeight(24, 22)).to.equal(11);
			libExpect(libPictViewFlowNode.titleBarBottomStripHeight(100, 30)).to.equal(15);
		});

		test('covers small radii with the 8px floor',
		function ()
		{
			libExpect(libPictViewFlowNode.titleBarBottomStripHeight(5, 22)).to.equal(8);
			libExpect(libPictViewFlowNode.titleBarBottomStripHeight(0, 22)).to.equal(8);
		});

		test('treats a null/absent radius as no override (8px floor)',
		function ()
		{
			libExpect(libPictViewFlowNode.titleBarBottomStripHeight(null, 22)).to.equal(8);
			libExpect(libPictViewFlowNode.titleBarBottomStripHeight(undefined, 22)).to.equal(8);
		});

		test('the strip is always at most the title bar height for any radius',
		function ()
		{
			let tmpTitleBarHeight = 22;
			for (let tmpRadius = 0; tmpRadius <= 60; tmpRadius++)
			{
				let tmpStrip = libPictViewFlowNode.titleBarBottomStripHeight(tmpRadius, tmpTitleBarHeight);
				libExpect(tmpStrip).to.be.at.most(Math.floor(tmpTitleBarHeight / 2));
			}
		});
	});

	suite('nodeTransform',
	function ()
	{
		test('a zero / absent rotation is a plain position translate',
		function ()
		{
			libExpect(libPictViewFlowNode.nodeTransform(40, 60, 0, 100, 80)).to.equal('translate(40, 60)');
			libExpect(libPictViewFlowNode.nodeTransform(40, 60, null, 100, 80)).to.equal('translate(40, 60)');
		});

		test('a non-zero rotation rotates about the node center',
		function ()
		{
			libExpect(libPictViewFlowNode.nodeTransform(40, 60, 15, 100, 80)).to.equal('translate(40, 60) rotate(15 50 40)');
		});
	});
});
