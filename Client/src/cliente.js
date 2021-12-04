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
    })
    .catch((error) => {
      console.error("Error:", error);
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
    <label id="label${i}">${file.filename}</label>
    <input type="submit" value="Descargar" id="button${i}">
    </form>`;
    document.getElementById("lista_descargas").innerHTML += "<br>";

    //console.log(file.size);
    files.push(file);
  }
  document.getElementById("boton_listar").style.visibility = "hidden";
};

//Cuando presiono algún botón de descarga, va a llamar a este método
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
      download(data, filename);
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
