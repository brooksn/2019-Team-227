function init(){

    var map_g = null;
    var pie_g = null;
    var infobox_template = _.template(document.getElementById("infobox-template").innerText);
    var max_pop = 28521;

    function update_infobox(cx){
        console.log(cx);
        document.getElementById("infobox").innerHTML = infobox_template(cx);
    } 
 
    function create_map(){
        console.log("creating map");


        var width = window.innerWidth,
            height = window.innerHeight,
            centered;
        
       
        var projection = d3.geoMercator()
          .scale(20000)
          .center([-117,33])
          .translate([width / 2, height / 2]);
        
        var path = d3.geoPath()
          .projection(projection);
        
        // Set svg width & height
        var svg = d3.select('svg#map')
          .attr('width', width)
          .attr('height', height);
       
        function updateWindow(e){
            x = window.innerWidth;
            y = window.innerHeight;
    
            svg.attr("width", x).attr("height", y);
        }

        d3.select(window).on('resize.updatesvg', updateWindow);
 
        // Add background
        svg.append('rect')
          .attr('class', 'background')
          .attr('width', width)
          .attr('height', height)
          .on('click', clicked);
        
        var g = svg.append('g');
     
        var mapLayer = g.append('g')
          .classed('map-layer', true);

        // Define color scale
        var color = d3.scaleLinear()
          .domain([1, 20])
          .clamp(true)
          .range(['#ff','#40']);
          //.range(['#fff', '#409A99']);

        // Get province color
        function fillFn(d){
          // i^2 = r^2 + g^2 + b^2   
          var c = d3.hsl("steelblue");
          c.h += 90 - d.properties.elder_percent/100 * 180;
          c.s += 0.2 - (d.properties.total_pop / max_pop) * 0.4;
          return c;    
        }
        
        // When clicked, zoom in
        function clicked(d) {

              var x, y, k;
            
              if (d && centered !== d) {
                var centroid = path.centroid(d);
                x = centroid[0];
                y = centroid[1];
                k = 4;
                centered = d;
              } else {
                x = width / 2;
                y = height / 2;
                k = 1;
                centered = null;
              }
            
              g.selectAll("path")
                  .classed("active", centered && function(d) { return d === centered; });
            
              g.transition()
                  .duration(750)
                  .attr("transform", "translate(" + width / 2 + "," + 
                    height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
                  .style("stroke-width", 1.5 / k + "px");
        }
        
        function mouseover(d){
            if(typeof(d) != "undefined"){
                update_infobox({tract:d.properties});
            }else{ update_infobox({}); }
          // Highlight hovered province
          d3.select(this).style('fill', 'orange');
        }
        
        function mouseout(d){
          // Reset province color
          mapLayer.selectAll('path')
            .style('fill', function(d){return centered && d===centered ? 'orange' : fillFn(d);});
        
        }
    
            
        // Load map data
        console.log("loading data");
        var tracts = d3.json('census_tracts.json');
        tracts.then(function(mapData) {
          var features = mapData.features;
          _.each(features,function(d){
            d.properties.area =  path.area(d);
            d.properties.density = d.properties.total_pop / path.area(d);
          });
          console.log("features received: ",features);
          // Update color scale domain based on data
          //color.domain([0, d3.max(features, function(d){ return d.properties.elder_percent })]);
          color.domain([0,55]);
        
          // Draw each province as a path
          console.log("drawing "+features.length+" tracts");
          mapLayer.selectAll('path')
              .data(features)
            .enter().append('path')
              .attr('d', path)
              .attr('vector-effect', 'non-scaling-stroke')
              .style('fill', fillFn)
              .on('mouseover', mouseover)
              .on('mouseout', mouseout)
              .on('click', clicked);

        });

        return g;
    } 
    
    map_g = create_map();
    update_infobox({});

}


init();
