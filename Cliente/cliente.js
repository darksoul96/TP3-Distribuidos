const http = require("http");
//const { request } = require("https");
const url = "http://localhost:8080";

/*const file = {
  id: null,
  filename: null,
  filesize: null,
  nodeIP: null,
  nodePort: null,
};*/


const request = http.request(url, { method: "POST" }, function (response) {
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


function cargaFile() {
  /*file.id = id;
  file.filename = filename;
  file.filesize = filesize;
  file.nodeIP = nodeIP;
  file.nodePort = nodePort;
  */
  fid = document.getElementById('fid').value;
  fname = document.getElementById('fname').value;
  fsize = document.getElementById('fsize').value;
  fnodeip = document.getElementById('fnodeip').value;
  fnodeport = document.getElementById('fnodeport').value;

  let file = {
    id: fid,
    filename: fname,
    filesize: fsize,
    nodeIP: fnodeip,
    nodePort: fnodeport,
  };
  /*let file = {
    id: 1,
    filename: 2,
    filesize: 3,
    nodeIP: 4,
    nodePort: 5,
  };*/

  request.write(JSON.stringify(file));
  request.end();
};




