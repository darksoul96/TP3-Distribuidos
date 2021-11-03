const url = "http://localhost:8080";
const botonListar = document.getElementById("boton_listar");


botonListar.addEventListener("click", listaFile);


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
  const get = fetch("/file", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {     //data es un array de objetos para poder listarlos
      arrayListar = JSON.parse(data);
      generateHTML_LIST(arrayListar);
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};


const generateHTML_LIST = (arrayListar) => {
  let htmlContent = "";
  for (let i = 0; i < arrayListar.length; i++) {
    let file = arrayListar[i];
    htmlContent += `
    <tr>
    <td>${file.filename}</td>
    </tr>
    `;
  }
  document.getElementById("lista_descargas").innerHTML = htmlContent;
}
