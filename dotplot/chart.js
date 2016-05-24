var Chart = function(opts) {
    // load in arguments from config object
    this.data    = opts.data;
    this.element = opts.element;
    this.bins    = opts.bins;
    this.color   = "steelblue" //default color
    this.speed = 1000;
    this.mouseOver = function(d){
        console.log(d)
    }

    // create the chart
    this.draw();
}

Chart.prototype.draw = function() {
    // define width, height and paddings
    this.padding = 40;
    this.width   = this.element.offsetWidth - (2*this.padding);
    this.height  = (this.width / 2) - (2*this.padding);

    // set up parent element and SVG
    this.element.innerHTML = '';
    var svg = d3.select(this.element).append('svg');
    svg.attr('width',  this.width  + (2*this.padding));
    svg.attr('height', this.height + (2*this.padding));

    // we'll actually be appending to a <g> element
    this.plot = svg.append('g')
        .attr("transform", "translate(" + this.padding + "," + this.padding + ")");

    // create the other stuff
    this.createYScale();
    this.generateHist(this.bins); //convert data to histogram layout
    this.createXScale(); //make the y scale based on that hist data.
    this.drawHist(); //actually draw the histogram
    this.addAxes(); //draw the axes
    this.setColor(this.color) //color the chart.
}

Chart.prototype.createYScale = function(){
    this.yScale = d3.scale.linear()
        .domain(d3.extent(this.data))
        .range([this.height,0]);

    console.log(d3.extent(this.data))
}

Chart.prototype.generateHist = function(){
    // Generate a histogram w/ uniformly-spaced bins.
    this.hist_data = d3.layout.histogram()
        .bins(this.yScale.ticks(this.bins))
        (this.data);
}

Chart.prototype.createXScale = function(){
    this.xScale = d3.scale.linear()
        .domain([0, d3.max(this.hist_data, function(d) { return d.y; })])
        .range([0, this.width]);
}

Chart.prototype.addAxes = function(){

    var yAxis = d3.svg.axis()
        .scale(this.yScale)
        .orient("left");

    this.plot.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + 0 + ",0)")
        .call(yAxis)
            .selectAll("text")
            .attr("transform", "translate( 4 ," + -6 + ")");
}

Chart.prototype.updateAxes = function(){

    var yAxis = d3.svg.axis()
        .scale(this.xScale)
        .orient("right");

    this.plot.select(".x.axis").transition()
        .attr("transform", "translate(0," + this.height + ")")
        .call(yAxis)
            .selectAll("text")
            .attr("transform", "translate( 0 ," + -4 + ")");
}

Chart.prototype.drawHist = function(){
    //minumum observed data, needed for calculating bin width
    this.min = d3.min(this.data)

    var h = this.height,
        w = this.width,
        x = this.xScale,
        y = this.yScale
        hist_data = this.hist_data,
        bin_width = h - y(this.min + hist_data[0].dx), //these are flipped because of the vertical plots.
        radius = (x(hist_data[0].y)) / hist_data[0].length,
        speed  = this.speed;

    // A formatter for counts.
    var formatCount = d3.format(",.0f");

    var hist = this.plot.selectAll(".dots")
        .data(this.hist_data)

    hist.transition()
        .attr("transform", function(d) { return "translate(" + (w/2) + "," + y(d.x) + ")"; })
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
        .attr("class", "dots")
        .attr("transform", function(d) { return "translate(" + (w/2) + "," + y(d.x) + ")"; })
        .each(function(d){
            var totalLength = radius*d.length
            var yPos = x(d.y)
            d3.select(this).selectAll("circle")
                .data(d).enter().append("circle")
                .attr("r", radius/2)
                .attr("cx", w)
                .attr("cy", -radius/2)
                .transition().duration(speed)
                .attr("cx", function(d,i){return -totalLength/2 + (radius)*i + radius/2})
        });

    hist.exit()
        .remove()

    hist.on("mouseover", function(d){
        var range = "There are " + d.length + " values from " + d.x + " to " + (d.x + d.dx);
        console.log(range)
    })
}

// the following are "public methods"
// which can be used by code outside of this file
Chart.prototype.setColor = function(newColor) {

    this.plot.selectAll('circle')
        .style('fill',newColor);

    // store for use when redrawing
    this.color = newColor;
}

Chart.prototype.setData = function(newData) {
    this.data = newData;

    this.createYScale();
    this.generateHist(this.bins);
    this.createXScale();
    this.updateAxes();
    this.drawHist();
    this.setColor(this.color);
}
