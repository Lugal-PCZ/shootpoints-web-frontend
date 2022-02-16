// Custom helper functions to provide functionality that isn't directly available in htmx.

function htmx_render_442() {
	// force htmx to render 422 responses like it does 2xx ones
	document.addEventListener('htmx:beforeSwap', function (evt) {
		if (evt.detail.xhr.status === 422) {
			evt.detail.shouldSwap = true;
			// set isError to false to avoid error logging in console
			// Note: for some reason, this doesn't seem to be working.
			evt.detail.isError = false;
		};
	});
}

function htmx_reset_form_fields() {
	// clear form fields on successful submission
	document.addEventListener('htmx:afterOnLoad', function (evt) {
		if (evt.detail.xhr.status >= 200 && evt.detail.xhr.status <= 299) {
			if (evt.detail.elt.nodeName === "BUTTON") {
				let menupreloaders = document.getElementById("menuPreloaders").innerHTML;
				document.getElementById("menuPreloaders").innerHTML = menupreloaders;
				htmx.process(document.getElementById("menuPreloaders"));
				try {
					let formtoclear = document.getElementById(evt.detail.elt.id).parentNode;
					if (formtoclear.hasAttribute("clearonsuccess")) {
						formtoclear.reset();
						let thebutton = formtoclear.getElementsByTagName("button");
						thedescription.disabled = true
					}
				}
				catch (e) {
					// clearonsuccess isn't set in the calling element, just skip it
				}
			}
		};
	});
}

function collapsesection(thesection) {
	// let childforms = Array.from(thesection.parentNode.getElementsByTagName("form"));
	// childforms.forEach(childform => {
	// 	childform.hidden = !childform.hidden;
	// });
	thesection.parentNode.querySelector(".sectionforms").hidden = !thesection.parentNode.querySelector(".sectionforms").hidden;
	let collapser = thesection.parentNode.querySelector(".collapser");
	collapser.hidden = !collapser.hidden;
	let expander = thesection.parentNode.querySelector(".expander");
	expander.hidden = !expander.hidden;
}

function show_required_field(thefield) {
	document.getElementById(thefield + "Label").hidden = false;
	document.getElementById(thefield).hidden = false;
	try {
		document.getElementById(thefield.replace("Menu", "Description")).hidden = false;
	} catch {
		// ignore the error
	}
	document.getElementById(thefield).required = true;
}

function hide_required_field(thefield) {
	document.getElementById(thefield + "Label").hidden = true;
	document.getElementById(thefield).hidden = true;
	try {
		document.getElementById(thefield.replace("Menu", "Description")).hidden = true;
	} catch {
		// ignore the error
	}
	document.getElementById(thefield).required = false;
}

function toggle_button(theelement) {
	let thebutton = theelement.parentNode.getElementsByTagName("button")[0]
	let requiredfields = [...theelement.parentNode.querySelectorAll("[required]")];
	let optionalfields = [...theelement.parentNode.querySelectorAll("[optional]")];
	let requiredfieldswithdata = requiredfields.filter(function (field) {
		if (document.getElementById(field.id).value != "0" && document.getElementById(field.id).value != "") {
			return field;
		}
	});
	let optionalfieldswithdata = optionalfields.filter(function (field) {
		if (document.getElementById(field.id).value != "0" && document.getElementById(field.id).value != "") {
			return field;
		}
	});
	if (requiredfields.length > 0 && requiredfieldswithdata.length === requiredfields.length) {
		thebutton.disabled = false;
	} else if (optionalfields.length > 0 && optionalfieldswithdata.length > 0) {
		thebutton.disabled = false;
	} else {
		thebutton.disabled = true;
	}
};

function update_description(source, target) {
	let thedescription = source.options[source.selectedIndex].getAttribute("description");
	if (thedescription === "") {
		thedescription = "(no description recorded)"
	}
	if (thedescription === null) {
		document.getElementById(target).removeAttribute("onclick");
	} else {
		document.getElementById(target).setAttribute("onclick", "alert('" + thedescription + "')");
	}
}

function update_required_new_site_fields(coordinatesystemmenu) {
	document.getElementById("saveNewStationFormHiddenField").required = false;
	switch (coordinatesystemmenu.value) {
		case "Site":
			show_required_field("saveNewStationNorthing");
			show_required_field("saveNewStationEasting");
			show_required_field("saveNewStationElevation");
			hide_required_field("saveNewStationUTMZone");
			hide_required_field("saveNewStationLatitude");
			hide_required_field("saveNewStationLongitude");
			break;
		case "UTM":
			show_required_field("saveNewStationNorthing");
			show_required_field("saveNewStationEasting");
			show_required_field("saveNewStationElevation");
			show_required_field("saveNewStationUTMZone");
			hide_required_field("saveNewStationLatitude");
			hide_required_field("saveNewStationLongitude");
			break;
		case "Lat/Lon":
			hide_required_field("saveNewStationNorthing");
			hide_required_field("saveNewStationEasting");
			hide_required_field("saveNewStationUTMZone");
			show_required_field("saveNewStationLatitude");
			show_required_field("saveNewStationLongitude");
			show_required_field("saveNewStationElevation");
			break;
		default:
			hide_required_field("saveNewStationNorthing");
			hide_required_field("saveNewStationEasting");
			hide_required_field("saveNewStationElevation");
			hide_required_field("saveNewStationUTMZone");
			hide_required_field("saveNewStationLatitude");
			hide_required_field("saveNewStationLongitude");
	}
}

function update_backsight_station_menu(occupiedstationmenu) {
	let options = occupiedstationmenu.innerHTML.split("\n");
	let newoptions = Array();
	options.forEach((option) => {
		if (option.indexOf('value="' + occupiedstationmenu.value + '"') == -1) {
			newoptions.push(option);
		}
	});
	document.getElementById("startNewSessionFormBacksightStationMenu").innerHTML = newoptions.join("\n");
}

function update_required_new_session_fields(sessiontypemenu) {
	switch (sessiontypemenu.value) {
		case "Backsight":
			show_required_field("startNewSessionFormBacksightStationMenu");
			show_required_field("startNewSessionFormPrismHeight");
			hide_required_field("startNewSessionFormInstrumentHeight");
			hide_required_field("startNewSessionFormAzimuth");
			break;
		case "Azimuth":
			hide_required_field("startNewSessionFormBacksightStationMenu");
			hide_required_field("startNewSessionFormPrismHeight");
			show_required_field("startNewSessionFormInstrumentHeight");
			show_required_field("startNewSessionFormAzimuth");
			break;
		default:
			hide_required_field("startNewSessionFormBacksightStationMenu");
			hide_required_field("startNewSessionFormPrismHeight");
			hide_required_field("startNewSessionFormInstrumentHeight");
			hide_required_field("startNewSessionFormAzimuth");
	}
}
