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

    var range = [] //colorbrewer only has scales as little as 3.
    if(this.groups.length == 1){
        range = ["#1b9e77"]
    } else if (this.groups.length == 2){
        range = ["#1b9e77", "#d95f02"]
    } else {
        range = colorbrewer.Dark2[this.groups.length]
    }
    this.color_scale = d3.scale.ordinal() //while we're here create a color scale.
        .domain(this.groups)
        .range(range);
}

//In order to be able to compare distributions we need to have a common y axis.
Dot_Plots.prototype.createYScale = function(){
    this.bounds = d3.extent(this.data, function(d){return d.val});

    this.yScale = d3.scale.linear()
        .domain(this.bounds)
        .range([this.height,0]);
}


Dot_Plots.prototype.seperateGroups = function() {
    var t = this, //bring the values from overall object into this scope
        groupedData = [];

    // Generate a dotlayout using the histogram layout in d3
    var generateDotLayout = function(data){

        var dot_data = d3.layout.histogram()
            .bins(t.yScale.ticks(t.bins))
            (data);
        return dot_data;
    }

    t.groups.forEach(function(group){   //run through groups
        var values = []                     //Vec of data for group
        t.data.forEach(function(d){     //append data if it is in current group
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
    //find widest point in dotplots
    var widest = 0

    this.groupedData.forEach(function(group){

        var group_data = group.vals

        group_data.forEach(function(d,i){ //scan through values to find widest band.
            if(d.y > widest){
                widest = d.y
            }
        })
    })
    //we dont want circles to overlap vertically either so we check to make sure they wont by taking minumum of the
    //height of the bars and the width calculated above.
    this.radius = Math.min(this.place_scale.rangeBand()/widest * 0.90,
                  this.yScale(this.bounds[1] - this.groupedData[0].vals[0].dx)) //scale is flipped so this looks wonky.
}

Dot_Plots.prototype.generateDotPlots = function() {
    var t           = this,
        boxWidth    = this.place_scale.rangeBand();

    //Make a g element for each indivual boxplot to live in.
    var groups = this.plot.selectAll(".dot_plot")
        .data(this.groupedData, function(d){return d.group})

    //remove the groups leaving.
    groups.exit()
        .remove()

    //old groups getting moved/new data.
    groups.transition().duration(t.speed)
        .attr("transform", function(d) { return "translate(" + t.place_scale(d.group) + "," + 0 + ")"; })
        .each(function(d){
            var currentGroup = d.group;
            var row = d3.select(this).selectAll(".row") //grab our current row
                .data(d.vals)                           //data is in the value element

            row.enter().append("g") //drawing new rows
                .attr("class", "row")
                .attr("transform", function(d) { return "translate(" + (boxWidth/2) + "," + t.yScale(d.x) + ")"; })
                .each(function(d){
                    var totalLength = t.radius*d.length

                    d3.select(this).selectAll("circle")
                        .data(d)
                        .enter().append("circle")
                        .attr("fill", t.color_scale(currentGroup))
                        .attr("r", t.radius/2)
                        .attr("cx", 0)
                        .attr("cy", -t.radius/2)
                        .transition().duration(t.speed)
                        .attr("cx", function(d,i){return -totalLength/2 + (t.radius)*i + t.radius/2})
                });

            row.transition().duration(t.speed) //updating existing rows of dots.
                .attr("transform", function(d) { return "translate(" + (boxWidth/2) + "," + t.yScale(d.x) + ")"; })
                .each(function(d){
                    var totalLength = t.radius*d.length

                    var dots = d3.select(this).selectAll("circle")
                        .data(d)

                    dots.enter().append("circle")
                        .attr("fill", t.color_scale(currentGroup))
                        .attr("r", t.radius/2)
                        .attr("cx", 0)
                        .attr("cy", -t.radius/2)
                        .transition().duration(t.speed)
                        .attr("cx", function(d,i){return -totalLength/2 + (t.radius)*i + t.radius/2})

                    dots.transition().duration(t.speed)
                        .attr("fill", t.color_scale(currentGroup))
                        .attr("r", t.radius/2)
                        .attr("cy", -t.radius/2)
                        .attr("cx", function(d,i){return -totalLength/2 + (t.radius)*i + t.radius/2})

                    dots.exit() //shrink dots to remove.
                        .transition().duration(t.speed)
                        .attr("r", 0.00001)
                        .remove()
                });

            row.exit()
                .each(function(d){
                    d3.select(this).selectAll("circle")
                        .transition().duration(t.speed)
                        .attr("r", 0.000001)
                })
                .remove()
            }); //closes the transition for the current group.

    //new groups getting drawn.
    groups.enter()
        .append("g")
        .attr("class", "dot_plot")
        .attr("id", function(d){return "group_" + d.group})
        .attr("transform", function(d) { return "translate(" + t.place_scale(d.group) + "," + 0 + ")"; })
        .each(function(d){
            var currentGroup = d.group;
            var row = d3.select(this).selectAll(".row") //grab the row of dots (if any)
                .data(d.vals)                           //data is in the value element

            row.enter().append("g")  //for new rows append a g to hold the dots.
                .attr("class", "row")
                .attr("transform", function(d) { return "translate(" + (boxWidth/2) + "," + t.yScale(d.x) + ")"; })
                .each(function(d){
                    var totalLength = t.radius*d.length
                    d3.select(this).selectAll("circle")
                        .data(d).enter().append("circle")
                        .attr("fill", t.color_scale(currentGroup))
                        .attr("r", t.radius/2)
                        .attr("cx", 0)
                        .attr("cy", -t.radius/2)
                        .transition().duration(t.speed)
                        .attr("cx", function(d,i){return -totalLength/2 + (t.radius)*i + t.radius/2})
                });
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

    //define the two axes
    var yAxis = d3.svg.axis()
        .scale(this.yScale)
        .orient("left");

    var xAxis = d3.svg.axis()
        .scale(this.place_scale)
        .orient("bottom");

    //update the x axis
    this.plot.select(".y.axis").transition().duration(this.speed)
        .call(yAxis)
            .selectAll("text")
            .attr("transform", "translate( 4 ," + -6 + ")");

    var placeAxis = this.plot.select(".x.axis")
        .attr("fill-opacity", 0)
        .attr("transform", "translate(0," + this.height + ")")
        .call(xAxis)
        .transition().duration(this.speed)
        .attr("fill-opacity", 1)


    placeAxis.select("path") //get rid of the horizontal line
        .attr("stroke-width", 0)

    placeAxis.selectAll("line") //get rid of the ticks, they look like datapoints
        .attr("stroke-width", 0)

    placeAxis.selectAll("text")
        .attr("font-size", "1.2em")
        .attr("font-family", "optima")

}

Dot_Plots.prototype.setData = function(newData) {
    this.data = newData;

    this.findUniqueGroups(); //find the unique groups we have.
    this.createPlaceScale(); //generate the placement scale for groups
    this.createYScale();     //Make common y scale
    this.seperateGroups();   //Get data into the right form.
    this.findRadius();       //figure out how big to make the dots.
    this.generateDotPlots(); //convert data to histogram layout
    this.updateAxes();
}

Dot_Plots.prototype.updateBins = function(bin_number) {
    this.bins = bin_number;

    this.findUniqueGroups(); //find the unique groups we have.
    this.createPlaceScale(); //generate the placement scale for groups
    this.createYScale();     //Make common y scale
    this.seperateGroups();   //Get data into the right form.
    this.findRadius();       //figure out how big to make the dots.
    this.generateDotPlots(); //convert data to histogram layout
    this.updateAxes();
}

Dot_Plots.prototype.resize = function(bin_number) {
    //update width and height
    this.width   = this.element.offsetWidth - (2*this.padding);
    this.height  = (this.width / 2) - (2*this.padding);
    //update the svg with this info.
    var svg = d3.select(this.element).select('svg')
        .attr('width',  this.width  + (2*this.padding))
        .attr('height', this.height + (2*this.padding));

    //refresh the viz. 
    this.findUniqueGroups(); //find the unique groups we have.
    this.createPlaceScale(); //generate the placement scale for groups
    this.createYScale();     //Make common y scale
    this.seperateGroups();   //Get data into the right form.
    this.findRadius();       //figure out how big to make the dots.
    this.generateDotPlots(); //convert data to histogram layout
    this.updateAxes();
}
