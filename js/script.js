// // Generate a Bates distribution of 10 random variables.
var values = d3.range(1000).map(d3.random.bates(10));

var margin = {top: 10, right: 30, bottom: 30, left: 30},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var updatableChart = histogram()
    .width(width).height(height)
    .data(values);

d3.select('#viz')
  .call(updatableChart);
