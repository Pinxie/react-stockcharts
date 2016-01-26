"use strict";

import React from "react";

import AxisTicks from "./AxisTicks";
import AxisLine from "./AxisLine";

//TODO REFACTOR
function d3_scaleExtent(domain) {
	var start = domain[0], stop = domain[domain.length - 1];
	return start < stop ? [start, stop] : [stop, start];
}

function d3_scaleRange(scale) {
	return scale.rangeExtent ? scale.rangeExtent() : d3_scaleExtent(scale.range());
}


class Axis extends React.Component {
	constructor(props) {
		super(props);
		this.drawOnCanvas = this.drawOnCanvas.bind(this);
	}
	componentWillMount() {
		this.componentWillReceiveProps(this.props, this.context);
	}
	componentWillReceiveProps(nextProps, nextContext) {
		var { margin, chartId, canvasOriginX, canvasOriginY } = nextContext;
		var draw = Axis.drawOnCanvasStatic.bind(null, margin, nextProps, [canvasOriginX, canvasOriginY]);

		nextContext.callbackForCanvasDraw({
			chartId: chartId,
			type: "axis",
			draw: draw,
		});
	}
	componentDidMount() {
		if (this.context.chartCanvasType !== "svg" && this.context.getCanvasContexts !== undefined) {
			var contexts = this.context.getCanvasContexts();
			if (contexts) this.drawOnCanvas(contexts.axes);
		}
	}
	componentDidUpdate() {
		this.componentDidMount();
	}
	drawOnCanvas(ctx) {
		var { chartData, margin, canvasOriginX, canvasOriginY } = this.context;
		var { scale } = this.props;
		Axis.drawOnCanvasStatic(margin, this.props, [canvasOriginX, canvasOriginY], ctx, chartData, scale, scale);
	}

	render() {
		if (this.context.chartCanvasType !== "svg") return null;

		var domain = this.props.showDomain
			? <AxisLine {...this.props} />
			: null;
		var ticks = this.props.showTicks
			? <AxisTicks {...this.props} />
			: null;
		var className = "";
		if (this.props.className) className = this.props.defaultClassName.concat(this.props.className);
		return (
			<g className={className}
				transform={`translate(${ this.props.transform[0] }, ${ this.props.transform[1] })`}>
				{ticks}
				{domain}
			</g>
		);
	}
}

Axis.propTypes = {
	className: React.PropTypes.string.isRequired,
	defaultClassName: React.PropTypes.string.isRequired,
	transform: React.PropTypes.arrayOf(Number).isRequired,
	orient: React.PropTypes.oneOf(["top", "bottom", "left", "right"]).isRequired,
	innerTickSize: React.PropTypes.number,
	outerTickSize: React.PropTypes.number,
	tickFormat: React.PropTypes.func,
	tickPadding: React.PropTypes.number,
	tickSize: React.PropTypes.number,
	ticks: React.PropTypes.array,
	tickValues: React.PropTypes.array,
	scale: React.PropTypes.func.isRequired,
	showDomain: React.PropTypes.bool.isRequired,
	showTicks: React.PropTypes.bool.isRequired,
	fontFamily: React.PropTypes.string,
	fontSize: React.PropTypes.number.isRequired,
	axisName: React.PropTypes.string,
	axisNameOffset : React.PropTypes.number,
	axisNameFontFamily : React.PropTypes.string,
	axisNameFontSize : React.PropTypes.number,
	axisNameMaxSize: React.PropTypes.number
};

Axis.defaultProps = {
	defaultClassName: "react-stockcharts-axis ",
	showDomain: true,
	showTicks: true,
	fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
	fontSize: 12,
	axisNameFontSize : 10,
	axisNameOffset : 20,
	axisNameFontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
	axisNameMaxSize: 1000
};

Axis.contextTypes = {
	getCanvasContexts: React.PropTypes.func,
	chartCanvasType: React.PropTypes.string,
	chartData: React.PropTypes.object.isRequired,
	chartId: React.PropTypes.number.isRequired,
	margin: React.PropTypes.object.isRequired,
	canvasOriginX: React.PropTypes.number,
	canvasOriginY: React.PropTypes.number,
	// secretToSuperFastCanvasDraw: React.PropTypes.array.isRequired,
	callbackForCanvasDraw: React.PropTypes.func.isRequired,
};

Axis.drawOnCanvasStatic = (margin, props, canvasOrigin, ctx, chartData, xScale, yScale) => {
	var { transform, showDomain, showTicks ,axisName,fontFamily, orient, axisNameFontSize,axisNameOffset,axisNameFontFamily, axisNameMaxSize} = props;
	var xOffsetMult = (orient === "top" || orient === "bottom") ? 1 : 0;
	var yOffsetMult = (orient === "right" || orient === "left") ? -1 : 0;
	ctx.save();

	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.translate(canvasOrigin[0] + transform[0], canvasOrigin[1] + transform[1]);
	
	var xAxis = (orient === "bottom" || orient === "top");

	var range = d3_scaleRange(xAxis ? xScale : yScale);
	let rangeOffset = xAxis? range[1] : 0;
	
	ctx.textAlign="center"; 
	ctx.font = `${ axisNameFontSize }px ${axisNameFontFamily}`;
	ctx.fillText(axisName,rangeOffset +xOffsetMult * axisNameOffset, yOffsetMult * axisNameOffset, axisNameMaxSize);
	if (showDomain) AxisLine.drawOnCanvasStatic(props, ctx, chartData, xScale, yScale);
	if (showTicks) AxisTicks.drawOnCanvasStatic(props, ctx, chartData, xScale, yScale);
	ctx.restore();
};

export default Axis;
