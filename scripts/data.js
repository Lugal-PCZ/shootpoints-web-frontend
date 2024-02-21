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
	update_model_menu(json.options.total_stations[json.current.make]);
	document.getElementById("setConfigsFormModelMenu").value = json.current.model;
	document.getElementById("setConfigsFormLimit").value = json.current.limit;
}

async function load_current_grouping_info() {
	let response = await fetch("/grouping/");
	let json = await response.json();
	if (Object.keys(json).length === 0) {
		document.getElementById("currentGroupingInfo").innerHTML = "<i>(no current grouping)</i>";
		document.getElementById("currentGroupingDetails").hidden = true;
		document.getElementById("groupingFormEndCurrentGroupingButton").disabled = true;
		document.getElementById("takeShotFormButton").disabled = true;
		show_take_shot_form();
	} else {
		document.getElementById("currentGroupingInfo").innerHTML = `${json.subclasses_name}: ${json.label} (${json.geometries_name})`;
		document.getElementById("currentGroupingInfo").setAttribute("currentgroupingid", json.id);
		document.getElementById("currentGroupingInfo").setAttribute("currentgroupinglabel", json.label);
		document.getElementById("currentGroupingInfo").setAttribute("currentgroupinggeometry", json.geometries_name);
		document.getElementById("currentGroupingInfo").setAttribute("currentgroupingclass", json.classes_name);
		document.getElementById("currentGroupingInfo").setAttribute("currentgroupingsubclass", json.subclasses_name);
		document.getElementById("currentGroupingInfo").setAttribute("currentgroupingdescription", json.description);
		document.getElementById("currentGroupingInfo").setAttribute("currentgroupingnumberofshots", json.num_shots);
		document.getElementById("currentGroupingDetails").setAttribute("onClick", "show_current_grouping_details();");
		document.getElementById("currentGroupingDetails").hidden = false;
		document.getElementById("groupingFormEndCurrentGroupingButton").disabled = false;
		document.getElementById("takeShotFormButton").disabled = false;
		show_take_shot_form("takeShotForm");
	}
}

async function load_current_session_info() {
	let response = await fetch("/session/");
	let json = await response.json();
	if (Object.keys(json).length === 0) {
		document.getElementById("currentSessionInfo").innerHTML = "<i>(no current session)</i>";
		document.getElementById("currentSessionDetails").hidden = true;
		document.getElementById("sessionFormEndCurrentSessionButton").disabled = true;
		document.getElementById("groupingForm").hidden = true;
		show_take_shot_form();
	} else {
		document.getElementById("currentSessionInfo").innerHTML = `${json.label}`;
		document.getElementById("currentSessionInfo").setAttribute("currentsessionid", json.id);
		document.getElementById("currentSessionInfo").setAttribute("currentsessionlabel", json.label);
		document.getElementById("currentSessionInfo").setAttribute("currentsessionstarted", json.started);
		document.getElementById("currentSessionInfo").setAttribute("currentsessionsite", json.sites_name);
		document.getElementById("currentSessionInfo").setAttribute("currentsessionoccupiedpoint", json.stations_name);
		document.getElementById("currentSessionInfo").setAttribute("currentsessioninstrumentheight", json.instrumentheight);
		document.getElementById("currentSessionDetails").setAttribute("onClick", "show_current_session_details();");
		document.getElementById("currentSessionDetails").hidden = false;
		document.getElementById("sessionFormEndCurrentSessionButton").disabled = false;
		document.getElementById("groupingForm").hidden = false;
		show_take_shot_form("takeShotForm");
		// expand the surveying panel on first load if there’s an active session
		if (document.getElementById("surveyingPanel").hasAttribute("firstload")) {
			collapse(document.getElementById("surveyingPanel"));
			document.getElementById("surveyingPanel").removeAttribute("firstload")
		}
	}
}

