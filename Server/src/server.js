const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const dgram = require("dgram");
const portcs = 8080; // Puerto del server en la comunicacion Cliente - Servidor
const portst = 8399; // Puerto del tracker en la comunicacion tracker - Servidor
const iptracker = "localhost"; //
const app = express();
const server = app.listen(portcs, () => {
  console.log("Server on");
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
      return res.status(500).send("Error loading file: " + err.message);
    }
  });
  return res.status(201).send("File Recieved");
  //res.end();
});

//INTERFAZ LISTAR FILE - Va a triggerear un scan entre los nodos tracker
app.get("/file", (req, res) => {
  console.log("Recibe solicitud de listar todos los archivos: \n"); //aca llega el request

  let files = [];

  let sendmsg = JSON.stringify({
    messageId: "",
    route: "/scan",
    originIP: iptracker,
    originPort: portst,
    body: files,
  });
  const client = dgram.createSocket("udp4");
  client.bind(() => {
    console.log(client.address());
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
  let any = Math.random();
  client.on("message", (msg) => {
    console.log("Recibe respuesta de listar: \n");
    console.log(any);
    mensaje = JSON.parse(msg);
    console.log(mensaje);
    if (mensaje.route.includes("scan")) {
      let listaDescargas = mensaje.body;
      let response = crearArrayResponse(listaDescargas);
      //res.send(JSON.stringify(response)); //convierto la lista a string para poder enviarla
      //res.status(200).send(JSON.stringify(json));
    }
  });
  /*Me armo un json asi nomas para ver si lo recibe*/
  let json = {
    messageId: "",
    route: "/scan",
    originIP: iptracker,
    originPort: portst,
    body: [
      {
        id: "1",
      },
      {
        id: "2",
      },
    ],
  };
  res.status(200).send(JSON.stringify(json));
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

const crearArrayResponse = (listaDescargas) => {
  //Se usa para crear un array sólo con la info necesaria
  let response = [];
  for (let i = 0; i < listaDescargas.length; i++) {
    let file = {
      id: listaDescargas[i].id,
      filename: listaDescargas[i].filename,
      filesize: listaDescargas[i].filesize,
    };
    response.push(file);
  }

  return response;
};
