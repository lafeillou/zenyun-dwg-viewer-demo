import * as d3 from 'd3';
import {useRef, useEffect, use} from 'react';
import './svgStyle.css';
export default function DThreeWrap({
	data,
	width=640,
	height=400,
	marginTop=0,
	marginRight=0,
	marginBottom=24,
	marginLeft=32,
	setTransform,
}) {

	const gx = useRef();
	const gy = useRef();
	const svgRef = useRef(null);

	const x = d3.scaleLinear([0, width], [marginLeft, width - marginRight]);
	const y = d3.scaleLinear([height, 0], [0, height - marginBottom]);

	function zoomed({transform}) {
		// console.log("===transform");
		// console.log(transform);
		// svgRef.current.attr("transform", transform);
		svgRef.current
		.select('svg')
	  .attr("transform", transform);
		const zx = transform.rescaleX(x);
    const zy = transform.rescaleY(y); //.interpolate(d3.interpolateRound);
		d3.select(gx.current).call(d3.axisBottom(zx));
		d3.select(gy.current).call(d3.axisLeft(zy));
		svgRef.current.selectAll("g.x-axis g.tick")
		.append("line")
		.classed("grid-line", true)
		.attr("x1",0)
		.attr("y1",0)
		.attr("x2",0)
		.attr("y2", -(height - marginBottom));
		svgRef.current.selectAll("g.y-axis g.tick")
		.append("line")
		.classed("grid-line", true)
		.attr("x1",0)
		.attr("y1",0)
		.attr("x2", width - marginLeft)
		.attr("y2", 0);

		// 去掉defs
		// svgRef.current.select('#example1').attr('transform',null).attr('transform-origin', 0 + 'px ' + 0 + 'px');
    svgRef.current.select('#example1').attr('viewBox', null);
		svgRef.current.select('#example1').attr('preserveAspectRatio', 'none');
		// svgRef.current.select('#example1').attr("transform", transform);
		svgRef.current.select('#example1').select('defs').remove();
		svgRef.current.select('#example1').select('g').attr('transform', null)
		const innerSvg = svgRef.current.select('#example1').select('g').select('g')
		innerSvg.attr("transform", transform);
    setTransform(transform)
	}

	

	useEffect(() => {
		svgRef.current = d3.select('#d3-svg-dom-element');
		const zoom = d3.zoom()
      // .extent([[0, 0], [width - marginRight, height - marginBottom]])
      .scaleExtent([1, 100])
      .on("zoom", zoomed);

		svgRef.current
			.call(zoom)
			.call(zoom.transform, d3.zoomIdentity);
		// svgRef.current
		// .select('#example1')
		// .select('#*Model_Space')
		// .attr('className','test')
		// .selectAll('g')
		// .attr('stroke', 'red')
		// .call(drag)
		// .on('click', clicked)

		svgRef.current.select('#example1').attr('viewBox', null);
		svgRef.current.select('#example1').attr('preserveAspectRatio', 'none');
		// svgRef.current.select('#example1').attr('height', height);
		// svgRef.current.select('#example1').attr('width', width);
		// svgRef.current.select('#example1').attr("transform", transform);
		svgRef.current.select('#example1').select('defs').remove();
		svgRef.current.select('#example1').select('g').attr('transform', null);
		const innerSvg = svgRef.current.select('#example1').select('g').select('g')
		// innerSvg.attr("transform", `translate(${width / 2},${height / 2}) scale(${21})`);
		// innerSvg.selectAll('g').on("click", clicked);
		function clicked(event, [x, y]) {
			event.stopPropagation();
			innerSvg.transition().duration(750).call(
				zoom.transform,
				d3.zoomIdentity.translate(width / 2, height / 2).scale(40).translate(-x, -y),
				d3.pointer(event)
			);
  }	

	}, [width, height]);

	useEffect( () => {

		svgRef.current.select('#example1').attr('viewBox', null);
		svgRef.current.select('#example1').attr('preserveAspectRatio', 'none');
		// svgRef.current.select('#example1').attr("transform", transform);
		svgRef.current.select('#example1').select('defs').remove();
		svgRef.current.select('#example1').select('g').attr('transform', null);
    // const innerSvg = svgRef.current.select('#example1').select('g').select('g')
		// innerSvg.attr("transform", `translate(${width / 2},${height / 2}) scale(${21})`);

		d3.select(gx.current).call(d3.axisBottom(x));
		if(!svgRef.current) {
			svgRef.current = d3.select('#d3-svg-dom-element');
		}
		svgRef.current.selectAll("g.x-axis g.tick")
		.append("line")
		.classed("grid-line", true)
		.attr("x1",0)
		.attr("y1",0)
		.attr("x2",0)
		.attr("y2", -(height - marginBottom));

		

	}, [gx,x]);

	useEffect( () => {
		d3.select(gy.current).call(d3.axisLeft(y))
		if(!svgRef.current) {
			svgRef.current = d3.select('#d3-svg-dom-element');
		}
		//console.log(svgRef.current);
		svgRef.current.selectAll("g.y-axis g.tick")
		.append("line")
		.classed("grid-line", true)
		.attr("x1",0)
		.attr("y1",0)
		.attr("x2", width - marginLeft)
		.attr("y2", 0)
	}, [gy,y]);

	return (
		<svg width={width} height={height} id="d3-svg-dom-element" >
			<g className="x-axis" ref={gx} transform={`translate(0, ${height - marginBottom})`} />
			<g className="y-axis"ref={gy} transform={`translate(${marginLeft},0)`} />
		</svg>
	)
}