function toggle_button(button, fields, any=false) {
    if (any) {
        let filtered_fields =  fields.filter(function (field){
            if (document.getElementById(field).value != "") {
                return field;
            }
        });
        if (filtered_fields.length > 0) {
            document.getElementById(button).disabled = false;
        } else {
            document.getElementById(button).disabled = true;
        }
    } else {
        let filtered_fields =  fields.filter(function (field){
            if (document.getElementById(field).value != "") {
                return field;
            }
        });
        if (filtered_fields.length === fields.length) {
            document.getElementById(button).disabled = false;
        } else {
            document.getElementById(button).disabled = true;
        }
    }
}

async function build_class_menus() {
    classes = await get_all_classes_and_subclasses();
    let menus = document.getElementsByClassName("classMenu")
    for (i = 0; i < menus.length; i++) {
        menus[i].innerHTML = '<option value=""></option>';
        let j = 1;
        for (let eachclass in classes.results) {
            classname = classes.results[eachclass].name;
            classid = classes.results[eachclass].id;
            menus[i].options[j] = new Option(classname, classid);
            j++;
        }
    }
}

async function build_subclass_menu(menu, classes_id) {
    classes = await get_all_classes_and_subclasses();
    let themenu = document.getElementById(menu);
    subclasses = classes.results.filter(({id}) => id == classes_id)[0].subclasses;
    themenu.innerHTML = '<option value=""></option>';
    let j = 1;
    for (let eachsubclass in subclasses) {
        subclassname = subclasses[eachsubclass].name;
        subclassid = subclasses[eachsubclass].id;
        themenu.options[j] = new Option(subclassname, subclassid);
        j++;
    }
}

function _display_result(result) {
    text = JSON.stringify(result, null, "\t");
    document.getElementById("result").innerHTML = text;
}

async function _get(path) {
    let url = "http://" + location.host + path;
    let response = await fetch(url);
    let json = await response.json();
    return json;
}

async function _post(path, data) {
    let url = "http://" + location.host + path + "?";
    let params = Object.keys(data).map(key => key + '=' + encodeURIComponent(data[key])).join('&');
    let response = await fetch(url + params, {
        method: "POST",
    });
    let json = await response.json();
    _display_result(json);
}

async function _put(path, data) {
    let url = "http://" + location.host + path + "?";
    let params = Object.keys(data).map(key => key + '=' + encodeURIComponent(data[key])).join('&');
    let response = await fetch(url + params, {
        method: "PUT",
    });
    let json = await response.json();
    _display_result(json);
}

async function _delete(path, id) {
    let url = "http://" + location.host + path + id;
    let response = await fetch(url, {
        method: "DELETE"
    });
    let json = await response.json();
    _display_result(json);
}

function set_configs(port = "", make = "", model = "", limit = 0) {
    data = {
        port: port,
        make: make,
        model: model,
        limit: limit
    }
    _put("/config/", data);
}

async function get_all_classes_and_subclasses(log_results = false) {
    result = await _get("/class/");
    if (log_results) {
        console.dir(result["results"]);
    }
    return result;
}

async function show_summary() {
    result = await _get("/summary/");
    _display_result(result);
}

function create_new_class(name, description = "") {
    data = {
        name: name,
        description: description
    }
    _post("/class/", data);
}

function delete_class(id) {
    _delete("/class/", id);
}

function create_new_subclass(classes_id, name, description = "") {
    data = {
        classes_id: classes_id,
        name: name,
        description: description
    }
    _post("/class/" + classes_id, data);
}

function delete_subclass(classes_id, id) {
    _delete("/class/" + classes_id + "/", id);
}

async function get_offset_types_and_directions(log_results = false) {
    result = await _get("/offsets/");
    if (log_results) {
        console.log(result);
    }
    return result;
}

async function get_prism_offsets() {
    result = await _get("/prism/");
    _display_result(result);
}

async function set_prism_offsets(offsets) {
    // data = {
    // }
    // _put("/prism/", data);
}

async function get_all_sites() {
    result = await _get("/site/");
    _display_result(result);
}








// function get_site(id) {
//     _get("/site/" + id)
// }
