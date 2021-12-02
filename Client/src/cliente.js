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

  //Contenido del archivo: 
  //{
  //    hash: str,
  //    trackerIP: str,
  //    trackerPort: int
  //}


  hashArchivo = files[i];
  console.log(hashArchivo);
  const get = fetch(url + "/file/" + hashArchivo.id, {
    method: "GET",
    headers: {
      "Content-Disposition": "attachment",
      "Content-Type": "text/plain",
      "filename": hashArchivo.filename + ".torrente"
    },
    //
    body: {   //ESTO HAY QUE MODIFICAR PORQUE AHORA PIDE EL TRACKER EN VEZ DEL PAR!!!!!!!
      hash: hashArchivo.id,
      trackerIP: hashArchivo.nodeIP,
      trackerPort: hashArchivo.nodePort
    }
  })
    .then((response) => response.text())
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {     //Aviso que va a entrar siempre a este catch porque no esta bien la solicitud
      console.error("Error:", error);
    });
}