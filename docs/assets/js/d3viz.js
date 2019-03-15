function init(){

    var map_g = null;
    var pie_g = null;

    function update_selected(d){
    }

    function create_map(){
        console.log("creating map");

        var width = 960,
            height = 500,
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
        
        // Add background
        svg.append('rect')
          .attr('class', 'background')
          .attr('width', width)
          .attr('height', height)
          .on('click', clicked);
        
        var g = svg.append('g');
     
        var effectLayer = g.append('g')
          .classed('effect-layer', true);
        
        var mapLayer = g.append('g')
          .classed('map-layer', true);

        // Define color scale
        var color = d3.scaleLinear()
          .domain([1, 20])
          .clamp(true)
          .range(['#fff', '#409A99']);
        
        // Get province color
        function fillFn(d){
          return color(d.properties.elder_percent);
        }
        
        // When clicked, zoom in
        function clicked(d) {
        }
        
        function mouseover(d){
          // Highlight hovered province
          d3.select(this).style('fill', 'orange');
          update_selected(d); 
        }
        
        function mouseout(d){
          // Reset province color
          mapLayer.selectAll('path')
            .style('fill', function(d){return centered && d===centered ? '#D5708B' : fillFn(d);});
        
          // Remove effect text
          effectLayer.selectAll('text').transition()
            .style('opacity', 0)
            .remove();
        
        }
    
            
        // Load map data
        console.log("loading data");
        var tracts = d3.json('census_tracts.json');
        tracts.then(function(mapData) {
          var features = mapData.features;
          console.log("features received: ",features);
          // Update color scale domain based on data
          color.domain([0, d3.max(features, function(d){ return d.properties.elder_percent })]);
        
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

          console.log("filling pie");
          create_pie([
                {
                    "title":"Total Population",
                    "value":d3.sum(features,function(d){ return d.properties.total_pop; })
                },
                {
                    "title":"Aging Population (65+)",
                    "value": d3.sum(features,function(d){ return d.properties.elder_pop; })
                }
          ]);


        });
        return g;
    } 
    
    function create_pie(pie_data){
        var width = 200;
        var height = 200;
        console.log("creating pie with ",pie_data);

        const svg = d3.select("svg#pie")
            .attr("text-anchor", "middle")
            .style("font", "12px sans-serif");

        const g = svg.append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        g.selectAll("path")
            .data(pie_data)
            .enter().append("path")
                .attr("d", arc)
            .append("title")
                .text(d => `${d.title}: ${d.value.toLocaleString()}`);
        return g;
    } 

    map_g = create_map();
}


init();