async function load_date_and_time() {
	let now = new Date();
	document.getElementById("dateAndTime").innerHTML = now.toString();
	setTimeout(load_date_and_time, 1000);
	document.getElementById("sessionFormLabel").value = now.toISOString().substring(0,10);
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
	if (json.errors) {
		json.errors.forEach(function (theerror) {
			errormessage.push(`<b style="color: red;">ERROR:</b> ${theerror}`);
		});
		document.getElementById("outputBox").innerHTML = errormessage.join("<br>");
	}
	else {
		document.getElementById("outputBox").innerHTML = json.results;
	};
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
	if (confirm(`Delete class “${classname.options[classname.selectedIndex].text}?”`)) {
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
	if (confirm(`Delete site “${sitename.options[sitename.selectedIndex].text}?”`)) {
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
	let themessage = `Delete session “${sessionlabel.options[sessionlabel.selectedIndex].text},”`;
	// get the current session and check if it's the one selected
	let currentsession = false
	let response = await fetch("/session/");
	let json = await response.json();
	if (Number(json.id) === Number(sessionlabel.options[sessionlabel.selectedIndex].value)) {
		currentsession = true
		themessage = "Delete the current session,";
	}
	themessage += " including all its shots and groupings?\n\nThis cannot be undone, so download any important data before proceeding."
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
	if (confirm(`Delete station “${thestation.options[thestation.selectedIndex].text}?”`)) {
		let status = await _update_data_via_api("/station/", "DELETE", deleteStationForm)
		if (status >= 200 && status <= 299) {
			update_station_menu(document.getElementById("deleteStationFormSitesMenu"), "deleteStationFormStationsMenu");
			document.getElementById("deleteStationFormStationDescription").hidden = true;
			document.getElementById("deleteStationFormButton").disabled = true;
		}
	}
}

async function delete_subclass() {
	let thesubclass = document.getElementById("deleteSubclassFormSubclassesMenu");
	if (confirm(`Delete subclass “${thesubclass.options[thesubclass.selectedIndex].text}?”`)) {
		let status = await _update_data_via_api("/subclass/", "DELETE", deleteSubclassForm)
		if (status >= 200 && status <= 299) {
			update_subclass_menu(document.getElementById("deleteSubclassFormClassesMenu"), "deleteSubclassFormSubclassesMenu");
			document.getElementById("deleteSubclassFormSubclassDescription").hidden = true;
			document.getElementById("deleteSubclassFormButton").disabled = true;
		}
	}
}

async function end_current_grouping(prompt = true) {
	let themessage = "This will end the current grouping.\n\nPress “Ok” to proceed or “Cancel” to go back.";
	if (document.getElementById("saveLastShotForm").hidden === false) {
		themessage = "This will end the current grouping and discard your unsaved shot.\n\nPress “Ok” to proceed or “Cancel” to go back."
	}
	if (!prompt || confirm(themessage)) {
		let status = await _update_data_via_api("/grouping/", "PUT", groupingForm);
		if (status >= 200 && status <= 299) {
			document.getElementById("groupingForm").reset();
			document.getElementById("groupingFormGeometryDescription").hidden = true;
			document.getElementById("groupingFormClassDescription").hidden = true;
			document.getElementById("groupingFormSubclassDescription").hidden = true;
			document.getElementById("groupingFormStartGroupingButton").disabled = true;
			load_current_grouping_info();
		}
	}
}

async function end_current_session(prompt = true) {
	let themessage = "This will end the current session.\n\nPress “Ok” to proceed or “Cancel” to go back.";
	if (document.getElementById("saveLastShotForm").hidden === false) {
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
	await _update_data_via_api("/configs/", "PUT", setConfigsForm);
}

async function set_prism_offsets() {
	await _update_data_via_api("/prism/", "PUT", setPrismOffsetsForm);
	document.getElementById("onTheFlyAdjustmentsPopup").hidden = true;
	load_prism_offsets();
}

async function start_new_grouping() {
	if (document.getElementById("saveLastShotForm").hidden === false) {
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
		show_take_shot_form("takeShotForm");
		load_current_grouping_info();
		collapse(document.getElementById("groupingFormHeader"));
	}
}

async function start_new_session() {
	if (document.getElementById("saveLastShotForm").hidden === false) {
		if (!confirm("You have a shot that will not be saved if you continue.\n\nPress “Ok” to proceed or “Cancel” to go back.")) {
			return;
		}
	}
	let response = await fetch("/grouping/");
	let json = await response.json();
	if (Object.keys(json).length > 0) {
		if (confirm(`You have an active grouping (“${json.label}”).\n\nPress “Ok” to end it before proceeding or “Cancel” to leave it active.`)) {
			end_current_grouping(false);
		}
	}
	document.getElementById("sessionFormCancelBacksightButton").setAttribute("backsightcanceled", "no");
	document.getElementById("sessionFormIndicator").hidden = false;
	document.getElementById("sessionFormEndCurrentSessionButton").disabled = true;
	document.getElementById("sessionFormAbortResectionButton").hidden = true;
	if (["Backsight", "Resection"].includes(document.getElementById("sessionFormSessionTypeMenu").value)) {
		document.getElementById("sessionFormStartSessionButton").hidden = true;
		document.getElementById("sessionFormCancelBacksightButton").hidden = false;
	}
	let status = await _update_data_via_api("/session/", "POST", sessionForm);
	if (status >= 200 && status <= 299) {
		load_atmospheric_conditions();
		load_prism_offsets();
		if (document.getElementById("sessionFormCancelBacksightButton").getAttribute("backsightcanceled") === "no") {
			// Special case for Backsight #1 of resection
			if (document.getElementById("sessionFormStartSessionButton").value === "Shoot Backsight #1") {
				document.getElementById("sessionFormSitesMenu").disabled = true;
				document.getElementById("sessionFormBacksightStation1Menu").disabled = true;
				document.getElementById("sessionFormInstrumentHeight").disabled = true;
				document.getElementById("sessionFormStartSessionButton").value = "Shoot Backsight #2";
				document.getElementById("sessionFormEndCurrentSessionButton").hidden = true;
				document.getElementById("sessionFormAbortResectionButton").hidden = false;
			}
			else {
				document.getElementById("sessionForm").reset();
				document.getElementById("sessionFormSitesMenu").disabled = false;
				document.getElementById("sessionFormBacksightStation1Menu").disabled = false;
				document.getElementById("sessionFormInstrumentHeight").disabled = false;
				document.getElementById("sessionFormStartSessionButton").value = "Start New Session";
				document.getElementById("sessionFormEndCurrentSessionButton").hidden = false;
				document.getElementById("sessionFormSiteDescription").hidden = true;
				document.getElementById("sessionFormOccupiedPointDescription").hidden = true;
				document.getElementById("sessionFormBacksightStationDescription").hidden = true;
				document.getElementById("sessionFormStartSessionButton").disabled = true;
				document.getElementById("sessionFormEndCurrentSessionButton").disabled = false;
				update_required_new_session_fields();
				load_current_session_info();
				load_current_grouping_info();
				collapse(document.getElementById("sessionFormHeader"));
			}
		}
	} else {
		alert("An error occurred while starting the session. See the output box for details.");
	}
	document.getElementById("sessionFormIndicator").hidden = true;
	document.getElementById("sessionFormStartSessionButton").hidden = false;
	document.getElementById("sessionFormCancelBacksightButton").hidden = true;
}

async function cancel_backsight() {
	document.getElementById("sessionFormCancelBacksightButton").setAttribute("backsightcanceled", "yes")
	await fetch("/cancel/");
}

async function abort_resection() {
	if (confirm("Do you wish to clear the currently saved settings for Backsight #1?")) {
		let response = await fetch("/abort/");
		let json = await response.json();
		console.log(json);
		document.getElementById("outputBox").innerHTML = json.result;
		document.getElementById("sessionFormSitesMenu").disabled = false;
		document.getElementById("sessionFormBacksightStation1Menu").disabled = false;
		document.getElementById("sessionFormInstrumentHeight").disabled = false;
		document.getElementById("sessionFormStartSessionButton").value = "Start New Session";
		document.getElementById("sessionFormEndCurrentSessionButton").hidden = false;
		document.getElementById("sessionFormEndCurrentSessionButton").disabled = false;
		document.getElementById("sessionFormAbortResectionButton").hidden = true;
	}
}

// Shot Handling

async function take_shot() {
	show_take_shot_form("cancelShotForm");
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
		if (json.result === "Shot canceled by user.") {
			theoutput.push(json.result);
		} else {
			if (document.getElementById("takeShotFormStakeoutCheckbox").checked) {
				let themessage = [];
				if (document.getElementById("takeShotFormStakeoutTargetNorthing").value) {
					let n_difference = document.getElementById("takeShotFormStakeoutTargetNorthing").value - json.result.calculated_n;
					let n_direction = "North";
					if (n_difference < 0) {
						n_direction = "South";
					}
					themessage.push(`Move ${Math.abs(n_difference).toFixed(2)}m ${n_direction}`);
				}
				if (document.getElementById("takeShotFormStakeoutTargetEasting").value) {
					let e_difference = document.getElementById("takeShotFormStakeoutTargetEasting").value - json.result.calculated_e;
					let e_direction = "East";
					if (e_difference < 0) {
						e_direction = "West";
					}
					themessage.push(`Move ${Math.abs(e_difference).toFixed(2)}m ${e_direction}`);
				}
				if (themessage) {
					alert("Distance to stakeout target:\n" + themessage.join("\n"));
				}
			}
			show_take_shot_form("saveLastShotForm");
			if ("result" in json) {
				theoutput.push('<b>Last Shot:</b>');
				theoutput.push('<table class="shotdata">');
				theoutput.push(`<tr><td>delta_n</td><td align='right'>${json.result.delta_n.toFixed(3)}</td><td>|</td><td>calculated_n</td><td align='right'>${json.result.calculated_n.toFixed(3)}</td></tr>`);
				theoutput.push(`<tr><td>delta_e</td><td align='right'>${json.result.delta_e.toFixed(3)}</td><td>|</td><td>calculated_e</td><td align='right'>${json.result.calculated_e.toFixed(3)}</td></tr>`);
				theoutput.push(`<tr><td>delta_z</td><td align='right'>${json.result.delta_z.toFixed(3)}</td><td>|</td><td>calculated_z</td><td align='right'>${json.result.calculated_z.toFixed(3)}</td></tr>`);
				theoutput.push('</table>');
			}
		}
	}
	document.getElementById("outputBox").innerHTML = theoutput.join("\n");
}

async function cancel_shot() {
	show_take_shot_form("takeShotForm");
	await fetch("/cancel/");
}

async function save_last_shot() {
	await _update_data_via_api("/shot/", "POST", saveLastShotForm);
	show_take_shot_form("takeShotForm");
	load_current_grouping_info();
}

function discard_last_shot() {
	if (confirm("Discard this shot without saving?")) {
		document.getElementById("outputBox").innerText = "Last shot discarded.";
		show_take_shot_form("takeShotForm");
	}
}
