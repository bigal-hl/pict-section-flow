const libFableServiceProviderBase = require('fable-serviceproviderbase');

/**
 * PictProvider-Flow-CSS
 *
 * Centralized CSS provider for the flow diagram.
 * All flow-related CSS is organized into domain-specific getter methods,
 * providing a single source of truth and enabling future theming.
 */

const _ProviderConfiguration =
{
	ProviderIdentifier: 'PictProviderFlowCSS'
};

class PictProviderFlowCSS extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _ProviderConfiguration, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'PictProviderFlowCSS';

		this._FlowView = (pOptions && pOptions.FlowView) ? pOptions.FlowView : null;
	}

	// ── Container ──────────────────────────────────────────────────────────
	/**
	 * CSS for the flow container, SVG container, panning/connecting cursors, and grid pattern.
	 * @returns {string}
	 */
	getContainerCSS()
	{
		return /*css*/`
		.pict-flow-container {
			/* ── Design Tokens ─────────────────────────────────────
			   Override these custom properties to theme the flow diagram.
			   Node-type classes (.pict-flow-node-{type}) can scope-override
			   any variable for per-type variation.

			   Defaults reference the host application's pict-provider-theme
			   tokens (--theme-color-*) when available, with hardcoded
			   fallbacks so the editor still looks reasonable in unthemed
			   contexts. Internal flow themes (sketch, blueprint, etc.) keep
			   layering on top via .pict-flow-container scoped overrides. */

			/* Text */
			--pf-text-primary: var(--theme-color-text-primary, #2c3e50);
			--pf-text-heading: var(--theme-color-text-primary, #1a252f);
			--pf-text-secondary: var(--theme-color-text-secondary, #7f8c8d);
			--pf-text-tertiary: var(--theme-color-text-muted, #8e99a4);
			--pf-text-placeholder: var(--theme-color-text-placeholder, #95a5a6);

			/* Node */
			--pf-node-body-fill: var(--theme-color-background-panel, #ffffff);
			--pf-node-body-stroke: var(--theme-color-border-default, #d0d4d8);
			--pf-node-body-stroke-hover: var(--theme-color-border-strong, #b0b8c0);
			--pf-node-body-stroke-width: 1;
			--pf-node-body-radius: 8px;
			--pf-node-shadow: drop-shadow(0 1px 3px var(--theme-color-shadow-color, rgba(0, 0, 0, 0.10)));
			--pf-node-shadow-hover: drop-shadow(0 2px 6px var(--theme-color-shadow-color, rgba(0, 0, 0, 0.15)));
			--pf-node-shadow-selected: drop-shadow(0 2px 8px rgba(52, 152, 219, 0.25));
			--pf-node-shadow-dragging: drop-shadow(0 4px 12px var(--theme-color-shadow-color, rgba(0, 0, 0, 0.20)));
			--pf-node-title-fill: var(--theme-color-background-panel, #ffffff);
			--pf-node-title-size: 11.5px;
			--pf-node-title-weight: 600;
			--pf-node-title-bar-color: var(--theme-color-text-primary, #2c3e50);
			--pf-node-type-label-fill: var(--theme-color-text-muted, #a0a8b0);
			--pf-node-selected-stroke: var(--theme-color-brand-primary, #3498db);

			/* Node Variants */
			--pf-node-start-fill: var(--theme-color-background-hover, #eafaf1);
			--pf-node-start-stroke: var(--theme-color-status-success, #27ae60);
			--pf-node-end-fill: var(--theme-color-background-hover, #e8f8f5);
			--pf-node-end-stroke: var(--theme-color-brand-primary, #1abc9c);
			--pf-node-halt-fill: var(--theme-color-background-hover, #fdedec);
			--pf-node-halt-stroke: var(--theme-color-status-error, #e74c3c);
			--pf-node-decision-fill: var(--theme-color-background-hover, #fff9e6);
			--pf-node-decision-stroke: var(--theme-color-status-warning, #f39c12);

			/* ── Color roles ───────────────────────────────────────
			   Generic, theme-aware semantic colors that node types and
			   individual cards opt into via a ColorRole field. The
			   "-soft" variant is the tinted background; the bare role is
			   the title-bar / outline / accent stroke.

			   Hosts can override any of these tokens at .pict-flow-container
			   scope (or at their own scope) without touching JS. Built-in
			   node types resolve their visuals through these tokens, so
			   theming a role automatically retints every card that uses it.

			   Soft tints use color-mix() — supported in Chrome 111+,
			   Safari 16.2+, Firefox 113+. The hardcoded fallbacks keep the
			   editor presentable on older engines. */
			--pf-color-success: var(--theme-color-status-success, #27ae60);
			--pf-color-success-soft: color-mix(in srgb, var(--pf-color-success) 12%, transparent);
			--pf-color-warning: var(--theme-color-status-warning, #f39c12);
			--pf-color-warning-soft: color-mix(in srgb, var(--pf-color-warning) 14%, transparent);
			--pf-color-error: var(--theme-color-status-error, #e74c3c);
			--pf-color-error-soft: color-mix(in srgb, var(--pf-color-error) 12%, transparent);
			--pf-color-info: var(--theme-color-status-info, #3498db);
			--pf-color-info-soft: color-mix(in srgb, var(--pf-color-info) 12%, transparent);
			--pf-color-accent: var(--theme-color-brand-accent, #1abc9c);
			--pf-color-accent-soft: color-mix(in srgb, var(--pf-color-accent) 14%, transparent);
			--pf-color-neutral: var(--theme-color-text-primary, #2c3e50);
			--pf-color-neutral-soft: var(--theme-color-background-panel, #ffffff);
			--pf-color-neutral-onfill: var(--theme-color-background-panel, #ffffff);

			/* Ports */
			--pf-port-input-fill: var(--theme-color-status-info, #3498db);
			--pf-port-output-fill: var(--theme-color-status-success, #2ecc71);
			--pf-port-stroke: var(--theme-color-background-panel, #ffffff);
			--pf-port-stroke-width: 2;
			--pf-port-label-bg: rgba(255, 253, 240, 0.5);
			--pf-port-label-text: var(--theme-color-text-primary, #2c3e50);

			/* Port Type Colors */
			--pf-port-event-in-fill: var(--theme-color-status-info, #3498db);
			--pf-port-event-out-fill: var(--theme-color-status-success, #2ecc71);
			--pf-port-setting-fill: var(--theme-color-status-warning, #e67e22);
			--pf-port-value-fill: var(--theme-color-status-warning, #f1c40f);
			--pf-port-error-fill: var(--theme-color-status-error, #e74c3c);

			/* Connection Type Colors (match source port) */
			--pf-connection-event-in-stroke: var(--theme-color-status-info, #3498db);
			--pf-connection-event-out-stroke: var(--theme-color-status-success, #2ecc71);
			--pf-connection-setting-stroke: var(--theme-color-status-warning, #e67e22);
			--pf-connection-value-stroke: var(--theme-color-status-warning, #f1c40f);
			--pf-connection-error-stroke: var(--theme-color-status-error, #e74c3c);

			/* Connections */
			--pf-connection-stroke: var(--theme-color-border-strong, #95a5a6);
			--pf-connection-stroke-hover: var(--theme-color-text-secondary, #7f8c8d);
			--pf-connection-selected-stroke: var(--theme-color-brand-primary, #3498db);

			/* Panels */
			--pf-panel-bg: var(--theme-color-background-panel, #ffffff);
			--pf-panel-border: var(--theme-color-border-default, #d0d4d8);
			--pf-panel-radius: 8px;
			--pf-panel-shadow: 0 4px 12px var(--theme-color-shadow-color, rgba(0, 0, 0, 0.10)), 0 1px 3px var(--theme-color-shadow-color, rgba(0, 0, 0, 0.06));
			--pf-panel-titlebar-bg: var(--theme-color-background-secondary, #f7f8fa);
			--pf-panel-titlebar-border: var(--theme-color-border-light, #e8eaed);
			--pf-panel-title-color: var(--theme-color-text-primary, #2c3e50);

			/* Tabs */
			--pf-tab-text: var(--theme-color-text-muted, #8e99a4);
			--pf-tab-text-hover: var(--theme-color-text-secondary, #5a6a7a);
			--pf-tab-active-border: var(--pf-node-selected-stroke);
			--pf-resize-handle-hover: var(--theme-color-border-light, #e0e3e6);

			/* Forms & Inputs */
			--pf-input-border: var(--theme-color-border-default, #d5d8dc);
			--pf-input-border-focus: var(--theme-color-focus-outline, #3498db);
			--pf-divider-light: var(--theme-color-border-light, #ecf0f1);
			--pf-divider-medium: var(--theme-color-border-light, #e8eaed);

			/* Buttons */
			--pf-button-border: var(--theme-color-border-default, #bdc3c7);
			--pf-button-hover-border: var(--theme-color-border-strong, #95a5a6);
			--pf-button-hover-bg: var(--theme-color-background-hover, #ecf0f1);
			--pf-button-active-bg: var(--theme-color-background-selected, #d5dbdb);
			--pf-button-danger-text: var(--theme-color-status-error, #e74c3c);
			--pf-button-danger-hover-bg: var(--theme-color-background-hover, #fdedec);
			--pf-button-close-color: var(--theme-color-text-muted, #b0b8c0);

			/* Badges */
			--pf-badge-category-bg: var(--theme-color-background-tertiary, #f0f2f4);
			--pf-badge-category-text: var(--theme-color-text-secondary, #6b7b8d);
			--pf-badge-code-bg: var(--theme-color-background-hover, #eaf2f8);
			--pf-badge-code-text: var(--theme-color-status-info, #2980b9);

			/* Info Panel */
			--pf-port-item-bg: var(--theme-color-background-secondary, #f8f9fa);

			/* Toolbar */
			--pf-toolbar-bg: var(--theme-color-background-panel, #ffffff);
			--pf-toolbar-border: var(--theme-color-border-default, #e0e0e0);

			/* Palette Cards */
			--pf-card-border: var(--theme-color-border-default, #d5d8dc);
			--pf-card-hover-bg: var(--theme-color-background-hover, #eaf2f8);
			--pf-card-hover-shadow: 0 1px 3px rgba(52, 152, 219, 0.15);

			/* Canvas */
			--pf-canvas-bg: var(--theme-color-background-secondary, #fafafa);
			--pf-grid-stroke: var(--theme-color-border-light, #e8e8e8);

			position: relative;
			width: 100%;
			height: 100%;
			min-height: 400px;
			overflow: hidden;
			background-color: var(--pf-canvas-bg);
			border: 1px solid var(--pf-toolbar-border);
			border-radius: 4px;
			display: flex;
			flex-direction: column;
		}
		.pict-flow-svg-container {
			flex: 1;
			min-height: 0;
			position: relative;
		}
		.pict-flow-svg {
			width: 100%;
			height: 100%;
			cursor: grab;
			user-select: none;
			-webkit-user-select: none;
		}
		.pict-flow-svg.panning {
			cursor: grabbing;
		}
		.pict-flow-svg.connecting {
			cursor: crosshair;
		}
		.pict-flow-grid-pattern line {
			stroke: var(--pf-grid-stroke);
			stroke-width: 0.5;
		}
		`;
	}

	// ── Nodes ──────────────────────────────────────────────────────────────
	/**
	 * CSS for base node styling: body, hover/selected/dragging states, title bar, title text, type label.
	 * @returns {string}
	 */
	getNodeCSS()
	{
		return /*css*/`
		.pict-flow-node {
			cursor: pointer;
			filter: var(--pf-node-shadow);
			transition: filter 0.2s;
		}
		.pict-flow-node:hover {
			filter: var(--pf-node-shadow-hover);
		}
		.pict-flow-node:hover .pict-flow-node-body {
			stroke: var(--pf-node-body-stroke-hover);
			stroke-width: 1.5;
		}
		.pict-flow-node.selected {
			filter: var(--pf-node-shadow-selected);
		}
		.pict-flow-node.selected .pict-flow-node-body {
			stroke: var(--pf-node-selected-stroke);
			stroke-width: 2;
		}
		.pict-flow-node.dragging {
			opacity: 0.9;
			cursor: grabbing;
			filter: var(--pf-node-shadow-dragging);
		}
		.pict-flow-node-body {
			fill: var(--pf-node-body-fill);
			stroke: var(--pf-node-body-stroke);
			stroke-width: var(--pf-node-body-stroke-width);
			rx: var(--pf-node-body-radius);
			ry: var(--pf-node-body-radius);
			transition: stroke 0.2s, stroke-width 0.2s;
		}
		.pict-flow-node-title-bar {
			fill: var(--pf-node-title-bar-color);
			rx: var(--pf-node-body-radius);
			ry: var(--pf-node-body-radius);
		}
		.pict-flow-node-title-bar-bottom {
			fill: var(--pf-node-title-bar-color);
		}
		.pict-flow-node-resize-handle {
			fill: var(--theme-color-brand-primary, #2880a6);
			stroke: var(--theme-color-background-panel, #ffffff);
			stroke-width: 1.5;
			cursor: nwse-resize;
			opacity: 0.85;
		}
		.pict-flow-node-resize-handle:hover { opacity: 1; }
		.pict-flow-marquee {
			fill: var(--theme-color-brand-primary, #2880a6);
			fill-opacity: 0.10;
			stroke: var(--theme-color-brand-primary, #2880a6);
			stroke-width: 1;
			stroke-dasharray: 4 3;
			pointer-events: none;
		}
		.pict-flow-align-guide {
			stroke: #e5397f;
			stroke-width: 1;
			stroke-dasharray: 3 2;
			pointer-events: none;
			shape-rendering: crispEdges;
		}
		.pict-flow-node-title {
			fill: var(--pf-node-title-fill);
			font-size: var(--pf-node-title-size);
			font-weight: var(--pf-node-title-weight);
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			letter-spacing: 0.2px;
			pointer-events: none;
		}
		.pict-flow-node-type-label {
			fill: var(--pf-node-type-label-fill);
			font-size: 9.5px;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			text-transform: uppercase;
			letter-spacing: 0.3px;
			pointer-events: none;
			opacity: 0;
			transition: opacity 0.2s;
		}
		.pict-flow-node:hover .pict-flow-node-type-label {
			opacity: 1;
		}
		.pict-flow-node-card-code {
			opacity: 0;
			transition: opacity 0.2s;
		}
		.pict-flow-node:hover .pict-flow-node-card-code {
			opacity: 1;
		}
		/* Title-bar icon: invert SVG paths to white for dark title bars */
		.pict-flow-node-title-icon {
			filter: brightness(0) invert(1);
		}
		`;
	}

	// ── Body Content ──────────────────────────────────────────────────────
	/**
	 * CSS for custom body content in nodes: SVG group, foreignObject, HTML container, canvas.
	 * @returns {string}
	 */
	getBodyContentCSS()
	{
		return /*css*/`
		.pict-flow-node-body-content {
			pointer-events: none;
		}
		.pict-flow-node-body-content-fo {
			overflow: hidden;
		}
		.pict-flow-node-body-content-html {
			overflow: hidden;
			width: 100%;
			height: 100%;
			box-sizing: border-box;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			font-size: 11px;
			color: var(--pf-text-primary);
			pointer-events: auto;
		}
		.pict-flow-node-body-content-canvas {
			display: block;
			pointer-events: auto;
		}
		`;
	}

	// ── Node Variants ──────────────────────────────────────────────────────
	/**
	 * CSS overrides for specific node types: start, end, halt, decision.
	 * @returns {string}
	 */
	getNodeVariantCSS()
	{
		return /*css*/`
		.pict-flow-node-decision .pict-flow-node-body {
			fill: var(--pf-node-decision-fill);
			stroke: var(--pf-node-decision-stroke);
			stroke-width: 1.5;
		}
		.pict-flow-node-start .pict-flow-node-body {
			fill: var(--pf-node-start-fill);
			stroke: var(--pf-node-start-stroke);
			stroke-width: 1.5;
		}
		.pict-flow-node-end .pict-flow-node-body {
			fill: var(--pf-node-end-fill);
			stroke: var(--pf-node-end-stroke);
			stroke-width: 1.5;
		}
		.pict-flow-node-halt .pict-flow-node-body {
			fill: var(--pf-node-halt-fill);
			stroke: var(--pf-node-halt-stroke);
			stroke-width: 1.5;
		}

		/* ── Color-role variants ────────────────────────────────
		   Cards opt into a role via ColorRole on the node-type config or
		   a per-node override. The renderer adds .pict-flow-node-color-{role}
		   to the node group, which pulls fill/stroke/title-bar colors from
		   the --pf-color-* tokens — those in turn track the host's
		   --theme-color-* tokens so light/dark/palette swaps propagate.

		   Roles deliberately don't override .pict-flow-node-body-content-*
		   styling — the body content's visual identity is the consumer's
		   responsibility. */
		.pict-flow-node-color-success .pict-flow-node-body {
			fill: var(--pf-color-success-soft);
			stroke: var(--pf-color-success);
			stroke-width: 1.5;
		}
		.pict-flow-node-color-success .pict-flow-node-title-bar,
		.pict-flow-node-color-success .pict-flow-node-title-bar-bottom {
			fill: var(--pf-color-success);
		}
		.pict-flow-node-color-success .pict-flow-node-bracket {
			stroke: var(--pf-color-success);
		}

		.pict-flow-node-color-warning .pict-flow-node-body {
			fill: var(--pf-color-warning-soft);
			stroke: var(--pf-color-warning);
			stroke-width: 1.5;
		}
		.pict-flow-node-color-warning .pict-flow-node-title-bar,
		.pict-flow-node-color-warning .pict-flow-node-title-bar-bottom {
			fill: var(--pf-color-warning);
		}
		.pict-flow-node-color-warning .pict-flow-node-bracket {
			stroke: var(--pf-color-warning);
		}

		.pict-flow-node-color-error .pict-flow-node-body {
			fill: var(--pf-color-error-soft);
			stroke: var(--pf-color-error);
			stroke-width: 1.5;
		}
		.pict-flow-node-color-error .pict-flow-node-title-bar,
		.pict-flow-node-color-error .pict-flow-node-title-bar-bottom {
			fill: var(--pf-color-error);
		}
		.pict-flow-node-color-error .pict-flow-node-bracket {
			stroke: var(--pf-color-error);
		}

		.pict-flow-node-color-info .pict-flow-node-body {
			fill: var(--pf-color-info-soft);
			stroke: var(--pf-color-info);
			stroke-width: 1.5;
		}
		.pict-flow-node-color-info .pict-flow-node-title-bar,
		.pict-flow-node-color-info .pict-flow-node-title-bar-bottom {
			fill: var(--pf-color-info);
		}
		.pict-flow-node-color-info .pict-flow-node-bracket {
			stroke: var(--pf-color-info);
		}

		.pict-flow-node-color-accent .pict-flow-node-body {
			fill: var(--pf-color-accent-soft);
			stroke: var(--pf-color-accent);
			stroke-width: 1.5;
		}
		.pict-flow-node-color-accent .pict-flow-node-title-bar,
		.pict-flow-node-color-accent .pict-flow-node-title-bar-bottom {
			fill: var(--pf-color-accent);
		}
		.pict-flow-node-color-accent .pict-flow-node-bracket {
			stroke: var(--pf-color-accent);
		}

		.pict-flow-node-color-neutral .pict-flow-node-body {
			fill: var(--pf-color-neutral-soft);
			stroke: var(--pf-color-neutral);
			stroke-width: 1;
		}
		.pict-flow-node-color-neutral .pict-flow-node-title-bar,
		.pict-flow-node-color-neutral .pict-flow-node-title-bar-bottom {
			fill: var(--pf-color-neutral);
		}
		.pict-flow-node-color-neutral .pict-flow-node-bracket {
			stroke: var(--pf-color-neutral);
		}
		`;
	}

	// ── Ports ──────────────────────────────────────────────────────────────
	/**
	 * CSS for port circles: input/output coloring, hover states, labels.
	 * @returns {string}
	 */
	getPortCSS()
	{
		return /*css*/`
		.pict-flow-port {
			cursor: crosshair;
			transition: r 0.15s, filter 0.15s;
			filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.12));
		}
		.pict-flow-port.input {
			fill: var(--pf-port-input-fill);
			stroke: var(--pf-port-stroke);
			stroke-width: var(--pf-port-stroke-width);
		}
		.pict-flow-port.output {
			fill: var(--pf-port-output-fill);
			stroke: var(--pf-port-stroke);
			stroke-width: var(--pf-port-stroke-width);
		}
		.pict-flow-port:hover {
			r: 7;
			filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.20));
		}
		/* Port type color overrides */
		.pict-flow-port.port-type-event-in {
			fill: var(--pf-port-event-in-fill);
		}
		.pict-flow-port.port-type-event-out {
			fill: var(--pf-port-event-out-fill);
		}
		.pict-flow-port.port-type-setting {
			fill: var(--pf-port-setting-fill);
		}
		.pict-flow-port.port-type-value {
			fill: var(--pf-port-value-fill);
		}
		.pict-flow-port.port-type-error {
			fill: var(--pf-port-error-fill);
		}
		.pict-flow-port-label {
			font-size: 8px;
			font-weight: 600;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			pointer-events: none;
		}
		/* Port label badge background */
		.pict-flow-port-label-bg {
			pointer-events: none;
		}
		/* Port labels on hover: hidden by default, revealed on node hover */
		.pict-flow-node-port-labels-hover .pict-flow-port-label,
		.pict-flow-node-port-labels-hover .pict-flow-port-label-bg {
			opacity: 0;
			transition: opacity 0.2s;
		}
		.pict-flow-node-port-labels-hover:hover .pict-flow-port-label,
		.pict-flow-node-port-labels-hover:hover .pict-flow-port-label-bg {
			opacity: 1;
		}

		/* Port-hint beziers — drawn from the badge to the actual dot
		   when an edge theme has rerouted the connection. Hidden by
		   default; PortRenderer / NodeView toggle data-active on hover. */
		.pict-flow-port-hint {
			fill: none;
			stroke: var(--pf-connection-stroke-hover, #3498db);
			stroke-width: 1.75;
			stroke-dasharray: 4 3;
			stroke-linecap: round;
			opacity: 0;
			pointer-events: none;
			transition: opacity 0.18s ease;
		}
		.pict-flow-port-hint[data-active="true"] {
			opacity: 0.7;
		}

		/* ── Layout-algorithm popup: tightened layout + form styling ── */
		.pict-flow-popup-layout-algorithm-row {
			display: flex;
			flex-direction: column;
			gap: 4px;
			padding: 6px 10px 4px;
		}
		.pict-flow-popup-layout-algorithm-row > .pict-flow-popup-settings-label {
			font-size: 10px;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 0.05em;
			opacity: 0.7;
			margin: 0;
		}
		.pict-flow-popup-layout-algorithm-controls {
			display: flex;
			align-items: stretch;
			gap: 4px;
		}
		.pict-flow-popup-layout-algorithm-select {
			flex: 1 1 auto;
			min-width: 0;
		}
		.pict-flow-popup-collapse-toggle {
			flex: 0 0 auto;
			width: 28px;
			padding: 0;
			border: 1px solid var(--pf-button-border, #ccc);
			border-radius: 3px;
			background: var(--pf-toolbar-bg, #fff);
			color: var(--pf-text-secondary, #5a6470);
			cursor: pointer;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			transition: background-color 0.15s, color 0.15s, border-color 0.15s;
		}
		.pict-flow-popup-collapse-toggle:hover {
			background-color: var(--pf-button-hover-bg, #eef);
			color: var(--pf-text-primary, #2c3e50);
		}
		/* "Open" state: pressed-in look so the user sees that the form
		   below is being driven by this gear. */
		.pict-flow-popup-collapse-toggle[aria-expanded="true"] {
			background-color: var(--pf-button-active-bg, #d6e4f0);
			color: var(--pf-text-primary, #2c3e50);
			border-color: var(--pf-button-hover-border, #3498db);
		}
		.pict-flow-popup-collapse-toggle svg {
			display: block;
		}
		/* Subordinate description text — sits under a control (algorithm
		   dropdown, edge-theme dropdown, etc.) and explains it. Indented
		   from the section's left edge with a faint left rule so the
		   visual hierarchy is unambiguous: SECTION LABEL > control >
		   description. */
		.pict-flow-popup-control-description {
			font-size: 11px;
			line-height: 1.4;
			color: var(--pf-text-secondary, #5a6470);
			padding: 4px 12px 8px 28px;
			margin-left: 14px;
			border-left: 2px solid var(--pf-divider-light, #e6e6e6);
		}

		/* The form host. Acts as the collapsible container around the
		   pict-section-form metacontroller's emitted markup. */
		.pict-flow-popup-layout-form-host {
			margin: 0 10px 8px;
			padding: 8px 10px;
			background: var(--pf-toolbar-bg, #fafafa);
			border: 1px solid var(--pf-button-border, #e0e0e0);
			border-radius: 6px;
			overflow: hidden;
			max-height: 600px;
			transition: max-height 0.22s ease, padding 0.22s ease,
			            margin 0.22s ease, border-color 0.22s ease, opacity 0.18s ease;
			opacity: 1;
		}
		.pict-flow-popup-layout-form-host[data-collapsed="true"] {
			max-height: 0;
			padding-top: 0;
			padding-bottom: 0;
			margin-top: 0;
			margin-bottom: 0;
			border-color: transparent;
			opacity: 0;
		}
		.pict-flow-popup-layout-form-host > div { width: 100%; }

		/* Form contents — make the auto-rendered sections look professional.
		   The section headings stay visible; the redundant per-section
		   "Group: Defaults" h3 is suppressed. */
		.pict-flow-popup-layout-form .pict-form-view {
			display: block;
		}
		.pict-flow-popup-layout-form .pict-form-section {
			margin: 0;
			padding: 0;
		}
		.pict-flow-popup-layout-form .pict-form-section h2 {
			font-size: 10px;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 0.05em;
			opacity: 0.6;
			margin: 8px 0 4px;
			padding: 0;
			border-bottom: 1px solid var(--pf-button-border, #e6e6e6);
			padding-bottom: 3px;
		}
		.pict-flow-popup-layout-form .pict-form-section:first-child h2,
		.pict-flow-popup-layout-form .pict-form-section h2:first-child {
			margin-top: 0;
		}
		/* Group headings ("Group: Defaults") are noise — every algorithm
		   has exactly one group right now. Hide them. */
		.pict-flow-popup-layout-form .pict-form-section h3 {
			display: none;
		}
		/* Each row of inputs lives in a flat <div> as alternating
		   <span>label</span><input> pairs. Lay them out in a balanced grid. */
		.pict-flow-popup-layout-form .pict-form-section > div > div {
			display: flex;
			flex-wrap: wrap;
			gap: 4px 14px;
			margin: 4px 0;
			align-items: center;
		}
		.pict-flow-popup-layout-form .pict-form-section span {
			font-size: 12px;
			color: var(--pf-text-primary, #2c3e50);
			line-height: 1.4;
			margin: 0;
		}
		.pict-flow-popup-layout-form input[type="number"],
		.pict-flow-popup-layout-form input[type="text"],
		.pict-flow-popup-layout-form select {
			width: 88px;
			padding: 2px 6px;
			border: 1px solid var(--pf-button-border, #ccc);
			border-radius: 3px;
			font-size: 12px;
			line-height: 1.3;
			background: #fff;
			color: var(--pf-text-primary, #2c3e50);
			margin-left: -8px; /* tighten gap between label and its input */
		}
		.pict-flow-popup-layout-form select {
			width: auto;
			min-width: 110px;
		}
		.pict-flow-popup-layout-form input[type="number"]:focus,
		.pict-flow-popup-layout-form input[type="text"]:focus,
		.pict-flow-popup-layout-form select:focus {
			outline: none;
			border-color: var(--pf-button-hover-border, #3498db);
			box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.15);
		}
		.pict-flow-popup-layout-form input[type="checkbox"] {
			margin: 0 4px 0 0;
		}
		`;
	}

	// ── Connections ────────────────────────────────────────────────────────
	/**
	 * CSS for connection paths: base, hover/selected states, hitarea, drag-connection.
	 * @returns {string}
	 */
	getConnectionCSS()
	{
		return /*css*/`
		/* Arrowhead markers use CSS-driven fills so they follow --pf-* tokens
		   (which in turn map to host --theme-color-* tokens). The polygon's
		   fill attribute is the fallback when CSS does not reach the marker. */
		.pict-flow-svg .pict-flow-arrowhead-default {
			fill: var(--pf-connection-stroke);
		}
		.pict-flow-svg .pict-flow-arrowhead-selected {
			fill: var(--pf-connection-selected-stroke);
		}
		.pict-flow-svg .pict-flow-arrowhead-tether {
			fill: var(--pf-connection-stroke);
		}
		.pict-flow-svg .pict-flow-arrowhead-event-in {
			fill: var(--pf-connection-event-in-stroke);
		}
		.pict-flow-svg .pict-flow-arrowhead-event-out {
			fill: var(--pf-connection-event-out-stroke);
		}
		.pict-flow-svg .pict-flow-arrowhead-setting {
			fill: var(--pf-connection-setting-stroke);
		}
		.pict-flow-svg .pict-flow-arrowhead-value {
			fill: var(--pf-connection-value-stroke);
		}
		.pict-flow-svg .pict-flow-arrowhead-error {
			fill: var(--pf-connection-error-stroke);
		}

		.pict-flow-connection {
			fill: none;
			stroke: var(--pf-connection-stroke);
			stroke-width: 2;
			cursor: pointer;
			transition: stroke 0.15s;
		}
		.pict-flow-connection:hover {
			stroke: var(--pf-connection-stroke-hover);
			stroke-width: 3;
		}
		.pict-flow-connection.selected {
			stroke: var(--pf-connection-selected-stroke);
			stroke-width: 3;
		}
		/* Connection type color overrides (based on source port type) */
		.pict-flow-connection.conn-type-event-in {
			stroke: var(--pf-connection-event-in-stroke);
		}
		.pict-flow-connection.conn-type-event-out {
			stroke: var(--pf-connection-event-out-stroke);
		}
		.pict-flow-connection.conn-type-setting {
			stroke: var(--pf-connection-setting-stroke);
		}
		.pict-flow-connection.conn-type-value {
			stroke: var(--pf-connection-value-stroke);
		}
		.pict-flow-connection.conn-type-error {
			stroke: var(--pf-connection-error-stroke);
		}
		.pict-flow-connection-hitarea {
			fill: none;
			stroke: transparent;
			stroke-width: 12;
			cursor: pointer;
		}
		.pict-flow-drag-connection {
			fill: none;
			stroke: var(--pf-node-selected-stroke);
			stroke-width: 2;
			stroke-dasharray: 6 3;
			pointer-events: none;
		}
		`;
	}

	// ── Connection Handles ─────────────────────────────────────────────────
	/**
	 * CSS for connection waypoint handles and midpoint handles.
	 * @returns {string}
	 */
	getHandleCSS()
	{
		return /*css*/`
		.pict-flow-connection-handle {
			fill: var(--pf-panel-bg);
			stroke: var(--pf-node-selected-stroke);
			stroke-width: 2;
			cursor: grab;
			transition: r 0.15s;
			filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
		}
		.pict-flow-connection-handle:hover {
			r: 8;
			stroke-width: 2.5;
		}
		.pict-flow-connection-handle-midpoint {
			fill: var(--pf-panel-bg);
			stroke: var(--pf-port-setting-fill);
			stroke-width: 2;
			cursor: grab;
			transition: r 0.15s;
			filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
		}
		.pict-flow-connection-handle-midpoint:hover {
			r: 8;
			stroke-width: 2.5;
		}
		`;
	}

	// ── Tethers ────────────────────────────────────────────────────────────
	/**
	 * CSS for tether lines, hitareas, handles, and midpoint handles.
	 * @returns {string}
	 */
	getTetherCSS()
	{
		return /*css*/`
		.pict-flow-tether-line {
			fill: none;
			stroke: var(--pf-connection-stroke);
			stroke-width: 1.5;
			stroke-dasharray: 6 4;
			pointer-events: visibleStroke;
			cursor: pointer;
		}
		.pict-flow-tether-line.selected {
			stroke: var(--pf-node-selected-stroke);
			stroke-width: 2;
		}
		.pict-flow-tether-hitarea {
			fill: none;
			stroke: transparent;
			stroke-width: 10;
			cursor: pointer;
		}
		.pict-flow-tether-handle {
			fill: var(--pf-panel-bg);
			stroke: var(--pf-node-selected-stroke);
			stroke-width: 2;
			cursor: grab;
			transition: r 0.15s;
			filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
		}
		.pict-flow-tether-handle:hover {
			r: 8;
			stroke-width: 2.5;
		}
		.pict-flow-tether-handle-midpoint {
			fill: var(--pf-panel-bg);
			stroke: var(--pf-port-setting-fill);
			stroke-width: 2;
			cursor: grab;
			transition: r 0.15s;
			filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
		}
		.pict-flow-tether-handle-midpoint:hover {
			r: 8;
			stroke-width: 2.5;
		}
		`;
	}

	// ── Panels ─────────────────────────────────────────────────────────────
	/**
	 * CSS for property panels: foreign object, panel container, titlebar, close button, body, indicator.
	 * @returns {string}
	 */
	getPanelCSS()
	{
		return /*css*/`
		.pict-flow-node-panel-indicator {
			fill: var(--pf-node-selected-stroke);
			stroke: none;
			opacity: 0.6;
			cursor: pointer;
			transition: opacity 0.15s;
		}
		.pict-flow-node-panel-indicator:hover {
			opacity: 1.0;
		}
		.pict-flow-panel-foreign-object {
			overflow: visible;
		}
		.pict-flow-panel {
			background: var(--pf-panel-bg);
			border: 1px solid var(--pf-panel-border);
			border-radius: var(--pf-panel-radius);
			box-shadow: var(--pf-panel-shadow);
			display: flex;
			flex-direction: column;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			font-size: 13px;
			overflow: hidden;
			width: 100%;
			height: 100%;
			box-sizing: border-box;
		}
		.pict-flow-panel-titlebar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 8px 12px;
			background: var(--pf-panel-titlebar-bg);
			border-bottom: 1px solid var(--pf-panel-titlebar-border);
			cursor: grab;
			user-select: none;
			-webkit-user-select: none;
			flex-shrink: 0;
		}
		.pict-flow-panel-titlebar.dragging {
			cursor: grabbing;
		}
		.pict-flow-panel-title-text {
			font-weight: 600;
			font-size: 12px;
			color: var(--pf-panel-title-color);
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			letter-spacing: 0.1px;
		}
		.pict-flow-panel-close-btn {
			cursor: pointer;
			color: var(--pf-button-close-color);
			font-size: 14px;
			line-height: 1;
			padding: 4px;
			border: none;
			background: none;
			border-radius: 4px;
			transition: background-color 0.15s, color 0.15s;
		}
		.pict-flow-panel-close-btn:hover {
			color: var(--pf-button-danger-text);
			background-color: rgba(231, 76, 60, 0.08);
		}
		.pict-flow-panel-content {
			flex: 1;
			overflow-y: auto;
			min-height: 0;
			padding: 0;
		}
		.pict-flow-panel-tab-pane {
			padding: 10px 12px;
			box-sizing: border-box;
		}
		`;
	}

	// ── Info Panels ────────────────────────────────────────────────────────
	/**
	 * CSS for the info/hover panel and all sub-elements: header, description, badges, sections, ports.
	 * @returns {string}
	 */
	getInfoPanelCSS()
	{
		return /*css*/`
		.pict-flow-info-panel {
			padding: 2px 0;
			font-size: 12px;
			line-height: 1.5;
			color: var(--pf-text-primary);
		}
		.pict-flow-info-panel-header {
			font-size: 13px;
			font-weight: 600;
			margin-bottom: 6px;
			color: var(--pf-text-heading);
		}
		.pict-flow-info-panel-header.with-icon {
			font-size: 14px;
			display: flex;
			align-items: center;
			gap: 6px;
		}
		.pict-flow-info-panel-description {
			font-size: 11px;
			color: var(--pf-text-secondary);
			margin-bottom: 10px;
			line-height: 1.45;
		}
		.pict-flow-info-panel-badges {
			margin-bottom: 10px;
			display: flex;
			flex-wrap: wrap;
			gap: 4px;
		}
		.pict-flow-info-panel-badge {
			display: inline-block;
			padding: 2px 8px;
			border-radius: 4px;
			font-size: 10px;
		}
		.pict-flow-info-panel-badge.category {
			background: var(--pf-badge-category-bg);
			color: var(--pf-badge-category-text);
		}
		.pict-flow-info-panel-badge.code {
			background: var(--pf-badge-code-bg);
			color: var(--pf-badge-code-text);
			font-family: "SF Mono", "Fira Code", monospace;
		}
		.pict-flow-info-panel-section {
			margin-bottom: 8px;
		}
		.pict-flow-info-panel-section-title {
			font-size: 10px;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			color: var(--pf-text-tertiary);
			margin-bottom: 4px;
			padding-bottom: 2px;
			border-bottom: 1px solid var(--pf-divider-light);
		}
		.pict-flow-info-panel-port {
			padding: 3px 8px;
			background: var(--pf-port-item-bg);
			margin-bottom: 3px;
			font-size: 11px;
			border-radius: 3px;
		}
		.pict-flow-info-panel-port.input {
			border-left: 3px solid var(--pf-port-input-fill);
		}
		.pict-flow-info-panel-port.output {
			border-left: 3px solid var(--pf-port-output-fill);
		}
		/* Info panel port type color overrides */
		.pict-flow-info-panel-port.port-type-event-in {
			border-left-color: var(--pf-port-event-in-fill);
		}
		.pict-flow-info-panel-port.port-type-event-out {
			border-left-color: var(--pf-port-event-out-fill);
		}
		.pict-flow-info-panel-port.port-type-setting {
			border-left-color: var(--pf-port-setting-fill);
		}
		.pict-flow-info-panel-port.port-type-value {
			border-left-color: var(--pf-port-value-fill);
		}
		.pict-flow-info-panel-port.port-type-error {
			border-left-color: var(--pf-port-error-fill);
		}
		.pict-flow-info-panel-port-constraint {
			color: var(--pf-text-tertiary);
			font-size: 10px;
		}
		/* Port summary section appended below form panels */
		.pict-flow-port-summary {
			margin-top: 12px;
			padding-top: 8px;
			border-top: 1px solid var(--pf-divider-medium);
		}
		.pict-flow-info-panel-port.event {
			border-left: 3px solid var(--pf-port-event-in-fill);
		}
		.pict-flow-info-panel-port.value {
			border-left: 3px solid var(--pf-port-value-fill);
		}
		`;
	}

	// ── Node Properties Editor ────────────────────────────────────────────
	/**
	 * CSS for the node properties editor fields used in the Appearance tab.
	 * @returns {string}
	 */
	getNodePropsEditorCSS()
	{
		return /*css*/`
		.pict-flow-node-props-fields {
			display: flex;
			flex-direction: column;
			gap: 6px;
		}
		.pict-flow-node-props-field {
			display: flex;
			align-items: center;
			gap: 8px;
		}
		.pict-flow-node-props-label {
			font-size: 11px;
			color: var(--pf-text-secondary);
			min-width: 72px;
			flex-shrink: 0;
		}
		.pict-flow-node-props-input {
			flex: 1;
			padding: 3px 6px;
			border: 1px solid var(--pf-input-border);
			border-radius: 3px;
			font-size: 11px;
			outline: none;
			box-sizing: border-box;
			min-width: 0;
		}
		.pict-flow-node-props-input:focus {
			border-color: var(--pf-input-border-focus);
		}
		.pict-flow-node-props-color {
			width: 28px;
			height: 24px;
			padding: 1px;
			cursor: pointer;
			flex: 0 0 28px;
		}

		/* Suppress native number-input spinner buttons on every input
		   inside a properties panel. Panels live inside <foreignObject>;
		   browsers (Chromium / WebKit) render the up/down spinner chrome
		   as native overlays that don't always respect SVG transforms or
		   the parent tab pane's display:none — leaving stale spinner
		   artifacts hanging around when the user switches tabs or pans
		   the diagram. The user can still type numbers; they just don't
		   get clickable spinners. (If we ever want spinners back, build
		   them as real DOM elements next to the input, not native chrome.) */
		.pict-flow-panel input[type="number"] {
			-moz-appearance: textfield;
			appearance: textfield;
		}
		.pict-flow-panel input[type="number"]::-webkit-outer-spin-button,
		.pict-flow-panel input[type="number"]::-webkit-inner-spin-button {
			-webkit-appearance: none;
			appearance: none;
			margin: 0;
		}
		`;
	}

	// ── Panel Tabs & Resize ───────────────────────────────────────────────
	/**
	 * CSS for the tab bar, tab panes, resize handle, and help content.
	 * @returns {string}
	 */
	getPanelTabsCSS()
	{
		return /*css*/`
		.pict-flow-panel-resize-handle {
			height: 6px;
			cursor: ns-resize;
			background: transparent;
			flex-shrink: 0;
			transition: background-color 0.15s;
			border-top: 1px solid var(--pf-panel-titlebar-border);
			display: flex;
			align-items: center;
			justify-content: center;
		}
		.pict-flow-panel-resize-handle::after {
			content: '';
			width: 24px;
			height: 2px;
			border-radius: 1px;
			background: var(--pf-resize-handle-hover);
			transition: background-color 0.15s, width 0.15s;
		}
		.pict-flow-panel-resize-handle:hover::after {
			background: var(--pf-button-hover-border);
			width: 32px;
		}
		.pict-flow-panel-tabbar {
			display: flex;
			flex-shrink: 0;
			border-top: 1px solid var(--pf-panel-titlebar-border);
			background: var(--pf-panel-titlebar-bg);
		}
		.pict-flow-panel-tab {
			flex: 1;
			padding: 5px 8px;
			font-size: 11px;
			text-align: center;
			cursor: pointer;
			color: var(--pf-tab-text);
			border-top: 2px solid transparent;
			transition: color 0.15s, border-top-color 0.15s;
			user-select: none;
			-webkit-user-select: none;
		}
		.pict-flow-panel-tab:hover {
			color: var(--pf-tab-text-hover);
		}
		.pict-flow-panel-tab.active {
			border-top-color: var(--pf-node-selected-stroke);
			color: var(--pf-panel-title-color);
			font-weight: 600;
		}
		.pict-flow-panel-help-content {
			font-size: 12px;
			line-height: 1.5;
			color: var(--pf-text-primary);
		}
		.pict-flow-panel-help-content p {
			margin: 0 0 8px 0;
		}
		`;
	}

	// ── Fullscreen ─────────────────────────────────────────────────────────
	/**
	 * CSS for fullscreen mode.
	 * @returns {string}
	 */
	getFullscreenCSS()
	{
		return /*css*/`
		.pict-flow-fullscreen {
			position: fixed;
			top: 0;
			left: 0;
			width: 100vw;
			height: 100vh;
			z-index: 9999;
			border-radius: 0;
			border: none;
			min-height: 100vh;
		}
		.pict-flow-fullscreen .pict-flow-svg {
			min-height: calc(100vh - 50px);
		}
		`;
	}

	// ── Toolbar ────────────────────────────────────────────────────────────
	/**
	 * CSS for the toolbar: buttons, groups, labels, selects.
	 * @returns {string}
	 */
	getToolbarCSS()
	{
		return /*css*/`
		.pict-flow-toolbar {
			display: flex;
			align-items: center;
			gap: 0.5em;
			padding: 0.5em 0.75em;
			background-color: var(--pf-toolbar-bg);
			border-bottom: 1px solid var(--pf-toolbar-border);
			flex-wrap: wrap;
		}
		.pict-flow-toolbar-group {
			display: flex;
			align-items: center;
			gap: 0.25em;
			padding-right: 0.75em;
			border-right: 1px solid var(--pf-toolbar-border);
		}
		.pict-flow-toolbar-group:last-child {
			border-right: none;
			padding-right: 0;
		}
		.pict-flow-toolbar-btn {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: 0.35em;
			padding: 0.35em 0.65em;
			border: 1px solid var(--pf-button-border);
			border-radius: 4px;
			background-color: var(--pf-toolbar-bg);
			color: var(--pf-text-primary);
			font-size: 0.85em;
			cursor: pointer;
			transition: background-color 0.15s, border-color 0.15s;
			user-select: none;
			-webkit-user-select: none;
		}
		.pict-flow-toolbar-btn:focus {
			outline: none;
		}
		.pict-flow-toolbar-btn:hover {
			background-color: var(--pf-button-hover-bg);
			border-color: var(--pf-button-hover-border);
		}
		.pict-flow-toolbar-btn:active {
			background-color: var(--pf-button-active-bg);
		}
		.pict-flow-toolbar-btn-icon {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			line-height: 1;
		}
		.pict-flow-toolbar-btn-icon svg {
			display: block;
		}
		.pict-flow-toolbar-btn-text {
			white-space: nowrap;
		}
		.pict-flow-toolbar-btn-chevron {
			display: inline-flex;
			align-items: center;
			margin-left: 0.15em;
		}
		/* Split button — visible as one connected unit; the two halves
		   route to different actions. Used for "Auto" so clicking the
		   icon/text applies the current layout while the chevron half
		   opens the algorithm popup with a generous hit area. */
		.pict-flow-toolbar-btn-split {
			display: inline-flex;
			align-items: stretch;
		}
		.pict-flow-toolbar-btn-split-main {
			border-top-right-radius: 0;
			border-bottom-right-radius: 0;
			border-right: 1px solid var(--pf-button-border);
			margin-right: -1px; /* collapse the seam between the two buttons */
		}
		.pict-flow-toolbar-btn-split-chevron {
			border-top-left-radius: 0;
			border-bottom-left-radius: 0;
			padding-left: 0.55em;
			padding-right: 0.55em;
		}
		.pict-flow-toolbar-btn-split-chevron .pict-flow-toolbar-btn-chevron {
			margin: 0;
		}
		.pict-flow-toolbar-right {
			margin-left: auto;
			border-right: none;
			padding-right: 0;
		}
		.pict-flow-toolbar-label {
			font-size: 0.8em;
			color: var(--pf-text-secondary);
			margin-right: 0.25em;
		}
		.pict-flow-toolbar-select {
			padding: 0.3em 0.5em;
			border: 1px solid var(--pf-button-border);
			border-radius: 4px;
			font-size: 0.85em;
			background-color: var(--pf-toolbar-bg);
			color: var(--pf-text-primary);
		}
		`;
	}

	// ── Card Palette ───────────────────────────────────────────────────────
	/**
	 * CSS for the card palette: toggle, body, categories, cards, swatches.
	 * @returns {string}
	 */
	getPaletteCSS()
	{
		return /*css*/`
		.pict-flow-palette-category {
			margin-bottom: 0.5em;
		}
		.pict-flow-palette-category:last-child {
			margin-bottom: 0;
		}
		.pict-flow-palette-category-label {
			font-size: 0.7em;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 0.05em;
			color: var(--pf-text-placeholder);
			margin-bottom: 0.35em;
			padding-bottom: 0.2em;
			border-bottom: 1px solid var(--pf-divider-light);
		}
		.pict-flow-palette-cards {
			display: flex;
			flex-wrap: wrap;
			gap: 0.35em;
		}
		.pict-flow-palette-card {
			display: inline-flex;
			align-items: center;
			gap: 0.35em;
			padding: 0.35em 0.6em;
			border: 1px solid var(--pf-card-border);
			border-radius: 4px;
			background-color: var(--pf-panel-bg);
			font-size: 0.8em;
			cursor: pointer;
			transition: background-color 0.15s, border-color 0.15s, box-shadow 0.15s;
			user-select: none;
			-webkit-user-select: none;
			position: relative;
		}
		.pict-flow-palette-card:hover {
			background-color: var(--pf-card-hover-bg);
			border-color: var(--pf-node-selected-stroke);
			box-shadow: var(--pf-card-hover-shadow);
		}
		.pict-flow-palette-card.disabled {
			opacity: 0.45;
			pointer-events: none;
			cursor: default;
		}
		.pict-flow-palette-card-icon {
			font-size: 1.1em;
			line-height: 1;
		}
		.pict-flow-palette-card-swatch {
			width: 10px;
			height: 10px;
			border-radius: 2px;
			flex-shrink: 0;
		}
		.pict-flow-palette-card-title {
			font-weight: 500;
			color: var(--pf-text-primary);
			white-space: nowrap;
		}
		.pict-flow-palette-card-code {
			font-size: 0.8em;
			color: var(--pf-text-placeholder);
			font-family: monospace;
		}
		.pict-flow-toolbar-select.layout-select {
			min-width: 120px;
			max-width: 200px;
		}
		`;
	}

	// ── Popups ────────────────────────────────────────────────────────────
	/**
	 * CSS for toolbar dropdown popups (Add Node, Cards, Layout).
	 * @returns {string}
	 */
	getPopupCSS()
	{
		return /*css*/`
		.pict-flow-toolbar-popup-anchor {
			position: relative;
		}
		.pict-flow-toolbar-popup {
			position: absolute;
			z-index: 1000;
			background: var(--pf-panel-bg);
			border: 1px solid var(--pf-card-border);
			border-radius: 6px;
			box-shadow: 0 4px 16px rgba(0,0,0,0.12);
			min-width: 240px;
			max-height: 80vh;
			overflow-y: auto;
			padding: 0.35em 0;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			font-size: 13px;
		}
		.pict-flow-popup-search-wrapper {
			position: relative;
			padding: 0.4em 0.5em;
			border-bottom: 1px solid var(--pf-divider-light);
		}
		.pict-flow-popup-search-icon {
			position: absolute;
			left: 0.85em;
			top: 50%;
			transform: translateY(-50%);
			pointer-events: none;
			line-height: 1;
			display: flex;
			align-items: center;
		}
		.pict-flow-popup-search {
			width: 100%;
			padding: 0.4em 0.5em 0.4em 2em;
			border: 1px solid var(--pf-input-border);
			border-radius: 4px;
			font-size: 0.9em;
			outline: none;
			box-sizing: border-box;
		}
		.pict-flow-popup-search:focus {
			border-color: var(--pf-input-border-focus);
		}
		.pict-flow-popup-list-item {
			display: flex;
			align-items: center;
			gap: 0.5em;
			padding: 0.45em 0.75em;
			cursor: pointer;
			transition: background-color 0.1s;
		}
		.pict-flow-popup-list-item:hover {
			background-color: var(--pf-card-hover-bg);
		}
		.pict-flow-popup-list-item-icon {
			display: inline-flex;
			align-items: center;
			flex-shrink: 0;
			line-height: 1;
		}
		.pict-flow-popup-list-item-label {
			flex: 1;
			color: var(--pf-text-primary);
			font-weight: 500;
		}
		.pict-flow-popup-list-item-code {
			font-size: 0.8em;
			color: var(--pf-text-placeholder);
			font-family: monospace;
			background: var(--pf-badge-category-bg);
			padding: 0.1em 0.4em;
			border-radius: 3px;
		}
		.pict-flow-popup-divider {
			height: 1px;
			background: var(--pf-divider-light);
			margin: 0.25em 0;
		}
		.pict-flow-popup-list-empty {
			text-align: center;
			color: var(--pf-text-placeholder);
			padding: 1.5em 0.75em;
			font-size: 0.9em;
		}
		.pict-flow-popup-layout-save {
			display: flex;
			align-items: center;
			gap: 0.5em;
			padding: 0.45em 0.75em;
			cursor: pointer;
			transition: background-color 0.1s;
			color: var(--pf-text-primary);
			font-weight: 500;
		}
		.pict-flow-popup-layout-save:hover {
			background-color: var(--pf-card-hover-bg);
		}
		.pict-flow-popup-layout-save-icon {
			display: inline-flex;
			align-items: center;
			flex-shrink: 0;
			line-height: 1;
		}
		.pict-flow-popup-layout-save-input-row {
			display: flex;
			align-items: center;
			gap: 0.35em;
			padding: 0.35em 0.5em;
		}
		.pict-flow-popup-layout-save-input {
			flex: 1;
			padding: 0.35em 0.5em;
			border: 1px solid var(--pf-input-border);
			border-radius: 4px;
			font-size: 0.9em;
			outline: none;
			box-sizing: border-box;
		}
		.pict-flow-popup-layout-save-input:focus {
			border-color: var(--pf-input-border-focus);
		}
		.pict-flow-popup-layout-save-confirm {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: 28px;
			height: 28px;
			border: 1px solid var(--pf-input-border);
			border-radius: 4px;
			background: var(--pf-panel-bg);
			cursor: pointer;
			flex-shrink: 0;
			transition: background-color 0.15s, border-color 0.15s;
			line-height: 1;
		}
		.pict-flow-popup-layout-save-confirm:hover {
			background-color: var(--pf-card-hover-bg);
			border-color: var(--pf-input-border-focus);
		}
		.pict-flow-popup-layout-row {
			display: flex;
			align-items: center;
			padding: 0.45em 0.75em;
			cursor: pointer;
			transition: background-color 0.1s;
		}
		.pict-flow-popup-layout-row:hover {
			background-color: var(--pf-card-hover-bg);
		}
		.pict-flow-popup-layout-name {
			flex: 1;
			color: var(--pf-text-primary);
		}
		.pict-flow-popup-layout-delete {
			display: none;
			align-items: center;
			justify-content: center;
			border: none;
			background: none;
			color: var(--pf-button-danger-text);
			cursor: pointer;
			padding: 2px 4px;
			border-radius: 3px;
			line-height: 1;
		}
		.pict-flow-popup-layout-row:hover .pict-flow-popup-layout-delete {
			display: inline-flex;
		}
		.pict-flow-popup-layout-delete:hover {
			background-color: var(--pf-button-danger-hover-bg);
		}
		.pict-flow-popup-settings-section {
			padding: 0.5em 0.75em;
		}
		.pict-flow-popup-settings-label {
			display: block;
			font-size: 0.8em;
			font-weight: 600;
			color: var(--pf-text-secondary);
			text-transform: uppercase;
			letter-spacing: 0.05em;
			margin-bottom: 0.35em;
		}
		.pict-flow-popup-settings-select {
			width: 100%;
			padding: 0.4em 0.5em;
			border: 1px solid var(--pf-input-border);
			border-radius: 4px;
			font-size: 0.9em;
			background: var(--pf-panel-bg);
			color: var(--pf-text-primary);
			cursor: pointer;
			outline: none;
			box-sizing: border-box;
		}
		.pict-flow-popup-settings-select:focus {
			border-color: var(--pf-input-border-focus);
		}
		.pict-flow-popup-settings-slider-row {
			display: flex;
			align-items: center;
			gap: 0.5em;
		}
		.pict-flow-popup-settings-slider {
			flex: 1;
			-webkit-appearance: none;
			appearance: none;
			height: 4px;
			background: var(--pf-input-border);
			border-radius: 2px;
			outline: none;
			cursor: pointer;
		}
		.pict-flow-popup-settings-slider::-webkit-slider-thumb {
			-webkit-appearance: none;
			appearance: none;
			width: 14px;
			height: 14px;
			background: var(--pf-node-selected-stroke);
			border-radius: 50%;
			cursor: pointer;
		}
		.pict-flow-popup-settings-slider::-moz-range-thumb {
			width: 14px;
			height: 14px;
			background: var(--pf-node-selected-stroke);
			border-radius: 50%;
			cursor: pointer;
			border: none;
		}
		.pict-flow-popup-settings-slider-value {
			font-size: 0.85em;
			color: var(--pf-text-secondary);
			min-width: 2.5em;
			text-align: right;
		}
		`;
	}

	// ── Collapsed Toolbar ─────────────────────────────────────────────────
	/**
	 * CSS for the collapsed toolbar state (small expand button in corner).
	 * @returns {string}
	 */
	getCollapsedToolbarCSS()
	{
		return /*css*/`
		.pict-flow-toolbar-collapsed {
			position: absolute;
			top: 8px;
			right: 8px;
			z-index: 100;
			display: none;
		}
		.pict-flow-toolbar-collapsed.visible {
			display: block;
		}
		.pict-flow-toolbar-expand-btn {
			width: 36px;
			height: 36px;
			border-radius: 6px;
			border: 1px solid var(--pf-card-border);
			background-color: var(--pf-toolbar-bg);
			box-shadow: 0 2px 6px rgba(0,0,0,0.1);
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: background-color 0.15s, box-shadow 0.15s;
		}
		.pict-flow-toolbar-expand-btn:hover {
			background-color: var(--pf-button-hover-bg);
			box-shadow: 0 2px 8px rgba(0,0,0,0.15);
		}
		`;
	}

	// ── Floating Toolbar ──────────────────────────────────────────────────
	/**
	 * CSS for the floating draggable toolbar.
	 * @returns {string}
	 */
	getFloatingToolbarCSS()
	{
		return /*css*/`
		.pict-flow-floating-toolbar {
			position: absolute;
			z-index: 100;
			display: flex;
			flex-direction: column;
			gap: 2px;
			padding: 4px;
			border-radius: 8px;
			border: 1px solid var(--pf-card-border);
			background-color: var(--pf-toolbar-bg);
			box-shadow: 0 4px 16px rgba(0,0,0,0.12);
			pointer-events: auto;
		}
		.pict-flow-floating-grip {
			cursor: grab;
			padding: 4px;
			border-radius: 4px;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: background-color 0.15s;
		}
		.pict-flow-floating-grip:hover {
			background-color: var(--pf-button-hover-bg);
		}
		.pict-flow-floating-grip:active {
			cursor: grabbing;
		}
		.pict-flow-floating-btn {
			width: 32px;
			height: 32px;
			border: none;
			border-radius: 4px;
			background-color: transparent;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: background-color 0.15s;
		}
		.pict-flow-floating-btn:focus {
			outline: none;
		}
		.pict-flow-floating-btn:hover {
			background-color: var(--pf-button-hover-bg);
		}
		.pict-flow-floating-separator {
			height: 1px;
			background-color: var(--pf-divider-light);
			margin: 2px 4px;
		}
		/* Collapsed floating toolbar — grip-only draggable square */
		.pict-flow-floating-toolbar.collapsed .pict-flow-floating-btn,
		.pict-flow-floating-toolbar.collapsed .pict-flow-floating-separator {
			display: none;
		}
		.pict-flow-floating-toolbar.collapsed {
			padding: 0;
			border-radius: 6px;
		}
		.pict-flow-floating-toolbar.collapsed .pict-flow-floating-grip {
			width: 32px;
			height: 32px;
			padding: 0;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		.pict-flow-floating-toolbar.collapsed .pict-flow-floating-grip span {
			display: flex;
			align-items: center;
			justify-content: center;
			line-height: 1;
		}
		`;
	}

	// ── Icons ─────────────────────────────────────────────────────────────
	/**
	 * CSS for inline SVG icons in palette cards, toolbar buttons, info panel headers, and panel close buttons.
	 * @returns {string}
	 */
	getIconCSS()
	{
		return /*css*/`
		.pict-flow-icon-svg {
			pointer-events: none;
		}
		.pict-flow-palette-card-icon svg {
			display: inline-block;
			vertical-align: middle;
		}
		.pict-flow-toolbar-btn-icon {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			line-height: 1;
		}
		.pict-flow-toolbar-btn-icon svg {
			display: block;
			vertical-align: middle;
		}
		.pict-flow-info-panel-header.with-icon svg {
			display: inline-block;
			vertical-align: middle;
			margin-right: 4px;
		}
		.pict-flow-panel-close-icon {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			line-height: 1;
		}
		.pict-flow-panel-close-icon svg {
			display: block;
		}
		.pict-flow-palette-toggle-arrow svg {
			display: block;
		}
		`;
	}

	// ── Bracket Node CSS ──────────────────────────────────────────────────
	/**
	 * CSS for bracket-style node bodies used by sketch/blueprint themes.
	 *
	 * The bracket fill rects share class `.pict-flow-node-body` for fill
	 * inheritance, so these rules must use parent-qualified selectors
	 * (specificity ≥ 0,2,0) to override the base, variant, hover, and
	 * selected rules that set stroke and rx/ry on `.pict-flow-node-body`.
	 *
	 * @returns {string}
	 */
	getBracketNodeCSS()
	{
		return /*css*/`
		/* Bracket outline path */
		.pict-flow-node-bracket {
			fill: none;
			stroke: var(--pf-node-body-stroke);
			stroke-width: 2;
			stroke-linecap: round;
			stroke-linejoin: round;
		}
		.pict-flow-node.selected .pict-flow-node-bracket {
			stroke: var(--pf-node-selected-stroke);
			stroke-width: 2;
		}
		.pict-flow-node:hover .pict-flow-node-bracket {
			stroke: var(--pf-node-body-stroke-hover);
			stroke-width: 1.5;
		}

		/* Bracket fill rects: no stroke, no rounded corners.
		   Uses parent-qualified selectors to beat variant rules
		   (e.g. .pict-flow-node-start .pict-flow-node-body). */
		.pict-flow-node .pict-flow-node-bracket-fill,
		.pict-flow-node .pict-flow-node-bracket-title-fill {
			stroke: none;
			stroke-width: 0;
			rx: 0;
			ry: 0;
		}
		/* Beat hover rule: .pict-flow-node:hover .pict-flow-node-body */
		.pict-flow-node:hover .pict-flow-node-bracket-fill,
		.pict-flow-node:hover .pict-flow-node-bracket-title-fill {
			stroke: none;
			stroke-width: 0;
		}
		/* Beat selected rule: .pict-flow-node.selected .pict-flow-node-body */
		.pict-flow-node.selected .pict-flow-node-bracket-fill,
		.pict-flow-node.selected .pict-flow-node-bracket-title-fill {
			stroke: none;
			stroke-width: 0;
		}
		`;
	}

	// ── Aggregate Methods ──────────────────────────────────────────────────

	/**
	 * Concatenate all domain CSS getters into a single CSS string.
	 * Includes theme overrides if a theme provider is active.
	 * @returns {string}
	 */
	generateCSS()
	{
		let tmpBaseCSS = (
			this.getContainerCSS() +
			this.getNodeCSS() +
			this.getBodyContentCSS() +
			this.getNodeVariantCSS() +
			this.getPortCSS() +
			this.getConnectionCSS() +
			this.getHandleCSS() +
			this.getTetherCSS() +
			this.getPanelCSS() +
			this.getInfoPanelCSS() +
			this.getNodePropsEditorCSS() +
			this.getPanelTabsCSS() +
			this.getBracketNodeCSS() +
			this.getFullscreenCSS() +
			this.getToolbarCSS() +
			this.getPaletteCSS() +
			this.getPopupCSS() +
			this.getCollapsedToolbarCSS() +
			this.getFloatingToolbarCSS() +
			this.getIconCSS()
		);

		// Apply theme overrides if a theme provider exists
		if (this._FlowView && this._FlowView._ThemeProvider)
		{
			let tmpTheme = this._FlowView._ThemeProvider.getActiveTheme();
			if (tmpTheme && tmpTheme.CSSVariables && Object.keys(tmpTheme.CSSVariables).length > 0)
			{
				let tmpOverrides = '.pict-flow-container {\n';
				for (let tmpKey in tmpTheme.CSSVariables)
				{
					tmpOverrides += '\t' + tmpKey + ': ' + tmpTheme.CSSVariables[tmpKey] + ';\n';
				}
				tmpOverrides += '}\n';
				tmpBaseCSS += tmpOverrides;
			}
			if (tmpTheme && tmpTheme.AdditionalCSS)
			{
				tmpBaseCSS += tmpTheme.AdditionalCSS;
			}
		}

		return tmpBaseCSS;
	}

	/**
	 * Register all flow CSS with pict's CSSMap service.
	 * Uses correct parameter ordering: (hash, content, priority, provider).
	 * Removes existing CSS first to allow theme re-registration,
	 * then re-injects into the DOM.
	 */
	registerCSS()
	{
		if (this.fable && this.fable.CSSMap)
		{
			// Remove existing CSS first so we can re-register with updated theme overrides
			this.fable.CSSMap.removeCSS('PictSectionFlow-CSS');
			this.fable.CSSMap.addCSS('PictSectionFlow-CSS', this.generateCSS(), 500, 'PictProviderFlowCSS');
			// Re-inject into the DOM to apply the updated CSS
			this.fable.CSSMap.injectCSS();
		}
		else
		{
			this.log.warn('PictProviderFlowCSS: CSSMap not available; CSS not registered.');
		}
	}

	/**
	 * Register the active renderer's CSS overrides (GeometryCSS + AdditionalCSS).
	 *
	 * The renderer's CSS is registered at priority 501 — one higher than the
	 * base container CSS — so its `.pict-flow-container { --pf-*: ... }`
	 * declarations win the cascade against the equally-specific defaults in
	 * `generateCSS()`. Called by PictView-Flow.setRenderer() after the
	 * Flow-Renderer provider switches its active renderer.
	 *
	 * @param {Object} pRenderer - the active renderer definition (from PictProviderFlowRenderer)
	 */
	registerRendererCSS(pRenderer)
	{
		if (!this.fable || !this.fable.CSSMap) { return; }
		this.fable.CSSMap.removeCSS('PictSectionFlow-Renderer-CSS');
		if (!pRenderer) { this.fable.CSSMap.injectCSS(); return; }

		let tmpCSS = '';
		if (pRenderer.GeometryCSS)   { tmpCSS += pRenderer.GeometryCSS;   }
		if (pRenderer.AdditionalCSS) { tmpCSS += '\n' + pRenderer.AdditionalCSS; }
		if (tmpCSS.trim().length === 0) { this.fable.CSSMap.injectCSS(); return; }

		this.fable.CSSMap.addCSS('PictSectionFlow-Renderer-CSS', tmpCSS, 501, 'PictProviderFlowCSS');
		this.fable.CSSMap.injectCSS();
	}
}

module.exports = PictProviderFlowCSS;

module.exports.default_configuration = _ProviderConfiguration;
