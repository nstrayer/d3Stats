var Dot_Plot = function(opts) {
    // load in arguments from config object
    this.data   = opts.data;      //vector of datapoints.
    this.plot   = opts.element;   //g that we are going into.
    this.bins   = opts.bins;      //number of bins we are grouping data into.
    this.center = opts.center;    //this box plots position on the svg.
    this.width  = opts.thickness; //how much of the width of the svg we have for this plot.
    this.height = opts.height;    //height of svg appending to.
    this.bounds = opts.bounds;    //common y scale for all dotplots
    this.color  = "steelblue";    //default color.
    this.speed  = 800;            //how fast the transitions are.
    this.yScale = opts.yScale;
    this.radius = opts.radius;

    // create the Dot_Plot
    this.draw();
}

Dot_Plot.prototype.draw = function() {
    // Run functions to draw.
    this.createXScale();      //make the y scale based on that hist data.
    this.drawDotPlot();       //actually draw the dotplot
    this.setColor(this.color) //color the Dot_Plot.
}


Dot_Plot.prototype.createXScale = function(){
    this.xScale = d3.scale.linear()
        .domain([0, d3.max(this.data, function(d) { return d.y; })])
        .range([0, this.width]);
}

Dot_Plot.prototype.drawDotPlot = function(){
    //minumum observed data, needed for calculating bin width
    this.min = this.yScale.domain()

    var h = this.height,
        w = this.width,
        x = this.xScale,
        y = this.yScale,
        dot_data  = this.data,
        bin_width = h - y(this.min + dot_data[0].dx), //these are flipped because of the vertical plots.
        speed     = this.speed,
        radius    = this.radius;


    var hist = this.plot.selectAll(".dots")
        .data(dot_data)

    hist.transition()
        .each(function(d){
            var totalLength = radius*d.length

            var yPos = x(d.y),
                dots = d3.select(this).selectAll("circle").data(d);

            dots.exit().remove()

            dots.transition().duration(speed)
                .attr("r", radius/2)
                .attr("cy", -radius/2)
                .attr("cx", function(d,i){return -totalLength/2 + (radius)*i + radius/2})

            dots.enter()
                .append("circle")
                .attr("r", radius/2)
                .attr("cx", w)
                .attr("cy", -radius/2)
                .transition().duration(speed)
                .attr("cx", function(d,i){return -totalLength/2 + (radius)*i + radius/2})
        });

    hist.enter().append("g")
        .attr("class", function(d){return "dots " + d.y})
        .attr("transform", function(d) { return "translate(" + (w/2) + "," + y(d.x) + ")"; })
        .each(function(d){
            var totalLength = radius*d.length
            var yPos = x(d.y)
            d3.select(this).selectAll("circle")
                .data(d).enter().append("circle")
                .attr("r", radius/2)
                .attr("cx", 0)
                .attr("cy", -radius/2)
                .transition().duration(speed)
                .attr("cx", function(d,i){return -totalLength/2 + (radius)*i + radius/2})
        });

    hist.exit()
        .remove()

    hist.on("mouseover", function(d){
        var range = "There are " + d.length + " values from " + d.x + " to " + (d.x + d.dx);
    })
}

// the following are "public methods"
// which can be used by code outside of this file
Dot_Plot.prototype.setColor = function(newColor) {

    this.plot.selectAll('circle')
        .style('fill',newColor);

    // store for use when redrawing
    this.color = newColor;
}

Dot_Plot.prototype.setData = function(newData) {
    this.data = newData;

    this.createYScale();
    this.generateHist(this.bins);
    this.createXScale();
    this.updateAxes();
    this.drawDotPlot();
    this.setColor(this.color);
}
