const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
const axios = require('axios');
const port = new SerialPort({ path: 'COM4', baudRate: 9600 })

let LoggedIn = false;
let receivedData = '';
let sendData = [];

const sensorsId = {"temperature" : 1,"humidity":2,"lux" :3 ,"soilMoisture": 4,"rainStatus":5};
const sensorsUnit = {"temperature" : "Celsius","humidity":"%","lux" :"lux" ,"soilMoisture": "%","rainStatus":"NO Unit"};

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))
parser.on('data', (data) => {
    // Append the received data to the accumulated string
    // receivedData += "$$"+data;

    console.log("Data Received : ",data);
    if(!data.includes("Alarm")) {
        data = data.split(":");
        console.log("inside parser : ", sensorsId[data[0]]);
        sendData = {"sensor_id": sensorsId[data[0]], "value": data[1], "unit": sensorsUnit[data[0]], "location": "KHI"};
        sendDataApi(sendData);
    } else if(data.includes("Alarm"))
    {
        data = data.split("Alarm");
        data = data[1].split(":");
        console.log("Alarm : ", sensorsId[data[0]]);
        sendData = {"sensor_id": sensorsId[data[0]], "title": "Alarm"};
        sendDataApiAlarms(sendData);
    }
    // Check if the received data contains a complete message (e.g., terminated by a newline)

});

// 3|5KXPkp3z4AHPn1rQ7vxIDhpJhEREfa4ohh9djgeX

let headers = {
    'Authorization': 'Bearer 1|G0QgCo6oLKceUdkl5KzwVtXo2q63hwm2RGFREp6qeb4990a8',
    'Content-Type': 'application/json',
};
const apiUrl = 'http://127.0.0.1:8000/api/login';
const dataToSend = {
    email: 'alimir57@gmail.com',
    password: '12345',
};
axios.post(apiUrl, dataToSend, { headers })
    .then((response) => {
        console.log('Response:', response.data);
        if(((response.data).toString()).includes("successfully.")) {
            headers.Authorization ='Bearer '+response.data.data.token;
            LoggedIn = true;
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        LoggedIn = false;
    });

async function sendDataApi(dataToS) {
    try {
        const response = await axios.post("http://127.0.0.1:8000/api/data-store", dataToS, { headers });
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function sendDataApiAlarms(dataToS) {
    try {
        const response = await axios.post("http://127.0.0.1:8000/api/alarm-store", dataToS, { headers });
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error);
    }
}

// sendDataApi();
