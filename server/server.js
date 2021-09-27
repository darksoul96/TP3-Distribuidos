const http = require('http');
const port;

const file = {
    filename,
    filesize,
    nodeIP,
    nodePort,
}

const server = http.createServer((request, response) => {

    request.on('data', (chunk) => {
        file = chunk;
    });

    request.on('end', () => {
        console.log(file)
    });
});

server.listen(port, () => {
    console.log('Server on');
});