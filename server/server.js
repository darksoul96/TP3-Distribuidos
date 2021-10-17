const http = require("http");
const port = 8080;



const server = http.createServer((request) => {
    console.log("Connected!");

    //if (request.method == 'POST') {
    var body;
    request.on('data', function (data) {
        body = data;
        console.log('Hello!!!');
    });

    request.on('end', function () {
        console.log(JSON.parse(body));
        // use post['blah'], etc.
    });

    /*
    //if (request.method === "POST") {
    request.on("data", (chunk) => {
        console.log(JSON.parse('Hello!'));
    });
    //}

    request.on("end", () => {
        console.log("Server Recieved : ");
    });

    request.on("close", () => {
        console.log("Connection closed");
    });*/
    //}
});

server.listen(port, () => {
    console.log('Server on');
});