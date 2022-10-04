// Data getters

async function download_database() {
	document.getElementById("databaseDownloadTrigger").click();
}

async function export_session_data() {
	let sessions_id = document.getElementById("exportSessionDataFormSessionsMenu").value;
	let thetrigger = document.getElementById("sessionDataExportTrigger");
	thetrigger.setAttribute("href", "/export/" + sessions_id);
	thetrigger.click();
}

async function load_atmospheric_conditions() {
	let template = "Atmosphere: {{temperature}}°C, {{pressure}}mmHg";
	let response = await fetch("/atmosphere/");
	let json = await response.json();
	document.getElementById("atmosphericConditions").innerHTML = Mustache.render(template, json);
}

async function load_classes_menus() {
	let response = await fetch("/class/");
	let json = await response.json();
	Array.from(document.querySelectorAll('.classesmenu')).forEach(function (target) {
		target.innerHTML = Mustache.render(menu_template('classes'), json);
	});
}

async function load_configs_menus() {
	let response = await fetch("/configs/");
	let json = await response.json();
	let menutemplate = '{{#.}}<option value="{{.}}">{{.}}</option>\n{{/.}}';
	document.getElementById("setConfigsFormPortMenu").innerHTML = Mustache.render(menutemplate, json.options.ports);
	document.getElementById("setConfigsFormPortMenu").value = json.current.port;
	toggle_total_station_menus(json.current.port);
	document.getElementById("setConfigsFormMakeMenu").innerHTML = Mustache.render(menutemplate, Object.keys(json.options.total_stations));
	document.getElementById("setConfigsFormMakeMenu").value = json.current.make;
	document.getElementById("setConfigsFormModelMenu").innerHTML = Mustache.render(menutemplate, json.options.total_stations[json.current.make]);
	document.getElementById("setConfigsFormModelMenu").value = json.current.model;
	document.getElementById("setConfigsFormLimit").value = json.current.limit;
}

async function load_current_grouping_info() {
	let template = "<b>Current Grouping:</b><br>{{label}} ({{geometries_name}})"
	let response = await fetch("/grouping/");
	let json = await response.json();
	if (json.result === "" || json.label === null) {
		document.getElementById("currentGroupingInfo").innerHTML = "<b>Current Grouping:</b><br><i>(no current grouping)</i>";
		document.getElementById("currentGroupingDetails").removeAttribute("onClick");
		document.getElementById("takeShotFormButton").disabled = true;
	} else {
		document.getElementById("currentGroupingInfo").innerHTML = Mustache.render(template, json);
		document.getElementById("currentGroupingLabel").innerText = json.label;
		document.getElementById("currentGroupingGeometry").innerText = json.geometries_name;
		document.getElementById("currentGroupingClass").innerText = json.classes_name;
		document.getElementById("currentGroupingSubclass").innerText = json.subclasses_name;
		document.getElementById("currentGroupingDescription").innerText = json.description;
		document.getElementById("currentGroupingNumberOfShots").innerText = json.num_shots;
		document.getElementById("currentGroupingDetails").setAttribute("onClick", "show_current_grouping_details();");
		document.getElementById("takeShotFormButton").disabled = false;
	}
}

async function load_current_session_info() {
	let template = "<b>Current Session:</b><br>{{label}} (started {{started}})"
	let details = null;
	let response = await fetch("/session/");
	let json = await response.json();
	if (json.result === "" || json.label === null) {
		document.getElementById("currentSessionInfo").innerHTML = "<b>Current Session:</b><br><i>(no current session)</i>";
		document.getElementById("currentSessionDetails").removeAttribute("onClick");
		document.getElementById("startNewGroupingForm").hidden = true;
		document.getElementById("takeShotForm").hidden = true;
	} else {
		document.getElementById("currentSessionInfo").innerHTML = Mustache.render(template, json);
		document.getElementById("currentSessionLabel").innerText = json.label;
		document.getElementById("currentSessionStarted").innerText = json.started;
		document.getElementById("currentSessionSite").innerText = json.sites_name;
		document.getElementById("currentSessionOccupiedPoint").innerText = json.stations_name;
		document.getElementById("currentSessionInstrumentHeight").innerText = json.instrumentheight;
		document.getElementById("currentSessionDetails").setAttribute("onClick", "show_current_session_details();");
		document.getElementById("startNewGroupingForm").hidden = false;
		document.getElementById("takeShotForm").hidden = false;
	}
}

