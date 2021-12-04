const fs = require("fs");
const dgram = require("dgram");
const parClient = dgram.createSocket("udp4");
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

const initPar = async function () {
    var nodos = await JSON.parse(
        fs.readFileSync("./config/nodos_par.json", "utf8")
    )["nodos"];
    let index = nodos.findIndex((nodo) => nodo.id == id);
    console.log("ADDRESS: " + nodos[index].address);
    localaddress = nodos[index].address;
    localport = nodos[index].port;
    nodoIzquierda = nodos[index].nodoIzquierda;
    nodoDerecha = nodos[index].nodoDerecha;

    console.log("ID: " + id);
    parClient.bind({
        address: localaddress,
        port: localport,
        excluse: true,
    });
};

initPar();

