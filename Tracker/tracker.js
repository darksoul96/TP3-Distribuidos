const udp = require("dgram");
const ht = require("./utils/hashtable.js");
const trackerClient = udp.createSocket("udp4");

trackerClient.bind({
  address: "localhost",
  port: "8399",
  exclusive: true,
});

var hashEntry = {
  hash: "",
  fileName: "",
  filesize: null,
  nodeIP: "",
  nodePort: null,
};

trackerClient.on("message", (msg, info) => {
  console.log(
    `Recibio el mensaje: ${msg} de la direccion: ${info.address} con puerto: ${info.port}`
  );

  loadEntry(hashEntry, msg, info);
  let arrayInfo = {
    filename: hashEntry.fileName,
    size: hash.hashEntry.size,
    par: { ip: hashEntry.nodeIP, port: hashEntry.nodePort },
  };
  ht.set(hash, arrayInfo);
});

function loadEntry(hashEntry, msg, info) {
  hashEntry.hash = msg.body.hash;
  hashEntry.fileName = msg.body.fileName;
  hashEntry.size = msg.body.filesize;
  hashEntry.nodeIP = info.address;
  hashEntry.nodePort = info.port;
}

trackerClient.on("listening", () => {
  let address = trackerClient.address();
  console.log(`Tracker escuchando en ${address.address}:${address.port}...`);
});
