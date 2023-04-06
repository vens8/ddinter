/* SVG frame creation */
var w = 1280,
    h = 600,
    fbBlue = d3.rgb("#3b5998"),
    fill = [fbBlue.brighter(2),fbBlue.brighter(),fbBlue,fbBlue.darker()];

var nodes = d3.range(211,261).map(function(i){
      return {
        userID: i,
        in: 0,
        out: 0
      }
    });

var vis = d3.select("body").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

var links = [	{source:27, target:28},
							{source:28, target:27},
							{source:28, target:12},
							{source:47, target:46},
							{source:41, target:37},
							{source:41, target:25},
							{source:27, target:11},
							{source:38, target:2},
							{source:28, target:41},
							{source:28, target:0},
							{source:13, target:21},
							{source:46, target:25},
							{source:39, target:41},
							{source:21, target:1},
							{source:1, target:28},
							{source:14, target:16},
							{source:28, target:1},
							{source:28, target:23},
							{source:21, target:20},
							{source:32, target:5},
							{source:28, target:21},
							{source:38, target:43},
							{source:2, target:35},
							{source:31, target:38},
							{source:22, target:45},
							{source:37, target:41},
							{source:20, target:21},
							{source:0, target:11},
							{source:13, target:2},
							{source:25, target:46},
							{source:1, target:21},
							{source:27, target:0},
							{source:23, target:28},
							{source:21, target:13},
							{source:1, target:41},
							{source:25, target:13},
							{source:12, target:35},
							{source:35, target:12},
							{source:12, target:28},
							{source:31, target:43},
							{source:0, target:27},
							{source:16, target:14},
							{source:0, target:28},
							{source:43, target:38},
							{source:41, target:12},
							{source:0, target:12},
							{source:35, target:2},
							{source:34, target:48},
							{source:11, target:27},
							{source:25, target:2},
							{source:20, target:2},
							{source:28, target:2},
							{source:38, target:31},
							{source:45, target:22},
							{source:19, target:42},
							{source:2, target:38},
							{source:13, target:25},
							{source:41, target:39},
							{source:2, target:13},
							{source:41, target:1},
							{source:3, target:19},
							{source:46, target:47},
							{source:25, target:41},
							{source:2, target:31},
							{source:21, target:28},
							{source:11, target:29},
							{source:12, target:41},
							{source:48, target:34},
							{source:37, target:25},
							{source:43, target:31},
							{source:29, target:11},
							{source:31, target:2},
							{source:2, target:28},
							{source:28, target:20},
							{source:5, target:32},
							{source:2, target:20},
							{source:27, target:41},
							{source:41, target:27},
							{source:2, target:25},
							{source:42, target:19},
							{source:20, target:28},
							{source:12, target:0},
							{source:41, target:28},
							{source:25, target:37},
							{source:19, target:3},
							{source:11, target:0}
];

/* Store number of connections of each node */
links.forEach(function(d, i){
  nodes[d.source].out++;
  nodes[d.target].in++;
});
/*nodes.forEach(function(d, i){
  if(d.out !== d.in)
    alert("DIFFERENT");
});*/

/* Force paramettring */
var force = d3.layout.force()
    .charge(-80)
    .linkDistance(25)
    .linkStrength(0.2)
    .size([w, h])
    .nodes(nodes)
    .links(links)
    .start();

/*Link creation template */
var link = vis.selectAll(".link")
    .data(links)
    .enter()
    .append("line")
    .attr("class", "link");

/*Node creation template */
var node = vis.selectAll("circle.node")
    .data(nodes)
  .enter().append("svg:circle")
    .attr("class", "node")
    .attr("cx", function(d) { return d.x; }) //x
    .attr("cy", function(d) { return d.y; }) //y
    .attr("r", 8)
    .style("fill", function(d, i) {
      return fill[parseInt((d.in+1)/3)];
    })
    .call(force.drag);

/*node.append("title")
    .text(function(d) { return "User "+d.userID; });*/

/* Start transition */
vis.style("opacity", 1e-6)
   .transition()
   .duration(1000)
   .style("opacity", 1);

//Forces in action
force.on("tick", function(e) {
  /* Clustering: Push odd/even nodes up/down, something alike for left/right
  var k = 6 * e.alpha;
  nodes.forEach(function(o, i) {
    o.y += i & 1 ? k : -k;
    o.x += i & 2 ? k : -k;
  }); //clustering end*/
  // Get items coords (then whole force's maths managed by D3)
  
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });
  
  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
});

/* Click-plosion and tooltip*/
d3.select("body").on("dblclick", function() {
  nodes.forEach(function(o, i) {
    o.x += (Math.random() - .5) * 200;
    o.y += (Math.random() - .5) * 200;
  });
  force.resume();
});
d3.selectAll('.node').on('click', function(d, i){
  var d3this = d3.select(this);
  if(d3this.style("fill") == '#ffa500')
    d3this.style('fill', 'green');
  else if(d3this.style("fill") == '#008000')
    d3this.style("fill", fill[parseInt((d.in+1)/3)]);
  else
    d3this.style("fill",'orange');
  d3.event.stopPropagation();
});
d3.selectAll(".node").on("dblclick", function(d, i){
  d.fixed = !d.fixed;
  d3.event.stopPropagation();
});
var div = d3.select("div.tooltip");
d3.selectAll(".node").on("mouseover", function(d, i){
  div.style("visibility", "visible")
     .transition()
     .duration(200)
     .style("opacity", .9);
  var html;
  if(d.in == d.out)
    html = "User "+d.userID+"<br/>"+d.in+" conns"
  else
    html = "User "+d.userID+"<br/>"+d.in+" in, "+d.out+" out"
  div.html(html)
     .style("left", (d.x + 15) + "px")
     .style("top", (d.y - 30) + "px");
}).on("mouseout", function(d, i){
  div.transition()
     .duration(500)
     .style("opacity", 0)
     .each("end", function(){
       div.style("visibility", "hidden")
     });
});