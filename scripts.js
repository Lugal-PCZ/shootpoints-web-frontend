// Data getters

async function download_database() {
	document.getElementById("databaseDownloadTrigger").click();
}

async function export_session_data() {
	let sessions_id = document.getElementById("exportSessionDataFormSessionsMenu").value;
	let thetrigger = document.getElementById("sessionDataExportTrigger");
	thetrigger.setAttribute("href", "/export/" + sessions_id);
	thetrigger.click();
	document.getElementById("exportSessionDataForm").reset();
	document.getElementById("exportSessionDataFormButton").disabled = true;
	document.getElementById("exportSessionDataFormSessionDescription").hidden = true;
}

async function load_atmospheric_conditions() {
	let response = await fetch("/atmosphere/");
	let json = await response.json();
	document.getElementById("atmosphericConditions").innerHTML = `Atmosphere: ${json.temperature}°C, ${json.pressure}mmHg`;
}

async function load_classes_menus() {
	let response = await fetch("/class/");
	let json = await response.json();
	let classesmenu = ["<option></option>"];
	json.classes.forEach(function (theclass) {
		classesmenu.push(`<option value="${theclass.id}" description="${theclass.description}">${theclass.name}</option>`);
	});
	Array.from(document.querySelectorAll('.classesmenu')).forEach(function (target) {
		target.innerHTML = classesmenu.join("\n");
	});
}

async function load_configs_menus() {
	let response = await fetch("/configs/");
	let json = await response.json();
	let portsmenu = [];
	json.options.ports.forEach(function (theport) {
		portsmenu.push(`<option value="${theport}">${theport}</option>`);
	});
	document.getElementById("setConfigsFormPortMenu").innerHTML = portsmenu.join("\n");
	document.getElementById("setConfigsFormPortMenu").value = json.current.port;
	if (json.current.port === "demo") {
		document.getElementById("setConfigsFormMakeMenu").disabled = true;
		document.getElementById("setConfigsFormModelMenu").disabled = true;
	} else {
		document.getElementById("setConfigsFormMakeMenu").disabled = false;
		document.getElementById("setConfigsFormModelMenu").disabled = false;
	};
	let makesmenu = [];
	Object.keys(json.options.total_stations).forEach(function (themake) {
		makesmenu.push(`<option value="${themake}">${themake}</option>`);
	});
	document.getElementById("setConfigsFormMakeMenu").innerHTML = makesmenu.join("\n");
	document.getElementById("setConfigsFormMakeMenu").value = json.current.make;
	update_dependent_model_menu(json.options.total_stations[json.current.make]);
	document.getElementById("setConfigsFormModelMenu").value = json.current.model;
	document.getElementById("setConfigsFormLimit").value = json.current.limit;
}

async function load_current_grouping_info() {
	let response = await fetch("/grouping/");
	let json = await response.json();
	if (json.result === "" || json.label === null) {
		document.getElementById("currentGroupingInfo").innerHTML = "<i>(no current grouping)</i>";
		document.getElementById("currentGroupingDetails").hidden = true;
		document.getElementById("groupingFormEndCurrentGroupingButton").disabled = true;
		document.getElementById("takeShotFormButton").disabled = true;
	} else {
		document.getElementById("currentGroupingInfo").innerHTML = `${json.label} (${json.geometries_name})`;
		document.getElementById("currentGroupingLabel").innerText = json.label;
		document.getElementById("currentGroupingGeometry").innerText = json.geometries_name;
		document.getElementById("currentGroupingClass").innerText = json.classes_name;
		document.getElementById("currentGroupingSubclass").innerText = json.subclasses_name;
		document.getElementById("currentGroupingDescription").innerText = json.description;
		document.getElementById("currentGroupingNumberOfShots").innerText = json.num_shots;
		document.getElementById("currentGroupingDetails").setAttribute("onClick", "show_current_grouping_details();");
		document.getElementById("currentGroupingDetails").hidden = false;
		document.getElementById("groupingFormEndCurrentGroupingButton").disabled = false;
		document.getElementById("takeShotFormButton").disabled = false;
	}
}

