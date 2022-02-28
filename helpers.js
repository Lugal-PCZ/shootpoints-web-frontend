// Custom helper functions to provide functionality that isn't directly available in htmx.

function htmx_render_442() {
	// force htmx to render 422 responses like it does 2xx ones
	document.addEventListener('htmx:beforeSwap', function (evt) {
		if (evt.detail.xhr.status === 422) {
			evt.detail.shouldSwap = true;
			// set isError to false to avoid error logging in console
			evt.detail.isError = false;  // Note: for some reason, this doesn't seem to be working.
		};
	});
}

function htmx_reset_form_fields() {
	// clear form fields on successful submission
	document.addEventListener('htmx:afterOnLoad', function (evt) {
		if (evt.detail.xhr.status >= 200 && evt.detail.xhr.status <= 299) {
			if (evt.detail.elt.nodeName === "FORM") {
				let preLoaders = document.getElementById("preLoaders").innerHTML;
				document.getElementById("preLoaders").innerHTML = preLoaders;
				htmx.process(document.getElementById("preLoaders"));
				try {
					let formtoclear = document.getElementById(evt.detail.elt.id);
					if (formtoclear.hasAttribute("clearonsuccess")) {
						formtoclear.reset();
						formtoclear.getElementsByTagName("button")[0].disabled = true;
					}
				}
				catch (e) {
					// clearonsuccess isn't set in the calling element, so just skip it
				}
			}
		};
	});
}

function show_on_the_fly_adjustments_popup() {
	fetch("/atmosphere/")
		.then(response => response.json())
		.then(data => {
			document.getElementById("setAtmosphericConditionsFormTemperature").value = data.temperature;
			document.getElementById("setAtmosphericConditionsFormPressure").value = data.pressure;
		});
	fetch("/prism_raw/")
		.then(response => response.json())
		.then(data => {
			document.getElementById("setPrismOffsetsVerticalDistance").value = Math.abs(data.vertical_distance);
			if (data.vertical_distance !== 0) {
				document.getElementById("setPrismOffsetsVerticalDirection").value = data.vertical_distance / Math.abs(data.vertical_distance);
			}
			document.getElementById("setPrismOffsetsLatitudeDistance").value = Math.abs(data.latitude_distance);
			if (data.latitude_distance !== 0) {
				document.getElementById("setPrismOffsetsLatitudeDirection").value = data.latitude_distance / Math.abs(data.latitude_distance);
			}
			document.getElementById("setPrismOffsetsLongitudeDistance").value = Math.abs(data.longitude_distance);
			if (data.longitude_distance !== 0) {
				document.getElementById("setPrismOffsetsLongitudeDirection").value = data.longitude_distance / Math.abs(data.longitude_distance);
			}
			document.getElementById("setPrismOffsetsRadialDistance").value = Math.abs(data.radial_distance);
			if (data.radial_distance !== 0) {
				document.getElementById("setPrismOffsetsRadialDirection").value = data.radial_distance / Math.abs(data.radial_distance);
			}
			document.getElementById("setPrismOffsetsTangentDistance").value = Math.abs(data.tangent_distance);
			if (data.tangent_distance !== 0) {
				document.getElementById("setPrismOffsetsTangentDirection").value = data.tangent_distance / Math.abs(data.tangent_distance);
			}
			document.getElementById("setPrismOffsetsWedgeDistance").value = Math.abs(data.wedge_distance);
			if (data.wedge_distance !== 0) {
				document.getElementById("setPrismOffsetsWedgeDirection").value = data.wedge_distance / Math.abs(data.wedge_distance);
			}
		});
	let thepopup = document.getElementById("onTheFlyAdjustmentsPopup");
	thepopup.hidden = false;
}

function collapse_section(thesection) {
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

function update_description(source, target) {
	let thedescription = source.options[source.selectedIndex].getAttribute("description");
	if (thedescription === "") {
		thedescription = "(no description recorded)"
	}
	if (thedescription === null) {
		document.getElementById(target).removeAttribute("onclick");
	} else {
		thedescription = thedescription.replaceAll("\\", "\\\\");
		thedescription = thedescription.replaceAll("\'", "\\\'");
		thedescription = thedescription.replaceAll("\"", "\\\"");
		document.getElementById(target).setAttribute("onclick", "alert('" + thedescription + "')");
	}
}

function update_required_new_site_fields(coordinatesystemmenu) {
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

function show_shot_form(theform) {
	switch (theform) {
		case "takeShotForm":
			document.getElementById(theform).hidden = true;
			document.getElementById("saveShotForm").hidden = true;
			document.getElementById("cancelShotForm").hidden = false;
			break;
		case "cancelShotForm":
			document.getElementById(theform).hidden = true;
			document.getElementById("saveShotForm").hidden = true;
			document.getElementById("takeShotForm").hidden = false;
			break;
		case "saveShotForm":
			document.getElementById(theform).hidden = true;
			document.getElementById("cancelShotForm").hidden = true;
			document.getElementById("takeShotForm").hidden = false;
			break;
	}
}

// async function foo() {
// 	let response = await fetch("/atmosphere/");
// 	let json = await response.json();
// 	alert(Mustache.render("Atmosphere: {{temperature}}°C, {{pressure}}mmHg", json));
// }
