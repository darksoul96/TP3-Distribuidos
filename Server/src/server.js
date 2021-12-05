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
  const client = dgram.createSocket("udp4");
  client.bind(() => {
    console.log(client.address());
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
  var sendmsg;
  const client = dgram.createSocket("udp4");

  client.bind(() => {});

  setTimeout(() => {
    sendmsg = JSON.stringify({
      messageId: "",
      route: "/scan",
      originIP: client.address().address,
      originPort: client.address().port,
      body: { files },
    });
    console.log(sendmsg);
  }, 100);

  setTimeout(() => {
    client.send(sendmsg, portst, iptracker, (err, response) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error searching file: " + err.message);
        res.end();
        client.close();
      }
      response = JSON.parse(response);
    });
  }, 200);

  //Mensajes desde el tracker al server de la lista de archivos
  client.on("message", (msg) => {
    console.log("Recibe respuesta de listar: \n");
    mensaje = JSON.parse(msg);
    console.log(mensaje);
    console.log(mensaje.body.files);
    //Si el mensaje es la respuesta del scan, tengo que devolverle la lista al cliente
    if (mensaje.route.includes("scan")) {
      let response = crearArrayResponse(mensaje.body.files);
      console.log("Lista de respuesta");
      console.log(response);
      res.status(200).send(JSON.stringify(response));
    }
  });
});

//INTERFAZ DE DESCARGA DE ARCHIVO
app.get("/file/:id", (req, res) => {
  console.log("Recibe solicitud de descarga de archivo: \n");

  const client = dgram.createSocket("udp4");
  client.bind(() => {});

  setTimeout(() => {
    sendmsg = JSON.stringify({
      //
      messageId: "",
      route: "/file/" + req.params.id,
      originIP: client.address().address,
      originPort: client.address().port,
      body: {},
    });
    //console.log(sendmsg);
  }, 100);
  setTimeout(() => {
    client.send(sendmsg, portst, iptracker, (err, response) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error searching file: " + err.message);
        res.end();
        client.close();
      }
      response = JSON.parse(response);
    });
  }, 200);

  client.on("message", (msg) => {
    console.log(
      "Recibe respuesta de descargar una vez encontrado el archivo: \n"
    );
    mensaje = JSON.parse(msg);
    console.log("MENSAJE DEL TRACKER AL SERVER: " + mensaje.body);
    //Si el mensaje es la respuesta del scan, tengo que devolverle la lista al cliente
    if (mensaje.route.includes("found")) {
      if (mensaje.body) {
        let response = {
          id: mensaje.body.id,
          trackerIP: mensaje.body.trackerIP,
          trackerPort: mensaje.body.trackerPort,
        };

        console.log("Archivo encontrado para descargar");
        console.log(response);
        res.status(200).send(response);
      } else {
        res.status(404).send("File not found");
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
