const libPictProviderGraphGeometry = require('pict-provider-graphgeometry');

/**
 * PictProvider-Flow-Geometry
 *
 * Backwards-compatible shim. As of the flow 2.0 plan (Phase 1a) the geometry
 * math lives in the standalone, dependency-free pict-provider-graphgeometry
 * module so it can be reused and unit tested on its own. This subclass keeps the
 * historical `PictProviderFlowGeometry` export and serviceType so the flow
 * service registry, every caller (PortRenderer, Node view, ConnectionRenderer,
 * Tether), and the existing Geometry_tests.js are unaffected. All methods are
 * inherited and delegate to the GraphGeometry core.
 *
 * Port Side values (12 positions) and the full method set are documented in
 * pict-provider-graphgeometry/source/GraphGeometry-Core.js.
 */
class PictProviderFlowGeometry extends libPictProviderGraphGeometry
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictProviderFlowGeometry';
	}
}

module.exports = PictProviderFlowGeometry;
