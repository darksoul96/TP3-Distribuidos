const url = "http://localhost:8080";

const cargaFile = () => {
  console.log("hola");
  fid = document.getElementById("fid").value;
  fname = document.getElementById("fname").value;
  fsize = document.getElementById("fsize").value;
  fnodeip = document.getElementById("fnodeip").value;
  fnodeport = document.getElementById("fnodeport").value;

  let file = {
    id: fid,
    filename: fname,
    filesize: fsize,
    nodeIP: fnodeip,
    nodePort: fnodeport,
  };
  console.log(file);
  const post = fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(file),
    //body: JSON.stringify("holaaaa"),
  })
    .then((response) => response.text())
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};