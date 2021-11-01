const dgram = require("dgram");
const fs = require("fs");
var ht = require("./utils/hashtable.js");
const trackerClient = dgram.createSocket("udp4");
const process = require("process");
const args = process.argv;
const client = dgram.createSocket("udp4");
const cantidadTrackers = args[3];
const sizeDHT = 127;

var localaddress, localport, id;
const datosServer = {
  address: "127.0.0.1",
  port: 8081,
};

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

function setDomain() {
  let div = Math.floor(sizeDHT / cantidadTrackers);
  if (id != cantidadTrackers) {
    let inicio = id - 1 * div;
    let fin = id * div;
    ht.setDomain(inicio, fin);
  } else {
    let inicio = id - 1 * div;
    ht.setDomain(inicio, sizeDHT);
  }
}

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
  setDomain();
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

trackerClient.on("message", (msg, info) => {
  console.log(
    `Tracker: ${id} recibio el mensaje: ${msg} de la direccion: ${info.address} con puerto: ${info.port}`
  );
  let mensaje = JSON.parse(msg);
  let mensajeRuta = mensaje.route.toString();
  //INTERFAZ STORE tracker-tracker
  if (mensajeRuta.includes("/store") && mensajeRuta.includes("/file")) {
    let mensajeJson = JSON.parse(mensaje.body);
    let arrayInfo = {
      filename: mensajeJson.filename,
      size: mensajeJson.filesize,
      par: { ip: mensajeJson.parIP, port: mensajeJson.parPort },
    };
    if (!ht.set(mensajeJson.id, arrayInfo)) {
      console.log("No entro");
      client.send(msg, nodoDerecha.portD, nodoDerecha.addressD, (err) => {
        if (err) {
          console.log(err);
          res.status(500).send("Error loading file: " + err.message);
        }
      });
    } else console.log(ht.list());
  }
  //INTERFAZ SEARCH
  if (mensajeRuta.includes("/file/") && !mensajeRuta.includes("store")) {
    console.log("entra a buscar");
    //access hash of route
    let hash = mensajeRuta.slice(6);
    console.log(hash);
    console.log(ht.get(hash));
    let arrayInfo = ht.get(hash); //Asumo que id es el Hash del archivo
    if (arrayInfo != null) {
      let bodyArchivo = {
        //el mensaje de respuesta es con lo que se va a armar el .torrente
        filename: arrayInfo.filename, //hay que ver si pasamos el "id" o el name y size (posible modificacion)
        filesize: arrayInfo.size,
        trackerIP: localaddress, //se pasa el ip del tracker actual
        trackerPort: localport, //se pasa el puerto del tracker actual
      };
      let body = JSON.stringify(bodyArchivo);
      let mensajeRespuestaJson = JSON.stringify({
        messageId: "",
        route: `/file/${hash}/found`,
        body: body,
      });
      client.send(
        mensajeRespuestaJson,
        datosServer.port,
        datosServer.address,
        (err) => {
          if (err) {
            console.log(err);
            res.status(500).send("Error loading file: " + err.message);
          }
        }
      );
    } else {
      console.log(info.address);
      console.log(datosServer.address);
      console.log(info.address === datosServer.address);
      console.log(
        info.address === datosServer.address && info.port === datosServer.port
      );
      if (
        (info.address === datosServer.address &&
          info.port === datosServer.port) ||
        (localaddress != mensaje.originIP && localport != mensaje.originPort)
      ) {
        console.log(`No lo encontró en el tracker ${id}, lo pasa al siguiente`);
        client.send(msg, nodoDerecha.portD, nodoDerecha.addressD, (err) => {
          if (err) {
            console.log(err);
            res.status(500).send("Error loading file: " + err.message);
          }
        });
      } else {
        console.log("No lo encontró en ningun tracker");
        client.send(
          "NOT_FOUND",
          datosServer.port,
          datosServer.address,
          (err) => {
            if (err) {
              console.log(err);
              res.status(500).send("Error loading file: " + err.message);
            }
          }
        );
      }
    }
  }
});

//   if (entraEstaTabla()) {
//     let arrayInfo = {
//       filename: msgstr.filename,
//       size: msgstr.filesize,
//       par: { ip: msgstr.nodeIP, port: msgstr.nodePort },
//     };
//     ht.set(msgstr.hash, arrayInfo);
//   } else {
//     client.send(
//       JSON.stringify(`/file/${msgstr.id}/store` + msg),
//       msg.nodoDerecha.portD,
//       msg.nodoDerecha.addressD,
//       (err) => {
//         if (err) {
//           console.log(err);
//           res.status(500).send("Error loading file: " + err.message);
//         }
//       }
//     );
//   }
//   //console.log(ht.get(msg.hash));
//   console.log(ht.list());

// trackerClient.on("message", (msg, info) => {
//   msgstr = JSON.parse(msg);
//   if (msgstr[2] != id) {
//     msgstr[0] += ht.getSize();
//     msgstr[1] += 1;
//     client.send(
//       "/count",
//       JSON.stringify(msgstr),
//       nodoDerecha.portD,
//       nodoDerecha.addressD,
//       (err) => {
//         if (err) {
//           console.log(err);
//           res.status(500).send("Error loading file: " + err.message);
//         }
//       }
//     );
//   }
// });

// var count = (cantidad, nodoDerecha) => {
//   client.send(
//     JSON.stringify(cantidad),
//     nodoDerecha.portD,
//     nodoDerecha.addressD,
//     (err) => {
//       if (err) {
//         console.log(err);
//         res.status(500).send("Error loading file: " + err.message);
//       }
//     }
//   );
// };
