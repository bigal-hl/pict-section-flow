const libChai = require('chai');
const libExpect = libChai.expect;

const libPictViewFlow = require('../source/views/PictView-Flow.js');
const libPictViewFlowToolbar = require('../source/views/PictView-Flow-Toolbar.js');
const libPictViewFlowFloatingToolbar = require('../source/views/PictView-Flow-FloatingToolbar.js');

// The toolbar custom-button API (ToolbarExtraButtons + onToolbarButton) lets a host add its own buttons
// to the flow toolbar. They render in both the docked and the floating toolbar (so they survive every
// toolbar mode) and, on click, fire the FlowView's onToolbarButton hook. These are harness-free unit
// tests: the render-time stamping and the click dispatch are prototype methods called against light
// stubs, so no DOM or full Pict app is needed.
suite('Flow Toolbar custom buttons (ToolbarExtraButtons)',
function ()
{
	suite('default_configuration is additive + backward compatible',
	function ()
	{
		test('the flow view defaults to no extra buttons and no hook',
		function ()
		{
			// default_configuration is no longer exported (Pict would pre-merge it and clobber
			// Profiles); the resolved defaults come from mergeProfileOptions({}).
			let tmpDefaults = libPictViewFlow.mergeProfileOptions({});
			libExpect(tmpDefaults.ToolbarExtraButtons).to.be.an('array');
			libExpect(tmpDefaults.ToolbarExtraButtons.length).to.equal(0);
			libExpect(tmpDefaults.onToolbarButton).to.equal(false);
		});

		test('both toolbar views default to an empty extra-button list',
		function ()
		{
			libExpect(libPictViewFlowToolbar.default_configuration.ToolbarExtraButtons).to.be.an('array');
			libExpect(libPictViewFlowToolbar.default_configuration.ToolbarExtraButtons.length).to.equal(0);
			libExpect(libPictViewFlowFloatingToolbar.default_configuration.ToolbarExtraButtons).to.be.an('array');
			libExpect(libPictViewFlowFloatingToolbar.default_configuration.ToolbarExtraButtons.length).to.equal(0);
		});

		test('both toolbar templates render the extra-button group + row template',
		function ()
		{
			let tmpDockedTemplates = libPictViewFlowToolbar.default_configuration.Templates;
			let tmpDockedBar = tmpDockedTemplates.find((pT) => pT.Hash === 'Flow-Toolbar-Template');
			let tmpDockedRow = tmpDockedTemplates.find((pT) => pT.Hash === 'Flow-Toolbar-Extra-Button');
			libExpect(tmpDockedBar.Template).to.contain('{~TS:Flow-Toolbar-Extra-Button:Record.ToolbarExtraButtons~}');
			libExpect(tmpDockedRow).to.be.an('object');
			libExpect(tmpDockedRow.Template).to.contain('_handleExtraAction');

			let tmpFloatTemplates = libPictViewFlowFloatingToolbar.default_configuration.Templates;
			let tmpFloatBar = tmpFloatTemplates.find((pT) => pT.Hash === 'Flow-FloatingToolbar-Template');
			let tmpFloatRow = tmpFloatTemplates.find((pT) => pT.Hash === 'Flow-FloatingToolbar-Extra-Button');
			libExpect(tmpFloatBar.Template).to.contain('{~TS:Flow-FloatingToolbar-Extra-Button:Record.ToolbarExtraButtons~}');
			libExpect(tmpFloatRow).to.be.an('object');
			libExpect(tmpFloatRow.Template).to.contain('_handleExtraClick');
		});
	});

	suite('_stampExtraButtons (render-time per-row fields)',
	function ()
	{
		test('stamps FlowViewIdentifier and an empty ActiveClass onto each button',
		function ()
		{
			let tmpStub =
			{
				options:
				{
					FlowViewIdentifier: 'MB-FlowView-7',
					ToolbarExtraButtons: [ { Hash: 'background', Icon: 'background' }, { Hash: 'done', Icon: 'check' } ]
				}
			};
			libPictViewFlowToolbar.prototype._stampExtraButtons.call(tmpStub);
			libExpect(tmpStub.options.ToolbarExtraButtons[0].FlowViewIdentifier).to.equal('MB-FlowView-7');
			libExpect(tmpStub.options.ToolbarExtraButtons[0].ActiveClass).to.equal('');
			libExpect(tmpStub.options.ToolbarExtraButtons[1].FlowViewIdentifier).to.equal('MB-FlowView-7');
		});

		test('an Active button gets the active class',
		function ()
		{
			let tmpStub =
			{
				options:
				{
					FlowViewIdentifier: 'Pict-Flow',
					ToolbarExtraButtons: [ { Hash: 'edit', Icon: 'edit', Active: true } ]
				}
			};
			libPictViewFlowToolbar.prototype._stampExtraButtons.call(tmpStub);
			libExpect(tmpStub.options.ToolbarExtraButtons[0].ActiveClass).to.equal(' pict-flow-toolbar-btn-active');
		});

		test('a Toggle button gets the toggle class (for its status LED); an action button does not',
		function ()
		{
			let tmpStub =
			{
				options:
				{
					FlowViewIdentifier: 'Pict-Flow',
					ToolbarExtraButtons: [ { Hash: 'pan', Icon: 'pan', Toggle: true }, { Hash: 'edit', Icon: 'edit' } ]
				}
			};
			libPictViewFlowToolbar.prototype._stampExtraButtons.call(tmpStub);
			libExpect(tmpStub.options.ToolbarExtraButtons[0].ToggleClass).to.equal(' pict-flow-toolbar-btn-toggle');
			libExpect(tmpStub.options.ToolbarExtraButtons[1].ToggleClass).to.equal('');
		});

		test('a non-array extra-button option is tolerated',
		function ()
		{
			let tmpStub = { options: { FlowViewIdentifier: 'Pict-Flow', ToolbarExtraButtons: false } };
			libExpect(function () { libPictViewFlowToolbar.prototype._stampExtraButtons.call(tmpStub); }).to.not.throw();
		});
	});

	suite('click dispatch fires onToolbarButton(hash, element)',
	function ()
	{
		test('the docked toolbar routes a click to the FlowView hook with the element',
		function ()
		{
			let tmpFired = [];
			let tmpElement = { id: 'the-button' };
			let tmpStub =
			{
				_FlowView: { options: { onToolbarButton: (pHash, pEl) => { tmpFired.push({ Hash: pHash, El: pEl }); } } }
			};
			libPictViewFlowToolbar.prototype._handleExtraAction.call(tmpStub, 'background', tmpElement);
			libExpect(tmpFired.length).to.equal(1);
			libExpect(tmpFired[0].Hash).to.equal('background');
			libExpect(tmpFired[0].El).to.equal(tmpElement);
		});

		test('no hook configured is a no-op (does not throw)',
		function ()
		{
			let tmpStub = { _FlowView: { options: { onToolbarButton: false } } };
			libExpect(function () { libPictViewFlowToolbar.prototype._handleExtraAction.call(tmpStub, 'edit', {}); }).to.not.throw();
		});

		test('the floating toolbar routes its click through the docked toolbar dispatch',
		function ()
		{
			let tmpSeen = [];
			let tmpElement = { id: 'floating-button' };
			let tmpFloatStub =
			{
				_ToolbarView: { _handleExtraAction: (pHash, pEl) => { tmpSeen.push({ Hash: pHash, El: pEl }); } }
			};
			libPictViewFlowFloatingToolbar.prototype._handleExtraClick.call(tmpFloatStub, 'done', tmpElement);
			libExpect(tmpSeen.length).to.equal(1);
			libExpect(tmpSeen[0].Hash).to.equal('done');
			libExpect(tmpSeen[0].El).to.equal(tmpElement);
		});
	});
});
