const url = "http://localhost:8080";

var files = [];

const cargaFile = () => {
  fname = document.getElementById("fname").value;
  fsize = document.getElementById("fsize").value;
  fnodeip = document.getElementById("fnodeip").value;
  fnodeport = document.getElementById("fnodeport").value;

  let file = {
    filename: fname,
    filesize: fsize,
    nodeIP: fnodeip,
    nodePort: fnodeport,
  };
  console.log(file);
  const post = fetch(url + "/file/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(file),
  })
    .then((response) => response.text())
    .then((data) => {
      console.log("Success:", data);
      alert("Archivo cargado correctamente");
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error al cargar el archivo");
    });
};

//CUANDO PRESIONE EL BOTON LISTAR, VA A LLAMARSE ESTE METODO
const listaFile = () => {
  console.log("listaFile");
  const get = fetch(url + "/file", {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      //data es un array de objetos para poder listarlos
      console.log("Success:", data);
      //if (data != null && data.length > 0) {
      let arrayListar = data;

      generateHTML_LIST(arrayListar);
      //}
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

const generateHTML_LIST = (arrayListar) => {
  for (let i = 0; i < arrayListar.length; i++) {
    let file = arrayListar[i];
    console.log(file);

    document.getElementById("lista_descargas").innerHTML += `
    <form method="get" onsubmit="descargaArchivo(${i})";return false>
    <div>
    <ul id="horizontal-list" class="columns" data-columns="2" style="list-style-type:none;">
      <div>
      <li><label id="label${i}" class="nombre_archivo_lista">${file.filename}</label></li>
      <li><label id="label${i}" class="size_archivo_lista">Size: ${file.filesize} bytes</label></li><br>
      </div>
      <li><input type="submit" value="Descargar" id="button${i}" class="boton_descarga"></li>
    </ul>
    </div>
    </form>`;
    document.getElementById("lista_descargas").innerHTML += "<br>";

    //console.log(file.size);
    files.push(file);
  }
  document.getElementById("boton_listar").style.visibility = "hidden";
};

//Cuando presiono alg??n bot??n de descarga, va a llamar a este m??todo
const descargaArchivo = (i) => {
  hashArchivo = files[i];
  console.log(hashArchivo);

  const get = fetch(url + "/file/" + hashArchivo.id, {
    method: "GET",
    headers: {
      "Content-Disposition": "attachment",
      "Content-Type": "text/plain",
      filename: hashArchivo.filename + ".torrente",
    },
  })
    .then((response) => response.text())
    .then((data) => {
      console.log("Success:", data);
      let filename = hashArchivo.filename + ".torrente";
      download(data, filename); //metodo para descargar (data contiene la info del .torrente)
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

function download(info, name) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(info)
  );
  element.setAttribute("download", name);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}


function limpiarCampos() {
  //timeout
  setTimeout(function () {
    document.getElementById("fname").value = "";
    document.getElementById("fsize").value = "";
    document.getElementById("fnodeip").value = "";
    document.getElementById("fnodeport").value = "";
  }, 1000);
}