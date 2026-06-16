const libFable = require('fable');
const libChai = require('chai');
const libExpect = libChai.expect;

const libCursorManager = require('../source/services/PictService-Flow-CursorManager.js');

suite
(
	'PictService-Flow-CursorManager',
	function ()
	{
		let _Cursor;

		setup
		(
			function ()
			{
				let tmpFable = new libFable({});
				_Cursor = new libCursorManager(tmpFable, {}, 'Cursor-Test');
			}
		);

		suite
		(
			'resolveCursor (state + mode -> token)',
			function ()
			{
				test
				(
					'active drag-like states resolve to grabbing',
					function ()
					{
						['panning', 'dragging-node', 'dragging-panel', 'dragging-handle', 'rotating-node'].forEach(function (pState)
						{
							libExpect(_Cursor.resolveCursor({ state: pState }), pState).to.equal('grabbing');
						});
					}
				);

				test
				(
					'resize states resolve to resize',
					function ()
					{
						libExpect(_Cursor.resolveCursor({ state: 'resizing-node' })).to.equal('resize');
						libExpect(_Cursor.resolveCursor({ state: 'resizing-panel' })).to.equal('resize');
					}
				);

				test
				(
					'connecting and marquee resolve to crosshair',
					function ()
					{
						libExpect(_Cursor.resolveCursor({ state: 'connecting' })).to.equal('crosshair');
						libExpect(_Cursor.resolveCursor({ state: 'marquee' })).to.equal('crosshair');
					}
				);

				test
				(
					'idle in read-only is default unless navigating, then grab',
					function ()
					{
						libExpect(_Cursor.resolveCursor({ state: 'idle', readOnly: true, navigating: false })).to.equal('default');
						libExpect(_Cursor.resolveCursor({ state: 'idle', readOnly: true, navigating: true })).to.equal('grab');
					}
				);

				test
				(
					'idle in edit mode is grab when panning is enabled, else default',
					function ()
					{
						libExpect(_Cursor.resolveCursor({ state: 'idle', readOnly: false, panningEnabled: true })).to.equal('grab');
						libExpect(_Cursor.resolveCursor({ state: 'idle', readOnly: false, panningEnabled: false })).to.equal('default');
					}
				);

				test
				(
					'an unknown / empty state falls back to the idle policy',
					function ()
					{
						// Empty context: not read-only, panningEnabled unset (falsy) -> default.
						libExpect(_Cursor.resolveCursor({})).to.equal('default');
						libExpect(_Cursor.resolveCursor({ state: 'idle', readOnly: false, panningEnabled: true })).to.equal('grab');
					}
				);
			}
		);
	}
);
