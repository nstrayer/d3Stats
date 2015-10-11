function histogram() {

    // All options that should be accessible to caller
    // h= 2∗iqr(data)∗Math.pow(25,(-1/3)) //implement this after it's working
    var bins = 50;
    var width = 500;
    var height = 500;
    var padding = {top: 10, right: 30, bottom: 30, left: 30}
    var animationDuration = 1000
    var delayValue = 15
    var pointsColor = "steelblue"
    var fillColor = 'coral';
    var data = [];

    var updateWidth;
    var updateHeight;
    var updateFillColor;
    var updateData;

    function chart(selection){
        selection.each(function () {

            // A formatter for counts.
            var formatCount = d3.format(",.0f");

            var x = d3.scale.linear()
                .domain([0, 1])
                .range([0, width]);

            // Generate a histogram using twenty uniformly-spaced bins.
            var hist = d3.layout.histogram()
                .bins(x.ticks(bins))
                (data);

            var y = d3.scale.linear()
                .domain([0, d3.max(hist, function(d) { return d.y; })])
                .range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var svg = d3.select("body").append("svg")
                .attr("width",  width + padding.left + padding.right)
                .attr("height", height + padding.top + padding.bottom)
              .append("g")
                .attr("transform", "translate(" + padding.left + "," + padding.top + ")");

            var bar = svg.selectAll(".bar")
                .data(hist)
              .enter().append("g")
                .attr("class", "bar")
                .style("fill", "steelblue")
                .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

            bar.append("rect")
                .attr("x", 1)
                .attr("width", x(hist[0].dx) - 1)
                .attr("height", function(d) { return height - y(d.y); });

            bar.append("text")
                .attr("dy", ".75em")
                .attr("y", 6)
                .attr("x", x(hist[0].dx) / 2)
                .attr("text-anchor", "middle")
                .style("fill", "white")
                .text(function(d) { return formatCount(d.y); });

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            // update functions
            updateWidth = function() {
                x.range([0, width]); //update the scale function

                bar.selectAll("g")
                    .transition()
                    .duration(animationDuration)
                    .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

                bar.selectAll("rect")
                    .transition()
                    .duration(animationDuration)
                    .attr("width", x(hist[0].dx) - 1)

                bar.selectAll("text")
                    .transition()
                    .duration(animationDuration)
                    .attr("x", x(hist[0].dx) / 2)

                svg.transition().duration(animationDuration).attr('width', width);
            };

    //         updateHeight = function() {
    //             scale_y.range([height-padding, padding]); //update the scale
    //             points.transition().duration(animationDuration).attr('cy', function (d) { return scale_y(d.y);  }) //move the dots
    //             svg.transition().duration(animationDuration).attr('height', height); //update the svg
    //         };
    //
    //         updateFillColor = function() {
    //             svg.transition().duration(animationDuration).style('fill', fillColor);
    //         };
    //
    //         updateData = function() {
    //             //calculate new data extents
    //             var extent_x = d3.extent(data,function(d){return d.x});
    //             if((extent_x[0] - extent_x[1]) == 0){extent_x =[extent_x[1] - 1, extent_x[1] + 1] }
    //
    //             var extent_y = d3.extent(data,function(d){return d.y});
    //             if((extent_y[0] - extent_y[1]) == 0){extent_y =[extent_y[1] - 1, extent_y[1] ] }
    //
    //             //update the scales with the new extents
    //             scale_x.domain(extent_x)
    //             scale_y.domain(extent_y)
    //
    //             var update = svg.selectAll('circle.display-points')
    //                 .data(data);
    //
    //             update
    //                 .transition()
    //                 .duration(animationDuration)
    //                 .delay(function(d, i) { return (data.length - i) * 15; })
    //                 .attr('cx', function (d) { return scale_x(d.x);  })
    //                 .attr('cy', function (d) { return scale_y(d.y);  })
    //
    //             update.enter()
    //                 .append('circle')
    //                 .attr('class', 'display-points')
    //                 .attr('cx', 0)
    //                 .attr('cy', 0)
    //                 .attr('r', 0)
    //                 .attr('fill', pointsColor)
    //                 .transition()
    //                 .duration(animationDuration)
    //                 .delay(function(d, i) { return (data.length - i) * 15; })
    //                 .attr('cx', function (d) { return scale_x(d.x);  })
    //                 .attr('cy', function (d) { return scale_y(d.y);  })
    //                 .attr('r', radius) //this will eventually need to be modifyable by the code.
    //
    //             update.exit()
    //                 .transition()
    //                 .duration(650)
    //                 .delay(function(d, i) { return (data.length - i) * 15; })
    //                 .attr('r', 0)
    //                 .remove();
    //         }
    //
        });
    }

    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        if (typeof updateWidth === 'function') updateWidth();
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        if (typeof updateHeight === 'function') updateHeight();
        return chart;
    };

    chart.fillColor = function(value) {
        if (!arguments.length) return fillColor;
        fillColor = value;
        if (typeof updateFillColor === 'function') updateFillColor();
        return chart;
    };

    chart.data = function(value) {
        if (!arguments.length) return data;
        data = value;
        if (typeof updateData === 'function') updateData();
        return chart;
    };

    chart.animationDuration = function(value) {
        if (!arguments.length) return animationDuration;
        animationDuration = value;
        if (typeof animationDuration === 'function') animationDuration();
        return chart;
    };

    return chart;
}
