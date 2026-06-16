const libFable = require('fable');
const libChai = require('chai');
const libExpect = libChai.expect;

const libInteractionManager = require('../source/services/PictService-Flow-InteractionManager.js');
const STATES = libInteractionManager.INTERACTION_STATES;

// A minimal FlowView stand-in: just the surface the node-resize path touches.
function makeMockFlowView(pNode)
{
	let tmpFired = [];
	return {
		options: { EnableNodeResizing: true, MinimumNodeWidth: 48, MinimumNodeHeight: 32 },
		viewState: { Zoom: 1 },
		flowData: {},
		_nodes: (function () { let m = {}; m[pNode.Hash] = pNode; return m; })(),
		getNode: function (pHash) { return this._nodes[pHash] || null; },
		renderFlow: function () { this._rendered = (this._rendered || 0) + 1; },
		marshalFromView: function () { this._marshaled = (this._marshaled || 0) + 1; },
		_EventHandlerProvider: { fireEvent: function (pName) { tmpFired.push(pName); } },
		_firedEvents: tmpFired
	};
}

function makeTarget(pHash)
{
	return { getAttribute: function (pAttr) { return (pAttr === 'data-node-hash') ? pHash : null; } };
}

function makeManager(pFable, pNode)
{
	let tmpFV = makeMockFlowView(pNode);
	let tmpIM = new libInteractionManager(pFable, { FlowView: tmpFV }, 'IM-Test');
	// initialize() would set this from the real SVG element; stub the class-list surface.
	tmpIM._SVGElement = { classList: { add: function () {}, remove: function () {} } };
	return { im: tmpIM, fv: tmpFV };
}

