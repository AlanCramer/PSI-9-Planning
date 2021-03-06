
var fakeBCModel = {
    title : 'This is a Bar Chart',
    data  : [
        {   name : 'Theme',
            values : [ 57, 92 ],
            cssClasses : [ 'level-a', 'level-b'] },
        {   name : 'Context Clues',
            values : [ 60, 12],
            cssClasses : [ 'level-a', 'level-b'] },
        {   name : 'Word Meanings',
            values : [ 60, 12],
            cssClasses : [ 'level-a', 'level-b'] } ],
    legend : [
        {   name : 'Level A',
            cssClasses : 'level-a'},
        {   name : 'Level B',
            cssClasses : 'level-b'}
        ]
};

var //d3 = $window.d3,
    padding = 100, // todo, revisit this
    margin = {top: 20, right: 200, bottom: 30, left: 60},
    width = 900 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom
    chartModel = fakeBCModel,
    container = d3.select('.bar-chart-div');

var insertLinebreaks = function (text, width, xval) {

    text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr('y'),
            dy = parseFloat(text.attr('dy')),
            tspan = text.text(null).append('tspan').attr('x', xval).attr('y', y).attr('dy', dy + 'em');

        while (!!(word = words.pop())) {
            line.push(word);
            tspan.text(line.join(' '));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(' '));
                line = [word];
                tspan = text.append('tspan').attr('x', xval).attr('y', y).attr('dy',
                    ++lineNumber * lineHeight + dy + 'em').text(word);
            }
        }
    });
};

// these two functions, in a very inelegant way,
// tag the ticks that correspond to a skill that has a cssClass flag
var applyCssClass = function(ticks, tags) {

    tags.forEach(function(tag) {
        d3.select(ticks[0][tag.index]).classed(tag.value, true);
    });
};

var findTagIndicies = function(skills, tagIndicies) {

    skills[0].forEach(function(sg, i) {
        if (sg.__data__.cssClass) {
            tagIndicies.push({
                index: i,
                value: sg.__data__.cssClass
            });
        }
    });
};

var updateBarChart = function(newData, cssClasses) {

    var y0 = d3.scale.ordinal()
        .rangeRoundBands([0, height]);

    var y1 = d3.scale.ordinal();

    var x = d3.scale.linear()
        .range([0, width]);

    y0.domain(newData.map(function(d) { return d.name; }));
    y1.domain(d3.range(d3.max(newData.map(function(d) { return d.values.length; })) + 1))
        .rangeRoundBands([0, y0.rangeBand()], 0.1);

    // todo - when will we want a new xRange?
    //var dummy = chartModel.xRange ?
    //    x.domain(chartModel.xRange) :
    x.domain([0, d3.max(newData, function(d) {
        return d3.max (d.values); }
    )]);

    var svg = d3.select('.horiz-bar-chart');
    var svgg = d3.select('.horiz-bar-chart-svg-g');

    svgg.selectAll('.skill').remove();

    var skills = svgg.selectAll('.skill')
        .data(newData);

    //skills.exit().remove();

    skills.enter().append('g')
        .attr('class', function(d) { return 'skill ' + (d.cssClass ? d.cssClass : '');})
        .attr('transform', function(d, i) {
            var dist = y0(d.name) + 16; // total fudge factor ... todo, remove
            return 'translate(0,' + dist + ')';
        });

    skills.selectAll('.bar')
        .data(function(d) {
            return d.values; }) // d.values is generally a one or two element array of numbers
        .enter().append('rect')
        .attr('class', function(d, i) {
            return 'bar ' + (cssClasses ? cssClasses[i] : ''); })
        .attr('x', function(d, i) { return padding; })
        .attr('width', function (d) { return x(d); })
        .attr('y', function(d, i) { return y1(i); })
        .attr('height', function(d, i) { return y1.rangeBand(); })
        .data(function (d) {
            return d.cssClasses || [];
        })
        .attr('class', function(d) {
            // Append d if it exists, or return the element's existing set of classes otherwise
            return d ? (this.classList.value + ' ' + d) : this.classList.value;
        });

    var scoreLabelFudgeValue = 4; // TODO: What should this really be? Needed for now to better align labels with bars.

    skills.selectAll('.text')
        .data(function(d) {
            return d.values; })
        .enter().append('text')
        .attr('x', function(d, i) { return x(d) + padding + 10; })
        .attr('y', function(d, i) { return y1(i) + (y1.rangeBand() / 2) + scoreLabelFudgeValue; })
        .text(function(d) {return d.toString() + ' %';})
        .style('font-size', '14px')
        .style('font-weight', 'bold')
    ;

    var yAxis = d3.svg.axis()
        .scale(y0)
        .orient('right')
        .tickFormat(function(d) {
            return d;
        })
        .tickSize(0)
    ;

    // this does not feel right ...
    // but we need to apply the cssClass that is on the barData to the corresponding tick
    // current strategy is the _assume_ 1 to 1 correspondence between ticks and bars

    var tagIndicies = [];
    //skills.call(findTagIndicies, tagIndicies);

    svg.select('.y.axis')
        .attr('transform', 'translate(' + padding + ', 0)')
        .call(yAxis)
        .selectAll('.tick text')
        .call(insertLinebreaks, 80, -140) // function of padding
        //.call(applyCssClass, tagIndicies)
        ;
};

