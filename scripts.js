// Data getters

async function load_atmospheric_conditions() {
	let target = document.getElementById("atmosphericConditions");
	let template = "Atmosphere: {{ temperature }}°C, {{ pressure }}mmHg";
	let response = await fetch("/atmosphere/");
	let json = await response.json();
	target.innerHTML = Mustache.render(template, json);
}

async function load_classes_menus() {
	let response = await fetch("/class/");
	let json = await response.json();
	Array.from(document.querySelectorAll('.classesmenu')).forEach(function (target) {
		target.innerHTML = Mustache.render(menu_template('classes'), json);
	});
}

async function load_geometries_menus() {
	let response = await fetch("/geometry/");
	let json = await response.json();
	Array.from(document.querySelectorAll('.geometriesmenu')).forEach(function (target) {
		target.innerHTML = Mustache.render(menu_template('geometries'), json);
	});
}

async function load_prism_offsets() {
	let target = document.getElementById("prismOffsets");
	let template = "Prism Offsets: {{.}}";
	let response = await fetch("/prism/");
	let json = await response.json();
	target.innerHTML = Mustache.render(template, json);
}

async function load_setup_errors() {
	let target = document.getElementById("outputBox");
	let template = '' +
		'{{#setup_errors}}' +
		'<b style="color: red;">ERROR:</b> {{.}}' +
		'{{/setup_errors}}';
	let response = await fetch("/summary/");
	let json = await response.json();
	target.innerHTML = Mustache.render(template, json);
}

async function load_sites_menus() {
	let response = await fetch("/site/");
	let json = await response.json();
	Array.from(document.querySelectorAll('.sitesmenu')).forEach(function (target) {
		target.innerHTML = Mustache.render(menu_template('sites'), json);
	});
}


// Data setters

async function _update_data_via_api(theurl, themethod, theform) {
	let target = document.getElementById("outputBox");
	let response = await fetch(
		theurl, {
		method: themethod,
		body: new FormData(theform)
	});
	let json = await response.json();
	target.innerHTML = Mustache.render(output_template(), json);
	return response.status;
}

async function delete_class() {
	let result = await _update_data_via_api("/class/", "DELETE", deleteClassForm)
	if (result >= 200 && result <= 299) {
		document.getElementById("deleteClassForm").reset();
		document.getElementById("deleteClassFormClassDescription").removeAttribute("onclick");
		load_classes_menus();
	}
}

async function delete_site() {
	let result = await _update_data_via_api("/site/", "DELETE", deleteSiteForm)
	if (result >= 200 && result <= 299) {
		document.getElementById("deleteSiteForm").reset();
		load_sites_menus();
		document.getElementById("deleteSiteFormSiteDescription").removeAttribute("onclick");
	}
}

async function delete_station() {
	let result = await _update_data_via_api("/station/", "DELETE", deleteStationForm)
	if (result >= 200 && result <= 299) {
		document.getElementById("deleteStationForm").reset();
		document.getElementById("deleteStationFormSiteDescription").removeAttribute("onclick");
		document.getElementById("deleteStationFormStationsMenu").innerHTML = "";
		document.getElementById("deleteStationFormStationDescription").removeAttribute("onclick");
	}
}

async function delete_subclass() {
	let result = await _update_data_via_api("/subclass/", "DELETE", deleteSubclassForm)
	if (result >= 200 && result <= 299) {
		document.getElementById("deleteSubclassForm").reset();
		document.getElementById("deleteSubclassFormClassDescription").removeAttribute("onclick");
		document.getElementById("deleteSubclassFormSubclassesMenu").innerHTML = "";
		document.getElementById("deleteSubclassFormSubclassDescription").removeAttribute("onclick");
	}
}

async function save_new_class() {
	let result = await _update_data_via_api("/class/", "POST", saveNewClassForm);
	if (result >= 200 && result <= 299) {
		document.getElementById("saveNewClassForm").reset();
		load_classes_menus();
	}
}

