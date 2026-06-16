const libFableServiceProviderBase = require('fable-serviceproviderbase');

const libPathGeneratorCore = require('pict-provider-graphlayout').PathGenerator;

/**
 * PictService-Flow-PathGenerator
 *
 * Backwards-compatible shim. The SVG path-generation math now lives in the
 * standalone pict-provider-graphlayout module as a geometry-injected core (flow
 * 2.0 Phase 1b). This service keeps the historical serviceType and the
 * `_FlowView` property, and delegates every method to the core. The core gets a
 * resolver so it reads the live FlowView geometry provider at call time, exactly
 * as the original implementation did.
 *
 * Used by the ConnectionRenderer (port-to-port connections) and the
 * TetherService (panel-to-node tethers).
 */
class PictServiceFlowPathGenerator extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'PictServiceFlowPathGenerator';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;

		let tmpSelf = this;
		this._Core = new libPathGeneratorCore(
			{
				geometryResolver: function ()
				{
					return tmpSelf._FlowView ? tmpSelf._FlowView._GeometryProvider : null;
				}
			});
	}

	computeDepartApproach(pFrom, pTo, pDepartDist)
	{
		return this._Core.computeDepartApproach(pFrom, pTo, pDepartDist);
	}

	computeAutoOrthogonalCorners(pDepartX, pDepartY, pApproachX, pApproachY, pFromDir, pToDir, pMidOffset)
	{
		return this._Core.computeAutoOrthogonalCorners(pDepartX, pDepartY, pApproachX, pApproachY, pFromDir, pToDir, pMidOffset);
	}

	evaluateCubicBezier(pP0, pP1, pP2, pP3, pT)
	{
		return this._Core.evaluateCubicBezier(pP0, pP1, pP2, pP3, pT);
	}

	buildBezierPathString(pStart, pDepart, pCP1, pCP2, pApproach, pEnd)
	{
		return this._Core.buildBezierPathString(pStart, pDepart, pCP1, pCP2, pApproach, pEnd);
	}

	buildSplitBezierPathString(pStart, pDepart, pCP1a, pCP1b, pHandle, pCP2a, pCP2b, pApproach, pEnd)
	{
		return this._Core.buildSplitBezierPathString(pStart, pDepart, pCP1a, pCP1b, pHandle, pCP2a, pCP2b, pApproach, pEnd);
	}

	buildMultiBezierPathString(pStart, pDepart, pHandles, pApproach, pEnd, pStartDir, pEndDir)
	{
		return this._Core.buildMultiBezierPathString(pStart, pDepart, pHandles, pApproach, pEnd, pStartDir, pEndDir);
	}

	buildOrthogonalPathString(pStart, pDepart, pCorner1, pCorner2, pApproach, pEnd)
	{
		return this._Core.buildOrthogonalPathString(pStart, pDepart, pCorner1, pCorner2, pApproach, pEnd);
	}

	computeDirectionalGeometry(pStart, pEnd)
	{
		return this._Core.computeDirectionalGeometry(pStart, pEnd);
	}

	distanceToSegment(pPX, pPY, pAX, pAY, pBX, pBY)
	{
		return this._Core.distanceToSegment(pPX, pPY, pAX, pAY, pBX, pBY);
	}

	getAutoMidpoint(pStart, pEnd)
	{
		return this._Core.getAutoMidpoint(pStart, pEnd);
	}

	getAutoMidpointSimple(pFrom, pTo, pDepartDist)
	{
		return this._Core.getAutoMidpointSimple(pFrom, pTo, pDepartDist);
	}
}

module.exports = PictServiceFlowPathGenerator;
