const dgram = require("dgram");
const fs = require("fs");
var ht = require("./utils/hashtable.js");
const trackerClient = dgram.createSocket("udp4");
const process = require("process");
const args = process.argv;
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
    `Tracker: ${id} recibio un mensaje de la direccion: ${info.address} con puerto: ${info.port}`
  );
  let mensaje = JSON.parse(msg);
  let mensajeRuta = mensaje.route.toString();
  datosServer = {
    address: mensaje.originIP,
    port: mensaje.originPort,
  };

  //INTERFAZ STORE tracker-tracker
  if (mensajeRuta.includes("/store") && mensajeRuta.includes("/file")) {
    let mensajeJson = mensaje.body;
    let arrayInfo = {
      id: mensajeJson.id,
      filename: mensajeJson.filename,
      filesize: mensajeJson.filesize,
      pares: mensajeJson.pares,
    };
    if (!ht.get(mensajeJson.id)) {
      if (!ht.set(mensajeJson.id, arrayInfo)) {
        trackerClient.send(
          msg,
          nodoDerecha.portD,
          nodoDerecha.addressD,
          (err) => {
            if (err) {
              console.log(err);
            }
          }
        );
      } else {
        console.log(
          "Se guardo el elemento " + mensajeJson.filename + " en la tabla"
        );
      }
    } else {
      let valorTabla = ht.get(mensajeJson.id)[1];
      if (!noPertPares(valorTabla.pares, mensajeJson.pares)) {
        console.log("Ya existe el par");
      } else {
        ht.remove(mensajeJson.id);
        valorTabla.pares.push({
          parIP: mensajeJson.pares[0].parIP,
          parPort: mensajeJson.pares[0].parPort,
        });
        ht.set(mensajeJson.id, valorTabla);
        console.log("Se actualizo la lista de los pares:\n");
        console.log(valorTabla.pares);
      }
    }
  }

  //INTERFAZ SCAN
  if (mensajeRuta.includes("/scan")) {
    //tengo messageId, route, originIp, originPort, body(files[])
    var arrayArchivos = [];
    arrayArchivos = mensaje.body.files;
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
      id == 1 &&
      info.address == nodoIzquierda.addressI &&
      info.port == nodoIzquierda.portI
    ) {
      //si es el tracker que envio el mensaje, devuelvo la respuesta al server
      trackerClient.send(
        JSON.stringify(mensajeEnviar),
        datosServer.port,
        datosServer.address,
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
    } else {
      // le envio al nodo derecho
      trackerClient.send(
        JSON.stringify(mensajeEnviar),
        nodoDerecha.portD,
        nodoDerecha.addressD,
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
    }
  }

  // INTERFAZ SEARCH
  if (
    mensajeRuta.includes("/file/") &&
    !mensajeRuta.includes("/store") &&
    !mensajeRuta.includes("/scan")
  ) {
    let hash = mensajeRuta.split("/")[2];
    // Si el archivo se encuentra en este tracker
    let pares = [];
    if (ht.get(hash)) {
      let mensajeEnviar = {
        messageId: mensaje.messageId,
        route: mensaje.route + "/found",
        originIp: mensaje.originIp,
        originPort: mensaje.originPort,
        body: {
          id: ht.get(hash)[0],
          filename: ht.get(hash)[1].filename,
          filesize: ht.get(hash)[1].filesize,
          trackerIP: localaddress,
          trackerPort: localport,
          pares: ht.get(hash)[1].pares,
        },
      };
      trackerClient.send(
        JSON.stringify(mensajeEnviar),
        datosServer.port,
        datosServer.address,
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
    } else {
      if (
        //Si el archivo no se encuentra en ningun tracker, envio error 404
        id == 1 &&
        info.address == nodoIzquierda.addressI &&
        info.port == nodoIzquierda.portI
      ) {
        console.log("File not found");
        trackerClient.send(
          JSON.stringify({
            messageId: mensaje.messageId,
            route: mensaje.route + "/found",
            originIp: mensaje.originIp,
            originPort: mensaje.originPort,
            body: {},
          }),
          datosServer.port,
          datosServer.address,
          (err) => {
            if (err) {
              console.log(err);
            }
          }
        );
      } else {
        // Si el archivo no se encuentra en este tracker, se lo envio al nodo derecho
        trackerClient.send(
          JSON.stringify(mensaje),
          nodoDerecha.portD,
          nodoDerecha.addressD,
          (err) => {
            if (err) {
              console.log(err);
            }
          }
        );
      }
    }
  }

  //INTERFAZ COUNT
  if (mensajeRuta.includes("/count")) {
    let cantidadArchivosLocales = ht.getSize();

    //Si la request le llega al primer tracker, inicializo los contadores y los envio al siguiente tracker
    if (
      id == 1 &&
      info.address == datosServer.address &&
      info.port == datosServer.port
    ) {
      let mensajeEnviar = {
        messageId: mensaje.messageId,
        route: mensaje.route,
        body: {
          trackerCount: cantidadTrackers,
          fileCount: cantidadArchivosLocales,
        },
      };

      trackerClient.send(
        JSON.stringify(mensajeEnviar),
        nodoDerecha.portD,
        nodoDerecha.addressD,
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
    } else if (
      //Devuelvo la request al server
      id == 1 &&
      info.address == nodoIzquierda.addressI &&
      info.port == nodoIzquierda.portI
    ) {
      let mensajeEnviar = {
        messageId: mensaje.messageId,
        route: mensaje.route,
        body: {
          trackerCount: mensaje.body.trackerCount,
          fileCount: mensaje.body.fileCount,
        },
      };

      trackerClient.send(
        JSON.stringify(mensajeEnviar),
        datosServer.port,
        datosServer.address,
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
    } else {
      // le envio al nodo derecho para que siga contando

      let mensajeEnviar = {
        messageId: mensaje.messageId,
        route: mensaje.route,
        body: {
          trackerCount: mensaje.body.trackerCount,
          fileCount: mensaje.body.fileCount + cantidadArchivosLocales,
        },
      };

      trackerClient.send(
        JSON.stringify(mensajeEnviar),
        nodoDerecha.portD,
        nodoDerecha.addressD,
        (err) => {
          if (err) {
            console.log(err);
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
      if (arrayTabla[i] && noPert(array, arrayTabla[i][1])) {
        array.push(arrayTabla[i][1]);
      }
    }
  }
};

noPertPares = (array, elemento) => {
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < elemento.length; j++) {
      if (
        array[i].parIP == elemento[j].parIP &&
        array[i].parPort == elemento[j].parPort
      ) {
        return false;
      }
    }
  }
  return true;
};

noPert = (array, elemento) => {
  for (let i = 0; i < array.length; i++) {
    if (array[i].filename == elemento.filename) return false;
  }
  return true;
};

function enviarUDP(mensaje, port, address) {
  trackerClient.send(JSON.stringify(mensaje), port, address, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error loading file: " + err.message);
    }
  });
}
