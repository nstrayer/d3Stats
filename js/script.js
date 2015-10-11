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

// function runViz(fileName){
//     d3.csv("data/" + fileName, function(orig_data){
//         vals = []
//         orig_data.forEach(function(d){
//             d.x = +d.x
//             d.y = +d.y
//             vals.push(d.x)
//         })
//
//         console.log(iqr(vals))
//
//
//
//
//     })
// }
//
// //initialize the viz
// runViz("normalData.csv")


// function runViz(fileName, descrips){
//     d3.csv("data/" + fileName, function(orig_data){
//         vals = []
//         orig_data.forEach(function(d){
//             d.x = +d.x
//             d.y = +d.y
//             vals.push(d.x)
//         })
//
//         console.log(iqr(vals)
//
//         //set up data with the different states of the visualization.
//
//         var state1 = JSON.parse(JSON.stringify(orig_data)); //it's hard to clone an object!
//         state1.forEach(function(d){ d.y = 1 })
//
//         var updatableChart = scatter()
//             .width(width).height(height)
//             .data(state1)
//             .animationDuration(800);
//
//         d3.select('#viz')
//           .call(updatableChart);
//
//     })
// }