async function load_current_session_info() {
	let response = await fetch("/session/");
	let json = await response.json();
	if (json.result === "" || json.label === null) {
		document.getElementById("currentSessionInfo").innerHTML = "<i>(no current session)</i>";
		document.getElementById("currentSessionDetails").hidden = true;
		document.getElementById("sessionFormEndCurrentSessionButton").disabled = true;
		document.getElementById("groupingForm").hidden = true;
		document.getElementById("takeShotForm").hidden = true;
	} else {
		document.getElementById("currentSessionInfo").innerHTML = `${json.label}`;
		document.getElementById("currentSessionLabel").innerText = json.label;
		document.getElementById("currentSessionStarted").innerText = json.started;
		document.getElementById("currentSessionSite").innerText = json.sites_name;
		document.getElementById("currentSessionOccupiedPoint").innerText = json.stations_name;
		document.getElementById("currentSessionInstrumentHeight").innerText = json.instrumentheight;
		document.getElementById("currentSessionDetails").setAttribute("onClick", "show_current_session_details();");
		document.getElementById("currentSessionDetails").hidden = false;
		document.getElementById("sessionFormEndCurrentSessionButton").disabled = false;
		document.getElementById("groupingForm").hidden = false;
		document.getElementById("takeShotForm").hidden = false;
	}
}

async function load_date_and_time() {
	let now = new Date();
	document.getElementById("dateAndTime").innerHTML = now.toString();
	setTimeout(load_date_and_time, 1000);
}

async function load_geometries_menu() {
	let response = await fetch("/geometry/");
	let json = await response.json();
	let geometriesmenu = ["<option></option>"];
	json.geometries.forEach(function (thegeometry) {
		geometriesmenu.push(`<option value="${thegeometry.id}" description="${thegeometry.description}">${thegeometry.name}</option>`);
	});
	document.getElementById("groupingFormGeometriesMenu").innerHTML = geometriesmenu.join("\n");
}

async function load_prism_offsets() {
	let response = await fetch("/prism/");
	let json = await response.json();
	if (Object.keys(json).length === 0) {
		document.getElementById("prismOffsets").innerHTML = "Prism Offsets: <i>(offsets are 0 in all directions)</i>";
	} else {
		document.getElementById("prismOffsets").innerHTML = `Prism Offsets: ${json}`;
	}
}

async function load_setup_errors() {
	let errormessage = [];
	let response = await fetch("/setuperrors/");
	let json = await response.json();
	json.forEach(function (theerror) {
		errormessage.push(`<b style="color: red;">ERROR:</b> ${theerror}`);
	});
	document.getElementById("outputBox").innerHTML = errormessage.join("<br>");
}

async function load_sessions_menus() {
	let sessions = await fetch("/sessions/");
	let json = await sessions.json();
	let sessionsmenu = ["<option></option>"];
	json.sessions.forEach(function (thesession) {
		sessionsmenu.push(`<option value="${thesession.id}" description="${thesession.description}">${thesession.name}</option>`)
	});
	document.getElementById("deleteSessionFormSessionsMenu").innerHTML = sessionsmenu.join("\n");
	document.getElementById("deleteSessionFormSessionDescription").hidden = true;
	document.getElementById("exportSessionDataFormSessionsMenu").innerHTML = sessionsmenu.join("\n");
}

