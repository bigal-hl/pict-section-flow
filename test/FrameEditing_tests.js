const libChai = require('chai');
const libExpect = libChai.expect;

const libInteractionManager = require('../source/services/PictService-Flow-InteractionManager.js');

suite
(
	'PictService-Flow-InteractionManager.computeFrameResize',
	function ()
	{
		let _Start = { X: 100, Y: 100, Width: 400, Height: 300 };

		test
		(
			'east edge changes width only',
			function ()
			{
				libExpect(libInteractionManager.computeFrameResize(_Start, 'e', 50, 0, 40)).to.deep.equal({ X: 100, Y: 100, Width: 450, Height: 300 });
			}
		);

		test
		(
			'south edge changes height only',
			function ()
			{
				libExpect(libInteractionManager.computeFrameResize(_Start, 's', 0, -30, 40)).to.deep.equal({ X: 100, Y: 100, Width: 400, Height: 270 });
			}
		);

		test
		(
			'north edge moves the top and holds the bottom',
			function ()
			{
				libExpect(libInteractionManager.computeFrameResize(_Start, 'n', 0, 40, 40)).to.deep.equal({ X: 100, Y: 140, Width: 400, Height: 260 });
			}
		);

		test
		(
			'west edge moves the left and holds the right',
			function ()
			{
				libExpect(libInteractionManager.computeFrameResize(_Start, 'w', 60, 0, 40)).to.deep.equal({ X: 160, Y: 100, Width: 340, Height: 300 });
			}
		);

		test
		(
			'clamps to the minimum size, holding the opposite edge',
			function ()
			{
				libExpect(libInteractionManager.computeFrameResize(_Start, 's', 0, -400, 40).Height).to.equal(40);
				let tmpNorth = libInteractionManager.computeFrameResize(_Start, 'n', 0, 400, 40);
				libExpect(tmpNorth.Height).to.equal(40);
				libExpect(tmpNorth.Y).to.equal(360);
			}
		);
	}
);
