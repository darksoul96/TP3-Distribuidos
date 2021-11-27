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

var datosServer = {
  address: "",
  port: 0,
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
  datosServer = {
    address: mensaje.originIP,
    port: mensaje.originPort,
  };

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
    //ESTA ES LA PARTE QUE NO ANDA -------------------------
    //tengo messageId, route, originIp, originPort, body(files[])
    console.log("Entra al scan");
    var arrayArchivos = [];
    arrayArchivos = mensaje.body.files;
    console.log(
      "MUESTRO EL ARRAY ARCHIVOS QUE LE LLEGA AL TRACKER NUMERO " + id
    );
    console.log(arrayArchivos);
    appendElementos(arrayArchivos);
    files = arrayArchivos;
    let mensajeEnviar = {
      messageId: mensaje.messageId,
      route: mensaje.route,
      originIp: mensaje.originIp,
      originPort: mensaje.originPort,
      body: { files },
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
  if (arrayTabla) {
    for (let i = 0; i < arrayTabla.length; i++) {
      if (arrayTabla[i]) {
        array.push(arrayTabla[i][1]);
      }
    }
  }
};
