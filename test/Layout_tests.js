const libFable = require('fable');
const libChai = require('chai');
const libExpect = libChai.expect;

const libLayoutService = require('../source/services/PictService-Flow-Layout.js');

const libGraphLayout = require('pict-provider-graphlayout');

const libLayoutCustom           = libGraphLayout.Layouts.Custom;
const libLayoutLayered          = libGraphLayout.Layouts.Layered;
const libLayoutStaggered        = libGraphLayout.Layouts.Staggered;
const libLayoutRank             = libGraphLayout.Layouts.Rank;
const libLayoutForcedFromCenter = libGraphLayout.Layouts.ForcedFromCenter;
const libLayoutGrid             = libGraphLayout.Layouts.Grid;
const libLayoutCircular         = libGraphLayout.Layouts.Circular;
const libLayoutTabular          = libGraphLayout.Layouts.Tabular;
const libLayoutColumnar         = libGraphLayout.Layouts.Columnar;

const libEdgeBezier         = libGraphLayout.Edges.Bezier;
const libEdgeOrthogonal     = libGraphLayout.Edges.Orthogonal;
const libEdgeStraight       = libGraphLayout.Edges.Straight;
const libEdgeOrthogonalSnap = libGraphLayout.Edges.OrthogonalSnap;
const libEdgePerimeter      = libGraphLayout.Edges.Perimeter;

function makeNodes(pCount)
{
	let tmpNodes = [];
	for (let i = 0; i < pCount; i++)
	{
		tmpNodes.push({
			Hash: `n-${i}`,
			Title: `Node ${i}`,
			X: 0,
			Y: 0,
			Width: 180,
			Height: 80
		});
	}
	return tmpNodes;
}

function makeChain(pCount)
{
	let tmpConns = [];
	for (let i = 0; i < pCount - 1; i++)
	{
		tmpConns.push({
			Hash: `c-${i}`,
			SourceNodeHash: `n-${i}`,
			TargetNodeHash: `n-${i + 1}`
		});
	}
	return tmpConns;
}

