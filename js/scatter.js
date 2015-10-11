function scatter() {

    // All options that should be accessible to caller
    var width = 500;
    var height = 500;
    var padding = 20;
    var radius = 4;
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

            // I am assuming that the data passed includes a x and y field.
            var extent_x = d3.extent(data,function(d){return d.x});
            //if the values are the same let's make sure the visualization puts it in the middle of the screen
            if((extent_x[0] - extent_x[1]) == 0){extent_x =[extent_x[1] - 1, extent_x[1] + 1] }

            var extent_y = d3.extent(data,function(d){return d.y});
            //if the values are the same let's make sure the visualization puts it in the middle of the screen
            if((extent_y[0] - extent_y[1]) == 0){extent_y =[extent_y[1] - 1, extent_y[1]] }

            var scale_x = d3.scale.linear()
                .domain(extent_x)
                .range([padding, width-padding]);

            var scale_y = d3.scale.linear()
                .domain(extent_y)
                .range([height-padding, padding]);

            var dom = d3.select(this);
            var svg = dom.append('svg')
                .attr('class', 'scatterplot')
                .attr('height', height)
                .attr('width', width)
                .style('fill', fillColor);

            var points = svg.selectAll('circle.display-points')
                .data(data).enter()
                .append('circle')
                .attr('class', 'display-points')
                .attr('cx', function (d) { return scale_x(d.x);  })
                .attr('cy', function (d) { return scale_y(d.y);  })
                .attr('r', radius) //this will eventually need to be modifyable by the code.
                .attr('fill', pointsColor)

            // update functions
            updateWidth = function() {
                scale_x.range([padding, width-padding]); //update the scale function
                points.transition().duration(animationDuration).attr('cx', function (d) { return scale_x(d.x);  })
                svg.transition().duration(animationDuration).attr('width', width);
            };

            updateHeight = function() {
                scale_y.range([height-padding, padding]); //update the scale
                points.transition().duration(animationDuration).attr('cy', function (d) { return scale_y(d.y);  }) //move the dots
                svg.transition().duration(animationDuration).attr('height', height); //update the svg
            };

            updateFillColor = function() {
                svg.transition().duration(animationDuration).style('fill', fillColor);
            };

            updateData = function() {
                //calculate new data extents
                var extent_x = d3.extent(data,function(d){return d.x});
                if((extent_x[0] - extent_x[1]) == 0){extent_x =[extent_x[1] - 1, extent_x[1] + 1] }

                var extent_y = d3.extent(data,function(d){return d.y});
                if((extent_y[0] - extent_y[1]) == 0){extent_y =[extent_y[1] - 1, extent_y[1] ] }

                //update the scales with the new extents
                scale_x.domain(extent_x)
                scale_y.domain(extent_y)

                var update = svg.selectAll('circle.display-points')
                    .data(data);

                update
                    .transition()
                    .duration(animationDuration)
                    .delay(function(d, i) { return (data.length - i) * 15; })
                    .attr('cx', function (d) { return scale_x(d.x);  })
                    .attr('cy', function (d) { return scale_y(d.y);  })

                update.enter()
                    .append('circle')
                    .attr('class', 'display-points')
                    .attr('cx', 0)
                    .attr('cy', 0)
                    .attr('r', 0)
                    .attr('fill', pointsColor)
                    .transition()
                    .duration(animationDuration)
                    .delay(function(d, i) { return (data.length - i) * 15; })
                    .attr('cx', function (d) { return scale_x(d.x);  })
                    .attr('cy', function (d) { return scale_y(d.y);  })
                    .attr('r', radius) //this will eventually need to be modifyable by the code.

                update.exit()
                    .transition()
                    .duration(650)
                    .delay(function(d, i) { return (data.length - i) * 15; })
                    .attr('r', 0)
                    .remove();
            }

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
