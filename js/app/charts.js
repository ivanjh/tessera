cronenberg.charts = {

    colorToHex: function(color) {
        if (color.substr(0, 1) === '#') {
            return color;
        }
        var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);

        var red = parseInt(digits[2]);
        var green = parseInt(digits[3]);
        var blue = parseInt(digits[4]);

        var rgb = blue | (green << 8) | (red << 16);
        return digits[1] + '#' + rgb.toString(16);
    },

    /* -----------------------------------------------------------------------------
       Graphite Helpers
       ----------------------------------------------------------------------------- */

    get_palette: function(name) {
        return cronenberg.charts.colors[name || cronenberg.charts.DEFAULT_PALETTE];
    },

    simple_line_chart_url: function(item, query, options_) {
        var options = options_ || {};
      var data_url = query.url();
        var png_url = URI(data_url)
            .setQuery('format', options.format || 'png')
            .setQuery('height', options.height || 600)
            .setQuery('width', options.width || 1200)
            .setQuery('bgcolor', options.bgcolor || this.colorToHex(window.getComputedStyle($('body')[0]).backgroundColor))
            .setQuery('fgcolor', options.fgcolor || 'white')
            .setQuery('hideLegend', 'true')
            .setQuery('hideAxes', 'true')
            .setQuery('margin', '0')
            .setQuery('colorList', cronenberg.charts.get_palette(item.options.palette).join())
            .setQuery('title', options.showTitle ? item.title : '')
            .href();
        return png_url;
    },

    standard_line_chart_url: function(item, query, options_) {
        var options = options_ || {};
        var data_url = query.url();
        var png_url = URI(data_url)
            .setQuery('format', options.format || 'png')
            .setQuery('height', options.height || 600)
            .setQuery('width', options.width || 1200)
            .setQuery('bgcolor', options.bgcolor || this.colorToHex(window.getComputedStyle($('body')[0]).backgroundColor))
            .setQuery('fgcolor', options.fgcolor || 'black')
            .setQuery('majorGridLineColor', options.majorGridLineColor || '#dddddd')
            .setQuery('minorGridLineColor', options.minorGridLineColor || '#eeeeee')
            .setQuery('hideLegend', options.hideLegend || 'false')
            .setQuery('hideAxes', options.hideAxes || 'false')
            .setQuery('colorList', cronenberg.charts.get_palette(item.options.palette).join())
            .setQuery('vtitle', item.options.yAxisLabel)
            .setQuery('title', options.showTitle ? item.title : '')
            .href();
        return png_url;
    },

    simple_area_chart_url: function(item, query, options_) {
        var options = options_ || {};
        var png_url = URI(query.url())
            .setQuery('format', options.format || 'png')
            .setQuery('height', options.height || 600)
            .setQuery('width', options.width || 1200)
            .setQuery('bgcolor', options.bgcolor || 'white')
            .setQuery('fgcolor', options.fgcolor || 'black')
            .setQuery('majorGridLineColor', options.majorGridLineColor || '#dddddd')
            .setQuery('minorGridLineColor', options.minorGridLineColor || '#eeeeee')
            .setQuery('hideLegend', 'true')
            .setQuery('hideAxes', 'true')
            .setQuery('areaMode', 'stacked')
            .setQuery('margin', '0')
            .setQuery('colorList', cronenberg.charts.get_palette(item.options.palette).join())
            .href();
        return png_url;
    },

    stacked_area_chart_url: function(item, query, options_) {
        var options = options_ || {};
        var png_url = URI(query.url())
            .setQuery('format', options.format || 'png')
            .setQuery('height', options.height || 600)
            .setQuery('width', options.width || 1200)
            .setQuery('bgcolor', options.bgcolor || this.colorToHex(window.getComputedStyle($('body')[0]).backgroundColor))
            .setQuery('fgcolor', options.fgcolor || 'black')
            .setQuery('majorGridLineColor', options.majorGridLineColor || '#dddddd')
            .setQuery('minorGridLineColor', options.minorGridLineColor || '#eeeeee')
            .setQuery('hideLegend', options.hideLegend || 'false')
            .setQuery('hideAxes', options.hideAxes || 'false')
            .setQuery('areaMode', 'stacked')
            .setQuery('colorList', cronenberg.charts.get_palette(item.options.palette).join())
            .setQuery('vtitle', item.options.yAxisLabel)
            .setQuery('title', options.showTitle ? item.title : '')
            .href();
        return png_url;
    },

    chart_url: function(item, query, options) {
        switch (item.item_type) {
        case 'simple_time_series':
            return item.filled
                ? cronenberg.charts.simple_area_chart_url(item, query, options)
                : cronenberg.charts.simple_line_chart_url(item, query, options);
        case 'standard_time_series':
            return cronenberg.charts.standard_line_chart_url(item, query, options);
        case 'stacked_area_chart':
            return cronenberg.charts.stacked_area_chart_url(item, query, options);
        case 'singlegraph':
            return cronenberg.charts.simple_area_chart_url(item, query, options);
        }
        return undefined;
    },

    composer_url: function(item, query, options_) {
        var options = options_ || {};
        var composer_url = URI(query.url())
            .filename('composer')
            .removeQuery('format')
            .setQuery('colorList', cronenberg.charts.get_palette(item.options.palette).join())
            .setQuery('vtitle', item.options.yAxisLabel)
            .setQuery('title', options.showTitle ? item.title : '');
        if (item.item_type === 'stacked_area_chart') {
            composer_url.setQuery('areaMode', 'stacked');
        }
        return composer_url.href();
    },


    /* -----------------------------------------------------------------------------
       Charts
       ----------------------------------------------------------------------------- */

    DEFAULT_AUTO_HIDE_LEGEND_THRESHOLD: 6,
    DEFAULT_PALETTE: 'spectrum6',

    simple_line_chart: function(e, series, options_) {
        var self = this;
        var options = options_ || {};
      var data = [series];
        nv.addGraph(function() {
            var width = e.width();
            var height = e.height();
            var chart = nv.models.lineChart()
                .options({
                    showXAxis: false,
                    showYAxis: false,
                    showLegend: false,
                    useInteractiveGuideline: true,
                    x: function(d) { return d[1]; },
                    y: function(d) { return d[0]; }
                })
                .color(cronenberg.charts._color_function(options.palette || self.DEFAULT_PALETTE))
                .margin(options.margin || { top: 0, right: 16, bottom: 0, left: 40 })
                .width(width)
                .height(height);
            chart.yAxis.tickFormat(d3.format(options.yAxisFormat || ',.2f'));
            chart.xAxis.tickFormat(function(d) { return moment.unix(d).fromNow(); });
            d3.select(e.selector + ' svg')
                .attr('width', width)
                .attr('height', height)
                .datum(data)
                .call(chart);
            return chart;
        });
    },

    standard_line_chart: function(e, data, options_) {
        var self = this;
        var options = options_ || {};
        var showLegend = options.showLegend !== false;
        if (data.length > self.DEFAULT_AUTO_HIDE_LEGEND_THRESHOLD) {
            showLegend = false;
        }
        nv.addGraph(function() {
            var width = e.width();
            var height = e.height();
            var chart = nv.models.lineChart()
                .options({
                    showXAxis: options.showXAxis !== false,
                    showYAxis: options.showYAxis !== false,
                    showLegend: showLegend,
                    useInteractiveGuideline: options.useInteractiveGuideline !== false,
                    x: function(d) { return d[1]; },
                    y: function(d) { return d[0]; }
                })
                .color(cronenberg.charts._color_function(options.palette || self.DEFAULT_PALETTE))
                .margin(options.margin || { top: 12, right: 16, bottom: 16, left: 40 })
                .width(width)
                .height(height);
            chart.yAxis
                .axisLabelDistance(options.yAxisLabelDistance || 30)
                .axisLabel(options.yAxisLabel || null)
                .tickFormat(d3.format(options.yAxisFormat || ',.2f'));
            chart.xAxis
                .tickFormat(function(d) { return moment.unix(d).format('h:mm A'); })
                .axisLabel(options.xAxisLabel || null);
            d3.select(e.selector + ' svg')
                .attr('width', width)
                .attr('height', height)
                .datum(data)
                .call(chart);
            return chart;
        });
    },

    simple_area_chart: function(e, series, options_) {
        var self = this;
        var options = options_ || {};
      var data = [series];
        nv.addGraph(function() {
            var width  = e.width();
            var height = e.height();
            var chart  = nv.models.stackedAreaChart()
                .options({
                    showLegend: false,
                    showControls: false,
                    showXAxis: false,
                    showYAxis: false,
                    useInteractiveGuideline: true,
                    x: function(d) { return d[1]; },
                    y: function(d) { return d[0]; }
                })
                .color(cronenberg.charts._color_function(options.palette || self.DEFAULT_PALETTE))
                .style('stack')
                .width(width)
                .height(height)
                .margin(options.margin || { top: 0, right: 0, bottom: 0, left: 0 });
            chart.yAxis
                .tickFormat(d3.format(options.yAxisFormat || ',.2f'));
            chart.xAxis
            // .tickFormat(function(d) { return moment.unix(d).format('h:mm A'); });
                .tickFormat(function(d) { return moment.unix(d).fromNow(); });
            d3.select(e.selector + ' svg')
                .attr('width', width)
                .attr('height', height)
                .datum(data)
                .transition()
                .call(chart);
            return chart;
        });
    },


    stacked_area_chart: function(e, data, options_) {
        var self = this;
        var options = options_ || {};
        var showLegend = options.showLegend !== false;
        if (data.length > self.DEFAULT_AUTO_HIDE_LEGEND_THRESHOLD) {
            showLegend = false;
        }
        nv.addGraph(function() {
            var width  = e.width();
            var height = e.height();
            var chart  = nv.models.stackedAreaChart()
                .options({
                    showLegend: showLegend,
                    useInteractiveGuideline: options.useInteractiveGuideline !== false,
                    showXAxis: options.showXAxis !== false,
                    showYAxis: options.showYAxis !== false,
                    x: function(d) { return d[1]; },
                    y: function(d) { return d[0]; }
                })
                .color(cronenberg.charts._color_function(options.palette || self.DEFAULT_PALETTE))
                .style(options.style || 'stack')
                .width(width)
                .height(height)
                .margin(options.margin || { top: 12, right: 16, bottom: 16, left: 40 });
            chart.yAxis
                .axisLabel(options.yAxisLabel || null)
                .axisLabelDistance(options.yAxisLabelDistance || 30)
                .tickFormat(d3.format(options.yAxisFormat || ',.2f'));
            chart.xAxis
                .axisLabel(options.xAxisLabel || null)
                .tickFormat(function(d) { return moment.unix(d).format('h:mm A'); });
            // .tickFormat(function(d) { return moment.unix(d).fromNow(); });
            d3.select(e.selector + ' svg')
                .attr('width', width)
                .attr('height', height)
                .datum(data)
                .transition()
                .call(chart);
            return chart;
        });
    },

    donut_chart: function(e, series, options_, transform_) {
        var self = this;
        var options = options_ || {};
        var transform = transform_ || 'sum';
        /* var showLegend = options.showLegend !== false;
           if (list_of_series.length > self.DEFAULT_AUTO_HIDE_LEGEND_THRESHOLD) {
           showLegend = false;
           } */
        var data = series.map(function(series) {
            return {
                label: series.key,
                y: series.summation[transform]
            };
        });
        nv.addGraph(function() {
            var width  = e.width();
            var height = e.height();
            var chart  = nv.models.pieChart()
            /* .options({
               showLegend: showLegend,
               useInteractiveGuideline: options.useInteractiveGuideline !== false,
               x: function(d) { return d.key; },
               y: function(d) { return d.y; }
               }) */
                .color(cronenberg.charts._color_function(options.palette || self.DEFAULT_PALETTE))
                .labelType(options.labelType || "percent")
                .donut(options.donut !== false)
                .donutRatio(options.donutRatio || 0.3)
                .showLabels(options.showLabels !== false)
                .donutLabelsOutside(options.donutLabelsOutside !== false)
                .width(width)
                .height(height)
                .margin(options.margin || { top: 0, right: 0, bottom: 0, left: 0 });
            d3.select(e.selector + ' svg')
                .attr('width', width)
                .attr('height', height)
                .datum(data)
                .transition()
                .call(chart);
            return chart;
        });
    },


    _color_function: function(palette_name) {
        var self = this;
        var palette = self.colors[palette_name];
        if (!palette) {
            palette = self.colors[self.DEFAULT_PALETTE];
        }
        return function(d, i) {
            return palette[i % palette.length];
        }
    },

    /**
     * Some color palettes", handily compiled by the Stanford Vis
     * Group for their Color Palette Analyzer project.
     * http://vis.stanford.edu/color-names/analyzer/
     */
    colors: {
        applespectrum:[ "#2d588a", "#58954c", "#e9a044", "#c12f32", "#723e77", "#7d807f" ],
        appleblue:    [ "#4972a8", "#92b9d8", "#002d64", "#599bcf", "#134d8d" ],
        applebrown:   [ "#8b6c4f", "#c8b68e", "#3b291d", "#ae8e5d", "#713f24" ],
        applegrey:    [ "#717372", "#c0c2c1", "#2d2f2e", "#8c8e8d", "#484a49" ],
        applegreen:   [ "#2d632f", "#90b879", "#0d2d16", "#599a48", "#00431a" ],
        tableau10:    [ "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b",
                        "#e377c2", "#7f7f7f", "#bcbd22", "#17becf" ],
        tableau20:    [ "#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a",
                        "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94",
                        "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d",
                        "#17becf", "#9edae5" ],
        manyeyes:     [ "#9c9ede", "#7375b5", "#4a5584", "#cedb9c", "#b5cf6b", "#8ca252",
                        "#637939", "#e7cb94", "#e7ba52", "#bd9e39", "#8c6d31", "#e7969c",
                        "#d6616b", "#ad494a", "#843c39", "#de9ed6", "#ce6dbd", "#a55194",
                        "#7b4173" ],
        numbers6:     [ "#2d588a", "#58954c", "#e9a044", "#c12f32", "#723e77", "#7d807f" ],
        excel10:      [ "#365e96", "#983334", "#77973d", "#5d437c", "#36869f", "#d1702f",
                        "#8197c5", "#c47f80", "#acc484", "#9887b0" ],
        economist:    [ "#621e15", "#e59076", "#128dcd", "#083c52", "#64c5f2", "#61afaf",
                        "#0f7369", "#9c9da1" ],
        brewerq9:     [ "#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33",
                        "#a65628", "#f781bf", "#999999" ],
        brewerq10:    [ "#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c",
                        "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a" ],
        brewerq12:    [ "#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462",
                        "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f" ],
        brewerdiv1:   [ "#8c510a", "#d8b365", "#f6e8c3", "#f5f5f5", "#c7eae5", "#5ab4ac",
                        "#01665e" ],
        brewerdiv2:   [ "#b2182b", "#ef8a62", "#fddbc7", "#f7f7f7", "#d1e5f0", "#67a9cf",
                        "#2166ac" ],
        brewerdiv3:   [ "#762a83", "#af8dc3", "#e7d4e8", "#f7f7f7", "#d9f0d3", "#7fbf7b",
                        "#1b7837" ],
        brewerdiv4:   [ "#d73027", "#fc8d59", "#fee090", "#ffffbf", "#e0f3f8", "#91bfdb",
                        "#4575b4" ],
        marketmap :   [ "#fa0007", "#ac0000", "#4e0300", "#000000", "#005101", "#06a200",
                        "#07ff00" ],


        // some more color palettes from rickshaw
        spectrum6:  ["#e7cbe6", "#d8aad6", "#a888c2", "#9dc2d3",
                     "#649eb9", "#387aa3"].reverse(),
        spectrum14:  ["#ecb796", "#dc8f70", "#b2a470", "#92875a", "#716c49", "#d2ed82",
                      "#bbe468", "#a1d05d", "#e7cbe6", "#d8aad6", "#a888c2", "#9dc2d3",
                      "#649eb9", "#387aa3"].reverse(),
        spectrum2000:["#57306f", "#514c76", "#646583", "#738394", "#6b9c7d", "#84b665",
                      "#a7ca50", "#bfe746", "#e2f528", "#fff726", "#ecdd00", "#d4b11d",
                      "#de8800", "#de4800", "#c91515", "#9a0000", "#7b0429", "#580839",
                      "#31082b"],
        spectrum2001:["#2f243f", "#3c2c55", "#4a3768", "#565270", "#6b6b7c", "#72957f",
                      "#86ad6e", "#a1bc5e", "#b8d954", "#d3e04e", "#ccad2a", "#cc8412",
                      "#c1521d", "#ad3821", "#8a1010", "#681717", "#531e1e", "#3d1818",
                      "#320a1b"],
        classic9:    ["#423d4f", "#4a6860", "#848f39", "#a2b73c", "#ddcb53", "#c5a32f",
                      "#7d5836", "#963b20", "#7c2626", "#491d37", "#2f254a"].reverse(),
        colorwheel:  ["#b5b6a9", "#858772", "#785f43", "#96557e", "#4682b4", "#65b9ac",
                      "#73c03a", "#cb513a"].reverse(),
        cool:        ["#5e9d2f", "#73c03a", "#4682b4", "#7bc3b8", "#a9884e", "#c1b266",
                      "#a47493", "#c09fb5"],
        munin:       ["#00cc00", "#0066b3", "#ff8000", "#ffcc00", "#330099", "#990099",
                      "#ccff00", "#ff0000", "#808080", "#008f00", "#00487d", "#b35a00",
                      "#b38f00", "#6b006b", "#8fb300", "#b30000", "#bebebe", "#80ff80",
                      "#80c9ff", "#ffc080", "#ffe680", "#aa80ff", "#ee00cc", "#ff8080",
                      "#666600", "#ffbfff", "#00ffcc", "#cc6699", "#999900"],

        // some more color palettes from d3.js
        d3category10: [ "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b",
                        "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],

        d3category20: ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a",
                       "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94",
                       "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d",
                       "#17becf", "#9edae5" ],

        d3category20b: [ "#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939", "#8ca252",
                         "#b5cf6b", "#cedb9c", "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94",
                         "#843c39", "#ad494a", "#d6616b", "#e7969c", "#7b4173", "#a55194",
                         "#ce6dbd", "#de9ed6" ],

        d3category20c: ["#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#e6550d", "#fd8d3c",
                        "#fdae6b", "#fdd0a2", "#31a354", "#74c476", "#a1d99b", "#c7e9c0",
                        "#756bb1", "#9e9ac8", "#bcbddc", "#dadaeb", "#636363", "#969696",
                        "#bdbdbd", "#d9d9d9"]

    }
};