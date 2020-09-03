/* Licensed under AGPLv3
/*!
* Venessia4Working Javascripts
* Copyleft 2020

*/
function initialize_html(){
  toggleXbuttons();
  document.getElementById("search_field_1").addEventListener("change", clear_hidden_start);
  document.getElementById("search_field_2").addEventListener("change", clear_hidden_end);
  console.log("feedback sent ", feedbacksent);
  // deal with feedback sent
  switch(feedbacksent) {
    case -1:
    // error in the feedback
    document.getElementById("feedbackmessagewindow-fail").style.display = 'block';
    break;
    case 1:
    // feedback sent
    document.getElementById("feedbackmessagewindow-success").style.display = 'block';
    break;
  }
  var popup = L.popup();

  function onMapClick(e) {
    var address_string = e.latlng.toString();
    popup
    .setLatLng(e.latlng)
    .setContent("<div class='text-center'>Posizione: " + address_string + "<br><button  class='btn btn-sm btn-light v4wbtn mr-3' style='font-size: 0.8em;' id='btnMapStart'>DA QUA</button><button  class='btn btn-sm btn-light v4wbtn' style='font-size: 0.8em;' id='btnMapTo'>A</button><br></div>")
    .openOn(mymap);
    document.getElementById('btnMapStart').onclick = function() { copyStartingPosition(address_string); addMarkerStart(e.latlng); popup.remove();};
    document.getElementById('btnMapTo').onclick = function() { copyEndingPosition(address_string); addMarkerEnd(e.latlng);popup.remove();};
  }
  mymap.on('click', onMapClick);
  // HERE WE READ OUR JSON MESSAGE FROM PYTHON
  //var result = JSON.parse({{ results_dictionary | tojson }});
  // var dict_in_JS = {{results_dictionary | tojson}};

  console.log("dict: ",dict_in_JS);
  // Set values on feedback window
  setValuesInFeedbackWindow(dict_in_JS);

  if (dict_in_JS == "None") {
    mymap.setView([45.435, 12.333], 15);
    hidebothXbuttons();
  } else if ("error" in dict_in_JS) {
    mymap.setView([45.435, 12.333], 15);
    console.log("error: " + dict_in_JS.msg)
    document.getElementById("errorwindow-explanation").innerHTML = dict_in_JS.msg;
    document.getElementById("errorwindow").style.display = 'block';
    //alert("Ahi ahi!!!\nOps... cossa xe nato :(\n"+dict_in_JS.msg)

  } else {
    mymap.setView([45.435, 12.333], 15);
    // options for all markers
    var marker_icon = L.icon({
      iconUrl: '/static/img/icon_marker_50.png',
      iconRetinaUrl: '/static/img/icon_marker.png',
      iconSize: [33, 50],
      iconAnchor: [16, 49],
      popupAnchor: [0, -40]
    });

    // Options for the marker
    var markerOptions = {
      clickable: true,
      // si alza all'hover - non va :(
      riseOnHover: true,
      icon: marker_icon
    }

    var modus_operandi = dict_in_JS.modus_operandi;
    console.log("siamo in modus_operandi: " + modus_operandi);
    var geo_type = dict_in_JS.partenza[0].geotype;
    console.log("geo_type in questo caso = " + geo_type);
    // we switch with modus_operandi
    // modus == 0 --> indirizzo, o nulla?
    // modus == 1 --> strada tra A e B
    switch(modus_operandi) {
      case 0:
      // here all the stuff we can do when only one address is searched
      // NEW VERSION with geo_type
      // geo_type == -2 --> pagina senza ricerca
      // geo_type == -1 --> trovato nulla, pazienza
      // geo_type == 0 --> marker, un punto solo
      // geo_type == 1 --> poligono
      // e facile aggiungere geo_type se vogliamo piu avanti
      showResultsWindow('single_address');
      console.log("shown a single address result")
      var name_location = dict_in_JS.params_research.da;
      document.getElementById('search_field_1').value = name_location
      if (name_location.length > 0) {
        nowitstimetoshowtheX('search_field_1_x');
      }
      // if we have the coordinate, we should keep it!
      if (dict_in_JS.start_type == 'unique') {
        document.getElementById('hidden_start_coord').value = dict_in_JS.partenza[0].coordinate;
      }
      document.getElementById("found_text").innerHTML = "<i>"+name_location+"</i>";
      switch(geo_type) {
        case -2:
        // do nothing - pagina senza ricerca_ind
        mymap.setView([45.43, 12.33], 15);
        break;
        case -1: // in realta per ora non serve a nulla
        // code block
        alert('non abbiamo trovato nulla! Sicuro di aver scritto giusto? Riprova');
        break;
        case 0:
        // coordinate
        var coords_location = dict_in_JS.partenza[0].coordinate;
        marker_location = L.marker(coords_location, markerOptions);
        document.getElementById("type_text").innerHTML = "<i>indirizzo</i>";
        // Popup se uno clicca sul marker
        marker_location.bindPopup("Abbiamo trovato " + name_location).openPopup();
        // aggiungi il marker sulla mappa
        marker_location.addTo(mymap);
        var group = new L.featureGroup([marker_location]);
        mymap.fitBounds(group.getBounds());
        //mymap.setView([{{start_coordx}}, {{start_coordy}}], 18);
        break;
        case 1:
        // DISEGNA POLIGONO
        var polygonOptions = {

          title: "Evidenziato " + name_location,
          clickable: true,
          // si alza all'hover - non va :(
          riseOnHover: true
        }
        // var polygon = L.polygon([
        // 		dict_in_JS.partenza[0].shape
        // ], polygonOptions).addTo(mymap);
        // var group = new L.featureGroup([polygon]);
        document.getElementById("type_text").innerHTML = "<i>area</i>";
        console.log("geojson: "+ dict_in_JS.partenza[0].geojson);
        // Per qualche motivo dice che il geojson è fatto male
        var polygon = L.geoJSON(dict_in_JS.partenza[0].geojson);
        polygon.addTo(mymap);
        mymap.fitBounds(polygon.getBounds());
        //mymap.setView([{{start_coordx}}, {{start_coordy}}], 17);
        break;
        default:
        // do nothing
        console.log("caso default. strano. guarda nello switch che valore ha geo_type");
        break;
      }
      break;
      // MODUS OPERANDI == 1 --> PERCORSO DA A a B
      case 1:
      // geo type is not used
      console.log("Setting up results window!")
      showResultsWindow('percorso');
      var nome_partenza = dict_in_JS.params_research.da;
      document.getElementById("da_text").innerHTML = "<i>"+nome_partenza+"</i>";
      var nome_arrivo = dict_in_JS.params_research.a;
      document.getElementById("a_text").innerHTML = "<i>"+nome_arrivo+"</i>";
      var path_length = dict_in_JS.path.human_readable_length;
      document.getElementById("length_text").innerHTML = "<i>"+path_length+"</i>";
      var time_description = dict_in_JS.path.human_readable_time;
      document.getElementById("time_text").innerHTML = "<i>"+time_description+"</i>";
      var num_of_bridges = dict_in_JS.path.n_ponti;
      document.getElementById("ponti_text").innerHTML = "<i>strada con "+num_of_bridges+" ponti</i>";
      console.log("also the search should be ready");
      showSecondSearchbar();
      document.getElementById('search_field_1').value = nome_partenza;
      if (nome_partenza.length > 0) {
        nowitstimetoshowtheX('search_field_1_x');
      }
      // if we have the coordinate, we should keep it!
      if (dict_in_JS.params_research.start_coord.length > 0) {
        document.getElementById('hidden_start_coord').value = dict_in_JS.params_research.start_coord;
      }
      document.getElementById('search_field_2').value = nome_arrivo;
      if (nome_arrivo.length > 0) {
        nowitstimetoshowtheX('search_field_2_x');
      }
      // if we have the coordinate, we should keep it!
      if (dict_in_JS.params_research.end_coord.length > 0) {
        document.getElementById('hidden_end_coord').value = dict_in_JS.params_research.end_coord;
      }
      else if (dict_in_JS.end_type == 'unique' && dict_in_JS.arrivo[0].coordinate.lenght > 0) {
        document.getElementById('hidden_end_coord').value = dict_in_JS.arrivo[0].coordinate;
      }
      else {
        console.log("[modus 1]: seems like we are not using end_coord! is this correct?")
      }
      console.log("checking the boxes");
      checkTheBoxesThatNeedToBeChecked(dict_in_JS);
      console.log("done checking the boxes");
      console.log("drawing the streets!")

      // here all the stuff when we have path from A to B
      //var punto_di_partenza = L.point(stop_coordx, stop_coordy);
      //var prj = L.Projection.Mercator.unproject(pointM);
      mymap.setView([45.43, 12.33], 13);
      var marker_partenza = L.marker([dict_in_JS.partenza[0].coordinate[0], dict_in_JS.partenza[0].coordinate[1]], markerOptions).setIcon(greenIcon).addTo(mymap);
      var marker_arrivo = L.marker([dict_in_JS.arrivo[0].coordinate[0], dict_in_JS.arrivo[0].coordinate[1]], markerOptions).setIcon(redIcon).addTo(mymap);
      // the pahts: they are more than one
      var street = dict_in_JS.path;
      var group = new L.featureGroup([marker_partenza, marker_arrivo]);
      //console.log("steets: " + streets);
      path_shapes = street.shape_list;
      //var linestrings = L.geoJSON(path_shapes, {'style':stile});
      var linestrings = L.geoJSON(path_shapes, {
        filter: function(feature) {
          // draw only lines!
          return feature.geometry.type == "LineString";
        },
        style: function(feature) {
          switch (feature.properties.street_type) {
            case 'canale': return {color: "#0000ff"};
            case 'ponte':  return {color: "#ffff00"};
            case 'calle':  return {color: "#ff0000"};
          }
        }
      }).addTo(mymap);
      linestrings.addTo(group);
      mymap.fitBounds(group.getBounds(), {padding: [10, 10]});
      // javascript way to call a method in the for loop
      //streets.forEach(drawStreet());
      //alert('YET TO BE DONE');
      break;
      // MODUS OPERANDI == 2 --> Non siamo sicuri della soluzione
      case 2:
      console.log("Setting up possiblities window!")
      var possibilities = "";
      var what_we_know = "nothing";
      var start_found = "";
      var end_found = "";
      var tmp_start = dict_in_JS.searched_start;
      var tmp_end = dict_in_JS.searched_end;
      console.log("Finished setting up possiblities window!");
      console.log("checking the boxes");
      checkTheBoxesThatNeedToBeChecked(dict_in_JS);
      console.log("done checking the boxes");

      if ((dict_in_JS.start_type == 'multiple') && (dict_in_JS.end_type == 'multiple')){
        possibilities = dict_in_JS.partenza;
        what_we_know = "choosing_start";
      } else if ((dict_in_JS.start_type == 'unique') && (dict_in_JS.end_type == 'multiple')) {
        // scegliamo l'arrivo!
        // nome e coordinate della partenza vengono passate come dizionario (start_found)
        possibilities = dict_in_JS.arrivo;
        start_found = {nome:dict_in_JS.params_research.da, coordinate:dict_in_JS.params_research.start_coord};
        //start_found = dict_in_JS.partenza[0];
        what_we_know = "choosing_end";
        showSecondSearchbar();
      } else if ((dict_in_JS.start_type == 'multiple') && (dict_in_JS.end_type == 'unique')) {
        // scegliamo la partenza!
        // nome e coordinate dell'arrivo vengono passate come dizionario (end_found)
        possibilities = dict_in_JS.partenza;
        if (tmp_end) {
          end_found = {nome:dict_in_JS.params_research.a, coordinate:dict_in_JS.params_research.end_coord};
          //end_found = dict_in_JS.params_research.a;
          //end_found = dict_in_JS.arrivo[0];
          what_we_know = "choosing_start";
        } else {
          what_we_know = "address";
        }
      } else {
        what_we_know = "nothing";
      }
      console.log("We send this to js: ",markerOptions)
      // showPossibilitiesWindow(possibilities, markerOptions, mymap, what_we_know, tmp_start, tmp_end, start_found, end_found);
      showPossibilitiesWindow(possibilities, markerOptions, mymap, what_we_know, tmp_start, tmp_end, start_found);

      // sbagliamo a scrivere sulle barre! Da correggere in showPossibilitiesWindow
      // o ancora meglio separare possibilities window dallo scrivere sulle barre
      var nome_partenza = dict_in_JS.params_research.da;
      document.getElementById("search_field_1").value = nome_partenza;
      var nome_arrivo = dict_in_JS.params_research.a;
      document.getElementById("search_field_2").value = nome_arrivo;


      //document.getElementById('search_field_1').value = nome_partenza;
      //keep coordinates
      // if we have the start coordinate, we should keep it!
      if (dict_in_JS.params_research.start_coord.length > 0) {
        document.getElementById('hidden_start_coord').value = dict_in_JS.params_research.start_coord;
      }
      // if we have the end coordinate, we should keep it!
      if (dict_in_JS.params_research.end_coord.length > 0) {
        document.getElementById('hidden_end_coord').value = dict_in_JS.params_research.end_coord;
      }
      //possibilitiesLayer.addTo(mymap);
      mymap.fitBounds(possibilitiesLayer.getBounds());
      /*$(document).ready(function(){
      $(".owl-carousel").owlCarousel();
    });*/
    console.log("done here");
    break;
    break; // final default break
  }//closing switch modus_operandi
  var activeCard = '';
}
}

