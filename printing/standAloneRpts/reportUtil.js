
var LRS = LRS || {};

// appends a summary to the passed in container (a d3 selection),
// e.g. 
// LRS.buildSummary(d3.select('body'), 'title', 'sub', path-to-logo-as-string)

LRS.buildTitle = function(container, title, subTitle, logo) {

    container.append('div');

    container.append('div')
    	.attr('id', 'title')
    	.append('label')
    	.text(title);

    container.append('div')
    	.attr('class', 'rightBox')
    	.append('img')
    	.attr('src', logo);

    container.append('div')
    	.attr('id', 'subTitle')
    	.append('label')
    	.text(subTitle);
}
