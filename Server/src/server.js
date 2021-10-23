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
  hash: "",
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

app.post("/", (req, res) => {
  loadFile(trackerFile, req.body);
  client.send(trackerFile, portst, "localhost", (err) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error loading file: " + err.message);
    }
    client.close();
  });
  res.status(201).send("File Recieved");
});

function loadFile(trackerFile, file) {
  trackerFile.filename = file.filename;
  trackerFile.filesize = file.filesize;
  trackerFile.nodeIP = file.nodeIP;
  trackerFile.nodePort = file.nodePort;
  trackerFile.hash = crypto.createHash("sha1");
  trackerFile.hash.update(file.filename + Math.round(file.filesize).toString());
  console.log(trackerFile.hash.digest("hex"));
}
