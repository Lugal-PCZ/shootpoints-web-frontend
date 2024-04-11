// Raspberry Pi Hardware Interfaces

function rpi_power(action) {
    // The valid actions are "shutdown" and "reboot"
    let warningmessageaction = "safely shut down";
    let confirmationmessage = "Shutdown complete. You can now unplug the Raspberry Pi.";
    let timeout = 10000;
    if (action === "reboot") {
        warningmessageaction = "reboot";
        confirmationmessage = "The Raspberry Pi has been rebooted and your browser will now refresh.";
        timeout = 60000;
    }
    let warningmessage = `Press “Ok” to ${warningmessageaction} the Raspberry Pi.`;
    let endcurrentsession = document.getElementById("rpiPowerOffFormEndCurrentSessionCheckbox").checked;
    if (endcurrentsession === true) {
        warningmessage = `Press “Ok” to end the current session and ${warningmessageaction} the Raspberry Pi.`;
    }
    if (confirm(warningmessage)) {
        if (endcurrentsession === true) {
            end_current_session(prompt = false);
        }
        fetch(`/raspberrypi/${action}/`);
        document.getElementById("rpiPowerOffFormIndicator").hidden = false;
        setTimeout(function () {
            document.getElementById("rpiPowerOffFormIndicator").hidden = true;
            document.getElementById("utilitiesPopup").hidden = true;
            confirm(confirmationmessage);
            if (action === "reboot") {
                window.location.reload();
            }
        }, timeout);
    }
}


async function set_rpi_clock() {
    let now = new Date();
    document.getElementById("setClockFormDateTimeString").value = now.toString();
    await _update_data_via_api("/raspberrypi/clock/", "PUT", setClockForm);
}
