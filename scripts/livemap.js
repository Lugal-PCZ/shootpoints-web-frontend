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
