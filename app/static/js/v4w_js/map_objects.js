/* Licensed under AGPLv3
 /*!
  * Venessia4Working Javascripts
  * Copyleft 2020

  */



function changeMap(currentMap) {
	console.log("changing map.. from " + currentMap)
	if (currentMap == "OpenStreetMap") {
		whichmap = "ESRIMap";
	} else if (currentMap == 'ESRIMap') {
		whichmap = "OpenStreetMap";
	} else {
		whichmap = "OpenStreetMap";
	}

	mymap.removeLayer(baseMaps[currentMap]);
	baseMaps[whichmap].addTo(mymap);

	console.log("to " + whichmap)
}

function locateUser(map, marker, circle) {
	map.locate({setView: false, watch: false}) /* This will return map so you can do chaining */
		.on('locationfound', function(e){
				marker = L.marker([e.latitude, e.longitude]).bindPopup('Your are here :)');
				circle = L.circle([e.latitude, e.longitude], e.accuracy/2, {
						weight: 1,
						color: '#add8e6',
						fillColor: '#add8e6',
						fillOpacity: 0.2
				});
				map.addLayer(marker);
				map.addLayer(circle);
		})
	 .on('locationerror', function(e){
				console.log(e);
				alert("Location access denied.");
		});
}

function addMarkerStart(latlng) {
  marker_start.setLatLng(latlng);
  marker_start.addTo(mymap);
}

function addMarkerEnd(latlng) {
  marker_end.setLatLng(latlng);
  marker_end.addTo(mymap);
}

function showHighlight(card) {
	var clicked_coords = [card.lat,card.lng];

	console.log("sei sopra a: " + clicked_coords);
	//highlight.clearLayers().addLayer(L.circleMarker([clicked_coords[1], clicked_coords[0]], highlightStyle));
	highlight.clearLayers().addLayer(L.circleMarker([clicked_coords[0], clicked_coords[1]], highlightStyle));
  highlight.bringToFront();
	console.log("highlight: "+ highlight);
  // highlight the card
  // childNodes[0] = header; childNodes[1] = body
  card.childNodes[0].style.background = "#bbb";
  card.childNodes[1].style.background = "#ccc";
}

function clearHighlight(card) {
  highlight.clearLayers();
  // dehighlight the card
  // childNodes[0] = header; childNodes[1] = body
  card.childNodes[0].style.background = "rgb(247, 247, 247)";
  card.childNodes[1].style.background = "rgb(255, 255, 255)";
}

