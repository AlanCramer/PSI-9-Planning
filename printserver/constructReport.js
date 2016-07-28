var constructReport = function(data) {
    var title = 'Workshop Asssessment Class Report';
    var subTitle = 'Class 1 - Read 180';
    logoFile = './standAloneReports/images/d3Report/work_shop_logo.svg';

    LRS.buildTitle(d3.select('body'), title, subTitle, logoFile);

    var barChartDiv = d3.select('body').append('div').attr('class', 'bar-chart-div');
    createBarChart(barChartDiv, fakeBCModel);
};
