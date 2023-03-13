(function (d3$1, topojson) {
  'use strict';

  const fruitItems = [
    "香蕉", "鳳梨", "椪柑", "柳橙",
  	"桶柑", "文旦柚", "斗柚", "白柚",
    "溫州蜜柑","晚崙西亞橙", "檸檬", "葡萄柚",
    "其他雜柑類", "龍眼", "芒果", "檳榔",
    "番石榴", "李", "桃", "柿",
    "木瓜", "蓮霧", "葡萄", "枇杷",
    "梅", "荔枝", "橄欖", "楊桃",
    "梨", "蘋果", "棗", "番荔枝",
    "百香果", "可可椰子", "其他水果",
  ];

  const yearItems = [
    2021, 2020, 2019, 2018, 2017, 2016,
    2015, 2014, 2013, 2012, 2011
  ];

  const columnItems = [
    "收穫株數",
    "收穫面積_公頃",
    "每公頃平均產量_公斤",
    "每株平均產量_公斤",
    "產量_公噸",
    "種植株數",
    "種植面積_公頃"
  ];

  const colorBank = [
    "green", "gold", "cyan", "blue", "Magenta", "brown", "pink", "cyan",
    "orange", "lightgreen", "violet", "tan", "deepskyblue", "palevioletred",
    "olive", "peru"
  ];

  function* randColor() {
    var i = 0;
    while(true) {
      yield colorBank[i];
      i += 1;
      if (i == colorBank.length) {
        i = 0;
      }
    }
  }

  const dropdownMenu = (selection, props) => {
    
    const {
      options,
      onOptionClicked,
      selectedOption
    } = props;
    
    let select = selection.selectAll('select').data([null]);
    select = select.enter().append('select')
      .merge(select)
        .on('change', function() {
          onOptionClicked(this.value);
        });
    
    // select.style('background-color', 'yellow')
    
    const option = select.selectAll('option').data(options);
    option.enter().append('option')
      .merge(option)
        .attr('value', d => d)
        .property('selected', d => d === selectedOption)
        .text(d => d);
  };

  const colorPicker = randColor();

  const setMapHighLight = (countyName, color) => {
  	d3.select("#county-"+countyName)
  		.style('stroke', color)
  		.style('stroke-opacity', 1)
  		.style('stroke-width', 2);
  };

  // I wanna use it at Linechart
  const removeMapHighLight = (countyName) => {
    d3.select("#county-"+countyName)
      .style('stroke', 'black')
      .style('stroke-opacity', 0.4)
      .style('stroke-width', 1);
  };

  const setRectColor = (countyName, color) => {
      d3.select("#rect-"+countyName)
    	.style('fill', color);
  };

  const mouseoverMap = (e, countyName, fruitName, year, data, focusCounties) => {
    
    if ( !focusCounties[countyName]) {
  	  setMapHighLight(countyName, 'red');
  	  setRectColor(countyName, 'orange');
    }
      
    d3.select(".hover-box")
    	.style('opacity', 1)
    	.attr('x', e.x).attr('y', e.y); 
    
    d3.select("#hover-box-title")
    	.attr('x', e.x+3).attr('y', e.y + 16)
    	.style('opacity', 1).text(countyName + " " + year);

    // line 1
    var total = d3.sum(data.filter(d => ((d["年度"]==year) && (d["果品類別"]===fruitName))), d=>d["產量_公噸"]);
    var value = 
      data.filter(
        d => ((d["果品類別"]===fruitName) && (d["地區別"]===countyName) && (d["年度"]==year))
      )[0]["產量_公噸"];
    
    d3.select("#hover-box-line1")
    	.attr('x', e.x+3).attr('y', e.y + 32)
    	.style('opacity', 1)
      .text(
      	fruitName+"產量: "+d3.format(".2s")(value)+"公噸"+
      	" ("+d3.format(".1%")(value/total)+")"
    	);
    
    // line 2
    total = d3.sum(data.filter(d => ((d["年度"]==year) && (d["果品類別"]===fruitName))), d=>d["收穫面積_公頃"]);
    value = 
      data.filter(
        d => ((d["果品類別"]===fruitName) && (d["地區別"]===countyName) && (d["年度"]==year))
      )[0]["收穫面積_公頃"];
    
    d3.select("#hover-box-line2")
    	.attr('x', e.x+3).attr('y', e.y + 64)
    	.style('opacity', 1)
      .text(
      	fruitName+"收穫面積: "+d3.format(".2s")(value)+"公頃"+
      	" ("+d3.format(".1%")(value/total)+")"
    	);

  };

  const mouseoutMap = (e, countyName, focusCounties) => {

    if (! focusCounties[countyName]) {
      removeMapHighLight(countyName);
      setRectColor(countyName, '#00cc99');
    }
    
    d3.select(".hover-box")
    	.attr('x', -1000, 'y', -1000) // avoid blocking
    	.style('opacity', 0);
    
    d3.select("#hover-box-title")
    	.attr('x', -1000, 'y', -1000)
    	.style('opacity', 0);
    
    d3.select("#hover-box-line1")
    	.attr('x', -1000, 'y', -1000)
    	.style('opacity', 0);

  	d3.select("#hover-box-line2")
    	.attr('x', -1000, 'y', -1000)
    	.style('opacity', 0);
  };

  const mousemoveMap = (e, countyName) => {
    
    d3.select(".hover-box")
    	.attr('x', e.x).attr('y', e.y); 
    
    d3.select("#hover-box-title")
    	.attr('x', e.x+3).attr('y', e.y + 16);
    
    d3.select("#hover-box-line1")
    	.attr('x', e.x+3).attr('y', e.y + 32);
    
    d3.select("#hover-box-line2")
    	.attr('x', e.x+3).attr('y', e.y + 48);
  };

  const onclickMap = (e, countyName, focusCounties, lineChartObject) => {
    
    if (!focusCounties[countyName]) {
      const color = colorPicker.next().value;
  		setMapHighLight(countyName, color);
    	// setRectColor(countyName, color);
      lineChartObject.drawLine(countyName, color);
      d3.select('#county-label-'+countyName).style('stroke', color);
      d3.select('#bubble-node-'+countyName+"-0").style('opacity', 0.6).style('fill', color);
      d3.select('#bubble-node-'+countyName+"-1").style('opacity', 0.6).style('fill', color);
      d3.select('#rect-'+countyName).style('fill', 'orange');
      focusCounties[countyName] = color;
      d3.selectAll('.fog').style('opacity', 0);
    }
    else {
    	setMapHighLight(countyName, "red");
    	setRectColor(countyName, 'orange');
      lineChartObject.eraseLine(countyName);
      d3.select('#county-label-'+countyName).style('stroke', 'black');
      d3.select('#bubble-node-'+countyName+"-0").style('opacity', 0);
      d3.select('#bubble-node-'+countyName+"-1").style('opacity', 0);
      focusCounties[countyName] = false;
      if (Object.values(focusCounties).reduce((a, b) => (a || b)))
      {d3.selectAll('.fog').style('opacity', 0);}
      else {d3.selectAll('.fog').style('opacity', 1);}
    }
    
  };

  const clearMap = (focusCounties, lineChartObject) => {
    console.log(focusCounties);
    for (const [countyName, color] of Object.entries(focusCounties)) {
      if (!color) {continue;}
      onclickMap(null, countyName, focusCounties, lineChartObject);
      focusCounties[countyName] = null;
    	setRectColor(countyName, '#00cc99');
      removeMapHighLight(countyName);
      // d3.select('#county-'+countyName).style('stroke', 'black').style('opacity', 0.8)
    }
  };

  const drawBarchart = (selection, props, selectTop=0) => {

    const {
      box,
    	data,
      column,
    } = props;
    
    const g = selection.append('g');
    g.attr('class', 'barchart-element');
    
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
    
  	data.sort((a, b) => (b[column] - a[column]));
    
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
    	.attr('width', d => xScale(d[column]));
    	
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
    
    const colorScale = d3$1.scaleLinear()
    	.domain(d3.extent(data, d=>d[column]))
    	.range(["white", "green"]);
    
    data.forEach(d=>{
      d3$1.select("#county-"+d["地區別"]).style("fill", colorScale(d[column]));
    });
  };

  const recoverFocus = (focusCounties) => {
    for (const [countyName, value] of Object.entries(focusCounties)) {
      if (value) {
        d3.select("#rect-"+countyName).style('fill', "orange"); 
        d3.select("#county-label-"+countyName).style('stroke', value);
       }
    }
  };

  class LineChart {
    
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
      	.attr('class', 'fog');
      
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
        this.drawLine(county, color);
      }
    }
    
  }

  // const xcol = "每株平均產量_公斤";
  // const ycol = "每公頃平均產量_公斤";

  // const xcol = "每公頃平均產量_公斤";
  // const ycol = "收穫面積_公頃";

  // const xcol = "每株平均產量_公斤";
  // const ycol = "收穫株數";

  const maxRadius = 20;
  const minRadius = 6;

  class BubbleChart {
    
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
       ).range([minRadius, maxRadius]);
      
    }
    
    draw() {
      
      this.g.append('rect')
      	.attr('x', this.box.left).attr('y', this.box.top)
      	.attr('width', this.box.width).attr('height', this.box.height)
      	.style('stroke', 'black').style('fill', 'white');
      
      this.g.append('rect')
      	.attr('x', this.box.left).attr('y', this.box.top)
      	.attr('width', this.box.width).attr('height', this.box.height)
      	.style('fill', 'grey').attr('class', 'fog');
      
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
      	.style('stroke', 'black');
      	// .on('click', () => {this.play();})

      this.playText = this.g.append('text');
      this.playText
      	.attr('x', this.box.left + this.box.width / 2)
      	.attr('y', this.box.top - 11)
      	.style('text-anchor', 'middle')
      	.style('user-select', 'none')
      	.text("play").style('stroke', 'black') // play from now to 2021
      	.on('click', () => {this.play();});
      
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
          year_data, d=>d[this.ycol]));
        this.xScale.domain(d3.extent(
          year_data, d=>d[this.xcol]));
        this.sScale.domain(d3.extent(
          year_data, d=>d[this.scol]));
      }
      
      data.forEach(d=>{
        d3.select('#bubble-node-'+d["地區別"]+"-"+this.id)
        	.transition().duration(1000)
        	.attr('r', this.sScale(d[this.scol]))
        	.attr('cx', this.xScale(d[this.xcol]))
        	.attr('cy', this.yScale(d[this.ycol]));
      });
          
    }
    
    play() {
      this.Data.get(d3.min(yearItems), this.fruit).forEach(d=>{
        this.moveTo(d["地區別"], (+this.year) + 1);
      });
    }
    
    resetPlay() {
      this.Data.get(d3.min(yearItems), this.fruit).forEach(d=>{
        this.moveTo(d["地區別"], (+this.year), -1);
      });
      this.yearLabel.text(this.year);
      this.playText
      	.text("play").on('click', () => this.play());
    }
    
    moveTo(county, year, nextYear=0) {
      
      if (nextYear == 0) {nextYear  = year + 1;}
      
      if (year > d3.max(yearItems)) {
      	this.playText
          .text("reset").on('click', () => this.resetPlay());
        return;
      }
      if (nextYear < 0) {
        this.playText
        	.text("play").on('click', () => this.play());
      }
  		    
      const data = this.Data.get(year, this.fruit, county);
      
      if (data.length == 0) {return;}
      
      d3.select('#bubble-node-'+county+"-"+this.id)
        .transition().duration(700)
        .attr('r', this.sScale(data[0][this.scol]))
        .attr('cx', this.xScale(data[0][this.xcol]))
        .attr('cy', this.yScale(data[0][this.ycol]))
      	.on('end', () => {this.moveTo(county, nextYear);this.yearLabel.text(year);});
    }

  }

  class DataLoader {
    
    /* input and clean data */
    constructor(data) {
      this.data = data;
      this.clean();
    }

    /* clean data */
    clean() {

      this.data.forEach(d=>{

        const targetColumns = columnItems;

        // 缺失值給予0
        targetColumns.forEach(tc=>{
          // if ((d[tc] === "-") || (isNaN(d[tc]) )) {d[tc] = 0;}
          if (d[tc] === "-") {d[tc] = 0;}
          d[tc] = +d[tc];
        });

        // 只使用繁體字 "臺" (避免與地圖資訊不合)
        if (d["地區別"].includes("台")) {d["地區別"] = d["地區別"].replace("台", "臺");}
        if (d["地區別"] == "桃園縣") {d["地區別"] = "桃園市";} //2014年以前是桃園市
      });

      // 移除台灣省、福建省資料
      this.data = this.data.filter(d=>{
        return (d["地區別"] != "臺灣省") && (d["地區別"] != "福建省");
      });
      
    }
    
    /* get data */
    get(year=null, fruit=null, county=null) {
      
      if (!year && !fruit && !county) {return this.data;}
      
      const yearF = year? (d=>{return d["年度"] == year}) : (d=>true);
      const fruitF = fruit? (d=>{return d["果品類別"] == fruit}) : (d=>true);
      const countyF = county? (d=>{return d["地區別"] == county}) : (d=>true);
      
      return this.data.filter(d=>{
        return yearF(d) && fruitF(d) && countyF(d);
      })
      
    }
    
  }

  const initHoverBox = (selection) => {
  	
    const g = selection.append('g');
    g.append('rect')
    	.attr('x', 0).attr('y', 0)
    	.attr('width', 260).attr('height', 60)
    	.attr('class', 'hover-box')
    	.style('stroke', 'black').style('fill', 'FloralWhite')
    	.style('opacity', 0);
    
    g.append('text')
    	.attr('x', 0).attr('y', 0)
    	.text("default")
    	.attr('id', 'hover-box-title')
    	.style('text-align', 'start')
    	.style('opacity', 0)
    	.style('user-select', 'none');
    
    g.append('text')
    	.attr('x', 0).attr('y', 0)
    	.text("line1")
    	.attr('id', 'hover-box-line1')
    	.style('text-align', 'start')
    	.style('opacity', 0)
    	.style('user-select', 'none');
    
    g.append('text')
    	.attr('x', 0).attr('y', 0)
    	.text("line2")
    	.attr('id', 'hover-box-line2')
    	.style('text-align', 'start')
    	.style('opacity', 0)
    	.style('user-select', 'none');
    
  };

  const initClearButton = (selection, box, focusCounties, lineChartObject) => {
    
    const g = selection.append('g');

    g.append('rect')
      .attr('x', box.left).attr('width', box.width)
      .attr('y', box.top).attr('height', box.height)
      .style('fill', 'grey').style('stroke', 'black')
      .on('click', e => clearMap(focusCounties, lineChartObject));
    
    g.append('text')
    	.style('text-anchor', 'middle')
    	.attr('x', box.left + box.width / 2)
    	.attr('y', box.top + box.height / 2 + 5)
    	.text("清除").style('stroke', 'black')
    	.style('user-select', 'none');
    
    g.append('rect')
      .attr('x', box.left).attr('width', box.width)
      .attr('y', box.top).attr('height', box.height)
      .on('click', e => clearMap(focusCounties, lineChartObject))
    	.style('opacity', 0);
  };

  const svg = d3$1.select('svg');
  const g = svg.append('g');
  const gBarchart = g.append('g');

  const projection = d3$1.geoMercator().center([124, 23.5]).scale(5800);
  const pathGenerator = d3$1.geoPath().projection(projection);

  const barchartBox = {top: 70, left: 370, width: 200, height: 350};
  const linechartBox = {top: 170, left: 620, width: 260, height: 420 - 170};
  const bubblechartBox = {top: 480, left: 125, width: 300, height: 300};
  const bubblechartBox2 = {top: 480, left: 550, width: 300, height: 300};
  const clearMapBox = {top: 30, left: 30, width: 60, height: 20};

  let selectedFruit = "香蕉";
  let selectedColumn = "產量_公噸";
  let selectedYear = "2021";

  let MainData; // 取得資料 MainData.get(year=null, fruit=null, county=null)

  let lineChartObject;
  let bubbleChartObject;
  let bubbleChartObject2;

  // svg.call(
  //   zoom()
  //   	.scaleExtent([1, 7000])
  //   	.on('zoom', (event) => {
  //   		g.attr('transform', event.transform);
  //     }
  // ));


  //*****dropdown-start
  const fruitOnClicked = d => {
  	selectedFruit = d;
    svg.selectAll(".barchart-element").remove();
    drawBarchart(gBarchart, {
      box: barchartBox,
      data: MainData.get(selectedYear, selectedFruit),
      column: selectedColumn,
    });
    
    recoverFocus(focusCounties);
    lineChartObject.updateFruit(selectedFruit);
    lineChartObject.replotLine(focusCounties, selectedFruit);
    bubbleChartObject.update(selectedYear, selectedFruit);
    bubbleChartObject2.update(selectedYear, selectedFruit);
  };

  const yearOnClicked = d => {
  	selectedYear = d;
    svg.selectAll(".barchart-element").remove();
    drawBarchart(gBarchart, {
      box: barchartBox,
      data: MainData.get(selectedYear, selectedFruit),
      column: selectedColumn,
    });
    
    recoverFocus(focusCounties);
    bubbleChartObject.update(selectedYear, selectedFruit);
    bubbleChartObject2.update(selectedYear, selectedFruit);
  };

  const columnOnClicked = d => {
  	selectedColumn = d;
    svg.selectAll(".barchart-element").remove();
    drawBarchart(gBarchart, {
      box: barchartBox,
      data: MainData.get(selectedYear, selectedFruit),
      column: selectedColumn,
    });
    
    recoverFocus(focusCounties);
    lineChartObject.updateColumn(d);  
    lineChartObject.replotLine(focusCounties, selectedColumn);
  };
    
  const fruitDrop =	d3$1.select('#fruit-menu')
      .call(dropdownMenu, {
        options: fruitItems,
        onOptionClicked: fruitOnClicked,
        selectedOption: selectedFruit,
    });

  const yearDrop =	d3$1.select('#year-menu')
      .call(dropdownMenu, {
        options: yearItems,
        onOptionClicked: yearOnClicked,
        selectedOption: selectedYear,
    });

  const columnDrop =	d3$1.select('#column-menu')
      .call(dropdownMenu, {
        options: columnItems,
        onOptionClicked: columnOnClicked,
        selectedOption: selectedColumn,
    });

  //*****dropdown-end

  const focusCounties = {};

  Promise
  	.all([
  		d3$1.json('COUNTY_MOI_1090820.json'),
    	d3$1.csv('fruit.csv'),
    ])
  	.then(([MapData, RawData]) => {

    	MainData = new DataLoader(RawData);  
    
    	const counties = topojson.feature(MapData, MapData.objects["COUNTY_MOI_1090820"]);

    	// initialize focusCounties with all false
    	counties.features.forEach(d => {focusCounties[d.properties['COUNTYNAME']] = false;});
    
    	const colorMap = g.selectAll('path')
      	.data(counties.features)
  	  	.enter().append('path')
    			.attr('class', 'county')
      		.attr('id', d => 'county-'+d.properties['COUNTYNAME']) // e.g. select("#county-臺北市")
    			.attr('d', d => pathGenerator(d))
      		// .attr('stoke', d => 'black')
      		.style('opacity', 0.8)
      		.on('mouseover', (e, d) => mouseoverMap(e, d.properties['COUNTYNAME'], selectedFruit, selectedYear, MainData.get(), focusCounties))
      		.on('mousemove', (e, d) => mousemoveMap(e, d.properties['COUNTYNAME']))
    			.on('mouseout', (e, d) => mouseoutMap(e, d.properties['COUNTYNAME'], focusCounties))
      		.on('click', (e, d) => onclickMap(e, d.properties['COUNTYNAME'], focusCounties, lineChartObject));
    
      drawBarchart(gBarchart, {
        box: barchartBox,
        data: MainData.get(selectedYear, selectedFruit),
        column: selectedColumn,
      });
    
      lineChartObject = new LineChart(g.append('g'), {
        box: linechartBox,
        data: MainData,
        fruit: selectedFruit,
        column: selectedColumn,
      });
    	lineChartObject.draw();
    
      bubbleChartObject = new BubbleChart(g.append('g'), {
        box: bubblechartBox,
        data: MainData,
        year: selectedYear,
        fruit: selectedFruit,
        id: 0,
        xcol: "每公頃平均產量_公斤",
        ycol: "收穫面積_公頃",
        scol: "產量_公噸",
      });
    	bubbleChartObject.draw();
    
      bubbleChartObject2 = new BubbleChart(g.append('g'), {
        box: bubblechartBox2,
        data: MainData,
        year: selectedYear,
        fruit: selectedFruit,
        id: 1,
        xcol: "每株平均產量_公斤",
        ycol: "收穫株數",
        scol: "產量_公噸",
      });
    	bubbleChartObject2.draw();
    
    	initHoverBox(g);
      initClearButton(g, clearMapBox, focusCounties, lineChartObject);

      
    	// pre-select top 5 county
    	const init_data = MainData.get(selectedYear, selectedFruit).sort((a, b) => b[selectedColumn]-a[selectedColumn]).slice(0, 5);
      for (const d of init_data) {
        onclickMap(null, d["地區別"], focusCounties, lineChartObject);
      }
    
  	});

}(d3, topojson));
