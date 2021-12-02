const url = "http://localhost:8080";

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

  let htmlContent = "";
  for (let i = 0; i < arrayListar.length; i++) {
    let file = arrayListar[i];
    console.log(file);
    htmlContent += `
    <tr>
    <td>${file.filename}</td><br>
    </tr>
    `;
  }
  document.getElementById("lista_descargas").innerHTML += htmlContent; //htmlContent;
};
