const fs = require("fs");
const dgram = require("dgram");
const parClient = dgram.createSocket("udp4");
const net = require("net");
const readline = require("readline");
process.stdin.setEncoding("utf8");

var localaddress, localport, id, archivo;

var pares;

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

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    console.log("Recibe pedido de descarga: " + data.toString());
    // let file = fs.readFileSync(data.toString(), "utf8");
    // console.log(file);
    // socket.write(file);
    //let file = fs.createReadStream(data.toString());
    //file.pipe(socket);
  });
  socket.on("end", () => {
    console.log("client disconnected");
  });
  socket.on("close", () => {
    console.log("connection closed");
  });
});

// Interfaz para solicitar el input del archivo torrente
rl.on("line", (input) => {
  switch (input) {
    case "exit":
      console.log("Cerrando el par: " + id);
      process.exit(0);
      break;
    case "id":
      console.log(`id: ${id}`);
      break;
    case "descargar":
      if (pares) {
        console.log("El archivo se encuentra en los siguientes pares: ");
        for (var i = 0; i < pares.length; i++) {
          console.log(
            "Par:" + i + " Direccion: " + pares[i].ip + ":" + pares[i].port
          );
        }
        eleccionPar();
      }
      break;
    default:
      fs.readFile(`${input}.torrente`, "utf8", (err, data) => {
        if (err) {
          console.error(err);
          console.log("Por favor, ingrese un archivo valido.");
          return;
        }
        archivo = input;
        data = JSON.parse(data);
        console.log(data);
        tracker.addressT = data.trackerIP;
        tracker.portT = data.trackerPort;
        console.log("Solicitando archivo " + input + ".torrente... ");
        solicitudTorrent(data.id);
      });

      break;
  }
});

function eleccionPar() {
  console.log(
    "================================================================================================"
  );
  var opcion = rl.question(
    "Ingrese el numero del par que desea descargar: ",
    function (opcion) {
      if (opcion >= 0 && opcion < pares.length) {
        console.log("El archivo se descargara del par: " + opcion);
        console.log(
          "Direccion: " + pares[opcion].ip + ":" + pares[opcion].port
        );
        solicitudDescarga(pares[opcion].ip, pares[opcion].port);
      } else {
        console.log("Por favor, ingrese un numero valido.");
        eleccionPar();
      }
    }
  );
}

function solicitudDescarga(ip, port) {
  console.log("Solicitando descarga del archivo...");
  const clientS = new net.Socket();
  clientS.connect(port, ip, () => {
    console.log("Connected to server");
    clientS.write(archivo);
  });
  clientS.on("data", (data) => {
    console.log("Recibiendo archivo...");
    //fs.createReadStream(archivo).pipe(fs.createWriteStream(archivo));
    fs.writeFile(archivo, data, (err) => {
      if (err) throw err;
      console.log("Archivo guardado");
    });
    console.log("Archivo descargado");
  });
  clientS.on("close", () => {
    console.log("Connection closed");
  });

  clientS.on("error", (err) => {
    console.log("No se pudo conectar con el par: " + err);
  });
}

function solicitudTorrent(id) {
  const client = dgram.createSocket("udp4");
  client.bind(() => {});
  setTimeout(() => {
    sendmsg = JSON.stringify({
      //
      messageId: "",
      route: "/file/" + id,
      originIP: client.address().address,
      originPort: client.address().port,
      body: {},
    });
  }, 100);
  setTimeout(() => {
    client.send(sendmsg, tracker.portT, tracker.addressT, (err, response) => {
      if (err) {
        res.status(500).send("Error searching file: " + err.message);
        res.end();
        client.close();
      }
      response = JSON.parse(response);
    });
  }, 200);
  client.on("message", (msg) => {
    mensaje = JSON.parse(msg);
    if (mensaje.route.includes("found")) {
      carga(mensaje.body.pares);
    }
  });
}

function carga(input) {
  console.log("Archivo encontrado...");
  console.log("Lista de pares que contienen el archivo... \n");
  pares = input;
  if (pares) {
    console.log(pares);
    console.log(
      "Inserte el nombre de otro archivo torrente o 'descargar' para descargar el archivo de alguno de los pares"
    );
    console.log(
      "================================================================================================"
    );
  } else {
    console.log(
      "El archivo no se encuentra en ningun par, inserte una nueva busqueda"
    );
  }
}

const initPar = async function () {
  console.log(
    "================================================================================================"
  );
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
  server.listen(localport, localaddress);
  console.log("Nodo: " + id);
  console.log("Direccion: " + localaddress);
  console.log("Puerto: " + localport);
  console.log(
    "================================================================================================"
  );
  parClient.bind({
    address: localaddress,
    port: localport,
    excluse: true,
  });
  console.log("Inserte el nombre del archivo torrente");
};

initPar();
