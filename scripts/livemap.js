// Live Map Manipulation

var map;
var sessionplotted = false;
var backgrounddrawn = false;
var currentopenpolygon = null;
var currentclosedpolygon = null;
var unsavedshot = null;

async function livemap_initialize() {
    var canvasRenderer = L.canvas({ tolerance: 4 });
    map = L.map("liveMap", { renderer: canvasRenderer, zoomControl: false });
}

async function livemap_show() {
    if (!sessionplotted) {
        await livemap_plot_session();
    }
    document.getElementById("liveMap").hidden = false;
    map.invalidateSize();
}

async function livemap_plot_session() {
    let data = await fetch("/livemap/");
    let json = await data.json();
    if (Object.keys(json).length === 0) {
        return;
    }
    if (!backgrounddrawn && !json.occupiedstation.sitelocalcoords) {
        L.gridLayer.googleMutant({
            type: "satellite",
            maxNativeZoom: 21,
            maxZoom: 27,
        }).addTo(map);
        backgrounddrawn = true;
    }
    map.setView(json.occupiedstation.coords, 18);
    var label = "<b>Session “" + json.occupiedstation.label[0] + "”</b><br>Occupied Station: " + json.occupiedstation.label[1]
    L.shapeMarker(json.occupiedstation.coords,
        {
            renderer: L.svg(),
            shape: "triangle",
            color: "black",
            fillColor: "white",
            radius: 6,
            weight: 2,
            opacity: 1,
            fillOpacity: 0.5
        }).bindPopup(label).addTo(map);
    L.circleMarker(json.occupiedstation.coords,
        {
            renderer: L.svg(),
            stroke: false,
            fillColor: "black",
            radius: 2,
            fillOpacity: 1
        }).bindPopup(json.occupiedstation.label).addTo(map);
    json.polylines.forEach(function (thepolyline) {
        label = "<b>" + thepolyline.label[0] + ":</b><br>" + thepolyline.label[1]
        if (thepolyline.groupingid !== json.currentgrouping) {
            L.polyline(thepolyline.coords,
                {
                    color: "blue",
                    lineCap: "butt",
                    lineJoin: "bevel",
                    weight: 2,
                    opacity: 1,
                }).bindPopup(label).addTo(map);
        } else {
            livemap_plot_current_open_polygon(thepolyline.coords, label);
        }
    });
    json.polygons.forEach(function (thepolygon) {
        label = "<b>" + thepolygon.label[0] + ":</b><br>" + thepolygon.label[1]
        if (thepolygon.groupingid !== json.currentgrouping) {
            L.polygon(thepolygon.coords,
                {
                    color: "blue",
                    lineCap: "butt",
                    lineJoin: "bevel",
                    weight: 2,
                    opacity: 1,
                }).bindPopup(label).addTo(map);
        } else {
            livemap_plot_current_closed_polygon(thepolygon.coords, label);
        }
    });
    json.points.forEach(function (thepoint) {
        label = "<b>" + thepoint.label[0] + ":</b><br>" + thepoint.label[1]
        L.circleMarker(thepoint.coords,
            {
                color: "white",
                fillColor: "black",
                radius: 3,
                weight: 2,
                opacity: 0.5,
                fillOpacity: 1
            }).bindPopup(label).addTo(map);
    });
    sessionplotted = true;
}

function livemap_plot_current_open_polygon(coords, label) {
    if (!label) {
        var label = livemap_current_grouping_label();
    }
    currentopenpolygon = L.polyline(coords,
        {
            color: "blue",
            lineCap: "butt",
            lineJoin: "bevel",
            weight: 2,
            opacity: 1,
        }).bindPopup(label).addTo(map);
}

function livemap_plot_current_closed_polygon(coords, label) {
    if (!label) {
        var label = livemap_current_grouping_label();
    }
    currentclosedpolygon = L.polygon(coords,
        {
            color: "blue",
            lineCap: "butt",
            lineJoin: "bevel",
            weight: 2,
            opacity: 1,
        }).bindPopup(label).addTo(map);
}

function livemap_plot_unsaved_shot(lat, lon) {
    var label = livemap_current_grouping_label();
    if (currentopenpolygon === null) {
        livemap_plot_current_open_polygon([], null);
    }
    if (currentclosedpolygon === null) {
        livemap_plot_current_closed_polygon([], null);
    }
    if (["Open Polygon", "Closed Polygon"].includes(document.getElementById("currentGroupingInfo").getAttribute("currentgroupinggeometry"))) {
        if (document.getElementById("currentGroupingInfo").getAttribute("currentgroupinggeometry") === "Open Polygon") {
            currentopenpolygon.addLatLng([lat, lon]);
        } else if (document.getElementById("currentGroupingInfo").getAttribute("currentgroupinggeometry") === "Closed Polygon") {
            currentclosedpolygon.addLatLng([lat, lon]);
        }
    }
    unsavedshot = L.circleMarker([lat, lon],
        {
            color: "white",
            fillColor: "red",
            radius: 4,
            weight: 2,
            opacity: 0.5,
            fillOpacity: 1
        }).bindPopup(label).addTo(map);
}

function livemap_discard_last_shot() {
    try {
        map.removeLayer(unsavedshot);
        if (currentopenpolygon._latlngs.length > 0) {
            currentopenpolygon._latlngs.pop();
            currentopenpolygon.redraw();
        }
        if (currentclosedpolygon._latlngs.length > 0) {
            currentclosedpolygon._latlngs[0].pop();
            currentclosedpolygon.redraw();
        }
    } catch { }
}

function livemap_save_last_shot() {
    unsavedshot.options.fillColor = "black";
    unsavedshot._radius = 3;
    unsavedshot.redraw();
}

function livemap_end_current_grouping() {
    livemap_discard_last_shot();
    currentopenpolygon = null;
    currentclosedpolygon = null;
}

function livemap_current_grouping_label() {
    var info = [];
    info.push("<b>" + document.getElementById("currentGroupingInfo").getAttribute("currentgroupingsubclass") + ":</b>");
    info.push(document.getElementById("currentGroupingInfo").getAttribute("currentgroupinglabel"));
    return info.join("<br>")
}
