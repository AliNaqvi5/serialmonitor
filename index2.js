const {SerialPort} = require('serialport');
const { ReadlineParser} = require('@serialport/parser-readline')

// Replace 'COM3' with the appropriate serial port name for your system (e.g., '/dev/ttyUSB0' on Linux).
const portName = 'COM4';

const port = new SerialPort({
    path: portName,
    baudRate: 9600,
}); // Specify the baud rate for your device.

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }))
let receivedData = '';
port.on('open', () => {
    console.log(`Serial port ${portName} is open.`);
});
parser.on('data', (data) => {
    // Append the received data to the accumulated string
    receivedData += data;

    console.log("inside parser : ",data);
    // Check if the received data contains a complete message (e.g., terminated by a newline)
    if (receivedData.includes('\n')) {
        // Extract the complete message and process it (here, we're logging it)
        const completeMessage = receivedData.split('\n')[0];

        console.log(`Received data: ${completeMessage}`);
        // Clear the accumulated data for the next message
        receivedData = '';
    }
});
parser.on('error', (err) => {
    console.error(`Parser Error: ${err.message}`);
});
port.on('error', (err) => {
    console.error(`Error: ${err.message}`);
});

process.on('SIGINT', () => {
    port.close((err) => {
        if (err) {
            console.error('Error closing the port:', err.message);
        } else {
            console.log('Serial port closed.');
            process.exit(0);
        }
    });
});