async function save_new_site() {
	let result = await _update_data_via_api("/site/", "POST", saveNewSiteForm);
	if (result >= 200 && result <= 299) {
		document.getElementById("saveNewSiteForm").reset();
		load_sites_menus();
	}
}

async function save_new_station() {
	let result = await _update_data_via_api("/station/", "POST", saveNewStationForm);
	if (result >= 200 && result <= 299) {
		document.getElementById("saveNewStationForm").reset();
		document.getElementById("saveNewStationFormSiteDescription").removeAttribute("onclick");
	}
}

async function save_new_subclass() {
	let result = await _update_data_via_api("/subclass/", "POST", saveNewSubclassForm);
	if (result >= 200 && result <= 299) {
		document.getElementById("saveNewSubclassForm").reset();
		document.getElementById("saveNewSubclassFormClassDescription").removeAttribute("onclick");
	}
}

async function set_atmospheric_conditions() {
	let result = await _update_data_via_api("/atmosphere/", "PUT", setAtmosphericConditionsForm);
	load_atmospheric_conditions();
}

async function set_configs() {
	let result = await _update_data_via_api("/config/", "PUT", setConfigsForm);
	if (result >= 200 && result <= 299) {
		document.getElementById("setConfigsForm").reset();
	}
}

async function set_prism_offsets() {
	let result = await _update_data_via_api("/prism/", "PUT", setPrismOffsetsForm);
	load_prism_offsets();
}

async function start_new_grouping() {
	let result = await _update_data_via_api("/grouping/", "POST", startNewGroupingForm);
	if (result >= 200 && result <= 299) {
		document.getElementById("startNewGroupingForm").reset();
		document.getElementById("startNewGroupingFormGeometryDescription").removeAttribute("onclick");
		document.getElementById("startNewGroupingFormClassDescription").removeAttribute("onclick");
		document.getElementById("startNewGroupingFormSubclassesMenu").innerHTML = "";
		document.getElementById("startNewGroupingFormSubclassDescription").removeAttribute("onclick");
	}
}

async function start_new_session() {
	let result = await _update_data_via_api("/session/", "POST", startNewSessionForm);
	if (result >= 200 && result <= 299) {
		document.getElementById("startNewSessionForm").reset();
		document.getElementById("startNewSessionFormSiteDescription").removeAttribute("onclick");
		document.getElementById("startNewSessionFormOccupiedPointMenu").innerHTML = "";
		document.getElementById("startNewSessionFormOccupiedPointDescription").removeAttribute("onclick");
		document.getElementById("startNewSessionFormBacksightStationMenu").innerHTML = "";
		document.getElementById("startNewSessionFormBacksightStationDescription").removeAttribute("onclick");
		update_required_new_session_fields(document.getElementById("startNewSessionFormSessionTypeMenu"));
	}
}


// UI manipulators

function _hide_required_field(thefield) {
	document.getElementById(thefield + "Label").hidden = true;
	document.getElementById(thefield).hidden = true;
	try {
		document.getElementById(thefield.replace("Menu", "Description")).hidden = true;
	} catch {
		// ignore the error
	}
	document.getElementById(thefield).required = false;
}

function _show_required_field(thefield) {
	document.getElementById(thefield + "Label").hidden = false;
	document.getElementById(thefield).hidden = false;
	try {
		document.getElementById(thefield.replace("Menu", "Description")).hidden = false;
	} catch {
		// ignore the error
	}
	document.getElementById(thefield).required = true;
}

function clear_field(thefield) {
	document.getElementById(thefield).value = 0;
}

