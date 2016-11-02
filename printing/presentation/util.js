

var setActivePage = function(pageIdx) {

    var page = pages[pageIdx];

    var title = topDiv.select('.page-title')
        .html(page.title);

    var bullets = bulletsDiv.selectAll('.bullet')
        .data(page.bullets);

    bullets.enter()
        .append('div')
        .classed('bullet', true)
      .merge(bullets)
        .html(function(d) { return d; })
        ;

    bullets.exit()
        .remove();

}

var addToolbar = function() {
    var toolbar = topDiv.append('div')
        .classed('button-row', true);

    toolbar.append('button')
        .classed('nav-button', true)
        .html('<< Previous')
        .on('click', function() {
            activePage = (activePage + pages.length - 1) % pages.length;
            setActivePage(activePage);
            console.log('activePage  is ' + activePage);
        })
        ;

    toolbar.append('button')
        .classed('nav-button', true)
        .html('Next >>')
        .on('click', function() {
            activePage = (activePage +1) % pages.length;
            setActivePage(activePage);
            console.log('activePage  is ' + activePage);
        })
        ;
}
