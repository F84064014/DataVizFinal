import {
  select,
  csv,
  geoMercator,
  geoPath,
  json,
  zoom,
  event,
  extent,
  scaleLinear,
  scaleExtent,
  format,
} from 'd3';
import {feature} from 'topojson';
import {fruitItems, yearItems, columnItems, marketItems, yearFromItems} from './option.js';
import {dropdownMenu} from './dropdown.js';
import {drawBarchart, recoverFocus} from './barchart.js';
import { LineChart } from './linechart.js'; /* class LineChart  */
import { BubbleChart } from './bubblechart.js'; /* class BubbleChart */
import { DataLoader } from './dataloader.js';
import {mouseoverMap, mouseoutMap, mousemoveMap, onclickMap, clearMap} from './mapEvent.js';
import {initHoverBox, initClearButton} from './hoverBox.js';

const svg = select('svg');
const g = svg.append('g');
const gBarchart = g.append('g');

const projection = geoMercator().center([124, 23.5]).scale(5800);
const pathGenerator = geoPath().projection(projection);

const barchartBox = {top: 70, left: 370, width: 200, height: 350}
const linechartBox = {top: 170, left: 620, width: 260, height: 420 - 170}
const bubblechartBox = {top: 480, left: 125, width: 300, height: 300}
const bubblechartBox2 = {top: 480, left: 550, width: 300, height: 300}
const clearMapBox = {top: 30, left: 30, width: 60, height: 20}

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
}

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
}

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
}
  
const fruitDrop =	select('#fruit-menu')
    .call(dropdownMenu, {
      options: fruitItems,
      onOptionClicked: fruitOnClicked,
      selectedOption: selectedFruit,
  });

const yearDrop =	select('#year-menu')
    .call(dropdownMenu, {
      options: yearItems,
      onOptionClicked: yearOnClicked,
      selectedOption: selectedYear,
  });

const columnDrop =	select('#column-menu')
    .call(dropdownMenu, {
      options: columnItems,
      onOptionClicked: columnOnClicked,
      selectedOption: selectedColumn,
  });

//*****dropdown-end

const focusCounties = {};

Promise
	.all([
		json('COUNTY_MOI_1090820.json'),
  	csv('fruit.csv'),
  ])
	.then(([MapData, RawData]) => {

  	MainData = new DataLoader(RawData);  
  
  	const counties = feature(MapData, MapData.objects["COUNTY_MOI_1090820"]);

  	// initialize focusCounties with all false
  	counties.features.forEach(d => {focusCounties[d.properties['COUNTYNAME']] = false;})
  
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
  	const init_data = MainData.get(selectedYear, selectedFruit).sort((a, b) => b[selectedColumn]-a[selectedColumn]).slice(0, 5)
    for (const 