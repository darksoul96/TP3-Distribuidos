const udp = require("dgram");
const ht = require("./utils/hashtable.js");
const trackerClient = udp.createSocket("udp4");
const process = require("process");
const args = process.argv;

trackerClient.bind({
    address: args[2],
    port: args[3],
    exclusive: true,
});

var hashEntry = {
    hash: null,
    fileName: null,
    filesize: null,
    nodeIP: "",
    nodePort: null,
};

var nodoDerecha = {
    addressD = null,
    portD = null
}

var nodoIzquierda = {
    addressI = null,
    portI = null
}

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

trackerClient.on("listening", () => {
    let address = trackerClient.address();
    console.log(`Tracker escuchando en ${address.address}:${address.port}...`);
});

