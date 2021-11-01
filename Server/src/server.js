const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const dgram = require("dgram");
const client = dgram.createSocket("udp4");
const portcs = 8080; // Puerto del server en la comunicacion Cliente - Servidor
const portst = 8399; // Puerto del tracker en la comunicacion tracker - Servidor
const iptracker = "localhost"; //
const app = express();
const server = app.listen(portcs, () => {
  console.log("Server on");
});

client.bind({
  address: "localhost",
  port: 8081,
  excluse: true,
});

var trackerFileStore = {
  id: null,
  filename: "",
  filesize: 0,
  parIP: "",
  parPort: "",
};

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// INTERFAZ STORE FILE
app.post("/file/", (req, res) => {
  console.log("Recibe archivo: \n");
  console.log(req.body);
  loadFileStore(trackerFileStore, req.body);
  let body = JSON.stringify(trackerFileStore);
  let sendmsg = JSON.stringify({
    route: `/file/${trackerFileStore.id}/store`,
    body: body,
  });
  client.send(sendmsg, portst, iptracker, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error loading file: " + err.message);
    }
  });
  res.status(201).send("File Recieved");
  res.end();
});

//INTERFAZ SEARCH FILE
app.get("/file/:id", (req, res) => {
  console.log("Recibe solicitud de descarga archivo: \n");
  console.log(req.params.id);
  let sendmsg = JSON.stringify({
    messageId: "",
    route: `/file/${req.params.id}`, // En realidad es el hash, no el id.
    originIP: iptracker,
    originPort: portst,
  });
  client.send(sendmsg, portst, iptracker, (err, response) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error searching file: " + err.message);
      res.end();
      client.close();
    }
    response = JSON.parse(response);
  });
  client.on("message", (msg) => {
    console.log("Recibe respuesta de busqueda: \n");
    if (msg.toString() == "NOT_FOUND") {
      console.log("Archivo no encontrado");
      res.status(404).send("File not found");
      return res.end();
    } else {
      console.log(msg);
      let msgObj = JSON.parse(msg);
      if (msgObj.route.includes("found")) {
        res.status(201).send(msg);
        res.end();
      }
    }
  });
});

function loadFileStore(trackerFileStore, file) {
  trackerFileStore.filename = file.filename;
  trackerFileStore.filesize = file.filesize;
  trackerFileStore.parIP = file.nodeIP;
  trackerFileStore.parPort = file.nodePort;
  let hash = crypto.createHash("sha1");
  hash.update(file.filename + Math.round(file.filesize).toString());
  trackerFileStore.id = hash.digest("hex");
  console.log(trackerFileStore.id);
}
