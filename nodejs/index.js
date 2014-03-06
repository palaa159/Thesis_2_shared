var fs = require('fs'),
	util = require('util'),
	// ipList = require('./ipList'),
	pcap = require('pcap'),
	ifconfig = 'en0',
	// ifconfig = 'wlan3', // wlan3 for pcDuino
	pcap_session = pcap.createSession(ifconfig, "tcp"),
	exec = require('child_process').exec,
	SerialPort = require("serialport").SerialPort,
	// ls /dev/tty.*
	sPort = "/dev/tty.usbmodem1421", 
	// sPort = "/dev/ttyACM0",
	arduino = new SerialPort(sPort, {
		baudrate: 9600
	});

var bytesToGoogle = 0,
	bytesToFacebook = 0,
	bytesTemp = 0,
	allBytes = 0;

arduino.on('open', function() {
	console.log(process.platform);
	util.log('open port for Arduino');
	forwardIp();
	// tcpdump();
});

arduino.on('error', function(err) {
	util.log('w00ps! ' + err);
});

function tcpdump() {
	pcap_session.on('packet', function(raw_packet) {
		var data, data_byte, dst_ip, dst_port, packet, src_ip, src_port;
		packet = pcap.decode.packet(raw_packet);
		src_ip = packet.link.ip.saddr;
		src_port = packet.link.ip.tcp.sport;
		dst_ip = packet.link.ip.daddr;
		dst_port = packet.link.ip.tcp.dport;
		data_byte = packet.link.ip.tcp.data_bytes;
		data = packet.link.ip.tcp.data;

		if (data_byte > 41) {
			var tempGoogle, tempFacebook = 0;
			if (dst_ip.match('173.194') || dst_ip.match('74.125')) { // google
				tempGoogle = data_byte;
				bytesToGoogle += tempGoogle;
				arduino.write('B' + -10 + 'E');
			}
			if (dst_ip.match('31.13') || dst_ip.match('173.252')) { // facebook
				tempFacebook = data_byte;
				bytesToFacebook += tempFacebook;
				arduino.write('B' + -20 + 'E');
			}
			allBytes = bytesToGoogle + bytesToFacebook;
			bytesTemp += tempGoogle + tempFacebook;
			if(bytesTemp >= 1024) {
				var round = Math.round(byteTemp/1024);
				// turn the motor in round number
				arduino.write('B' + round + 'E');
				util.log('motor turned ' + round*1.8 + ' degrees');
				bytesTemp = 0;
			}
		}

	});
}

function forwardIp() {
	// ubuntu
	util.log('ip forwarded!');
	util.log('ready to rock!');
}