var activeCard = '';

/* Function to detect if a device is touch or not.
All the credits to https://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript/4819886#4819886
*/
function is_touch_device() {

  var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');

  var mq = function (query) {
    return window.matchMedia(query).matches;
  }

  if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
    return true;
  }

  // include the 'heartz' as a way to have a non matching MQ to help terminate the join
  // https://git.io/vznFH
  var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
  return mq(query);

}

var isTouchDevice = is_touch_device();
console.log("Is touch device? "+isTouchDevice);

function searchAgain() {
  document.getElementById("trovato").style.display = "none";
  document.getElementById("searchbar").style.display = "block";
}

function goToNextStep(nextStep) {
  drawPreLoader()
  window.location = nextStep;
}

//runned by submit
function drawPreLoader() {
  console.log("set opacity..")
  document.getElementById("mapid").style.opacity = 0.3;
  console.log("visualizing div..")
  document.getElementById("loading").style.display = "inline";
  // console.log("drawing preloader..")
  //document.getElementById("loading_gif").src = "/static/assets/loading.gif";
  console.log("done!")
  // setTimeout(console.log("now, ok"), 1000);
  return true;
}

function checkTheBoxesThatNeedToBeChecked(dict_in_JS) {
  var checkBoxesDict = dict_in_JS.params_research;

  if (checkBoxesDict.by_boat == "on") {
    document.getElementById("boat_setting").checked = true;
  }
  if (checkBoxesDict.less_bridges == "on") {
    document.getElementById("less_bridges_setting").checked = true;
  }
  if (checkBoxesDict.walking == "on") {
    document.getElementById("walk_setting").checked = true;
  }
  else {
    document.getElementById("walk_setting").checked = false;
  }
}