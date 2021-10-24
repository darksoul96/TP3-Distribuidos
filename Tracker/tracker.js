const udp = require("dgram");
const fs = require("fs");
var ht = require("./utils/hashtable.js");
const trackerClient = udp.createSocket("udp4");
const process = require("process");
const args = process.argv;

var localaddress, localport, id;
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
  ht.loadTable(nodos[index].tablaHash);
  ht.setSize(nodos[index].sizeTabla);
  nodoIzquierda = nodos[index].nodoIzquierda;
  nodoDerecha = nodos[index].nodoDerecha;
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

var hashEntry = {
  hash: null,
  fileName: null,
  filesize: null,
  nodeIP: "",
  nodePort: null,
};

var cantidadNodosArchivos = [0, 0];

trackerClient.on("message", (msg, info) => {
  console.log(
    `Recibio el mensaje: ${msg} de la direccion: ${info.address} con puerto: ${info.port}`
  );
  msg = JSON.parse(msg);
  loadEntry(hashEntry, msg);
  let arrayInfo = {
    filename: hashEntry.fileName,
    size: hashEntry.size,
    par: { ip: hashEntry.nodeIP, port: hashEntry.nodePort },
  };
  ht.set(msg.hash, arrayInfo);
  //console.log(ht.get(msg.hash));
  console.log(ht.list());
});

function loadEntry(hashEntry, msg) {
  hashEntry.hash = msg.hash;
  hashEntry.fileName = msg.filename;
  hashEntry.size = msg.filesize;
  hashEntry.nodeIP = msg.nodeIP;
  hashEntry.nodePort = msg.nodePort;
}
