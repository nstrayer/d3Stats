var Dot_Plots = function(opts) {

    this.data    = opts.data;    //data in [{val: 4, group: 'a'},...] form
    this.element = opts.element; //div we are putting this viz in
    this.bins    = opts.bins;    //number of bins for grouping
    this.speed   = 800;          //speed of transitions

    // create the Dot_Plot
    this.draw();
}

Dot_Plots.prototype.draw = function() {
    // define width, height and paddings
    this.padding = 25;
    this.width   = this.element.offsetWidth - (2*this.padding);
    this.height  = (this.width / 2) - (2*this.padding);

    var svg = d3.select(this.element).append('svg')
        .attr('width',  this.width  + (2*this.padding))
        .attr('height', this.height + (2*this.padding));

    // make a g element to hold whole viz
    this.plot = svg.append('g')
        .attr("class", "box_plot_holder")
        .attr("transform", "translate(" + this.padding + "," + this.padding + ")");

    // create the other stuff
    this.findUniqueGroups(); //find the unique groups we have.
    this.createPlaceScale(); //generate the placement scale for groups
    this.createYScale();     //Make common y scale
    this.seperateGroups();   //Get data into the right form.
    this.findRadius();       //figure out how big to make the dots.
    this.generateDotPlots(); //convert data to histogram layout
    this.addAxes();          //draw the axes
}

//Generate a scale for placing the individual dot plots in parent svg.
Dot_Plots.prototype.findUniqueGroups = function() {
    //find unique groups
    var groups = []
    this.data.forEach(function(d){
        if (groups.indexOf(d.group) == -1){groups.push(d.group)}
    })

    this.groups = groups //make list of groups available to object.
}

//Generate a scale for placing the individual dot plots in parent svg.
Dot_Plots.prototype.createPlaceScale = function() {

    this.place_scale = d3.scale.ordinal()
        .domain(this.groups )
        .rangeBands([0, this.width]);

    this.color_scale = d3.scale.ordinal() //while we're here create a color scale.
        .domain(this.groups)
        .range(colorbrewer.Dark2[this.groups.length]);
}

//In order to be able to compare distributions we need to have a common y axis.
Dot_Plots.prototype.createYScale = function(){
    this.bounds = d3.extent(this.data, function(d){return d.val});

    this.yScale = d3.scale.linear()
        .domain(this.bounds)
        .range([this.height,0]);
}


Dot_Plots.prototype.seperateGroups = function() {
    var _this = this, //bring the values from overall object into this scope
        groupedData = [];


    // Generate a dotlayout using the histogram layout in d3
    var generateDotLayout = function(data){

        var dot_data = d3.layout.histogram()
            .bins(_this.yScale.ticks(_this.bins))
            (data);
        return dot_data;
    }

    _this.groups.forEach(function(group){   //run through groups
        var values = []                     //Vec of data for group
        _this.data.forEach(function(d){     //append data if it is in current group
            if(d.group == group){           //push datapoint value to group vector
                values.push(d.val)
            }
        })
        //For this group, use the histogram function to generate the data into binned values.
        groupedData.push({"group": group, "vals": generateDotLayout(values)})
    })

    this.groupedData = groupedData       //send it to the object scope.
}

Dot_Plots.prototype.findRadius = function(){
    // //find widest point in dotplots
    var widest = 0
    var groupedData = this.groupedData;

    this.groupedData.forEach(function(group){

        var group_data = group.vals

        group_data.forEach(function(d,i){ //scan through values to find widest band.
            if(d.y > widest){
                widest = d.y
            }
        })
    })

    this.radius = Math.min(this.place_scale.rangeBand()/widest * 0.90,
                  this.yScale(this.bounds[1] - groupedData[0].vals[0].dx)) //scale is flipped so this looks wonky.
}

Dot_Plots.prototype.generateDotPlots = function() {
    var t           = this,
        position    = this.place_scale,
        y_scale     = this.yScale,
        groupedData = this.groupedData,
        h           = this.height,
        num_bins    = this.bins,
        dotplots    = {},
        radius      = this.radius,
        boxWidth    = this.place_scale.rangeBand();

    //Make a g element for each indivual boxplot to live in.
    this.plot.selectAll("box_plot")
        .data(this.groupedData).enter()
        .append("g")
        .attr("id", function(d){return "group_" + d.group})
        .attr("transform", function(d) { return "translate(" + position(d.group) + "," + 0 + ")"; })
        .each(function(d){
            var currentGroup = d.group;
            var hist = d3.select(this).selectAll(".dots") //grab our current g
                .data(d.vals)                             //data is in the value element

            hist.enter().append("g")
                .attr("class", function(d){return "dots " + d.y})
                .attr("transform", function(d) { return "translate(" + (boxWidth/2) + "," + y_scale(d.x) + ")"; })
                .each(function(d){
                    var totalLength = radius*d.length
                    d3.select(this).selectAll("circle")
                        .data(d).enter().append("circle")
                        .attr("fill", t.color_scale(currentGroup))
                        .attr("r", radius/2)
                        .attr("cx", 0)
                        .attr("cy", -radius/2)
                        .transition().duration(t.speed)
                        .attr("cx", function(d,i){return -totalLength/2 + (radius)*i + radius/2})
                });

            //
            // hist.transition()
            //     .each(function(d){
            //         var totalLength = radius*d.length
            //
            //         var yPos = x(d.y),
            //             dots = d3.select(this).selectAll("circle").data(d);
            //
            //         dots.exit().remove()
            //
            //         dots.transition().duration(speed)
            //             .attr("r", radius/2)
            //             .attr("cy", -radius/2)
            //             .attr("cx", function(d,i){return -totalLength/2 + (radius)*i + radius/2})
            //
            //         dots.enter()
            //             .append("circle")
            //             .attr("r", radius/2)
            //             .attr("cx", w)
            //             .attr("cy", -radius/2)
            //             .transition().duration(speed)
            //             .attr("cx", function(d,i){return -totalLength/2 + (radius)*i + radius/2})
            //     });

            // hist.exit()
            //     .remove()
        })
}

Dot_Plots.prototype.addAxes = function(){

    var yAxis = d3.svg.axis()
        .scale(this.yScale)
        .orient("left");

    this.plot.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + 0 + ",0)")
        .call(yAxis)
            .selectAll("text")
            .attr("transform", "translate( 4 ," + -6 + ")");

    var xAxis = d3.svg.axis()
        .scale(this.place_scale)
        .orient("bottom");

    var placeAxis = this.plot.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")")
        .call(xAxis)

    placeAxis.select("path") //get rid of the horizontal line
        .attr("stroke-width", 0)

    placeAxis.selectAll("line") //get rid of the ticks, they look like datapoints
        .attr("stroke-width", 0)

    placeAxis.selectAll("text")
        .attr("font-size", "1.2em")
        .attr("font-family", "optima")
}

Dot_Plots.prototype.updateAxes = function(){

    var yAxis = d3.svg.axis()
        .scale(this.xScale)
        .orient("right");

    this.plot.select(".y.axis").transition()
        .attr("transform", "translate(0," + this.height + ")")
        .call(yAxis)
            .selectAll("text")
            .attr("transform", "translate( 0 ," + -4 + ")");
}
