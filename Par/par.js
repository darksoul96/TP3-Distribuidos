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

// reads input from command line
const readInput = function () {
  process.stdin.setEncoding("utf8");
  process.stdin.on("readable", function () {
    var input = process.stdin.read();
    if (input !== null) {
      var instruction = input.toString().trim();
      switch (instruction) {
        case "download":
          console.log("Inserte el nombre del archivo");
          process.stdin.setEncoding("utf8");
          process.stdin.on("readable", function () {
            var input = process.stdin.read();
            if (input !== null) {
              var name = input.toString().trim();
              process.stdout.write("Downloading torrente: " + name + "\n");
              ejemeplo(name);
            }
          });
          break;
        default:
          process.stdout.write("Unknown command!\n");
          break;
      }
    }
  });
};

function ejemplo(nombre) {
  console.log("Bajando " + nombre);
  readInput();
}

initPar();
readInput();
