const fs = require("fs");
const dgram = require("dgram");
const parClient = dgram.createSocket("udp4");
const args = process.argv;
const readline = require("readline");
process.stdin.setEncoding("utf8");

var localaddress, localport, id;

var nodoDerecha = {
  addressD: null,
  portD: null,
};

var nodoIzquierda = {
  addressI: null,
  portI: null,
};

var tracker = {
  addressT: null,
  portT: null,
};

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
    case "add":
      break;
    default:
      console.log("Descargando archivo..." + input);

      solicitudTorrent(input);
      ejemplo(input);
      break;
  }
});

function solicitudTorrent(nombreArchivo) {
  const client = dgram.createSocket("udp4");
  client.bind(() => {});
  setTimeout(() => {
    sendmsg = JSON.stringify({
      //
      messageId: "",
      route: "/file/" + req.params.id,
      originIP: client.address().address,
      originPort: client.address().port,
      body: {},
    });
  }, 100);
  setTimeout(() => {
    client.send(sendmsg, tracker.portT, tracker.addressT, (err, response) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error searching file: " + err.message);
        res.end();
        client.close();
      }
      response = JSON.parse(response);
    });
  }, 200);
  client.on("message", (msg) => {
    console.log(
      "Recibe respuesta de descargar una vez encontrado el archivo: \n"
    );
    mensaje = JSON.parse(msg);
    console.log("MENSAJE DEL TRACKER AL SERVER: " + mensaje.body);
    //Si el mensaje es la respuesta del scan, tengo que devolverle la lista al cliente
    if (mensaje.route.includes("found")) {
      let response = {
        id: mensaje.body.id,
        trackerIP: mensaje.body.trackerIP,
        trackerPort: mensaje.body.trackerPort,
      };

      console.log("Archivo encontrado para descargar");
      console.log(response);
      res.status(200).send(response);
    }
  });
}

function ejemplo(input) {
  console.log("YA SE DESCARGO EL ARCHIVO PAPA");
  console.log("================================================");
  console.log("Inserte el nombre del archivo torrente");
}

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
