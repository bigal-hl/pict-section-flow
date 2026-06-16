const libChai = require('chai');
const libExpect = libChai.expect;

const libViewportManager = require('../source/services/PictService-Flow-ViewportManager.js');
const libPictViewFlow = require('../source/views/PictView-Flow.js');

suite
(
	'PictService-Flow-ViewportManager.computeFitToWidth',
	function ()
	{
		test
		(
			'zooms so the frame width fills the container and anchors the frame top-left',
			function ()
			{
				// 1000-wide frame in a 500 container -> zoom 0.5; frame origin (200,100) -> pan (-100,-50).
				let tmpResult = libViewportManager.computeFitToWidth({ X: 200, Y: 100, Width: 1000 }, 500, {});
				libExpect(tmpResult.Zoom).to.equal(0.5);
				libExpect(tmpResult.PanX).to.equal(-100);
				libExpect(tmpResult.PanY).to.equal(-50);
			}
		);

		test
		(
			'a narrow frame enlarges to fill the width',
			function ()
			{
				libExpect(libViewportManager.computeFitToWidth({ X: 0, Y: 0, Width: 250 }, 1000, {}).Zoom).to.equal(4);
			}
		);

		test
		(
			'a top margin offsets PanY without changing zoom',
			function ()
			{
				let tmpResult = libViewportManager.computeFitToWidth({ X: 0, Y: 0, Width: 100 }, 100, { TopMargin: 40 });
				libExpect(tmpResult.Zoom).to.equal(1);
				libExpect(tmpResult.PanY).to.equal(40);
			}
		);

		test
		(
			'zoom is clamped to the provided Min / Max',
			function ()
			{
				libExpect(libViewportManager.computeFitToWidth({ X: 0, Y: 0, Width: 10 }, 1000, { MaxZoom: 3 }).Zoom).to.equal(3);
				libExpect(libViewportManager.computeFitToWidth({ X: 0, Y: 0, Width: 10000 }, 100, { MinZoom: 0.2 }).Zoom).to.equal(0.2);
			}
		);

		test
		(
			'a degenerate or missing frame falls back to zoom 1',
			function ()
			{
				libExpect(libViewportManager.computeFitToWidth({ Width: 0 }, 500, {}).Zoom).to.equal(1);
				libExpect(libViewportManager.computeFitToWidth(null, 500, {}).Zoom).to.equal(1);
			}
		);
	}
);

// View-level presentation surface: the public getFrame read and the width-fit observer teardown a
// consumer uses when leaving 'width' FitMode (e.g. a moodboard switching back to its canvas style).
// Prototype methods called against light stubs (an object whose prototype is the view), so no DOM or
// Pict app is needed.
suite
(
	'PictView-Flow presentation surface (getFrame + fit-observer teardown)',
	function ()
	{
		test
		(
			'getFrame returns the ViewState frame when one is set',
			function ()
			{
				let tmpView = Object.create(libPictViewFlow.prototype);
				tmpView._FlowData = { ViewState: { Frame: { X: 10, Y: 20, Width: 800, Height: 400 } } };
				tmpView.options = { Frame: false };
				let tmpFrame = tmpView.getFrame();
				libExpect(tmpFrame).to.be.an('object');
				libExpect(tmpFrame.Width).to.equal(800);
				libExpect(tmpFrame.X).to.equal(10);
			}
		);

		test
		(
			'getFrame falls back to the option frame, then null',
			function ()
			{
				let tmpView = Object.create(libPictViewFlow.prototype);
				tmpView._FlowData = { ViewState: {} };
				tmpView.options = { Frame: { X: 0, Y: 0, Width: 600, Height: 300 } };
				libExpect(tmpView.getFrame().Width).to.equal(600);

				tmpView.options = { Frame: false };
				libExpect(tmpView.getFrame()).to.equal(null);
			}
		);

		test
		(
			'_teardownFitObserver disconnects and clears the observer, and is safe when none exists',
			function ()
			{
				let tmpView = Object.create(libPictViewFlow.prototype);
				let tmpDisconnected = false;
				tmpView._FitObserver = { disconnect: function () { tmpDisconnected = true; } };
				tmpView._teardownFitObserver();
				libExpect(tmpDisconnected).to.equal(true);
				libExpect(tmpView._FitObserver).to.equal(null);
				// A second call with no observer must not throw.
				libExpect(function () { tmpView._teardownFitObserver(); }).to.not.throw();
			}
		);

		test
		(
			'_setupFitObserver tears down a stale observer when FitMode is no longer width',
			function ()
			{
				let tmpView = Object.create(libPictViewFlow.prototype);
				let tmpDisconnected = false;
				tmpView._FitObserver = { disconnect: function () { tmpDisconnected = true; } };
				tmpView.options = { FitMode: 'contain' };
				tmpView._FlowData = { ViewState: {} };
				tmpView._setupFitObserver();
				libExpect(tmpDisconnected).to.equal(true);
				libExpect(tmpView._FitObserver).to.equal(null);
			}
		);

		test
		(
			'_setupFitObserver re-observes the current SVG when a re-render replaces it',
			function ()
			{
				let tmpObserved = [];
				let tmpDisconnects = 0;
				global.ResizeObserver = function (pCallback) { this.observe = function (pEl) { tmpObserved.push(pEl); }; this.disconnect = function () { tmpDisconnects++; }; };
				try
				{
					let tmpView = Object.create(libPictViewFlow.prototype);
					tmpView.options = { FitMode: 'width' };
					tmpView._FlowData = { ViewState: { Frame: { X: 0, Y: 0, Width: 100, Height: 50 } } };
					// Stub the actual fit so the observer wiring is what is under test.
					tmpView.fitToWidth = function () {};

					let tmpSvgA = { id: 'svgA' };
					tmpView._SVGElement = tmpSvgA;
					tmpView._setupFitObserver();
					// Same element again: must not re-observe.
					tmpView._setupFitObserver();
					libExpect(tmpObserved).to.deep.equal([ tmpSvgA ]);

					// A re-render replaces the SVG: the observer must disconnect the old and observe the new.
					let tmpSvgB = { id: 'svgB' };
					tmpView._SVGElement = tmpSvgB;
					tmpView._setupFitObserver();
					libExpect(tmpObserved).to.deep.equal([ tmpSvgA, tmpSvgB ]);
					libExpect(tmpDisconnects).to.be.greaterThan(0);
				}
				finally
				{
					delete global.ResizeObserver;
				}
			}
		);
	}
);