async function load_date_and_time() {
	let now = new Date();
	document.getElementById("dateAndTime").innerHTML = now.toString();
	setTimeout(load_date_and_time, 1000);
}

async function load_geometries_menus() {
	let response = await fetch("/geometry/");
	let json = await response.json();
	Array.from(document.querySelectorAll('.geometriesmenu')).forEach(function (target) {
		target.innerHTML = Mustache.render(menu_template('geometries'), json);
	});
}

async function load_prism_offsets() {
	let template = "Prism Offsets: {{.}}";
	let response = await fetch("/prism/");
	let json = await response.json();
	if (Object.keys(json).length === 0) {
		document.getElementById("prismOffsets").innerHTML = "Prism Offsets: <i>(offsets are 0 in all directions)</i>";
	} else {
		document.getElementById("prismOffsets").innerHTML = Mustache.render(template, json);
	}
}

async function load_setup_errors() {
	let template = '' +
		'{{#setup_errors}}' +
		'<b style="color: red;">ERROR:</b> {{.}}' +
		'{{/setup_errors}}';
	let response = await fetch("/setuperrors/");
	let json = await response.json();
	document.getElementById("outputBox").innerHTML = Mustache.render(template, json);
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
	let response = await fetch(
		theurl, {
		method: themethod,
		body: new FormData(theform)
	});
	let json = await response.json();
	document.getElementById("outputBox").innerHTML = Mustache.render(output_template(), json);
	return response.status;
}

async function delete_class() {
	let classname = document.getElementById("deleteClassFormClassesMenu");
	if (confirm("Delete class “" + classname.options[classname.selectedIndex].text + "?”")) {
		let status = await _update_data_via_api("/class/", "DELETE", deleteClassForm)
		if (status >= 200 && status <= 299) {
			document.getElementById("deleteClassForm").reset();
			toggle_button(document.getElementById("deleteClassForm").children[0]);
			document.getElementById("deleteClassFormClassDescription").removeAttribute("onclick");
			load_classes_menus();
		}
	}
}

async function delete_site() {
	let sitename = document.getElementById("deleteSiteFormSitesMenu");
	if (confirm("Delete site “" + sitename.options[sitename.selectedIndex].text + "?”")) {
		let status = await _update_data_via_api("/site/", "DELETE", deleteSiteForm)
		if (status >= 200 && status <= 299) {
			document.getElementById("deleteSiteForm").reset();
			toggle_button(document.getElementById("deleteSiteForm").children[0]);
			load_sites_menus();
			document.getElementById("deleteSiteFormSiteDescription").removeAttribute("onclick");
		}
	}
}

async function delete_session() {
	let sessionlabel = document.getElementById("deleteSessionFormSessionsMenu");
	if (confirm("Delete session “" + sessionlabel.options[sessionlabel.selectedIndex].text + ",” including all its shots and groupings?\n\nThis cannot be undone, so download any important data before proceeding.")) {
		let status = await _update_data_via_api("/session/", "DELETE", deleteSessionForm)
		if (status >= 200 && status <= 299) {
			document.getElementById("deleteSessionForm").reset();
			toggle_button(document.getElementById("deleteSessionForm").children[0]);
			let sessions = await fetch("/sessions/");
			let json = await sessions.json();
			document.getElementById("deleteSessionFormSessionsMenu").innerHTML = Mustache.render(menu_template('sessions'), json);
			document.getElementById("deleteSessionFormSessionDescription").removeAttribute("onclick");
		}
	}
}

