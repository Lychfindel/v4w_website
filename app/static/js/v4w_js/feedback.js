/* Licensed under AGPLv3
 /*!
  * Venessia4Working Javascripts
  * Copyleft 2020

  */



function closeFeedbackWindow() {
	document.getElementById("mapid").style.opacity = 1.0;
	document.getElementById("feedbackwindow").style.display = "none";
	document.getElementById("searchbar").style.display = "block";
	var thingstoBeShown = document.getElementsByClassName("onlyMap");
	for (i = 0; i < thingstoBeShown.length; i++) {
		thingstoBeShown[i].style.display = "inline";
	}
}

function setValuesInFeedbackWindow(JSdict) {
	// in any case, we set the start and end_coords (worst case they are "")
	// we copy the values from the hidden fields for the search
	// the field with "_fb" are inside the feedback form, so they will be sent
	// along with the feedback form, I hope
	console.log("copying hidden field to the feedback hidden field");
	$('#hidden_start_coord_fb').val($('#hidden_start_coord').val());
	$('#hidden_end_coord_fb').val($('#hidden_end_coord').val());


	if (JSdict == "None"){
		console.log("jsdict is none!");
    return
  } else if ("error" in JSdict) {
		console.log("error in jsdict!");
    return
  } else {
		console.log("updating hidden field..");
		$('#fbDict').val(JSON.stringify(JSdict));
    // values we found
    var all_found_start = [];
    for (found_start of JSdict.partenza){
      all_found_start.push(found_start.nome);
    };
    var all_found_end = [];
    for (found_end of JSdict.arrivo){
      all_found_end.push(found_end.nome);
    };

    // determine what to show
    if(JSdict.modus_operandi==0 || (JSdict.modus_operandi==2 && JSdict.arrivo == "no_end")) {
			console.log('show no end');
      // show div
      document.getElementById("form-search-address").style.display = "flex";
      document.getElementById("form-found-address").style.display = "flex";
      // write values
      document.getElementById("searched_string").value = JSdict.searched_start;
      document.getElementById("found_string").value = all_found_start.join("; ");
    } else if (JSdict.modus_operandi==1 || JSdict.modus_operandi==2){
      // show div
      document.getElementById("found_start").value = all_found_start.join("; ");
      document.getElementById("found_end").value = all_found_end.join("; ");
      document.getElementById("form-search-path").style.display = "flex";
      document.getElementById("form-found-path").style.display = "flex";
      // write values
      document.getElementById("searched_start").value = JSdict.searched_start;
      document.getElementById("searched_end").value = JSdict.searched_end;
      document.getElementById("found_start").value = all_found_start.join("; ");
      document.getElementById("found_end").value = all_found_end.join("; ");
    } else {
      // do nothing
      return
    }
  }
}


function closeErrorAndShowFeedbackNew() {
	console.log("closing error window");
	// chiudi la di errore
	document.getElementById('errorwindow').style.display = 'none';
	console.log("setting window to show: true using jQuery");
	// apri la finestra di setting
	$('#settingsWindow').modal({
		show: true
	});
	showFeedbackWindowNew();
}
function showFeedbackWindowNew() {
	console.log("opening feedback window");
	document.getElementById("settings-general").style.display = 'none';
	document.getElementById("settings-feedback").style.display = 'block';
	// Dropdown choices:
	// (0, 'Oggetto non specificato')
	// (1, 'Indirizzo sbagliato')
	// (2, 'Strada sbagliata')
	// (3, 'Problemi di grafica')
	// (4, 'Proposta di miglioramento')
	// (5, 'Altro')
	document.getElementById("category").selectedIndex = 0;
	// we copy the hidden_coords
	console.log("@showFeedbackWindowNew: copying hidden field to the feedback hidden field");
	$('#hidden_start_coord_fb').val($('#hidden_start_coord').val());
	$('#hidden_end_coord_fb').val($('#hidden_end_coord').val());
}

function closeFeedbackWindowNew() {
	document.getElementById("settings-feedback").style.display = 'none';
}
