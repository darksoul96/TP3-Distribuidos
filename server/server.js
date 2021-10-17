const http = require("http");
const port = 8080;

const file = {
  id: null,
  filename: null,
  filesize: null,
  nodeIP: null,
  nodePort: null,
};

const server = http.createServer((request, response) => {
  console.log("Connected!");

  if (request.method === "POST") {
    request.on("data", (chunk) => {
      console.log(JSON.parse(chunk));
    });
  }

  request.on("end", () => {
    console.log("Server Recieved : ");
  });

  request.on("close", () => {
    console.log("Connection closed");
  });
});

server.listen(port, () => {
  console.log("Server on");
});