async function delete_station() {
	let stationname = document.getElementById("deleteStationFormStationsMenu");
	if (confirm("Delete station “" + stationname.options[stationname.selectedIndex].text + "?”")) {
		let status = await _update_data_via_api("/station/", "DELETE", deleteStationForm)
		if (status >= 200 && status <= 299) {
			document.getElementById("deleteStationForm").reset();
			toggle_button(document.getElementById("deleteStationForm").children[0]);
			document.getElementById("deleteStationFormSiteDescription").removeAttribute("onclick");
			document.getElementById("deleteStationFormStationsMenu").innerHTML = "";
			document.getElementById("deleteStationFormStationDescription").removeAttribute("onclick");
		}
	}
}

async function delete_subclass() {
	let subclassname = document.getElementById("deleteSubclassFormSubclassesMenu");
	if (confirm("Delete subclass “" + subclassname.options[subclassname.selectedIndex].text + "?”")) {
		let status = await _update_data_via_api("/subclass/", "DELETE", deleteSubclassForm)
		if (status >= 200 && status <= 299) {
			document.getElementById("deleteSubclassForm").reset();
			toggle_button(document.getElementById("deleteSubclassForm").children[0]);
			document.getElementById("deleteSubclassFormClassDescription").removeAttribute("onclick");
			document.getElementById("deleteSubclassFormSubclassesMenu").innerHTML = "";
			document.getElementById("deleteSubclassFormSubclassDescription").removeAttribute("onclick");
		}
	}
}

async function save_new_class() {
	let status = await _update_data_via_api("/class/", "POST", saveNewClassForm);
	if (status >= 200 && status <= 299) {
		document.getElementById("saveNewClassForm").reset();
		toggle_button(document.getElementById("saveNewClassForm").children[0]);
		load_classes_menus();
	}
}

async function save_new_site() {
	let status = await _update_data_via_api("/site/", "POST", saveNewSiteForm);
	if (status >= 200 && status <= 299) {
		document.getElementById("saveNewSiteForm").reset();
		toggle_button(document.getElementById("saveNewSiteForm").children[0]);
		load_sites_menus();
	}
}

async function save_new_station() {
	let status = await _update_data_via_api("/station/", "POST", saveNewStationForm);
	if (status >= 200 && status <= 299) {
		document.getElementById("saveNewStationForm").reset();
		toggle_button(document.getElementById("saveNewStationForm").children[0]);
		document.getElementById("saveNewStationFormSiteDescription").removeAttribute("onclick");
	}
}

async function save_new_subclass() {
	let status = await _update_data_via_api("/subclass/", "POST", saveNewSubclassForm);
	if (status >= 200 && status <= 299) {
		document.getElementById("saveNewSubclassForm").reset();
		toggle_button(document.getElementById("saveNewSubclassForm").children[0]);
		document.getElementById("saveNewSubclassFormClassDescription").removeAttribute("onclick");
	}
}

async function set_atmospheric_conditions() {
	await _update_data_via_api("/atmosphere/", "PUT", setAtmosphericConditionsForm);
	load_atmospheric_conditions();
}

async function set_configs() {
	let status = await _update_data_via_api("/configs/", "PUT", setConfigsForm);
}

async function set_prism_offsets() {
	await _update_data_via_api("/prism/", "PUT", setPrismOffsetsForm);
	load_prism_offsets();
}

async function start_new_grouping() {
	let status = await _update_data_via_api("/grouping/", "POST", startNewGroupingForm);
	if (status >= 200 && status <= 299) {
		document.getElementById("startNewGroupingForm").reset();
		document.getElementById("startNewGroupingFormGeometryDescription").removeAttribute("onclick");
		document.getElementById("startNewGroupingFormClassDescription").removeAttribute("onclick");
		document.getElementById("startNewGroupingFormSubclassesMenu").innerHTML = "";
		document.getElementById("startNewGroupingFormSubclassDescription").removeAttribute("onclick");
		document.getElementById("saveLastShotFormLabel").value = "";
		document.getElementById("saveLastShotFormComment").value = "";
		load_current_grouping_info();
	}
}

