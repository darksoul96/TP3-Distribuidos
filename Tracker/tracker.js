const udp = require("dgram");
const ht = require("./utils/hashtable.js");
const trackerClient = udp.createSocket("udp4");

trackerClient.bind({
  address: "localhost",
  port: "8399",
  exclusive: true,
});

var hashEntry = {
  hash: null,
  fileName: null,
  filesize: null,
  nodeIP: "",
  nodePort: null,
};

trackerClient.on("message", (msg, info) => {
  console.log(
    `Recibio el mensaje: ${msg} de la direccion: ${info.address} con puerto: ${info.port}`
  );
  msg = JSON.parse(msg);
  loadEntry(hashEntry, msg);
  console.log(hashEntry.fileName);
  let arrayInfo = {
    filename: hashEntry.fileName,
    size: hashEntry.size,
    par: { ip: hashEntry.nodeIP, port: hashEntry.nodePort },
  };
  ht.set(msg.hash, arrayInfo);
  console.log(ht.get(msg.hash));
});

function loadEntry(hashEntry, msg) {
  hashEntry.hash = msg.hash;
  hashEntry.fileName = msg.filename;
  hashEntry.size = msg.filesize;
  hashEntry.nodeIP = msg.nodeIP;
  hashEntry.nodePort = msg.nodePort;
}

trackerClient.on("listening", () => {
  let address = trackerClient.address();
  console.log(`Tracker escuchando en ${address.address}:${address.port}...`);
});
