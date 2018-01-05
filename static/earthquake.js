// Store url to get eartquake data
// var url="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

var colors = [
	"#2EDB23",
	"#A6EE10",
	"#F2F905",
 	"#F8D306",
 	"#F99C05",
 	"#F3550B"]

d3.queue()
	.defer(d3.json, url)
	.await(leafletMap);

// Perform a GET request to the query URL
function leafletMap(err, data) {
  // createFeatures(data.features);
  function onEachFeature(feature, layer) {

    layer.bindPopup("<h3>" + feature.properties.place +"</h3><hr><p>" + new Date(feature.properties.time) + "</p><p>" + ["Magnitude", feature.properties.mag].join(": ") + "<p>");
  }

  var geojsonMarkerOptions = {}

  var earthquakes = L.geoJson(data.features, {

      onEachFeature: onEachFeature,

      pointToLayer: function (feature, latlng) {

        var mag,
            radius,
            fillColor,
            type;

        type=feature.properties.type ;
        mag = feature.properties.mag;

        if(type === "earthquake"){

          if(mag !== null){

            fillColor = getColor(mag);
            radius = 3 * mag;
          }
        }
        return L.circleMarker(latlng, {
          color:"grey",
          fillColor:fillColor,
          radius: radius,
          fillOpacity: 0.7,
          weight: .2
        });
      }
    });
  
// Sending our earthquakes layer to the createMap function
    createMap(earthquakes);

 };

 function getColor(mag){
 	if (mag <= 1){
		return colors[0] // light green 	
	} else if (mag <= 2){
		return colors[1] // yellow green
	} else if (mag <= 3){
		return colors[2] // yellow
	} else if (mag <= 4){
 		return colors[3] //3-4 yellow orange
	} else if (mag <= 5){
 		return colors[4] //4-5 orange
	} else {		
 		return colors[5] // 5+ red
	}
 } 

 
 function createMap(earthquakes) {

	// Define streetmap and darkmap layers
	var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/lizleano/cjc129cawgxpj2smqy4hyrl6n/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGl6bGVhbm8iLCJhIjoiY2pha2Ewc2ZsMmhjYTMyb2l3MGM0aGt0YSJ9.qS_NLsQ0gC7LqW7JA-W1Xg");
	var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/lizleano/cjc0xw024gb792sqepuvmco2s/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGl6bGVhbm8iLCJhIjoiY2pha2Ewc2ZsMmhjYTMyb2l3MGM0aGt0YSJ9.qS_NLsQ0gC7LqW7JA-W1Xg");
	var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/lizleano/cjc156c9vhqyk2srunv5tlamy/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGl6bGVhbm8iLCJhIjoiY2pha2Ewc2ZsMmhjYTMyb2l3MGM0aGt0YSJ9.qS_NLsQ0gC7LqW7JA-W1Xg")
	// Define a baseMaps object to hold our base layers
	var baseMaps = {
	  "Grayscale": lightmap,
	  "Satellite": darkmap,
	  "Outdoors": outdoors
	};


	// Create overlay object to hold our overlay layer
	var overlayMaps = {
  		Earthquakes: earthquakes
	};

	// Create our map, giving it the streetmap and earthquakes layers to display on load
	var myMap = L.map("map", {
		center: [
		  37.09, -95.71
		],
		zoom: 4,
		layers: [lightmap, earthquakes]
	});

	L.control
	  .layers(baseMaps,overlayMaps)
	  .addTo(myMap)

	createLegend(myMap);
	

};

function createLegend(myMap){

	var legend = L.control({position: 'bottomright'});

	legend.onAdd = function (myMap) {

	  var div = L.DomUtil.create('div', 'info legend'),
	            grades = [0, 1, 2, 3, 4, 5],
	            labels = [];

	// loop through our density intervals and generate a label with a colored square for each interval
	  for (var i = 0; i < grades.length; i++) {
	      div.innerHTML +=
	          '<i style="background:' + colors[i] + '"></i> <strong>' +
          	grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '</strong><br>' : '+');
	  }
	  return div;
	};

	legend.addTo(myMap);
}