async function load_sites_menus() {
	let response = await fetch("/site/");
	let json = await response.json();
	let sitesmenu = ["<option></option>"];
	json.sites.forEach(function (thesite) {
		sitesmenu.push(`<option value="${thesite.id}" description="${thesite.description}">${thesite.name}</option>`);
	});
	Array.from(document.querySelectorAll('.sitesmenu')).forEach(function (target) {
		target.innerHTML = sitesmenu.join("\n");
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
	let theoutput = [];
	if ("errors" in json) {
		json.errors.forEach(function (theerror) {
			theoutput.push(`<b style="color: red;">ERROR:</b> ${theerror}<br>`);
		});
	}
	if ("result" in json) {
		theoutput.push(`${json.result}<br>`);
	}
	document.getElementById("outputBox").innerHTML = theoutput.join("\n");
	return response.status;
}

async function delete_class() {
	let classname = document.getElementById("deleteClassFormClassesMenu");
	if (confirm("Delete class “" + classname.options[classname.selectedIndex].text + "?”")) {
		let status = await _update_data_via_api("/class/", "DELETE", deleteClassForm)
		if (status >= 200 && status <= 299) {
			document.getElementById("deleteClassForm").reset();
			document.getElementById("deleteClassFormClassDescription").hidden = true;
			document.getElementById("deleteClassFormButton").disabled = true;
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
			document.getElementById("deleteSiteFormSiteDescription").hidden = true;
			document.getElementById("deleteSiteFormButton").disabled = true;
			load_sites_menus();
		}
	}
}

async function delete_session() {
	let sessionlabel = document.getElementById("deleteSessionFormSessionsMenu");
	let themessage = "Delete session “" + sessionlabel.options[sessionlabel.selectedIndex].text + ",” including all its shots and groupings?\n\nThis cannot be undone, so download any important data before proceeding.";
	// get the current session and check if it's the one selected
	let currentsession = false
	let response = await fetch("/session/");
	let json = await response.json();
	if (Number(json.id) === Number(sessionlabel.options[sessionlabel.selectedIndex].value)) {
		currentsession = true
		themessage = "Delete the current session, including all its shots and groupings?\n\nThis cannot be undone, so download any important data before proceeding.";
	}
	if (confirm(themessage)) {
		let status = await _update_data_via_api("/session/", "DELETE", deleteSessionForm)
		if (status >= 200 && status <= 299) {
			load_sessions_menus();
			document.getElementById("deleteSessionForm").reset();
			document.getElementById("deleteSessionFormButton").disabled = true;
			if (currentsession === true) {
				end_current_session(prompt = false);
			}
		}
	}
}

async function delete_station() {
	let thestation = document.getElementById("deleteStationFormStationsMenu");
	if (confirm("Delete station “" + thestation.options[thestation.selectedIndex].text + "?”")) {
		let status = await _update_data_via_api("/station/", "DELETE", deleteStationForm)
		if (status >= 200 && status <= 299) {
			update_dependent_station_menu(document.getElementById("deleteStationFormSitesMenu"), "deleteStationFormStationsMenu");
			document.getElementById("deleteStationFormStationDescription").hidden = true;
			document.getElementById("deleteStationFormButton").disabled = true;
		}
	}
}

async function delete_subclass() {
	let thesubclass = document.getElementById("deleteSubclassFormSubclassesMenu");
	if (confirm("Delete subclass “" + thesubclass.options[thesubclass.selectedIndex].text + "?”")) {
		let status = await _update_data_via_api("/subclass/", "DELETE", deleteSubclassForm)
		if (status >= 200 && status <= 299) {
			update_dependent_subclass_menu(document.getElementById("deleteSubclassFormClassesMenu"), "deleteSubclassFormSubclassesMenu");
			document.getElementById("deleteSubclassFormSubclassDescription").hidden = true;
			document.getElementById("deleteSubclassFormButton").disabled = true;
		}
	}
}

async function end_current_grouping() {
	let themessage = "This will end the current grouping.\n\nPress “Ok” to proceed or “Cancel” to go back.";
	if (document.getElementById("outputBox").innerHTML.substring(0, 24) === '<table class="shotdata">') {
		themessage = "This will end the current grouping and discard your unsaved shot.\n\nPress “Ok” to proceed or “Cancel” to go back."
	}
	if (confirm(themessage)) {
		let status = await _update_data_via_api("/grouping/", "PUT", groupingForm);
		if (status >= 200 && status <= 299) {
			document.getElementById("groupingForm").reset();
			document.getElementById("groupingFormGeometryDescription").hidden = true;
			document.getElementById("groupingFormClassDescription").hidden = true;
			document.getElementById("groupingFormSubclassDescription").hidden = true;
			document.getElementById("groupingFormStartGroupingButton").disabled = true;
			document.getElementById("saveLastShotFormComment").value = "";
			show_and_hide_shot_forms("cancel");
			load_current_grouping_info();
		}
	}
}

async function end_current_session(prompt = true) {
	let themessage = "This will end the current session.\n\nPress “Ok” to proceed or “Cancel” to go back.";
	if (document.getElementById("outputBox").innerHTML.substring(0, 24) === '<table class="shotdata">') {
		themessage = "This will end the current session and discard your unsaved shot.\n\nPress “Ok” to proceed or “Cancel” to go back.";
	}
	if (prompt === true) {
		if (!confirm(themessage)) {
			return;
		}
	}
	let status = await _update_data_via_api("/session/", "PUT", sessionForm);
	if (status >= 200 && status <= 299) {
		document.getElementById("sessionForm").reset();
		document.getElementById("sessionFormSiteDescription").hidden = true;
		document.getElementById("sessionFormOccupiedPointDescription").hidden = true;
		document.getElementById("sessionFormBacksightStationDescription").hidden = true;
		update_required_new_session_fields();
		document.getElementById("sessionFormStartSessionButton").disabled = true;
		load_current_session_info();
	}
}

async function save_new_class() {
	let status = await _update_data_via_api("/class/", "POST", saveNewClassForm);
	if (status >= 200 && status <= 299) {
		document.getElementById("saveNewClassForm").reset();
		document.getElementById("saveNewClassFormButton").disabled = true;
		load_classes_menus();
	}
}

async function save_new_site() {
	let status = await _update_data_via_api("/site/", "POST", saveNewSiteForm);
	if (status >= 200 && status <= 299) {
		document.getElementById("saveNewSiteForm").reset();
		document.getElementById("saveNewSiteFormButton").disabled = true;
		load_sites_menus();
	}
}

async function save_new_station() {
	let status = await _update_data_via_api("/station/", "POST", saveNewStationForm);
	if (status >= 200 && status <= 299) {
		document.getElementById("saveNewStationFormStationName").value = "";
		document.getElementById("saveNewStationFormStationDescription").value = "";
		document.getElementById("saveNewStationFormStationNorthing").value = "";
		document.getElementById("saveNewStationFormStationEasting").value = "";
		document.getElementById("saveNewStationFormStationLatitude").value = "";
		document.getElementById("saveNewStationFormStationLongitude").value = "";
		document.getElementById("saveNewStationFormStationElevation").value = "";
		document.getElementById("saveNewStationFormButton").disabled = true;
	}
}

async function save_new_subclass() {
	let status = await _update_data_via_api("/subclass/", "POST", saveNewSubclassForm);
	if (status >= 200 && status <= 299) {
		document.getElementById("saveNewSubclassForm").reset();
		document.getElementById("saveNewSubclassFormClassDescription").hidden = true;
		document.getElementById("saveNewSubclassFormButton").disabled = true;
	}
}

async function set_atmospheric_conditions() {
	await _update_data_via_api("/atmosphere/", "PUT", setAtmosphericConditionsForm);
	document.getElementById("onTheFlyAdjustmentsPopup").hidden = true;
	load_atmospheric_conditions();
}

async function set_configs() {
	let status = await _update_data_via_api("/configs/", "PUT", setConfigsForm);
}

async function set_prism_offsets() {
	await _update_data_via_api("/prism/", "PUT", setPrismOffsetsForm);
	document.getElementById("onTheFlyAdjustmentsPopup").hidden = true;
	load_prism_offsets();
}

async function start_new_grouping() {
	if (document.getElementById("outputBox").innerHTML.substring(0, 24) === '<table class="shotdata">') {
		if (!confirm("You have an unsaved shot. Creating a new grouping now will put it in the new grouping when it’s saved. Do you wish to do this?\n\nPress “Ok” to proceed or “Cancel” to go back.")) {
			return;
		}
	}
	let status = await _update_data_via_api("/grouping/", "POST", groupingForm);
	if (status >= 200 && status <= 299) {
		document.getElementById("groupingForm").reset();
		document.getElementById("groupingFormGeometryDescription").hidden = true;
		document.getElementById("groupingFormClassDescription").hidden = true;
		document.getElementById("groupingFormSubclassDescription").hidden = true;
		document.getElementById("groupingFormStartGroupingButton").disabled = true;
		document.getElementById("saveLastShotForm").reset();
		show_and_hide_shot_forms("cancel");
		load_current_grouping_info();
	}
}

async function start_new_session() {
	if (document.getElementById("outputBox").innerHTML.substring(0, 24) === '<table class="shotdata">') {
		if (!confirm("You have an unsaved shot that will be deleted if you continue.\n\nPress “Ok” to proceed or “Cancel” to go back.")) {
			return;
		}
	}
	if (confirm("Please verify that the date, time, and atmospheric conditions are set correctly.\n\nPress “Ok” to proceed or “Cancel” to go back.") === true) {
		document.getElementById("sessionFormIndicator").hidden = false;
		document.getElementById("sessionFormStartSessionButton").disabled = true;
		document.getElementById("sessionFormEndCurrentSessionButton").disabled = true;
		let status = await _update_data_via_api("/session/", "POST", sessionForm);
		if (status >= 200 && status <= 299) {
			document.getElementById("sessionForm").reset();
			document.getElementById("sessionFormSiteDescription").hidden = true;
			document.getElementById("sessionFormOccupiedPointDescription").hidden = true;
			document.getElementById("sessionFormBacksightStationDescription").hidden = true;
			update_required_new_session_fields();
			document.getElementById("sessionFormStartSessionButton").disabled = true;
			show_and_hide_shot_forms("cancel");
			load_current_session_info();
			load_current_grouping_info();
			collapse(document.getElementById("sessionFormHeader"));
		} else {
			alert("The backsight shot failed. See the output box for details.");
		}
		document.getElementById("sessionFormIndicator").hidden = true;
		document.getElementById("sessionFormStartSessionButton").disabled = false;
		document.getElementById("sessionFormEndCurrentSessionButton").disabled = false;
		load_prism_offsets();
	}
}


// Shot Handling

async function take_shot() {
	show_and_hide_shot_forms("take");
	document.getElementById("outputBox").innerHTML = "";
	let response = await fetch("/shot/");
	let json = await response.json();
	let theoutput = [];
	if ("errors" in json) {
		json.errors.forEach(function (theerror) {
			theoutput.push(`<b style="color: red;">ERROR:</b> ${theerror}<br>`);
		});
	}
	if (response.status >= 200 && response.status <= 299) {
		if (json.result === "Measurement canceled by user.") {
			theoutput.push(json.result);
			show_and_hide_shot_forms("cancel");
		} else {
			if (document.getElementById("takeShotFormStakeoutCheckbox").checked) {
				let themessage = "";
				if (document.getElementById("takeShotFormStakeoutTargetNorthing").value) {
					let n_difference = document.getElementById("takeShotFormStakeoutTargetNorthing").value - json.result.calculated_n;
					let n_direction = "North";
					if (n_difference < 0) {
						n_direction = "South";
					}
					themessage += "Move " + Math.abs(n_difference).toFixed(2) + "m " + n_direction;
				}
				if (document.getElementById("takeShotFormStakeoutTargetEasting").value) {
					if (themessage) {
						themessage += "\n";
					}
					let e_difference = document.getElementById("takeShotFormStakeoutTargetEasting").value - json.result.calculated_e;
					let e_direction = "East";
					if (e_difference < 0) {
						e_direction = "West";
					}
					themessage += "Move " + Math.abs(e_difference).toFixed(2) + "m " + e_direction;
				}
				if (themessage) {
					alert("Distance to target coordinates:\n" + themessage);
				}
			}
			show_and_hide_shot_forms("save");
			if ("result" in json) {
				theoutput.push('<b>Last Shot:</b>');
				theoutput.push('<table class="shotdata">');
				theoutput.push(`<tr><td>delta_n = ${json.result.delta_n}</td><td>calculated_n = ${json.result.calculated_n}</td></tr>`);
				theoutput.push(`<tr><td>delta_e = ${json.result.delta_e}</td><td>calculated_e = ${json.result.calculated_e}</td></tr>`);
				theoutput.push(`<tr><td>delta_z = ${json.result.delta_z}</td><td>calculated_z = ${json.result.calculated_z}</td></tr>`);
				theoutput.push('</table>');
			}
		}
	}
	document.getElementById("outputBox").innerHTML = theoutput.join("\n");
}

async function cancel_shot() {
	show_and_hide_shot_forms("cancel");
	await fetch("/cancel/");
}

async function save_last_shot() {
	show_and_hide_shot_forms("cancel");
	document.getElementById("outputBox").innerHTML = "";
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
	document.getElementById(thefield).required = false;
	document.getElementById(thefield + "Block").hidden = true;
}

function _show_required_field(thefield) {
	document.getElementById(thefield).required = true;
	document.getElementById(thefield + "Block").hidden = false;
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

function handle_special_subclasses() {
	let geometriesmenu = document.getElementById("groupingFormGeometriesMenu");
	if (document.getElementById("groupingFormSubclassesMenu").value === "1") {
		let themessage = "You’ve chosen the “Survey Station” subclass. Provided that it is unique, the next point shot will be automatically added to the list of survey stations for this site.";
		if (geometriesmenu.value != "1") {
			geometriesmenu.value = "1";
			update_description(geometriesmenu, 'groupingFormGeometryDescription');
			themessage += "\n\nMoreover, because a survey station is by definition a single point in space, the geometry for this point has been changed to “Isolated Point.”";
		}
		themessage += "\n\nPlease verify the grouping information before continuing.";
		alert(themessage);
	} else if (document.getElementById("groupingFormSubclassesMenu").value === "5") {
		if (geometriesmenu.value != "1" && geometriesmenu.value != "2") {
			geometriesmenu.value = "1";
			update_description(geometriesmenu, 'groupingFormGeometryDescription');
			alert("You’ve chosen the “GCP” subclass. These can only have “Isolated Point” or “Point Cloud” geometry, so it has been reset to “Isolated Point.”\n\nPlease verify the grouping information before continuing.");
		}
	}
}

async function os_check() {
	let oscheck = await fetch("/raspbian/");
	let raspbian = await oscheck.text();
	if (raspbian === "true") {
		document.getElementById("shutDownForm").hidden = false;
		// Automatically set the Raspberry Pi clock if it is off by greater than 10 minutes from the browser time.
		let clockcheck = await fetch("/raspbian/clock/");
		let rpiclock = await clockcheck.text();
		rpiclock = new Date(rpiclock.replace(/\"/g, ""));
		let jsclock = new Date();
		if (Math.abs(rpiclock - jsclock) > 600000) {
			set_rpi_clock();
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
	let details = ["Class: " + document.getElementById("currentGroupingClass").innerText];
	details.push("Subclass: " + document.getElementById("currentGroupingSubclass").innerText);
	details.push("Description: " + document.getElementById("currentGroupingDescription").innerText);
	details.push("Number of Shots in Grouping: " + document.getElementById("currentGroupingNumberOfShots").innerText);
	alert(details.join("\n"));
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
	if (document.getElementById("currentSessionInfo").innerText === "(no current session)") {
		document.getElementById("shutDownFormEndCurrentSessionCheckbox").checked = false;
		document.getElementById("shutDownFormEndCurrentSessionCheckbox").hidden = true;
		document.getElementById("shutDownFormEndCurrentSessionCheckboxLabel").hidden = true;
	} else {
		document.getElementById("shutDownFormEndCurrentSessionCheckbox").checked = true;
		document.getElementById("shutDownFormEndCurrentSessionCheckbox").hidden = false;
		document.getElementById("shutDownFormEndCurrentSessionCheckboxLabel").hidden = false;
	}
	load_sessions_menus();
	document.getElementById("utilitiesPopup").hidden = false;
}

function toggle_button(theformid) {
	let theform = document.getElementById(theformid);
	let allfieldsarevalid = true;
	theform.querySelectorAll("*").forEach(formfield => {
		if (formfield.required) {
			allfieldsarevalid *= formfield.validity.valid;
		}
	});
	theform.querySelector("input[type=button]").disabled = !allfieldsarevalid;
}

function toggle_stakeout_fields() {
	if (document.getElementById("takeShotFormStakeoutCheckbox").checked) {
		document.getElementById("takeShotFormStakeoutTarget").hidden = false;
	} else {
		document.getElementById("takeShotFormStakeoutTarget").hidden = true;
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
	document.getElementById("sessionFormBacksightStationMenu").innerHTML = newoptions.join("\n");
}

async function update_dependent_model_menu(themodels = false) {
	if (!themodels) {
		let response = await fetch("/configs/");
		let json = await response.json();
		themodels = json.options.total_stations[document.getElementById("setConfigsFormMakeMenu").value];
	};
	modelsmenu = [];
	themodels.forEach(function (themodel) {
		modelsmenu.push(`<option value="${themodel}">${themodel}</option>`);
	});
	document.getElementById("setConfigsFormModelMenu").innerHTML = modelsmenu.join("\n");
}

async function update_dependent_station_menu(thesite, themenu) {
	let target = document.getElementById(themenu);
	let targetdescription = target.id.replace(/e?s?Menu/, "Description");
	if (thesite.value === "") {
		target.innerHTML = "";
		document.getElementById(targetdescription).hidden = true;
	} else {
		let response = await fetch("/station/" + thesite.value);
		let json = await response.json();
		stationsmenu = ["<option></option>"];
		json.stations.forEach(function (thestation) {
			let thedescription = thestation.description;
			if (thedescription === null || thedescription === "null" || thedescription === "") {
				thedescription = "no description recorded";
			}
			stationsmenu.push(`<option value="${thestation.id}" description="${thedescription} (${thestation.northing}N, ${thestation.easting}E, ${thestation.elevation}Z)">${thestation.name}</option>`);
		});
		target.innerHTML = stationsmenu.join("\n");
		if (json.stations.length === 0) {
			document.getElementById(targetdescription).hidden = true;
		}
	}
}

async function update_dependent_subclass_menu(theclass, themenu) {
	let target = document.getElementById(themenu);
	let targetdescription = target.id.replace(/e?s?Menu/, "Description");
	if (theclass.value === "") {
		target.innerHTML = "";
		document.getElementById(targetdescription).hidden = true;
	} else {
		let response = await fetch("/subclass/" + theclass.value);
		let json = await response.json();
		subclassesmenu = ["<option></option>"];
		json.subclasses.forEach(function (thesubclass) {
			subclassesmenu.push(`<option value="${thesubclass.id}" description="${thesubclass.description}">${thesubclass.name}</option>`);
		});
		target.innerHTML = subclassesmenu.join("\n");
		if (json.subclasses.value === "") {
			document.getElementById(targetdescription).hidden = true;
		}
	}
}

function update_description(source, target) {
	let thedescription = source.options[source.selectedIndex].getAttribute("description");
	if (thedescription === null || thedescription === "null" || thedescription === "") {
		thedescription = "(no description recorded)";
	} else {
		thedescription = thedescription.replaceAll("\\", "\\\\");
		thedescription = thedescription.replaceAll("\'", "\\\'");
		thedescription = thedescription.replaceAll("\"", "\\\"");
	}
	document.getElementById(target).setAttribute("onClick", "alert('" + thedescription + "')");
	document.getElementById(target).hidden = false;
}

function update_required_new_session_fields() {
	switch (document.getElementById("sessionFormSessionTypeMenu").value) {
		case "Backsight":
			_show_required_field("sessionFormBacksightStationMenu");
			_show_required_field("sessionFormPrismHeight");
			_hide_required_field("sessionFormInstrumentHeight");
			_hide_required_field("sessionFormAzimuth");
			document.getElementById("sessionFormStartSessionButton").value = "Shoot Backsight";
			break;
		case "Azimuth":
			_hide_required_field("sessionFormBacksightStationMenu");
			_hide_required_field("sessionFormPrismHeight");
			_show_required_field("sessionFormInstrumentHeight");
			_show_required_field("sessionFormAzimuth");
			document.getElementById("sessionFormStartSessionButton").value = "Set Instrument Azimuth";
			break;
		default:
			_hide_required_field("sessionFormBacksightStationMenu");
			_hide_required_field("sessionFormPrismHeight");
			_hide_required_field("sessionFormInstrumentHeight");
			_hide_required_field("sessionFormAzimuth");
			document.getElementById("sessionFormStartSessionButton").value = "Start New Session";
	}
}

function update_required_new_site_fields() {
	switch (document.getElementById("saveNewStationFormStationCoordinateSystemMenu").value) {
		case "Site":
			_show_required_field("saveNewStationFormStationNorthing");
			_show_required_field("saveNewStationFormStationEasting");
			_show_required_field("saveNewStationFormStationElevation");
			_hide_required_field("saveNewStationFormStationUTMZone");
			_hide_required_field("saveNewStationFormStationLatitude");
			_hide_required_field("saveNewStationFormStationLongitude");
			break;
		case "UTM":
			_show_required_field("saveNewStationFormStationNorthing");
			_show_required_field("saveNewStationFormStationEasting");
			_show_required_field("saveNewStationFormStationElevation");
			_show_required_field("saveNewStationFormStationUTMZone");
			_hide_required_field("saveNewStationFormStationLatitude");
			_hide_required_field("saveNewStationFormStationLongitude");
			break;
		case "Lat/Lon":
			_hide_required_field("saveNewStationFormStationNorthing");
			_hide_required_field("saveNewStationFormStationEasting");
			_hide_required_field("saveNewStationFormStationUTMZone");
			_show_required_field("saveNewStationFormStationLatitude");
			_show_required_field("saveNewStationFormStationLongitude");
			_show_required_field("saveNewStationFormStationElevation");
			break;
		default:
			_hide_required_field("saveNewStationFormStationNorthing");
			_hide_required_field("saveNewStationFormStationEasting");
			_hide_required_field("saveNewStationFormStationElevation");
			_hide_required_field("saveNewStationFormStationUTMZone");
			_hide_required_field("saveNewStationFormStationLatitude");
			_hide_required_field("saveNewStationFormStationLongitude");
	}
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
	let now = new Date();
	document.getElementById("setClockFormDateTimeString").value = now.toString();
	_update_data_via_api("/raspbian/clock/", "PUT", setClockForm);
}


function shut_rpi_down() {
	let themessage = "Press “Ok” to safely shut down the Raspberry Pi."
	let endcurrentsession = document.getElementById("shutDownFormEndCurrentSessionCheckbox").checked;
	if (endcurrentsession === true) {
		themessage = "Press “Ok” to end the current session and safely shut down the Raspberry Pi."
	}
	if (confirm(themessage)) {
		if (endcurrentsession === true) {
			end_current_session(prompt = false);
		}
		fetch("/raspbian/shutdown/");
		document.getElementById("shutDownFormIndicator").hidden = false;
		setTimeout(function () {
			document.getElementById("utilitiesPopup").hidden = true;
			confirm("Shutdown complete. You can now unplug the Raspberry Pi.");
		}, 10000);
	}
}
