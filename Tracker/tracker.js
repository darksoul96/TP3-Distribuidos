const dgram = require("dgram");
const fs = require("fs");
var ht = require("./utils/hashtable.js");
const trackerClient = dgram.createSocket("udp4");
const process = require("process");
const args = process.argv;
const client = dgram.createSocket("udp4");
const cantidadTrackers = args[3];
const sizeDHT = 127;

var localaddress, localport, id;
const datosServer = {
  address: "127.0.0.1",
  port: 8081,
};

var nodoDerecha = {
  addressD: null,
  portD: null,
};

var nodoIzquierda = {
  addressI: null,
  portI: null,
};

if (args.length > 2) id = args[2];
else id = 1;

function setDomain() {
  let div = Math.floor(sizeDHT / cantidadTrackers);
  if (id != cantidadTrackers) {
    let inicio = id - 1 * div;
    let fin = id * div;
    ht.setDomain(inicio, fin);
  } else {
    let inicio = id - 1 * div;
    ht.setDomain(inicio, sizeDHT);
  }
}

const initTracker = async function () {
  var nodos = await JSON.parse(
    fs.readFileSync("./config/nodos_tracker.json", "utf8")
  )["nodos"];
  let index = nodos.findIndex((nodo) => nodo.id == id);
  console.log("ADDRESS: " + nodos[index].address);
  localaddress = nodos[index].address;
  localport = nodos[index].port;
  nodoIzquierda = nodos[index].nodoIzquierda;
  nodoDerecha = nodos[index].nodoDerecha;
  setDomain();
  console.log("ID: " + id);
  trackerClient.bind({
    address: localaddress,
    port: localport,
    excluse: true,
  });
  //var arraycantidad = [0, 0, id];
  //count(arraycantidad, nodoDerecha); //paso un array donde llevo el id inicial y 2 valores que sumo
  //cantidadEntradadas = Math.round(arraycantidad[0] / arraycantidad[1]);
  //console.log(cantidadEntradadas);
};

initTracker();

trackerClient.on("listening", () => {
  let address = trackerClient.address();
  console.log(`Tracker escuchando en ${address.address}:${address.port}...`);
});

trackerClient.on("message", (msg, info) => {
  console.log(
    `Tracker: ${id} recibio el mensaje: ${msg} de la direccion: ${info.address} con puerto: ${info.port}`
  );
  let mensaje = JSON.parse(msg);
  let mensajeRuta = mensaje.route.toString();
  //INTERFAZ STORE tracker-tracker
  if (mensajeRuta.includes("/store") && mensajeRuta.includes("/file")) {
    let mensajeJson = JSON.parse(mensaje.body);
    let arrayInfo = {
      filename: mensajeJson.filename,
      size: mensajeJson.filesize,
      par: { ip: mensajeJson.parIP, port: mensajeJson.parPort },
    };
    if (!ht.set(mensajeJson.id, arrayInfo)) {
      console.log("No entro");
      client.send(msg, nodoDerecha.portD, nodoDerecha.addressD, (err) => {
        if (err) {
          console.log(err);
          res.status(500).send("Error loading file: " + err.message);
        }
      });
    } else console.log(ht.list());
  }
  //INTERFAZ SCAN
  if (mensajeRuta.includes("/scan")) {
    //tengo messageId, route, originIp, originPort, body(files[])

    console.log("Entra al scan");
    let arrayArchivos = mensaje.body;
    console.log(arrayArchivos);
    appendElementos(arrayArchivos);
    files = arrayArchivos;
    let mensajeEnviar = {
      messageId: mensaje.messageId,
      route: mensaje.route,
      originIp: mensaje.originIp,
      originPort: mensaje.originPort,
      body: files,
    };

    if (
      (mensaje.originIp != localaddress &&
        mensaje.originPort != localport &&
        info.port != datosServer.port) ||
      info.port == datosServer.port
    ) {
      client.send(
        JSON.stringify(mensajeEnviar),
        nodoDerecha.portD,
        nodoDerecha.addressD,
        (err) => {
          if (err) {
            console.log(err);
            res.status(500).send("Error loading file: " + err.message);
          }
        }
      );
    } else {
      //si es el tracker que envio el mensaje, devuelvo la respuesta al server
      client.send(
        JSON.stringify(mensajeEnviar),
        datosServer.port,
        datosServer.address,
        (err) => {
          if (err) {
            console.log(err);
            res.status(500).send("Error loading file: " + err.message);
          }
        }
      );
    }
  }
});

const appendElementos = (array) => {
  let arrayTabla = ht.list();
  for (let i = 0; i < arrayTabla.length; i++) {
    if (arrayTabla[i] != null) {
      array.push(arrayTabla[i]);
    }
  }
};
