import { yearItems } from './option.js'

const scol = "產量_公噸";

// const xcol = "每株平均產量_公斤";
// const ycol = "每公頃平均產量_公斤";

// const xcol = "每公頃平均產量_公斤";
// const ycol = "收穫面積_公頃";

// const xcol = "每株平均產量_公斤";
// const ycol = "收穫株數";

const maxRadius = 20;
const minRadius = 6

export class BubbleChart {
  
  constructor(selection, props) {
    
    const {
	    box,
  		data,
      year,
      fruit,
      id,
      xcol, ycol, scol
 		} = props;
    
    this.xScale = d3.scaleLinear();
    this.yScale = d3.scaleLinear();
    this.sScale = d3.scaleLinear();
    this.Data = data;
    this.g = selection.append('g');
    this.year = year;
    this.fruit = fruit;
    this.box = box;
    this.xcol = xcol;
    this.ycol = ycol;
    this.scol = scol;
    this.id = id;
    this.yearLabel = this.g.append('text');
    
    this.yearLabel
    	.attr('x', this.box.left).attr('y', this.box.top-5).text(year)
    	.style('stroke', 'black')
    	.attr('class', 'bubble-year-label');

    this.yScale.domain(d3.extent(
      this.Data.get(null, this.fruit), d=>d[this.ycol])
    ).range([box.top + box.height - maxRadius - 5, box.top + maxRadius + 5]);
    
    this.xScale.domain(d3.extent(
      this.Data.get(null, this.fruit), d=>d[this.xcol])
    ).range([box.left + maxRadius + 5, box.left + box.width - maxRadius - 5]);
    
    this.sScale.domain(d3.extent(
      this.Data.get(null, this.fruit), d=>d[this.scol])
     ).range([minRadius, maxRadius])
    
  }
  
  draw() {
    
    this.g.append('rect')
    	.attr('x', this.box.left).attr('y', this.box.top)
    	.attr('width', this.box.width).attr('height', this.box.height)
    	.style('stroke', 'black').style('fill', 'white')
    
    this.g.append('rect')
    	.attr('x', this.box.left).attr('y', this.box.top)
    	.attr('width', this.box.width).attr('height', this.box.height)
    	.style('fill', 'grey').attr('class', 'fog')
    
    this.g
    	.append('text')
    	.attr('x', this.box.left + this.box.width / 2)
    	.attr('y', this.box.top + this.box.height / 2)
    	.style('text-anchor', 'middle')
    	.text("在地圖上選擇一個縣市")
    	.attr('class', 'fog');
    
    this.g
      .selectAll('bubble-node')
      .data(this.Data.get(this.year, this.fruit))
      .enter()
      .append('circle')
      .attr('cx', d=>this.xScale(d[this.xcol]))
      .attr('cy', d=>this.yScale(d[this.ycol]))
      .attr( 'r', d=>this.sScale(d[this.scol]))
      .style('fill', "red")
      .style('fill', 'white')
      .style('stroke', 'black')
    	.style('stroke-width', 2)
    	.style('opacity', 0)
      .attr("id", d=>"bubble-node-"+d["地區別"]+"-"+this.id);
    
    this.g
    	.append('text')
		  .attr('x', this.box.left + this.box.width / 2)
      .attr('y', this.box.top + this.box.height + 48)
    	.style('text-anchor', 'middle')
    	.style('stroke', 'black')
    	.text(this.xcol);
    
    this.g
    	.append('text')
    	.attr('x', this.box.left-32)
    	.attr('y', this.box.top + this.box.height / 2)
    	.style('text-anchor', 'middle')
    	.style('stroke', 'black')
    	.attr('transform', `rotate(-90, ${this.box.left-48}, ${this.box.top + this.box.height / 2})`)
    	.text(this.ycol);
    
    const xAxis = this.g.append('g').call(
      d3.axisBottom(this.xScale).ticks().tickFormat(d3.format(".2s"))
    );
    xAxis
    .attr("transform",`translate(${0},${this.box.top + this.box.height})`)
    .style('user-select', 'none')
      .select(".domain").remove();
    
    const yAxis = this.g.append('g').call(
      d3.axisLeft(this.yScale).ticks().tickFormat(d3.format(".2s"))
    );
  	yAxis
  		.attr("transform", `translate(${this.box.left},${0})`)
  		// .attr("id", "linechart-yaxis")
      .style('user-select', 'none')
      	.select(".domain").remove();
    
    this.g.append('rect')
    	.attr('x', this.box.left + this.box.width / 2 - 20)
    	.attr('y', this.box.top - 25)
    	.attr('width', 40)
    	.attr('height', 20)
    	.style('fill', 'gray')
    	.style('stroke', 'black')
    	// .on('click', () => {this.play();})

    this.playText = this.g.append('text')
    this.playText
    	.attr('x', this.box.left + this.box.width / 2)
    	.attr('y', this.box.top - 11)
    	.style('text-anchor', 'middle')
    	.style('user-select', 'none')
    	.text("play").style('stroke', 'black') // play from now to 2021
    	.on('click', () => {this.play();})
    
  }
  
  update(year, fruit, focusCounties) {
    
    this.year = year;
    this.fruit = fruit;
    
    this.yearLabel.text(year);
    
    const data = this.Data.get(this.year, this.fruit);
		
    // same scale for different years
    if (fruit) {
      const year_data = this.Data.get(null, this.fruit);
      this.yScale.domain(d3.extent(
        year_data, d=>d[this.ycol]))
      this.xScale.domain(d3.extent(
        year_data, d=>d[this.xcol]))
      this.sScale.domain(d3.extent(
        year_data, d=>d[this.scol]))
    }
    
    data.forEach(d=>{
      d3.select('#bubble-node-'+d["地區別"]+"-"+this.id)
      	.transition().duration(1000)
      	.attr('r', this.sScale(d[this.scol]))
      	.attr('cx', this.xScale(d[this.xcol]))
      	.attr('cy', this.yScale(d[this.ycol]))
    })
        
  }
  
  play() {
    this.Data.get(d3.min(yearItems), this.fruit).forEach(d=>{
      this.moveTo(d["地區別"], (+this.year) + 1)
    });
  }
  
  resetPlay() {
    this.Data.get(d3.min(yearItems), this.fruit).forEach(d=>{
      this.moveTo(d["地區別"], (+this.year), -1)
    });
    this.yearLabel.text(this.year)
    this.playText
    	.text("play").on('click', () => this.play());
  }
  
  moveTo(county, year, nextYear=0) {
    
    if (nextYear == 0) {nextYear  = year + 1}
    
    if (year > d3.max(yearItems)) {
    	this.playText
        .text("reset").on('click', () => this.resetPlay());
      return;
    }
    if (nextYear < 0) {
      this.playText
      	.text("play").on('click', () => this.play());
    }
		    
    const data = this.Data.get(year, this.fruit, county)
    
    if (data.length == 0) {return;}
    
    d3.select('#bubble-node-'+county+"-"+this.id)
      .transition().duration(700)
      .attr('r', this.sScale(data[0][this.scol]))
      .attr('cx', this.xScale(data[0][this.xcol])