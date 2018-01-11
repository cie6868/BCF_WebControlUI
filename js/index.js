var sock;
var gamepadCount = 0;

var fliAttitude = $.flightIndicator('#fli-attitude', 'attitde', {
	size: 200,
	img_directory: 'images/fli/'
});
var fliHeading = $.flightIndicator('#fli-heading', 'heading', {
	size: 200,
	img_directory: 'images/fli/'
});

var fliAltimeter = $.flightIndicator('#fli-altimeter', 'altimeter', {
	size: 200,
	img_directory: 'images/fli/'
});

var fliThrottle = new ProgressBar.Circle('#fli-throttle', {
	color: '#ffffff',
	strokeWidth: 5,
	trailWidth: 1,
	duration: 100,
	text: { autoStyleContainer: false },
	step: function(state, circle) {
		var value = Math.round(circle.value() * 10000);
		circle.setText(value);
	}
});
fliThrottle.text.style.fontSize = '2rem';

$(document).ready(function() {
	// setup WebSocket
	sock = new ReconnectingWebSocket('ws://192.168.1.80:9090/control');
	sock.reconnectInterval = 1000;
	sock.reconnectDecay = 1.0;

	sock.onopen = function(e) {
		$('#disconnected').hide();
		logInsert('sock.onopen', 'Socket opened');
	}
	sock.onclose = function(e) {
		$('#disconnected').show();
		logInsert('sock.onclose', 'Socket closed');
	}
	sock.onmessage = function(e) {
		var spl = e.data.split(' ');
		onDataInput(parseInt(spl[0]), parseFloat(spl[1]));
	}

	// start listening to gamepad
	if (gpCheckSupport())
		requestAnimationFrame(onFrame);
	else
		logInsert('onLoad', 'No support for gamepads');
});

var hed = 0;
function onFrame() {
	let gamepadsAvailable = gpCheckConnection();
	if (gamepadsAvailable > gamepadCount)
		logInsert('onFrame', 'Gamepad connected');
	else if (gamepadsAvailable < gamepadCount)
		logInsert('onFrame', 'Gamepad disconnected');
	gamepadCount = gamepadsAvailable;

	if (gamepadCount > 0) {
		let [r, p, y, t] = gpGetRPYT();
		hed = hed + y;
		fliHeading.setHeading(hed);
		fliThrottle.animate(t);

		if (sock.readyState == 1) {
			sock.send('' + t);
		}
	}

	requestAnimationFrame(onFrame);
}

function onDataInput(field, value) {
	switch (field) {
		case 11:
			fliAttitude.setRoll(-1 * value);
			break;
		case 12:
			fliAttitude.setPitch(value);
			break;
		case 15:
			$('#throttle0').html(value);
			break;
		case 16:
			$('#throttle1').html(value);
			break;
	}
}

function logInsert(source, message) {
	var log = source + ': ' +  message;
	$('#log-container').html($('#log-container').html() + log + '<br>');
}

