const https = require('https');
const url = 'http://localhost:8080';

const file = {
    body:{
        filename,
        filesize,
        nodeIP,
        nodePort,
    }
}


const request = http.get(url, {method: 'POST'}, function(response) {
    let body = file.body;
});