function collapse_grouping(thegrouping) {
	thegrouping.parentNode.querySelector(".formcollection").hidden = !thegrouping.parentNode.querySelector(".formcollection").hidden;
	let collapser = thegrouping.parentNode.querySelector(".collapser");
	collapser.hidden = !collapser.hidden;
	let expander = thegrouping.parentNode.querySelector(".expander");
	expander.hidden = !expander.hidden;
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

function update_backsight_station_menu(occupiedstationmenu) {
	let options = occupiedstationmenu.innerHTML.split("\n");
	let newoptions = Array();
	options.forEach((option) => {
		if (option.indexOf('value="' + occupiedstationmenu.value + '"') === -1) {
			newoptions.push(option);
		}
	});
	document.getElementById("startNewSessionFormBacksightStationMenu").innerHTML = newoptions.join("\n");
}

async function update_dependent_station_menu(thesite, themenu) {
	let target = document.getElementById(themenu);
	if (thesite.value === "") {
		target.innerHTML = "";
	} else {
		let response = await fetch("/station/" + thesite.value);
		let json = await response.json();
		target.innerHTML = Mustache.render(menu_template('stations'), json);
	}
}

async function update_dependent_subclass_menu(theclass, themenu) {
	let target = document.getElementById(themenu);
	if (theclass.value === "") {
		target.innerHTML = "";
	} else {
		let response = await fetch("/subclass/" + theclass.value);
		let json = await response.json();
		target.innerHTML = Mustache.render(menu_template('subclasses'), json);
	}
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

function update_required_new_session_fields(sessiontypemenu) {
	switch (sessiontypemenu.value) {
		case "Backsight":
			_show_required_field("startNewSessionFormBacksightStationMenu");
			_show_required_field("startNewSessionFormPrismHeight");
			_hide_required_field("startNewSessionFormInstrumentHeight");
			_hide_required_field("startNewSessionFormAzimuth");
			break;
		case "Azimuth":
			_hide_required_field("startNewSessionFormBacksightStationMenu");
			_hide_required_field("startNewSessionFormPrismHeight");
			_show_required_field("startNewSessionFormInstrumentHeight");
			_show_required_field("startNewSessionFormAzimuth");
			break;
		default:
			_hide_required_field("startNewSessionFormBacksightStationMenu");
			_hide_required_field("startNewSessionFormPrismHeight");
			_hide_required_field("startNewSessionFormInstrumentHeight");
			_hide_required_field("startNewSessionFormAzimuth");
	}
}

function update_required_new_site_fields(coordinatesystemmenu) {
	switch (coordinatesystemmenu.value) {
		case "Site":
			_show_required_field("saveNewStationNorthing");
			_show_required_field("saveNewStationEasting");
			_show_required_field("saveNewStationElevation");
			_hide_required_field("saveNewStationUTMZone");
			_hide_required_field("saveNewStationLatitude");
			_hide_required_field("saveNewStationLongitude");
			break;
		case "UTM":
			_show_required_field("saveNewStationNorthing");
			_show_required_field("saveNewStationEasting");
			_show_required_field("saveNewStationElevation");
			_show_required_field("saveNewStationUTMZone");
			_hide_required_field("saveNewStationLatitude");
			_hide_required_field("saveNewStationLongitude");
			break;
		case "Lat/Lon":
			_hide_required_field("saveNewStationNorthing");
			_hide_required_field("saveNewStationEasting");
			_hide_required_field("saveNewStationUTMZone");
			_show_required_field("saveNewStationLatitude");
			_show_required_field("saveNewStationLongitude");
			_show_required_field("saveNewStationElevation");
			break;
		default:
			_hide_required_field("saveNewStationNorthing");
			_hide_required_field("saveNewStationEasting");
			_hide_required_field("saveNewStationElevation");
			_hide_required_field("saveNewStationUTMZone");
			_hide_required_field("saveNewStationLatitude");
			_hide_required_field("saveNewStationLongitude");
	}
}


// Mustache templates

function menu_template(theoptions) {
	template = '' +
		'<option></option>\n' +
		'{{#' + theoptions + '}}' +
		'<option value="{{id}}" description="{{description}}">{{name}}</option>\n' +
		'{{/' + theoptions + '}}';
	return template
}

function output_template() {
	template = '' +
		'{{#errors}}' +
		'<b style="color: red;"> ERROR:</b> {{.}} <br>\n' +
		'{{/errors}}' +
		'{{#result}}' +
		'{{.}}<br>\n' +
		'{{/result}}';
	return template
}
