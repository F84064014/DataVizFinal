import {randColor} from './option.js';

const colorPicker = randColor();

const setMapHighLight = (countyName, color) => {
	d3.select("#county-"+countyName)
		.style('stroke', color)
		.style('stroke-opacity', 1)
		.style('stroke-width', 2);
}

// I wanna use it at Linechart
export const removeMapHighLight = (countyName) => {
  d3.select("#county-"+countyName)
    .style('stroke', 'black')
    .style('stroke-opacity', 0.4)
    .style('stroke-width', 1);
}

const setRectColor = (countyName, color) => {
    d3.select("#rect-"+countyName)
  	.style('fill', color);
}

export const mouseoverMap = (e, countyName, fruitName, year, data, focusCounties) => {
  
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
  var total = d3.sum(data.filter(d => ((d["年度"]==year) && (d["果品類別"]===fruitName))), d=>d["產量_公噸"])
  var value = 
    data.filter(
      d => ((d["果品類別"]===fruitName) && (d["地區別"]===countyName) && (d["年度"]==year))
    )[0]["產量_公噸"]
  
  d3.select("#hover-box-line1")
  	.attr('x', e.x+3).attr('y', e.y + 32)
  	.style('opacity', 1)
    .text(
    	fruitName+"產量: "+d3.format(".2s")(value)+"公噸"+
    	" ("+d3.format(".1%")(value/total)+")"
  	);
  
  // line 2
  total = d3.sum(data.filter(d => ((d["年度"]==year) && (d["果品類別"]===fruitName))), d=>d["收穫面積_公頃"])
  value = 
    data.filter(
      d => ((d["果品類別"]===fruitName) && (d["地區別"]===countyName) && (d["年度"]==year))
    )[0]["收穫面積_公頃"]
  
  d3.select("#hover-box-line2")
  	.attr('x', e.x+3).attr('y', e.y + 64)
  	.style('opacity', 1)
    .text(
    	fruitName+"收穫面積: "+d3.format(".2s")(value)+"公頃"+
    	" ("+d3.format(".1%")(value/total)+")"
  	);

}

export const mouseoutMap = (e, countyName, focusCounties) => {

  if (! focusCounties[countyName]) {
    removeMapHighLight(countyName);
    setRectColor(countyName, '#00cc99');
  }
  else {
	  // setMapHighLight(countyName, 'purple');  
	  // setRectColor(countyName, 'purple');
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
}

export const mousemoveMap = (e, countyName) => {
  
  d3.select(".hover-box")
  	.attr('x', e.x).attr('y', e.y); 
  
  d3.select("#hover-box-title")
  	.attr('x', e.x+3).attr('y', e.y + 16)
  
  d3.select("#hover-box-line1")
  	.attr('x', e.x+3).attr('y', e.y + 32)
  
  d3.select("#hover-box-line2")
  	.attr('x', e.x+3).attr('y', e.y + 48)
}

export const onclickMap = (e, countyName, focusCounties, lineChartObject) => {
  
  if (!focusCounties[countyName]) {
    const color = colorPicker.next().value;
		setMapHighLight(countyName, color);
  	// setRectColor(countyName, color);
    lineChartObject.drawLine(countyName, color);
    d3.select('#county-label-'+countyName).style('stroke', color);
    d3.select('#bubble-node-'+countyName+"-0").style('opacity', 0.6).style('fill', color);
    d3.select('#bubble-node-'+countyName+"-1").style('opacity', 0.6).style('fill', color);
    d3.select('#rect-'+countyName).style('fill', 'orange')
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
  
}

export const clearMap = (focusCounties, lineChartObject) => {
  console.log(focusCounties);
  for (const [countyName, color] of Object.entries(focusCounties)) {
    if (!color) {continue;}
    onclickMap(null, countyName, focusCounties, lineChartObject);
    focusCounties[countyName] = null;
  	setRectColor(countyName, '#00cc99');
    removeM