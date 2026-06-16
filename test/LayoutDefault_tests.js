const libFable = require('fable');
const libChai = require('chai');
const libExpect = libChai.expect;

const libLayouts = require('../source/providers/PictProvider-Flow-Layouts.js');

function makeView(pOptions)
{
	let tmpFired = [];
	return {
		options: Object.assign({ ViewIdentifier: 'LD-Test' }, pOptions || {}),
		_FlowData: { SavedLayouts: [], Nodes: [], Connections: [], OpenPanels: [], ViewState: { PanX: 0, PanY: 0, Zoom: 1 } },
		marshalFromView: function () {},
		_EventHandlerProvider: { fireEvent: function (pName) { tmpFired.push(pName); } },
		_firedEvents: tmpFired
	};
}

suite
(
	'PictProvider-Flow-Layouts default + storage',
	function ()
	{
		let _Fable;
		setup(function () { _Fable = new libFable({}); });

		function makeProvider(pView)
		{
			// StorageKey:false so the localStorage path is a no-op in Node when no LayoutStorage is set.
			return new libLayouts(_Fable, { FlowView: pView, StorageKey: false }, 'LD');
		}

		suite
		(
			'default layout',
			function ()
			{
				test
				(
					'setDefaultLayout marks one and clears others; getDefaultLayout returns it',
					function ()
					{
						let tmpView = makeView();
						tmpView._FlowData.SavedLayouts = [ { Hash: 'a', Name: 'A' }, { Hash: 'b', Name: 'B' } ];
						let tmpProvider = makeProvider(tmpView);

						libExpect(tmpProvider.setDefaultLayout('b')).to.equal(true);
						libExpect(tmpView._FlowData.SavedLayouts[0].IsDefault).to.equal(false);
						libExpect(tmpView._FlowData.SavedLayouts[1].IsDefault).to.equal(true);
						libExpect(tmpProvider.getDefaultLayout().Hash).to.equal('b');
					}
				);

				test
				(
					'a non-matching hash fails',
					function ()
					{
						let tmpView = makeView();
						tmpView._FlowData.SavedLayouts = [ { Hash: 'a' } ];
						let tmpProvider = makeProvider(tmpView);
						libExpect(tmpProvider.setDefaultLayout('zzz')).to.equal(false);
					}
				);

				test
				(
					'a falsy hash clears the default',
					function ()
					{
						let tmpView = makeView();
						tmpView._FlowData.SavedLayouts = [ { Hash: 'a', IsDefault: true } ];
						let tmpProvider = makeProvider(tmpView);
						libExpect(tmpProvider.setDefaultLayout(false)).to.equal(true);
						libExpect(tmpProvider.getDefaultLayout()).to.equal(null);
					}
				);

				test
				(
					'applyDefaultLayout restores the default, or returns false when none',
					function ()
					{
						let tmpView = makeView();
						tmpView._FlowData.SavedLayouts = [ { Hash: 'a' }, { Hash: 'b', IsDefault: true } ];
						let tmpProvider = makeProvider(tmpView);
						let tmpRestored = [];
						tmpProvider.restoreLayout = function (pHash) { tmpRestored.push(pHash); return true; };
						libExpect(tmpProvider.applyDefaultLayout()).to.equal(true);
						libExpect(tmpRestored).to.deep.equal(['b']);

						let tmpEmptyView = makeView();
						let tmpEmptyProvider = makeProvider(tmpEmptyView);
						tmpEmptyProvider.restoreLayout = function () { return true; };
						libExpect(tmpEmptyProvider.applyDefaultLayout()).to.equal(false);
					}
				);
			}
		);

		suite
		(
			'config-driven LayoutStorage',
			function ()
			{
				test
				(
					'the storage hooks delegate to options.LayoutStorage when present',
					function ()
					{
						let tmpCalls = { write: 0, read: 0, del: 0 };
						let tmpView = makeView(
							{
								LayoutStorage:
								{
									write: function (pLayouts, fCallback) { tmpCalls.write++; fCallback(null); },
									read: function (fCallback) { tmpCalls.read++; fCallback(null, [ { Hash: 'x' } ]); },
									delete: function (fCallback) { tmpCalls.del++; fCallback(null); }
								}
							});
						let tmpProvider = makeProvider(tmpView);

						tmpProvider.storageWrite([ { Hash: 'a' } ], function () {});
						let tmpReadResult = null;
						tmpProvider.storageRead(function (pError, pLayouts) { tmpReadResult = pLayouts; });
						tmpProvider.storageDelete(function () {});

						libExpect(tmpCalls.write).to.equal(1);
						libExpect(tmpCalls.read).to.equal(1);
						libExpect(tmpCalls.del).to.equal(1);
						libExpect(tmpReadResult).to.deep.equal([ { Hash: 'x' } ]);
					}
				);
			}
		);
	}
);
