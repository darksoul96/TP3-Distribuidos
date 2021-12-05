const fs = require("fs");
const dgram = require("dgram");
const parClient = dgram.createSocket("udp4");
const args = process.argv;
const readline = require("readline");
process.stdin.setEncoding("utf8");

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

// Interfaz para solicitar el input del archivo torrente
rl.on("line", (input) => {
  // switch case for input
  switch (input) {
    case "exit":
      console.log("Cerrando el par: " + id);
      process.exit(0);
      break;
    case "id":
      console.log(`id: ${id}`);
      break;
    default:
      console.log("Descargando archivo..." + input);
      ejemplo(input);
      break;
  }
});

function ejemplo(input) {
  console.log("YA SE DESCARGO EL ARCHIVO PAPA");
  console.log("================================================");
  console.log("Inserte el nombre del archivo torrente");
}

var localaddress, localport, id;

var nodoDerecha = {
  addressD: null,
  portD: null,
};

var nodoIzquierda = {
  addressI: null,
  portI: null,
};

const initPar = async function () {
  var nodo = await JSON.parse(fs.readFileSync("./config_nodo.json", "utf8"))[
    "nodo"
  ];
  id = nodo.id;
  localaddress = nodo.address;
  localport = nodo.port;
  nodoDerecha.addressD = nodo.nodoDerecha.addressD;
  nodoDerecha.portD = nodo.nodoDerecha.portD;
  nodoIzquierda.addressI = nodo.nodoIzquierda.addressI;
  nodoIzquierda.portI = nodo.nodoIzquierda.portI;
  console.log("Nodo: " + id);
  console.log("Direccion: " + localaddress);
  console.log("Puerto: " + localport);
  console.log("Direccion derecha: " + nodoDerecha.addressD);
  console.log("Puerto derecha: " + nodoDerecha.portD);
  console.log("Direccion izquierda: " + nodoIzquierda.addressI);
  console.log("Puerto izquierda: " + nodoIzquierda.portI);

  console.log("================================================");
  parClient.bind({
    address: localaddress,
    port: localport,
    excluse: true,
  });
  console.log("================================================");
  console.log("Inserte el nombre del archivo torrente");
};

initPar();
