// Raspberry Pi Hardware Interfaces

function rpi_power(action) {
    // The valid actions are "shutdown" and "reboot"
    let warningmessageaction = "safely shut down";
    let timeout = 10000;
    if (action === "reboot") {
        warningmessageaction = "reboot";
        timeout = 60000;
    }
    let warningmessage = `Press “Ok” to ${warningmessageaction} the data collector.`;
    let endcurrentsession = document.getElementById("rpiPowerOffFormEndCurrentSessionCheckbox").checked;
    if (endcurrentsession === true) {
        warningmessage = `Press “Ok” to end the current session and grouping, and ${warningmessageaction} the data collector.`;
    }
    if (confirm(warningmessage)) {
        if (endcurrentsession === true) {
            end_current_session(false);
        }
        fetch(`/raspberrypi/${action}/`);
        document.getElementById("rpiPowerOffFormIndicator").hidden = false;
        setTimeout(function () {
            if (action === "shutdown") {
                document.body.innerHTML = "<h1 style=\"color: white;\">The data collector is shut down</h1><h2 style=\"color: white;\">It can now be unplugged.</h2>";
            }
            if (action === "reboot") {
                document.body.innerHTML = "<h1 style=\"color: white;\">The data collector has been rebooted</h1><h2 style=\"color: white;\">Please reconnect to the “shootpoints” WiFi network and refresh your browser window.</h2>";
            }
        }, timeout);
    }
}


async function set_rpi_clock() {
    let now = new Date().toISOString();
    document.getElementById("setClockFormDateTimeString").value = `${now.slice(0, 10)} ${now.slice(11, 19)}`;
    await _update_data_via_api("/raspberrypi/clock/", "PUT", setClockForm, true);
}
