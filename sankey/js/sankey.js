var info2 = L.control();

  info2.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  };

  info2.update = function (d, link, arr) {
    this._div.innerHTML = '<h4>O-D Arrival at Subzone</h4>' +  (d ?
      '<b>' + d.properties.SUBZONE_N + '</b><br />' + 'Aggregate Inflows ' + d.properties.aggregate_inflows     

      : 'Hover over a state');
  };
    info2.addTo(map);


map._initPathRoot()

var svg = d3.select("#map").select("svg"),
    linklayer = svg.append("g"),
    nodelayer = svg.append("g");


var seg = 8;
var timing = function(bucket){
 seg = bucket;
};
var dropDown = d3.select("#filter").append("select")
                    .attr("name", "country-list");

function filtercsv(links, filter) {
  var result = [];
  links = links.filter(function(d) { return d.hour == filter;});
  return links;
}

d3.json("centroid.geojson", function(nodes) {
  d3.csv("sankeydatanew.csv", function(links) {
    links = links.filter(function(d) { return d.hour == 12;});
    d3.select('#inds')
      .on("change", function () {
        var sect = document.getElementById("inds");
        var section = sect.options[sect.selectedIndex].value;

        //links = filtercsv(links, section);
        //console.log(links);
        if (section == 8){
          links = links.filter(function(d) { return d.hour == 8;});

        }
      });

    var spatialsankey = d3.spatialsankey()
                            .lmap(map)
                            .nodes(nodes.features)
                            .links(links);
    var click = function(d){
      var nodelinks = spatialsankey.links().filter(function(link){
        if (link.source == d.properties.SUBZONE_C){
          ded = ({'target': link.target, 'flow': link.flow, 'time': link.hour});
          //console.log(ded.target);
          //console.log(ded.flow);
          AddData(ded.target, ded.flow);
        }
        //console.log(arr);
      });
      console.log(arr);
      PrintData();
    };
    var mouseover = function(d){
      // Get link data fd this node
      arr = [];

      var nodelinks = spatialsankey.links().filter(function(link){
        //return link.source == d.id;
        if (link.source == d.properties.SUBZONE_C){
          arr.push({'target': link.target, 'flow': link.flow})
        }
        info2.update(d, link,arr);
        return link.source == d.properties.SUBZONE_C;
      });

      // Add data to link layer
      var beziers = linklayer.selectAll("path").data(nodelinks);
      link = spatialsankey.link(options);

      // Draw new links
      beziers.enter()
        .append("path")
        .attr("d", link)
        //.attr('id', function(d){return d.id})

        /*EDWIN CHANGE HERE LATER FOR SOURCE/TARGET*/
        //.attr('id', function(d){console.log(d); return d.id})
        .attr('id', function(d){return d.id})
        .style("stroke-width", spatialsankey.link().width());
      
      // Remove old links
      beziers.exit().remove();

      // Hide inactive nodes
      var circleUnderMouse = this;
      circs.transition().style('opacity',function () {
          return (this === circleUnderMouse) ? 0.7 : 0;
      });
    };
    var mouseout = function(d) {
      // Remove links
      linklayer.selectAll("path").remove();
      // Show all nodes
      circs.transition().style('opacity', 0.7);

    };
  var node = spatialsankey.node();
  var circs = nodelayer.selectAll("circle")
      .data(spatialsankey.nodes())
      .enter()
      .append('circle')
      .attr("cx", node.cx)
      .attr("cy", node.cy)
      .attr("r", node.r)
      .attr("class", "circles")
      .style("fill", node.fill)
      .attr("opacity", 0.7)
      .on('mouseover', mouseover)
      .on('click', click)
      .on('mouseout', mouseout);

      var zoomend = function(){
        linklayer.selectAll("path").attr("d", spatialsankey.link());

        circs.attr("cx", node.cx)
             .attr("cy", node.cy);
    };
    map.on("zoomend", zoomend);
  });
});
var options = {'use_arcs': false, 'flip': false};
d3.selectAll("input").forEach(function(x){
  options[x.name] = parseFloat(x.value);
});

d3.selectAll("input").on("click", function(){
  options[this.name] = parseFloat(this.value);
});





var arr = [];
function AddData(name, count) {
  var arrTemp
  arr.push([count,name]);

};



function PrintData() {
  console.log("hi 2");
  console.log(arr[0]);
  // if (!Number.isInteger(arr[0])){
    
  //   var arrT = [];
  //   for (i=0;i<arr.length;i++){
  //     arr[i].sort(sortFunction);
  //     for (j=0;j<10;j++){
  //       arrT.push(arr[i][j]);
  //     }
  //   }
  //   arrT.sort(sortFunction);
  //   var rows1 = "";
  //   var name1 = arrT[i][1];
  //   var count1 = arrT[i][0];
  //   rows1 += "<tr><td>" + name1 + "</td><td>" + count1 + "</td><td>"
  //   $(rows1).appendTo("#tableA tbody");
  // }else{
  arr.sort(sortFunction);
  for (i = 0; i < 10; i++) { 
    var rows = "";
    var name = arr[i].target;
    var count = arr[i].flow;
    rows += "<tr><td>" + name + "</td><td>" + count + "</td><td>"
    $(rows).appendTo("#tableA tbody");
    arr = [];
    }
  //}
};

function sortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
};

