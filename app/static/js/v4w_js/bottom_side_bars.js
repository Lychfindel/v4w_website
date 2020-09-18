/* Licensed under AGPLv3
/*!
* Venessia4Working Javascripts
* Copyleft 2020

*/

/* show possibilities window / differnet mobile and desktop */
function showPossibilitiesWindow(possibilities, markerOptions, map, what_are_we_doing, searched_start, searched_end, start_found) {
	var cur_result_coords = '';
	var div ='';
	var cur_result_name = '';
  var cur_result_description = '';
	all_possibilities_div = document.createElement('div');
	all_possibilities_div.setAttribute('id', 'all_possibilities');
	if (areWeUsingBottomBar()){
		all_possibilities_div.setAttribute('class', 'scrollable-wrapper row flex-row flex-nowrap');
		all_possibilities_div.setAttribute('style', 'height:100%;');
	}
	for (i = 0; i < possibilities.length; i++) {
		cur_result_name = get_icon() + " " + possibilities[i].nome;
		cur_result_coords = possibilities[i].coordinate;
		// cur_result_description e un dizionario con tante informazioni:
		// da quello creiamo una string fatta bene
    cur_result_description = get_description_as_string(possibilities[i].descrizione);


		card_col = document.createElement('div');
		if (areWeUsingBottomBar()){
			card_col.setAttribute('class', 'col-5');
		}
		card = document.createElement('div');

		if (areWeUsingBottomBar()){
			card.setAttribute('class', 'card possibilities_result border border-secondary rounded');
			card.setAttribute('style', 'height: 100%;')
		}else{
			card.setAttribute('class', 'card possibilities_result border border-secondary rounded mb-1');
		}
		card.lat = cur_result_coords[0];
		card.lng = cur_result_coords[1];
    card.name = cur_result_name;
    card.description = cur_result_description

		card_header = document.createElement('div');
		card_header.setAttribute('class','card-header');
		card_header.innerHTML = '<div class="row">'
														+'<div class="col-12 align-self-center"><h6 class="card-title"><strong>'+cur_result_name+'</strong></h6></div>'
														//+'<div class="col-1 align-self-center " style="z-index: 10"><button class="btn btn-sm btn-light v4wbtn pull-right" onclick="showResultLocation()"><i class="fa fa-map-marker"></i></button></div>'
														+'</div>';
		//card_header.onclick = function() {stopPropagation();};
		card_body = document.createElement('div');
		card_body.setAttribute('class','card-body');
		card_body.innerHTML = '<p class="card-text">'+cur_result_description+'</p>';
		if (isTouchDevice){
			card.onclick = function () {
				if (activeCard == this){
					clearHighlight(this);
					fillForm(this);
					submitForm();
					// goToNextStep(getNextStep(this, what_are_we_doing, this.name, searched_end, start_found));
				} else{
          if (activeCard != ''){
            clearHighlight(activeCard);
          }
					activeCard = this;
					showHighlight(this);
          // move the map over the coordinates
          mymap.panTo([this.lat,this.lng]);
				};
			};
		} else {
      // card.onclick = function() {fillForm(this, what_are_we_doing, searched_end, start_found); document.getElementById("form_id").submit();}
			// passare come parametro dict_in_JS (o almeno params_research)
			// card.onclick = function() {goToNextStep(getNextStep(this, what_are_we_doing, this.name, searched_end, start_found));};
			card.onclick = function() {fillForm(this); submitForm();};
			card.onmouseover = function() {showHighlight(this);};
			card.onmouseout = function() {clearHighlight(this);};
		}
		card.appendChild(card_header);
		card.appendChild(card_body);
		card_col.appendChild(card);
		all_possibilities_div.appendChild(card_col);
		// div = document.createElement('div');
		// div.setAttribute('class', 'possibilities_result');
		// //div.setAttribute('class', '');
		// //dev.setAttribute('class', 'card');
		// div.setAttribute('coords',cur_result_coords)
		// div.coords = cur_result_coords;
		// div.innerHTML = "<b>"+cur_result_name+"</b><br>"+cur_result_coords; // repr
		// div.onclick = function() { goToNextStep(this, what_are_we_doing, searched_start, searched_end, start_found); };
		// console.log(div);
		console.log("for this div we searched "+searched_end);
		//document.getElementById("possibilitiesFather").appendChild(div);
		var curMarkerOptions = markerOptions;
		curMarkerOptions["title"] = cur_result_name;
		var marker = L.marker([cur_result_coords[0], cur_result_coords[1]],curMarkerOptions);

		// markerPopup.setLatLng([cur_result_coords[0], cur_result_coords[1]]);
		// passare come parametro params_research (o dict_in_JS)
		var markerNextStep = getNextStep(marker.getLatLng(), what_are_we_doing, cur_result_name, searched_end, start_found)

		marker.bindPopup("<div class='text-center'><b>"+cur_result_name+"</b><br>"+cur_result_description+"<br><a href='"+markerNextStep+"' class='btn btn-sm btn-light v4wbtn' style='font-size: 0.8em;color:inherit;'>Dequa!</a></div>");

		possibilitiesLayer.addLayer(marker).addTo(map);
	}
	document.getElementById("possibilitiesFather").appendChild(all_possibilities_div);
	document.getElementById("possibilitiesFather").setAttribute("style","height:100%;")
	console.log("We are doing: "+ what_are_we_doing);
	if (what_are_we_doing == "address") {
		document.getElementById("search_field_1").value = searched_start;
		document.getElementById("search_field_1").style.backgroundColor = "#f44";
    console.log('@showPossibilitiesWindow[address]: show X button in first search field');
    nowitstimetoshowtheX('search_field_1_x');
	} else {
		showSecondSearchbar();
		//document.getElementById("search_field_1").value = searched_start;
		//document.getElementById("search_field_2").value = searched_end;
		if (what_are_we_doing == "choosing_start") {
      document.getElementById("search_field_1").value = searched_start;
			document.getElementById("search_field_1").style.backgroundColor = "#f44";
      document.getElementById("search_field_2").value = searched_end;
		} else if (what_are_we_doing == "choosing_end") {
      document.getElementById("search_field_1").value = start_found.nome;
      document.getElementById("search_field_2").value = searched_end;
			document.getElementById("search_field_2").style.backgroundColor = "#f44";
		}
    console.log('@showPossibilitiesWindow[choosing_start/choosing_end]: show both X buttons');
    showbothXbuttons();
	}

	showSidebar();
}

