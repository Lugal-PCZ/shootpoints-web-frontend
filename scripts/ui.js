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
            themessage += "\n\nMoreover, because a survey station is by definition a single point in space, the geometry for this point has been changed to “Isolated Point.” Please verify the grouping information before continuing.";
        }
        alert(themessage);
    } else if (document.getElementById("groupingFormSubclassesMenu").value === "5") {
        if (geometriesmenu.value != "1" && geometriesmenu.value != "2") {
            geometriesmenu.value = "1";
            update_description(geometriesmenu, 'groupingFormGeometryDescription');
            alert("You’ve chosen the “GCP” subclass. These can only have “Isolated Point” or “Point Cloud” geometry, so it has been changed to “Isolated Point.” Please verify the grouping information before continuing.");
        }
    }
}

async function os_check() {
    let oscheck = await fetch("/raspbian/");
    let raspbian = await oscheck.text();
    if (raspbian === "true") {
        document.getElementById("rpiPowerOffForm").hidden = false;
        // Automatically set the Raspberry Pi clock if it is off by greater than 10 minutes from the browser time.
        let clockcheck = await fetch("/raspbian/clock/");
        let rpiclock = await clockcheck.text();
        let jsclock = new Date.now();
        if (Math.abs(rpiclock - jsclock) > 600) {
            set_rpi_clock();
        };
    };
}

function show_take_shot_form(theform = null) {
    document.getElementById("takeShotForm").hidden = true;
    document.getElementById("cancelShotForm").hidden = true;
    document.getElementById("saveLastShotForm").hidden = true;
    if (theform) {
        document.getElementById(theform).hidden = false;
    }
}

function show_current_grouping_details() {
    let details = [`Class: ${document.getElementById("currentGroupingInfo").getAttribute("currentgroupingclass")}`];
    details.push(`Subclass: ${document.getElementById("currentGroupingInfo").getAttribute("currentgroupingsubclass")}`);
    details.push(`Description: ${document.getElementById("currentGroupingInfo").getAttribute("currentgroupingdescription")}`);
    details.push(`Number of Shots in Grouping: ${document.getElementById("currentGroupingInfo").getAttribute("currentgroupingnumberofshots")}`);
    alert(details.join("\n"));
}

function show_current_session_details() {
    let details = [`Site: ${document.getElementById("currentSessionInfo").getAttribute("currentsessionsite")}`];
    details.push(`Occupied Point: ${document.getElementById("currentSessionInfo").getAttribute("currentsessionoccupiedpoint")}`);
    details.push(`Instrument Height: ${document.getElementById("currentSessionInfo").getAttribute("currentsessioninstrumentheight")}m`);
    alert(details.join("\n"));
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
    if (Number(document.getElementById("currentSessionInfo").getAttribute("currentsessionid")) > 0) {
        document.getElementById("rpiPowerOffFormEndCurrentSessionCheckbox").hidden = false;
        document.getElementById("rpiPowerOffFormEndCurrentSessionCheckboxLabel").hidden = false;
    } else {
        document.getElementById("rpiPowerOffFormEndCurrentSessionCheckbox").checked = false;
        document.getElementById("rpiPowerOffFormEndCurrentSessionCheckbox").hidden = true;
        document.getElementById("rpiPowerOffFormEndCurrentSessionCheckboxLabel").hidden = true;
    }
    toggle_rpi_power_buttons();
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

function toggle_rpi_power_buttons() {
    if (document.getElementById("rpiPowerOffFormEndCurrentSessionCheckbox").checked) {
        document.getElementById("rpiPowerOffFormShutdownButton").classList.add("dangerous");
        document.getElementById("rpiPowerOffFormRebootButton").classList.add("dangerous");
    } else {
        document.getElementById("rpiPowerOffFormShutdownButton").classList.remove("dangerous");
        document.getElementById("rpiPowerOffFormRebootButton").classList.remove("dangerous");
    }
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
        if (option.indexOf(`value="${occupiedstationmenu.value}"`) === -1) {
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
    if (source.options[source.selectedIndex].value === "") {
        document.getElementById(target).hidden = true;
    }
    else {
        let thedescription = source.options[source.selectedIndex].getAttribute("description");
        if (thedescription === null || thedescription === "null" || thedescription === "") {
            thedescription = "(no description recorded)";
        } else {
            thedescription = thedescription.replaceAll("\\", "\\\\");
            thedescription = thedescription.replaceAll("\'", "\\\'");
            thedescription = thedescription.replaceAll("\"", "\\\"");
        }
        document.getElementById(target).setAttribute("onClick", `alert("${thedescription}")`);
        document.getElementById(target).hidden = false;
    }
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
