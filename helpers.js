// Custom helper functions to provide functionality that isn't directly available in htmx.

function htmx_render_442() {
	// force htmx to render 422 responses like it does 2xx ones
	document.addEventListener('htmx:beforeSwap', function (evt) {
		if (evt.detail.xhr.status === 422) {
			evt.detail.shouldSwap = true;
			// set isError to false to avoid error logging in console
			evt.detail.isError = false;
		};
	});
}

function htmx_reset_form_fields() {
	// clear form fields on successful submission
	document.addEventListener('htmx:afterOnLoad', function (evt) {
		if (evt.detail.xhr.status >= 200 && evt.detail.xhr.status <= 299) {
			if (evt.detail.elt.nodeName === "BUTTON") {
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
	if (requiredfieldswithdata.length === requiredfields.length || optionalfieldswithdata.length > 0) {
		thebutton.disabled = false;
	} else {
		thebutton.disabled = true;
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
		document.getElementById(target).setAttribute("onclick", "alert('" + thedescription + "')");
	}
}

function update_required_new_site_fields() {
	let coordinatesystem = document.getElementById("saveNewStationCoordinateSystem").value;
	let northing = document.getElementById("saveNewStationNorthing");
	let easting = document.getElementById("saveNewStationEasting");
	let elevation = document.getElementById("saveNewStationElevation");
	let utmzone = document.getElementById("saveNewStationUTMZone");
	let latitude = document.getElementById("saveNewStationLatitude");
	let longitude = document.getElementById("saveNewStationLongitude");
	switch (coordinatesystem) {
		case "Site":
			northing.required = true;
			easting.required = true;
			elevation.required = true;
			utmzone.required = false;
			latitude.required = false;
			longitude.required = false;
			break;
		case "UTM":
			northing.required = true;
			easting.required = true;
			elevation.required = true;
			utmzone.required = true;
			latitude.required = false;
			longitude.required = false;
			break;
		case "Lat/Lon":
			northing.required = false;
			easting.required = false;
			elevation.required = false;
			utmzone.required = false;
			latitude.required = true;
			longitude.required = true;
			break;
		default:
			northing.required = false;
			easting.required = false;
			elevation.required = false;
			utmzone.required = false;
			latitude.required = false;
			longitude.required = false;
	}
}
