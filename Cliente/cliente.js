const http = require("http");
const url = "http://localhost:8080";

const file = {
  id,
  filename,
  filesize,
  nodeIP,
  nodePort,
};

const cargaFile = function (id, filename, filesize, nodeIP, nodePort) {
  file[id] = id;
  file[filename] = filename;
  file[filesize] = filesize;
  file[nodeIP] = nodeIP;
  file[nodePort] = nodePORT;
  altaArchivo();
};

const altaArchivo = http.get(url, { method: "POST" }, function (response) {
  let body = file;
  response.on("data", function (chunk) {
    body += chunk;
  });
  response.on("end", function () {
    console.log(body);
  });
  response.on("close", () => {
    console.log("Connection closed!");
  });
});

cargaFile(1, 2, 3, 4, 5);
