import {removeMapHighLight} from './mapEvent.js'

export class LineChart {
  
  constructor(selection, props) {
    
    const {
	    box,
  		data,
      fruit,
  	  column,
 		} = props;
    
    this.xScale = d3.scaleLinear();
    this.yScale = d3.scaleLinear();
    this.Data = data;
    this.g = selection.append('g');
    this.column = column;
    this.fruit = fruit;
    this.box = box;
    
    this.yScale.domain(d3.extent(
      this.Data.get(null, this.fruit),
      d=>d[this.column])
    );
    
  }
  
  /* draw axis and outline box */
  draw () {
    
    this.g
      .append('rect')  
      .attr('x', this.box.left)
      .attr('y', this.box.top)
      .attr('width', this.box.width)
      .attr('height', this.box.height)
      .style('fill', 'white')
      .style('stroke', 'black');
    
    this.g
    	.append('rect')
    	.attr('x', this.box.left)
    	.attr('y', this.box.top)
    	.attr('width', this.box.width)
    	.attr('height', this.box.height)
    	.style('fill', 'grey')
    	.attr('class', 'fog')
    
    this.g
    	.append('text')
    	.attr('x', this.box.left + this.box.width / 2)
    	.attr('y', this.box.top + this.box.height / 2)
    	.style('text-anchor', 'middle')
    	.text("在地圖上選擇一個縣市")
    	.attr('class', 'fog');

    this.xScale
      .domain([2011, 2021])
      .range([this.box.left + 5, this.box.left + this.box.width - 5]);
    this.yScale
      .range([this.box.top + this.box.height - 5, this.box.top + 5]);

    const xAxis = this.g.append('g').call(
      d3.axisBottom(this.xScale).ticks((2021-2011)/2).tickFormat(d3.format(""))
    );
    xAxis
    .attr("transform",`translate(${0},${this.box.top + this.box.height})`)
    .style('user-select', 'none')
      .select(".domain").remove();

    const yAxis = this.g.append('g').call(
      d3.axisRight(this.yScale).ticks().tickFormat(d3.format(".2s"))
    );

    yAxis
      .attr("transform", `translate(${this.box.left+this.box.width},${0})`)
      .attr("id", "linechart-yaxis")
      .style('user-select', 'none')
      	.select(".domain").remove();
  }
  
  /* triggered when select new column */
  updateFruit(fruit) {
  	this.fruit = fruit;
    this.yScale.domain(d3.extent(
      this.Data.get(null, this.fruit),
      d=>d[this.column])
    );
	}
  
  /* triggered when select new column */
	updateColumn(column) {  
  	this.column = column;
    this.yScale.domain(d3.extent(
      this.Data.get(null, this.fruit),
      d=>d[this.column])
    );
	}
  
  /* triggered when map on click */
  drawLine(countyName, color = "purple") {
  
    // this.yScale.domain(d3.extent(this.Data, d=>d[this.targetColumn]))
    console.log(this.fruit, this.column);

    const countyData = this.Data
    	.get(null, this.fruit, countyName)
      .reverse();

    const lineGenerator = d3.line()
      .x(d => this.xScale(d['年度']))
      .y(d => this.yScale(d[this.column]));

    const path = this.g
      .append('path')
        .attr('class', 'line-path-'+countyName)
        .attr('d', lineGenerator(countyData))
        .attr('stroke', color)
        .style('fill', 'none')
        .style('stroke-width', 2);

    const pathLength = path.node().getTotalLength();

    const transitionPath = this.g
      .transition()
      .ease(d3.easeSin)
      .duration(1000);

    path
    .attr("stroke-dashoffset", pathLength)
    .attr("stroke-dasharray", pathLength)
      .transition(transitionPath)
      .attr("stroke-dashoffset", 0);
    
    this.g
      .selectAll('line-node')
      .data(countyData)
      .enter()
      .append('circle')
      .attr('cx', d=>this.xScale(d["年度"]))
      .attr('cy', d=>this.yScale(d[this.column]))
      .attr('r', 2)
      // .style('fill', color)
      .style('fill', 'white')
      .style('stroke', 'black')
      .attr("class", "node-"+countyName);
	}
  
  /* erase line with countyName */
  eraseLine(countyName) {
  	d3.selectAll(".node-"+countyName).remove();
  	d3.selectAll(".line-path-"+countyName).remove();
	}

  /* update information and redraw line */
	replotLine(focusCounties, newColumn) {
	  this.g.selectAll("path").remove();
  	this.g.selectAll("circle").remove();
  	this.g.selectAll("#linechart-yaxis").remove();
  
  	const yAxis = this.g.append('g').call(
    	d3.axisRight(this.yScale).ticks().tickFormat(d3.format(".2s"))
  	);
  
  	yAxis
  		.attr("transform", `translate(${this.box.left+this.box.width},${0})`)
  		.attr("id", "linechart-yaxis")
      .style('user-select', 'none')
      	.select(".domain").remove();
  
    for (const [county, color] of Object.entries(focusCounties)) {
      if (!color) {continue;}
      this.drawLine(co