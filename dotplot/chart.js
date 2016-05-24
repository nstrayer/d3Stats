var Chart = function(opts) {
    // load in arguments from config object
    this.data    = opts.data;
    this.element = opts.element;
    this.bins    = opts.bins;
    this.color   = "steelblue" //default color
    this.speed = 1000;

    // create the chart
    this.draw();
}

Chart.prototype.draw = function() {
    // define width, height and paddings
    this.padding = 20;
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
    this.createXScale();
    this.generateHist(this.bins); //convert data to histogram layout
    this.createYScale(); //make the y scale based on that hist data.
    this.drawHist(); //actually draw the histogram
    this.addAxes(); //draw the axes
    this.setColor(this.color) //color the chart.
}

Chart.prototype.createXScale = function(){
    // shorthand to save typing later
    var w = this.width,
        raw_data = this.data;

    this.xScale = d3.scale.linear()
        .domain(d3.extent(raw_data))
        .range([0, w]);
}

Chart.prototype.generateHist = function(){

    // Generate a histogram w/ uniformly-spaced bins.
    this.hist_data = d3.layout.histogram()
        .bins(this.xScale.ticks(this.bins))
        (this.data);
}

Chart.prototype.createYScale = function(){
    this.yScale = d3.scale.linear()
        .domain([0, d3.max(this.hist_data, function(d) { return d.y; })])
        .range([this.height, 0]);
}

Chart.prototype.addAxes = function(){

    var h = this.height,
        w = this.width;

    var xAxis = d3.svg.axis()
        .scale(this.xScale)
        .orient("bottom");

    this.plot.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis)
            .selectAll("text")
            .attr("transform", "translate( 0 ," + -4 + ")");
}

Chart.prototype.updateAxes = function(){

    var h = this.height,
        w = this.width;

    var xAxis = d3.svg.axis()
        .scale(this.xScale)
        .orient("bottom");

    this.plot.select(".x.axis").transition()
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis)
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
        bin_width = x(this.min + hist_data[0].dx),
        radius = (h - y(hist_data[0].y)) / hist_data[0].length,
        speed = this.speed;

    // A formatter for counts.
    var formatCount = d3.format(",.0f");

    var hist = this.plot.selectAll(".bar")
        .data(this.hist_data)

    hist.transition()
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; })
        .each(function(d){

            var dots = d3.select(this).selectAll("circle").data(d)

            dots.transition().duration(speed)
                .attr("r", radius/2)
                .attr("cy", function(d,i){return (radius)*i + radius/2})
                .attr("cx", bin_width/2)

            dots.enter()
                .append("circle")
                .attr("r", radius/2)
                .attr("cy", h)
                .attr("cx", bin_width/2)
                .transition().duration(speed)
                .attr("cy", function(d,i){return (radius)*i + radius/2})

            dots.exit()
                .transition().duration(speed)
                .attr("cy", h)
                .remove()

            d3.select(this).select("text") //update the text
                .transition()
                .attr("x", bin_width / 2)
                .attr("y", -14)
                .text(function(d) { return d.y != 0 ? formatCount(d.y) : ""; });
        });

    hist.enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; })
        .each(function(d){
            d3.select(this).selectAll("circle")
                .data(d).enter().append("circle")
                .attr("r", radius/2)
                .attr("cy", function(d,i){return (radius)*i + radius/2})
                .attr("cx", bin_width/2)

            d3.select(this).append("text") //draw the text
                .attr("dy", ".75em")
                .attr("y", -14)
                .attr("x", bin_width / 2)
                .attr("text-anchor", "middle")
                .attr("fill", "#fff;")
                .text(function(d) { return d.y != 0 ? formatCount(d.y) : "";  });
        });

    hist.exit()
        .remove()
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

    this.createXScale();
    this.generateHist(this.bins);
    this.createYScale();
    this.updateAxes();
    this.drawHist();
    this.setColor(this.color);
}