async function start_new_session() {
	if (confirm("Please verify that the date, time, and atmospheric conditions are set correctly.\n\nPress “Ok” to proceed or “Cancel” to go back.") === true) {
		document.getElementById("startNewSessionFormIndicator").hidden = false;
		let status = await _update_data_via_api("/session/", "POST", startNewSessionForm);
		if (status >= 200 && status <= 299) {
			document.getElementById("startNewSessionForm").reset();
			document.getElementById("startNewSessionFormSiteDescription").removeAttribute("onclick");
			document.getElementById("startNewSessionFormOccupiedPointMenu").innerHTML = "";
			document.getElementById("startNewSessionFormOccupiedPointDescription").removeAttribute("onclick");
			document.getElementById("startNewSessionFormBacksightStationMenu").innerHTML = "";
			document.getElementById("startNewSessionFormBacksightStationDescription").removeAttribute("onclick");
			update_required_new_session_fields(document.getElementById("startNewSessionFormSessionTypeMenu"));
			document.getElementById("startNewSessionFormButton").disabled = true;
			load_current_session_info();
			load_current_grouping_info();
		}
		document.getElementById("startNewSessionFormIndicator").hidden = true;
		load_prism_offsets();
	}
}

// Shot Handling

async function take_shot() {
	let template = '' +
		'{{#errors}}' +
		'<b style="color: red; ">ERROR:</b> {{.}}<br>' +
		'{{/errors}}' +
		'{{#result}}' +
		'<table class="shotdata">' +
		'<tr><td>delta_n = {{delta_n}}</td><td>calculated_n = {{calculated_n}}</td></tr>' +
		'<tr><td>delta_e = {{delta_e}}</td><td>calculated_e = {{calculated_e}}</td></tr>' +
		'<tr><td>delta_z = {{delta_z}}</td><td>calculated_z = {{calculated_z}}</td></tr>' +
		'</table>' +
		'{{/result}}';
	if (document.getElementById("currentGroupingGeometry").innerText === "Isolated Point") {
		// This is an isolated point, so it will always take the label of its grouping.
		document.getElementById("saveLastShotFormLabel").value = document.getElementById("currentGroupingLabel").innerText;
		document.getElementById("saveLastShotFormLabel").disabled = true;
	} else {
		document.getElementById("saveLastShotFormLabel").disabled = false;
	}
	show_and_hide_shot_forms("take");
	document.getElementById("outputBox").innerHTML = "";
	let response = await fetch("/shot/");
	let json = await response.json();
	if (response.status >= 200 && response.status <= 299) {
		if (json.result === "Measurement canceled by user.") {
			template = output_template();
			show_and_hide_shot_forms("cancel");
		} else {
			show_and_hide_shot_forms("save");
		}
	}
	document.getElementById("outputBox").innerHTML = Mustache.render(template, json);
}

async function cancel_shot() {
	show_and_hide_shot_forms("cancel");
	await fetch("/cancel/");
}

async function save_last_shot() {
	show_and_hide_shot_forms("cancel");
	document.getElementById("outputBox").innerHTML = "";
	document.getElementById("saveLastShotFormLabel").disabled = false;
	await _update_data_via_api("/shot/", "POST", saveLastShotForm);
	load_current_grouping_info();
}

