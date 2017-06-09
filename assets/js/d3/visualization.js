d3.selection.prototype.moveToBack = function() {
  return this.each(function() {
      var firstChild = this.parentNode.firstChild;
      if (firstChild) {
          this.parentNode.insertBefore(this, firstChild);
      }
  });
};

class Visualization {
  constructor(nodeList) {
    this.nodeList = nodeList;
  }

  parseNodes() {
    let nodes = [];
    let list = this.nodeList;
    let keys = Object.keys(list).sort();
    keys.forEach( idx => {
      // list[idx].index = parseInt(idx);
      nodes.push(list[idx]);
    });

    let links = [];
    nodes.forEach( (node, idx) => {
      node.children.forEach( child => {
        if (!child.id) return;
        links.push({ source: node, target: list[child.id], weight: child.weight })
      });
    });
    let graph = { nodes: nodes, links: links };
    return graph;
  }

  centerTextX(x1, x2, y1, y2, weight, direction) {
    let x = (x1 + x2) / 2;
    let dx = x2 - x1;
    let dy = y2 - y1;
    let radians = Math.atan(dy/dx);
    if (Math.sin(radians) === 0) return x;
    if (Math.cos(radians) === 0) return x + weight * direction;
    if ((dy > 0 && dx > 0) || (dy < 0 && dx > 0)) {
      return x + (Math.cos(radians) * weight) * direction;
    }
    return x - (Math.cos(radians) * weight) * direction;
  }

  centerTextY(x1, x2, y1, y2, weight, direction) {
    let y = (y1 + y2) / 2;
    let dx = x2 - x1;
    let dy = y2 - y1;
    let radians = Math.atan(dy/dx);
    if (Math.cos(radians) === 0) return y;
    if (Math.sin(radians) === 0) return y + weight * direction;
    if ((dy > 0 && dx > 0) || (dy < 0 && dx > 0)) {
      return y - (Math.sin(radians) * weight) * direction;
    }
    return y + (Math.sin(radians) * weight) * direction;
  }

  addArrow(defs, link, color, animate) {
    let arrow = defs
      .data([`arrow-${link.source.id}-${link.target.id}${animate ? animate : ''}`])
      .enter().append("marker")
      .attr("id", function(d) { return d })
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 26)
      .attr("refY", 0)
      .attr("markerWidth", 4)
      .attr("markerHeight", 4)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .style("fill", color)
      .style("stroke", color)
      .style("opacity", `${animate ? 0 : 1}`);

