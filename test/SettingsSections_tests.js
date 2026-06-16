const libChai = require('chai');
const libExpect = libChai.expect;

const libToolbar = require('../source/views/PictView-Flow-Toolbar.js');

// _buildHostSettingsSections only reads this._FlowView.options.SettingsSections, so
// borrow the prototype method onto a stub to exercise it without a real toolbar/DOM.
function makeStub(pSettingsSections)
{
	return {
		_FlowView: { options: { SettingsSections: pSettingsSections } },
		_buildHostSettingsSections: libToolbar.prototype._buildHostSettingsSections
	};
}

suite
(
	'PictView-Flow-Toolbar host settings sections',
	function ()
	{
		test
		(
			'no SettingsSections -> empty string',
			function ()
			{
				libExpect(makeStub(undefined)._buildHostSettingsSections()).to.equal('');
				libExpect(makeStub([])._buildHostSettingsSections()).to.equal('');
			}
		);

		test
		(
			'renders an HTML section with a label and a divider',
			function ()
			{
				let tmpOut = makeStub([ { Label: 'Background', HTML: '<select id="x"></select>' } ])._buildHostSettingsSections();
				libExpect(tmpOut).to.contain('pict-flow-popup-divider');
				libExpect(tmpOut).to.contain('>Background<');
				libExpect(tmpOut).to.contain('<select id="x">');
			}
		);

		test
		(
			'a Build function is evaluated at open time with the flow view',
			function ()
			{
				let tmpSeen = null;
				let tmpStub = makeStub([ { Label: 'Mode', Build: function (pFlowView) { tmpSeen = pFlowView; return '<button>Go</button>'; } } ]);
				let tmpOut = tmpStub._buildHostSettingsSections();
				libExpect(tmpSeen).to.equal(tmpStub._FlowView);
				libExpect(tmpOut).to.contain('<button>Go</button>');
			}
		);

		test
		(
			'a section that produces no markup is skipped (no stray divider)',
			function ()
			{
				let tmpOut = makeStub([ { Label: 'Empty', Build: function () { return ''; } } ])._buildHostSettingsSections();
				libExpect(tmpOut).to.equal('');
			}
		);
	}
);