function discard_last_shot() {
	if (confirm("Discard this shot without saving?")) {
		show_and_hide_shot_forms("cancel");
		document.getElementById("outputBox").innerHTML = "Last shot discarded.";
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

function collapse(theelement) {
	theelement.parentNode.querySelector(".collapsible").hidden = !theelement.parentNode.querySelector(".collapsible").hidden;
	let collapser = theelement.parentNode.querySelector(".collapser");
	collapser.hidden = !collapser.hidden;
	let expander = theelement.parentNode.querySelector(".expander");
	expander.hidden = !expander.hidden;
}

function details_popup(details) {
	details = details.replaceAll("||", "\n");
	details = details.replaceAll(null, "");
	alert(details);
}

function handle_survey_station_subclass(themenu) {
	if (themenu.value === "1" && document.getElementById("startNewGroupingFormGeometriesMenu").value != "1") {
		document.getElementById("startNewGroupingFormGeometriesMenu").value = "1";
		alert("The geometry for this survey station will be changed to “Isolated Point.”");
	}
}

async function os_check() {
	let oscheck = await fetch("/raspbian/");
	let raspbian = await oscheck.text();
	if (raspbian === "true") {
		document.getElementById("setClockForm").hidden = false;
		document.getElementById("shutDownForm").hidden = false;
		// Warn the user if the Raspberry Pi clock time and browser time are off by greater than 10 minutes
		let clockcheck = await fetch("/raspbian/clock/");
		let rpiclock = await clockcheck.text();
		rpiclock = new Date(rpiclock.replace(/\"/g, ""));
		let jsclock = new Date();
		if (Math.abs(rpiclock - jsclock) > 600000) {
			alert("The Raspberry Pi’s clock is set to " + rpiclock + ". Please use the ShootPoints utilities (gears) menu to update the hardware clock on the Raspberry Pi before continuing.");
		};
	};
}

function show_and_hide_shot_forms(theaction) {
	switch (theaction) {
		case "take":
			document.getElementById("takeShotForm").hidden = true;
			document.getElementById("cancelShotForm").hidden = false;
			document.getElementById("saveLastShotForm").hidden = true;
			break;
		case "cancel":
			document.getElementById("takeShotForm").hidden = false;
			document.getElementById("cancelShotForm").hidden = true;
			document.getElementById("saveLastShotForm").hidden = true;
			break;
		case "save":
			document.getElementById("takeShotForm").hidden = true;
			document.getElementById("cancelShotForm").hidden = true;
			document.getElementById("saveLastShotForm").hidden = false;
			break;
	}
}

function show_current_grouping_details() {
	let details = "Class: " + document.getElementById("currentGroupingClass").innerText +
		"\nSubclass: " + document.getElementById("currentGroupingSubclass").innerText +
		"\nDescription: " + document.getElementById("currentGroupingDescription").innerText +
		"\nNumber of Shots in Grouping: " + document.getElementById("currentGroupingNumberOfShots").innerText;
	alert(details);
}

function show_current_session_details() {
	let details = "Site: " + document.getElementById("currentSessionSite").innerText +
		"\nOccupied Point: " + document.getElementById("currentSessionOccupiedPoint").innerText +
		"\nInstrument Height: " + document.getElementById("currentSessionInstrumentHeight").innerText + "m";
	alert(details);
}

async function show_on_the_fly_adjustments_popup() {
	document.getElementById("utilitiesPopup").hidden = true;
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

async function show_utilities_popup() {
	document.getElementById("onTheFlyAdjustmentsPopup").hidden = true;
	let sessions = await fetch("/sessions/");
	let json = await sessions.json();
	document.getElementById("exportSessionDataFormSessionsMenu").innerHTML = Mustache.render(menu_template('sessions'), json);
	document.getElementById("deleteSessionFormSessionsMenu").innerHTML = Mustache.render(menu_template('sessions'), json);
	let thepopup = document.getElementById("utilitiesPopup");
	thepopup.hidden = false;
}

function toggle_button(thetrigger) {
	let allfieldsarevalid = true;
	thetrigger.parentNode.childNodes.forEach(element => {
		if (element.required) {
			allfieldsarevalid *= element.validity.valid;
		}
	});
	thetrigger.parentNode.querySelector("input[type=button]").disabled = !allfieldsarevalid;
}

function toggle_total_station_menus(theport) {
	if (theport === "demo") {
		document.getElementById("setConfigsFormMakeMenu").disabled = true;
		document.getElementById("setConfigsFormModelMenu").disabled = true;
	} else {
		document.getElementById("setConfigsFormMakeMenu").disabled = false;
		document.getElementById("setConfigsFormModelMenu").disabled = false;
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

async function update_dependent_model_menu(themake) {
	let response = await fetch("/configs/");
	let json = await response.json();
	let menutemplate = '{{#.}}<option value="{{.}}">{{.}}</option>\n{{/.}}';
	document.getElementById("setConfigsFormModelMenu").innerHTML = Mustache.render(menutemplate, json.options.total_stations[themake]);
	document.getElementById("setConfigsFormModelMenu").value = json.options.total_stations[themake];
}

async function update_dependent_station_menu(thesite, themenu) {
	let target = document.getElementById(themenu);
	let targetdescription = target.id.replace(/e?sMenu/, "Description");
	if (thesite.value === "") {
		target.innerHTML = "";
		document.getElementById(targetdescription).removeAttribute("onclick");
	} else {
		let response = await fetch("/station/" + thesite.value);
		let json = await response.json();
		target.innerHTML = Mustache.render(menu_template('stations'), json);
		if (json.stations.length === 0) {
			document.getElementById(targetdescription).removeAttribute("onclick");
		}
	}
}

async function update_dependent_subclass_menu(theclass, themenu) {
	let target = document.getElementById(themenu);
	let targetdescription = target.id.replace(/e?sMenu/, "Description");
	if (theclass.value === "") {
		target.innerHTML = "";
		document.getElementById(targetdescription).removeAttribute("onclick");
	} else {
		let response = await fetch("/subclass/" + theclass.value);
		let json = await response.json();
		target.innerHTML = Mustache.render(menu_template('subclasses'), json);
		if (json.subclasses.length === 0) {
			document.getElementById(targetdescription).removeAttribute("onclick");
		}
	}
}

function update_description(source, target) {
	let thedescription = source.options[source.selectedIndex].getAttribute("description");
	if (thedescription === null) {
		document.getElementById(target).removeAttribute("onclick");
	} else {
		if (thedescription === "") {
			thedescription = "(no description recorded)"
		} else {
			thedescription = thedescription.replaceAll("\\", "\\\\");
			thedescription = thedescription.replaceAll("\'", "\\\'");
			thedescription = thedescription.replaceAll("\"", "\\\"");
		}
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
	let template = ''
	if (theoptions === "stations") {
		template += '<option></option>\n' +
			'{{#' + theoptions + '}}' +
			'<option value="{{id}}" description="{{description}} ({{northing}}N, {{easting}}E, {{elevation}}Z)">{{name}}</option>\n' +
			'{{/' + theoptions + '}}';
	} else {
		template += '<option></option>\n' +
			'{{#' + theoptions + '}}' +
			'<option value="{{id}}" description="{{description}}">{{name}}</option>\n' +
			'{{/' + theoptions + '}}';
	}
	return template
}

function output_template() {
	let template = '' +
		'{{#errors}}' +
		'<b style="color: red;"> ERROR:</b> {{.}} <br>\n' +
		'{{/errors}}' +
		'{{#result}}' +
		'{{.}}<br>\n' +
		'{{/result}}';
	return template
}


// Live Map Manipulation

function show_livemap_popup() {
	document.getElementById("liveMapPopup").hidden = false;
	event.stopPropagation();
}

function livemap_save_survey_point_symbol() {
	document.getElementById("savedSurveyPointSymbol").innerHTML = document.getElementById("surveyPointSymbol").innerHTML;
}

function livemap_recenter() {
	livemap_rescale_map_elements(0);
	let liveMap = document.getElementById("liveMap");
	let firstSurveyStation = liveMap.getElementsByClassName("surveyStation")[0];
	let stationCoordinates = firstSurveyStation.getAttribute("points").split(",");
	stationCoordinates[0] = Number(stationCoordinates[0]) - 100;
	stationCoordinates[1] = Number(stationCoordinates[1]) - 100;
	liveMap.setAttribute("viewBox", stationCoordinates.join(" ") + " 200 200");
}

function livemap_get_current_viewBox() {
	let liveMap = document.getElementById("liveMap");
	let currentViewBox = liveMap.getAttribute("viewBox").split(" ");
	currentViewBox = Array(
		Number(currentViewBox[0]),
		Number(currentViewBox[1]),
		Number(currentViewBox[2]),
		Number(currentViewBox[3])
	);
	return currentViewBox;
}

function livemap_rescale_map_elements(multiplier) {
	let theSurveyData = document.querySelector("#liveMap").querySelectorAll(".surveyData");
	let theUnsavedShot = document.querySelector("#liveMap").querySelector("#unsavedShot");
	if (multiplier == 0) {
		// reset the elements to their default sizes
		for (var i = 0; i < theSurveyData.length; i++) {
			theSurveyData[i].style.strokeWidth = "2px";
		};
		theUnsavedShot.setAttribute("r", "2.5px");
	} else {
		// rescale the elements
		let currentStrokeWidth = theSurveyData[0].style.strokeWidth.split("px");
		for (var i = 0; i < theSurveyData.length; i++) {
			theSurveyData[i].style.strokeWidth = Number(currentStrokeWidth[0] * multiplier) + "px";
		};
		let currentCircleRadius = theUnsavedShot.getAttribute("r").split("px");
		theUnsavedShot.setAttribute("r", Number(currentCircleRadius[0] * multiplier) + "px");
	};
}

function livemap_zoom_in() {
	livemap_rescale_map_elements(0.5);
	let currentViewBox = livemap_get_current_viewBox();
	let newViewBox = Array(
		currentViewBox[0] + (currentViewBox[2] / 4),
		currentViewBox[1] + (currentViewBox[3] / 4),
		currentViewBox[2] / 2,
		currentViewBox[3] / 2
	).join(" ");
	document.getElementById("liveMap").setAttribute("viewBox", newViewBox);
}

function livemap_zoom_out() {
	livemap_rescale_map_elements(2);
	let currentViewBox = livemap_get_current_viewBox();
	let newViewBox = Array(
		currentViewBox[0] - (currentViewBox[2] / 2),
		currentViewBox[1] - (currentViewBox[3] / 2),
		currentViewBox[2] * 2,
		currentViewBox[3] * 2
	).join(" ");
	document.getElementById("liveMap").setAttribute("viewBox", newViewBox);
}

function livemap_pan(direction) {
	let currentViewBox = livemap_get_current_viewBox();
	switch (direction) {
		case "N":
			currentViewBox[1] = currentViewBox[1] - (currentViewBox[3] / 4);
			break;
		case "S":
			currentViewBox[1] = currentViewBox[1] + (currentViewBox[3] / 4);
			break;
		case "E":
			currentViewBox[0] = currentViewBox[0] + (currentViewBox[2] / 4);
			break;
		case "W":
			currentViewBox[0] = currentViewBox[0] - (currentViewBox[2] / 4);
			break;
	};
	document.getElementById("liveMap").setAttribute("viewBox", currentViewBox.join(" "));
}

function livemap_hide_points() {
	livemap_save_survey_point_symbol();
	document.getElementById("surveyPointSymbol").innerHTML = ""
}

function livemap_show_points() {
	document.getElementById("surveyPointSymbol").innerHTML = document.getElementById("savedSurveyPointSymbol").innerHTML;
}


// Raspberry Pi Hardware Interfaces

async function set_rpi_clock() {
	if (confirm("This will set the Raspberry Pi’s clock to the date and time displayed in the browser. If that is incorrect or you need to change the timezone, please do so through the command line instead.")) {
		let now = new Date();
		document.getElementById("setClockFormDateTimeString").value = now.toString();
		_update_data_via_api("/raspbian/clock/", "PUT", setClockForm);
	}
}


function shut_rpi_down() {
	if (confirm("Press “Ok” to safely shut down the Raspberry Pi.")) {
		fetch("/raspbian/shutdown/");
		document.getElementById("shutDownFormIndicator").hidden = false;
		setTimeout(function () {
			document.getElementById("utilitiesPopup").hidden = true;
			confirm("Shutdown complete. You can now unplug the Raspberry Pi.");
		}, 10000);
	}
}
