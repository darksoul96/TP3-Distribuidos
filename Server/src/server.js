const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const dgram = require("dgram");
const client = dgram.createSocket("udp4");
const portcs = 8080;
const portst = 8399;
const app = express();
const server = app.listen(portcs, () => {
  console.log("Server on");
});

var trackerFile = {
  hash: null,
  filename: "",
  filesize: 0,
  nodeIP: "",
  nodePort: "",
};

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/file/", (req, res) => {
  console.log("Recibe archivo: \n");
  console.log(req.body);
  loadFile(trackerFile, req.body);
  client.send(JSON.stringify(trackerFile), portst, "localhost", (err) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error loading file: " + err.message);
    }
  });
  res.status(201).send("File Recieved");
  res.end();
});

function loadFile(trackerFile, file) {
  trackerFile.filename = file.filename;
  trackerFile.filesize = file.filesize;
  trackerFile.nodeIP = file.nodeIP;
  trackerFile.nodePort = file.nodePort;
  let hash = crypto.createHash("sha1");
  hash.update(file.filename + Math.round(file.filesize).toString());
  trackerFile.hash = hash.digest("hex");
}
