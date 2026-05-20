const libFable = require('fable');
const libChai = require('chai');
const libExpect = libChai.expect;

const libRenderer = require('../source/providers/PictProvider-Flow-Renderer.js');

suite('PictProvider-Flow-Renderer',
function ()
{
	let _Fable;
	let _Renderer;

	setup(function ()
	{
		_Fable = new libFable({});
		_Renderer = new libRenderer(_Fable, {}, 'Renderer-Test');
	});

	suite('Built-in renderer registry', function ()
	{
		test('registers clean, bracket, sketch, crt, workstation by default', function ()
		{
			let tmpKeys = _Renderer.getRendererKeys();
			libExpect(tmpKeys).to.include('clean');
			libExpect(tmpKeys).to.include('bracket');
			libExpect(tmpKeys).to.include('sketch');
			libExpect(tmpKeys).to.include('crt');
			libExpect(tmpKeys).to.include('workstation');
		});

		test('clean is the default active renderer', function ()
		{
			libExpect(_Renderer.getActiveRendererKey()).to.equal('clean');
		});

		test('each built-in renderer has the required shape', function ()
		{
			let tmpKeys = _Renderer.getRendererKeys();
			for (let i = 0; i < tmpKeys.length; i++)
			{
				let tmpR = _Renderer.getActiveRenderer.call(
					{ _Renderers: _Renderer._Renderers, _ActiveRendererKey: tmpKeys[i] });
				libExpect(tmpR, `renderer ${tmpKeys[i]}`).to.have.property('Key', tmpKeys[i]);
				libExpect(tmpR).to.have.property('NodeBodyMode');
				libExpect(tmpR).to.have.property('NoiseConfig');
				libExpect(tmpR).to.have.property('ConnectionConfig');
				libExpect(tmpR).to.have.property('GeometryCSS');
			}
		});
	});

	suite('setRenderer()', function ()
	{
		test('switches the active renderer + updates noise default', function ()
		{
			_Renderer.setRenderer('sketch');
			libExpect(_Renderer.getActiveRendererKey()).to.equal('sketch');
			let tmpActive = _Renderer.getActiveRenderer();
			libExpect(tmpActive.NodeBodyMode).to.equal('bracket');
			libExpect(_Renderer.getNoiseLevel()).to.equal(0.4);
		});

		test('returns false for unknown renderer + leaves state unchanged', function ()
		{
			_Renderer.setRenderer('sketch');
			let tmpResult = _Renderer.setRenderer('nonexistent');
			libExpect(tmpResult).to.equal(false);
			libExpect(_Renderer.getActiveRendererKey()).to.equal('sketch');
		});

		test('switching to a renderer with noise disabled resets noise to 0', function ()
		{
			_Renderer.setRenderer('sketch');   // 0.4
			_Renderer.setRenderer('clean');    // 0
			libExpect(_Renderer.getNoiseLevel()).to.equal(0);
		});
	});

	suite('register()', function ()
	{
		test('registers a custom renderer + reads back through getActiveRenderer', function ()
		{
			_Renderer.register('custom', {
				Label: 'Custom',
				NodeBodyMode: 'rect',
				NoiseConfig: { Enabled: false, DefaultLevel: 0, MaxJitterPx: 0, AffectsNodes: false, AffectsConnections: false },
				ConnectionConfig: { StrokeWidth: 3, ArrowheadStyle: 'triangle' },
				GeometryCSS: '',
				AdditionalCSS: ''
			});
			let tmpResult = _Renderer.setRenderer('custom');
			libExpect(tmpResult).to.equal(true);
			let tmpActive = _Renderer.getActiveRenderer();
			libExpect(tmpActive.Key).to.equal('custom');
			libExpect(tmpActive.Label).to.equal('Custom');
		});
	});

	suite('Noise APIs', function ()
	{
		test('setNoiseLevel clamps to [0,1]', function ()
		{
			_Renderer.setNoiseLevel(-1);
			libExpect(_Renderer.getNoiseLevel()).to.equal(0);
			_Renderer.setNoiseLevel(2);
			libExpect(_Renderer.getNoiseLevel()).to.equal(1);
			_Renderer.setNoiseLevel(0.5);
			libExpect(_Renderer.getNoiseLevel()).to.equal(0.5);
		});

		test('getNodeNoiseAmplitude is 0 when active renderer disables noise', function ()
		{
			_Renderer.setRenderer('clean');
			_Renderer.setNoiseLevel(1);
			libExpect(_Renderer.getNodeNoiseAmplitude()).to.equal(0);
		});

		test('getNodeNoiseAmplitude scales with noise level when sketch is active', function ()
		{
			_Renderer.setRenderer('sketch');
			_Renderer.setNoiseLevel(0.5);
			// sketch.MaxJitterPx is 4 — 0.5 * 4 = 2
			libExpect(_Renderer.getNodeNoiseAmplitude()).to.equal(2);
		});

		test('processPathString is a no-op when noise is disabled', function ()
		{
			_Renderer.setRenderer('clean');
			let tmpResult = _Renderer.processPathString('M 0 0 L 10 10', 'seed');
			libExpect(tmpResult).to.equal('M 0 0 L 10 10');
		});
	});
});
