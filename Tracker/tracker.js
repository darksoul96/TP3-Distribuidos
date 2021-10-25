const udp = require("dgram");
const fs = require("fs");
var ht = require("./utils/hashtable.js");
const dgram = require("dgram");
const trackerClient = udp.createSocket("udp4");
const process = require("process");
const args = process.argv;
1;
const client = dgram.createSocket("udp4");

var localaddress, localport, id, cantidadEntradadas;
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

/*
var hashEntry = {
    hash: null,
    fileName: null,
    filesize: null,
    nodeIP: "",
    nodePort: null,
};*/

//var cantidadNodosArchivos = [0, 0];

trackerClient.on("/file/${id}/store", (msg, info) => {
  console.log(
    `Recibio el mensaje: ${msg} de la direccion: ${info.address} con puerto: ${info.port}`
  );
  msgstr = JSON.parse(msg);

  if (entraEstaTabla()) {
    let arrayInfo = {
      filename: msgstr.filename,
      size: msgstr.filesize,
      par: { ip: msgstr.nodeIP, port: msgstr.nodePort },
    };
    ht.set(msgstr.hash, arrayInfo);
  } else {
    client.send(
      "/file/${id}/store",
      JSON.stringify(msg),
      msg.nodoDerecha.portD,
      msg.nodoDerecha.addressD,
      (err) => {
        if (err) {
          console.log(err);
          res.status(500).send("Error loading file: " + err.message);
        }
      }
    );
  }
  //console.log(ht.get(msg.hash));
  console.log(ht.list());
});

/*
trackerClient.on("/count", (msg, info) => {
    msgstr = JSON.parse(msg);
    if (msgstr[2] != id) {
        msgstr[0] += ht.getSize();
        msgstr[1] += 1;
        client.send("/count", JSON.stringify(msgstr), nodoDerecha.portD, nodoDerecha.addressD, (err) => {
            if (err) {
                console.log(err);
                res.status(500).send("Error loading file: " + err.message);
            }
        });
    }
});
*/
/*
var entraEstaTabla = () => {
    (ht.getSize() <= cantidadEntradadas) ? true : false;
}

var count = (cantidad, nodoDerecha) => {
    client.send(/"/count", JSON.stringify(cantidad), nodoDerecha.portD, nodoDerecha.addressD, (err) => {
        if (err) {
            console.log(err);
            res.status(500).send("Error loading file: " + err.message);
        }
    });
}
*/
/*
function loadEntry(hashEntry, msg) {
    hashEntry.hash = msg.hash;
    hashEntry.fileName = msg.filename;
    hashEntry.size = msg.filesize;
    hashEntry.nodeIP = msg.nodeIP;
    hashEntry.nodePort = msg.nodePort;
}
*/
