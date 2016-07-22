
var LRS = LRS || {};
LRS.buildSummary = function(title, subTitle, logo) {

    //d3.select('body').append('h1').text('yo, world');
    //var body = d3.select('body');
    var container = d3.select('body').append('div');

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