suite
(
	'PictService-Flow-Layout',
	function ()
	{
		let _Fable;
		let _LayoutService;

		setup
		(
			function ()
			{
				_Fable = new libFable({});
				_LayoutService = new libLayoutService(_Fable, {}, 'Layout-Test');
			}
		);

		// ── Service constructor ───────────────────────────────────────

		suite
		(
			'Constructor',
			function ()
			{
				test
				(
					'should instantiate with correct serviceType',
					function (fDone)
					{
						libExpect(_LayoutService).to.be.an('object');
						libExpect(_LayoutService.serviceType).to.equal('PictServiceFlowLayout');
						fDone();
					}
				);

				test
				(
					'should register all eight built-in algorithms by default',
					function (fDone)
					{
						let tmpNames = _LayoutService.getAlgorithmNames();
						libExpect(tmpNames).to.include.members([
							'Custom', 'Layered', 'Staggered', 'ForcedFromCenter',
							'Grid', 'Circular', 'Tabular', 'Columnar'
						]);
						libExpect(tmpNames.length).to.equal(8);
						fDone();
					}
				);
			}
		);

		// ── Registry ──────────────────────────────────────────────────

		suite
		(
			'Registry',
			function ()
			{
				test
				(
					'getAlgorithm returns null for unknown name',
					function (fDone)
					{
						libExpect(_LayoutService.getAlgorithm('NopeNope')).to.equal(null);
						fDone();
					}
				);

				test
				(
					'getAlgorithm returns a descriptor with required fields',
					function (fDone)
					{
						let tmpAlgo = _LayoutService.getAlgorithm('Layered');
						libExpect(tmpAlgo).to.be.an('object');
						libExpect(tmpAlgo.Name).to.equal('Layered');
						libExpect(tmpAlgo.Apply).to.be.a('function');
						libExpect(tmpAlgo.DefaultParameters).to.be.an('object');
						libExpect(tmpAlgo.ParameterSchema).to.be.an('object');
						fDone();
					}
				);

				test
				(
					'registerAlgorithm round-trips a custom descriptor',
					function (fDone)
					{
						let tmpCustom =
						{
							Name: 'TestStub',
							Label: 'Test Stub',
							Apply: function (pNodes)
							{
								for (let i = 0; i < pNodes.length; i++)
								{
									pNodes[i].X = 999;
									pNodes[i].Y = i;
								}
							},
							DefaultParameters: {},
							ParameterSchema: {}
						};
						let tmpResult = _LayoutService.registerAlgorithm(tmpCustom);
						libExpect(tmpResult).to.equal(true);
						libExpect(_LayoutService.getAlgorithm('TestStub')).to.equal(tmpCustom);

						let tmpNodes = makeNodes(3);
						_LayoutService.applyLayout(tmpNodes, [], 'TestStub', {});
						libExpect(tmpNodes[0].X).to.equal(999);
						libExpect(tmpNodes[2].Y).to.equal(2);
						fDone();
					}
				);

				test
				(
					'registerAlgorithm rejects invalid descriptors',
					function (fDone)
					{
						libExpect(_LayoutService.registerAlgorithm(null)).to.equal(false);
						libExpect(_LayoutService.registerAlgorithm({})).to.equal(false);
						libExpect(_LayoutService.registerAlgorithm({ Name: 'X' })).to.equal(false);
						libExpect(_LayoutService.registerAlgorithm({ Apply: function () {} })).to.equal(false);
						fDone();
					}
				);

				test
				(
					'listAlgorithms returns descriptors for all registered algorithms',
					function (fDone)
					{
						let tmpAll = _LayoutService.listAlgorithms();
						libExpect(tmpAll.length).to.equal(8);
						let tmpNames = tmpAll.map((pA) => pA.Name);
						libExpect(tmpNames).to.include('Custom');
						libExpect(tmpNames).to.include('Staggered');
						libExpect(tmpNames).to.include('ForcedFromCenter');
						fDone();
					}
				);
			}
		);

		// ── Backwards compatibility ───────────────────────────────────

		suite
		(
			'Backwards compatibility',
			function ()
			{
				test
				(
					'autoLayout(nodes, connections) — 2-arg legacy form dispatches to Layered',
					function (fDone)
					{
						// Build a 3-node chain n-0 -> n-1 -> n-2 and assert Layered positions
						let tmpNodes = makeNodes(3);
						let tmpConns = makeChain(3);

						_LayoutService.autoLayout(tmpNodes, tmpConns);

						// Layered defaults: HorizontalSpacing 250, VerticalSpacing 120, Start (100, 100)
						// Expected: each node in its own layer, X advances by node-width (180) + 250
						libExpect(tmpNodes[0].X).to.equal(100);
						libExpect(tmpNodes[0].Y).to.equal(100);
						libExpect(tmpNodes[1].X).to.equal(100 + 180 + 250);
						libExpect(tmpNodes[1].Y).to.equal(100);
						libExpect(tmpNodes[2].X).to.equal(100 + (180 + 250) * 2);
						libExpect(tmpNodes[2].Y).to.equal(100);
						fDone();
					}
				);

				test
				(
					'autoLayout — empty nodes is a no-op',
					function (fDone)
					{
						_LayoutService.autoLayout([], []);
						_LayoutService.autoLayout(null, []);
						fDone();
					}
				);

				test
				(
					'autoLayoutSubset — places orphans to the right of fixed nodes (always Layered)',
					function (fDone)
					{
						let tmpFixed = [
							{ Hash: 'fix-0', X: 0,   Y: 0, Width: 100, Height: 50 },
							{ Hash: 'fix-1', X: 200, Y: 0, Width: 100, Height: 50 }
						];
						let tmpOrphans = makeNodes(2);
						_LayoutService.autoLayoutSubset(tmpOrphans, tmpFixed, []);
						// Right-edge of fix-1 is 300; +HorizontalSpacing(250) = 550
						libExpect(tmpOrphans[0].X).to.equal(550);
						fDone();
					}
				);

				test
				(
					'snapToGrid rounds to grid size',
					function (fDone)
					{
						libExpect(_LayoutService.snapToGrid(13, 10)).to.equal(10);
						libExpect(_LayoutService.snapToGrid(16, 10)).to.equal(20);
						libExpect(_LayoutService.snapToGrid(50, 0)).to.equal(50); // disabled
						fDone();
					}
				);
			}
		);

		// ── Layered ───────────────────────────────────────────────────

		suite
		(
			'Layered algorithm',
			function ()
			{
				test
				(
					'one node lands at StartX/StartY',
					function (fDone)
					{
						let tmpNodes = makeNodes(1);
						libLayoutLayered.Apply(tmpNodes, [], libLayoutLayered.DefaultParameters);
						libExpect(tmpNodes[0].X).to.equal(100);
						libExpect(tmpNodes[0].Y).to.equal(100);
						fDone();
					}
				);

				test
				(
					'parallel siblings stack vertically',
					function (fDone)
					{
						// Two roots, no connections — they end up in the same layer
						let tmpNodes = makeNodes(2);
						libLayoutLayered.Apply(tmpNodes, [], libLayoutLayered.DefaultParameters);
						libExpect(tmpNodes[0].X).to.equal(tmpNodes[1].X);
						libExpect(tmpNodes[1].Y).to.equal(tmpNodes[0].Y + 80 + 120);
						fDone();
					}
				);

				test
				(
					'caller-supplied params override defaults',
					function (fDone)
					{
						let tmpNodes = makeNodes(2);
						let tmpConns = makeChain(2);
						libLayoutLayered.Apply(tmpNodes, tmpConns, { HorizontalSpacing: 50, VerticalSpacing: 30, StartX: 0, StartY: 0 });
						libExpect(tmpNodes[0].X).to.equal(0);
						libExpect(tmpNodes[0].Y).to.equal(0);
						libExpect(tmpNodes[1].X).to.equal(180 + 50);
						libExpect(tmpNodes[1].Y).to.equal(0);
						fDone();
					}
				);

				test
				(
					'a back-edge cycle does NOT collapse into one column (regression)',
					function (fDone)
					{
						// n0 -> n1 -> n2 -> n3 -> n4 with a back-edge n4 -> n1.
						// Plain Kahn's would place n0, then dump n1..n4 into a single
						// trailing layer (one tall column). The cycle-tolerant ranker
						// must spread them across columns instead.
						let tmpNodes = makeNodes(5);
						let tmpConns = makeChain(5);
						tmpConns.push({ Hash: 'c-back', SourceNodeHash: 'n-4', TargetNodeHash: 'n-1' });

						libLayoutLayered.Apply(tmpNodes, tmpConns, libLayoutLayered.DefaultParameters);

						let tmpColumns = {};
						let tmpMaxPerColumn = 0;
						for (let i = 0; i < tmpNodes.length; i++)
						{
							let tmpX = tmpNodes[i].X;
							tmpColumns[tmpX] = (tmpColumns[tmpX] || 0) + 1;
							tmpMaxPerColumn = Math.max(tmpMaxPerColumn, tmpColumns[tmpX]);
						}
						// Five distinct columns, one node each — no tower.
						libExpect(Object.keys(tmpColumns).length).to.equal(5);
						libExpect(tmpMaxPerColumn).to.equal(1);
						fDone();
					}
				);

				test
				(
					'a self-loop does not strand a node in a trailing column',
					function (fDone)
					{
						// n0 -> n1 -> n2 with a self-loop on n1.
						let tmpNodes = makeNodes(3);
						let tmpConns = makeChain(3);
						tmpConns.push({ Hash: 'c-self', SourceNodeHash: 'n-1', TargetNodeHash: 'n-1' });

						libLayoutLayered.Apply(tmpNodes, tmpConns, libLayoutLayered.DefaultParameters);

						// Clean chain: three columns left to right, one node each.
						libExpect(tmpNodes[0].X).to.be.below(tmpNodes[1].X);
						libExpect(tmpNodes[1].X).to.be.below(tmpNodes[2].X);
						fDone();
					}
				);
			}
		);

		// ── Rank (shared ranker) ──────────────────────────────────────

		suite
		(
			'Layout-Rank ranker',
			function ()
			{
				test
				(
					'a chain ranks one node per rank, in order',
					function (fDone)
					{
						let tmpNodes = makeNodes(4);
						let tmpRanks = libLayoutRank.toRanks(tmpNodes, makeChain(4));
						libExpect(tmpRanks.length).to.equal(4);
						libExpect(tmpRanks[0]).to.deep.equal(['n-0']);
						libExpect(tmpRanks[3]).to.deep.equal(['n-3']);
						fDone();
					}
				);

				test
				(
					'unconnected nodes share the first rank',
					function (fDone)
					{
						let tmpNodes = makeNodes(3);
						let tmpRanks = libLayoutRank.toRanks(tmpNodes, []);
						libExpect(tmpRanks.length).to.equal(1);
						libExpect(tmpRanks[0].length).to.equal(3);
						fDone();
					}
				);

				test
				(
					'toOrder visits every node exactly once even with a cycle',
					function (fDone)
					{
						let tmpNodes = makeNodes(5);
						let tmpConns = makeChain(5);
						tmpConns.push({ Hash: 'c-back', SourceNodeHash: 'n-4', TargetNodeHash: 'n-1' });
						let tmpOrder = libLayoutRank.toOrder(tmpNodes, tmpConns);
						libExpect(tmpOrder.length).to.equal(5);
						let tmpSeen = {};
						for (let i = 0; i < tmpOrder.length; i++) tmpSeen[tmpOrder[i]] = true;
						libExpect(Object.keys(tmpSeen).length).to.equal(5);
						fDone();
					}
				);

				test
				(
					'empty input returns an empty rank list',
					function (fDone)
					{
						libExpect(libLayoutRank.toRanks([], [])).to.deep.equal([]);
						libExpect(libLayoutRank.toOrder(null, null)).to.deep.equal([]);
						fDone();
					}
				);
			}
		);

		// ── Staggered ─────────────────────────────────────────────────

		suite
		(
			'Staggered algorithm',
			function ()
			{
				test
				(
					'two rows zigzag: X strictly increases, Y alternates',
					function (fDone)
					{
						let tmpNodes = makeNodes(4);
						let tmpConns = makeChain(4);
						libLayoutStaggered.Apply(tmpNodes, tmpConns, { Rows: 2, ColumnSpacing: 80, RowOffset: 150, StartX: 0, StartY: 0 });

						// Topological order is n0..n3; column pitch = 180 + 80 = 260.
						libExpect(tmpNodes[0].X).to.equal(0);
						libExpect(tmpNodes[1].X).to.equal(260);
						libExpect(tmpNodes[2].X).to.equal(520);
						libExpect(tmpNodes[3].X).to.equal(780);
						// Rows=2 → row pattern 0,1,0,1 → Y 0,150,0,150.
						libExpect(tmpNodes[0].Y).to.equal(0);
						libExpect(tmpNodes[1].Y).to.equal(150);
						libExpect(tmpNodes[2].Y).to.equal(0);
						libExpect(tmpNodes[3].Y).to.equal(150);
						fDone();
					}
				);

				test
				(
					'three rows make a triangle-wave stairstep (down then up)',
					function (fDone)
					{
						let tmpNodes = makeNodes(6);
						let tmpConns = makeChain(6);
						libLayoutStaggered.Apply(tmpNodes, tmpConns, { Rows: 3, RowOffset: 100, StartX: 0, StartY: 0 });

						// period = 4 → row phases 0,1,2,1,0,1 → Y 0,100,200,100,0,100.
						let tmpRows = tmpNodes.map((pN) => pN.Y / 100);
						libExpect(tmpRows).to.deep.equal([0, 1, 2, 1, 0, 1]);
						fDone();
					}
				);

				test
				(
					'column pitch follows the widest node',
					function (fDone)
					{
						let tmpNodes = makeNodes(3);
						tmpNodes[1].Width = 400; // widest
						libLayoutStaggered.Apply(tmpNodes, makeChain(3), { ColumnSpacing: 50, StartX: 0 });
						// pitch = 400 + 50 = 450
						libExpect(tmpNodes[1].X).to.equal(450);
						libExpect(tmpNodes[2].X).to.equal(900);
						fDone();
					}
				);

				test
				(
					'Rows=1 places every node on a single row',
					function (fDone)
					{
						let tmpNodes = makeNodes(4);
						libLayoutStaggered.Apply(tmpNodes, makeChain(4), { Rows: 1, StartY: 42 });
						for (let i = 0; i < tmpNodes.length; i++)
						{
							libExpect(tmpNodes[i].Y).to.equal(42);
						}
						fDone();
					}
				);

				test
				(
					'empty node list does not throw',
					function (fDone)
					{
						libExpect(function () { libLayoutStaggered.Apply([], [], {}); }).to.not.throw();
						fDone();
					}
				);
			}
		);

		// ── ForcedFromCenter ──────────────────────────────────────────

		suite
		(
			'ForcedFromCenter algorithm',
			function ()
			{
				test
				(
					'is deterministic for a fixed seed',
					function (fDone)
					{
						let tmpNodesA = makeNodes(5);
						let tmpNodesB = makeNodes(5);
						let tmpConns = makeChain(5);

						let tmpParams = Object.assign({}, libLayoutForcedFromCenter.DefaultParameters, { Seed: 12345, Iterations: 50 });
						libLayoutForcedFromCenter.Apply(tmpNodesA, tmpConns, tmpParams);
						libLayoutForcedFromCenter.Apply(tmpNodesB, tmpConns, tmpParams);

						for (let i = 0; i < 5; i++)
						{
							libExpect(tmpNodesA[i].X).to.equal(tmpNodesB[i].X);
							libExpect(tmpNodesA[i].Y).to.equal(tmpNodesB[i].Y);
						}
						fDone();
					}
				);

				test
				(
					'different seeds produce different positions',
					function (fDone)
					{
						let tmpNodesA = makeNodes(5);
						let tmpNodesB = makeNodes(5);
						let tmpConns = makeChain(5);

						libLayoutForcedFromCenter.Apply(tmpNodesA, tmpConns, Object.assign({}, libLayoutForcedFromCenter.DefaultParameters, { Seed: 1, Iterations: 50 }));
						libLayoutForcedFromCenter.Apply(tmpNodesB, tmpConns, Object.assign({}, libLayoutForcedFromCenter.DefaultParameters, { Seed: 2, Iterations: 50 }));

						let tmpDifferent = false;
						for (let i = 0; i < 5; i++)
						{
							if (tmpNodesA[i].X !== tmpNodesB[i].X || tmpNodesA[i].Y !== tmpNodesB[i].Y)
							{
								tmpDifferent = true;
								break;
							}
						}
						libExpect(tmpDifferent).to.equal(true);
						fDone();
					}
				);

				test
				(
					'PreservePositions=true keeps placed nodes',
					function (fDone)
					{
						let tmpNodes = makeNodes(2);
						tmpNodes[0].X = 12345;
						tmpNodes[0].Y = 67890;
						// One iteration, no forces should move much
						libLayoutForcedFromCenter.Apply(tmpNodes, [], Object.assign({}, libLayoutForcedFromCenter.DefaultParameters, {
							Iterations: 0, PreservePositions: true
						}));
						libExpect(tmpNodes[0].X).to.equal(12345);
						libExpect(tmpNodes[0].Y).to.equal(67890);
						fDone();
					}
				);

				test
				(
					'rounds final positions to integers',
					function (fDone)
					{
						let tmpNodes = makeNodes(3);
						libLayoutForcedFromCenter.Apply(tmpNodes, makeChain(3), Object.assign({}, libLayoutForcedFromCenter.DefaultParameters, { Iterations: 20 }));
						for (let i = 0; i < 3; i++)
						{
							libExpect(tmpNodes[i].X).to.equal(Math.round(tmpNodes[i].X));
							libExpect(tmpNodes[i].Y).to.equal(Math.round(tmpNodes[i].Y));
						}
						fDone();
					}
				);
			}
		);

		// ── Grid ──────────────────────────────────────────────────────

		suite
		(
			'Grid algorithm',
			function ()
			{
				test
				(
					'auto columns = ceil(sqrt(n))',
					function (fDone)
					{
						let tmpNodes = makeNodes(9);
						libLayoutGrid.Apply(tmpNodes, [], libLayoutGrid.DefaultParameters);
						// 9 nodes -> 3 cols, 3 rows
						libExpect(tmpNodes[0].X).to.equal(100);
						libExpect(tmpNodes[0].Y).to.equal(100);
						libExpect(tmpNodes[2].X).to.equal(100 + 2 * (180 + 40));
						libExpect(tmpNodes[3].X).to.equal(100); // wraps
						libExpect(tmpNodes[3].Y).to.equal(100 + (80 + 40));
						fDone();
					}
				);

				test
				(
					'explicit Columns: 4',
					function (fDone)
					{
						let tmpNodes = makeNodes(8);
						libLayoutGrid.Apply(tmpNodes, [], Object.assign({}, libLayoutGrid.DefaultParameters, { Columns: 4 }));
						libExpect(tmpNodes[3].X).to.equal(100 + 3 * (180 + 40));
						libExpect(tmpNodes[3].Y).to.equal(100);
						libExpect(tmpNodes[4].X).to.equal(100); // wraps after col 4
						libExpect(tmpNodes[4].Y).to.equal(100 + (80 + 40));
						fDone();
					}
				);

				test
				(
					'OrderBy: hash sorts before placing',
					function (fDone)
					{
						let tmpNodes = [
							{ Hash: 'b', X: 0, Y: 0, Width: 180, Height: 80 },
							{ Hash: 'a', X: 0, Y: 0, Width: 180, Height: 80 }
						];
						libLayoutGrid.Apply(tmpNodes, [], Object.assign({}, libLayoutGrid.DefaultParameters, { Columns: 2, OrderBy: 'hash' }));
						// 'a' should land at column 0, 'b' at column 1
						let tmpA = tmpNodes.find((pN) => pN.Hash === 'a');
						let tmpB = tmpNodes.find((pN) => pN.Hash === 'b');
						libExpect(tmpA.X).to.equal(100);
						libExpect(tmpB.X).to.equal(100 + (180 + 40));
						fDone();
					}
				);
			}
		);

		// ── Circular ─────────────────────────────────────────────────

		suite
		(
			'Circular algorithm',
			function ()
			{
				test
				(
					'no connections — single ring with everyone',
					function (fDone)
					{
						let tmpNodes = makeNodes(4);
						libLayoutCircular.Apply(tmpNodes, [], libLayoutCircular.DefaultParameters);
						// All on ring 0 (radius 0 + 0*220 = 0) — but ring index 0 has radius 0,
						// so the single-root center fast-path doesn't apply when ring has more than 1.
						// They all end up centered around (CenterX, CenterY).
						let tmpCx = 1000, tmpCy = 750;
						for (let i = 0; i < 4; i++)
						{
							let tmpDist = Math.hypot(
								tmpNodes[i].X + 90 - tmpCx,
								tmpNodes[i].Y + 40 - tmpCy
							);
							libExpect(tmpDist).to.be.lessThan(1); // all at radius 0
						}
						fDone();
					}
				);

				test
				(
					'with connections — root node at center',
					function (fDone)
					{
						let tmpNodes = makeNodes(3);
						let tmpConns = makeChain(3);
						libLayoutCircular.Apply(tmpNodes, tmpConns, libLayoutCircular.DefaultParameters);
						let tmpRoot = tmpNodes[0]; // n-0 has in-degree 0
						// Root at center: X = CenterX - W/2, Y = CenterY - H/2
						libExpect(tmpRoot.X).to.equal(1000 - 90);
						libExpect(tmpRoot.Y).to.equal(750 - 40);
						fDone();
					}
				);
			}
		);

		// ── Tabular ──────────────────────────────────────────────────

		suite
		(
			'Tabular algorithm',
			function ()
			{
				test
				(
					'stacks nodes vertically',
					function (fDone)
					{
						let tmpNodes = makeNodes(3);
						libLayoutTabular.Apply(tmpNodes, [], libLayoutTabular.DefaultParameters);
						libExpect(tmpNodes[0].X).to.equal(100);
						libExpect(tmpNodes[0].Y).to.equal(100);
						libExpect(tmpNodes[1].Y).to.equal(100 + 80 + 40);
						libExpect(tmpNodes[2].Y).to.equal(100 + (80 + 40) * 2);
						// All same X
						libExpect(tmpNodes[1].X).to.equal(100);
						libExpect(tmpNodes[2].X).to.equal(100);
						fDone();
					}
				);
			}
		);

		// ── Columnar ─────────────────────────────────────────────────

		suite
		(
			'Columnar algorithm',
			function ()
			{
				test
				(
					'fills row-first across N columns',
					function (fDone)
					{
						let tmpNodes = makeNodes(7);
						libLayoutColumnar.Apply(tmpNodes, [], Object.assign({}, libLayoutColumnar.DefaultParameters, { Columns: 3 }));
						libExpect(tmpNodes[0].X).to.equal(100);
						libExpect(tmpNodes[0].Y).to.equal(100);
						libExpect(tmpNodes[1].X).to.equal(100 + (180 + 40));
						libExpect(tmpNodes[2].X).to.equal(100 + (180 + 40) * 2);
						libExpect(tmpNodes[3].X).to.equal(100); // wraps to row 1
						libExpect(tmpNodes[3].Y).to.equal(100 + (80 + 40));
						fDone();
					}
				);

				test
				(
					'FillOrder: column flows column-first',
					function (fDone)
					{
						let tmpNodes = makeNodes(6);
						libLayoutColumnar.Apply(tmpNodes, [], Object.assign({}, libLayoutColumnar.DefaultParameters, { Columns: 3, FillOrder: 'column' }));
						// 6 nodes / 3 cols = 2 rows. Column-first: n-0 (0,0), n-1 (0,1), n-2 (1,0), ...
						libExpect(tmpNodes[0].X).to.equal(100);
						libExpect(tmpNodes[0].Y).to.equal(100);
						libExpect(tmpNodes[1].X).to.equal(100);
						libExpect(tmpNodes[1].Y).to.equal(100 + (80 + 40));
						libExpect(tmpNodes[2].X).to.equal(100 + (180 + 40));
						libExpect(tmpNodes[2].Y).to.equal(100);
						fDone();
					}
				);
			}
		);

		// ── PreciseNumber string parameters ──────────────────────────

		suite
		(
			'PreciseNumber string parameters (big.js compatibility)',
			function ()
			{
				test
				(
					'Layered: string parameters produce identical positions to numbers',
					function (fDone)
					{
						let tmpA = makeNodes(3);
						let tmpB = makeNodes(3);
						let tmpConns = makeChain(3);
						libLayoutLayered.Apply(tmpA, tmpConns, { HorizontalSpacing: 250, VerticalSpacing: 120, StartX: 100, StartY: 100 });
						libLayoutLayered.Apply(tmpB, tmpConns, { HorizontalSpacing: '250', VerticalSpacing: '120', StartX: '100', StartY: '100' });
						for (let i = 0; i < 3; i++)
						{
							libExpect(tmpA[i].X).to.equal(tmpB[i].X);
							libExpect(tmpA[i].Y).to.equal(tmpB[i].Y);
						}
						fDone();
					}
				);

				test
				(
					'ForcedFromCenter: string PreciseNumber params match numeric params',
					function (fDone)
					{
						let tmpA = makeNodes(4);
						let tmpB = makeNodes(4);
						let tmpConns = makeChain(4);
						let tmpNumeric = { Iterations: 30, Seed: 7, CenterX: 500, CenterY: 500, SpringLength: 150, SpringStiffness: 0.05, Repulsion: 8000, CenterAttraction: 0.01, CoolingFactor: 0.95, InitialTemperature: 100, InitialSpread: 400 };
						let tmpStringy =  { Iterations: 30, Seed: 7, CenterX: '500', CenterY: '500', SpringLength: '150', SpringStiffness: '0.05', Repulsion: '8000', CenterAttraction: '0.01', CoolingFactor: '0.95', InitialTemperature: '100', InitialSpread: '400' };
						libLayoutForcedFromCenter.Apply(tmpA, tmpConns, tmpNumeric);
						libLayoutForcedFromCenter.Apply(tmpB, tmpConns, tmpStringy);
						for (let i = 0; i < 4; i++)
						{
							libExpect(tmpA[i].X).to.equal(tmpB[i].X);
							libExpect(tmpA[i].Y).to.equal(tmpB[i].Y);
						}
						fDone();
					}
				);

				test
				(
					'Grid: Columns as string-int matches Columns as int',
					function (fDone)
					{
						let tmpA = makeNodes(8);
						let tmpB = makeNodes(8);
						libLayoutGrid.Apply(tmpA, [], Object.assign({}, libLayoutGrid.DefaultParameters, { Columns: 4 }));
						libLayoutGrid.Apply(tmpB, [], Object.assign({}, libLayoutGrid.DefaultParameters, { Columns: '4' }));
						for (let i = 0; i < 8; i++)
						{
							libExpect(tmpA[i].X).to.equal(tmpB[i].X);
							libExpect(tmpA[i].Y).to.equal(tmpB[i].Y);
						}
						fDone();
					}
				);

				test
				(
					'Circular: string CenterX/Y/RingSpacing match numeric',
					function (fDone)
					{
						let tmpA = makeNodes(5);
						let tmpB = makeNodes(5);
						libLayoutCircular.Apply(tmpA, [], { CenterX: 1000, CenterY: 750, RingSpacing: 220, InnerRadius: 100, StartAngle: -90 });
						libLayoutCircular.Apply(tmpB, [], { CenterX: '1000', CenterY: '750', RingSpacing: '220', InnerRadius: '100', StartAngle: '-90' });
						for (let i = 0; i < 5; i++)
						{
							libExpect(tmpA[i].X).to.equal(tmpB[i].X);
							libExpect(tmpA[i].Y).to.equal(tmpB[i].Y);
						}
						fDone();
					}
				);

				test
				(
					'Tabular: string spacing matches numeric',
					function (fDone)
					{
						let tmpA = makeNodes(4);
						let tmpB = makeNodes(4);
						libLayoutTabular.Apply(tmpA, [], { StartX: 100, StartY: 100, VerticalSpacing: 40 });
						libLayoutTabular.Apply(tmpB, [], { StartX: '100', StartY: '100', VerticalSpacing: '40' });
						for (let i = 0; i < 4; i++)
						{
							libExpect(tmpA[i].X).to.equal(tmpB[i].X);
							libExpect(tmpA[i].Y).to.equal(tmpB[i].Y);
						}
						fDone();
					}
				);

				test
				(
					'Columnar: mixed string and number params match all-number params',
					function (fDone)
					{
						let tmpA = makeNodes(7);
						let tmpB = makeNodes(7);
						libLayoutColumnar.Apply(tmpA, [], { Columns: 3, ColumnSpacing: 40, RowSpacing: 40, StartX: 100, StartY: 100 });
						libLayoutColumnar.Apply(tmpB, [], { Columns: '3', ColumnSpacing: '40', RowSpacing: '40', StartX: '100', StartY: '100' });
						for (let i = 0; i < 7; i++)
						{
							libExpect(tmpA[i].X).to.equal(tmpB[i].X);
							libExpect(tmpA[i].Y).to.equal(tmpB[i].Y);
						}
						fDone();
					}
				);

				test
				(
					'Empty string parameters fall back to defaults gracefully',
					function (fDone)
					{
						let tmpA = makeNodes(3);
						let tmpB = makeNodes(3);
						let tmpConns = makeChain(3);
						libLayoutLayered.Apply(tmpA, tmpConns, {});
						libLayoutLayered.Apply(tmpB, tmpConns, { HorizontalSpacing: '', VerticalSpacing: null, StartX: undefined });
						for (let i = 0; i < 3; i++)
						{
							libExpect(tmpA[i].X).to.equal(tmpB[i].X);
							libExpect(tmpA[i].Y).to.equal(tmpB[i].Y);
						}
						fDone();
					}
				);
			}
		);

		// ── Custom (no-op) ───────────────────────────────────────────

		suite
		(
			'Custom algorithm',
			function ()
			{
				test
				(
					'preserves existing X/Y',
					function (fDone)
					{
						let tmpNodes = [
							{ Hash: 'a', X: 42, Y: 99, Width: 180, Height: 80 },
							{ Hash: 'b', X: 314, Y: 271, Width: 180, Height: 80 }
						];
						libLayoutCustom.Apply(tmpNodes, [], {});
						libExpect(tmpNodes[0].X).to.equal(42);
						libExpect(tmpNodes[0].Y).to.equal(99);
						libExpect(tmpNodes[1].X).to.equal(314);
						libExpect(tmpNodes[1].Y).to.equal(271);
						fDone();
					}
				);
			}
		);

		// ── applyLayout dispatch ─────────────────────────────────────

		suite
		(
			'applyLayout dispatch',
			function ()
			{
				test
				(
					'falls back to Layered for unknown algorithm name',
					function (fDone)
					{
						let tmpNodes = makeNodes(2);
						let tmpConns = makeChain(2);
						_LayoutService.applyLayout(tmpNodes, tmpConns, 'TotallyMadeUp', {});
						// Should match Layered output (chain → 2 layers)
						libExpect(tmpNodes[0].X).to.equal(100);
						libExpect(tmpNodes[1].X).to.equal(100 + 180 + 250);
						fDone();
					}
				);

				test
				(
					'merges DefaultParameters with caller overrides',
					function (fDone)
					{
						let tmpNodes = makeNodes(1);
						_LayoutService.applyLayout(tmpNodes, [], 'Layered', { StartX: 500 });
						// StartY left as default (100), StartX overridden
						libExpect(tmpNodes[0].X).to.equal(500);
						libExpect(tmpNodes[0].Y).to.equal(100);
						fDone();
					}
				);

				test
				(
					'getMergedParameters returns defaults merged with overrides',
					function (fDone)
					{
						let tmpMerged = _LayoutService.getMergedParameters('Layered', { StartX: 999 });
						libExpect(tmpMerged.StartX).to.equal(999);
						libExpect(tmpMerged.StartY).to.equal(100); // default preserved
						libExpect(tmpMerged.HorizontalSpacing).to.equal(250);
						fDone();
					}
				);
			}
		);

		// ── Spacing multiplier ───────────────────────────────────────

		suite
		(
			'Spacing multiplier',
			function ()
			{
				test
				(
					'Layered: Spacing=2 doubles the gap between layers',
					function (fDone)
					{
						let tmpA = makeNodes(2);
						let tmpB = makeNodes(2);
						let tmpConns = makeChain(2);
						libLayoutLayered.Apply(tmpA, tmpConns, { Spacing: 1.0 });
						libLayoutLayered.Apply(tmpB, tmpConns, { Spacing: 2.0 });
						// First node lands at StartX both times.
						libExpect(tmpA[0].X).to.equal(tmpB[0].X);
						// Second node Δx with Spacing=2 should be twice the Δx with Spacing=1.
						let tmpDxA = tmpA[1].X - tmpA[0].X;
						let tmpDxB = tmpB[1].X - tmpB[0].X;
						// Δx = nodeWidth + (HorizontalSpacing * Spacing). With nodeWidth=180, HSpace=250:
						// Spacing=1 → 430; Spacing=2 → 680. Difference is HorizontalSpacing (250).
						libExpect(tmpDxB - tmpDxA).to.equal(250);
						fDone();
					}
				);

				test
				(
					'Tabular: Spacing scales VerticalSpacing',
					function (fDone)
					{
						let tmpA = makeNodes(3);
						let tmpB = makeNodes(3);
						libLayoutTabular.Apply(tmpA, [], { Spacing: 1.0 });
						libLayoutTabular.Apply(tmpB, [], { Spacing: 0.5 });
						let tmpDyA = tmpA[1].Y - tmpA[0].Y; // height(80) + 40*1 = 120
						let tmpDyB = tmpB[1].Y - tmpB[0].Y; // height(80) + 40*0.5 = 100
						libExpect(tmpDyA).to.equal(120);
						libExpect(tmpDyB).to.equal(100);
						fDone();
					}
				);

				test
				(
					'Circular: Spacing scales RingSpacing (and InnerRadius)',
					function (fDone)
					{
						let tmpA = makeNodes(3);
						let tmpB = makeNodes(3);
						let tmpConns = makeChain(3);
						libLayoutCircular.Apply(tmpA, tmpConns, { Spacing: 1.0 });
						libLayoutCircular.Apply(tmpB, tmpConns, { Spacing: 2.0 });
						// Root sits at center for both. Second node is on ring 1 (radius = RingSpacing*Spacing).
						let tmpRadiusA = Math.hypot((tmpA[1].X + 90) - 1000, (tmpA[1].Y + 40) - 750);
						let tmpRadiusB = Math.hypot((tmpB[1].X + 90) - 1000, (tmpB[1].Y + 40) - 750);
						libExpect(Math.round(tmpRadiusB / tmpRadiusA)).to.equal(2);
						fDone();
					}
				);
			}
		);

		// ── Edge-theme registry ──────────────────────────────────────

		suite
		(
			'Edge-theme registry',
			function ()
			{
				test
				(
					'all four built-in themes are registered',
					function (fDone)
					{
						let tmpNames = _LayoutService.getEdgeThemeNames();
						libExpect(tmpNames).to.include.members(['Bezier', 'Orthogonal', 'Straight', 'OrthogonalSnap']);
						fDone();
					}
				);

				test
				(
					'getEdgeTheme returns null for unknown name',
					function (fDone)
					{
						libExpect(_LayoutService.getEdgeTheme('NotARealTheme')).to.equal(null);
						fDone();
					}
				);

				test
				(
					'registerEdgeTheme rejects descriptors missing GeneratePath',
					function (fDone)
					{
						libExpect(_LayoutService.registerEdgeTheme({ Name: 'X' })).to.equal(false);
						libExpect(_LayoutService.registerEdgeTheme({ GeneratePath: function () {} })).to.equal(false);
						fDone();
					}
				);

				test
				(
					'registerEdgeTheme + dispatch via resolveActiveEdgeTheme',
					function (fDone)
					{
						let tmpStub =
						{
							Name: 'StubEdge',
							GeneratePath: function () { return 'M 0 0 L 10 10'; }
						};
						libExpect(_LayoutService.registerEdgeTheme(tmpStub)).to.equal(true);
						let tmpResolved = _LayoutService.resolveActiveEdgeTheme({ Data: { EdgeTheme: 'StubEdge' } });
						libExpect(tmpResolved).to.equal(tmpStub);
						fDone();
					}
				);

				test
				(
					'resolveActiveEdgeTheme — flow-level EdgeTheme overrides layout default',
					function (fDone)
					{
						_LayoutService._FlowView = { _FlowData: { EdgeTheme: 'Straight', LayoutAlgorithm: 'Layered' } };
						let tmpResolved = _LayoutService.resolveActiveEdgeTheme({});
						libExpect(tmpResolved.Name).to.equal('Straight');
						_LayoutService._FlowView = null;
						fDone();
					}
				);

				test
				(
					'resolveActiveEdgeTheme — falls back to layout DefaultEdgeTheme when no flow override',
					function (fDone)
					{
						_LayoutService._FlowView = { _FlowData: { EdgeTheme: null, LayoutAlgorithm: 'Layered' } };
						let tmpResolved = _LayoutService.resolveActiveEdgeTheme({});
						// Layered's DefaultEdgeTheme is 'Orthogonal'
						libExpect(tmpResolved.Name).to.equal('Orthogonal');
						_LayoutService._FlowView = null;
						fDone();
					}
				);

				test
				(
					'resolveActiveEdgeTheme — connection-level EdgeTheme beats flow-level',
					function (fDone)
					{
						_LayoutService._FlowView = { _FlowData: { EdgeTheme: 'Straight', LayoutAlgorithm: 'Layered' } };
						let tmpResolved = _LayoutService.resolveActiveEdgeTheme({ Data: { EdgeTheme: 'Bezier' } });
						libExpect(tmpResolved.Name).to.equal('Bezier');
						_LayoutService._FlowView = null;
						fDone();
					}
				);

				test
				(
					'resolveActiveEdgeTheme — legacy LineMode=orthogonal maps to Orthogonal theme',
					function (fDone)
					{
						let tmpResolved = _LayoutService.resolveActiveEdgeTheme({ Data: { LineMode: 'orthogonal' } });
						libExpect(tmpResolved.Name).to.equal('Orthogonal');
						fDone();
					}
				);
			}
		);

		// ── Edge themes — path generation ────────────────────────────

		suite
		(
			'Edge themes — GeneratePath',
			function ()
			{
				let _Helpers;

				setup
				(
					function ()
					{
						_Helpers =
						{
							generateBezier:      function (s, e) { return `BEZ ${s.x},${s.y}→${e.x},${e.y}`; },
							generateMultiBezier: function (s, e, h) { return `MBEZ ${s.x},${s.y} hs=${h.length} →${e.x},${e.y}`; },
							generateOrthogonal:  function (s, e, c, m) { return `ORT ${s.x},${s.y}→${e.x},${e.y} m=${m}`; },
							getBezierHandles:    function (d) { return (d && d.HandleCustomized && d.BezierHandles) || []; }
						};
					}
				);

				test
				(
					'Bezier: emits straight-bezier when no custom handles',
					function (fDone)
					{
						let tmpPath = libEdgeBezier.GeneratePath({
							Source: { x: 0, y: 0, side: 'right' },
							Target: { x: 100, y: 50, side: 'left' },
							Connection: { Data: {} },
							Helpers: _Helpers, Parameters: {}
						});
						libExpect(tmpPath).to.equal('BEZ 0,0→100,50');
						fDone();
					}
				);

				test
				(
					'Bezier: honors per-connection custom handles',
					function (fDone)
					{
						let tmpPath = libEdgeBezier.GeneratePath({
							Source: { x: 0, y: 0 }, Target: { x: 100, y: 50 },
							Connection: { Data: { HandleCustomized: true, BezierHandles: [{ x: 50, y: 25 }, { x: 70, y: 30 }] } },
							Helpers: _Helpers, Parameters: {}
						});
						libExpect(tmpPath.indexOf('MBEZ')).to.equal(0);
						libExpect(tmpPath.indexOf('hs=2')).to.be.above(0);
						fDone();
					}
				);

				test
				(
					'Orthogonal: emits orthogonal path; respects custom corners',
					function (fDone)
					{
						let tmpPath = libEdgeOrthogonal.GeneratePath({
							Source: { x: 0, y: 0 }, Target: { x: 100, y: 50 },
							Connection: { Data: { OrthoMidOffset: 7 } },
							Helpers: _Helpers, Parameters: {}
						});
						libExpect(tmpPath).to.equal('ORT 0,0→100,50 m=7');
						fDone();
					}
				);

				test
				(
					'Straight: literal M..L path',
					function (fDone)
					{
						let tmpPath = libEdgeStraight.GeneratePath({
							Source: { x: 12, y: 34 }, Target: { x: 56, y: 78 },
							Connection: { Data: {} }, Helpers: _Helpers, Parameters: {}
						});
						libExpect(tmpPath).to.equal('M 12 34 L 56 78');
						fDone();
					}
				);

				test
				(
					'OrthogonalSnap: AdjustLayout snaps node positions to grid',
					function (fDone)
					{
						let tmpNodes =
						[
							{ X: 13, Y: 27, Width: 100, Height: 50 },
							{ X: 86, Y: 199, Width: 100, Height: 50 }
						];
						libEdgeOrthogonalSnap.AdjustLayout(tmpNodes, [], { GridSize: 20 });
						libExpect(tmpNodes[0].X).to.equal(20);
						libExpect(tmpNodes[0].Y).to.equal(20);
						libExpect(tmpNodes[1].X).to.equal(80);
						libExpect(tmpNodes[1].Y).to.equal(200);
						fDone();
					}
				);

				test
				(
					'OrthogonalSnap: AdjustLayout no-op when GridSize<=0',
					function (fDone)
					{
						let tmpNodes = [{ X: 13, Y: 27, Width: 100, Height: 50 }];
						libEdgeOrthogonalSnap.AdjustLayout(tmpNodes, [], { GridSize: 0 });
						libExpect(tmpNodes[0].X).to.equal(13);
						libExpect(tmpNodes[0].Y).to.equal(27);
						fDone();
					}
				);
			}
		);

		// ── Edge-Perimeter (ResolveAttachment) ───────────────────────

		suite
		(
			'Edge-Perimeter — perimeter-routing attachment',
			function ()
			{
				let _Hub;

				setup
				(
					function ()
					{
						// 200×100 node at (400, 300) → center (500, 350)
						_Hub = { Hash: 'hub', X: 400, Y: 300, Width: 200, Height: 100 };
					}
				);

				test
				(
					'aim due east → exits right edge at center-Y',
					function (fDone)
					{
						let tmpAttach = libEdgePerimeter.ResolveAttachment({
							Node: _Hub,
							OtherNode: { X: 1000, Y: 300, Width: 200, Height: 100 } // center (1100, 350)
						});
						libExpect(tmpAttach.x).to.equal(600);  // hub right edge
						libExpect(tmpAttach.y).to.equal(350);  // hub center Y
						libExpect(tmpAttach.side).to.equal('right');
						fDone();
					}
				);

				test
				(
					'aim due north → exits top edge at center-X',
					function (fDone)
					{
						let tmpAttach = libEdgePerimeter.ResolveAttachment({
							Node: _Hub,
							OtherNode: { X: 400, Y: -100, Width: 200, Height: 100 } // center (500, -50)
						});
						libExpect(tmpAttach.x).to.equal(500);  // hub center X
						libExpect(tmpAttach.y).to.equal(300);  // hub top edge
						libExpect(tmpAttach.side).to.equal('top');
						fDone();
					}
				);

				test
				(
					'aim due south → exits bottom edge at center-X',
					function (fDone)
					{
						let tmpAttach = libEdgePerimeter.ResolveAttachment({
							Node: _Hub,
							OtherNode: { X: 400, Y: 700, Width: 200, Height: 100 } // center (500, 750)
						});
						libExpect(tmpAttach.x).to.equal(500);
						libExpect(tmpAttach.y).to.equal(400);  // hub bottom edge
						libExpect(tmpAttach.side).to.equal('bottom');
						fDone();
					}
				);

				test
				(
					'aim diagonally up-right → exits whichever edge the line hits first',
					function (fDone)
					{
						// Aim at (700, 100). dx=200, dy=-250.
						// halfW=100 → tx = 100/200 = 0.5
						// halfH=50  → ty = 50/250 = 0.2  ← smaller; top edge wins
						let tmpAttach = libEdgePerimeter.ResolveAttachment({
							Node: _Hub,
							OtherNode: { X: 600, Y: 50,  Width: 200, Height: 100 } // center (700, 100)
						});
						libExpect(tmpAttach.side).to.equal('top');
						libExpect(tmpAttach.y).to.equal(300);
						// At t=0.2 from (500,350) in direction (200,-250) → (540, 300).
						libExpect(tmpAttach.x).to.equal(540);
						fDone();
					}
				);

				test
				(
					'8 spokes around a hub each get a unique exit point',
					function (fDone)
					{
						let tmpExits = {};
						for (let i = 0; i < 8; i++)
						{
							let tmpAngle = (i / 8) * 2 * Math.PI;
							let tmpSpoke = {
								X: 500 + Math.cos(tmpAngle) * 400 - 70,
								Y: 350 + Math.sin(tmpAngle) * 400 - 35,
								Width: 140, Height: 70
							};
							let tmpAttach = libEdgePerimeter.ResolveAttachment({
								Node: _Hub,
								OtherNode: tmpSpoke
							});
							let tmpKey = `${Math.round(tmpAttach.x)},${Math.round(tmpAttach.y)}`;
							tmpExits[tmpKey] = (tmpExits[tmpKey] || 0) + 1;
						}
						let tmpUniqueExits = Object.keys(tmpExits).length;
						libExpect(tmpUniqueExits).to.equal(8);
						fDone();
					}
				);

				test
				(
					'identical centers fall back to DefaultPosition',
					function (fDone)
					{
						let tmpDefault = { x: 600, y: 350, side: 'right' };
						let tmpAttach = libEdgePerimeter.ResolveAttachment({
							Node: _Hub,
							OtherNode: { X: 400, Y: 300, Width: 200, Height: 100 }, // identical center
							DefaultPosition: tmpDefault
						});
						libExpect(tmpAttach).to.equal(tmpDefault);
						fDone();
					}
				);

				test
				(
					'returns null when node geometry is missing',
					function (fDone)
					{
						libExpect(libEdgePerimeter.ResolveAttachment({ Node: null })).to.equal(null);
						libExpect(libEdgePerimeter.ResolveAttachment({ Node: { X: 0 } })).to.equal(null);
						fDone();
					}
				);
			}
		);

		// ── centerNodes ──────────────────────────────────────────────

		suite
		(
			'centerNodes',
			function ()
			{
				test
				(
					'translates the bounding box center to a target',
					function (fDone)
					{
						let tmpNodes = [
							{ Hash: 'a', X: 0,   Y: 0, Width: 100, Height: 50 },
							{ Hash: 'b', X: 200, Y: 0, Width: 100, Height: 50 }
						];
						_LayoutService.centerNodes(tmpNodes, 1000, 500);
						// Original bounding box: (0,0) to (300,50), center (150,25). Offset (850, 475).
						libExpect(tmpNodes[0].X).to.equal(850);
						libExpect(tmpNodes[0].Y).to.equal(475);
						libExpect(tmpNodes[1].X).to.equal(1050);
						libExpect(tmpNodes[1].Y).to.equal(475);
						fDone();
					}
				);
			}
		);

		// ── Auto-apply hookup (simulated) ────────────────────────────

		suite
		(
			'Auto-apply event hookup',
			function ()
			{
				// Build a minimal mock FlowView that exposes just enough
				// to exercise the auto-apply handler logic in PictView-Flow.
				// We don't pull the full PictView-Flow because it requires a
				// pict-view runtime; instead we replicate the handler shape.
				function makeMockFlowView(pAlgorithm, pAutoApply)
				{
					let tmpHandlers = {};
					return {
						_FlowData: {
							Nodes: makeNodes(3),
							Connections: makeChain(3),
							LayoutAlgorithm: pAlgorithm,
							LayoutParameters: {},
							LayoutAutoApply: pAutoApply
						},
						_AutoApplyInProgress: false,
						_AutoApplyHandlerHashes: [],
						applyCalls: 0,
						_LayoutService: _LayoutService,
						applyCurrentLayout: function ()
						{
							this.applyCalls++;
							let tmpAlgo = this._FlowData.LayoutAlgorithm;
							if (tmpAlgo === 'Custom') return;
							this._AutoApplyInProgress = true;
							try
							{
								this._LayoutService.applyLayout(
									this._FlowData.Nodes,
									this._FlowData.Connections,
									tmpAlgo,
									this._FlowData.LayoutParameters
								);
							}
							finally
							{
								this._AutoApplyInProgress = false;
							}
						},
						fireMockEvent: function (pName)
						{
							let tmpHandler = tmpHandlers[pName];
							if (tmpHandler) tmpHandler();
						},
						subscribe: function ()
						{
							let tmpEvents = ['onNodeAdded', 'onNodeRemoved', 'onConnectionCreated', 'onConnectionRemoved'];
							for (let i = 0; i < tmpEvents.length; i++)
							{
								((pEvent) =>
								{
									tmpHandlers[pEvent] = () =>
									{
										if (this._AutoApplyInProgress) return;
										if (!this._FlowData.LayoutAutoApply) return;
										if (!this._FlowData.LayoutAlgorithm || this._FlowData.LayoutAlgorithm === 'Custom') return;
										this.applyCurrentLayout();
									};
								})(tmpEvents[i]);
							}
						}
					};
				}

				test
				(
					'fires applyCurrentLayout on onNodeAdded when AutoApply is true and algorithm is non-Custom',
					function (fDone)
					{
						let tmpMock = makeMockFlowView('Grid', true);
						tmpMock.subscribe();
						tmpMock.fireMockEvent('onNodeAdded');
						libExpect(tmpMock.applyCalls).to.equal(1);
						fDone();
					}
				);

				test
				(
					'does NOT fire when AutoApply is false',
					function (fDone)
					{
						let tmpMock = makeMockFlowView('Grid', false);
						tmpMock.subscribe();
						tmpMock.fireMockEvent('onNodeAdded');
						libExpect(tmpMock.applyCalls).to.equal(0);
						fDone();
					}
				);

				test
				(
					'does NOT fire when algorithm is Custom',
					function (fDone)
					{
						let tmpMock = makeMockFlowView('Custom', true);
						tmpMock.subscribe();
						tmpMock.fireMockEvent('onNodeAdded');
						libExpect(tmpMock.applyCalls).to.equal(0);
						fDone();
					}
				);

				test
				(
					'fires on each of the four structural events',
					function (fDone)
					{
						let tmpMock = makeMockFlowView('Grid', true);
						tmpMock.subscribe();
						tmpMock.fireMockEvent('onNodeAdded');
						tmpMock.fireMockEvent('onNodeRemoved');
						tmpMock.fireMockEvent('onConnectionCreated');
						tmpMock.fireMockEvent('onConnectionRemoved');
						libExpect(tmpMock.applyCalls).to.equal(4);
						fDone();
					}
				);
			}
		);
	}
);
