import * as d3 from 'd3';
import {useRef, useEffect, use} from 'react';
import createArcForLWPolyine from '@/dfx/util/createArcForLWPolyline';
import './svgStyle.css';
import * as _ from 'lodash';
export default function DThreeWrap({
	data,
	width=640,
	height=400,
	marginTop=0,
	marginRight=0,
	marginBottom=24,
	marginLeft=32,
	json
}) {

	const gx = useRef();
	const gy = useRef();
	const svgRef = useRef(null);

	const x = d3.scaleLinear([0, width], [marginLeft, width - marginRight]);
	const y = d3.scaleLinear([height, 0], [0, height - marginBottom]);

	function zoomed({transform}) {
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
		// 面板
		d3.select('#model-wrap').attr("transform", transform);
		d3.select('#model-wrap').selectAll("g").attr("stroke-width", 1 / transform.k);
		// cpu
		d3.select('#cpu-model-wrap').attr("transform", transform);
		d3.select('#cpu-model-wrap').selectAll("g").attr("stroke-width", 1 / transform.k);
		
	}

	

	useEffect(() => {
		svgRef.current = d3.select('#d3-svg-dom-element');
		const cpu = d3.select('#cpu-model-wrap');
		
		cpu.call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

		const zoom = d3.zoom()
		// .extent([[0, 0], [width - marginRight, height - marginBottom]])
		.scaleExtent([1, 100])
		.on("zoom", zoomed);

		svgRef.current
		.call(zoom)
		.call(zoom.transform, d3.zoomIdentity);
		
		function clicked(event, [x, y]) {
			event.stopPropagation();
			// innerSvg.transition().duration(750).call(
			// 	zoom.transform,
			// 	d3.zoomIdentity.translate(width / 2, height / 2).scale(40).translate(-x, -y),
			// 	d3.pointer(event)
			// );
  		}

		function dragstarted() {
			// d3.select(this).raise();
			cpu.attr("cursor", "grabbing");
			cpu.attr('fill', 'yellow');

			cpu.select('#12374 > path')
			.attr('fill', 'yellow');
		}

		function dragged(event, d) {
			// event.stopPropagation();
			console.log(cpu.attr("transform"));
			// const str = cpu.attr("transform");
			const transform = d3.zoomTransform(cpu.node());
			transform.x += event.dx;
			transform.y += event.dy;
			// console.log(zoom.transform);
			cpu.attr("transform", transform);
			// d3.select(this).attr("cx", d.x = event.x).attr("cy", d.y = event.y);
			// cpu.attr("transform", `translate(${event.x}, ${event.y}) scale(${zoom.transform.k})`);
			// cpu.attr('x', event.x).attr('y', event.y);
		}

		function dragended() {
			cpu.attr("cursor", "grab");
			cpu.select('#12374 > path')
			.attr('fill', 'white');
		}
	}, [width, height]);

	useEffect(() => {
		d3.select(gx.current).call(d3.axisBottom(x));
		// if(!svgRef.current) {
		// 	svgRef.current = d3.select('#d3-svg-dom-element');
		// }
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
		// if(!svgRef.current) {
		// 	svgRef.current = d3.select('#d3-svg-dom-element');
		// }
		svgRef.current.selectAll("g.y-axis g.tick")
		.append("line")
		.classed("grid-line", true)
		.attr("x1",0)
		.attr("y1",0)
		.attr("x2", width - marginLeft)
		.attr("y2", 0)
	}, [gy,y]);

	useEffect(() => {
		//解析并绘制传入的json数据
		if(!json) {
			return;
		}
		console.log("解析dwg的得到的json数据")
		console.log(json);

		
		const modelPaths = d3.select('#model-wrap').selectAll(".model-path").data(json.entities.map(d => {
			d.closed = true;
			if(_.includes([12195n, 12371n, 12977n,12969n, 12968n,12976n], d.handle)) {
				d.closed = false;
			}
			return d;
		})); // update

		modelPaths.enter()
		.append('g')
		.attr('id', (d, i) => `${d.handle}`)
		.each(function(d,i){
			if(d.type === 'CIRCLE'){
				d3.select(this).append('circle')
				.attr('cx', d.center.x)
				.attr('cy', d.center.y)
				.attr('r', d.radius)
				.attr('fill', 'none')
				.attr('stroke', 'black');
			} else if (d.type === 'LWPOLYLINE' || d.type === 'POLYLINE') {
				let polyline = [];
				let entity = d;
				if(_.includes([12374n], d.handle)) {
	
				} else {
					if (entity.closed) {
						entity.vertices = entity.vertices.concat(entity.vertices[0])
					}
					for (let i = 0, il = entity.vertices.length; i < il - 1; ++i) {
						const from = [entity.vertices[i].x, entity.vertices[i].y]
						const to = [entity.vertices[i + 1].x, entity.vertices[i + 1].y]
						polyline.push(from)
						if (entity.vertices[i].bulge) {
							polyline = polyline.concat(
								createArcForLWPolyine(from, to, entity.vertices[i].bulge),
							)
						}
						// The last iteration of the for loop
						if (i === il - 2) {
							polyline.push(to)
						}
					}

					const dd = polyline.reduce((acc, point, i) => {
						acc += i === 0 ? 'M' : 'L'
						acc += point[0] + ',' + point[1]
						return acc
					}, '')

					d3.select(this)
					.append('path')
					.attr('d', entity.closed ? dd + 'Z' : dd) // 转换的path没有Z结尾
					.attr('stroke', 'black')
					.attr('fill', 'none');
				}

			} else if (d.type === 'LINE') {
				// 12838 12930  把cpu部分单独拿出来处理
				if((d.handle >= 12838n && d.handle <= 12930n)) {
				} else {

					let entity = d;
					
					let polyline = [
							[entity.startPoint.x, entity.startPoint.y],
							[entity.endPoint.x, entity.endPoint.y],
						];
					const dd = polyline.reduce((acc, point, i) => {
						acc += i === 0 ? 'M' : 'L'
						acc += point[0] + ',' + point[1]
						return acc
					}, '');

					d3.select(this)
					.append('path')
					.attr('d', dd) // 转换的path没有Z结尾
					.attr('stroke', 'black')
					.attr('fill', 'none')
				}

			} else if (d.type === 'TEXT') {
				let entity = d;
				d3.select(this)
				.append('text')
				.attr('x', entity.startPoint.x)
				.attr('y', entity.startPoint.y)
				.attr('font-size', entity.textHeight)
				.attr('text-anchor', 'start')
				.text(entity.text);
			}		
		});

		const cpuModels = json.entities.filter(d => {
			if(d.handle >= 12838n && d.handle <= 12930n || d.handle === 12374n) {
				return true;
			}
		});

		const cpuModelsPaths = d3.select('#cpu-model-wrap').selectAll(".cpu-model-path").data(cpuModels.map(d => {
			if(d.handle === 12374n) {
				d.closed = true;
			}
			return d;
		})); // update

		cpuModelsPaths.enter()
		.append('g')
		.attr('id', (d, i) => `${d.handle}`)
		.each(function(d,i){
			if(d.type === 'CIRCLE'){
				d3.select(this).append('circle')
				.attr('cx', d.center.x)
				.attr('cy', d.center.y)
				.attr('r', d.radius)
				.attr('fill', 'none')
				.attr('stroke', 'black')
				// .attr('stroke-width', 1)
			} else if (d.type === 'LWPOLYLINE' || d.type === 'POLYLINE') {
				let polyline = [];
				let entity = d;
				
				if (entity.closed) {
					entity.vertices = entity.vertices.concat(entity.vertices[0])
				}
				for (let i = 0, il = entity.vertices.length; i < il - 1; ++i) {
					const from = [entity.vertices[i].x, entity.vertices[i].y]
					const to = [entity.vertices[i + 1].x, entity.vertices[i + 1].y]
					polyline.push(from)
					if (entity.vertices[i].bulge) {
						polyline = polyline.concat(
							createArcForLWPolyine(from, to, entity.vertices[i].bulge),
						)
					}
					// The last iteration of the for loop
					if (i === il - 2) {
						polyline.push(to)
					}
				}

				const dd = polyline.reduce((acc, point, i) => {
					acc += i === 0 ? 'M' : 'L'
					acc += point[0] + ',' + point[1]
					return acc
				}, '')

				d3.select(this)
				.append('path')
				.attr('d', entity.closed ? dd + 'Z' : dd) // 转换的path没有Z结尾
				.attr('stroke', 'black')
				.attr('fill', d.handle === 12374n ? 'white' : 'none'); // 12374n是cpu的外框
			} else if (d.type === 'LINE') {
				let entity = d;
				let polyline = [
						[entity.startPoint.x, entity.startPoint.y],
						[entity.endPoint.x, entity.endPoint.y],
					];
				const dd = polyline.reduce((acc, point, i) => {
					acc += i === 0 ? 'M' : 'L'
					acc += point[0] + ',' + point[1]
					return acc
				}, '');

				d3.select(this)
				.append('path')
				.attr('d', dd) // 转换的path没有Z结尾
				.attr('stroke', 'black')
				.attr('fill', 'none');
			} else if (d.type === 'TEXT') {
				let entity = d;
				d3.select(this)
				.append('text')
				.attr('x', entity.startPoint.x)
				.attr('y', entity.startPoint.y)
				.attr('font-size', entity.textHeight)
				.attr('text-anchor', 'start')
				.text(entity.text);
			}		
		});
	}, [json]);
	return (
		<svg width={width} height={height} id="d3-svg-dom-element" >
			<g className="x-axis" ref={gx} transform={`translate(0, ${height - marginBottom})`} />
			<g className="y-axis"ref={gy} transform={`translate(${marginLeft},0)`} />
			<g id="model-wrap"></g>
			<g id="cpu-model-wrap"></g>
		</svg>
	)
}