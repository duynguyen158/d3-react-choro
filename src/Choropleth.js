import React, { Component } from 'react';
import us from './data/counties-albers-10m';
import { select, mouse, event } from 'd3-selection';
import { geoPath } from 'd3-geo';
import { scaleQuantize } from 'd3-scale';
import { schemeBlues } from 'd3-scale-chromatic';
import { zoom } from 'd3-zoom';
import { feature, mesh } from 'topojson';


class Choropleth extends Component {
    constructor(props) {
        super(props);
        this.createChoropleth = this.createChoropleth.bind(this);
    }

    componentDidMount() {
        this.createChoropleth();
    }

    /*componentDidUpdate() {
        this.createChoropleth();
    }*/

    createChoropleth() {
        const width = this.props.width;
        const height = this.props.height;

        const counties = feature(us, us.objects.counties).features;
        const data = this.props.data;

        const path = geoPath();
        const color = scaleQuantize([1, 10], schemeBlues[9]);
        const states = new Map(
            us.objects.states.geometries.map(d => [d.id, d.properties])
        );

        const svg = select(this.node);
        const map = svg.append("g");

        const tooltip = svg.append("g");

        /*const z = zoom()
            .extent([[0, 0], [width, height]])
            .translateExtent([[-50, -50], [width + 50, height + 50]])
            .scaleExtent([1, 8])
            .on("zoom", zoomed);

        function zoomed() {
            const { transform } = event;
            map.attr("transform", transform);
            map.attr("stroke-width", 1 / transform.k);
            svg.selectAll(".county").call(g => g.call(display));
        }*/

        map
            .selectAll("path")
            .data(counties)
            .join("path")
            .attr("class", "county")
            .attr("fill", d => color(data.get(d.id)))
            .attr("d", path)

        map
            .append("path")
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("d", path(mesh(us, us.objects.states, (a, b) => a !== b)));

        // svg.call(z);

        function display(g) {
            g.on("mousemove touchmove", function(d) {
                //console.log(mouse(this)[1]);
                tooltip.attr("transform", `translate(${mouse(this)})`);
                tooltip.call(
                    callout,
                    format(data.get(d.id)) + "/\n/" + d.properties.name + ", " + states.get(d.id.slice(0, 2)).name
                );
                select(this)
                    .attr("stroke", "red")
                    .raise();
            })
            .on("mouseout touchend", function() {
                tooltip.call(callout, null);
                select(this)
                    .attr("stroke", null)
                    .lower();
            });
        }
     
        svg.selectAll(".county").call(g => g.call(display));
        /*svg
            .selectAll(".county")
            .on("mousemove touchmove", function(d) {
                tooltip.attr("transform", `translate(${mouse(this)})`);
                tooltip.call(
                    callout,
                    format(data.get(d.id)) + "/\n/" + d.properties.name + ", " + states.get(d.id.slice(0, 2)).name
                );
                select(this)
                    .attr("stroke", "red")
                    .raise();
            })
            .on("mouseout touchend", function() {
                tooltip.call(callout, null);
                select(this)
                    .attr("stroke", null)
                    .lower();
            });*/

    }

    render() {
        return (
            <svg
                ref={node => this.node = node}
                width={this.props.width}
                height={this.props.height}
            >
            </svg>
        );
    }
}

export default Choropleth;

/* ------ Helpers ------ */ 
function format(d) {
    return d + "%";
}

function callout(g, value) {
    if (!value) return g.style("display", "none");

    g.style("display", null)
        .style("pointer-events", "none")
        .style("font", "10px sans-serif");

    const path = g
        .selectAll("path")
        .data([null])
        .join("path")
        .attr("fill", "white")
        .attr("stroke", "black");

    const text = g
        .selectAll("text")
        .data([null])
        .join("text")
        .call(text => {
            text
                .selectAll("tspan")
                .data((value + "").split("/\n/"))
                .join("tspan")
                .attr("x", 0)
                .attr("y", (_, i) => i * 1.1 + "em")
                .style("font-weight", (_, i) => i ? null : "bold")
                .text(d => d);
        });

    //const x = text.node().getBBox().x;
    const y = text.node().getBBox().y;
    const w = text.node().getBBox().width;
    const h = text.node().getBBox().height;
    //console.log(y)

    text.attr("transform", `translate(${[-w / 2, 15 - y]})`);
    path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
}