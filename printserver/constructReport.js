var constructReport = function(data) {
  d3.select('body')
    .append('h1')
    .text(data.header.reportName);
};
