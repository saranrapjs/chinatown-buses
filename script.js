var foldChange,
	belowTheFold = false;
function scroll(direction) {
	function checkScroll() {
		return (direction == true)
			? window.scrollY > window.innerHeight
			: window.scrollY == 0
	}
	function doScroll(i) {
		window.scrollBy(0,i)
		if (direction == true) {
			i++;
		} else {
			i--;
		}
		if (checkScroll() === false){
			setTimeout(function() {
				doScroll(i);
			},10);
		}
	}
	doScroll(0);
}
function onScroll() {1
	if  (window.scrollY >= window.innerHeight && belowTheFold === false) {
		foldChange = belowTheFold = true;
	}
	else if (window.scrollY < window.innerHeight && belowTheFold === true) {
		foldChange = true;
		belowTheFold = false;
	}
}
function load() {
	setInterval(function() {
		if (foldChange === true) {
			foldChange = null;
			document.querySelector("#more").innerHTML = (belowTheFold === true)
				? "(more &uarr;)"
				: "(more &darr;)";
		}
	},100);
	document.body.className = "style"+Math.floor(Math.random()*7);
	document.querySelector("#reload").onclick = function() {
		load();
		return false;
	}
	document.querySelector("#more").onclick = function() {
		scroll(!belowTheFold);
		return false;
	}
	d3.select("svg").remove();
	var width = 760,
		height = 600;

	var cluster = d3.layout.cluster()
			.size([height, width - 400]);

	var diagonal = d3.svg.line()


	var svg = d3.select("#main")
			.append("svg")
			.attr("class","svg")
			.attr("width", width)
			.attr("height", window.innerHeight)
			.append("g")
			// .attr("y",0)

	d3.json("cities.json", function(error, json) { //http://www.census.gov/statab/ccdb/cit1020r.txt
		var cities = json.cities;
		// population filter:
		// cities = cities.filter(function(city) {
		// 	return (city.population > 300000)
		// })
		var places = d3.shuffle(cities).slice(0,Math.floor(Math.random() * 6) + 2),
			root = places.pop();
		root.children = places;
		if (root.children.length === 1) root.children[0].single = true;

			var nodes = cluster.nodes(root),
				links = cluster.links(nodes);

			var link = svg.selectAll(".link")
					.data(links)
				.enter().append("path")
					.attr("marker-end", function(d) { return "url(#end)"; })
					.attr("marker-start", function(d) { return (root.children.length === 1) ? "url(#start)" : null; })
					.attr("class", "link line")
					.attr("d", function(d,i){
						var total = links.length-1,
							shift = (i/total)-.5,
							shifted = d.source.x;
						if (!isNaN(shift)) shifted = d.source.x + (shift)*50;
						return diagonal([
							[d.source.y,shifted],
							[d.target.y,d.target.x]
						]);
					});

			var node = svg.selectAll(".node")
					.data(nodes)
				.enter().append("g")
					.attr("class", "node")
					.attr("transform", function(d) { 
						return "translate(" + d.y + "," + d.x + ")"; 
					})

			node.append("text")
					.attr("dx", function(d) { return d.children ? -8 : 8; })
					.attr("dy", 3)
					.style("text-anchor", function(d) { return d.children ? "end" : "start"; })
					.text(function(d) {
						var showState = !! Math.round(Math.random() * 1),
							name = d.name.toUpperCase();
						name = (showState) ? name : name.replace(/\,\s[A-Z]{2,}/i,"");
						if (d.mandarin && showState === false) name = name + " " + d.mandarin + "";

						return name; 
					})
					.attr("transform", function(d) { // slightly nasty
						var y = this.getBBox().y,
							height = this.getBBox().height,
							off = y + (height/2) - 20
						return "scale(1,2) translate(0,"+((-1*off)*1)/2+")"
					})
					.attr('class',function(d) {
						return (d.depth === 0 || d.single && d.single === true)
							? 'source'
							: 'destination'
					})
					.each(function(d,i){
						var me = d3.select(this);
						if (d.depth === 0 || d.single && d.single === true) {

							d3.select(this.parentNode)
								.attr("transform", function(d) {
									d.x = d.x + 20;  // accounting for size
									return "translate(" + d.y + "," + d.x + ")";
								})
							if (d.depth === 0) {
								var offset = this.getBBox().width;
								svg.attr("transform", "translate("+(offset+10)+",0)")
							}
						}
					})

					svg.each(function() {
						var bbox = this.getBBox(),
							container = d3.select('svg')
								.attr('viewBox',"0 0 " + (bbox.width+20)+" "+(bbox.height))
								.attr('preserveAspectRatio','xMinYMin')
								// .attr('width',bbox.width)
					})

			svg.append("svg:defs").selectAll("marker")
			    .data(["end", "start"])
			  .enter().append("svg:marker")
			    .attr("id", String)
			    .attr('class','link arrow')
			    .attr("viewBox", "0 -5 10 10")
			    .attr("orient", "auto")
			    .attr("refX", 5)
			    .attr("refY", 0)
			    .attr("markerWidth", 6)
			    .attr("markerHeight", 3)
			    .attr("orient", "auto")
			  .append("svg:path")
			    .attr("d", function(d) {
			    	return (d == "start") 
				    	? "M 10,-5 L 0,0 L10,5"    
						: "M 0,-5 L 10,0 L0,5"
			    });



		d3.xhr("style.css", 'text/plain',function(response) {
			  var html = d3.select("svg")
			      .attr("version", 1.1)
			      .attr("xmlns", "http://www.w3.org/2000/svg")
			      .node().parentNode.innerHTML;
				html = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" + html;
				html = html.replace('<defs>', "<defs><style type='text/css'><![CDATA["+response.responseText+"]]></style>")
				html = html.replace("class=\"svg\"","class=\"svg "+document.body.className+"\"");

			  d3.select("body").select("#download")
			      .attr("title", "file.svg")
			      .attr("href-lang", "image/svg+xml")
			      .attr("href", "data:image/svg+xml;charset=utf-8;base64,\n" + btoa(unescape(encodeURIComponent( html ))))

		});

		document.querySelector("#gallery").className = "loaded";


	});

}
window.onscroll = onScroll;
window.onload = load;