suite('PictService-Flow-InteractionManager',
function ()
{
	let _Fable;
	setup(function () { _Fable = new libFable({}); });

	suite('wheel action resolution',
	function ()
	{
		function makeWheelManager(pOptions)
		{
			return new libInteractionManager(_Fable, { FlowView: { options: pOptions } }, 'IM-Wheel');
		}

		test("default 'zoom' mode zooms on a plain wheel",
		function ()
		{
			let tmpIM = makeWheelManager({ WheelMode: 'zoom', EnableZooming: true, EnablePanning: true });
			libExpect(tmpIM._resolveWheelAction({ deltaY: 10 }).action).to.equal('zoom');
		});

		test("zoom mode + WheelZoomRequiresModifier: plain wheel pans, ctrl/cmd wheel zooms",
		function ()
		{
			let tmpIM = makeWheelManager({ WheelMode: 'zoom', WheelZoomRequiresModifier: true, EnableZooming: true, EnablePanning: true });
			libExpect(tmpIM._resolveWheelAction({ deltaY: 10 }).action).to.equal('pan');
			libExpect(tmpIM._resolveWheelAction({ deltaY: 10, ctrlKey: true }).action).to.equal('zoom');
			libExpect(tmpIM._resolveWheelAction({ deltaY: 10, metaKey: true }).action).to.equal('zoom');
		});

		test("'pan' mode pans on a plain wheel and zooms with a modifier",
		function ()
		{
			let tmpIM = makeWheelManager({ WheelMode: 'pan', EnableZooming: true, EnablePanning: true });
			libExpect(tmpIM._resolveWheelAction({ deltaY: 10 }).action).to.equal('pan');
			libExpect(tmpIM._resolveWheelAction({ deltaY: 10, ctrlKey: true }).action).to.equal('zoom');
		});

		test("'none' mode ignores the wheel",
		function ()
		{
			let tmpIM = makeWheelManager({ WheelMode: 'none', EnableZooming: true, EnablePanning: true });
			libExpect(tmpIM._resolveWheelAction({ deltaY: 10 }).action).to.equal('none');
		});

		test('a zoom intent with zooming disabled is a no-op (legacy behavior)',
		function ()
		{
			let tmpIM = makeWheelManager({ WheelMode: 'zoom', EnableZooming: false, EnablePanning: true });
			libExpect(tmpIM._resolveWheelAction({ deltaY: 10 }).action).to.equal('none');
		});

		test('a pan intent with panning disabled is a no-op',
		function ()
		{
			let tmpIM = makeWheelManager({ WheelMode: 'pan', EnableZooming: true, EnablePanning: false });
			libExpect(tmpIM._resolveWheelAction({ deltaY: 10 }).action).to.equal('none');
		});
	});

	suite('read-only mode',
	function ()
	{
		function makeReadOnlyView(pReadOnly)
		{
			let tmpFired = [];
			let tmpCalls = { selectNode: [], deleteSelected: 0 };
			return {
				options: { ReadOnly: pReadOnly, EnablePanning: true, EnableMultiSelect: false },
				isReadOnly: function () { return pReadOnly; },
				selectNode: function (pHash) { tmpCalls.selectNode.push(pHash); },
				getNode: function (pHash) { return { Hash: pHash }; },
				deleteSelected: function () { tmpCalls.deleteSelected++; },
				_EventHandlerProvider: { fireEvent: function (pName, pData) { tmpFired.push({ name: pName, data: pData }); } },
				_firedEvents: tmpFired,
				_calls: tmpCalls
			};
		}

		function makeRoManager(pView)
		{
			let tmpIM = new libInteractionManager(_Fable, { FlowView: pView }, 'IM-RO');
			tmpIM._SVGElement = { setPointerCapture: function () {}, classList: { add: function () {}, remove: function () {} } };
			return tmpIM;
		}

		function elTarget(pType, pNodeHash)
		{
			return { getAttribute: function (pAttr) { if (pAttr === 'data-element-type') return pType; if (pAttr === 'data-node-hash') return pNodeHash || null; return null; } };
		}

		test('_isReadOnly reflects the view',
		function ()
		{
			libExpect(makeRoManager(makeReadOnlyView(true))._isReadOnly()).to.equal(true);
			libExpect(makeRoManager(makeReadOnlyView(false))._isReadOnly()).to.equal(false);
		});

		test('a node click selects and fires onNodeActivate without starting a drag',
		function ()
		{
			let tmpView = makeReadOnlyView(true);
			let tmpIM = makeRoManager(tmpView);
			tmpIM._onPointerDown({ button: 0, pointerId: 1, target: elTarget('node', 'n1'), shiftKey: false, preventDefault: function () {}, stopPropagation: function () {} });
			libExpect(tmpView._calls.selectNode).to.deep.equal(['n1']);
			libExpect(tmpView._firedEvents.some(function (e) { return e.name === 'onNodeActivate'; })).to.equal(true);
			libExpect(tmpIM._State).to.equal(STATES.IDLE);
		});

		test('Delete is ignored in read-only but deletes when editable',
		function ()
		{
			let tmpRO = makeReadOnlyView(true);
			makeRoManager(tmpRO)._onKeyDown({ key: 'Delete', target: {}, preventDefault: function () {} });
			libExpect(tmpRO._calls.deleteSelected).to.equal(0);

			let tmpEditable = makeReadOnlyView(false);
			makeRoManager(tmpEditable)._onKeyDown({ key: 'Delete', target: {}, preventDefault: function () {} });
			libExpect(tmpEditable._calls.deleteSelected).to.equal(1);
		});

		test('context-menu edge editing is ignored in read-only but works when editable',
		function ()
		{
			let tmpROManager = makeRoManager(makeReadOnlyView(true));
			let tmpRoCalls = 0;
			tmpROManager._addBezierHandle = function () { tmpRoCalls++; };
			tmpROManager.handleContextMenu({ preventDefault: function () {}, target: elTarget('connection') });
			libExpect(tmpRoCalls).to.equal(0);

			let tmpEditManager = makeRoManager(makeReadOnlyView(false));
			let tmpEditCalls = 0;
			tmpEditManager._addBezierHandle = function () { tmpEditCalls++; };
			tmpEditManager.handleContextMenu({ preventDefault: function () {}, target: elTarget('connection') });
			libExpect(tmpEditCalls).to.equal(1);
		});

		test('the wheel scrolls the page by default (none) and zooms only when navigating',
		function ()
		{
			let tmpStatic = makeRoManager(makeReadOnlyView(true));
			libExpect(tmpStatic._resolveWheelAction({ deltaY: 10 }).action).to.equal('none');

			let tmpNavView = makeReadOnlyView(true);
			tmpNavView.isReadOnlyNavigation = function () { return true; };
			let tmpNav = makeRoManager(tmpNavView);
			libExpect(tmpNav._resolveWheelAction({ deltaY: 10 }).action).to.equal('zoom');
		});

		test('with the hand on, a pointer-down on a card pans instead of selecting',
		function ()
		{
			let tmpView = makeReadOnlyView(true);
			tmpView.isReadOnlyNavigation = function () { return true; };
			let tmpIM = makeRoManager(tmpView);
			let tmpPanned = 0;
			tmpIM._startPanning = function () { tmpPanned++; };
			tmpIM._onPointerDown({ button: 0, pointerId: 1, target: elTarget('node', 'n1'), preventDefault: function () {}, stopPropagation: function () {} });
			libExpect(tmpPanned).to.equal(1);
			libExpect(tmpView._calls.selectNode).to.deep.equal([]);
		});
	});

	suite('node rotation',
	function ()
	{
		function makeRotView(pNode, pReadOnly)
		{
			return {
				options: { EnableNodeRotation: true, ReadOnly: !!pReadOnly },
				isReadOnly: function () { return !!pReadOnly; },
				viewState: { Zoom: 1, PanX: 0, PanY: 0 },
				flowData: {},
				_nodes: (function () { let m = {}; m[pNode.Hash] = pNode; return m; })(),
				getNode: function (pHash) { return this._nodes[pHash] || null; },
				screenToSVGCoords: function (pX, pY) { return { x: pX, y: pY }; },
				renderFlow: function () {},
				marshalFromView: function () {},
				_EventHandlerProvider: { fireEvent: function () {} }
			};
		}

		function makeRotManager(pView)
		{
			let tmpIM = new libInteractionManager(_Fable, { FlowView: pView }, 'IM-Rotate');
			tmpIM._SVGElement = { classList: { add: function () {}, remove: function () {} }, setPointerCapture: function () {} };
			return tmpIM;
		}

		test('points the card top toward the pointer (above=0, right=90, below=180)',
		function ()
		{
			let tmpNode = { Hash: 'n1', X: 100, Y: 100, Width: 100, Height: 100 }; // center 150,150
			let tmpView = makeRotView(tmpNode, false);
			let tmpIM = makeRotManager(tmpView);

			tmpIM._startNodeRotate({ stopPropagation: function () {} }, makeTarget('n1'));
			libExpect(tmpIM._State).to.equal(STATES.ROTATING_NODE);

			tmpIM._onNodeRotate({ clientX: 150, clientY: 50 });
			libExpect(tmpNode.Rotation).to.equal(0);
			tmpIM._onNodeRotate({ clientX: 250, clientY: 150 });
			libExpect(tmpNode.Rotation).to.equal(90);
			tmpIM._onNodeRotate({ clientX: 150, clientY: 250 });
			libExpect(tmpNode.Rotation).to.equal(180);
		});

		test('Shift snaps rotation to 15-degree increments',
		function ()
		{
			let tmpNode = { Hash: 'n1', X: 0, Y: 0, Width: 100, Height: 100 }; // center 50,50
			let tmpIM = makeRotManager(makeRotView(tmpNode, false));
			tmpIM._startNodeRotate({ stopPropagation: function () {} }, makeTarget('n1'));
			// A point just off straight-right; snapped it lands on 90.
			tmpIM._onNodeRotate({ clientX: 110, clientY: 53, shiftKey: true });
			libExpect(tmpNode.Rotation % 15).to.equal(0);
		});

		test('does not start when read-only or when rotation is disabled',
		function ()
		{
			let tmpNodeA = { Hash: 'n1', X: 0, Y: 0, Width: 100, Height: 100 };
			let tmpReadOnly = makeRotManager(makeRotView(tmpNodeA, true));
			tmpReadOnly._startNodeRotate({ stopPropagation: function () {} }, makeTarget('n1'));
			libExpect(tmpReadOnly._State).to.equal(STATES.IDLE);

			let tmpNodeB = { Hash: 'n1', X: 0, Y: 0, Width: 100, Height: 100 };
			let tmpDisabledView = makeRotView(tmpNodeB, false);
			tmpDisabledView.options.EnableNodeRotation = false;
			let tmpDisabled = makeRotManager(tmpDisabledView);
			tmpDisabled._startNodeRotate({ stopPropagation: function () {} }, makeTarget('n1'));
			libExpect(tmpDisabled._State).to.equal(STATES.IDLE);
		});
	});

	suite('node resize',
	function ()
	{
		test('resizes from the start size by the pointer delta divided by zoom',
		function ()
		{
			let tmpNode = { Hash: 'n1', X: 0, Y: 0, Width: 100, Height: 80 };
			let tmp = makeManager(_Fable, tmpNode);
			tmp.fv.viewState.Zoom = 2;

			tmp.im._startNodeResize({ clientX: 200, clientY: 100, stopPropagation: function () {} }, makeTarget('n1'));
			libExpect(tmp.im._State).to.equal(STATES.RESIZING_NODE);

			// +100px / +40px at zoom 2 -> +50 / +20 world units
			tmp.im._onNodeResize({ clientX: 300, clientY: 140 });
			libExpect(tmpNode.Width).to.equal(150);
			libExpect(tmpNode.Height).to.equal(100);
		});

		test('clamps to the minimum size',
		function ()
		{
			let tmpNode = { Hash: 'n1', Width: 100, Height: 80 };
			let tmp = makeManager(_Fable, tmpNode);

			tmp.im._startNodeResize({ clientX: 0, clientY: 0, stopPropagation: function () {} }, makeTarget('n1'));
			tmp.im._onNodeResize({ clientX: -1000, clientY: -1000 });
			libExpect(tmpNode.Width).to.equal(48);
			libExpect(tmpNode.Height).to.equal(32);
		});

		test('end fires onNodeResized + onFlowChanged, marshals, and returns to idle',
		function ()
		{
			let tmpNode = { Hash: 'n1', Width: 100, Height: 80 };
			let tmp = makeManager(_Fable, tmpNode);

			tmp.im._startNodeResize({ clientX: 0, clientY: 0, stopPropagation: function () {} }, makeTarget('n1'));
			tmp.im._endNodeResize({});

			libExpect(tmp.fv._firedEvents).to.include('onNodeResized');
			libExpect(tmp.fv._firedEvents).to.include('onFlowChanged');
			libExpect(tmp.fv._marshaled).to.be.greaterThan(0);
			libExpect(tmp.im._State).to.equal(STATES.IDLE);
			libExpect(tmp.im._ResizeNodeHash).to.equal(null);
		});

		test('does not start when EnableNodeResizing is off',
		function ()
		{
			let tmpNode = { Hash: 'n1', Width: 100, Height: 80 };
			let tmp = makeManager(_Fable, tmpNode);
			tmp.fv.options.EnableNodeResizing = false;

			tmp.im._startNodeResize({ clientX: 0, clientY: 0, stopPropagation: function () {} }, makeTarget('n1'));
			libExpect(tmp.im._State).to.equal(STATES.IDLE);
			libExpect(tmp.im._ResizeNodeHash).to.equal(null);
		});
	});

	suite('grid snap',
	function ()
	{
		test('snaps a value to the grid when EnableGridSnap is on',
		function ()
		{
			let tmp = makeManager(_Fable, { Hash: 'n1' });
			tmp.fv.options.EnableGridSnap = true;
			tmp.fv.options.GridSnapSize = 10;
			libExpect(tmp.im._snapToGrid(37)).to.equal(40);
			libExpect(tmp.im._snapToGrid(53)).to.equal(50);
			libExpect(tmp.im._snapToGrid(45)).to.equal(50);
		});

		test('passes the value through when EnableGridSnap is off',
		function ()
		{
			let tmp = makeManager(_Fable, { Hash: 'n1' });
			tmp.fv.options.EnableGridSnap = false;
			libExpect(tmp.im._snapToGrid(37)).to.equal(37);
		});

		test('passes through when the grid size is zero or missing',
		function ()
		{
			let tmp = makeManager(_Fable, { Hash: 'n1' });
			tmp.fv.options.EnableGridSnap = true;
			tmp.fv.options.GridSnapSize = 0;
			libExpect(tmp.im._snapToGrid(37)).to.equal(37);
		});
	});

	// ---- Multi-select ----

	function makeMultiMockFlowView(pNodes)
	{
		let tmpSelected = [];
		let tmpCalls = { selectNodes: [], deselectAll: 0, updateNodePosition: [] };
		let tmpViewportChildren = [];
		return {
			options: { EnableMultiSelect: true, EnableNodeDragging: true, DefaultNodeWidth: 180, DefaultNodeHeight: 80 },
			viewState: { Zoom: 1 },
			_FlowData: { Nodes: pNodes.slice() },
			_ViewportElement: { appendChild: function (e) { tmpViewportChildren.push(e); }, removeChild: function (e) { tmpViewportChildren = tmpViewportChildren.filter((c) => c !== e); } },
			_NodesLayer: { querySelector: function () { return { classList: { add: function () {}, remove: function () {} } }; } },
			_nodes: (function () { let m = {}; pNodes.forEach((n) => { m[n.Hash] = n; }); return m; })(),
			getNode: function (pHash) { return this._nodes[pHash] || null; },
			// Identity coordinate mapping so screen deltas equal world deltas in the test.
			screenToSVGCoords: function (pX, pY) { return { x: pX, y: pY }; },
			getSelectedNodeHashes: function () { return tmpSelected.slice(); },
			selectNode: function (pHash) { tmpSelected = pHash ? [pHash] : []; },
			selectNodes: function (pHashes) { tmpSelected = pHashes.slice(); tmpCalls.selectNodes.push(pHashes.slice()); },
			deselectAll: function () { tmpSelected = []; tmpCalls.deselectAll++; },
			updateNodePosition: function (pHash, pX, pY) { let n = this._nodes[pHash]; if (n) { n.X = pX; n.Y = pY; } tmpCalls.updateNodePosition.push({ Hash: pHash, X: pX, Y: pY }); },
			renderFlow: function () {},
			marshalFromView: function () {},
			_EventHandlerProvider: { fireEvent: function () {} },
			_calls: tmpCalls,
			_setSelected: function (pArr) { tmpSelected = pArr.slice(); }
		};
	}

	function makeMultiManager(pFable, pNodes)
	{
		let tmpFV = makeMultiMockFlowView(pNodes);
		let tmpIM = new libInteractionManager(pFable, { FlowView: tmpFV }, 'IM-Multi-Test');
		tmpIM._SVGElement = { classList: { add: function () {}, remove: function () {} } };
		return { im: tmpIM, fv: tmpFV };
	}

	suite('marquee selection',
	function ()
	{
		let _MNodes;
		let _SavedDocument;
		setup(function ()
		{
			_MNodes = [ { Hash: 'n1', X: 0, Y: 0, Width: 100, Height: 80 }, { Hash: 'n2', X: 200, Y: 0, Width: 100, Height: 80 }, { Hash: 'n3', X: 400, Y: 0, Width: 100, Height: 80 } ];
			// The marquee draws a real SVG <rect>; stub the DOM factory for the headless test, restore after.
			_SavedDocument = global.document;
			global.document = { createElementNS: function () { let tmpEl = { setAttribute: function (pK, pV) { tmpEl[pK] = pV; } }; return tmpEl; } };
		});
		teardown(function () { global.document = _SavedDocument; });

		test('a drag selects every node whose box intersects the rectangle',
		function ()
		{
			let tmp = makeMultiManager(_Fable, _MNodes);
			tmp.im._startMarquee({ clientX: 0, clientY: 0 });
			libExpect(tmp.im._State).to.equal(STATES.MARQUEE);
			tmp.im._onMarquee({ clientX: 250, clientY: 100 });
			tmp.im._endMarquee({ clientX: 250, clientY: 100 });
			libExpect(tmp.fv._calls.selectNodes.length).to.equal(1);
			libExpect(tmp.fv._calls.selectNodes[0]).to.deep.equal(['n1', 'n2']);
			libExpect(tmp.im._State).to.equal(STATES.IDLE);
		});

		test('a tiny rectangle (a click) clears the selection instead of selecting',
		function ()
		{
			let tmp = makeMultiManager(_Fable, _MNodes);
			tmp.im._startMarquee({ clientX: 10, clientY: 10 });
			tmp.im._onMarquee({ clientX: 12, clientY: 11 });
			tmp.im._endMarquee({ clientX: 12, clientY: 11 });
			libExpect(tmp.fv._calls.deselectAll).to.equal(1);
			libExpect(tmp.fv._calls.selectNodes.length).to.equal(0);
		});
	});

	suite('multi-drag',
	function ()
	{
		let _MNodes;
		setup(function () { _MNodes = [ { Hash: 'n1', X: 0, Y: 0, Width: 100, Height: 80 }, { Hash: 'n2', X: 200, Y: 50, Width: 100, Height: 80 } ]; });

		test('dragging a node in the selection moves every selected node by the same delta',
		function ()
		{
			let tmp = makeMultiManager(_Fable, _MNodes);
			tmp.fv._setSelected(['n1', 'n2']);
			tmp.im._startNodeDrag({ clientX: 0, clientY: 0 }, makeTarget('n1'));
			libExpect(tmp.im._State).to.equal(STATES.DRAGGING_NODE);
			libExpect(tmp.im._DragNodes.length).to.equal(2);

			tmp.im._onNodeDrag({ clientX: 30, clientY: 20 });
			libExpect(_MNodes[0].X).to.equal(30);
			libExpect(_MNodes[0].Y).to.equal(20);
			libExpect(_MNodes[1].X).to.equal(230);
			libExpect(_MNodes[1].Y).to.equal(70);
		});

		test('dragging a node outside the selection collapses to just that node',
		function ()
		{
			let tmp = makeMultiManager(_Fable, _MNodes);
			tmp.fv._setSelected(['n2']);
			tmp.im._startNodeDrag({ clientX: 0, clientY: 0 }, makeTarget('n1'));
			libExpect(tmp.im._DragNodes.length).to.equal(1);
			libExpect(tmp.im._DragNodes[0].Hash).to.equal('n1');
		});
	});

	suite('alignment guides',
	function ()
	{
		test('snaps the dragged node so a near edge lines up, and reports guides',
		function ()
		{
			let tmpNodes = [ { Hash: 'drag', X: 0, Y: 0, Width: 100, Height: 80 }, { Hash: 'other', X: 200, Y: 0, Width: 100, Height: 80 } ];
			let tmp = makeMultiManager(_Fable, tmpNodes);
			let tmpDrag = tmpNodes[0];
			// Move the dragged node so its left edge (197) is 3px from the other node's left (200).
			let tmpResult = tmp.im._alignmentFor(tmpDrag, 197, 0);
			libExpect(tmpResult.X).to.equal(200); // snapped to align left edges
			libExpect(tmpResult.Y).to.equal(0);   // tops already aligned
			let tmpVGuide = tmpResult.Guides.find(function (g) { return g.Type === 'v'; });
			let tmpHGuide = tmpResult.Guides.find(function (g) { return g.Type === 'h'; });
			libExpect(tmpVGuide).to.be.an('object');
			libExpect(tmpVGuide.Pos).to.equal(200);
			libExpect(tmpHGuide).to.be.an('object');
			libExpect(tmpHGuide.Pos).to.equal(0);
		});

		test('no snap or guides when nothing is within the threshold',
		function ()
		{
			let tmpNodes = [ { Hash: 'drag', X: 0, Y: 0, Width: 100, Height: 80 }, { Hash: 'other', X: 200, Y: 0, Width: 100, Height: 80 } ];
			let tmp = makeMultiManager(_Fable, tmpNodes);
			let tmpResult = tmp.im._alignmentFor(tmpNodes[0], 500, 500);
			libExpect(tmpResult.X).to.equal(500);
			libExpect(tmpResult.Y).to.equal(500);
			libExpect(tmpResult.Guides.length).to.equal(0);
		});
	});
});
