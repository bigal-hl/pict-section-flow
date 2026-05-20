const libFable = require('fable');
const libChai = require('chai');
const libExpect = libChai.expect;

const libRenderer = require('../source/providers/PictProvider-Flow-Renderer.js');
const libStylePresets = require('../source/providers/PictProvider-Flow-StylePresets.js');

// Minimal FlowView shim — captures the apply calls so we can verify each
// preset axis fires. The real FlowView wires Renderer + setEdgeTheme; here
// we substitute a fake whose setEdgeTheme just records its argument.
function makeFakeFlowView(pFable)
{
	let tmpRenderer = new libRenderer(pFable, {}, 'Renderer-Test');
	let tmpView =
	{
		_RendererProvider: tmpRenderer,
		setEdgeThemeCalls: [],
		setEdgeTheme: function (pName)
		{
			tmpView.setEdgeThemeCalls.push(pName);
		}
	};
	tmpRenderer._FlowView = tmpView;
	return tmpView;
}

// pict-provider-theme mock that records applyTheme calls.
function attachFakeThemeProvider(pFable)
{
	pFable.providers = pFable.providers || {};
	let tmpCalls = [];
	pFable.providers.Theme =
	{
		applyTheme: function (pHash) { tmpCalls.push(pHash); }
	};
	return tmpCalls;
}

suite('PictProvider-Flow-StylePresets',
function ()
{
	let _Fable;
	let _FlowView;
	let _ThemeCalls;
	let _Presets;

	setup(function ()
	{
		_Fable = new libFable({});
		_FlowView = makeFakeFlowView(_Fable);
		_ThemeCalls = attachFakeThemeProvider(_Fable);
		_Presets = new libStylePresets(_Fable, { FlowView: _FlowView }, 'Presets-Test');
	});

	suite('Built-in preset registry', function ()
	{
		test('registers all 7 bundled presets', function ()
		{
			let tmpHashes = _Presets.getPresetHashes();
			libExpect(tmpHashes).to.include('modern');
			libExpect(tmpHashes).to.include('sketch');
			libExpect(tmpHashes).to.include('blueprint');
			libExpect(tmpHashes).to.include('mono');
			libExpect(tmpHashes).to.include('retro-80s');
			libExpect(tmpHashes).to.include('retro-90s');
			libExpect(tmpHashes).to.include('whiteboard');
		});

		test('each bundled preset has ColorTheme + Renderer + EdgeTheme', function ()
		{
			let tmpHashes = _Presets.getPresetHashes();
			for (let i = 0; i < tmpHashes.length; i++)
			{
				let tmpPreset = _Presets.getPreset(tmpHashes[i]);
				libExpect(tmpPreset, `preset ${tmpHashes[i]}`).to.have.property('Hash', tmpHashes[i]);
				libExpect(tmpPreset).to.have.property('ColorTheme');
				libExpect(tmpPreset).to.have.property('Renderer');
				libExpect(tmpPreset).to.have.property('EdgeTheme');
			}
		});
	});

	suite('applyPreset()', function ()
	{
		test('applies ColorTheme + Renderer + EdgeTheme + optional NoiseLevel', function ()
		{
			let tmpOk = _Presets.applyPreset('sketch');
			libExpect(tmpOk).to.equal(true);
			libExpect(_ThemeCalls).to.deep.equal(['flow-sketch']);
			libExpect(_FlowView._RendererProvider.getActiveRendererKey()).to.equal('sketch');
			libExpect(_FlowView.setEdgeThemeCalls).to.deep.equal(['bezier']);
			libExpect(_FlowView._RendererProvider.getNoiseLevel()).to.equal(0.4);
		});

		test('blueprint applies bracket renderer + orthogonal edges', function ()
		{
			_Presets.applyPreset('blueprint');
			libExpect(_ThemeCalls).to.deep.equal(['flow-blueprint']);
			libExpect(_FlowView._RendererProvider.getActiveRendererKey()).to.equal('bracket');
			libExpect(_FlowView.setEdgeThemeCalls).to.deep.equal(['orthogonal']);
		});

		test('returns false + leaves state unchanged for unknown preset hash', function ()
		{
			_Presets.applyPreset('sketch');
			let tmpResult = _Presets.applyPreset('nonexistent');
			libExpect(tmpResult).to.equal(false);
			libExpect(_Presets.getActivePresetHash()).to.equal('sketch');
		});

		test('records active preset hash on success', function ()
		{
			libExpect(_Presets.getActivePresetHash()).to.equal(null);
			_Presets.applyPreset('mono');
			libExpect(_Presets.getActivePresetHash()).to.equal('mono');
		});
	});

	suite('register() + custom presets', function ()
	{
		test('apps can register their own preset and apply it', function ()
		{
			_Presets.register({
				Hash: 'corporate',
				Label: 'Corporate',
				ColorTheme: 'pict-default',
				Renderer:   'clean',
				EdgeTheme:  'orthogonal'
			});
			let tmpOk = _Presets.applyPreset('corporate');
			libExpect(tmpOk).to.equal(true);
			libExpect(_ThemeCalls).to.deep.equal(['pict-default']);
			libExpect(_FlowView._RendererProvider.getActiveRendererKey()).to.equal('clean');
		});

		test('register() rejects payloads missing a Hash', function ()
		{
			let tmpOk = _Presets.register({ Label: 'Bad' });
			libExpect(tmpOk).to.equal(false);
		});
	});

	suite('markCustomized()', function ()
	{
		test('clears the active preset hash so consumers know we deviated', function ()
		{
			_Presets.applyPreset('sketch');
			libExpect(_Presets.getActivePresetHash()).to.equal('sketch');
			_Presets.markCustomized();
			libExpect(_Presets.getActivePresetHash()).to.equal(null);
		});
	});
});
