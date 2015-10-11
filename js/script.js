//just some nonsense to move objects to front easily.
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

var width = parseInt(d3.select("#viz").style("width").slice(0, -2)),
    height = $(window).height() - 120;


// d3.csv("data/normalData.csv", function(orig_data){
normal_descrips = ["Start with some points drawn from the normal distribution.",
                  "Drop those points (transform them) onto the CDF of the normal...",
                  "...and end up with uniformly distributed points." ]

chi2_descrips = ["Start with some points drawn from the normal distribution.",
                "Drop those points (transform them) onto the equation y = x^2...",
                "...and end up with chi_squared distributed points." ]

function runViz(fileName, descrips){
    d3.csv("data/" + fileName, function(orig_data){
        vals = []
        orig_data.forEach(function(d){
            d.x = +d.x
            d.y = +d.y
            vals.push(d.x)
        })

        console.log(iqr(vals)

        //set up data with the different states of the visualization.

        var state1 = JSON.parse(JSON.stringify(orig_data)); //it's hard to clone an object!
        state1.forEach(function(d){ d.y = 1 })

        var updatableChart = scatter()
            .width(width).height(height)
            .data(state1)
            .animationDuration(800);

        d3.select('#viz')
          .call(updatableChart);

    })
}

//initialize the viz
runViz("chiSquaredVals.csv", chi2_descrips)

//allow the user to change which transform they see.
d3.selectAll(".typeChoose").on("click", function(d){
    var selection = d3.select(this)
    console.log(selection.attr("fileName"))
    d3.selectAll(".typeChoose").classed("selected", false)
    selection.classed("selected", true)
    d3.select("svg").remove()
    if(selection.attr("id") == "normal"){ //grab the correct descrips for the viz
        var descrips = normal_descrips
    } else {
        var descrips = chi2_descrips
    }
    runViz(selection.attr("fileName"), descrips)
})
