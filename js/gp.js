let GP_AXIS_ROLL = 0;
let GP_AXIS_PITCH = 1;
let GP_AXIS_YAW = 4;
let GP_AXIS_THROTTLE = 2;

let GP_DEFAULT_GP = 0;
let GP_DEADZONE = 0.2;

function gpCheckSupport() {
    return !!(navigator.getGamepads);
}

function gpCheckConnection() {
    let gamepads = navigator.getGamepads();
    var count = 0;
    for (let i = gamepads.length - 1; i >= 0; i--) {
        let gp = gamepads[i];
        if (gp && gp.connected)
            count++;
    }

    return count;
}

function gpApplyClamp(x, y, z) {
    let mag = Math.sqrt(x*x, y*y, z*z);
    if (mag > 1) {
        x = x / m;
        y = y / m;
        z = z / m;
    }

    return [x, y, z];
}

function gpApplyDeadzone(val) {
    if (Math.abs(val) < GP_DEADZONE)
        val = 0;
    else {
        val = val - Math.sign(val) * GP_DEADZONE;
        val = val / (1.0 - GP_DEADZONE);
    }

    return val;
}

function gpGetRPYT() {
    let gp = navigator.getGamepads()[GP_DEFAULT_GP];

    let r = gpApplyDeadzone(gp.axes[GP_AXIS_ROLL]);
    let p = gpApplyDeadzone(gp.axes[GP_AXIS_PITCH]);
    let y = gpApplyDeadzone(gp.axes[GP_AXIS_YAW]);
    let t = (-gpApplyDeadzone(gp.axes[GP_AXIS_THROTTLE]) + 1) / 2;

    return [r, p, y, t];
}

