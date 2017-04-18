var salaryChart = (function(d3, CustomTooltip) {


  $("#textAll").hide(); $("#textSector").hide(); $("#textGender").hide(); $("#textComp").hide();

  var width = 740,
      height = 700,
      nodes = [],
      tooltip = CustomTooltip("salaryTooltip", 240),
      layout_gravity = -0.01,
      damper = 0.1,
      svg, force, circles, radius_scale;

  var center = {x: width / 2, y: height / 2};

  var comp_centers = {
      "top": {x: 250, y: 350},
      "second": {x: 420, y: 225},
      "third": {x: 420, y: 350},
      "bottom": {x:420, y: 475}
    };

  var gender_centers = {
    "male": {x: width / 3, y: height / 2},
    "female": {x: 2 * width / 3, y: height / 2},
    "unknown": {x: width / 2, y: 500}
   };

   var sector_centers = {
    "Trade": {x: 450, y: 250},
    "Prof": {x: 360, y: 500},
    "Union": {x: 530, y: 500},
    "Nonprofit": {x: 230, y: 400},
    "ThinkTank": {x: 200, y: 250}
   };

  var fill_color = d3.scale.ordinal()
                  .domain(["male", "female"])
                  .range(["#00aeef", "#ffc20e"]);

  /*var fill_color = d3.scale.ordinal()
                  .domain(["Trade", "Prof", "Union", "Nonprofit", "ThinkTank"])
                  .range(["#ed1d24", "#beccae", "#8b0304", "#FAA61a", "#FFD400"]);*/

  function bubbleChart(data) {
    var max_amount = d3.max(data, function(d) { return parseInt(d.moneyall, 10); } );
    radius_scale = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([0, 70]);

    //create node objects from original data
    //that will serve as the data behind each
    //bubble in the vis, then add each node
    //to nodes to be used later
    data.forEach(function(d){
      var node = {
        id: d.id,
        radius: radius_scale(parseInt(d.moneyall, 10)),
        comp: d.tier,
        name: d.name,
        subsector: d.subsector,
        value: d.moneyall,
        org: d.company,
        sector: d.sector,
        gender: d.gender,
        x: Math.random() * 3900,
        y: Math.random() * 3800
      };
      nodes.push(node);
    });


    nodes.sort(function(a, b) {return b.value- a.value; });

    svg = d3.select("#chartOne").append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("id", "svg_vis");

    circles = svg.selectAll("circle")
                 .data(nodes, function(d) { return d.id ;});

    circles.enter().append("circle")
      .attr("r", 5)
      .attr("fill", function(d) { return fill_color(d.gender); }) //return fill_color(d.sector);
      .attr("stroke-width", 1)
      .attr("stroke", "white")
      .attr("data-slug", function(d) { return  "bubble_" + d.id; })
      .on("mouseover", function(d, i) {showTip(d, i, this);} )
      .on("mouseout", function(d, i) {hideTip(d, i, this);} );

    circles.transition().duration(2000).attr("r", function(d) { return d.radius; });

  }


  function charge(d) {
    return -Math.pow(d.radius, 2.0) / 6.5;
  }

  function start() {
    force = d3.layout.force()
            .nodes(nodes)
            .size([width, height]);
  }

  function display_by_all() {
    force.gravity(layout_gravity)
         .charge(charge)
         .friction(0.9)
         .on("tick", function(e) {
            circles.each(move_towards_center(e.alpha))
                   .attr("cx", function(d) {return d.x;})
                   .attr("cy", function(d) {return d.y;});
         });
    force.start(); 

    $("#textSector").hide(); $("#textGender").hide(); $("#textComp").hide();
    $("#textAll").delay(1500).fadeIn(500).show(0); 
  }

  function move_towards_center(alpha) {
    return function(d) {
      d.x = d.x + (center.x - d.x) * (damper + 0.02) * alpha;
      d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha;
    };
  }

  function display_by_comp() {
    force.gravity(layout_gravity)
         .charge(charge)
         .friction(0.9)
        .on("tick", function(e) {
          circles.each(move_towards_comp(e.alpha))
                 .attr("cx", function(d) {return d.x;})
                 .attr("cy", function(d) {return d.y;});
        });
    force.start();

    $("#textSector").hide(); $("#textGender").hide(); $("#textAll").hide();
    $("#textComp").delay(1000).fadeIn(500).show(0);
  }

  function move_towards_comp(alpha) {
    return function(d) {
      var target = comp_centers[d.comp];
      d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
    };
  }

  function display_by_gender() {
    force.gravity(layout_gravity)
         .charge(charge)
         .friction(0.9)
        .on("tick", function(e) {
          circles.each(move_towards_gender(e.alpha))
                 .attr("cx", function(d) {return d.x;})
                 .attr("cy", function(d) {return d.y;});
        });
    force.start();

    $("#textSector").hide(); $("#textComp").hide(); $("#textAll").hide();
    $("#textGender").delay(1000).fadeIn(500).show(0);  
  }

  function move_towards_gender(alpha) {
    return function(d) {
      var target = gender_centers[d.gender];
      d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
    };
  }

  function display_by_sector() {
    force.gravity(layout_gravity)
         .charge(charge)
         .friction(0.9)
        .on("tick", function(e) {
          circles.each(move_towards_sector(e.alpha))
                 .attr("cx", function(d) {return d.x;})
                 .attr("cy", function(d) {return d.y;});
        });
    force.start();
    
    $("#textComp").hide(); $("#textGender").hide(); $("#textAll").hide();
    $("#textSector").delay(1000).fadeIn(500).show(0); 
  }

  function move_towards_sector(alpha) {
    return function(d) {
      var target = sector_centers[d.sector];
      d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
    };
  }

  function showTip(data, i, element) {
    d3.select(element).attr("stroke", "black").attr("stroke-width",2);
    var content = "<span class=\"hed\"> " + data.name + "</span><br/>";
    content +="<span class=\"name\"> " + data.org + "</span><br/>";
    content +="<span class=\"value\"> " + data.subsector + "</span><br/>";
    content +="<span class=\"value\"> Rank: " + data.id + " of 560</span><br/>";
    content +="<span class=\"name\">To see individual earnings click the link in the chatter above.</span>";
    tooltip.showTooltip(content, d3.event);
  }

  function hideTip(data, i, element) {
    d3.select(element).attr("stroke", "white" ) //function(d) { return d3.rgb(fill_color(d.sector)).darker();}
                      .attr("stroke-width",1);
    tooltip.hideTooltip();
  }

  var my_mod = {};
  my_mod.init = function (_data) {
    bubbleChart(_data);
    start();
  };

  my_mod.display_all = display_by_all;
  my_mod.display_comp = display_by_comp;
  my_mod.display_gender = display_by_gender;
  my_mod.display_sector = display_by_sector;
  
  my_mod.toggle_view = function(view_type) {
    if (view_type == 'comp') {
      display_by_comp();
    } else if (view_type == 'gender') {
      display_by_gender();
    } else if (view_type == 'sector') {
      display_by_sector();
    } else {
      display_by_all();
      }
    };

  

  return my_mod;
})(d3, CustomTooltip);