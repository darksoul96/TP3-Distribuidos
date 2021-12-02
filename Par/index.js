const fs = require("fs");
var nodos = JSON.parse(fs.readFileSync("./config/nodos_par.json", "utf8"))[
    "nodos"
];
var childProcess = require("child_process");

function runScript(scriptPath, args, callback) {
    // keep track of whether callback has been invoked to prevent multiple invocations
    var invoked = false;
    var process = childProcess.fork(scriptPath, args);
    // listen for errors as they may prevent the exit event from firing
    process.on("error", function (err) {
        if (invoked) return;
        invoked = true;
        callback(err);
    });
    // execute the callback once the process has finished running
    process.on("exit", function (code) {
        if (invoked) return;
        invoked = true;
        var err = code === 0 ? null : new Error("exit code " + code);
        callback(err);
    });
}

async function createPares() {
    for (var i = 0; i < nodos.length; i++) {
        await runScript(
            "./par.js",
            [nodos[i].id, nodos.length],
            function (err) {
                if (err) throw err;
            }
        );
        console.log("Par: " + nodos[i].id);
    }
    console.log("Finished loading pares");
}

createPares();