var createLegend = function (container, fields) {

    var legendContainer = container.append('div')
        .attr('class', 'legend');

    var legendCells = legendContainer.selectAll('div')
        .data(fields)
        .enter()
        .append('div')
        .style('display', 'inline');

    var svg = legendCells.append('svg')
        .style('padding', '0')
        .style('margin', '0')
        .style('width', '10px')
        .style('height', '10px');

    svg.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('class', function(d) {return d.cssClass;})
        .attr('x', '0')
        .attr('y', '0');

    legendCells.append('span')
        .attr('class', 'legend-label')
        .style('padding-left', '5px')
        .style('padding-right', '10px')
        .text(function (d) {return d.name;});
};


    var data = chartModel.data;

    var y0 = d3.scale.ordinal()
        .rangeRoundBands([0, height]);

    var y1 = d3.scale.ordinal();

    var x = d3.scale.linear()
        .range([0, width]);

    var yAxis = d3.svg.axis()
        .scale(y0)
        .orient('right')
        .tickFormat(function(d) {
            return d;
        })
        .tickSize(0)
        ;

    var additionalMaxHeight = 100;

    var svg = container.append('svg')
        .attr('viewBox', '0 0 ' +
            (width + margin.left + margin.right) + ' ' +
            (height + margin.top + margin.bottom))
        .attr('preserveAspectRatio', 'xMidYMid')
        .style('max-height', (height + margin.top + margin.bottom + additionalMaxHeight) + 'px')
        .attr('class', 'horiz-bar-chart')
        .append('g')
        .attr('class', 'horiz-bar-chart-svg-g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    y0.domain(data.map(function(d) { return d.name; }));
    y1.domain(d3.range(d3.max(data.map(function(d) { return d.values.length; })) + 1))
        .rangeRoundBands([0, y0.rangeBand()], 0.1);

    var dummy = chartModel.xRange ?
        x.domain(chartModel.xRange) :
        x.domain([0, d3.max(data, function(d) {
            return d3.max (d.values); }
        )]);

    svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + padding + ', 0)')
        .call(yAxis)
        .selectAll('.tick text')
        .call(insertLinebreaks, 80, -140); // function of padding

    if (chartModel.legendFields) {
        createLegend(container, chartModel.legendFields);
    }

    var newData = chartModel.data;
    if (chartModel.filterData && chartModel.filterData.length > 0) {
        newData = chartModel.data.filter(function (d) {
            var keep = chartModel.filterData[0].keeperRows.find(function (kr) {
                return kr === d.name;
            });
            return !!keep;
        }).sort(function (d1, d2) {
            return d1.name.toLowerCase() > d2.name.toLowerCase(); // Alphabetically ascending, A -> Z
        });
    }

    updateBarChart(newData, chartModel.cssClasses);

    // Needed to offset the strand labels a bit more to the left, relative to the skill labels.
    d3.selectAll('.y.axis .tick text')
        .call(adjustStrandLabels, -20);

    function adjustStrandLabels(text, offset) {
        text.each(function() {
            var text = d3.select(this),
                tspan = text.select('tspan');

            if (text.classed('category')) {
                tspan.attr('x', parseInt(tspan.attr('x')) + offset);
            }
        });
    }