function get_description_as_string(description_dict) {
	if (description_dict['modelName'] == 'Poi'){
			console.log('I m showing a Poi')
			known_type = translate_type(description_dict['type'])
			description_string = description_dict['address'] +<br> known_type
		}
	else if (description_dict['modelName'] == 'Location') {
			console.log('I m showing a Location')
			description_string = description_dict['address']
		}
	return description_string
}

function translate_type(description_dict['type']){


}

// dalla descrizione del nome scegliamo un'icona appropriata
function get_icon(description_dict){
	icon = '<i class="fa fa-map-marker" aria-hidden="true"></i>'; // il default marker
	if (description_dict['modelName'] == 'Location') {
		icon = '<i class="fa fa-map-pin" aria-hidden="true"></i>';
	}
	else if (description_dict['modelName'] == 'Street') {
		icon = '<i class="fa fa-road" aria-hidden="true"></i>';
	}
	else if (description_dict['modelName'] == 'Area' or description_dict['modelName'] == 'Neighborhood') {
		icon = '<i class="fa fa-map-o" aria-hidden="true"></i>';
	}
	else if (description_dict['modelName'] == 'POI') {
		if (description_dict['type'][0] == '') {


			icon = '<i class="fas fa-utensils"></i>'; // ristorante
			icon = '<i class="fas fa-pizza-slice"></i>'; //pizzeria
			icon = '<i class="fas fa-shopping-bag"></i>'; //negozio
		}
	}

	return icon
}

function fillForm(element) {
	console.log("I fill the form with :");
	console.log(element);
	var what_are_we_doing = findWhatWeKnow().what_we_know;
	if (what_are_we_doing == "choosing_start" || what_are_we_doing == "address") {
		$("#search_field_1").val(element.name);
		$("#hidden_start_coord").val(""+element.lat+","+element.lng);
	} else if ( what_are_we_doing == "choosing_end") {
		$("#search_field_2").val(element.name);
		$("#hidden_end_coord").val(""+element.lat+","+element.lng);
	}
	return;
}

function submitForm() {
	$('#ricerca_ind').submit();
	return true
}

