

var topDiv = d3.select('body')
    .append('div')
    .style('display', 'block')
    .classed('top-level-div', true);

topDiv.append('div')
    .classed('pres-title', true)
    .html('About Printing Reports');

topDiv.append('div')
    .classed('page-title', true);

var bulletsDiv = topDiv.append('div')
    .classed('bullets-div', true);

addToolbar();

setActivePage(0);
