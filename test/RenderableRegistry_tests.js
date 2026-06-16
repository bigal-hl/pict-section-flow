const libChai = require('chai');
const libExpect = libChai.expect;

const libPictViewFlow = require('../source/views/PictView-Flow.js');

// resolveRenderableRenderer is a pure lookup over _RenderableRenderers — borrow the
// prototype method onto a stub so we can exercise it without constructing a view (no DOM).
function makeStub()
{
	return {
		_RenderableRenderers: { card: 'CARD', shape: 'SHAPE', sticky: 'STICKY' },
		_NodeView: 'NODEVIEW',
		resolveRenderableRenderer: libPictViewFlow.prototype.resolveRenderableRenderer
	};
}

suite
(
	'PictView-Flow renderable renderer resolution',
	function ()
	{
		test
		(
			'a node-level RenderableType selects its renderer',
			function ()
			{
				libExpect(makeStub().resolveRenderableRenderer({ RenderableType: 'shape' }, null)).to.equal('SHAPE');
			}
		);

		test
		(
			'a node-level RenderableType beats the node type config',
			function ()
			{
				libExpect(makeStub().resolveRenderableRenderer({ RenderableType: 'sticky' }, { RenderableType: 'card' })).to.equal('STICKY');
			}
		);

		test
		(
			'falls back to the node type config when the node names none',
			function ()
			{
				libExpect(makeStub().resolveRenderableRenderer({}, { RenderableType: 'shape' })).to.equal('SHAPE');
			}
		);

		test
		(
			'defaults to the card renderer',
			function ()
			{
				libExpect(makeStub().resolveRenderableRenderer({}, null)).to.equal('CARD');
				libExpect(makeStub().resolveRenderableRenderer(null, null)).to.equal('CARD');
			}
		);

		test
		(
			'an unknown renderer key falls back to the card renderer',
			function ()
			{
				libExpect(makeStub().resolveRenderableRenderer({ RenderableType: 'nope' }, null)).to.equal('CARD');
			}
		);
	}
);
