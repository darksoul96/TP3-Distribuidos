const udp = require("dgram");
const fs = require("fs");
var ht = require("./utils/hashtable.js");
const dgram = require("dgram");
const trackerClient = udp.createSocket("udp4");
const process = require("process");
const args = process.argv;
const client = dgram.createSocket("udp4");
const cantidadTrackers = args[3];
const sizeDHT = 127;

var localaddress, localport, id, cantidadEntradadas;
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
        `Recibio el mensaje: ${msg} de la direccion: ${info.address} con puerto: ${info.port}`
    );
    let mensaje = JSON.parse(msg);
    let mensajeJson = JSON.parse(mensaje.body);
    let mensajeRuta = mensaje.route.toString();
    if (mensajeRuta.includes("/store") && mensajeRuta.includes("/file")) {
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
        }
        else
            console.log(ht.list());
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
