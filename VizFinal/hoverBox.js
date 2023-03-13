import { clearMap } from './mapEvent';

export const initHoverBox = (selection) => {
	
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
  	.style('user-select', 'none')
  
  g.append('text')
  	.attr('x', 0).attr('y', 0)
  	.text("line1")
  	.attr('id', 'hover-box-line1')
  	.style('text-align', 'start')
  	.style('opacity', 0)
  	.style('user-select', 'none')
  
  g.append('text')
  	.attr('x', 0).attr('y', 0)
  	.text("line2")
  	.attr('id', 'hover-box-line2')
  	.style('text-align', 'start')
  	.style('opacity', 0)
  	.style('user-select', 'none')
  
}

export const initClearButton = (selection, box, focusCounties, lineChartObject) => {
  
  const g = selection.append('g');

  g.append('rect')
    .attr('x', box.left).attr('width', box.width)
    .attr('y', box.top).attr('height', box.height)
    .style('fill', 'grey').style('stroke', 'black')
    .on('click', e => clearMap(focusCounties, lineChartObject))
  
  g.append('text')
  	.style('text-anchor', 'middle')
  	.attr('x', box.left + box.width / 2)
  	.attr('y', box.top + box.height / 2 + 5)
  	.text("清除").style('stroke', 'black')
  	.style('user-select', 'none')
  
  g.append('rect')
    .attr('x', box.left).attr('width', box.width)
    .attr('y', box.top).attr('height', box.height)
    .on('click', e => clearMap(focusCounties, lineChartObject))
  	.style('opacity', 