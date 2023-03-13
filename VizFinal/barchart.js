import {
  scaleLinear,
  select,
  axisBottom
} from 'd3'

import {mouseoverMap, mouseoutMap, mousemoveMap} from './mapEvent.js';

export const drawBarchart = (selection, props, selectTop=0) => {

  const {
    box,
  	data,
    column,
  } = props;
  
  const g = selection.append('g')
  g.attr('class', 'barchart-element')
  
  g
  	.append('text')
  	.attr('x', box.left + box.width / 2)
  	.attr('y', box.top-5)
  	.text(column)
  	.style('text-anchor', 'middle')
  	.style('user-select', 'none')
  	.style('stroke', 'black');
  
	g
    .append('rect')  
  	.attr('x', box.left)
  	.attr('y', box.top)
  	.attr('width', box.width)
  	.attr('height', box.height)
  	.style('fill', 'white')
  	.style('stroke', 'black');
  
  const xScale = d3.scaleLinear()
  	.domain(d3.extent(data, d=>d[column]))
  	.range([0, box.width-10]);
  
  const Xaxis = g.append('g').call(
    d3.axisBottom(xScale).ticks(5).tickFormat(d3.format(".2s"))
  );
	Xaxis
    .attr("transform",`translate(${box.left},${box.top + box.height})`)
  	.style('user-select', 'none')
    .select(".domain").remove();
  
  const binWidth = (box.height / data.length);
  const topSpace = 4;
  
	data.sort((a, b) => (b[column] - a[column]))
  
  g.selectAll('box-rect')
  	.data(data)
  	.enter()
  	.append('rect')
  	.attr('id', d => "rect-"+d["地區別"])
  	.attr('x', box.left)
  	.attr('y', (d, i) => box.top + topSpace + i*binWidth)
  	.attr('width', 0)
  	.attr('height', binWidth * 0.7)
  	.style('fill', '#00cc99')
  	.style('stroke', 'black')
  	// .on('mouseover', (e, d) => mouseoverMap(e, d["地區別"], d["果品類別"], d["年度"], data))
  	// .on('mousemove', (e, d) => mousemoveMap(e, d["地區別"]))
  	// .on('mouseout', (e, d) => mouseoutMap(e, d["地區別"]))
  	.transition().duration(1000)
  	.attr('width', d => xScale(d[column]))
  	
  g.selectAll('county-label')
  	.data(data)
  	.enter()
  	.append('text')
  	.attr('x', box.left - 5)
  	.attr('y', (d, i) => box.top + topSpace + (i+0.7)*binWidth)
  	.attr('id', d => 'county-label-'+d["地區別"])
  	.text(d => d["地區別"])
  	.style('stroke', 'black')
  	.style('text-anchor', 'end')
  	.style('font-size', 12)
  	.style('user-select', 'none');
  
  // g.selectAll('value-label')
  
  const colorScale = scaleLinear()
  	.domain(d3.extent(data, d=>d[column]))
  	.range(["white", "green"]);
  
  data.forEach(d=>{
    select("#county-"+d["地區別"]).style("fill", colorScale(d[column]))
  })
}

export const recoverFocus = (focusCounties) => {
  for (const [countyName, value] of Object.entries(focusCounties)) {
    if (value) {
      d3.select("#rect-"+countyName).style('fill', "orange"); 
      d3.select("#county-la