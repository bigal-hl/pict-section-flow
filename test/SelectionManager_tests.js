const libFable = require('fable');
const libChai = require('chai');
const libExpect = libChai.expect;

const libSelectionManager = require('../source/services/PictService-Flow-SelectionManager.js');

// A minimal FlowView stand-in: just the surface the selection manager touches.
function makeMockFlowView(pNodes)
{
	let tmpFired = [];
	let tmpRemoved = [];
	return {
		_FlowData:
		{
			Nodes: pNodes.slice(),
			Connections: [],
			OpenPanels: [],
			ViewState: { SelectedNodeHash: null, SelectedNodeHashes: [], SelectedConnectionHash: null, SelectedTetherHash: null }
		},
		renderFlow: function () { this._rendered = (this._rendered || 0) + 1; },
		removeNode: function (pHash) { tmpRemoved.push(pHash); this._FlowData.Nodes = this._FlowData.Nodes.filter((n) => n.Hash !== pHash); return true; },
		removeConnection: function (pHash) { tmpRemoved.push('conn:' + pHash); return true; },
		_EventHandlerProvider: { fireEvent: function (pName, pPayload) { tmpFired.push({ Name: pName, Payload: pPayload }); } },
		_firedEvents: tmpFired,
		_removed: tmpRemoved
	};
}

function makeManager(pFable, pNodes)
{
	let tmpFV = makeMockFlowView(pNodes);
	let tmpSM = new libSelectionManager(pFable, { FlowView: tmpFV }, 'SM-Test');
	return { sm: tmpSM, fv: tmpFV, vs: tmpFV._FlowData.ViewState };
}

suite('PictService-Flow-SelectionManager',
function ()
{
	let _Fable;
	let _Nodes;
	setup(function ()
	{
		_Fable = new libFable({});
		_Nodes = [ { Hash: 'n1', X: 0, Y: 0, Width: 100, Height: 80 }, { Hash: 'n2', X: 200, Y: 0, Width: 100, Height: 80 }, { Hash: 'n3', X: 400, Y: 0, Width: 100, Height: 80 } ];
	});

	suite('single selection keeps the set in lockstep',
	function ()
	{
		test('selectNode sets the primary and a one-element set',
		function ()
		{
			let tmp = makeManager(_Fable, _Nodes);
			tmp.sm.selectNode('n2');
			libExpect(tmp.vs.SelectedNodeHash).to.equal('n2');
			libExpect(tmp.vs.SelectedNodeHashes).to.deep.equal(['n2']);
		});

		test('selectNode(null) clears both the primary and the set',
		function ()
		{
			let tmp = makeManager(_Fable, _Nodes);
			tmp.sm.selectNode('n2');
			tmp.sm.selectNode(null);
			libExpect(tmp.vs.SelectedNodeHash).to.equal(null);
			libExpect(tmp.vs.SelectedNodeHashes).to.deep.equal([]);
		});
	});

	suite('toggleNodeSelection',
	function ()
	{
		test('adds a node, then a second, then removes the first',
		function ()
		{
			let tmp = makeManager(_Fable, _Nodes);
			tmp.sm.toggleNodeSelection('n1');
			libExpect(tmp.vs.SelectedNodeHashes).to.deep.equal(['n1']);
			libExpect(tmp.vs.SelectedNodeHash).to.equal('n1');

			tmp.sm.toggleNodeSelection('n3');
			libExpect(tmp.vs.SelectedNodeHashes).to.deep.equal(['n1', 'n3']);
			libExpect(tmp.vs.SelectedNodeHash).to.equal('n3');

			tmp.sm.toggleNodeSelection('n1');
			libExpect(tmp.vs.SelectedNodeHashes).to.deep.equal(['n3']);
			libExpect(tmp.vs.SelectedNodeHash).to.equal('n3');
		});

		test('toggling the last member empties the set and nulls the primary',
		function ()
		{
			let tmp = makeManager(_Fable, _Nodes);
			tmp.sm.toggleNodeSelection('n1');
			tmp.sm.toggleNodeSelection('n1');
			libExpect(tmp.vs.SelectedNodeHashes).to.deep.equal([]);
			libExpect(tmp.vs.SelectedNodeHash).to.equal(null);
		});
	});

	suite('selectNodes',
	function ()
	{
		test('replaces the set and sets the primary to the last hash',
		function ()
		{
			let tmp = makeManager(_Fable, _Nodes);
			tmp.sm.selectNode('n1');
			tmp.sm.selectNodes(['n2', 'n3']);
			libExpect(tmp.vs.SelectedNodeHashes).to.deep.equal(['n2', 'n3']);
			libExpect(tmp.vs.SelectedNodeHash).to.equal('n3');
		});

		test('an empty array clears the selection',
		function ()
		{
			let tmp = makeManager(_Fable, _Nodes);
			tmp.sm.selectNodes(['n1', 'n2']);
			tmp.sm.selectNodes([]);
			libExpect(tmp.vs.SelectedNodeHashes).to.deep.equal([]);
			libExpect(tmp.vs.SelectedNodeHash).to.equal(null);
		});

		test('getSelectedNodeHashes returns a copy (mutating it does not change state)',
		function ()
		{
			let tmp = makeManager(_Fable, _Nodes);
			tmp.sm.selectNodes(['n1', 'n2']);
			let tmpCopy = tmp.sm.getSelectedNodeHashes();
			tmpCopy.push('n3');
			libExpect(tmp.vs.SelectedNodeHashes).to.deep.equal(['n1', 'n2']);
		});
	});

	suite('deleteSelected (multi)',
	function ()
	{
		test('removes every node in the selection set',
		function ()
		{
			let tmp = makeManager(_Fable, _Nodes);
			tmp.sm.selectNodes(['n1', 'n3']);
			let tmpResult = tmp.sm.deleteSelected();
			libExpect(tmpResult).to.equal(true);
			libExpect(tmp.fv._removed).to.deep.equal(['n1', 'n3']);
			libExpect(tmp.vs.SelectedNodeHashes).to.deep.equal([]);
			libExpect(tmp.vs.SelectedNodeHash).to.equal(null);
		});

		test('falls back to the single primary when the set is empty',
		function ()
		{
			let tmp = makeManager(_Fable, _Nodes);
			tmp.fv._FlowData.ViewState.SelectedNodeHash = 'n2';
			tmp.fv._FlowData.ViewState.SelectedNodeHashes = [];
			tmp.sm.deleteSelected();
			libExpect(tmp.fv._removed).to.deep.equal(['n2']);
		});

		test('deletes the selected connection when no nodes are selected',
		function ()
		{
			let tmp = makeManager(_Fable, _Nodes);
			tmp.fv._FlowData.ViewState.SelectedConnectionHash = 'c1';
			tmp.sm.deleteSelected();
			libExpect(tmp.fv._removed).to.deep.equal(['conn:c1']);
		});
	});

	suite('deselectAll',
	function ()
	{
		test('clears the primary, the set, and the connection/tether selections',
		function ()
		{
			let tmp = makeManager(_Fable, _Nodes);
			tmp.sm.selectNodes(['n1', 'n2']);
			tmp.fv._FlowData.ViewState.SelectedConnectionHash = 'c1';
			tmp.sm.deselectAll();
			libExpect(tmp.vs.SelectedNodeHash).to.equal(null);
			libExpect(tmp.vs.SelectedNodeHashes).to.deep.equal([]);
			libExpect(tmp.vs.SelectedConnectionHash).to.equal(null);
		});
	});
});