    if (animate) arrow.transition().duration(500).delay(300).style('opacity', 1);
  }

  draw() {
    let graph = this.parseNodes();

    this.svg = d3.select("div.visualization").append("svg")
        .attr("width", 500)
        .attr("height", 500);

    this.nodeGroup = this.svg.selectAll("g")
      .data(graph.nodes);

    this.links = this.svg.selectAll("line.link")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke", "gray")
        .attr("class", "link")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })
        .attr("id", function(d) { return `${d.source.id}-${d.target.id}`})
        .style("stroke-width", 3)
        .style("marker-end",  (d) => `url(#arrow-${d.source.id}-${d.target.id})`);

    this.defs = this.svg.append('defs').selectAll('marker');
    this.links.each( link => {
      this.addArrow(this.defs, link, 'gray')
    })

    this.bezierLine = d3.line()
            .x(function(d) { return d[0]; })
            .y(function(d) { return d[1]; })
            .curve(d3.curveBundle.beta(0.9));

    this.svg.selectAll("text.link")
        .data(graph.links)
        .enter().append("text")
        .attr("class", "link")
        .attr("x", (d) => this.centerTextX(d.source.x, d.target.x, d.source.y, d.target.y, 12, -1))
        .attr("y", (d) => this.centerTextY(d.source.x, d.target.x, d.source.y, d.target.y, 12, -1))
        .attr("dy", 5)
        .attr("text-anchor", "middle")
        .text(function(d) { return d.weight });

    this.nodeWrapper = this.nodeGroup
        .enter().append("g").attr("class", (d) => `node-${d.id}`);

    this.nodeWrapper
        .append("circle")
        .attr("class", "node");

    this.nodeText = this.nodeWrapper.append("text")
        .attr("x", function(d) { return d.x })
        .attr("y", function(d) { return d.y })
        .attr("dy", 5)
        .attr("text-anchor", "middle")
        .text(function(d) { return d.id });

    this.nodes = d3.selectAll(".node")
        .attr("r", 20)
        .attr("id", function(d) { return d.id })
        .attr("cx", function(d) { return d.x })
        .attr("cy", function(d) { return d.y })
        .style("fill", "LightBlue")
        .style("stroke", "black")
        .style("stroke-width", 2);
  }

  unhighlightNode(id) {
    d3.select(this.nodes._groups[0][id - 1]).transition().duration(500)
      .style("fill", "lightblue")
      .style("r", 20);
  }

  highlightNode(id, color) {
    d3.select(this.nodes._groups[0][id - 1]).transition().duration(500)
      .style("fill", color)
      .style("r", 22);
  }

  unhighlightLink(fromId, toId) {
    d3.select(this.links._groups[0].find( link => link.id === `${fromId}-${toId}`))
      .transition()
      .duration(500)
      .style('stroke', 'grey');
    d3.select(`#arrow-${fromId}-${toId} path`)
      .transition()
      .duration(500)
      .style('stroke', 'grey')
      .style('fill', 'grey');
  }

  highlightLink(fromId, toId, color) {
    d3.select(this.links._groups[0].find( link => link.id === `${fromId}-${toId}`))
      .transition()
      .duration(500)
      .style('stroke', color);
    d3.select(`#arrow-${fromId}-${toId} path`)
      .transition()
      .duration(500)
      .style('stroke', color)
      .style('fill', color);
  }

  animateLink(fromId, toId, color) {
    // let link = this.links._groups[0].find( link => link.id === `${fromId}-${toId}`);
    let source = this.nodeList[fromId];
    let target = this.nodeList[toId];
    let path = this.svg.append("path")
      .attr("stroke", color)
      .attr("class", "link")
      .attr("fill", "none")
      .attr("d", (d) => this.bezierLine([
          [source.x, source.y],
          [source.x, source.y]
        ])
      )
      .style("stroke-width", 3);

    // let arc = d3.arc()
    //   .innerRadius(Math.sqrt((source.x - target.x) ** 2 + (source.y - target.y) ** 2) / 2)
    //   .outerRadius(Math.sqrt((source.x - target.x) ** 2 + (source.y - target.y) ** 2) / 2 + 3)
    //   .startAngle(0);
    //
    // let g = this.svg.append("g").attr("transform", `translate(${(source.x + target.x) / 2}, ${(source.y + target.y) / 2})`);
    //
    // let foreground = g.append("path")
    //   .datum({endAngle: 0})
    //   .style("fill", "orange")
    //   .style("marker-end", "url(#arrow)")
    //   .attr("d", arc);
    //
    // function arcTween(newAngle) {
    //   return function(d) {
    //     var interpolate = d3.interpolate(d.endAngle, newAngle);
    //
    //     return function(t) {
    //       d.endAngle = interpolate(t);
    //       return arc(d);
    //     };
    //   };
    // }
    //
    // foreground.transition()
    //   .duration(1000)
    //   .attrTween("d", arcTween(Math.PI * 0.6));

    path
      .transition()
      .duration(1000)
      .attr("d", this.bezierLine([
        [source.x, source.y],
        [this.centerTextX(source.x, target.x, source.y, target.y, 20, 1), this.centerTextY(source.x, target.x, source.y, target.y, 20, 1)],
        [target.x, target.y]
      ]))
      .attrTween("stroke-dasharray", function() {
            d3.select(this).moveToBack();
            var len = Math.sqrt((source.x - target.x) ** 2 + (source.y - target.y) ** 2);
            return function(t) { return (d3.interpolateString("0," + len, len + ",0"))(t) };
      })
      .style("marker-end", `url(#arrow-${fromId}-${toId}-animate)`);

    this.addArrow(this.defs, { source: source, target: target }, color, '-animate')
    // d3.select(`#arrow-${fromId}-${toId}-animate path`)
    //   .transition().duration(500).style('opacity', "0");
    setTimeout( () => {
      d3.select(`#arrow-${fromId}-${toId}-animate`).remove();
    }, 1200)
    setTimeout( () => {
      path.transition().duration(500).style("opacity", "0").remove();
    }, 1000);
  }

  addText(nodeId, dx, dy, color, textFunction) {
    d3.select(`g.node-${nodeId}`).append('text')
      .text((d) => textFunction(d))
      .attr('class', `node-${nodeId}`)
      .attr('dx', dx)
      .attr('dy', dy)
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .style('opacity', 0)
      .style('fill', color)
      .transition()
      .duration(500)
      .style('opacity', 1);
  }

  removeText(nodeId) {
    d3.selectAll(`text.node-${nodeId}`)
      .transition()
      .duration(500)
      .style('opacity', 0)
      .remove()
  }

  changeAllText(textFunction) {
    this.nodeText.text((d) => textFunction(d));
  }
}

export default Visualization;