function getNextStep(element, what_are_we_doing, cur_result_name, searched_end, start_found) {
	var clicked_coords = [element.lat, element.lng];
	var new_site_to_go = "";
  var stringBoxes = retrieveBoxesSituationAsAString();
	// check if there was an already selected end
	var end_coord = dict_in_JS.params_research.end_coord;
	if (what_are_we_doing == "choosing_start" || what_are_we_doing == "address") {
		new_site_to_go = "/?partenza="+encodeURI(cur_result_name).replace(/%20/g, "+")+"&start_coord=LatLng("+clicked_coords[0]+", "+clicked_coords[1]+")&arrivo="+encodeURI(searched_end).replace(/%20/g, "+")+"&end_coord="+end_coord+stringBoxes;
    // document.getElementById("search_field_1").value = cur_result_name
    // document.getElementById("start_coord").value = "LatLng("+clicked_coords[0]+", "+clicked_coords[1]+")";
  }
	else if (what_are_we_doing == "choosing_end") {
		var strt_coords = start_found.coordinate;
    var strt_name = start_found.nome;
		//alert('start found e: ' + start_found);
		// vecchia Versione
		//new_site_to_go = "/?partenza="+escape(strt_name).replace(/%20/g, "+")+"&start_coord=LatLng("+strt_coords[0]+", "+strt_coords[1]+")&arrivo="+escape(cur_result_name).replace(/%20/g, "+")+"&end_coord=LatLng("+clicked_coords[0]+", "+clicked_coords[1]+")"+stringBoxes;
		// nuova!
		new_site_to_go = "/?partenza="+encodeURI(strt_name).replace(/%20/g, "+")+"&start_coord="+encodeURI(strt_coords)+")&arrivo="+encodeURI(cur_result_name).replace(/%20/g, "+")+"&end_coord=LatLng("+clicked_coords[0]+", "+clicked_coords[1]+")"+stringBoxes;
    // document.getElementById("search_field_1").value = strt_name
    // document.getElementById("start_coord").value = "LatLng("+strt_coords[0]+", "+strt_coords[1]+")";
    // document.getElementById("search_field_2").value = cur_result_name
    // document.getElementById("end_coord").value = "LatLng("+clicked_coords[0]+", "+clicked_coords[1]+")";
  }
	return new_site_to_go;
}

function retrieveBoxesSituationAsAString() {
  var by_boat_checked = document.getElementById("boat_setting").checked ? "&boat=on" : "&boat=off";
  var less_bridges_checked = document.getElementById("less_bridges_setting").checked ? "&lazy=on" : "&lazy=off";
	var walk_setting_checked = document.getElementById("walk_setting").checked ? "&walking=on" : "&walking=off";
  return by_boat_checked + less_bridges_checked;
}

function animateSidebar() {
  $("#sidebar").animate({
    width: "toggle"
  }, 350, function() {
    document.getElementById("mapid").invalidateSize();
  });
}

function hideSidebar(){
	document.getElementById("sidebar").style.display = 'none';
	document.getElementById("show-sidebar").style.display = 'block';
	restoreMapForBottomBar();
	mymap.invalidateSize();
}

function showSidebar(){
	document.getElementById("sidebar").style.display = 'block';
	document.getElementById("show-sidebar").style.display = 'none';
	shrinkMapForBottomBar();
	mymap.invalidateSize();
	//animateSidebar();
}

function shrinkMapForBottomBar(){
	if (areWeUsingBottomBar()){
		console.log("Let's shrink the map size");
		document.getElementById("mapcontainer").classList.add('shrinkedMapForBottomBar');
	}
}

function restoreMapForBottomBar(){
	if (areWeUsingBottomBar()){
		console.log("Let's restore the map size");
		document.getElementById("mapcontainer").classList.remove("shrinkedMapForBottomBar")
	}
}

function areWeUsingBottomBar(){
	if ((window.innerWidth < 812) && (window.innerWidth < window.innerHeight)){
		return true;
	} else{
		return false;
	}
}

function clearAllResults() {
	removeSidebar();
	removePossibilitiesLayer();
	removePathLayer();
	removeMarkerLocation();
}

function removeSidebar(){
  $("#possibilitiesFather").empty();
	hideSidebar();
	$("#show-sidebar").hide();
}

function removePossibilitiesLayer(){
	highlight.clearLayers();
	possibilitiesLayer.eachLayer(function(layer) {
		possibilitiesLayer.removeLayer(layer);
	});
	try{
		mymap.removeLayer(polygon);
	} catch{
		console.log("no polygon");
	};
}

function removePathLayer(){
	pathLines.clearLayers();
	pathGroup.eachLayer(function(layer) {
		mymap.removeLayer(layer);
	});
}

function removeMarkerLocation(){
	try{
		mymap.removeLayer(marker_location);
	} catch{
		console.log("no marker of single location")
	};
}

function updateViewsAfterResizeWindow() {
	results_in_sidebar = $("#possibilitiesFather")[0].childElementCount;
	if (results_in_sidebar > 0) {
		if (is_keyboard){
			hideSidebar();
			$("#show-sidebar").hide();
		} else {
			console.log("Nell'else")
			showSidebar();
		}
	}
	console.log("View aggiornata!")
}
